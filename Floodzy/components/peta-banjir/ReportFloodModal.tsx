'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

interface ReportFloodModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (formData: {
    waterLevel: number;
    notes: string;
    image?: File;
  }) => void;
  location: { lat: number; lng: number } | null;
}

const formSchema = z.object({
  waterLevel: z.number().min(0).max(300),
  notes: z
    .string()
    .min(10, { message: 'Catatan harus memiliki setidaknya 10 karakter.' })
    .max(500, { message: 'Catatan tidak boleh lebih dari 500 karakter.' }),
  image: z.any().optional(),
});

export default function ReportFloodModal({
  isOpen,
  onOpenChange,
  onSubmit,
  location,
}: ReportFloodModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { waterLevel: 50, notes: '', image: undefined },
  });

  const [currentWaterLevel, setCurrentWaterLevel] = useState(
    form.getValues('waterLevel'),
  );

  useEffect(() => {
    if (isOpen) {
      form.reset({ waterLevel: 50, notes: '', image: undefined });
      setCurrentWaterLevel(50);
    }
  }, [isOpen, form]);

  function handleSubmit(values: z.infer<typeof formSchema>) {
    const imageFile =
      values.image && values.image.length > 0 ? values.image[0] : undefined;
    onSubmit({
      waterLevel: values.waterLevel,
      notes: values.notes,
      image: imageFile,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          sm:max-w-[360px] p-0 
          max-h-[90vh] flex flex-col 
          bg-gradient-to-br from-white/75 via-white/55 to-white/65 
          dark:from-gray-900/75 dark:via-gray-900/55 dark:to-gray-900/65
          backdrop-blur-3xl backdrop-saturate-[180%]
          rounded-[1.75rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]
          border-2 border-white/50 dark:border-white/15
          transition-all duration-500 ease-out
          [box-shadow:0_20px_60px_-15px_rgba(31,38,135,0.3),inset_0_1.5px_0_0_rgba(255,255,255,0.5)]
          dark:[box-shadow:0_20px_60px_-15px_rgba(0,0,0,0.6),inset_0_1.5px_0_0_rgba(255,255,255,0.12)]
          animate-in fade-in-0 zoom-in-95 duration-300
          overflow-hidden
        "
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent pointer-events-none rounded-[1.75rem]" />

        <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none overflow-hidden rounded-[1.75rem]">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/25 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-400/20 rounded-full blur-[80px] animate-pulse [animation-delay:2s]" />
        </div>

        <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
          <DialogHeader className="space-y-2 p-4">
            <div className="mx-auto w-24 h-24 rounded-[1.5rem] bg-gradient-to-br from-blue-500/30 to-cyan-500/30 backdrop-blur-2xl border-2 border-white/60 dark:border-white/25 flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] mb-2 transition-all duration-500 hover:scale-110 hover:rotate-3">
              <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-tr from-white/30 to-transparent" />
              <svg
                className="w-12 h-12 text-blue-600 dark:text-blue-400 drop-shadow-2xl relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <DialogTitle
              id="report-flood-dialog-title"
              className="text-[2rem] font-extrabold text-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent tracking-tight leading-tight"
            >
              Lapor Banjir
            </DialogTitle>

            <DialogDescription className="text-center text-gray-600 dark:text-gray-400 -mt-3">
              Isi detail di bawah ini untuk melaporkan kondisi banjir di lokasi
              Anda.
            </DialogDescription>

            <div className="flex justify-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-[1.25rem] bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl border-2 border-white/60 dark:border-white/25 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 backdrop-blur-xl flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-base font-bold text-gray-700 dark:text-gray-200 tracking-tight">
                  {location
                    ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              {/* =================================================
                PERBAIKAN 1: Menambah padding-bottom (pb-24)
                Ini memberi ruang di akhir scroll.
                =================================================
              */}
              <div className="space-y-3 flex-1 overflow-y-auto p-4 pb-24 min-h-0">
                {/* Water Level Card */}
                <FormField
                  control={form.control}
                  name="waterLevel"
                  render={({ field }) => (
                    <FormItem>
                      <div className="group p-6 rounded-[1.5rem] bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-800/60 backdrop-blur-2xl border-2 border-white/70 dark:border-white/25 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[0_15px_50px_-10px_rgba(0,0,0,0.2)] hover:border-white/80">
                        <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-tr from-white/30 to-transparent pointer-events-none" />
                        <FormLabel className="flex items-center justify-between mb-4 relative z-10">
                          <span className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                            Ketinggian Air
                          </span>
                          <div className="px-6 py-2.5 rounded-[1.25rem] bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 shadow-[0_8px_30px_rgba(59,130,246,0.4)] transition-all duration-300 group-hover:shadow-[0_12px_40px_rgba(59,130,246,0.5)] group-hover:scale-105">
                            <span className="text-2xl font-extrabold text-white drop-shadow-lg tracking-tight">
                              {currentWaterLevel} cm
                            </span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <div className="relative pt-4 pb-3">
                            <div
                              className="absolute left-0 h-2.5 rounded-full bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 transition-all duration-500 shadow-[0_4px_20px_rgba(59,130,246,0.6)]"
                              style={{
                                width: `${(currentWaterLevel / 300) * 100}%`,
                              }}
                            >
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-[0_4px_20px_rgba(59,130,246,0.8)] border-[3px] border-blue-500 animate-pulse transition-all duration-300" />
                            </div>
                            <Slider
                              min={0}
                              max={300}
                              step={10}
                              value={[field.value]}
                              onValueChange={(val) => {
                                field.onChange(val[0]);
                                setCurrentWaterLevel(val[0]);
                              }}
                              className="mt-4"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm mt-4 font-semibold" />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Notes Card */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <div className="group p-6 rounded-[1.5rem] bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-800/60 backdrop-blur-2xl border-2 border-white/70 dark:border-white/25 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[0_15px_50px_-10px_rgba(0,0,0,0.2)] hover:border-white/80">
                        <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-tr from-white/30 to-transparent pointer-events-none" />
                        <FormLabel className="flex items-center gap-3 mb-5 text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight relative z-10">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 backdrop-blur-xl flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-gray-700 dark:text-gray-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </div>
                          Catatan
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Deskripsikan kondisi banjir secara detail..."
                            {...field}
                            className="min-h-[150px] bg-white/80 dark:bg-gray-900/60 rounded-[1.25rem] border-2 border-white/60 dark:border-white/20 shadow-inner backdrop-blur-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 resize-none text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-5 transition-all duration-300 leading-relaxed"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm mt-4 font-semibold" />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Image Upload Card */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <div className="group p-6 rounded-[1.5rem] bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-800/60 backdrop-blur-2xl border-2 border-white/70 dark:border-white/25 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[0_15px_50px_-10px_rgba(0,0,0,0.2)] hover:border-white/80">
                        <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-tr from-white/30 to-transparent pointer-events-none" />
                        <FormLabel className="flex items-center gap-3 mb-5 text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight relative z-10">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-purple-600 dark:text-purple-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          Unggah Gambar
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            (Opsional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                              onChange(event.target.files);
                            }}
                            className="file:mr-5 file:py-3.5 file:px-7 file:rounded-[1.25rem] file:border-0 file:text-base file:font-bold file:bg-gradient-to-r file:from-purple-500 file:via-purple-600 file:to-pink-500 file:text-white file:shadow-[0_8px_30px_rgba(168,85,247,0.4)] file:cursor-pointer file:transition-all file:duration-300 hover:file:shadow-[0_12px_40px_rgba(168,85,247,0.5)] hover:file:scale-105 bg-white/80 dark:bg-gray-900/60 rounded-[1.25rem] border-2 border-white/60 dark:border-white/20 shadow-inner backdrop-blur-xl text-base text-gray-800 dark:text-gray-100 p-4 transition-all duration-300"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm mt-4 font-semibold" />
                      </div>
                    </FormItem>
                  )}
                />
              </div>{' '}
              {/* Akhir dari Area Scroll */}
              {/* =================================================
                PERBAIKAN 2: Menambah background pada Footer
                Ini membuat footer tidak transparan.
                =================================================
              */}
              <DialogFooter
                className="
                flex-col-reverse sm:flex-row gap-3 p-4 
                border-t border-white/50 dark:border-white/25
                /* --- TAMBAHAN UNTUK FIX --- */
                bg-white/75 dark:bg-gray-900/75
                backdrop-blur-xl
                /* ------------------------- */
              "
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="
                    flex-1 rounded-[1.25rem] px-8 py-6 text-base
                    bg-white/80 dark:bg-gray-800/80 
                    backdrop-blur-2xl border-2 border-white/70 dark:border-white/25 
                    hover:bg-white/95 dark:hover:bg-gray-800/95
                    shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]
                    transition-all duration-300 
                    hover:scale-105 active:scale-95
                    font-bold text-gray-700 dark:text-gray-200 tracking-tight
                  "
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="
                    flex-1 rounded-[1.25rem] px-8 py-6 text-base
                    bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 
                    text-white font-bold shadow-[0_12px_40px_rgba(59,130,246,0.4)]
                    hover:shadow-[0_16px_50px_rgba(59,130,246,0.5)] hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600
                    transition-all duration-300 
                    hover:scale-105 active:scale-95
                    border-2 border-white/30
                    relative overflow-hidden
                  "
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Kirim Laporan
                  </span>
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
