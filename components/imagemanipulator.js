import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Image, StyleSheet, Animated, PanResponder, Alert, Text } from 'react-native';

const ImageManipulator = forwardRef(({ id, content, type, selected, onSelect, onDelete, rotationSensitivity = 0.1 }, ref) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current; // radians
  const initialDistance = useRef(0);
  const initialAngle = useRef(0);
  const lastRotation = useRef(0);
  const longPressTimeout = useRef(null);
  const touchStartTime = useRef(0); 
  const moved = useRef(false);

  // Expose resetRotation to parent
  useImperativeHandle(ref, () => ({
    resetRotation: () => {
      rotate.setValue(0);
      lastRotation.current = 0;
    }
  }));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        touchStartTime.current = Date.now();
        moved.current = false;
        longPressTimeout.current = setTimeout(() => {
          Alert.alert(
            "Delete Image",
            "Are you sure?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => onDelete(id) }
            ]
          );
        }, 600);
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (e, gesture) => {
        moved.current = moved.current || Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5;
        const touches = e.nativeEvent.touches;

        if (longPressTimeout.current && (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5)) {
          clearTimeout(longPressTimeout.current);
          longPressTimeout.current = null;
        }

        if (touches.length === 1) {
          Animated.event([{ x: pan.x, y: pan.y }], { useNativeDriver: false })({ x: gesture.dx, y: gesture.dy });
        }

        if (touches.length === 2) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);          
          const angle = Math.atan2(dy, dx);
          if (!initialDistance.current) {
            initialDistance.current = distance;
            initialAngle.current = angle;
            return;
          }
          const scaleFactor = distance / initialDistance.current;
          scale.setValue(scaleFactor);
          const rotationDelta = angle - initialAngle.current;
          rotate.setValue(lastRotation.current + rotationDelta * rotationSensitivity);
        }
      },
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();
        initialDistance.current = 0;
        initialAngle.current = 0;
        lastRotation.current = rotate._value;
        
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
          longPressTimeout.current = null;
        }

        const duration = Date.now() - touchStartTime.current;

        if (!moved.current && duration < 200) {
          // Tap detected
          if (selected) {
            // Already selected → tap again on itself keeps it selected
            onSelect(id);
          } else {
            // Not selected → select it
            onSelect(id);
          }
        } else if (!moved.current && duration < 200 && !selected) {
          // Tap outside image → deselect
          onDeselect?.();
        }
      },

      onPanResponderTerminationRequest: () => true,
    })
  ).current;

  const isImage = type === 'image';

  return (
    <Animated.View
      {...panResponder.panHandlers}
      pointerEvents="box-none"
      style={[
        styles.imageWrapper,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scale },
            { rotate: rotate.interpolate({ inputRange: [-Math.PI, Math.PI], outputRange: ['-180rad', '180rad'] }) }
          ],
          borderWidth: selected ? 2 : 0,
          borderColor: selected ? 'yellow' : 'transparent',
        },
      ]}
    >
      <View style={{ width: 150, height: 150, justifyContent: 'center', alignItems: 'center' }}>
        {isImage ? (
          <Image source={{ uri: content }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        ) : (
          <Text style={{ fontSize: 120 }}>{content}</Text>
        )}
      </View>
    </Animated.View>
  );
});

export default ImageManipulator;

const styles = StyleSheet.create({
  imageWrapper: { position: 'absolute' },
});
