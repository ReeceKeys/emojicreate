import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, Modal, Pressable, FlatList, TextInput, Alert, Animated, Keyboard, TouchableWithoutFeedback } from 'react-native';
import ImageManipulator from './components/imagemanipulator';
import { Download, DiamondPlus, History, SmilePlus, Image, Trash, Info, UsersRound, ArrowUp, ArrowUpToLine, ArrowDown, ArrowDownToLine } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import TutorialModal from './components/tutorial';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library'; 
import ViewShot from 'react-native-view-shot';

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null)
  const [images, setImages] = useState([]);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [communityVisible, setCommunityVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // 🔹 NEW: emoji input (keeps same output format)
  const [emojiInput, setEmojiInput] = useState('');

  const imageRefs = useRef({});
  const imagePickerOpacity = useRef(new Animated.Value(0)).current;
  const emojiOpacity = useRef(new Animated.Value(0)).current;
  const viewRef = useRef();

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem('hasLaunched');
        if (value === null) {
          setIsFirstLaunch(true);
          await AsyncStorage.setItem('hasLaunched', 'true');
        } else {
          setIsFirstLaunch(false);
        }
      } catch(e) {
        console.log('Error reading first launch flag', e)
      }
    }
    checkFirstLaunch();
  }, []); 

  useEffect(() => {
    if (isFirstLaunch === true) {
      setHelpVisible(true);
    }
  }, [isFirstLaunch]);

  useEffect(() => {
    Animated.timing(imagePickerOpacity, {
      toValue: imagePickerVisible ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [imagePickerVisible]);

  useEffect(() => {
    Animated.timing(emojiOpacity, {
      toValue: emojiVisible ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [emojiVisible]);

  // 🔹 Emoji validation (Unicode, system-rendered)
  const isEmoji = (text) => /\p{Extended_Pictographic}/u.test(text);

  const addEmojiFromInput = () => {
    const emojiChar = emojiInput.trim();

    if (!emojiChar || !isEmoji(emojiChar)) {
      Alert.alert("Invalid emoji", "Please enter a valid emoji.");
      return;
    }

    setImages(prev => [
      ...prev,
      { id: Date.now().toString(), type: 'emoji', content: emojiChar }
    ]);

    setEmojiInput('');
    setEmojiVisible(false);
  };

  const saveImage = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access camera roll is required.');
      return;
    }

    const finishSave = async () => {
      try {
        const uri = await viewRef.current.capture();
        await MediaLibrary.createAssetAsync(uri);
        alert('Saved to Camera Roll!');
      } catch (error) {
        console.log('Save failed', error);
        alert('Failed to save image.');
      }
    };

    Alert.alert(
      'Save this image?',
      'This will save the entire canvas to your camera roll.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', style: 'destructive', onPress: finishSave },
      ]
    );
  };

  const addImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access photos is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: false,
    });
    if (!result.canceled) {
      setImages(prev => [...prev, { id: Date.now().toString(), type: 'image', content: result.assets[0].uri }]);
      setImagePickerVisible(false);
    }
  };

  const deleteImage = (id) => setImages(prev => prev.filter(img => img.id !== id), setSelectedId(null));
  const deleteAllImages = () => Alert.alert(
    'Clear the canvas?',
    'This will remove all images from the canvas.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', style: 'destructive', onPress: () => { setImages([]); setSelectedId(null); } }
    ]
  );

  const moveToFront = () => {
    if (!selectedId) return;
    setImages(prev => {
      const sel = prev.find(i => i.id === selectedId);
      return [...prev.filter(i => i.id !== selectedId), sel];
    });
  };

  const moveToBack = () => {
    if (!selectedId) return;
    setImages(prev => {
      const sel = prev.find(i => i.id === selectedId);
      return [sel, ...prev.filter(i => i.id !== selectedId)];
    });
  };

  const moveUp = () => {
    if (!selectedId) return;
    setImages(prev => {
      const i = prev.findIndex(x => x.id === selectedId);
      if (i === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      return arr;
    });
  };

  const moveDown = () => {
    if (!selectedId) return;
    setImages(prev => {
      const i = prev.findIndex(x => x.id === selectedId);
      if (i === 0) return prev;
      const arr = [...prev];
      [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
      return arr;
    });
  };

  const resetRotation = () => {
    if (!selectedId) return;
    imageRefs.current[selectedId]?.resetRotation();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headContainer}>
        <View style={{ ...styles.btnManip, backgroundColor: '#252525ff', paddingVertical: 20, width: '100%', paddingTop: 100 }}>
          {[
            { onPress: moveToFront, icon: <ArrowUpToLine size={36} /> },
            { onPress: moveToBack, icon: <ArrowDownToLine size={36} /> },
            { onPress: resetRotation, icon: <History size={36} color="#f5ff86ff" /> },
            { onPress: moveUp, icon: <ArrowUp size={36} /> },
            { onPress: moveDown, icon: <ArrowDown size={36} /> },
          ].map((btn, i) => (
            <Pressable key={i} onPress={selectedId ? btn.onPress : undefined} disabled={!selectedId} style={[styles.actionBtn,{ opacity: selectedId ? 1 : 0 }]}>
              {React.cloneElement(btn.icon, { style: styles.actionBtnText })}
            </Pressable>
          ))}
        </View>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        <ViewShot style={styles.canvas} ref={viewRef} options={{ format: 'png', quality: 1 }}>
          <View>
            {images.map(img => (
              <ImageManipulator
                key={img.id}
                ref={el => (imageRefs.current[img.id] = el)}
                id={img.id}
                type={img.type}
                content={img.content}
                selected={selectedId === img.id}
                onSelect={(id) => setSelectedId(prev => prev === id ? null : id)}
                onDelete={deleteImage}
                onDeselect={() => setSelectedId(null)}
              />
            ))}
          </View>
        </ViewShot>
      </View>
      {/* Image Picker Modal */}
<Modal
  visible={imagePickerVisible}
  transparent={false}
  animationType="fade"
  style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' }}
>
  <Animated.View
    style={{
      opacity: imagePickerOpacity,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View style={styles.modal}>
      <View style={styles.modalBtnContainer}>
        <Pressable
          style={{ borderRadius: '10%', backgroundColor: '#252525ff', padding: 60 }}
          onPress={addImage}
        >
          <Image size={36} style={{ ...styles.modalBtn, color: '#74f774ff' }} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          style={{ borderRadius: '10%', backgroundColor: '#252525ff', padding: 60 }}
          onPress={() => {
            setImagePickerVisible(false);
            setTimeout(() => setEmojiVisible(true), 0);
          }}
        >
          <SmilePlus size={36} style={{ ...styles.modalBtn, color: '#f5ff86ff' }} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          style={{ borderRadius: '10%', backgroundColor: '#252525ff', padding: 60 }}
          onPress={() => setImagePickerVisible(false)}
        >
          <Text style={styles.modalBtn}>Close</Text>
        </Pressable>
      </View>
    </View>
  </Animated.View>
</Modal>

      {/* Emoji Modal */}
      <Modal visible={emojiVisible} transparent={false} animationType="fade">
        <Animated.View style={{ opacity: emojiOpacity, flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.emojiModal}>
              <View style={{ marginTop: 60, paddingHorizontal: 30 }}>
                
                <TextInput
                  value={emojiInput}
                  onChangeText={setEmojiInput}
                  placeholder="Type an emoji 😀"
                  autoFocus
                  style={{
                    backgroundColor: '#f2f2f2',
                    fontSize: 40,
                    padding: 20,
                    borderRadius: 12,
                    marginBottom: 24,
                    textAlign: 'center',
                  }}
                />
                <Text style={{fontSize: 12, textAlign: 'center', marginBottom: 48,}}>We recommend adding <Text style={{color: 'red'}}>1</Text> emoji at a time.</Text>
                <View style={{alignItems: 'center', width: '100%'}}>
                  <Pressable onPress={addEmojiFromInput} style={{ justifyContent: 'center', marginTop: 50, width: '50%' }}>
                    <Text style={{ ...styles.modalBtn, borderRadius: '10%',  padding: 10 }}>Add Emoji</Text>
                  </Pressable>

                  <Pressable onPress={() => setEmojiVisible(false)} style={{ marginTop: 20 }}>
                    <Text style={{ textAlign: 'center' }}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
            </TouchableWithoutFeedback>
        </Animated.View>
      </Modal>

      <TutorialModal visible={helpVisible} onClose={() => setHelpVisible(false)} />

      {/* Footer */}
      <View style={styles.footContainer}>
        <View style={{ ...styles.btnManip, backgroundColor: '#252525ff', padding: 10 }}>
          <Pressable onPress={() => setCommunityVisible(true)} style={styles.addBtn}><UsersRound size={36} style={styles.addBtnText} /></Pressable>
          <Pressable onPress={deleteAllImages} style={styles.addBtn}><Trash size={36} style={{...styles.addBtnText, color: '#fa9c9cff'}}/></Pressable>
          <Pressable onPress={() => setImagePickerVisible(true)} style={styles.addBtn}><DiamondPlus size={36} style={{...styles.addBtnText, color: '#f1f38bff'}} /></Pressable>
          <Pressable onPress={saveImage} style={styles.addBtn}><Download size={36} style={{...styles.addBtnText, color: '#a0f59dff'}} /></Pressable>
          <Pressable onPress={() => setHelpVisible(true)} style={styles.addBtn}><Info size={36} style={styles.addBtnText} /></Pressable>
        </View>
      </View>
    </View>
  );
}

// styles unchanged


// ==== Styles unchanged ====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#252525ff' },
  canvasContainer: { flex: 1, margin: 20, backgroundColor: '#252525ff' },
  canvas: { flex: 1, borderBlockColor: 'black', borderColor: 'black', borderWidth: 2, backgroundColor: '#ffffffff', zIndex: 10, overflow: 'hidden' },
  divider: { backgroundColor: 'white', height: 1},
  headContainer: { textAlign: 'center', alignItems: 'center', backgroundColor: '#252525ff', paddingBottom: 25, flexDirection: 'column', justifyContent: 'center' },
  footContainer: { textAlign: 'center', alignItems: 'center', backgroundColor: '#252525ff', paddingTop: 25, width: '100%', paddingBottom: 50, flexDirection: 'column', justifyContent: 'center' },
  searchContainer: { padding: 10, paddingBottom: 40, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  searchInput: { backgroundColor: '#f2f2f2', padding: 10, marginHorizontal: 40, borderRadius: 8, fontSize: 16 },
  addBtnText: { color: '#ffffffff', textAlign: 'center', fontSize: 50 },
  btnManip: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  actionBtn: { marginHorizontal: 14, padding: 8, borderRadius: 6 },
  addBtn: { marginHorizontal: 14, padding: 8, outlineColor: 'white' },
  actionBtnText: { color: '#ffffffff', fontWeight: 'bold' },
  modalBtn: { backgroundColor: 'white', textAlign: 'center', fontSize: 16, borderRadius: '10%', backgroundColor: '#252525ff', color: 'white' },
  modal: { flex: 1, width: '100%', height: '100%', flexDirection: 'column', backgroundColor: '#252525ff', justifyContent: 'center', alignItems: 'center', gap: 20 },
  emojiModal: { flex: 1, backgroundColor: '#ffffffcc', justifyContent: 'center', alignContent: 'center' },
  modalBtnContainer: { textAlign: 'center', justifyContent: 'center', maxWidth: '100%', gap: 50, height: '100%'}
});
