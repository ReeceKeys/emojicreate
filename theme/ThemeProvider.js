import React, { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from './colors';

export default function ThemeProvider({ children }) {
  const [mode, setMode] = useState('system'); // default
  const [isLoaded, setIsLoaded] = useState(false); // to avoid flicker

  // Load saved mode from AsyncStorage
  useEffect(() => {
    const loadMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('themeMode');
        if (savedMode) setMode(savedMode);
      } catch (e) {
        console.log('Failed to load theme mode', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadMode();
  }, []);

  // Save mode whenever it changes
  const updateMode = async (newMode) => {
    try {
      setMode(newMode);
      await AsyncStorage.setItem('themeMode', newMode);
    } catch (e) {
      console.log('Failed to save theme mode', e);
    }
  };

  const getColors = () => {
    if (mode === 'system') return lightColors; // you can also use Appearance API here
    return mode === 'light' ? lightColors : darkColors;
  };

  // Don’t render children until the mode is loaded to prevent flicker
  if (!isLoaded) return null;
  const colors = getColors();
  return (
    <ThemeContext.Provider value={{ colors, mode, setMode: updateMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
