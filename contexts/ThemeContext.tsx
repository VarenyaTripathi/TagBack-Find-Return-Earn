import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
}

const lightColors = {
  background: '#F7FAFC',
  surface: '#FFFFFF',
  text: '#1A202C',
  textSecondary: '#718096',
  primary: '#667eea',
  border: '#E2E8F0',
  error: '#E53E3E',
  success: '#38A169',
  warning: '#F6AD55',
};

const darkColors = {
  background: '#1A202C',
  surface: '#2D3748',
  text: '#FFFFFF',
  textSecondary: '#A0AEC0',
  primary: '#667eea',
  border: '#4A5568',
  error: '#FC8181',
  success: '#68D391',
  warning: '#F6AD55',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  const loadThemeFromStorage = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme from storage:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(newMode));
    } catch (error) {
      console.error('Error saving theme to storage:', error);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      colors,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}