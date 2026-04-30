#!/bin/bash

echo "[🚀] Initiating Day 20: Sandbox UX, Pricing Routing & Webhook Delivery..."

# ==========================================
# 1. UPDATE BACKEND TO RECOGNIZE EXPIRED TRIALS & RETURN ORG ID
# ==========================================
# We have to step out of frontend, update backend, then come back.
cd ../novoriq-recovery-engine

cat << 'CODE' > src/controllers/dashboardController.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { encryptStripeKey } from '../utils/encryption';
import { verifyStripeConnection } from '../services/stripeService';
import { getTierConfig } from '../utils/tierLogic';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const connectStripeKey = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user?.organizationId;
        const { stripeSecretKey } = req.body;
        if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
            res.status(400).json({ error: "Invalid Stripe Secret Key format." }); return;
        }
        const { encryptedStripeKey, stripeKeyIv } = encryptStripeKey(stripeSecretKey);
        await prisma.organization.update({ where: { id: orgId }, data: { encryptedStripeKey, stripeKeyIv } });
        const isValid = await verifyStripeConnection(orgId as string);
        if (isValid) { res.json({ success: true, message: "[✅] Stripe connection verified. Key Secured." }); } 
        else { res.status(400).json({ error: "Key failed Stripe verification." }); }
    } catch (error) { res.status(500).json({ error: "Failed to secure keys." }); }
};

export const getMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user?.organizationId;
        const org = await prisma.organization.findUnique({ where: { id: orgId } });
        const totalDisputes = await prisma.dispute.count({ where: { organizationId: orgId } });
        
        const tierConfig = getTierConfig(org!.tier);
        let label = tierConfig.label;
        
        // Trial Expiration Logic
        if (org!.tier === 'TRIAL' && org!.accessExpiresAt && org!.accessExpiresAt < new Date()) {
            label = 'Expired';
        }

        res.json({
            metrics: {
                organizationId: org!.id, // UI needs this for the Webhook URL
                totalDisputes,
                revenueRecoveredFormatted: `$${(org!.revenueRecovered / 100).toFixed(2)}`,
                performanceFeeOwedFormatted: `$${(org!.performanceFeeOwed / 100).toFixed(2)}`,
                pdfsGenerated: org?.pdfsGenerated,
                pdfLimit: tierConfig.pdfLimit,
                currentTierLabel: label,
                currentFeeLabel: `${tierConfig.feePercent * 100}%`,
                hasStripeKey: !!org!.encryptedStripeKey
            }
        });
    } catch (error) { res.status(500).json({ error: "Metrics error." }); }
};

export const getDisputes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user?.organizationId;
        const disputes = await prisma.dispute.findMany({ 
            where: { organizationId: orgId }, include: { payment: true }, orderBy: { createdAt: 'desc' }, take: 50 
        });
        res.json({ disputes });
    } catch (error) { res.status(500).json({ error: "Failed to fetch ledger." }); }
};

export const downloadEvidencePdf = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user?.organizationId;
        const disputeId = req.params.id;
        if (!disputeId || typeof disputeId !== 'string') { res.status(400).json({ error: "Invalid Dispute ID format." }); return; }
        const dispute = await prisma.dispute.findFirst({ where: { id: disputeId, organizationId: orgId } });
        if (!dispute || !dispute.evidencePdfUrl) { res.status(404).json({ error: "Evidence PDF not found." }); return; }
        const filePath = path.resolve(dispute.evidencePdfUrl);
        if (fs.existsSync(filePath)) { res.download(filePath, `Novoriq_Evidence_${dispute.stripeId}.pdf`); } 
        else { res.status(404).json({ error: "File missing from disk." }); }
    } catch (error) { res.status(500).json({ error: "Server error." }); }
};
CODE

# ==========================================
# 2. BUILD FRONTEND PRICING PAGE & DEMO SCREEN
# ==========================================
cd ../novoriq-dashboard
mkdir -p src/app/pricing

# Build Pricing Page (Hard Paywall)
cat << 'CODE' > src/app/pricing/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Activity, ShieldCheck, FileText, Lock } from 'lucide-react';

