import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'rw';

interface Translations {
  [key: string]: {
    en: string;
    rw: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { en: 'Home', rw: 'Ahabanza' },
  map: { en: 'Map', rw: 'Ikarita' },
  buses: { en: 'Buses', rw: 'Amatenge' },
  settings: { en: 'Settings', rw: 'Amagenamiterere' },
  
  // Authentication
  login: { en: 'Login', rw: 'Injira' },
  signup: { en: 'Sign Up', rw: 'Iyandikishe' },
  email: { en: 'Email', rw: 'Imeyili' },
  password: { en: 'Password', rw: 'Ijambobanga' },
  name: { en: 'Name', rw: 'Amazina' },
  phone: { en: 'Phone', rw: 'Telefone' },
  logout: { en: 'Logout', rw: 'Sohoka' },
  
  // Home
  welcome: { en: 'Welcome to UBMS', rw: 'Murakaze kuri UBMS' },
  nearbyBuses: { en: 'Nearby Buses', rw: 'Amatenge ari hafi' },
  eta: { en: 'ETA', rw: 'Igihe cyo kugera' },
  showInterest: { en: 'Show Interest', rw: 'Erekana ubushake' },
  
  // Settings
  language: { en: 'Language', rw: 'Ururimi' },
  darkMode: { en: 'Dark Mode', rw: 'Ifata ryijimye' },
  profile: { en: 'Profile', rw: 'Umwirondoro' },
  preferences: { en: 'Preferences', rw: 'Ibyifuzo' },
  support: { en: 'Support', rw: 'Gufasha' },
  about: { en: 'About', rw: 'Ibyerekeye' },
  contactSupport: { en: 'Contact Support', rw: 'Twandikire gufasha' },
  rateApp: { en: 'Rate App', rw: 'Erekana ibikoresho' },
  aboutUBMS: { en: 'About UBMS', rw: 'Ibyerekeye UBMS' },
  manageAccount: { en: 'Manage your account preferences', rw: 'Gukurikirana ibyifuzo byawe na konte' },
  darkModeEnabled: { en: 'Dark theme enabled', rw: 'Ifata ryijimye ryashyizwaho' },
  lightModeEnabled: { en: 'Light theme enabled', rw: 'Ifata ryumweru ryashyizwaho' },
  english: { en: 'English', rw: 'Icyongereza' },
  kinyarwanda: { en: 'Kinyarwanda', rw: 'Kinyarwanda' },
  getHelp: { en: 'Get in touch with our team', rw: 'Twandikire ishyirahamwe ryawe' },
  helpImprove: { en: 'Help us improve by rating', rw: 'Dufashe guhindura neza ukerekana' },
  learnMore: { en: 'Learn more about our app', rw: 'Menya byinshi kuri ibikoresho byawe' },
  selectLanguage: { en: 'Select your preferred language', rw: 'Hitamo ururimi rwawe' },
  logoutConfirm: { en: 'Are you sure you want to logout?', rw: 'Uzi neza ko ushaka gusohoka?' },
  cancel: { en: 'Cancel', rw: 'Reka' },
  confirm: { en: 'Confirm', rw: 'Emeza' },
  ok: { en: 'OK', rw: 'Sawa' },
  thankYou: { en: 'Thank you for using UBMS! Your feedback helps us improve.', rw: 'Urakoze gukoresha UBMS! Ibisubizo byawe bidufasha guhindura neza.' },
  aboutDescription: { en: 'UBMS - Your trusted ride-sharing companion in Rwanda.\n\nVersion: 1.0.0\nBuild: 2024.1\n\n© 2024 UBMS. All rights reserved.', rw: 'UBMS - Umufasha wawe wizigirwa wo gusangira urugendo muri Rwanda.\n\nVerisiyo: 1.0.0\nUbubiko: 2024.1\n\n© 2024 UBMS. Amahoro yose yarafunguwe.' },
  supportInfo: { en: 'Get in touch with our support team\n\nEmail: support@ubms.com\nPhone: +250 123 456 789', rw: 'Twandikire ishyirahamwe ryawe ryo gufasha\n\nImeri: support@ubms.com\nTelefoni: +250 123 456 789' },
  ubmsPassengerApp: { en: 'UBMS Passenger App v1.0.0', rw: 'Ibikoresho by\'Umugenzi UBMS v1.0.0' },
  allRightsReserved: { en: '© 2024 UBMS. All rights reserved.', rw: '© 2024 UBMS. Amahoro yose yarafunguwe.' },
  
  // Bus related
  busRoute: { en: 'Bus Route', rw: 'Inzira ya Busi' },
  destination: { en: 'Destination', rw: 'Icyerekezo' },
  departure: { en: 'Departure', rw: 'Kugenda' },
  arrival: { en: 'Arrival', rw: 'Kugeza' },
  
  // Common
  save: { en: 'Save', rw: 'Bika' },
  loading: { en: 'Loading...', rw: 'Biracyashyirwaho...' },
  error: { en: 'Error', rw: 'Ikosa' },
  success: { en: 'Success', rw: 'Byagenze neza' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'rw')) {
        setLanguageState(storedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('language', lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}