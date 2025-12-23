import React from 'react';
import { View } from 'react-native';
import ImageManipulator from './imagemanipulator';

export default function ImageList({ imageList }) {
  const result = [];
  let node = imageList.current.head;

  while (node) {
    result.push(<ImageManipulator key={node.value} uri={node.value} />);
    node = node.next;
  }

  return <View>{result}</View>;
}
