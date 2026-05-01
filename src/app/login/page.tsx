"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion'; // Added Variants type
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import api from '@/lib/api'; 

type AuthResponse = {
    token: string;
};

// --- ANIMATION VARIANTS (Hardened for TypeScript) ---
const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { 
            duration: 0.6, 
            ease: [0.16, 1, 0.3, 1],
            staggerChildren: 0.1 
        } 
    }
};

const fadeVariants: Variants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
};

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // [DEBUG TRACER 1] Proves the button click actually triggered the function
        console.log("[Auth Protocol] Form submitted. Setting loading state...");
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin 
                ? { email, password } 
                : { email, password, organizationName: orgName, promoCode };

            // [DEBUG TRACER 2] Proves the payload was formatted correctly
            console.log(`[Auth Protocol] Attempting to hit ${endpoint} with:`, payload);

            // If the code freezes, it is hanging EXACTLY on this next line.
            const res = await api.post<AuthResponse>(endpoint, payload);
            
            // [DEBUG TRACER 3] Proves the server responded
            console.log("[Auth Protocol] Server Response Received:", res.data);

            if (res.data?.token) {
                localStorage.setItem('novoriq_token', res.data.token);
                console.log("[Auth Protocol] Token secured. Redirecting to Dashboard...");
                router.push('/dashboard');
            } else {
                throw new Error("Invalid response format: Missing token");
            }

        } catch (err: unknown) {
            // [DEBUG TRACER 4] Catches any silent crashes
            console.error("[Auth Protocol] CRITICAL FAILURE:", err);
            
            const apiError = isAxiosError<{ error?: string }>(err) ? err.response?.data?.error : undefined;
            const errorMessage = apiError
                || (err instanceof Error ? err.message : undefined)
                || 'Authentication services currently unreachable.';
            
            setError(errorMessage);
        } finally {
            console.log("[Auth Protocol] Execution finished. Removing loading state.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD] text-zinc-900 font-sans overflow-hidden selection:bg-zinc-200">
            {/* Premium Ambient Background (Zinc/Silver Tones) */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-zinc-100 to-transparent pointer-events-none opacity-50 blur-3xl z-0" />
            
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="z-10 w-full max-w-md px-6"
            >
                {/* Enterprise Header Section */}
                <div className="flex flex-col items-center mb-8">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                        className="bg-white p-3 rounded-2xl shadow-sm border border-zinc-100 mb-6"
                    >
                        <ShieldCheck className="w-8 h-8 text-zinc-900" strokeWidth={2.5} />
                    </motion.div>
                    <h1 className="text-2xl tracking-tight text-zinc-900 font-bold">
                        Novoriq Revenue OS
                    </h1>
                    <p className="text-sm text-zinc-500 mt-2 font-medium">
                        {isLogin ? "Sign in to your workspace" : "Initialize your automated engine"}
                    </p>
                </div>

                {/* Main Premium Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 relative">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'register'}
                                variants={fadeVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="space-y-4"
                            >
                                {!isLogin && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Workspace Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="Acme Corp"
                                            value={orgName}
                                            onChange={(e) => setOrgName(e.target.value)}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 text-sm focus:bg-white focus:border-zinc-900 transition-all outline-none"
                                            required={!isLogin}
                                        />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Work Email</label>
                                    <input 
                                        type="email"
                                        placeholder="commander@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 text-sm focus:bg-white focus:border-zinc-900 transition-all outline-none"
                                        required 
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Password</label>
                                    <input 
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 text-sm focus:bg-white focus:border-zinc-900 transition-all outline-none"
                                        required 
                                    />
                                </div>

                                {!isLogin && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Invite Code</label>
                                        <input 
                                            type="text"
                                            placeholder="VIP-ACCESS"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 text-sm focus:bg-white focus:border-zinc-900 transition-all outline-none"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-zinc-900 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:active:scale-100 shadow-lg shadow-zinc-900/10 mt-6"
                        >
                            <span className="text-sm font-bold tracking-wide">
                                {loading ? "Authenticating..." : (isLogin ? "Sign In" : "Initialize Engine")}
                            </span>
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    {/* Error Banner */}
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100 text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Toggles */}
                <div className="mt-8 flex flex-col items-center gap-4">
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest"
                    >
                        {isLogin ? "Need a workspace? Create an account" : "Already have access? Sign in"}
                    </button>
                    
                    <div className="flex gap-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <Link href="/terms" className="hover:text-zinc-600 transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-zinc-600 transition-colors">Privacy</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}