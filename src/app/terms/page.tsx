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
                    <p>By accessing and using Novoriq OS (&quot;the Service&quot;), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you are prohibited from using the Service.</p>

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
