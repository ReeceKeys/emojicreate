import React, { useRef, useState } from 'react';
import { View, Image, PanResponder, StyleSheet, Button } from 'react-native';

export default function ImageManipulator({ uri }) {
  const pan = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(150);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        setPosition({
          x: pan.current.x + gesture.dx,
          y: pan.current.y + gesture.dy,
        });
      },
      onPanResponderRelease: (_, gesture) => {
        pan.current.x += gesture.dx;
        pan.current.y += gesture.dy;
      },
    })
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.imageWrapper,
        { transform: [{ translateX: position.x }, { translateY: position.y }] },
      ]}
    >
      <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="contain" />
      <View style={styles.buttons}>
        <Button title="+" onPress={() => setSize(size + 20)} />
        <Button title="-" onPress={() => setSize(size - 20)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    position: 'absolute',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
});
