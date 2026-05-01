"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import api from '@/lib/api';
import { 
  Activity, ShieldCheck, Key, FileText, Download, 
  Link as LinkIcon, CheckCircle2, Cpu, Zap, Lock, Loader2, ArrowRight, CreditCard, Sparkles
} from 'lucide-react';

const LIVE_ENGINE_URL = 'https://novoriqrevenueosapi.onrender.com';

// --- BILLING CONFIGURATION ---
const TEST_PLAN_ID = 'plan_V3eDZlxhqz03e'; // $0 Testing Plan
const BETA_PLAN_ID = 'plan_g5k8i3tfPkASV'; // $10 Beta Access

// --- SIMULATED EXECUTIVE DATA ---
const MOCK_METRICS = {
    organizationId: 'demo_01_nexus',
    totalDisputes: 24,
    revenueRecoveredFormatted: '$12,840.00',
    performanceFeeOwedFormatted: '$0.00',
    pdfsGenerated: 24,
    pdfLimit: 'Unlimited (Demo)',
    currentTierLabel: 'Interactive Demo',
    currentFeeLabel: 'Elite Tier',
    hasStripeKey: false,
};

const MOCK_DISPUTES = [
    { id: 'mock_1', stripeId: 'dp_1Q7zXYZ90L...', status: 'WON', payment: { amount: 150000 }, evidencePdfUrl: '#' },
    { id: 'mock_2', stripeId: 'dp_1Q8aABC12M...', status: 'WON', payment: { amount: 29900 }, evidencePdfUrl: '#' },
    { id: 'mock_3', stripeId: 'dp_1Q8bDEF34N...', status: 'WON', payment: { amount: 85000 }, evidencePdfUrl: '#' },
    { id: 'mock_4', stripeId: 'dp_1Q9cGHJ56P...', status: 'PROCESSING', payment: { amount: 45000 }, evidencePdfUrl: null },
];

const MASTER_CODES = ['JADE-FOUNDER-2026', 'NOVO-ELITE-UNLOCK'];

