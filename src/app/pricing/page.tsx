"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, FileText, Lock, Cpu, Zap, ChevronRight } from 'lucide-react';

type NovoriqTokenPayload = {
    organizationId?: string;
    userId?: string;
    id?: string;
};

export default function PricingPage() {
    const router = useRouter();
    const [orgId, setOrgId] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('novoriq_token');
        if (!token) return router.push('/login');
        try {
            // Fixed: typed decoded JWT payload and deferred state sync to avoid hook lint cascades.
            const decoded = jwtDecode<NovoriqTokenPayload>(token);
            queueMicrotask(() => {
                setOrgId(decoded.organizationId || '');
                setUserId(decoded.userId || decoded.id || '');
            });
        } catch { router.push('/login'); }
    }, [router]);

    // DOUBLE METADATA INJECTION (Unchanged)
    const whopBaseParams = `?metadata[organizationId]=${orgId}&metadata[userId]=${userId}`;
    const links = {
        tier1: `https://whop.com/checkout/plan_pJpWvIqcYCRvV${whopBaseParams}`,
        tier2: `https://whop.com/checkout/plan_rE4Rj9g9t8RNH${whopBaseParams}`,
        tier3: `https://whop.com/checkout/plan_My5qZYNCRlcgr${whopBaseParams}`
    };

    const tiers = [
        {
            id: '01',
            name: 'STARTER_NODE',
            price: '199',
            pdfs: '50_PACKETS',
            fee: '10.0%',
            link: links.tier1,
            highlight: false,
        },
        {
            id: '02',
            name: 'PRO_NEXUS',
            price: '399',
            pdfs: '80_PACKETS',
            fee: '5.0%',
            extra: 'GOLDEN_TRIO_ALGO',
            link: links.tier2,
            highlight: true,
        },
        {
            id: '03',
            name: 'APEX_CORE',
            price: '799',
            pdfs: '120_PACKETS',
            fee: '3.5%',
            link: links.tier3,
            highlight: false,
        }
    ];

    return (
        <div className="min-h-screen bg-obsidian text-slate-300 font-mono flex flex-col items-center justify-center p-4 overflow-hidden relative">
            {/* Hypnotic Background Grid */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(to_right,#1a3a2f_1px,transparent_1px),linear-gradient(to_bottom,#1a3a2f_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            <motion.div 
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-jade-muted rounded-full blur-[150px] pointer-events-none mix-blend-screen"
            />

            <div className="z-10 w-full max-w-6xl">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16 space-y-4"
                >
                    <div className="inline-flex items-center justify-center border border-red-900 bg-red-950/30 p-4 mb-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-red-500/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        <Lock className="w-8 h-8 text-red-500 animate-pulse" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-white uppercase">
                        Protocol_Lock <span className="text-red-500">Engaged</span>
                    </h1>
                    <p className="text-xs md:text-sm text-jade-muted tracking-[0.2em] uppercase max-w-2xl mx-auto leading-relaxed">
                        Trial phase concluded. Automated defense systems are currently suspended. 
                        Select an operational tier below to re-engage your revenue recovery engine.
                    </p>
                </motion.div>
                
                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {tiers.map((tier, idx) => (
                        <motion.div 
                            key={tier.id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.15, type: "spring", stiffness: 100 }}
                            className={`relative bg-jade-deep/60 backdrop-blur-md border ${
                                tier.highlight ? 'border-white/50 shadow-[0_0_30px_rgba(45,90,76,0.3)]' : 'border-jade-line hover:border-jade-muted'
                            } p-8 transition-colors duration-500 group flex flex-col h-full`}
                        >
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-jade-muted" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-jade-muted" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-jade-muted" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-jade-muted" />

                            {tier.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 text-[9px] font-bold tracking-[0.3em] uppercase">
                                    Optimal_Config
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-8 border-b border-jade-line pb-6">
                                <div>
                                    <span className="text-[10px] text-jade-muted tracking-[0.3em] mb-1 block">TIER_{tier.id}</span>
                                    <h3 className="text-xl font-bold text-white tracking-tighter uppercase">{tier.name}</h3>
                                </div>
                                {tier.highlight ? <Zap className="w-6 h-6 text-white" /> : <Cpu className="w-6 h-6 text-jade-muted" />}
                            </div>

                            <div className="mb-8">
                                <div className="text-4xl font-bold text-white tracking-tighter flex items-end gap-2">
                                    ${tier.price} <span className="text-[10px] text-jade-muted tracking-widest font-normal uppercase mb-1">/ CYCLE</span>
                                </div>
                            </div>

                            <ul className="space-y-5 mb-10 flex-grow">
                                <li className="flex items-center gap-3 text-[11px] tracking-widest uppercase">
                                    <FileText className="w-4 h-4 text-jade-muted" />
                                    <span className="text-slate-300">Volume: <span className="text-white font-bold">{tier.pdfs}</span></span>
                                </li>
                                <li className="flex items-center gap-3 text-[11px] tracking-widest uppercase">
                                    <Activity className="w-4 h-4 text-jade-muted" />
                                    <span className="text-slate-300">Compute_Fee: <span className="text-white font-bold">{tier.fee}</span></span>
                                </li>
                                {tier.extra && (
                                    <li className="flex items-center gap-3 text-[11px] tracking-widest uppercase">
                                        <ShieldCheck className="w-4 h-4 text-white" />
                                        <span className="text-white font-bold drop-shadow-md">{tier.extra}</span>
                                    </li>
                                )}
                            </ul>

                            <a 
                                href={tier.link}
                                className={`w-full py-4 text-[10px] font-bold tracking-[0.3em] uppercase flex items-center justify-center gap-2 transition-all duration-300 ${
                                    tier.highlight 
                                        ? 'bg-white text-black hover:bg-slate-200' 
                                        : 'bg-transparent border border-jade-muted text-jade-muted hover:bg-jade-muted hover:text-obsidian'
                                }`}
                            >
                                INITIALIZE_{tier.name}
                                <ChevronRight className="w-4 h-4" />
                            </a>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center text-[10px] text-jade-line tracking-[0.3em] uppercase">
                    Encrypted Connection • Whop Authenticated
                </div>
            </div>
        </div>
    );
}
