import React, { useState } from 'react';
import { StyleSheet, View, Text, Button, Modal, Pressable } from 'react-native';
import ImageManipulator from './components/imagemanipulator';
import { DiamondPlus, ArrowUp, ArrowUpToLine, ArrowDown, ArrowDownToLine } from "lucide-react-native";
export default function App() {
  const [images, setImages] = useState([]);
  const [imagePicker, setImagePicker] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const addImage = () => {
    const newImage = `https://picsum.photos/200?random=${Date.now()}`;
    setImages(prev => [
      ...prev,
      {id: Date.now().toString(), uri: newImage}
    ])
  };

  const deleteImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id))
  };

  const moveToFront = () => {
    if (!selectedId) return;
    setImages(prev => {
      const selectedImg = prev.find(img => img.id === selectedId);
      const others = prev.filter(img => img.id !== selectedId);
      return [...others, selectedImg];
    });
  };

  const moveToBack = () => {
    if (!selectedId) return;
    setImages(prev => {
      const selectedImg = prev.find(img => img.id === selectedId);
      const others = prev.filter(img => img.id !== selectedId);
      return [selectedImg, ...others];
    });
  };

  const moveUp = () => {
    if (!selectedId) return;
    setImages(prev => {
      const idx = prev.findIndex(img => img.id === selectedId);
      if (idx === prev.length - 1) return prev; // already top
      const newArr = [...prev];
      [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
      return newArr;
    });
  };

  const moveDown = () => {
    if (!selectedId) return;
    setImages(prev => {
      const idx = prev.findIndex(img => img.id === selectedId);
      if (idx === 0) return prev; // already bottom
      const newArr = [...prev];
      [newArr[idx], newArr[idx - 1]] = [newArr[idx - 1], newArr[idx]];
      return newArr;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headContainer}>

        <View style={styles.btnManip}>
          <Pressable onPress={moveToFront} style={styles.actionBtn}>
            <ArrowUpToLine size={36} style={styles.actionBtnText}/>
          </Pressable>

          <Pressable onPress={moveToBack} style={styles.actionBtn}>
            <ArrowDownToLine size={36} style={styles.actionBtnText}/>
          </Pressable>

          <Pressable onPress={moveUp} style={styles.actionBtn}>
            <ArrowUp size={36} style={styles.actionBtnText}/>
          </Pressable>

          <Pressable onPress={moveDown} style={styles.actionBtn}>
            <ArrowDown size={36} style={styles.actionBtnText}/>
          </Pressable>
        </View>
      </View>

      <View style={styles.canvasContainer}>
        <View style={styles.canvas} contentContainerStyle={{ flexGrow: 1, width: '100%' }}>
          {images.map((img) => (
            <ImageManipulator 
              key={img.id} 
              id={img.id} 
              uri={img.uri} 
              selected={selectedId === img.id}
              onSelect={(id) => setSelectedId(prev => prev === id ? null : id)}
              onDelete={deleteImage} 
            />
          ))}
        </View>
      </View>

      <Modal visible={imagePicker} transparent={true}>
        <View style={styles.modal}>
          <View style={styles.modalBtnContainer}>
            <Pressable onPress={() => addImage()}>
              <Text style={{...styles.modalBtn, color: 'green'}}>Add</Text>
            </Pressable>
            <Pressable onPress={() => setImagePicker(false)}>
              <Text style={styles.modalBtn}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View style={styles.footContainer}>
        <Pressable onPress={() => setImagePicker(true)}>
          <DiamondPlus style={styles.addBtn} size={36} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  canvasContainer: {
    flex: 1,
    margin: 30,
    zIndex: 40,
  },
  canvas: {
    flex: 1,
    borderBlockColor: 'black',
    borderColor: 'black',
    borderWidth: 2,
    backgroundColor: '#5c5c5cff',
    zIndex: 10,
    overflow: 'hidden',
  },
  headContainer: {
    textAlign: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingTop: 75,
    paddingBottom: 50,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 50,
  },
  footContainer: {
    textAlign: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingTop: 50,
    paddingBottom: 75,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 50,
  },
  addBtn : {
    color: '#74f774ff',
    textAlign: 'center',
    fontSize: 50
  },
  btnManip: {
    display: 'flex',
    flexDirection: 'row',
  },
  actionBtn: {
    marginHorizontal: 5,
    padding: 8,
    borderRadius: 6,
  },
  actionBtnText: {
    color: '#74f774ff',
    fontWeight: 'bold',
  },
  modalBtn: {
    margin: 25,
    padding: 60,
    outlineColor: 'black',
    outlineWidth: '1',
    backgroundColor: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  modal: {
    flex: 1,
    flexDirection: 'row', 
    backgroundColor: '#ffffffcc',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  modalBtnContainer: {
    flex: 1,
    textAlign: 'center',
    maxWidth: 300, 
  }
});
