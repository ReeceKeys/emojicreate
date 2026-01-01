import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, Modal, Pressable, FlatList, TextInput, Alert, Animated } from 'react-native';
import ImageManipulator from './components/imagemanipulator';
import { DiamondPlus, SmilePlus, Image, Trash, Info, UsersRound, ArrowUp, ArrowUpToLine, ArrowDown, ArrowDownToLine } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import TutorialModal from './components/tutorial';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [images, setImages] = useState([]);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [communityVisible, setCommunityVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [emojis, setEmojis] = useState([]);
  const [search, setSearch] = useState('');

  const imagePickerOpacity = useRef(new Animated.Value(0)).current;
  const emojiOpacity = useRef(new Animated.Value(0)).current;

  // Animate Image Picker
  useEffect(() => {
    Animated.timing(imagePickerOpacity, {
      toValue: imagePickerVisible ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [imagePickerVisible]);

  // Animate Emoji Modal
  useEffect(() => {
    Animated.timing(emojiOpacity, {
      toValue: emojiVisible ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [emojiVisible]);

  const decodeHtml = (str) => {
    return str.replace(/&#(\d+);/g, (match, dec) => String.fromCodePoint(parseInt(dec, 10)));
  };

  // Load emojis from API or cache
  useEffect(() => {
    const loadEmojis = async () => {
      try {
        const cached = await AsyncStorage.getItem('EMOJI_CACHE');
        if (cached) {
          setEmojis(JSON.parse(cached));
          return;
        }
        const res = await fetch('https://emojihub.yurace.pro/api/all');
        const data = await res.json();
        setEmojis(data);
        await AsyncStorage.setItem('EMOJI_CACHE', JSON.stringify(data));
      } catch (err) {
        console.error('Emoji load error:', err);
      }
    };
    loadEmojis();
  }, []);

  const filteredEmojis = useMemo(() => {
    return (emojis ?? []).filter(e => e?.name?.toLowerCase().includes(search.toLowerCase()));
  }, [emojis, search]);

  const renderItem = useCallback(({ item }) => {
    const emojiChar = typeof item.htmlCode[0] === 'string' && item.htmlCode[0].includes('&#')
      ? decodeHtml(item.htmlCode[0])
      : item.htmlCode[0];

    const handleAddEmoji = () => {
      setImages(prev => [...prev, { id: Date.now().toString(), type: 'emoji', content: emojiChar }]);
      setEmojiVisible(false);
    };

    return (
      <Pressable onPress={handleAddEmoji} style={{ width: '50%', alignItems: 'center', padding: 50 }}>
        <Text style={{ fontSize: 60 }}>{emojiChar}</Text>
      </Pressable>
    );
  }, []);

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

  const deleteImage = (id) => setImages(prev => prev.filter(img => img.id !== id));
  const deleteAllImages = () => Alert.alert(
    'Clear the canvas?',
    'This will remove all images from the canvas.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', style: 'destructive', onPress: () => { setImages([]); setSelectedId(null); } }
    ]
  );

  const moveToFront = () => {
    if (!selectedId) {
      Alert.alert("No photo selected", "Please select a photo to manipulate.");
      return;
    }
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

  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headContainer}>
        <View style={{ ...styles.btnManip, backgroundColor: '#834040ff', paddingVertical: 20, width: '100%', paddingTop: 100, borderRadius: 0 }}>
          <Pressable onPress={moveToFront} style={styles.actionBtn}><ArrowUpToLine size={36} style={styles.actionBtnText} /></Pressable>
          <Pressable onPress={moveToBack} style={styles.actionBtn}><ArrowDownToLine size={36} style={styles.actionBtnText} /></Pressable>
          <Pressable onPress={moveUp} style={styles.actionBtn}><ArrowUp size={36} style={styles.actionBtnText} /></Pressable>
          <Pressable onPress={moveDown} style={styles.actionBtn}><ArrowDown size={36} style={styles.actionBtnText} /></Pressable>
          <Pressable onPress={resetRotation} style={styles.actionBtn}><ArrowDown size={36} style={styles.actionBtnText} /></Pressable>
        </View>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        <View style={styles.canvas} contentContainerStyle={{ flexGrow: 1, width: '100%' }}>
          {images.map(img => (
            <ImageManipulator
              key={img.id}
              id={img.id}
              type={img.type}
              content={img.content}
              selected={selectedId === img.id}
              onSelect={(id) => setSelectedId(prev => prev === id ? null : id)}
              onDelete={deleteImage}
            />
          ))}
        </View>
      </View>

      {/* Image Picker Modal */}
      <Modal visible={imagePickerVisible} transparent={false} animationType="fade" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Animated.View style={{ opacity: imagePickerOpacity,  height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.modal}>
            <View style={styles.modalBtnContainer}>
              <Pressable style={{borderRadius: '10%', backgroundColor: '#252525ff', padding: 60}} onPress={addImage}> 
                <Image size={36} style={{...styles.modalBtn, color: '#74f774ff'}}></Image>
              </Pressable>
              <Pressable style={{borderRadius: '10%', backgroundColor: '#252525ff', padding: 60}} onPress={() => { setImagePickerVisible(false); setTimeout(() => setEmojiVisible(true), 0); }}>
                <SmilePlus size={36} style={{...styles.modalBtn, color: '#f5ff86ff'}}/>
              </Pressable>
              <Pressable style={{borderRadius: '10%', backgroundColor: '#252525ff', padding: 60}} onPress={() => setImagePickerVisible(false)}>
                <Text style={styles.modalBtn}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Modal>

      {/* Emoji Modal */}
      <Modal visible={emojiVisible} transparent={false} animationType="fade">
        <Animated.View style={{ opacity: emojiOpacity, flex: 1 }}>
          <View style={styles.emojiModal}>
            <View style={{ marginTop: 100, borderBottomColor: 'black', borderBottomWidth: 1, width: '100%' }}>
              <View style={styles.searchContainer}>
                <TextInput
                  placeholder="Search emojis…"
                  value={search}
                  onChangeText={setSearch}
                  style={styles.searchInput}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <FlatList
              data={filteredEmojis}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              renderItem={renderItem}
              style={{ flex: 1 }}
              keyboardShouldPersistTaps="handled"
              columnWrapperStyle={{ justifyContent: 'center' }}
              showsVerticalScrollIndicator={false}
            />
            <View style={{ marginBottom: 25, borderTopColor: 'black', borderTopWidth: 1, width: '100%', alignItems: 'center' }}>
              <Pressable onPress={() => setEmojiVisible(false)} style={{ marginTop: 10 }}>
                <Text style={{ ...styles.modalBtn, padding: 10, minWidth: '50%', marginTop: 25 }}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Modal>

      <TutorialModal 
        visible={helpVisible} 
        onClose={() => setHelpVisible(false)} 
      />

      {/* Footer */}
      <View style={styles.footContainer}>
        <View style={{ ...styles.btnManip, backgroundColor: '#252525ff', padding: 10, borderRadius: 5 }}>
          <Pressable onPress={() => setCommunityVisible(true)} style={styles.addBtn}><UsersRound style={styles.actionBtnText} size={36} /></Pressable>
          <Pressable onPress={() => deleteAllImages()} style={styles.addBtn}><Trash style={{...styles.addBtnText, color: '#ffb3b3ff'}} size={36} /></Pressable>
          <Pressable onPress={() => setImagePickerVisible(true)} style={styles.addBtn}><DiamondPlus style={styles.addBtnText} size={36} /></Pressable>
          <Pressable onPress={() => setHelpVisible(true)} style={styles.addBtn}><Info style={styles.actionBtnText} size={36} /></Pressable>
        </View>
      </View>
    </View>
  );
}

// ==== Styles unchanged ====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  canvasContainer: { flex: 1, margin: 20 },
  canvas: { flex: 1, borderBlockColor: 'black', borderColor: 'black', borderWidth: 2, backgroundColor: '#ffffffff', zIndex: 10, overflow: 'hidden' },
  headContainer: { textAlign: 'center', alignItems: 'center', backgroundColor: 'white', paddingBottom: 25, flexDirection: 'column', justifyContent: 'center' },
  footContainer: { textAlign: 'center', alignItems: 'center', backgroundColor: 'white', paddingTop: 25, width: '100%', paddingBottom: 50, flexDirection: 'column', justifyContent: 'center' },
  searchContainer: { padding: 10, paddingBottom: 40, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  searchInput: { backgroundColor: '#f2f2f2', padding: 10, marginHorizontal: 40, borderRadius: 8, fontSize: 16 },
  addBtnText: { color: '#74f774ff', textAlign: 'center', fontSize: 50 },
  btnManip: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  actionBtn: { marginHorizontal: 20, padding: 8, borderRadius: 6 },
  addBtn: { marginHorizontal: 20, padding: 8, outlineColor: 'white' },
  actionBtnText: { color: '#ffffffff', fontWeight: 'bold' },
  modalBtn: { backgroundColor: 'white', textAlign: 'center', fontSize: 16, borderRadius: '10%', backgroundColor: '#252525ff', color: 'white' },
  modal: { flex: 1, width: '100%', height: '100%', flexDirection: 'column', backgroundColor: '#ffffffcc', justifyContent: 'center', alignItems: 'center', gap: 20 },
  emojiModal: { flex: 1, backgroundColor: '#ffffffcc', justifyContent: 'center' },
  modalBtnContainer: { textAlign: 'center', justifyContent: 'center', maxWidth: 300, gap: 50, height: '100%'}
});