// --- EXECUTIVE LOGO COMPONENT ---
const NovoriqLogo = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-900">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DemoPage() {
    const router = useRouter();
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [promoError, setPromoError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [orgId, setOrgId] = useState<string | null>(null);

    // Get real OrgID if user is logged in to ensure the webhook updates the right account
    useEffect(() => {
        api.get('/dashboard/metrics')
            .then(res => setOrgId(res.data.metrics.organizationId))
            .catch(() => setOrgId(null));
    }, []);

    const handlePromoUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUnlocking(true);
        setPromoError('');
        setTimeout(() => {
            if (MASTER_CODES.includes(promoCode.trim())) {
                setIsUnlocked(true);
            } else {
                setPromoError('Invalid Elite access code.');
            }
            setIsUnlocking(false);
        }, 800);
    };

    const handlePaymentRedirect = (planId: string) => {
        if (!orgId) {
            router.push('/login');
            return;
        }
        // Using the direct plan URL format with external_id metadata
        const checkoutUrl = `https://whop.com/checkout/${planId}?external_id=${orgId}`;
        window.open(checkoutUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans p-4 md:p-8 overflow-x-hidden relative selection:bg-zinc-200">
            
            {/* --- THE ELITE GATEWAY OVERLAY --- */}
            <AnimatePresence>
                {!isUnlocked && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-zinc-900/5"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-zinc-100"
                        >
                            <div className="flex justify-center mb-6">
                                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 shadow-inner">
                                    <Lock className="w-8 h-8 text-zinc-900" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-extrabold text-center text-zinc-900 mb-2">Unlock Revenue OS</h2>
                            <p className="text-sm text-zinc-500 text-center font-medium mb-8 leading-relaxed">
                                Deploy the autonomous evidence engine. Secure lifetime beta access for $10 or run an E2E test.
                            </p>

                            <div className="space-y-3 mb-6">
                                <button 
                                    onClick={() => handlePaymentRedirect(BETA_PLAN_ID)}
                                    className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-xl py-4 text-sm font-bold transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                                >
                                    <CreditCard className="w-4 h-4" /> Secure Access — $10
                                </button>
                                
                                {/* 🧪 TESTING LINK BUTTON */}
                                <button 
                                    onClick={() => handlePaymentRedirect(TEST_PLAN_ID)}
                                    className="w-full bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 rounded-xl py-3 text-xs font-bold transition-all flex justify-center items-center gap-2 active:scale-[0.98]"
                                >
                                    Run End-to-End Test — $0
                                </button>
                            </div>

                            <div className="relative flex items-center py-2 mb-6">
                                <div className="flex-grow border-t border-zinc-100"></div>
                                <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Elite Validation</span>
                                <div className="flex-grow border-t border-zinc-100"></div>
                            </div>

                            <form onSubmit={handlePromoUnlock} className="space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Enter Master Promo Code" 
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 rounded-xl px-4 py-3.5 text-sm font-mono text-center outline-none transition-all"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!promoCode || isUnlocking}
                                    className="w-full bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                                >
                                    {isUnlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Apply Master Code</>}
                                </button>
                                {promoError && <p className="text-xs text-red-600 font-bold text-center mt-3">{promoError}</p>}
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- SIMULATED DASHBOARD BACKGROUND --- */}
            <div className={`transition-all duration-1000 ${!isUnlocked ? 'blur-lg opacity-40 grayscale pointer-events-none' : 'blur-0 opacity-100'}`}>
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-zinc-100 to-transparent pointer-events-none opacity-50 blur-3xl z-0" />

                <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8 relative z-10">
                    
                    <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end pb-8 gap-4 border-b border-zinc-200/60">
                        <div className="flex items-center gap-5">
                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-100">
                                <NovoriqLogo />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-3">
                                    Novoriq OS <span className="text-[10px] text-emerald-700 font-bold tracking-widest uppercase bg-emerald-50 px-2.5 py-1 rounded-md">Interactive Demo</span>
                                </h1>
                                <p className="text-sm text-zinc-500 font-medium mt-1">Autonomous Revenue Defense & Evidence Compilation</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 bg-white shadow-sm text-xs font-bold text-zinc-700 uppercase tracking-wider">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            {MOCK_METRICS.currentTierLabel}
                        </div>
                    </motion.header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { label: 'Network Disputes', val: MOCK_METRICS.totalDisputes, icon: Activity },
                            { label: 'Revenue Secured', val: MOCK_METRICS.revenueRecoveredFormatted, icon: ShieldCheck },
                            { label: 'Evidence Capacity', val: MOCK_METRICS.pdfLimit, icon: FileText },
                            { label: 'Protocol Fee', val: MOCK_METRICS.currentFeeLabel, icon: Cpu },
                        ].map((m) => (
                            <motion.div variants={itemVariants} key={m.label} className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="text-xs font-bold text-zinc-500 tracking-wider uppercase">{m.label}</div>
                                    <m.icon className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div className="text-3xl font-extrabold text-zinc-900 tracking-tighter">{m.val}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <aside className="lg:col-span-4 space-y-6">
                            <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-zinc-200/60 p-7 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-zinc-100 p-2 rounded-md"><Key className="w-4 h-4 text-zinc-700" /></div>
                                    <h3 className="font-bold text-sm tracking-wide text-zinc-900 uppercase">Cryptographic Vault</h3>
                                </div>
                                <p className="text-xs text-zinc-500 font-medium mb-5">Vault operations are simulated in demo mode.</p>
                                <div className="flex items-center gap-4 border border-zinc-200 p-4 bg-zinc-50 rounded-xl opacity-60">
                                    <div className="bg-white p-2 rounded-lg border border-zinc-200"><Lock className="w-5 h-5 text-zinc-900" /></div>
                                    <div>
                                        <div className="text-sm font-bold text-zinc-900">Vault Locked</div>
                                        <div className="text-xs font-medium text-zinc-500">AES-256 Protocol</div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-zinc-200/60 p-7 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-zinc-100 p-2 rounded-md"><LinkIcon className="w-4 h-4 text-zinc-700" /></div>
                                    <h3 className="font-bold text-sm tracking-wide text-zinc-900 uppercase">Data Relay</h3>
                                </div>
                                <div className="bg-zinc-900 text-zinc-300 rounded-xl p-4 text-[11px] font-mono break-all mb-5">
                                    {`${LIVE_ENGINE_URL}/api/webhooks/stripe/${orgId || 'demo_nexus_guest'}`}
                                </div>
                                <button onClick={() => alert('Webhook copied (Demo Only)')} className="w-full bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-900 rounded-xl py-3.5 text-sm font-bold transition-all flex justify-center items-center gap-2 active:scale-[0.98]">
                                    Copy Payload URL
                                </button>
                            </motion.div>
                        </aside>

                        <motion.main variants={itemVariants} className="lg:col-span-8 bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-7 border-b border-zinc-100 bg-zinc-50/50">
                                <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-900 flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-zinc-400" /> Transaction Ledger
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-50/50 text-zinc-400 text-[10px] uppercase tracking-widest font-bold border-b border-zinc-100">
                                        <tr>
                                            <th className="px-7 py-5">Network ID</th>
                                            <th className="px-7 py-5">Contested</th>
                                            <th className="px-7 py-5">Resolution</th>
                                            <th className="px-7 py-5 text-right">Dossier</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {MOCK_DISPUTES.map((d) => (
                                            <motion.tr variants={itemVariants} key={d.id} className="hover:bg-zinc-50/80 transition-colors">
                                                <td className="px-7 py-5 font-mono text-zinc-500 text-xs">{d.stripeId}</td>
                                                <td className="px-7 py-5 font-bold text-zinc-900">${(d.payment.amount / 100).toLocaleString()}</td>
                                                <td className="px-7 py-5">
                                                    <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${d.status === 'WON' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'}`}>
                                                        {d.status}
                                                    </span>
                                                </td>
                                                <td className="px-7 py-5 text-right">
                                                    {d.evidencePdfUrl ? (
                                                        <button onClick={() => alert('Exporting simulated dossier...')} className="text-zinc-900 hover:text-blue-600 flex items-center gap-2 ml-auto text-xs font-bold transition-colors">
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
                            </div>
                        </motion.main>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
