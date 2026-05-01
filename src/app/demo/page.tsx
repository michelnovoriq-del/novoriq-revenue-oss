"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import api from '@/lib/api';
import { 
  Activity, ShieldCheck, Key, FileText, Download, 
  Link as LinkIcon, Cpu, Lock, Loader2, CreditCard, Sparkles, ArrowRight
} from 'lucide-react';

const LIVE_ENGINE_URL = 'https://novoriqrevenueosapi.onrender.com';

// --- BILLING CONFIGURATION ---
const TEST_PLAN_ID = 'plan_rUbJAjG7Mt0mv'; // Updated E2E Testing Plan
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

    // Get real OrgID to ensure the webhook updates the right account
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

    const handlePaymentRedirect = (planId: string, isE2E: boolean = false) => {
        if (!orgId) {
            router.push('/login');
            return;
        }
        
        // Exact routing requirement for E2E and Beta
        const checkoutUrl = isE2E 
            ? `https://whop.com/checkout/plan_rUbJAjG7Mt0mv?external_id=${orgId}`
            : `https://whop.com/checkout/${planId}?external_id=${orgId}`;
            
        window.location.href = checkoutUrl;
    };

    if (isUnlocked) {
        router.push('/dashboard');
        return null;
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans p-4 md:p-8 overflow-x-hidden relative selection:bg-zinc-200">
            
            {/* Subtle Background Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-zinc-100 to-transparent pointer-events-none opacity-50 blur-3xl z-0" />

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8 relative z-10 pb-24">
                
                {/* --- HEADER --- */}
                <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end pb-8 gap-4 border-b border-zinc-200/60">
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-100">
                            <NovoriqLogo />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-3">
                                Novoriq OS <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">Simulated Data</span>
                            </h1>
                            <p className="text-sm text-zinc-500 font-medium mt-1">Autonomous Revenue Defense & Evidence Compilation</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 bg-white shadow-sm text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        <Lock className="w-3 h-3" /> Read-Only Mode
                    </div>
                </motion.header>

                {/* --- METRICS GRID --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { label: 'Network Disputes', val: MOCK_METRICS.totalDisputes, icon: Activity },
                        { label: 'Revenue Secured', val: MOCK_METRICS.revenueRecoveredFormatted, icon: ShieldCheck },
                        { label: 'Evidence Capacity', val: MOCK_METRICS.pdfLimit, icon: FileText },
                        { label: 'Protocol Fee', val: MOCK_METRICS.currentFeeLabel, icon: Cpu },
                    ].map((m) => (
                        <motion.div variants={itemVariants} key={m.label} className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] opacity-50 pointer-events-none" />
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-xs font-bold text-zinc-500 tracking-wider uppercase">{m.label}</div>
                                <m.icon className="w-4 h-4 text-zinc-300" />
                            </div>
                            <div className="text-3xl font-extrabold text-zinc-400 tracking-tighter">{m.val}</div>
                        </motion.div>
                    ))}
                </div>

                {/* --- DASHBOARD LAYOUT --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <aside className="lg:col-span-4 space-y-6">
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-zinc-200/60 p-7 shadow-sm opacity-75 grayscale transition-all duration-500 hover:grayscale-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-zinc-100 p-2 rounded-md"><Key className="w-4 h-4 text-zinc-700" /></div>
                                <h3 className="font-bold text-sm tracking-wide text-zinc-900 uppercase">Cryptographic Vault</h3>
                            </div>
                            <p className="text-xs text-zinc-500 font-medium mb-5">Vault operations are simulated in demo mode.</p>
                            <div className="flex items-center gap-4 border border-zinc-200 p-4 bg-zinc-50 rounded-xl">
                                <div className="bg-white p-2 rounded-lg border border-zinc-200"><Lock className="w-5 h-5 text-zinc-400" /></div>
                                <div>
                                    <div className="text-sm font-bold text-zinc-400">Vault Locked</div>
                                    <div className="text-xs font-medium text-zinc-400">AES-256 Protocol</div>
                                </div>
                            </div>
                        </motion.div>
                    </aside>

                    <motion.main variants={itemVariants} className="lg:col-span-8 bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden flex flex-col opacity-90">
                        <div className="p-7 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                            <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-900 flex items-center gap-3">
                                <Activity className="w-4 h-4 text-zinc-400" /> Transaction Ledger
                            </h2>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Preview Mode</span>
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
                                        <motion.tr variants={itemVariants} key={d.id} className="hover:bg-zinc-50/50 transition-colors opacity-70">
                                            <td className="px-7 py-5 font-mono text-zinc-400 text-xs">{d.stripeId}</td>
                                            <td className="px-7 py-5 font-bold text-zinc-400">${(d.payment.amount / 100).toLocaleString()}</td>
                                            <td className="px-7 py-5">
                                                <span className="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 border border-zinc-200">
                                                    {d.status}
                                                </span>
                                            </td>
                                            <td className="px-7 py-5 text-right">
                                                <span className="text-zinc-300 text-xs font-semibold flex items-center gap-2 justify-end"><Lock className="w-3 h-3" /> Locked</span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.main>
                </div>

                {/* --- THE PREMIUM CTA BLOCK --- */}
                <motion.div variants={itemVariants} className="mt-16 bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden border border-zinc-800">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-6">
                                <Sparkles className="w-3 h-3 text-emerald-400" /> Engine Ready
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
                                Deploy the Autonomous Engine
                            </h2>
                            <p className="text-zinc-400 font-medium leading-relaxed mb-8">
                                You are currently viewing simulated data. Unlock the Novoriq OS to input your live Stripe keys, automate your webhook parsing, and start compiling evidence dossiers natively.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <button 
                                    onClick={() => handlePaymentRedirect(BETA_PLAN_ID)}
                                    className="w-full sm:w-auto bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl px-8 py-4 text-sm font-bold transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                                >
                                    <CreditCard className="w-4 h-4" /> Secure Access — $10
                                </button>
                                
                                <button 
                                    onClick={() => handlePaymentRedirect(TEST_PLAN_ID, true)}
                                    className="w-full sm:w-auto bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 rounded-xl px-8 py-4 text-sm font-bold transition-all flex justify-center items-center gap-2 active:scale-[0.98]"
                                >
                                    Run E2E Test Flow <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Master Code Fallback */}
                        <div className="w-full md:w-auto min-w-[280px] bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Elite Validation</h3>
                            <form onSubmit={handlePromoUnlock} className="space-y-3">
                                <input 
                                    type="text" 
                                    placeholder="Enter Master Code" 
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    className="w-full bg-zinc-900 border border-zinc-800 focus:bg-zinc-950 focus:border-zinc-700 text-white rounded-xl px-4 py-3 text-sm font-mono text-center outline-none transition-all placeholder:text-zinc-600"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!promoCode || isUnlocking}
                                    className="w-full bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-xl py-3 text-xs font-bold transition-all active:scale-[0.98] flex justify-center items-center"
                                >
                                    {isUnlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Code'}
                                </button>
                                {promoError && <p className="text-xs text-red-500 font-bold text-center mt-2">{promoError}</p>}
                            </form>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}