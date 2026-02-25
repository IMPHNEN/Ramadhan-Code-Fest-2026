'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, ShieldCheck, Terminal, MapPin, Mail, User, Building, Radio } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        org: '',
        region: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        setIsSent(true);
    };

    return (
        <div className="min-h-screen bg-[#050507] text-[#E1E3E8] font-sans selection:bg-[#3B82F6] selection:text-white overflow-x-hidden relative">

            {/* === BACKGROUND AMBIENCE === */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#3B82F6] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.1] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#0044ff] rounded-full mix-blend-screen filter blur-[180px] opacity-[0.15]"></div>
            </div>

            {/* === HEADER === */}
            <header className="fixed top-0 left-0 w-full p-6 md:px-12 z-50 flex justify-between items-center bg-gradient-to-b from-[#050507] via-[#050507cc] to-transparent backdrop-blur-[2px]">
                <Link href="/" className="group flex items-center gap-3 no-underline">
                    <div className="w-8 h-8 rounded border border-[#3B82F6] flex items-center justify-center bg-[rgba(59,130,246,0.1)] group-hover:bg-[#3B82F6] transition-all duration-300">
                        <ArrowLeft size={16} className="text-[#3B82F6] group-hover:text-white" />
                    </div>
                    <span className="font-mono text-sm text-[#9499A6] group-hover:text-[#3B82F6] transition-colors tracking-widest">
                        RETURN_BASE
                    </span>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-ping"></div>
                    <span className="text-xs font-mono text-[#3B82F6] tracking-[0.2em]">SECURE_CHANNEL_ACTIVE</span>
                </div>
            </header>

            <main className="relative z-10 container mx-auto px-6 py-24 min-h-screen flex items-center">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 w-full">

                    {/* === LEFT COLUMN: INFO & POC === */}
                    <div className={`space-y-12 transition-all duration-1000 transform ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>

                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 text-[#3B82F6] font-mono text-sm tracking-wider border border-[rgba(59,130,246,0.2)] px-3 py-1 rounded bg-[rgba(59,130,246,0.05)]">
                                <Terminal size={14} />
                                <span>{'>>'} SYSTEM_DEPLOYMENT</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9]">
                                Deploy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#0099ff] animate-gradient">Floodzy</span><br />
                                In Your Region
                            </h1>
                            <p className="text-[#9499A6] text-lg leading-relaxed max-w-lg">
                                Integrate municipal sensors, satellite feeds, and local warning infrastructure into a single predictive engine.
                            </p>
                        </div>

                        {/* POC CARD */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3B82F6] to-[#0044ff] rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-[#080a0f] border-l-4 border-[#3B82F6] p-8 rounded-r-lg shadow-2xl">
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <h3 className="text-xs font-mono text-[#3B82F6] tracking-[0.2em] mb-2 uppercase">Point_Of_Contact</h3>
                                        <div className="flex items-end gap-3">
                                            <h2 className="text-3xl font-bold text-white">Rahmat Yudi</h2>
                                            <span className="text-sm font-mono text-[#9499A6] mb-1">/ Owner & Lead Architect</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded font-mono text-sm text-[#E1E3E8] flex items-center gap-3">
                                        <Mail size={16} className="text-[#3B82F6]" />
                                        dewarahmat12334@gmail.com
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.05)]">
                                        <span className="text-[10px] font-mono text-[#555]">PGP: 0x4F92... // ENCRYPTED</span>
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* === RIGHT COLUMN: REQUEST FORM === */}
                    <div className={`relative transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(59,130,246,0.02)] to-transparent rounded-xl pointer-events-none border border-[rgba(59,130,246,0.1)]"></div>

                        <div className="relative bg-[#0B0D13] border border-[#222] p-8 md:p-10 rounded-xl shadow-2xl">
                            <h2 className="text-3xl font-bold mb-8 text-white">Request Access</h2>

                            {!isSent ? (
                                <form onSubmit={handleSubmit} className="space-y-6">

                                    {/* ID */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-[#9499A6] uppercase tracking-[0.15em] flex items-center gap-2">
                                            <Building size={12} className="text-[#3B82F6]" /> Organization_ID
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="FLOODZY DEMO REQUEST: [Org Name]"
                                            className="w-full bg-[#050507] border border-[#333] rounded p-3 font-mono text-sm text-[#3B82F6] placeholder-[#444] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-all"
                                            value={formData.org}
                                            onChange={e => setFormData({ ...formData, org: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-[#9499A6] uppercase tracking-[0.15em] flex items-center gap-2">
                                                <User size={12} className="text-[#3B82F6]" /> Officer_Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Your Name"
                                                className="w-full bg-[#050507] border border-[#333] rounded p-3 font-mono text-sm text-[#E1E3E8] placeholder-[#444] focus:border-[#3B82F6] focus:outline-none transition-all"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-[#9499A6] uppercase tracking-[0.15em] flex items-center gap-2">
                                                <Mail size={12} className="text-[#3B82F6]" /> Email_Address
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="official@agency.gov"
                                                className="w-full bg-[#050507] border border-[#333] rounded p-3 font-mono text-sm text-[#E1E3E8] placeholder-[#444] focus:border-[#3B82F6] focus:outline-none transition-all"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-[#9499A6] uppercase tracking-[0.15em] flex items-center gap-2">
                                            <MapPin size={12} className="text-[#3B82F6]" /> Region_Coordinates
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="City / Province / LatLong"
                                            className="w-full bg-[#050507] border border-[#333] rounded p-3 font-mono text-sm text-[#E1E3E8] placeholder-[#444] focus:border-[#3B82F6] focus:outline-none transition-all"
                                            value={formData.region}
                                            onChange={e => setFormData({ ...formData, region: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-[#9499A6] uppercase tracking-[0.15em] flex items-center gap-2">
                                            <Radio size={12} className="text-[#3B82F6]" /> Message_Payload
                                        </label>
                                        <textarea
                                            rows={4}
                                            required
                                            placeholder="Describe your monitoring requirements..."
                                            className="w-full bg-[#050507] border border-[#333] rounded p-3 font-mono text-sm text-[#E1E3E8] placeholder-[#444] focus:border-[#3B82F6] focus:outline-none transition-all resize-none"
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full group relative overflow-hidden bg-transparent border border-[#E1E3E8] hover:border-[#3B82F6] text-white hover:text-[#3B82F6] py-4 transition-all duration-300"
                                    >
                                        <div className={`absolute inset-0 w-full h-full bg-[#3B82F6] transform ${isSubmitting ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-[2s] ease-linear opacity-10`}></div>
                                        <span className="relative font-mono font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-3">
                                            {isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT REQUEST'}
                                            {!isSubmitting && <Send size={16} className="group-hover:translate-x-1 transition-transform" />}
                                        </span>
                                    </button>

                                </form>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-6 animate-in fade-in py-12">
                                    <div className="w-20 h-20 bg-[rgba(59,130,246,0.1)] rounded-full flex items-center justify-center border border-[#3B82F6] shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                        <ShieldCheck size={40} className="text-[#3B82F6]" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Request Transmitted</h3>
                                        <p className="text-[#9499A6] font-mono text-sm">Ticket #8829-XJ Created</p>
                                    </div>
                                    <p className="max-w-xs text-[#9499A6] text-sm">
                                        Our deployment team will analyze your coordinates and establish a secure link within 24 hours.
                                    </p>
                                    <button onClick={() => setIsSent(false)} className="text-[#3B82F6] hover:text-white underline underline-offset-4 font-mono text-xs uppercase tracking-widest mt-8">
                                        Send Another Signal
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}
