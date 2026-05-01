"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion'; // Added Variants type
import api from '@/lib/api';
import { 
  Activity, ShieldCheck, Key, FileText, Download, 
  Link as LinkIcon, CheckCircle2, Cpu, Zap, Lock, Loader2, ArrowRight 
} from 'lucide-react';

const LIVE_ENGINE_URL = 'https://novoriqrevenueosapi.onrender.com';

// --- TYPES ---
type DashboardMetrics = {
    organizationId: string;
    totalDisputes: number;
    revenueRecoveredFormatted: string;
    performanceFeeOwedFormatted: string;
    pdfsGenerated: number;
    pdfLimit: string;
    currentTierLabel: string;
    currentFeeLabel: string;
    hasStripeKey: boolean;
    tier?: string;
};

type DashboardDispute = {
    id: string;
    stripeId: string;
    status: string;
    evidencePdfUrl?: string | null;
    payment: { amount: number; };
};

type DashboardMetricsResponse = {
    metrics: DashboardMetrics;
    tier?: string;
    organization?: { tier?: string; };
};

type DashboardDisputesResponse = {
    disputes: DashboardDispute[];
};

type ApiErrorResponse = {
    message?: string; 
    response?: {
        status?: number; 
        data?: { error?: string; };
    };
};

// --- EXECUTIVE LOGO COMPONENT ---
const NovoriqLogo = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-900">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// --- ANIMATION VARIANTS (Typed for TypeScript Compliance) ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { 
        opacity: 1, 
        transition: { 
            staggerChildren: 0.08, // Optimized for high-end "initialization" feel
            delayChildren: 0.1 
        } 
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { 
            type: "spring", 
            stiffness: 300, 
            damping: 24 
        } 
    }
};

