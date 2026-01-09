import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Alert,
  Animated,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import ImageManipulator from './components/imagemanipulator';
import {
  Download,
  DiamondPlus,
  History,
  SmilePlus,
  Image,
  Trash,
  Info,
  UsersRound,
  ArrowUp,
  ArrowUpToLine,
  ArrowDown,
  ArrowDownToLine
} from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import TutorialModal from './components/tutorial';
import CommunityModal from './components/community';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import SettingsModal from './components/settings';
import ThemeProvider from './theme/ThemeProvider';
import { ThemeContext } from './theme/ThemeContext';

export default function App() {
  // Only wrap children in the provider, no context usage here
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

function MainApp() {
  const { colors } = useContext(ThemeContext);

  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [communityVisible, setCommunityVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [emojiInput, setEmojiInput] = useState('');

  const imageRefs = useRef({});
  const viewRef = useRef();
  const imagePickerOpacity = useRef(new Animated.Value(0)).current;
  const emojiOpacity = useRef(new Animated.Value(0)).current;

  // First launch detection
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
      } catch (e) {
        console.log('Error reading first launch flag', e);
      }
    };
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    if (isFirstLaunch) setHelpVisible(true);
  }, [isFirstLaunch]);

  // Animated modals
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

  // Emoji validation
  const isEmoji = (text) => /\p{Extended_Pictographic}/u.test(text);

  const addEmojiFromInput = () => {
    const emojiChar = emojiInput.trim();
    if (!emojiChar || !isEmoji(emojiChar)) {
      Alert.alert("Invalid emoji", "Please enter a valid emoji.");
      return;
    }
    setImages(prev => [...prev, { id: Date.now().toString(), type: 'emoji', content: emojiChar }]);
    setEmojiInput('');
    setEmojiVisible(false);
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

  // Image manipulation helpers
  const deleteImage = (id) => setImages(prev => prev.filter(img => img.id !== id), setSelectedId(null));
  const deleteAllImages = () => {
    if (images.length === 0) {
      Alert.alert('Canvas is already empty.');
      return;
    }
    Alert.alert(
      'Clear the canvas?',
      'This will remove all images from the canvas.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete All', style: 'destructive', onPress: () => { setImages([]); setSelectedId(null); } }
      ]
    );
  };
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

  const headerButtons = [
    { onPress: moveToFront, Icon: ArrowUpToLine },
    { onPress: moveToBack, Icon: ArrowDownToLine },
    { onPress: resetRotation, Icon: History },
    { onPress: moveUp, Icon: ArrowUp },
    { onPress: moveDown, Icon: ArrowDown },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, width: '100%' }}>
      {/* Header */}
      <View style={{ alignItems: 'center', paddingTop: 100, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {headerButtons.map(({ onPress, Icon }, i) => (
            <Pressable key={i} onPress={selectedId ? onPress : undefined} disabled={!selectedId} style={{ marginHorizontal: 14, padding: 8, opacity: selectedId ? 1 : 0 }}>
              <Icon size={36} color={colors.text} />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Canvas */}
      <View style={{ flex: 1, margin: 20, backgroundColor: colors.canvas }}>
        <ViewShot style={{ flex: 1, overflow: 'hidden', borderWidth: 2, borderColor: colors.text, backgroundColor: colors.canvas }} ref={viewRef} options={{ format: 'png', quality: 1 }}>
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
        </ViewShot>
      </View>

      {/* Image Picker Modal */}
<Modal visible={imagePickerVisible} transparent={false} animationType="fade">
  <Animated.View style={{ opacity: imagePickerOpacity, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
    <View style={{ width: '80%', alignItems: 'center', justifyContent: 'center', gap: 20, flex: 1 }}>
      
      {/* Add Image Button */}
      <Pressable style={{ borderRadius: 12, backgroundColor: colors.primary, padding: 40 }} onPress={addImage}>
        <Image size={36} color={colors.green2} />
      </Pressable>
      
      {/* Add Emoji Button */}
      <Pressable style={{ borderRadius: 12, backgroundColor: colors.primary, padding: 40 }} onPress={() => { setImagePickerVisible(false); setTimeout(() => setEmojiVisible(true), 0); }}>
        <SmilePlus size={36} color={colors.yellow2} />
      </Pressable> 
      
      {/* Close Button at the bottom */}
      <View style={{ alignItems: 'center', width: '100%', position: 'absolute', bottom: 50 }}>
        <Pressable style={{ borderRadius: 50, backgroundColor: colors.primary, paddingVertical: 18, paddingHorizontal: 40, width: '100%', alignItems: 'center' }} onPress={() => setImagePickerVisible(false)}>
          <Text style={{ color: colors.background, fontSize: 16, fontWeight: 'bold' }}>Close</Text>
        </Pressable>
      </View>

    </View>
  </Animated.View>
</Modal>


      {/* Emoji Modal */}
      <Modal visible={emojiVisible} transparent={false} animationType="fade">
        <Animated.View style={{ opacity: emojiOpacity, flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignContent: 'center' }}>
              <View style={{ marginTop: 60, paddingHorizontal: 30 }}>
                <TextInput
                  value={emojiInput}
                  onChangeText={setEmojiInput}
                  placeholder="Type an emoji 😀"
                  placeholderTextColor={colors.background}
                  style={{ backgroundColor: colors.primary, color: colors.background, fontSize: 40, padding: 20, borderRadius: 12, marginBottom: 24, marginHorizontal: 20, textAlign: 'center' }}
                />
                <Text style={{ fontSize: 12, textAlign: 'center', marginBottom: 24, color: colors.text }}>We recommend adding <Text style={{ color: 'red' }}>1</Text> emoji at a time.</Text>
                <View style={{ alignItems: 'center', width: '100%' }}>
                  <Pressable onPress={addEmojiFromInput} style={{ justifyContent: 'center', marginTop: 24, width: '50%' }}>
                    <Text style={{ textAlign: 'center', backgroundColor: colors.primary, color: colors.background, padding: 10, borderRadius: 10 }}>Add Emoji</Text>
                  </Pressable>
                  <Pressable onPress={() => setEmojiVisible(false)} style={{ marginTop: 20 }}>
                    <Text style={{ textAlign: 'center', color: colors.text }}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </Modal>

      {/* Other modals */}
      <CommunityModal visible={communityVisible} onClose={() => setCommunityVisible(false)} />
      <TutorialModal visible={helpVisible} onClose={() => setHelpVisible(false)} />
      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />

      {/* Footer */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 20, paddingBottom: 60, width: '100%', backgroundColor: colors.background }}>
        <Pressable onPress={() => setCommunityVisible(true)} style={{ marginHorizontal: 14, padding: 8 }}>
          <UsersRound size={36} color={colors.text} />
        </Pressable>
        <Pressable onPress={deleteAllImages} style={{ marginHorizontal: 14, padding: 8 }}>
          <Trash size={36} color={colors.red} />
        </Pressable>
        <Pressable onPress={() => setImagePickerVisible(true)} style={{ marginHorizontal: 14, padding: 8 }}>
          <DiamondPlus size={36} color={colors.yellow} />
        </Pressable>
        <Pressable onPress={saveImage} style={{ marginHorizontal: 14, padding: 8 }}>
          <Download size={36} color={colors.green} />
        </Pressable>
        <Pressable onPress={() => setSettingsVisible(true)} style={{ marginHorizontal: 14, padding: 8 }}>
          <Info size={36} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

// ==== Styles unchanged ====
const styles = StyleSheet.create({
  container: { flex: 1 },
  canvasContainer: { flex: 1, margin: 20 },
  canvas: { flex: 1, borderWidth: 2, zIndex: 10, overflow: 'hidden' },
  headContainer: { textAlign: 'center', alignItems: 'center', paddingBottom: 25, flexDirection: 'column', justifyContent: 'center' },
  footContainer: { textAlign: 'center', alignItems: 'center', paddingTop: 25, width: '100%', paddingBottom: 50, flexDirection: 'column', justifyContent: 'center' },
  addBtn: { marginHorizontal: 14, padding: 8 },
  btnManip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionBtn: { marginHorizontal: 14, padding: 8, borderRadius: 6 },
});
