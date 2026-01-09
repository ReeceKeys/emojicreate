import React, { useRef, useEffect, useState, useContext } from 'react';
import { Platform, Modal, View, Text, Pressable, Animated, StyleSheet, Dimensions, ScrollView, Image } from 'react-native';
import { ThemeContext } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function CommunityModal({ visible, onClose }) {
  const steps = [
    { text: "Welcome!", image: require('../assets/step1.png')},
    { text: "Tap the + button to\nadd images or icons.", image: require('../assets/step2.png') },
    { text: "Select an image to move, reorder, and resize. Hold an image to delete it.", image: require('../assets/step3.png') },
    { text: "Once your done designing, save\nthe canvas to your camera roll.", image: require('../assets/step4.png') },
    { text: "In your camera roll, hold your\nicon and select add sticker.", image: require('../assets/step5.png') },
    { text: "Your new icon will be available\nto use in your messages!", image: require('../assets/step6.png') }
  ];
  const { colors, mode, setMode } = useContext(ThemeContext);
  const [currentStep, setCurrentStep] = useState(0);
  const animValues = useRef(steps.map(() => new Animated.Value(0))).current;
  const closeAnim = useRef(new Animated.Value(0)).current; // single value, not array
  const [animatedSteps, setAnimatedSteps] = useState(() => steps.map(() => false));
  const scrollRef = useRef();

  useEffect(() => {
    if (visible) animateStep(currentStep);
    else {
      animValues.forEach(av => av.setValue(0));
      setCurrentStep(0); // reset slide when modal closes
    }
  }, [visible, currentStep]);

  const animateStep = (index) => {
    if (!animatedSteps[index]) {
      animValues[index].setValue(0);
      Animated.timing(animValues[index], {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }).start();
      setAnimatedSteps(prev => {
        const copy = [...prev];
        copy[index] = true;
        return copy;
      });
    }
  };

  const onScroll = (e) => {
    const stepIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (stepIndex !== currentStep) setCurrentStep(stepIndex);
  };

  useEffect(() => {
    if (currentStep === steps.length - 1) {
      Animated.timing(closeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      closeAnim.setValue(0);
    }
  }, [currentStep]);

  const handleClose = () => {
    setCurrentStep(0);
    setAnimatedSteps(steps.map(() => false));
    closeAnim.setValue(0);
    onClose();
  };

  return (
     <Modal visible={visible} transparent={false} animationType="fade">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Community page coming soon!</Text>

        <Pressable onPress={handleClose} style={[styles.closeBtn, { backgroundColor: colors.primary }]}>
          <Text style={[styles.closeText, { color: colors.background }]}>Close</Text>
        </Pressable>
      </View>
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
