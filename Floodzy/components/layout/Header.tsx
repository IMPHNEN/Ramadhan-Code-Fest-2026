'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Menu,
  X,
  Search,
  Bell,
  User,
  Settings,
  Sun,
  Moon,
  Monitor,
  MapPin,
  Shield,
  Home,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { useAlertCount } from '@/components/contexts/AlertCountContext';
import { CommandMenu } from './CommandMenu';
import { SearchTrigger } from './SearchTrigger';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/src/context/LanguageContext';


interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export function Header({ onMenuToggle, isMenuOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [isCommandOpen, setCommandOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { highAlertCount, loadingAlerts } = useAlertCount();

  // Keyboard shortcut to open command menu
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
    'high-contrast': Shield,
  };

  const ThemeIcon = themeIcons[theme];

  if (isMobile && isSearchOpen) {
    return (
      <>
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div className="container mx-auto px-4 h-16 flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
              <ArrowLeft size={20} />
            </Button>
            <div className="flex-1 ml-2">
              <button
                onClick={() => {
                  setCommandOpen(true);
                  setIsSearchOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-muted-foreground bg-transparent border border-border rounded-lg"
              >
                <Search className="h-4 w-4 mr-3" />
                <span className="flex-grow text-left">{t('common.searchPlaceholder')}</span>
              </button>
            </div>
          </div>
        </motion.header>
        <CommandMenu isOpen={isCommandOpen} setIsOpen={setCommandOpen} />
      </>
    );
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="sticky top-0 z-50 w-full border-b bg-white/95 border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuToggle}
                className="md:hidden"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            )}

            <Link href="/" passHref>
              <motion.div
                className="flex items-center space-x-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative">
                  <Shield className="h-8 w-8 text-primary" />
                  <motion.div
                    className="absolute -top-1 -right-1 h-3 w-3 bg-secondary rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold gradient-text">{t('common.floodzy')}</h1>
                  <p className="text-xs text-muted-foreground">
                    {t('common.floodDetectionSystem')}
                  </p>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Navigation - Desktop */}


          {/* Search Trigger - Desktop */}
          <div className="hidden md:flex items-center flex-1 justify-center">
            <SearchTrigger onClick={() => setCommandOpen(true)} />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search - Mobile */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search size={20} />
              </Button>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const themes: Array<typeof theme> = ['light', 'dark', 'system'];
                const currentIndex = themes.indexOf(theme);
                const nextIndex = (currentIndex + 1) % themes.length;
                setTheme(themes[nextIndex]);
              }}
            >
              <ThemeIcon size={20} />
            </Button>

            <LanguageSwitcher />



            {/* Notifications */}
            <Link href="/peringatan" passHref>
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                {highAlertCount > 0 && !loadingAlerts && (
                  <Badge
                    variant="danger"
                    size="sm"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                  >
                    {highAlertCount}
                  </Badge>
                )}
                {loadingAlerts && (
                  <motion.div
                    className="absolute -top-1 -right-1 h-3 w-3 bg-secondary rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, type: 'tween' }}
                  />
                )}
              </Button>
            </Link>

            {/* Settings Link */}
            <Link href="/settings" passHref>
              <Button variant="ghost" size="icon">
                <Settings size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>
      <CommandMenu isOpen={isCommandOpen} setIsOpen={setCommandOpen} />
    </>
  );
}
