"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { 
  Activity, ShieldCheck, Key, FileText, Download, 
  Link as LinkIcon, CheckCircle2, Cpu, Zap, Lock 
} from 'lucide-react';

// Hardcoded New API Domain
const LIVE_ENGINE_URL = 'https://novoriqrevenueosapi.onrender.com';

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
    payment: {
        amount: number;
    };
};

type DashboardMetricsResponse = {
    metrics: DashboardMetrics;
    tier?: string;
    organization?: {
        tier?: string;
    };
};

type DashboardDisputesResponse = {
    disputes: DashboardDispute[];
};

type ApiErrorResponse = {
    message?: string; // [CODEX PATCH]
    response?: {
        status?: number; // [CODEX PATCH]
        data?: {
            error?: string;
        };
    };
};

export default function DashboardPage() {
    const router = useRouter();
    // Fixed: replaced explicit any state with API-shaped types.
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [disputes, setDisputes] = useState<DashboardDispute[]>([]);
    const [stripeKey, setStripeKey] = useState('');
    const [keyStatus, setKeyStatus] = useState('');
    const [webhookCopied, setWebhookCopied] = useState(false);
    const [systemError, setSystemError] = useState(false); // [CODEX PATCH]

    // Fixed: memoized fetchData so the effect has a stable, complete dependency list.
    const fetchData = useCallback(async () => {
        try {
            const [metricsRes, disputesRes] = await Promise.all([ 
                api.get<DashboardMetricsResponse>('/dashboard/metrics'), 
                api.get<DashboardDisputesResponse>('/dashboard/disputes') 
            ]);
            
            const metricsData = { ...metricsRes.data.metrics };
            const rawTier = metricsData.tier || metricsRes.data.tier || metricsRes.data.organization?.tier;
            const isGodMode = rawTier === 'ALL_TIERS' || metricsData.currentTierLabel === 'ALL_TIERS';

            if (isGodMode) {
                metricsData.currentTierLabel = 'GOD_MODE_ACTIVE';
                metricsData.pdfLimit = 'UNLIMITED';
                metricsData.currentFeeLabel = '0%_WAIVED';
            } else {
                const status = metricsData.currentTierLabel;
                if (status === 'Expired') return router.push('/pricing');
                if (status === 'Inactive / Locked') return router.push('/demo');
            }

            setSystemError(false); // [CODEX PATCH]
            setMetrics(metricsData);
            setDisputes(disputesRes.data.disputes);
        } catch (err: unknown) { // [CODEX PATCH]
            const apiError = err as ApiErrorResponse; // [CODEX PATCH]
            const isNetworkError = apiError.message === 'Network Error'; // [CODEX PATCH]
            const isServerError = (apiError.response?.status || 0) >= 500; // [CODEX PATCH]
            if (isNetworkError || isServerError) { // [CODEX PATCH]
                setSystemError(true); // [CODEX PATCH]
                return; // [CODEX PATCH]
            } // [CODEX PATCH]
            router.push('/login'); // [CODEX PATCH]
        }
    }, [router]);

    useEffect(() => {
        // Fixed: defer async state hydration out of the synchronous effect body.
        queueMicrotask(() => { fetchData(); });
    }, [fetchData]);

    const handleConnectStripe = async (e: React.FormEvent) => {
        e.preventDefault();
        setKeyStatus("ENCRYPTING_CIPHER...");
        try {
            await api.post('/dashboard/keys', { stripeSecretKey: stripeKey });
            setKeyStatus("SYNC_SUCCESSFUL");
            setStripeKey('');
            fetchData(); 
        } catch (err: unknown) { 
            const apiError = err as ApiErrorResponse;
            setKeyStatus(apiError.response?.data?.error || "ACCESS_DENIED"); 
        }
    };

    const copyWebhook = () => {
        if (!metrics) return;
        // Hardened: clipboard writes can reject in locked-down browsers; surface the failure in-theme.
        void navigator.clipboard.writeText(`${LIVE_ENGINE_URL}/api/webhooks/stripe/${metrics.organizationId}`)
            .then(() => {
                setWebhookCopied(true);
                setTimeout(() => setWebhookCopied(false), 3000);
            })
            .catch(() => setKeyStatus("CLIPBOARD_ACCESS_DENIED"));
    };

    const downloadPdf = async (disputeId: string) => {
        try {
            const res = await api.get(`/dashboard/disputes/${disputeId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a'); 
            link.href = url; 
            link.setAttribute('download', `Evidence_${disputeId}.pdf`); 
            link.click();
            window.URL.revokeObjectURL(url);
        } catch { 
            alert("DATA_RETRIEVAL_ERROR"); 
        }
    };

    if (systemError) return ( // [CODEX PATCH]
        <div className="min-h-screen bg-obsidian text-slate-300 font-mono flex items-center justify-center p-4 overflow-hidden relative"> {/* [CODEX PATCH] */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(to_right,#1a3a2f_1px,transparent_1px),linear-gradient(to_bottom,#1a3a2f_1px,transparent_1px)] bg-[size:4rem_4rem]" /> {/* [CODEX PATCH] */}
            <motion.div  /* [CODEX PATCH] */
                initial={{ opacity: 0, y: 20 }} /* [CODEX PATCH] */
                animate={{ opacity: 1, y: 0 }} /* [CODEX PATCH] */
                className="z-10 w-full max-w-md bg-jade-deep/80 backdrop-blur-md border border-jade-line p-8 relative" /* [CODEX PATCH] */
            >
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-jade-muted" /> {/* [CODEX PATCH] */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-jade-muted" /> {/* [CODEX PATCH] */}
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-jade-muted" /> {/* [CODEX PATCH] */}
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-jade-muted" /> {/* [CODEX PATCH] */}
                <div className="flex flex-col items-center text-center gap-4"> {/* [CODEX PATCH] */}
                    <Cpu className="w-10 h-10 text-red-500 animate-pulse" /> {/* [CODEX PATCH] */}
                    <h1 className="text-xl tracking-[0.3em] uppercase text-white font-bold">System_Offline</h1> {/* [CODEX PATCH] */}
                    <p className="text-[10px] text-jade-muted uppercase tracking-widest leading-relaxed">Backend nexus unreachable. Verify the Render engine is online, then retry the dashboard handshake.</p> {/* [CODEX PATCH] */}
                    <button  /* [CODEX PATCH] */
                        type="button" /* [CODEX PATCH] */
                        onClick={() => window.location.reload()} /* [CODEX PATCH] */
                        className="w-full border border-jade-muted text-jade-muted hover:bg-jade-muted hover:text-obsidian py-3 text-[10px] tracking-[0.3em] font-bold uppercase transition-all" /* [CODEX PATCH] */
                    >
                        Retry_Handshake
                    </button>
                </div>
            </motion.div>
        </div>
    );

    if (!metrics) return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center">
            <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex flex-col items-center gap-4"
            >
                <Cpu className="w-12 h-12 text-jade-muted" />
                <span className="text-[10px] tracking-[0.4em] text-jade-muted uppercase">Booting_OS...</span>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-obsidian text-slate-300 font-mono p-4 md:p-8 overflow-x-hidden">
            {/* Ambient Background Grid */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#1a3a2f_1px,transparent_1px),linear-gradient(to_bottom,#1a3a2f_1px,transparent_1px)] bg-[size:3rem_3rem]" />

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                
                {/* Top Navigation Bar */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-jade-line pb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tighter text-white uppercase flex items-center gap-2">
                            <Zap className="text-jade-muted w-6 h-6" /> Revenue_OS <span className="text-[10px] text-jade-line font-normal">v2.1.0</span>
                        </h1>
                        <p className="text-[10px] text-jade-muted tracking-widest mt-1 uppercase">Operational_Status: Optimal</p>
                    </div>
                    
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className={`px-4 py-1.5 border ${
                            metrics.currentTierLabel.includes('GOD') 
                                ? 'border-white bg-white text-black' 
                                : 'border-jade-muted text-jade-muted'
                        } text-[10px] font-bold tracking-[0.2em] uppercase`}
                    >
                        {metrics.currentTierLabel}
                    </motion.div>
                </header>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'DISPUTE_LOAD', val: metrics.totalDisputes, icon: Activity, color: 'text-blue-400' },
                        { label: 'REVENUE_SECURED', val: metrics.revenueRecoveredFormatted, icon: ShieldCheck, color: 'text-white' },
                        { label: 'EVIDENCE_CAPACITY', val: `${metrics.pdfsGenerated}/${metrics.pdfLimit}`, icon: FileText, color: 'text-jade-muted' },
                        { label: 'PROTOCOL_FEE', val: metrics.performanceFeeOwedFormatted, icon: Cpu, color: 'text-amber-500' },
                    ].map((m, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={m.label} 
                            className="bg-jade-deep/50 border border-jade-line p-5 group hover:border-white transition-all duration-500"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <m.icon className={`w-4 h-4 ${m.color}`} />
                                <div className="w-1 h-1 bg-jade-muted animate-ping" />
                            </div>
                            <div className="text-xs text-jade-muted tracking-widest mb-1 uppercase">{m.label}</div>
                            <div className="text-2xl font-bold text-white tracking-tighter">{m.val}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Sidebar Configuration */}
                    <aside className="lg:col-span-4 space-y-6">
                        {/* Step 1: Stripe Integration */}
                        <div className="bg-jade-deep/50 border border-jade-line p-6 relative">
                            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-jade-muted" />
                            <div className="flex items-center gap-3 mb-6 font-bold text-[11px] tracking-widest uppercase">
                                <Key className="w-4 h-4 text-jade-muted" /> 01_Secure_Nexus
                            </div>
                            
                            {!metrics.hasStripeKey ? (
                                <form onSubmit={handleConnectStripe} className="space-y-4">
                                    <input 
                                        type="password" 
                                        placeholder="sk_live_****************" 
                                        value={stripeKey} 
                                        onChange={(e) => setStripeKey(e.target.value)} 
                                        className="w-full bg-obsidian border border-jade-line focus:border-white focus:outline-none px-4 py-2 text-xs text-white font-mono" 
                                        required 
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={keyStatus === "ENCRYPTING_CIPHER..."}
                                        className="w-full border border-jade-muted text-jade-muted hover:bg-jade-muted hover:text-black py-2.5 text-[10px] tracking-[0.3em] font-bold uppercase transition-all disabled:opacity-40 disabled:pointer-events-none"
                                    >
                                        LINK_ENCRYPTION_KEY
                                    </button>
                                </form>
                            ) : (
                                <div className="flex items-center gap-3 text-white border border-jade-muted/30 p-4 bg-jade-muted/10">
                                    <Lock className="w-4 h-4 text-jade-muted" /> 
                                    <span className="text-[10px] tracking-widest uppercase">Vault_Status: Locked</span>
                                </div>
                            )}
                            {keyStatus && <div aria-live="polite" className="mt-4 text-[9px] text-jade-muted italic uppercase tracking-widest">{keyStatus}</div>}
                        </div>

                        {/* Step 2: Webhook Sync */}
                        <motion.div 
                            animate={{ opacity: !metrics.hasStripeKey ? 0.3 : 1 }}
                            className={`bg-jade-deep/50 border border-jade-line p-6 relative ${!metrics.hasStripeKey ? 'pointer-events-none' : ''}`}
                        >
                            <div className="flex items-center gap-3 mb-4 font-bold text-[11px] tracking-widest uppercase">
                                <LinkIcon className="w-4 h-4 text-jade-muted" /> 02_Data_Relay
                            </div>
                            <p className="text-[9px] text-jade-muted uppercase leading-relaxed mb-4">Set relay destination in Stripe dashboard for autonomous tracking.</p>
                            
                            <div className="bg-obsidian/50 border border-jade-line p-4 text-[10px] font-mono text-jade-muted break-all mb-4">
                                {`${LIVE_ENGINE_URL}/api/webhooks/stripe/${metrics.organizationId}`}
                            </div>
                            
                            <button 
                                onClick={copyWebhook} 
                                className="w-full bg-transparent border border-jade-line hover:border-white hover:text-white py-2 text-[9px] tracking-widest uppercase transition-all flex justify-center items-center gap-2"
                            >
                                {webhookCopied ? <><CheckCircle2 className="w-3 h-3" /> SYNCED</> : 'COPY_RELAY_URL'}
                            </button>
                        </motion.div>
                    </aside>

                    {/* Main Dispute Ledger */}
                    <main className="lg:col-span-8 bg-jade-deep/30 border border-jade-line backdrop-blur-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-jade-line flex justify-between items-center">
                            <h2 className="text-[11px] font-bold tracking-[0.4em] uppercase flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Live_Ledger_Feed
                            </h2>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 bg-jade-line" />)}
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px] text-left">
                                <thead className="bg-jade-line/20 text-jade-muted border-b border-jade-line uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Transaction_ID</th>
                                        <th className="px-6 py-4">Magnitude</th>
                                        <th className="px-6 py-4">State</th>
                                        <th className="px-6 py-4 text-right">Evidence_Packet</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-jade-line/50">
                                    {disputes.map((d, idx) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={d.id} 
                                            className="hover:bg-jade-line/10 transition-colors group"
                                        >
                                            <td className="px-6 py-5 font-mono text-jade-muted group-hover:text-white transition-colors">
                                                {d.stripeId.substring(0, 14).toUpperCase()}...
                                            </td>
                                            <td className="px-6 py-5 font-bold text-white">
                                                ${(d.payment.amount / 100).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-tighter ${
                                                    d.status === 'won' ? 'bg-jade-muted/20 text-jade-muted border border-jade-muted/50' : 'bg-amber-900/20 text-amber-500 border border-amber-900'
                                                }`}>
                                                    {d.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                {d.evidencePdfUrl ? (
                                                    <button 
                                                        onClick={() => downloadPdf(d.id)} 
                                                        className="text-white hover:text-jade-muted flex items-center gap-1 ml-auto group-hover:underline underline-offset-4"
                                                    >
                                                        <Download className="w-3 h-3" /> PACKET_DL
                                                    </button>
                                                ) : (
                                                    <span className="text-jade-line animate-pulse uppercase tracking-[0.2em] text-[9px]">Analyzing...</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                            {disputes.length === 0 && (
                                <div className="p-20 text-center text-jade-line uppercase tracking-[0.5em] text-[10px]">
                                    Scanning_Network_For_Disputes...
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