export default function PricingPage() {
    const router = useRouter();
    const [orgId, setOrgId] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('novoriq_token');
        if (!token) return router.push('/login');
        try {
            const decoded: any = jwtDecode(token);
            setOrgId(decoded.organizationId);
        } catch (e) { router.push('/login'); }
    }, []);

    const whopBaseParams = `?metadata[organizationId]=${orgId}`;
    const links = {
        tier1: `https://whop.com/checkout/plan_pJpWvIqcYCRvV${whopBaseParams}`,
        tier2: `https://whop.com/checkout/plan_rE4Rj9g9t8RNH${whopBaseParams}`,
        tier3: `https://whop.com/checkout/plan_My5qZYNCRlcgr${whopBaseParams}`
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-5xl mx-auto mt-12 text-center mb-16">
                <Lock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-4">Trial Expired. Upgrade to Maintain Defense.</h1>
                <p className="text-slate-400">Your 48-hour access has concluded. Select a tier to re-engage your automated recovery engine.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold mb-1">Starter</h3>
                    <div className="text-4xl font-bold mb-6">$199<span className="text-lg text-slate-500">/mo</span></div>
                    <ul className="space-y-4 mb-8"><li className="flex gap-3"><FileText className="w-5 text-blue-400"/> 50 PDFs</li><li className="flex gap-3"><Activity className="w-5 text-blue-400"/> 10% Fee</li></ul>
                    <a href={links.tier1} className="w-full block text-center bg-slate-700 hover:bg-slate-600 py-3 rounded-xl">Select Starter</a>
                </div>
                <div className="bg-slate-800 border border-blue-500 rounded-2xl p-8 transform md:-translate-y-4 shadow-xl">
                    <h3 className="text-2xl font-bold mb-1">Pro</h3>
                    <div className="text-4xl font-bold mb-6">$399<span className="text-lg text-slate-500">/mo</span></div>
                    <ul className="space-y-4 mb-8"><li className="flex gap-3"><FileText className="w-5 text-blue-400"/> 80 PDFs</li><li className="flex gap-3"><Activity className="w-5 text-blue-400"/> 5% Fee</li><li className="flex gap-3"><ShieldCheck className="w-5 text-blue-400"/> Golden Trio</li></ul>
                    <a href={links.tier2} className="w-full block text-center bg-blue-600 hover:bg-blue-500 py-3 rounded-xl">Select Pro</a>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold mb-1">Premium</h3>
                    <div className="text-4xl font-bold mb-6">$799<span className="text-lg text-slate-500">/mo</span></div>
                    <ul className="space-y-4 mb-8"><li className="flex gap-3"><FileText className="w-5 text-blue-400"/> 120 PDFs</li><li className="flex gap-3"><Activity className="w-5 text-blue-400"/> 3.5% Fee</li></ul>
                    <a href={links.tier3} className="w-full block text-center bg-slate-700 hover:bg-slate-600 py-3 rounded-xl">Select Premium</a>
                </div>
            </div>
        </div>
    );
}
CODE

# Build Demo Page (Simulated Dashboard Sandbox)
cat << 'CODE' > src/app/demo/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Activity, ShieldCheck, FileText, Download, Zap } from 'lucide-react';

