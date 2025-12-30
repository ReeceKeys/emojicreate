import React, { useRef } from 'react';
import { View, Image, StyleSheet, Animated, PanResponder, Alert } from 'react-native';

export default function ImageManipulator({ id, uri, selected, onSelect, onDelete }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const initialDistance = useRef(0);
  const longPressTimeout = useRef(null);
  const touchStartTime = useRef(0); 
  const moved = useRef(false);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        touchStartTime.current = Date.now()
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
        }, 600); // 600ms long press

        // Set drag offset
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: (e, gesture) => {
        moved.current = moved.current || Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5
        const touches = e.nativeEvent.touches;

        // Cancel long press if moved significantly
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

          if (!initialDistance.current) initialDistance.current = distance;
          else scale.setValue(Math.max(0.5, Math.min(3, distance / initialDistance.current)));
        }
      },

      onPanResponderRelease: () => {
        pan.flattenOffset();
        initialDistance.current = 0;
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
          longPressTimeout.current = null;
        }

        const duration = Date.now() - touchStartTime.current;
        if (!moved.current && duration < 200) {
          onSelect(id)
        }
      },
      onPanResponderTerminationRequest: () => true,
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.imageWrapper,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scale },
          ],
          borderWidth: selected ? 2 : 0,
          borderColor: selected ? 'yellow' : 'transparent',
          padding: selected ? -1: 0,
        },
      ]}
    >
      <Image source={{ uri }} style={{ width: 150, height: 150 }} resizeMode="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    position: 'absolute',
  },
});
