'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';

export default function DataSensorError({ message }: { message: string }) {
    const { t } = useLanguage();
    return (
        <div className="text-center bg-red-50 dark:bg-slate-800 p-8 rounded-xl border border-red-200 dark:border-red-500/20">
            <AlertCircle className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{t('sensorData.errorTitle')}</h3>
            <p className="text-red-500 dark:text-red-400">{t('sensorData.errorMessage').replace('{message}', message)}</p>
        </div>
    );
}
