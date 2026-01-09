import React, { useContext, useRef, useEffect, useState } from 'react';
import { Platform, Modal, View, Text, Pressable, Animated, StyleSheet, Dimensions, ScrollView, Image } from 'react-native';
import { ThemeContext } from '../theme/ThemeContext';
const { width, height } = Dimensions.get('window');

export default function TutorialModal({ visible, onClose }) {
  const steps = [
    { text: "Welcome!", image: require('../assets/step1.png')},
    { text: "Tap the + button to\nadd images or icons.", image: require('../assets/step2.png') },
    { text: "Select an image to move, reorder, and resize. Hold an image to delete it.", image: require('../assets/step3.png') },
    { text: "Once your done designing, save\nthe canvas to your camera roll.", image: require('../assets/step4.png') },
    { text: "In your camera roll, hold your\nicon and select Add Sticker.", image: require('../assets/step5.png') },
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
      <View style={[styles.overlay, { backgroundColor: colors.background }]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          ref={scrollRef}
        >
          {steps.map((step, index) => {
            const anim = animValues[index] || new Animated.Value(1);
            return (
              <Animated.View
                key={index}
                style={{
                  ...styles.stepContainer,
                  width,
                  opacity: anim,
                  transform: [{
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }]
                }}
              >
                {step.image && (
                  <Animated.Image
                    source={step.image}
                    style={{
                      width: width * 0.6,
                      height: height * 0.3,
                      marginBottom: 20,
                      opacity: anim,
                      transform: [{
                        translateY: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0]
                        })
                      }]
                    }}
                    resizeMode="contain"
                  />
                )}
                <Text style={[styles.stepText, { color: colors.text }]}>{step.text}</Text>
              </Animated.View>
            );
          })}
        </ScrollView>

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                { ...styles.dot, backgroundColor: colors.dot },
                index === currentStep ? { backgroundColor: colors.dotactive } : null
              ]}
            />
          ))}
        </View>

        {/* Close Button */}
<Animated.View
  style={[
    styles.closeContainer,
    {
      opacity: closeAnim,
      transform: [
        {
          translateY: closeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [40, 0], // enough room to slide in
          }),
        },
      ],
    },
  ]}
>
  <Pressable
    onPress={handleClose}
    style={[styles.closeBtn, { backgroundColor: colors.primary }]}
  >
    <Text style={[styles.closeText, { color: colors.background }]}>
      Close
    </Text>
  </Pressable>
</Animated.View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' },
  stepContainer: { height, justifyContent: 'center', alignItems: 'center', padding: 30 },
  stepText: { fontSize: 22, color: '#333', textAlign: 'center' },
  dotsContainer: { bottom: 160, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 6 },
  closeContainer: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center' },
  closeBtn: { paddingVertical: 18, width: '80%', paddingHorizontal: 40, borderRadius: 50, alignItems: 'center' },
  closeText: { fontSize: 16, fontWeight: 'bold' }
});
