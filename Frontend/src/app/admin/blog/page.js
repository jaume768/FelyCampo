'use client';

/* /admin/blog — artículos del blog y episodios del podcast de /blog, con
   los mismos datos que enseña la web (ver components/admin/AdminBlog.jsx
   y docs/ADMIN.md). Sustituye a la maqueta anterior (blogMock). */

import { Suspense } from 'react';
import AdminBlog from '@/components/admin/AdminBlog';

export default function BlogPage() {
  // Suspense: AdminBlog lee la URL (useSearchParams).
  return (
    <Suspense fallback={null}>
      <AdminBlog />
    </Suspense>
  );
}
