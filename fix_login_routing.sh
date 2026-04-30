#!/bin/bash

echo "[🔧] Engineering correction: Re-wiring Login to the Backend Engine..."

cat << 'CODE' > src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; // <-- The critical fix: Using our configured API pipeline
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('admin@novoriq.local');
    const [password, setPassword] = useState('admin123!');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');

        try {
            // This securely routes to http://localhost:3000/api/auth/login
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('novoriq_token', res.data.token);
            router.push('/dashboard');
        } catch (err: any) {
            if (err.message === 'Network Error') {
                setError("Backend Offline: Ensure your Node.js server is running on port 3000.");
            } else {
                setError(err.response?.data?.error || "Failed to authenticate.");
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-500/10 p-3 rounded-full mb-4">
                        <ShieldAlert className="w-10 h-10 text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Novoriq OS</h1>
                    <p className="text-slate-400 text-sm mt-1">Sign in to your recovery engine</p>
                </div>
                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">{error}</div>}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authenticate"}
                    </button>
                </form>
            </div>
        </div>
    );
}
CODE

echo "[✅] Login re-wired. Next.js will automatically hot-reload."
