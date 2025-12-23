import React, { useState } from 'react';
import { StyleSheet, View, Button, Modal, ScrollView } from 'react-native';
import ImageManipulator from './components/imagemanipulator';

export default function App() {
  const [images, setImages] = useState([]);
  const [imagePicker, setImagePicker] = useState(false);

  const addImage = () => {
    const newImage = `https://picsum.photos/200?random=${Date.now()}`;
    setImages([...images, newImage]);
  };

  return (
    <View style={styles.container}>
      <Button title="Add Emoji" onPress={() => setImagePicker(true)} />

      <ScrollView style={styles.canvas} contentContainerStyle={{ flexGrow: 1, width: '100%' }}>
        {images.map((uri, idx) => (
          <ImageManipulator key={idx} uri={uri} />
        ))}
      </ScrollView>

      <Modal visible={imagePicker} transparent={true}>
        <View style={styles.modal}>
          <Button title="Add Random Image" onPress={addImage} />
          <Button title="Close" onPress={() => setImagePicker(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 100,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  modal: {
    flex: 1,
    backgroundColor: '#ffffffcc',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
