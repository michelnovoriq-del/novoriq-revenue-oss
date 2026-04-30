#!/bin/bash

echo "[🚀] Initiating Day 25: Legal Armor (Terms & Privacy)..."

mkdir -p src/app/terms
mkdir -p src/app/privacy

# 1. Build the Terms and Conditions Page
cat << 'CODE' > src/app/terms/page.tsx
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 py-12 px-6">
            <div className="max-w-4xl mx-auto bg-slate-800 p-10 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-700 pb-6">
                    <Shield className="w-10 h-10 text-blue-500" />
                    <h1 className="text-3xl font-bold text-white">Terms and Conditions</h1>
                </div>
                
                <div className="space-y-6 text-sm leading-relaxed">
                    <p><strong>Last Updated:</strong> April 2026</p>
                    
                    <h2 className="text-xl font-semibold text-white mt-8">1. Acceptance of Terms</h2>
                    <p>By accessing and using Novoriq OS ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you are prohibited from using the Service.</p>

                    <h2 className="text-xl font-semibold text-white mt-8">2. Description of Service</h2>
                    <p>Novoriq OS provides automated chargeback defense and evidence generation software for merchants. The Service integrates with your Stripe account to ingest transaction data and compile Compelling Evidence documents. We do not guarantee the successful reversal of any individual chargeback.</p>

                    <h2 className="text-xl font-semibold text-white mt-8">3. User Obligations & API Keys</h2>
                    <p>You are responsible for maintaining the confidentiality of your account credentials and Stripe API Secret Keys. You grant Novoriq OS permission to access your Stripe data securely for the sole purpose of tracking disputes and generating evidence on your behalf.</p>

                    <h2 className="text-xl font-semibold text-white mt-8">4. Billing & Performance Fees</h2>
                    <p>Subscriptions are managed via third-party processors (e.g., Whop). In addition to subscription fees, you agree to the dynamic Performance Fee percentage applied to the monetary value of successfully recovered disputes, as dictated by your active subscription tier.</p>

                    <h2 className="text-xl font-semibold text-white mt-8">5. Limitation of Liability</h2>
                    <p>In no event shall Novoriq OS be liable for any indirect, incidental, special, or consequential damages, including loss of profits, revenue, or data, arising from your use of the Service or the failure to win a chargeback dispute.</p>

                    <h2 className="text-xl font-semibold text-white mt-8">6. Termination</h2>
                    <p>We reserve the right to suspend or terminate your access to the Service at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users of the Service, us, or third parties.</p>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-700 flex justify-center">
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Return to Login</Link>
                </div>
            </div>
        </div>
    );
}
CODE

# 2. Build the Privacy Policy Page
cat << 'CODE' > src/app/privacy/page.tsx
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 py-12 px-6">
            <div className="max-w-4xl mx-auto bg-slate-800 p-10 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-700 pb-6">
                    <Shield className="w-10 h-10 text-emerald-500" />
                    <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
                </div>
                
                <div className="space-y-6 text-sm leading-relaxed">
                    <p><strong>Last Updated:</strong> April 2026</p>
                    
                    <h2 className="text-xl font-semibold text-white mt-8">1. Information We Collect</h2>
                    <p><strong>Account Information:</strong> We collect your email address, organization name, and billing details when you register.<br/>
                    <strong>Transaction Data:</strong> Through our Stripe integration, we securely ingest data relating to your customers' transactions, including names, billing addresses, and dispute histories.<br/>
                    <strong>Tracking Data:</strong> If utilizing our tracking scripts, we collect end-user IP addresses, generalized geolocation, and device fingerprints to assist in fraud prevention.</p>

                    <h2 className="text-xl font-semibold text-white mt-8">2. How We Use Your Information</h2>
                    <p>The data we collect is used strictly to provide the Novoriq OS service. Specifically, customer transaction and tracking data are used solely to compile "Compelling Evidence" PDF documents to submit to financial institutions during a chargeback dispute.</p>

                    <h2 className="text-xl font-semibold text-white mt-8">3. Data Security & Encryption</h2>
                    <p>We implement industry-standard AES-256 encryption to protect sensitive data, including your Stripe API Secret Keys. We do not sell, rent, or share your merchant data or your customers' data with third-party marketers.</p>

                    <h2 className="text-xl font-semibold text-white mt-8">4. Third-Party Service Providers</h2>
                    <p>We may share necessary data with trusted third parties solely to operate our service. This includes payment processors (Whop) and geolocation APIs (ipapi). These providers are bound by strict confidentiality agreements.</p>

                    <h2 className="text-xl font-semibold text-white mt-8">5. Data Retention</h2>
                    <p>We retain your data only for as long as necessary to provide the Service and fulfill the purposes outlined in this policy. Upon account termination, you may request the deletion of your organizational data.</p>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-700 flex justify-center">
                    <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Return to Login</Link>
                </div>
            </div>
        </div>
    );
}
CODE

# 3. Add Legal Links to the Login Page Footer
cat << 'CODE' > src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';

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
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8 mb-6">
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
            
            {/* Legal Footer */}
            <div className="text-slate-500 text-xs flex gap-4">
                <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms & Conditions</Link>
                <span>|</span>
                <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            </div>
        </div>
    );
}
CODE

echo "[✅] Legal Pages Built & Linked. Restarting Next.js frontend..."
npm run dev
