#!/bin/bash

echo "[🔧] Engineering correction: Routing root traffic to Authentication..."

# Overwrite the default Next.js page.tsx with a server-side redirect
cat << 'CODE' > src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Automatically redirect all root traffic to the login portal
  redirect('/login');
}
CODE

echo "[✅] Root redirection applied. The default Next.js screen is gone."
