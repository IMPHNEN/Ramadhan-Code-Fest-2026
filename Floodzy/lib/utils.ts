import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  // FIX: Changed num.toString() to String(num) for safer type conversion.
  // This prevents potential errors if 'num' is ever perceived as non-numeric
  // by a strict TypeScript configuration, even with the type annotation.
  return String(num);
}

export function formatPopulation(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTimeAgo(date: string | Date, lang: string = 'id'): string {
  const now = new Date();
  const past = new Date(date);

  // Jika 'past' tidak valid atau tanggal di masa depan (bisa menyebabkan NaN)
  if (isNaN(past.getTime())) {
    return lang === 'en' ? 'Invalid date' : 'Waktu tidak valid';
  }

  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 0) {
    // Jika tanggal di masa depan
    return lang === 'en' ? 'In the future' : 'Di masa depan';
  } else if (diffInSeconds < 60) {
    return lang === 'en' ? 'Just now' : 'Baru saja';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return lang === 'en'
      ? `${minutes} minute${minutes > 1 ? 's' : ''} ago`
      : `${minutes} menit yang lalu`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return lang === 'en'
      ? `${hours} hour${hours > 1 ? 's' : ''} ago`
      : `${hours} jam yang lalu`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return lang === 'en'
      ? `${days} day${days > 1 ? 's' : ''} ago`
      : `${days} hari yang lalu`;
  }
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getRandomColor(): string {
  const colors = [
    '#06B6D4',
    '#3B82F6',
    '#8B5CF6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#EC4899',
    '#14B8A6',
    '#F97316',
    '#84CC16',
    '#6366F1',
    '#F43F5E',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return phoneRegex.test(phone);
}

export function sanitizeHtml(html: string): string {
  // This function only works in a browser environment
  if (typeof document === 'undefined') {
    return html;
  }
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

export function copyToClipboard(text: string): Promise<void> {
  // This function only works in a browser environment
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    if (typeof document === 'undefined') {
      return Promise.reject('Clipboard API not available');
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve();
    } catch (err) {
      document.body.removeChild(textArea);
      return Promise.reject(err);
    }
  }
  return navigator.clipboard.writeText(text);
}

export function downloadFile(
  data: string,
  filename: string,
  type: string = 'text/plain',
): void {
  // This function only works in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  // This function only works in a browser environment
  if (typeof window === 'undefined') {
    return 'desktop';
  }
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function isTouchDevice(): boolean {
  // This function only works in a browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function getStorageItem<T>(key: string, defaultValue: T): T {
  // This function only works in a browser environment
  if (typeof localStorage === 'undefined') {
    return defaultValue;
  }
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  // This function only works in a browser environment
  if (typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function removeStorageItem(key: string): void {
  // This function only works in a browser environment
  if (typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function parseQuery(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  Array.from(params.entries()).forEach(([key, value]) => {
    result[key] = value;
  });
  return result;
}

export function buildQuery(
  params: Record<string, string | number | boolean>,
): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  return searchParams.toString();
}

export type ChartRow = { [k: string]: any };

export function normalizeSeries<T extends ChartRow>(
  rows: T[],
  keys: string[],
): T[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => {
    const o: Record<string, any> = { ...r };
    for (const k of keys) {
      const v = Number(o[k]);
      o[k] = Number.isFinite(v) ? v : 0;
    }
    return o as T;
  });
}

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side requests can use relative paths
    return '';
  }
  // Server-side requests need the full URL
  if (process.env.VERCEL_URL) {
    return `https://floodzzy.vercel.app`;
  }
  // Default for local development SSR
  return 'http://localhost:3000';
};
