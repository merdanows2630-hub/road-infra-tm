// src/context/AppContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getT } from '../i18n/translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState('tm');
  const [mapType, setMapType] = useState('standard');
  const [reports, setReports] = useState([]);

  const t = getT(language);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('language');
      const savedMapType = await AsyncStorage.getItem('mapType');
      const savedReports = await AsyncStorage.getItem('reports');
      if (savedLang) setLanguage(savedLang);
      if (savedMapType) setMapType(savedMapType);
      if (savedReports) setReports(JSON.parse(savedReports));
    } catch (e) {
      console.log('Error loading settings:', e);
    }
  };

  const changeLanguage = async (lang) => {
    setLanguage(lang);
    await AsyncStorage.setItem('language', lang);
  };

  const changeMapType = async (type) => {
    setMapType(type);
    await AsyncStorage.setItem('mapType', type);
  };

  const addReport = async (report) => {
    const newReport = {
      ...report,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      status: 'open',
    };
    const updated = [newReport, ...reports];
    setReports(updated);
    await AsyncStorage.setItem('reports', JSON.stringify(updated));
    return newReport;
  };

  const clearData = async () => {
    setReports([]);
    setLanguage('tm');
    setMapType('standard');
    await AsyncStorage.multiRemove(['language', 'mapType', 'reports']);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        changeLanguage,
        mapType,
        changeMapType,
        reports,
        addReport,
        clearData,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
