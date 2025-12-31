import React, { useEffect, useState, useMemo, useCallback  } from 'react';
import { StyleSheet, View, Text, Button, Modal, Pressable, FlatList, TextInput, Alert } from 'react-native';
import ImageManipulator from './components/imagemanipulator';
import { DiamondPlus, Trash, Info, UsersRound, ArrowUp, ArrowUpToLine, ArrowDown, ArrowDownToLine } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [images, setImages] = useState([]);
  const [imagePicker, setImagePicker] = useState(false);
  const [communityVisible, setCommunityVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [emojis, setEmojis] = useState([]);
  const [search, setSearch] = useState('');


  const decodeHtml = (str) => {
    return str.replace(/&#(\d+);/g, (match, dec) => String.fromCodePoint(parseInt(dec, 10)));
  };  

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
    return (emojis ?? []).filter(e =>
      e?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [emojis, search]);



  const renderItem = useCallback(({ item }) => {
    const emojiChar = typeof item.htmlCode[0] === 'string' && item.htmlCode[0].includes('&#')
      ? decodeHtml(item.htmlCode[0])
      : item.htmlCode[0];

    const handleAddEmoji = async () => {
      try {
        setImages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'emoji',
            content: emojiChar,
          }
        ]);
        setEmojiVisible(false); 
        /*
        setTimeout(() => {
          setImagePicker(false); 
        }, 10);
        */
      } catch (err) {
        console.error('Emoji render error:', err);
      }
    };



    return (
      <Pressable
        onPress={handleAddEmoji}
        style={{ width: '50%', alignItems: 'center', padding: 50 }}
      >
        <Text style={{ fontSize: 60 }}>{emojiChar}</Text>
      </Pressable>
    );
  }, []);
  const addImage = async () => {
    // Ask permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log(status)
    if (status !== 'granted') {
      alert('Permission to access photos is required.');
      return;
    }

    // Open picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // updated
      allowsEditing: true,
      quality: 1,
      allowsEditing: false,
    });


    if (!result.canceled) {
      setImages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'image',
          content: result.assets[0].uri,
        },
      ]);

      // close menus SAFELY
      setTimeout(() => {
        setImagePicker(false);
      }, 0);
    }
  };


  const deleteImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id))
  };

  const deleteAllImages = () => {
    Alert.alert(
      'Clear the canvas?',
      'This will remove all images from the canvas.',
      [
        { text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            setImages([]);
            setSelectedId(null);
          }
        }
      ]
    )
  }

  const moveToFront = () => {
    if (!selectedId) {
      Alert.alert(
        "No photo selected", 
        "Please select a photo to manipulate.",
      );
      return;
    };
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

        <View style={{...styles.btnManip, backgroundColor: 'teal', padding: 20, paddingTop: 100, borderRadius: '5%'}}>
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
              type={img.type}
              content={img.content} 
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
              <Text style={{...styles.modalBtn, color: 'green'}}>Library</Text>
            </Pressable>
            <Pressable onPress={() => setEmojiVisible(true)}>
              <Text style={{...styles.modalBtn, color: 'green'}}>Emoji</Text>
            </Pressable>
            <Pressable onPress={() => setImagePicker(false)}>
              <Text style={styles.modalBtn}>Close</Text>
            </Pressable>
          </View>
        </View>
        <Modal visible={emojiVisible}>
          <View style={styles.emojiModal}>
            <View style={{marginTop: 100, borderBottomColor: 'black', borderBottomWidth: 1, width: '100%'}}>
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
              style={{flex: 1}}
              keyboardShouldPersistTaps="handled"
              columnWrapperStyle={{justifyContent: 'center'}}
            > 
            </FlatList>
            <View style={{marginBottom: 25, borderTopColor: 'black', borderTopWidth: 1, width: '100%', alignItems: 'center'}}>
              <Pressable onPress={() => setEmojiVisible(false)} style={{marginTop: 10}}>
                <Text style={{...styles.modalBtn, padding: 10, minWidth: '50%', marginTop: 25}}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </Modal>

      <View style={{...styles.footContainer }}>
        <View style={{...styles.btnManip, backgroundColor: '#252525ff', padding: 10, borderRadius: '5%'}}>
          <Pressable onPress={() => setCommunityVisible(true)} style={styles.addBtn}>
            <UsersRound style={styles.actionBtnText} size={36} />
          </Pressable>
          <Pressable onPress={() => deleteAllImages()} style={styles.addBtn}>
            <Trash style={styles.addBtnText} size={36} />
          </Pressable>
          <Pressable onPress={() => setImagePicker(true)} style={styles.addBtn}>
            <DiamondPlus style={styles.addBtnText} size={36} />
          </Pressable>
          <Pressable onPress={() => setHelpVisible(true)} style={styles.addBtn}>
            <Info style={styles.actionBtnText} size={36} />
          </Pressable>
        </View>
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
    margin: 20,
  },
  canvas: {
    flex: 1,
    borderBlockColor: 'black',
    borderColor: 'black',
    borderWidth: 2,
    backgroundColor: '#ffffffff',
    zIndex: 10,
    overflow: 'hidden',
  },
  headContainer: {
    textAlign: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingBottom: 25,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  footContainer: {
    textAlign: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 25,
    width: '100%',
    paddingBottom: 25,
    flexDirection: 'column',
    justifyContent: 'center',
  },

  searchContainer: {
  padding: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#ddd',
},

searchInput: {
  backgroundColor: '#f2f2f2',
  padding: 10,
  borderRadius: 8,
  fontSize: 16,
},

  addBtnText : {
    color: '#74f774ff',
    textAlign: 'center',
    fontSize: 50,
  },
  btnManip: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  actionBtn: {
    marginHorizontal: 20,
    padding: 8,
    borderRadius: 6,
  },
  addBtn: {
    marginHorizontal: 20,
    padding: 8,
    outlineColor: 'white',
  },
  actionBtnText: {
    color: '#ffffffff',
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
  emojiModal: {
    flex: 1,
    backgroundColor: '#ffffffcc',
    justifyContent: 'center',
  },
  modalBtnContainer: {
    flex: 1,
    textAlign: 'center',
    maxWidth: 300, 
  }
});
