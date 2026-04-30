import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Novoriq Revenue OS',
  description: 'Intelligent Chargeback Recovery Engine',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}
