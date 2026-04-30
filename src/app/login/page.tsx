"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api'; 

type AuthResponse = {
    token: string;
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

        } catch (err: any) {
            // [DEBUG TRACER 4] Catches any silent crashes
            console.error("[Auth Protocol] CRITICAL FAILURE:", err);
            
            const errorMessage = err.response?.data?.error 
                || err.message 
                || 'Authentication services currently unreachable.';
            
            setError(errorMessage);
        } finally {
            console.log("[Auth Protocol] Execution finished. Removing loading state.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] text-slate-900 font-sans overflow-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Premium Ambient Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="z-10 w-full max-w-md px-6"
            >
                {/* Enterprise Header Section */}
                <div className="flex flex-col items-center mb-8">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                        className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-6"
                    >
                        <ShieldCheck className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
                    </motion.div>
                    <h1 className="text-2xl tracking-tight text-slate-900 font-bold">
                        Novoriq Revenue OS
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 font-medium">
                        {isLogin ? "Sign in to your workspace" : "Initialize your automated engine"}
                    </p>
                </div>

                {/* Main Premium Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-3xl p-8 relative">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'register'}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="space-y-4"
                            >
                                {!isLogin && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Workspace Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="Acme Corp"
                                            value={orgName}
                                            onChange={(e) => setOrgName(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                            required={!isLogin}
                                        />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Work Email</label>
                                    <input 
                                        type="email"
                                        placeholder="commander@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                        required 
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
                                    <input 
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                        required 
                                    />
                                </div>

                                {!isLogin && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Invite Code <span className="text-slate-400 normal-case font-normal">(Optional)</span></label>
                                        <input 
                                            type="text"
                                            placeholder="VIP-ACCESS"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-slate-900 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:active:scale-100 shadow-lg shadow-slate-900/20 mt-6"
                        >
                            <span className="text-sm font-semibold tracking-wide">
                                {loading ? "Authenticating..." : (isLogin ? "Sign In" : "Create Workspace")}
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
                                className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-xl border border-red-100 text-center"
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
                        className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        {isLogin ? "Need a workspace? Create an account" : "Already have access? Sign in"}
                    </button>
                    
                    <div className="flex gap-6 text-xs font-medium text-slate-400">
                        <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}