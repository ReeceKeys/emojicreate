import React, { useRef, useEffect, useState } from 'react';
import { Platform, Modal, View, Text, Pressable, Animated, StyleSheet, Dimensions, ScrollView, Image } from 'react-native';
import {Info} from "lucide-react-native";
import TutorialModal from './tutorial';
import { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeContext';



const { width, height } = Dimensions.get('window');

export default function SettingsModal({ visible, onClose }) {
  const { colors, mode, setMode } = useContext(ThemeContext);
  const [helpVisible, setHelpVisible] = useState(false);

  const handleClose = () => {
    onClose();
  };

  return (
  <Modal visible={visible} transparent={false} animationType="fade">
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Help Button */}
      <Pressable
        onPress={() => setHelpVisible(true)}
        style={styles.addBtn}
      >
        <Info size={36} color={colors.text} />
      </Pressable>
      <View style={{width: '80%', height: 1, borderColor: colors.primary, borderWidth: 1, marginVertical: 40}}/>
      {/* Theme Section */}
      <View style={{ width: '80%', marginBottom: 30 }}>
        <Text style={{ color: colors.text, fontSize: 18, marginBottom: 12 }}>
          Appearance
        </Text>

        {['system', 'light', 'dark'].map(option => (
          <Pressable
            key={option}
            onPress={() => setMode(option)}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 20,
              marginBottom: 10,
              borderRadius: 12,
              backgroundColor:
                mode === option ? colors.primary : 'transparent',
              borderWidth: 1,
              borderColor: colors.primary,
            }}
          >
            <Text
              style={{
                color: mode === option ? colors.background : colors.text,
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Close Button */}
      <Pressable
        onPress={handleClose}
        style={[
          styles.closeBtn,
          { backgroundColor: colors.primary }
        ]}
      >
        <Text style={[styles.closeText, { color: colors.background }]}>
          Close
        </Text>
      </Pressable>

    </View>

    <TutorialModal
      visible={helpVisible}
      onClose={() => setHelpVisible(false)}
    />
  </Modal>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    bottom: 50,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
    width: '80%',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

