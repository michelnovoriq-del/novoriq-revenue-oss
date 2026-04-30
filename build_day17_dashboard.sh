#!/bin/bash

echo "[🚀] Initiating Day 17: The Command Dashboard & JWT Interceptors..."

# 1. Ensure we are in the frontend directory
if [[ "$PWD" != *"novoriq-dashboard"* ]]; then
    echo "[❌] ERROR: Please run this script from inside the 'novoriq-dashboard' directory."
    exit 1
fi

mkdir -p src/lib
mkdir -p src/app/dashboard

# 2. Build the Axios API Interceptor
cat << 'CODE' > src/lib/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

// Intercept every outgoing request and inject the JWT
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('novoriq_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
CODE

# 3. Update the Login Page to redirect instead of alerting
cat << 'CODE' > src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
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
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, { email, password });
            localStorage.setItem('novoriq_token', res.data.token);
            router.push('/dashboard'); // Redirect to the throne
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to authenticate.");
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

# 4. Build the Main Dashboard View
cat << 'CODE' > src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Activity, ShieldCheck, Key, FileText, Download } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [metrics, setMetrics] = useState<any>(null);
    const [disputes, setDisputes] = useState<any[]>([]);
    const [stripeKey, setStripeKey] = useState('');
    const [keyStatus, setKeyStatus] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('novoriq_token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [metricsRes, disputesRes] = await Promise.all([
                api.get('/dashboard/metrics'),
                api.get('/dashboard/disputes')
            ]);
            setMetrics(metricsRes.data.metrics);
            setDisputes(disputesRes.data.disputes);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        }
    };

    const handleConnectStripe = async (e: React.FormEvent) => {
        e.preventDefault();
        setKeyStatus("Verifying...");
        try {
            const res = await api.post('/dashboard/keys', { stripeSecretKey: stripeKey });
            setKeyStatus(res.data.message);
            setStripeKey('');
        } catch (err: any) {
            setKeyStatus(err.response?.data?.error || "Failed to connect key.");
        }
    };

    const downloadPdf = async (disputeId: string) => {
        try {
            const res = await api.get(`/dashboard/disputes/${disputeId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Evidence_${disputeId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            alert("PDF is still generating or unavailable.");
        }
    };

    if (!metrics) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading Imperial Data...</div>;

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-8">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Revenue OS</h1>
                    <p className="text-slate-500 mt-1">Real-time chargeback defense overview.</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <Activity className="w-5 h-5 text-blue-500" /> Active Disputes
                    </div>
                    <div className="text-3xl font-bold">{metrics.totalDisputes}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" /> Revenue Recovered
                    </div>
                    <div className="text-3xl font-bold">{metrics.revenueRecoveredFormatted}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <FileText className="w-5 h-5 text-purple-500" /> Evidence Limit
                    </div>
                    <div className="text-3xl font-bold">{metrics.pdfsGenerated} / {metrics.pdfLimit}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm bg-blue-50">
                    <div className="flex items-center gap-3 text-blue-700 mb-2 font-medium">
                        Performance Fee (20%)
                    </div>
                    <div className="text-3xl font-bold text-blue-900">{metrics.performanceFeeOwedFormatted}</div>
                </div>
            </div>

            {/* Integration & Data Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Stripe Connection Panel */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                    <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold text-lg">
                        <Key className="w-5 h-5 text-slate-400" /> Stripe Integration
                    </div>
                    <p className="text-sm text-slate-500 mb-4">Connect your Stripe account to automatically ingest chargebacks and generate evidence.</p>
                    <form onSubmit={handleConnectStripe} className="space-y-3">
                        <input 
                            type="password" 
                            placeholder="sk_live_..." 
                            value={stripeKey}
                            onChange={(e) => setStripeKey(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                        <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800">
                            Secure Connection
                        </button>
                    </form>
                    {keyStatus && <div className="mt-4 text-sm font-medium text-blue-600">{keyStatus}</div>}
                </div>

                {/* Dispute Ledger */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="font-semibold text-lg text-slate-800">Recent Disputes</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium">ID</th>
                                    <th className="px-6 py-3 font-medium">Amount</th>
                                    <th className="px-6 py-3 font-medium">Reason</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Evidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {disputes.map((d: any) => (
                                    <tr key={d.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono text-slate-500">{d.stripeId.substring(0, 14)}...</td>
                                        <td className="px-6 py-4 font-medium">${(d.payment.amount / 100).toFixed(2)}</td>
                                        <td className="px-6 py-4 capitalize">{d.reason.replace('_', ' ')}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.status === 'won' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {d.evidencePdfUrl ? (
                                                <button onClick={() => downloadPdf(d.id)} className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-medium">
                                                    <Download className="w-4 h-4" /> PDF
                                                </button>
                                            ) : (
                                                <span className="text-slate-400 text-xs">Processing...</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {disputes.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No disputes recorded yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
CODE

echo "[✅] Dashboard logic deployed. Restarting Next.js server..."
npm run dev
