#!/bin/bash

echo "[🚀] Initiating Day 19: The Curiosity Demo Screen & Whop Routing..."

# 1. Install jwt-decode to extract IDs securely on the frontend
npm install jwt-decode

mkdir -p src/app/demo

# 2. Build the Curiosity Demo Screen
cat << 'CODE' > src/app/demo/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Lock, Zap, ShieldCheck, Activity, FileText } from 'lucide-react';

export default function DemoPage() {
    const router = useRouter();
    const [orgId, setOrgId] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('novoriq_token');
        if (!token) {
            router.push('/login');
            return;
        }
        try {
            const decoded: any = jwtDecode(token);
            setOrgId(decoded.organizationId);
        } catch (e) {
            router.push('/login');
        }
    }, []);

    // Construct the Whop Checkout URLs with the organizationId mapped to metadata
    const whopBaseParams = `?metadata[organizationId]=${orgId}`;
    const links = {
        trial: `https://whop.com/checkout/plan_g5k8i3tfPkASV${whopBaseParams}`,
        tier1: `https://whop.com/checkout/plan_pJpWvIqcYCRvV${whopBaseParams}`,
        tier2: `https://whop.com/checkout/plan_rE4Rj9g9t8RNH${whopBaseParams}`,
        tier3: `https://whop.com/checkout/plan_My5qZYNCRlcgr${whopBaseParams}`
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-20">
            {/* FOMO Header */}
            <div className="bg-blue-600 w-full p-4 text-center text-sm font-medium flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> Your Revenue OS is currently in Read-Only Demo Mode. Activate a tier to unlock your vault.
            </div>

            <div className="max-w-6xl mx-auto p-8 mt-4 relative">
                {/* Simulated Dashboard (Blurred for curiosity) */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none filter blur-sm">
                    <div className="grid grid-cols-3 gap-6 mt-20">
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-32"></div>
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-32"></div>
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-32"></div>
                    </div>
                    <div className="bg-slate-800 rounded-xl border border-slate-700 h-96 mt-8"></div>
                </div>

                <div className="relative z-10">
                    <div className="text-center mb-16 mt-8">
                        <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                            Stop Losing to Friendly Fraud.
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Automate compelling evidence, ingest Golden Trio tracking data, and mathematically recover your lost revenue.
                        </p>
                    </div>

                    {/* The $10 Micro-Commitment CTA */}
                    <div className="max-w-3xl mx-auto bg-gradient-to-r from-slate-800 to-slate-800/50 border border-blue-500/30 rounded-2xl p-8 mb-16 text-center shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)]">
                        <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2">The 48-Hour Live Fire Trial</h2>
                        <p className="text-slate-300 mb-6">Experience full Tier 3 Premium power. Generate up to 120 evidence PDFs and pay only a 3.5% fee on what we recover.</p>
                        <a href={links.trial} className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all hover:scale-105">
                            Unlock Engine for $10
                        </a>
                        <p className="text-xs text-slate-500 mt-4">Automated Whop checkout. Engine unlocks instantly upon payment.</p>
                    </div>

                    {/* Jade Dynasty Pricing Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        
                        {/* Tier 1 */}
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col">
                            <h3 className="text-2xl font-bold mb-1">Starter</h3>
                            <p className="text-slate-400 text-sm mb-6">For emerging merchants.</p>
                            <div className="text-4xl font-bold mb-6">$199<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3"><FileText className="w-5 h-5 text-blue-400"/> 50 PDF Limit</li>
                                <li className="flex items-center gap-3"><Activity className="w-5 h-5 text-blue-400"/> 10% Performance Fee</li>
                            </ul>
                            <a href={links.tier1} className="w-full block text-center bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors">
                                Select Starter
                            </a>
                        </div>

                        {/* Tier 2 */}
                        <div className="bg-slate-800 border border-blue-500 rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-xl">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Most Popular
                            </div>
                            <h3 className="text-2xl font-bold mb-1">Pro</h3>
                            <p className="text-slate-400 text-sm mb-6">For scaling operations.</p>
                            <div className="text-4xl font-bold mb-6">$399<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3"><FileText className="w-5 h-5 text-blue-400"/> 80 PDF Limit</li>
                                <li className="flex items-center gap-3"><Activity className="w-5 h-5 text-blue-400"/> 5% Performance Fee</li>
                                <li className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-blue-400"/> Golden Trio Intel</li>
                            </ul>
                            <a href={links.tier2} className="w-full block text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors">
                                Select Pro
                            </a>
                        </div>

                        {/* Tier 3 */}
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col">
                            <h3 className="text-2xl font-bold mb-1">Premium</h3>
                            <p className="text-slate-400 text-sm mb-6">For high-volume empires.</p>
                            <div className="text-4xl font-bold mb-6">$799<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3"><FileText className="w-5 h-5 text-blue-400"/> 120 PDF Limit</li>
                                <li className="flex items-center gap-3"><Activity className="w-5 h-5 text-blue-400"/> 3.5% Performance Fee</li>
                                <li className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-blue-400"/> Priority Worker Queue</li>
                            </ul>
                            <a href={links.tier3} className="w-full block text-center bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors">
                                Select Premium
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
CODE

# 3. Update the Dashboard Page to enforce the Guardrail
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
            
            // THE GUARDRAIL: If the backend says they are inactive, push them to the Curiosity Demo
            if (metricsRes.data.metrics.currentTierLabel === 'Inactive / Locked') {
                router.push('/demo');
                return;
            }

            setMetrics(metricsRes.data.metrics);
            setDisputes(disputesRes.data.disputes);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
            // If network fails entirely, route to login for safety
            router.push('/login');
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
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200">
                    {metrics.currentTierLabel}
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
                        Performance Fee ({metrics.currentFeeLabel})
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

echo "[✅] Curiosity Hook built and Guardrails engaged. Booting frontend..."
npm run dev