export default function DashboardPage() {
    const router = useRouter();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [disputes, setDisputes] = useState<DashboardDispute[]>([]);
    const [stripeKey, setStripeKey] = useState('');
    const [keyStatus, setKeyStatus] = useState('');
    const [isKeyLoading, setIsKeyLoading] = useState(false);
    const [webhookCopied, setWebhookCopied] = useState(false);
    const [systemError, setSystemError] = useState(false); 

    const fetchData = useCallback(async () => {
        console.log("[Dashboard Protocol] Verifying access tier...");
        try {
            const metricsRes = await api.get<DashboardMetricsResponse>('/dashboard/metrics');
            
            const metricsData = { ...metricsRes.data.metrics };
            
            // Fallbacks: Prevent React crashes if backend data is missing
            metricsData.currentTierLabel = metricsData.currentTierLabel || 'Standard';
            metricsData.totalDisputes = metricsData.totalDisputes || 0;
            metricsData.revenueRecoveredFormatted = metricsData.revenueRecoveredFormatted || '$0.00';

            const rawTier = metricsData.tier || metricsRes.data.tier || metricsRes.data.organization?.tier;
            const isGodMode = rawTier === 'ALL_TIERS' || metricsData.currentTierLabel === 'ALL_TIERS';

            // --- THE EXECUTIVE GATEKEEPER (HARD LOCK) ---
            if (isGodMode) {
                metricsData.currentTierLabel = 'Enterprise (God Mode)';
                metricsData.pdfLimit = 'Unlimited';
                metricsData.currentFeeLabel = '0% Waived';
            } else {
                const status = metricsData.currentTierLabel;
                // If account is expired or inactive, redirect to appropriate provisioning page
                if (status === 'Expired') {
                    return router.push('/pricing');
                }
                if (status === 'Inactive / Locked' || status === 'Inactive') {
                    return router.push('/demo');
                }
            }

            const disputesRes = await api.get<DashboardDisputesResponse>('/dashboard/disputes');

            setSystemError(false); 
            setMetrics(metricsData);
            setDisputes(disputesRes.data?.disputes || []);
        } catch (err: unknown) { 
            console.error("[Dashboard Protocol] Initialization failed:", err);
            const apiError = err as ApiErrorResponse; 
            if (apiError.message === 'Network Error' || (apiError.response?.status || 0) >= 500) { 
                setSystemError(true); 
                return; 
            } 
            router.push('/login'); 
        }
    }, [router]);

    useEffect(() => {
        queueMicrotask(() => { fetchData(); });
    }, [fetchData]);

    const handleConnectStripe = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsKeyLoading(true);
        setKeyStatus("");
        try {
            await api.post('/dashboard/keys', { stripeSecretKey: stripeKey });
            setStripeKey('');
            await fetchData(); 
        } catch (err: unknown) { 
            const apiError = err as ApiErrorResponse;
            setKeyStatus(apiError.response?.data?.error || "Connection refused. Verify API limits."); 
        } finally {
            setIsKeyLoading(false);
        }
    };

    const copyWebhook = () => {
        if (!metrics) return;
        const targetUrl = `${LIVE_ENGINE_URL}/api/webhooks/stripe/${metrics.organizationId}`;
        void navigator.clipboard.writeText(targetUrl).then(() => {
            setWebhookCopied(true);
            setTimeout(() => setWebhookCopied(false), 3000);
        }).catch(() => setKeyStatus("Browser blocked clipboard."));
    };

    const downloadPdf = async (disputeId: string) => {
        try {
            const res = await api.get(`/dashboard/disputes/${disputeId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a'); 
            link.href = url; 
            link.setAttribute('download', `Novoriq_Evidence_${disputeId}.pdf`); 
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch { alert("Secure document retrieval failed."); }
    };

    if (systemError) return ( 
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-3xl border border-red-100 shadow-xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
                <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3">
                    <Cpu className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">System Offline</h1>
                <p className="text-sm text-zinc-500 mb-8 leading-relaxed">Backend nexus unreachable. Ensure engine is online.</p>
                <button type="button" onClick={() => window.location.reload()} className="w-full bg-zinc-900 text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-zinc-800 transition-all">
                    Retry Handshake
                </button>
            </motion.div>
        </div>
    );

    if (!metrics) return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="absolute inset-0 blur-xl bg-zinc-200 rounded-full animate-pulse" />
                    <NovoriqLogo />
                </div>
                <span className="text-sm font-bold text-zinc-900 tracking-wider uppercase">Initializing Nexus</span>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans p-4 md:p-8 overflow-x-hidden selection:bg-zinc-200 selection:text-zinc-900">
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-zinc-100 to-transparent pointer-events-none opacity-50 blur-3xl z-0" />

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8 relative z-10">
                
                <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end pb-8 gap-4 border-b border-zinc-200/60">
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-100">
                            <NovoriqLogo />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-3">
                                Novoriq OS <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase bg-zinc-100 px-2.5 py-1 rounded-md">v2.1.0</span>
                            </h1>
                            <p className="text-sm text-zinc-500 font-medium mt-1">Autonomous Revenue Defense & Evidence Compilation</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 bg-white shadow-sm text-xs font-bold text-zinc-700 uppercase tracking-wider">
                            <div className={`w-2 h-2 rounded-full ${metrics.currentTierLabel?.includes('God') ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                            {metrics.currentTierLabel}
                        </div>
                    </div>
                </motion.header>

                {/* METRICS GRID: Now with stagger container */}
                <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { label: 'Network Disputes', val: metrics.totalDisputes, icon: Activity },
                        { label: 'Revenue Secured', val: metrics.revenueRecoveredFormatted, icon: ShieldCheck },
                        { label: 'Evidence Capacity', val: `${metrics.pdfsGenerated} / ${metrics.pdfLimit}`, icon: FileText },
                        { label: 'Protocol Fee', val: metrics.performanceFeeOwedFormatted, icon: Cpu },
                    ].map((m) => (
                        <motion.div variants={itemVariants} key={m.label} className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-xs font-bold text-zinc-500 tracking-wider uppercase">{m.label}</div>
                                <m.icon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                            </div>
                            <div className="text-3xl font-extrabold text-zinc-900 tracking-tighter">{m.val}</div>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <aside className="lg:col-span-4 space-y-6">
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-zinc-200/60 p-7 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-zinc-100 p-2 rounded-md"><Key className="w-4 h-4 text-zinc-700" /></div>
                                <h3 className="font-bold text-sm tracking-wide text-zinc-900 uppercase">Cryptographic Vault</h3>
                            </div>
                            
                            {!metrics.hasStripeKey ? (
                                <form onSubmit={handleConnectStripe} className="space-y-5">
                                    <p className="text-xs text-zinc-500 font-medium">Inject your restricted API key to arm the monitoring protocol.</p>
                                    <input type="password" placeholder="rk_live_••••••••" value={stripeKey} onChange={(e) => setStripeKey(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3.5 text-sm text-zinc-900 font-mono outline-none" required />
                                    <button type="submit" disabled={isKeyLoading} className="w-full bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl py-3.5 text-sm font-bold flex justify-center items-center gap-2 active:scale-[0.98] transition-all">
                                        {isKeyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Seal Vault <ArrowRight className="w-4 h-4" /></>}
                                    </button>
                                </form>
                            ) : (
                                <div className="flex items-center gap-4 border border-zinc-200 p-4 bg-zinc-50 rounded-xl">
                                    <div className="bg-white p-2 rounded-lg border border-zinc-200"><Lock className="w-5 h-5 text-zinc-900" /></div>
                                    <div>
                                        <div className="text-sm font-bold text-zinc-900">Vault Secured</div>
                                        <div className="text-xs font-medium text-zinc-500 mt-0.5">AES-256 Active</div>
                                    </div>
                                </div>
                            )}
                            <AnimatePresence>
                                {keyStatus && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{keyStatus}</motion.div>}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div variants={itemVariants} animate={{ opacity: !metrics.hasStripeKey ? 0.4 : 1 }} className={`bg-white rounded-2xl border border-zinc-200/60 p-7 shadow-sm ${!metrics.hasStripeKey ? 'pointer-events-none' : ''}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-zinc-100 p-2 rounded-md"><LinkIcon className="w-4 h-4 text-zinc-700" /></div>
                                <h3 className="font-bold text-sm tracking-wide text-zinc-900 uppercase">Data Relay</h3>
                            </div>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-5">Endpoint established. Mount this in your external processor.</p>
                            <div className="bg-zinc-900 text-zinc-300 rounded-xl p-4 text-[11px] font-mono break-all mb-5">{`${LIVE_ENGINE_URL}/api/webhooks/stripe/${metrics.organizationId}`}</div>
                            <button onClick={copyWebhook} className="w-full bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-900 rounded-xl py-3.5 text-sm font-bold flex justify-center items-center gap-2 active:scale-[0.98] transition-all">
                                {webhookCopied ? <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Copied</> : 'Copy Payload URL'}
                            </button>
                        </motion.div>
                    </aside>

                    <motion.main variants={itemVariants} className="lg:col-span-8 bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-7 border-b border-zinc-100 flex justify-between items-center">
                            <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-900 flex items-center gap-3"><Activity className="w-4 h-4 text-zinc-400" /> Transaction Ledger</h2>
                        </div>
                        
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="bg-zinc-50/50 text-zinc-400 text-[10px] uppercase tracking-widest font-bold border-b border-zinc-100">
                                    <tr>
                                        <th className="px-7 py-5">Network ID</th>
                                        <th className="px-7 py-5">Contested</th>
                                        <th className="px-7 py-5">Resolution</th>
                                        <th className="px-7 py-5 text-right">Dossier</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {disputes.map((d) => (
                                        <motion.tr variants={itemVariants} key={d.id} className="hover:bg-zinc-50/80 transition-colors">
                                            <td className="px-7 py-5 font-mono text-zinc-500 text-xs">{d.stripeId}</td>
                                            <td className="px-7 py-5 font-bold text-zinc-900">${(d.payment.amount / 100).toLocaleString()}</td>
                                            <td className="px-7 py-5">
                                                <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${d.status.toLowerCase() === 'won' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'}`}>
                                                    {d.status}
                                                </span>
                                            </td>
                                            <td className="px-7 py-5 text-right">
                                                {d.evidencePdfUrl ? (
                                                    <button onClick={() => downloadPdf(d.id)} className="text-zinc-900 hover:text-blue-600 flex items-center gap-2 ml-auto text-xs font-bold transition-colors">
                                                        <Download className="w-4 h-4" /> Export
                                                    </button>
                                                ) : (
                                                    <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 justify-end"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Compiling</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                            {disputes.length === 0 && (
                                <div className="py-32 text-center flex flex-col items-center justify-center gap-4">
                                    <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100"><ShieldCheck className="w-8 h-8 text-zinc-300" /></div>
                                    <div className="text-zinc-400 text-sm font-medium tracking-wide">Network clear. No active disputes detected.</div>
                                </div>
                            )}
                        </div>
                    </motion.main>
                </div>
            </motion.div>
        </div>
    );
}
