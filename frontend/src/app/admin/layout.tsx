'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isAdmin } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getToken() || !isAdmin()) {
      router.replace('/projects');
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) return null;

  return <>{children}</>;
}
