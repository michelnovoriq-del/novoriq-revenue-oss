import { redirect } from 'next/navigation';

export default function RootPage() {
  // Automatically redirect all root traffic to the login portal
  redirect('/login');
}
