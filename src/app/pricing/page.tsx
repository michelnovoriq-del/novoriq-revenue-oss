"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Zap, Check, ShieldCheck, Cpu, 
  ArrowRight, Globe, Lock, Loader2 
} from 'lucide-react';
import api from '@/lib/api';

const WHOP_BUSINESS_SLUG = 'novoriq'; // Replace with your actual Whop slug if different

const PLANS = [
  {
    id: 'plan_g5k8i3tfPkASV',
    name: 'Beta Access',
    price: '$10',
    duration: 'One-time',
    fee: '0%',
    description: 'Entry-level access for early adopters and testing.',
    features: ['Simulated Environment Access', '48-Hour Trial Window', 'Manual PDF Generation', 'Standard Support'],
    highlight: false,
    cta: 'Secure Beta Access'
  },
  {
    id: 'plan_pJpWvIqcYCRvV',
    name: 'Starter',
    price: '$199',
    duration: '/mo',
    fee: '10.0%',
    description: 'Essential defense for Micro-SaaS growth.',
    features: ['Autonomous Monitoring', 'Standard Evidence Compilation', 'Up to 10 Disputes/mo', 'Protocol Fee: 10%'],
    highlight: false,
    cta: 'Deploy Starter'
  },
  {
    id: 'plan_rE4Rj9g9t8RNH',
    name: 'Professional',
    price: '$399',
    duration: '/mo',
    fee: '5.0%',
    description: 'High-volume protection for established platforms.',
    features: ['Priority Engine Access', 'Advanced Evidence Dossiers', 'Unlimited Disputes', 'Protocol Fee: 5%'],
    highlight: true,
    cta: 'Go Professional'
  },
  {
    id: 'plan_My5qZYNCRlcgr',
    name: 'Enterprise',
    price: '$799',
    duration: '/mo',
    fee: '3.5%',
    description: 'Elite autonomous ROI for 9-figure scaling.',
    features: ['Full God Mode Access', 'Programmatic Submission', 'VIP Direct Response', 'Protocol Fee: 3.5%'],
    highlight: false,
    cta: 'Scale to Enterprise'
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to grab Org ID for metadata linking
    api.get('/dashboard/metrics')
      .then(res => setOrgId(res.data.metrics.organizationId))
      .catch(() => console.warn("[Pricing] Guest session detected. Link will require manual invite key."));
  }, []);

  const handleUpgrade = (planId: string) => {
    if (!orgId) {
      router.push('/login');
      return;
    }
    setLoadingPlan(planId);
    // Deep link to Whop with the external_id for our webhook nexus
    const checkoutUrl = `https://whop.com/checkout/${planId}?external_id=${orgId}`;
    window.location.href = checkoutUrl;
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans p-6 md:p-12 selection:bg-zinc-200">
      {/* Background Ambient Gradient */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-gradient-to-b from-zinc-100/50 to-transparent pointer-events-none blur-3xl z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="text-center mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500"
          >
            <ShieldCheck className="w-3 h-3" /> Protocol Version 2.1.0
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tighter text-zinc-900"
          >
            The Revenue OS Pricing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-500 font-medium max-w-2xl mx-auto"
          >
            Select your tier of autonomous defense. Every plan includes our proprietary AES-256 vault and the automated evidence engine.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col bg-white rounded-3xl p-8 border ${
                plan.highlight ? 'border-zinc-900 ring-1 ring-zinc-900 shadow-2xl' : 'border-zinc-200 shadow-sm'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold uppercase px-4 py-1.5 rounded-full tracking-widest shadow-lg">
                  Most Deployed
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-bold tracking-tight mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tighter">{plan.price}</span>
                  <span className="text-zinc-400 text-sm font-medium">{plan.duration}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-4 font-medium leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <Cpu className="w-4 h-4 text-zinc-400" />
                  <div className="text-xs">
                    <span className="block font-bold text-zinc-900">{plan.fee} Performance Fee</span>
                    <span className="text-zinc-400 font-medium italic">On recovered revenue</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="mt-1 bg-zinc-100 p-0.5 rounded-full">
                        <Check className="w-3 h-3 text-zinc-900" />
                      </div>
                      <span className="text-xs font-medium text-zinc-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loadingPlan === plan.id}
                className={`w-full py-4 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex justify-center items-center gap-2 ${
                  plan.highlight 
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800' 
                    : 'bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                {loadingPlan === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {plan.cta} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <footer className="mt-20 text-center space-y-6">
          <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-widest">AES-256 Encrypted</span></div>
            <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-widest">Global Data Relay</span></div>
            <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-widest">Instant Provisioning</span></div>
          </div>
          <p className="text-[10px] text-zinc-400 font-medium">
            Deployments are final. Subscription tiers are billed via Whop. Protocol fees are calculated and tracked autonomously via the Transaction Ledger.
          </p>
        </footer>
      </div>
    </div>
  );
}
