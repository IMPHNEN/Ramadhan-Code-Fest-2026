import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import Image from 'next/image';
import {
  Bot,
  Send,
  Loader2,
  X,
  Minus,
  MessageCircle,
  Zap,
  AlertTriangle,
  MapPin,
  Activity,
  TrendingUp,
  Droplets,
  Cloud,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface GeminiChatSectionProps {
  geminiQuestion: string;
  setGeminiQuestion: (value: string) => void;
  geminiResponse: string | null;
  isGeminiLoading: boolean;
  handleGeminiAnalysis: (question: string) => void;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'info' | 'warning' | 'success';
}

export default function GeminiChatSection({
  geminiQuestion,
  setGeminiQuestion,
  geminiResponse,
  isGeminiLoading,
  handleGeminiAnalysis,
}: GeminiChatSectionProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasInitializedWelcomeMessage, setHasInitializedWelcomeMessage] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pesan selamat datang dengan UI baru
  const welcomeMessage: ChatMessage = useMemo(() => ({
    id: 'welcome',
    text: t('statistika.gemini.welcome'),
    isUser: false,
    timestamp: new Date(),
    type: 'info',
  }), [t]);

  // Saran dengan struktur UI baru (array of objects)
  const suggestions = [
    { text: t('statistika.gemini.suggestions.floodStatus'), icon: <MapPin className="w-4 h-4" /> },
    { text: t('statistika.gemini.suggestions.weather'), icon: <Cloud className="w-4 h-4" /> },
    { text: t('statistika.gemini.suggestions.risk'), icon: <AlertTriangle className="w-4 h-4" /> },
    { text: t('statistika.gemini.suggestions.evacuation'), icon: <Activity className="w-4 h-4" /> },
    { text: t('statistika.gemini.suggestions.trend'), icon: <TrendingUp className="w-4 h-4" /> },
    { text: t('statistika.gemini.suggestions.pumps'), icon: <Droplets className="w-4 h-4" /> }
  ];

  // Inisialisasi dengan pesan selamat datang saat dibuka
  useEffect(() => {
    if (isOpen && !hasInitializedWelcomeMessage) {
      setMessages([welcomeMessage]);
      setHasInitializedWelcomeMessage(true);
    }
  }, [isOpen, hasInitializedWelcomeMessage, welcomeMessage]);

  // Tambahkan respons dari Gemini ke daftar pesan
  useEffect(() => {
    if (geminiResponse) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: geminiResponse,
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, [geminiResponse]);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fungsi untuk mengirim pesan dari input
  const handleSendMessage = () => {
    if (geminiQuestion.trim() && !isGeminiLoading) {
      // Tambahkan pesan pengguna ke state
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: geminiQuestion,
        isUser: true,
        timestamp: new Date(),
      }]);

      setShowSuggestions(false); // Sembunyikan saran setelah pesan pertama dikirim
      handleGeminiAnalysis(geminiQuestion); // Panggil fungsi analisis dari props
      setGeminiQuestion(''); // Kosongkan input setelah dikirim
    }
  };

  // Fungsi untuk mengirim pesan dari klik saran
  const handleSuggestionClick = (suggestionText: string) => {
    setGeminiQuestion(suggestionText); // Set input text dengan saran yang diklik
    setShowSuggestions(false);

    // Tambahkan pesan pengguna (dari saran) ke state
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: suggestionText,
      isUser: true,
      timestamp: new Date(),
    }]);

    // Langsung panggil analisis setelah mengklik saran
    handleGeminiAnalysis(suggestionText);
  };

  // Kirim pesan saat menekan tombol Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 text-white p-3 rounded-full shadow-2xl transition-all duration-300"
      >
        <Image src="/robofloodzy.png" alt="Asisten AI Floodzie" width={40} height={40} className="rounded-full" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
        >
          AI
        </motion.div>
        <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 animate-ping" />
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            {/* Chat Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 100 }}
              animate={{
                scale: isMinimized ? 0.3 : 1,
                opacity: 1,
                y: isMinimized ? 200 : 0,
                x: isMinimized ? 150 : 0
              }}
              exit={{ scale: 0.9, opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full sm:w-96 h-screen sm:h-[650px] bg-white dark:bg-slate-900 backdrop-blur-xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700/50 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-b border-slate-200 dark:border-slate-700/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                        <Zap className="w-2 h-2 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-slate-800 dark:text-white font-bold text-base">Floodzie Assistant</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-cyan-400 text-xs font-medium">Sistem Analisis Real-time</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} className="text-slate-400 hover:text-white hover:bg-slate-800/50 p-2 h-8 w-8 rounded-lg">
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-400 hover:bg-slate-800/50 p-2 h-8 w-8 rounded-lg">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.isUser
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/50'
                          }`}>
                          {!message.isUser && message.type === 'info' && (
                            <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-slate-600/30">
                              <Info className="w-4 h-4 text-cyan-400" />
                              <span className="text-cyan-400 text-xs font-semibold">SISTEM INFO</span>
                            </div>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                          <p className="text-xs text-right opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {isGeminiLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-3 max-w-[85%]">
                          <div className="flex items-center space-x-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300">{t('statistika.gemini.analyzing')}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Suggestions */}
                  {showSuggestions && messages.length <= 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-4 pb-3 bg-slate-50 dark:bg-slate-950/30"
                    >
                      <p className="text-slate-500 dark:text-slate-400 text-xs mb-3 font-semibold flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        {t('statistika.gemini.suggestions.quickAction')}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {suggestions.map((suggestion, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSuggestionClick(suggestion.text)}
                            className="bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-600/50 hover:border-cyan-500/50 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white text-xs px-3 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 group"
                          >
                            <span className="text-cyan-400 group-hover:text-cyan-300">{suggestion.icon}</span>
                            <span className="text-left leading-tight">{suggestion.text}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Input Area */}
                  <div className="border-t border-slate-200 dark:border-slate-700/50 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder={t('statistika.gemini.inputPlaceholder')}
                          className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600/50 focus:border-cyan-500/50 rounded-2xl px-4 py-3 pr-12 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                          value={geminiQuestion}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGeminiQuestion(e.target.value as string)}
                          onKeyPress={handleKeyPress}
                          disabled={isGeminiLoading}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                          <Activity className="w-4 h-4" />
                        </div>
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        disabled={isGeminiLoading || !geminiQuestion.trim()}
                        className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white p-3 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        {isGeminiLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-center space-x-2 mt-3 text-xs text-slate-500">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span>{t('statistika.gemini.systemInfo')}</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}