'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import id from '../i18n/id';
import en from '../i18n/en';

type Language = 'id' | 'en';
type Translations = typeof id;

interface LanguageContextProps {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Language>('id');

    const dictionaries = { id, en };

    const t = (path: string) => {
        const keys = path.split('.');
        let current: any = dictionaries[lang];

        for (const key of keys) {
            if (current[key] === undefined) {
                return path;
            }
            current = current[key];
        }

        return current;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
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
