'use client';

import React from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import { Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/Button';

export default function LanguageSwitcher() {
    const { lang, setLang } = useLanguage();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Globe className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLang('id')} className={lang === 'id' ? 'bg-accent font-medium' : ''}>
                    Bahasa Indonesia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang('en')} className={lang === 'en' ? 'bg-accent font-medium' : ''}>
                    English
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