export default function DemoPage() {
    const router = useRouter();
    const [orgId, setOrgId] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('novoriq_token');
        if (!token) return router.push('/login');
        try {
            const decoded: any = jwtDecode(token);
            setOrgId(decoded.organizationId);
        } catch (e) { router.push('/login'); }
    }, []);

    const trialLink = `https://whop.com/checkout/plan_g5k8i3tfPkASV?metadata[organizationId]=${orgId}`;

    // Simulated high-value data to create FOMO
    const simulatedDisputes = [
        { id: '1', stripeId: 'dp_1Q8zxX...', amount: 49900, reason: 'fraudulent', status: 'won', hasPdf: true },
        { id: '2', stripeId: 'dp_2K9amP...', amount: 125000, reason: 'product_not_received', status: 'won', hasPdf: true },
        { id: '3', stripeId: 'dp_3J7bnQ...', amount: 8900, reason: 'unrecognized', status: 'needs_response', hasPdf: false }
    ];

    const downloadFakePdf = () => {
        alert("DEMO MODE: This is a simulated PDF. Activate your 48-Hour Trial to generate real Compelling Evidence documents.");
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* The Hook Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-full p-4 text-center text-white flex flex-col md:flex-row items-center justify-center gap-4 shadow-md sticky top-0 z-50">
                <span className="font-semibold text-lg flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-300"/> SANDBOX MODE ACTIVE</span>
                <span className="hidden md:inline text-blue-200">|</span>
                <span className="text-sm">See how much revenue you could recover.</span>
                <a href={trialLink} className="bg-white text-blue-700 font-bold px-6 py-2 rounded-full text-sm hover:bg-slate-100 transition-colors">
                    Start 48-Hour Live Trial ($10)
                </a>
            </div>

            <div className="max-w-6xl mx-auto p-8 space-y-8 mt-4 filter opacity-90 grayscale-[10%] pointer-events-auto">
                <h1 className="text-3xl font-bold text-slate-900">Revenue OS (Simulated)</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 text-slate-500 mb-2"><Activity className="w-5 text-blue-500" /> Tracked Disputes</div>
                        <div className="text-3xl font-bold">142</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-green-500">
                        <div className="flex items-center gap-3 text-slate-500 mb-2"><ShieldCheck className="w-5 text-green-500" /> Revenue Recovered</div>
                        <div className="text-3xl font-bold text-green-600">$18,450.00</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 text-slate-500 mb-2"><FileText className="w-5 text-purple-500" /> Evidence Generated</div>
                        <div className="text-3xl font-bold">118 / 120</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200"><h2 className="font-semibold text-lg">Simulated Ledger</h2></div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500"><tr><th className="px-6 py-3">ID</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Evidence</th></tr></thead>
                        <tbody>
                            {simulatedDisputes.map(d => (
                                <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-500">{d.stripeId}</td>
                                    <td className="px-6 py-4 font-bold text-slate-700">${(d.amount / 100).toFixed(2)}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${d.status==='won'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>{d.status}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        {d.hasPdf ? <button onClick={downloadFakePdf} className="text-blue-600 font-medium flex items-center justify-end gap-1 w-full"><Download className="w-4"/> Preview PDF</button> : <span className="text-slate-400">Processing...</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
CODE

# ==========================================
# 3. UPGRADE REAL DASHBOARD (Guardrails + Webhook URL)
# ==========================================
cat << 'CODE' > src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Activity, ShieldCheck, Key, FileText, Download, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [metrics, setMetrics] = useState<any>(null);
    const [disputes, setDisputes] = useState<any[]>([]);
    const [stripeKey, setStripeKey] = useState('');
    const [keyStatus, setKeyStatus] = useState('');
    const [webhookCopied, setWebhookCopied] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [metricsRes, disputesRes] = await Promise.all([ api.get('/dashboard/metrics'), api.get('/dashboard/disputes') ]);
            
            // ROUTING GUARDRAILS
            const status = metricsRes.data.metrics.currentTierLabel;
            if (status === 'Expired') return router.push('/pricing');
            if (status === 'Inactive / Locked') return router.push('/demo');

            setMetrics(metricsRes.data.metrics);
            setDisputes(disputesRes.data.disputes);
        } catch (error) { router.push('/login'); }
    };

    const handleConnectStripe = async (e: React.FormEvent) => {
        e.preventDefault();
        setKeyStatus("Verifying...");
        try {
            const res = await api.post('/dashboard/keys', { stripeSecretKey: stripeKey });
            setKeyStatus(res.data.message);
            setStripeKey('');
            fetchData(); // Refresh to show webhook URL step
        } catch (err: any) { setKeyStatus(err.response?.data?.error || "Failed."); }
    };

    const copyWebhook = () => {
        // Build the URL based on where the frontend is currently hosted (or your production API domain)
        const host = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || window.location.origin;
        navigator.clipboard.writeText(`${host}/api/webhooks/stripe/${metrics.organizationId}`);
        setWebhookCopied(true);
        setTimeout(() => setWebhookCopied(false), 3000);
    };

    const downloadPdf = async (disputeId: string) => {
        try {
            const res = await api.get(`/dashboard/disputes/${disputeId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a'); link.href = url; link.setAttribute('download', `Evidence.pdf`); link.click();
        } catch (error) { alert("PDF unavailable."); }
    };

    if (!metrics) return null;

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-8">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div><h1 className="text-3xl font-bold text-slate-900">Revenue OS</h1></div>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200">
                    {metrics.currentTierLabel}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><div className="flex items-center gap-3 text-slate-500 mb-2"><Activity className="w-5 text-blue-500" /> Active Disputes</div><div className="text-3xl font-bold">{metrics.totalDisputes}</div></div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><div className="flex items-center gap-3 text-slate-500 mb-2"><ShieldCheck className="w-5 text-green-500" /> Revenue Recovered</div><div className="text-3xl font-bold">{metrics.revenueRecoveredFormatted}</div></div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><div className="flex items-center gap-3 text-slate-500 mb-2"><FileText className="w-5 text-purple-500" /> Evidence Limit</div><div className="text-3xl font-bold">{metrics.pdfsGenerated} / {metrics.pdfLimit}</div></div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm bg-blue-50"><div className="flex items-center gap-3 text-blue-700 mb-2 font-medium">Performance Fee ({metrics.currentFeeLabel})</div><div className="text-3xl font-bold text-blue-900">{metrics.performanceFeeOwedFormatted}</div></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    {/* Step 1: Stripe Key */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 font-semibold text-lg"><Key className="w-5 text-slate-400" /> 1. Connect Stripe</div>
                        {!metrics.hasStripeKey ? (
                            <form onSubmit={handleConnectStripe} className="space-y-3">
                                <input type="password" placeholder="sk_live_..." value={stripeKey} onChange={(e) => setStripeKey(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
                                <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium">Secure Key</button>
                            </form>
                        ) : (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                                <CheckCircle2 className="w-5 h-5" /> Secret Key Secured.
                            </div>
                        )}
                        {keyStatus && <div className="mt-4 text-sm text-blue-600">{keyStatus}</div>}
                    </div>

                    {/* Step 2: Webhook URL Display */}
                    <div className={`bg-white p-6 rounded-xl border shadow-sm transition-opacity ${!metrics.hasStripeKey ? 'opacity-50 pointer-events-none border-slate-200' : 'border-blue-200'}`}>
                        <div className="flex items-center gap-2 mb-2 font-semibold text-lg"><LinkIcon className="w-5 text-blue-500" /> 2. Stripe Webhook</div>
                        <p className="text-xs text-slate-500 mb-4">Paste this exact URL into your Stripe Dashboard Webhooks to enable live dispute tracking.</p>
                        <div className="bg-slate-100 border border-slate-300 p-3 rounded-lg font-mono text-xs text-slate-700 break-all mb-3">
                            {`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'}/api/webhooks/stripe/${metrics.organizationId}`}
                        </div>
                        <button onClick={copyWebhook} className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2">
                            {webhookCopied ? <><CheckCircle2 className="w-4 h-4" /> Copied!</> : 'Copy Webhook URL'}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200"><h2 className="font-semibold text-lg text-slate-800">Live Dispute Ledger</h2></div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b"><tr><th className="px-6 py-3">ID</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Evidence</th></tr></thead>
                        <tbody>
                            {disputes.map((d: any) => (
                                <tr key={d.id} className="hover:bg-slate-50 border-b border-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-500">{d.stripeId.substring(0, 14)}...</td>
                                    <td className="px-6 py-4 font-medium">${(d.payment.amount / 100).toFixed(2)}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${d.status==='won'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>{d.status}</span></td>
                                    <td className="px-6 py-4 text-right">{d.evidencePdfUrl ? <button onClick={()=>downloadPdf(d.id)} className="text-blue-600 font-medium">Download PDF</button> : <span className="text-slate-400">Processing...</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
CODE

echo "[✅] Sandboxes, Paywalls, and Webhook UI built. Restarting Frontend..."
npm run dev
