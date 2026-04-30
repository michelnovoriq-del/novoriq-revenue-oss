"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // [CODEX PATCH]
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api'; // [CODEX PATCH]

type AuthResponse = { // [CODEX PATCH]
    token: string; // [CODEX PATCH]
}; // [CODEX PATCH]

type ApiErrorResponse = { // [CODEX PATCH]
    message?: string; // [CODEX PATCH]
    response?: { // [CODEX PATCH]
        data?: { // [CODEX PATCH]
            error?: string; // [CODEX PATCH]
        }; // [CODEX PATCH]
    }; // [CODEX PATCH]
}; // [CODEX PATCH]

export default function LoginPage() {
    const router = useRouter(); // [CODEX PATCH]
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try { // [CODEX PATCH]
            const endpoint = isLogin ? '/auth/login' : '/auth/register'; // [CODEX PATCH]
            const payload = isLogin // [CODEX PATCH]
                ? { email, password } // [CODEX PATCH]
                : { email, password, organizationName: orgName, promoCode }; // [CODEX PATCH]
            const res = await api.post<AuthResponse>(endpoint, payload); // [CODEX PATCH]
            localStorage.setItem('novoriq_token', res.data.token); // [CODEX PATCH]
            router.push('/dashboard'); // [CODEX PATCH]
        } catch (err: unknown) { // [CODEX PATCH]
            const apiError = err as ApiErrorResponse; // [CODEX PATCH]
            setError(apiError.message === 'Network Error' // [CODEX PATCH]
                ? 'NEXUS_OFFLINE: Ensure the backend engine is running.' // [CODEX PATCH]
                : apiError.response?.data?.error || 'AUTH_PROTOCOL_REJECTED'); // [CODEX PATCH]
        } finally { // [CODEX PATCH]
            setLoading(false); // [CODEX PATCH]
        } // [CODEX PATCH]
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-obsidian text-slate-300 font-mono overflow-hidden">
            {/* Background Data Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#1a3a2f_1px,transparent_1px),linear-gradient(to_bottom,#1a3a2f_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-md px-6"
            >
                {/* Header Section */}
                <div className="flex flex-col items-center mb-10">
                    <motion.div 
                        animate={{ rotateY: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="border border-jade-muted p-3 mb-4"
                    >
                        <Shield className="w-8 h-8 text-jade-muted" />
                    </motion.div>
                    <h1 className="text-xl tracking-[0.3em] uppercase text-white font-bold">Jade_Dynasty_OS</h1>
                    <div className="h-[1px] w-24 bg-jade-muted mt-2 overflow-hidden">
                        <motion.div 
                            animate={{ x: [-100, 100] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-full h-full bg-white opacity-50" 
                        />
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-jade-deep/80 backdrop-blur-md border border-jade-line p-8 relative">
                    {/* Decorative Corner Accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-jade-muted" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-jade-muted" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-jade-muted" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-jade-muted" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'register'}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-4"
                            >
                                {!isLogin && (
                                    <div className="group">
                                        <label className="text-[10px] uppercase tracking-widest text-jade-muted group-focus-within:text-white transition-colors">Workspace_ID</label>
                                        <input 
                                            type="text" 
                                            placeholder="ACME_CORP"
                                            value={orgName}
                                            onChange={(e) => setOrgName(e.target.value)}
                                            className="w-full bg-transparent border-b border-jade-line py-2 text-white focus:outline-none focus:border-white transition-colors placeholder:text-jade-line/50"
                                            required={!isLogin}
                                        />
                                    </div>
                                )}

                                <div className="group">
                                    <label className="text-[10px] uppercase tracking-widest text-jade-muted group-focus-within:text-white transition-colors">Access_Email</label>
                                    <input 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent border-b border-jade-line py-2 text-white focus:outline-none focus:border-white transition-colors"
                                        required 
                                    />
                                </div>

                                <div className="group">
                                    <label className="text-[10px] uppercase tracking-widest text-jade-muted group-focus-within:text-white transition-colors">Pass_Cipher</label>
                                    <input 
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent border-b border-jade-line py-2 text-white focus:outline-none focus:border-white transition-colors"
                                        required 
                                    />
                                </div>

                                {!isLogin && (
                                    <div className="group">
                                        <label className="text-[10px] uppercase tracking-widest text-jade-muted">VIP_Protocol (OPT)</label>
                                        <input 
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            className="w-full bg-transparent border-b border-jade-line py-2 text-white focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full border border-jade-muted py-3 px-4 flex items-center justify-between group hover:bg-jade-muted hover:text-obsidian transition-all duration-300 disabled:opacity-30"
                        >
                            <span className="text-xs uppercase tracking-[0.2em] font-bold">
                                {loading ? "Decrypting..." : (isLogin ? "Authenticate" : "Deploy_Engine")}
                            </span>
                            {loading ? (
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-t-transparent border-white rounded-full"
                                />
                            ) : <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-8 flex justify-between items-center border-t border-jade-line pt-4">
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[10px] uppercase tracking-tighter text-jade-muted hover:text-white transition-colors"
                        >
                            {isLogin ? "[ Create_New_Auth ]" : "[ Return_to_Auth ]"}
                        </button>
                        <span className="text-[8px] text-jade-line uppercase tracking-widest">v1.0.4_Stable</span>
                    </div>
                </div>

                {/* Error Terminal */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 bg-red-900/10 border border-red-900/50 p-3 overflow-hidden"
                        >
                            <p className="text-[10px] text-red-500 uppercase leading-tight font-bold">
                                !! system_alert: {error}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Bottom Footer */}
            <div className="mt-12 flex gap-6 text-[10px] tracking-widest text-jade-line uppercase">
                <Link href="/terms" className="hover:text-jade-muted transition-colors">Term_Protocol</Link>
                <Link href="/privacy" className="hover:text-jade-muted transition-colors">Privacy_Cipher</Link>
            </div>
        </div>
    );
}
