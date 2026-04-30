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
                    <strong>Transaction Data:</strong> Through our Stripe integration, we securely ingest data relating to your customers&apos; transactions, including names, billing addresses, and dispute histories.<br/>
                    <strong>Tracking Data:</strong> If utilizing our tracking scripts, we collect end-user IP addresses, generalized geolocation, and device fingerprints to assist in fraud prevention.</p>

                    <h2 className="text-xl font-semibold text-white mt-8">2. How We Use Your Information</h2>
                    <p>The data we collect is used strictly to provide the Novoriq OS service. Specifically, customer transaction and tracking data are used solely to compile &quot;Compelling Evidence&quot; PDF documents to submit to financial institutions during a chargeback dispute.</p>

                    <h2 className="text-xl font-semibold text-white mt-8">3. Data Security & Encryption</h2>
                    <p>We implement industry-standard AES-256 encryption to protect sensitive data, including your Stripe API Secret Keys. We do not sell, rent, or share your merchant data or your customers&apos; data with third-party marketers.</p>

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
