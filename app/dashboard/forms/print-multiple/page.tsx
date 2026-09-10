"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
// We'll import the preview components directly if they were exported, but since they are in page.tsx as non-exported, 
// we will just copy the renderer or rebuild them. Actually, it's better to fetch the HTML or build them here.
// But to keep it simple, let's just render standard simplified versions or copy the code.
// Wait, I can just fetch all the forms and render them sequentially using a component.

export default function PrintMultiplePage() {
  const searchParams = useSearchParams();
  const ids = searchParams.get('ids');
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      if (!ids) return;
      try {
        const idArray = ids.split(',');
        const fetched = [];
        for (const id of idArray) {
          const res = await api.get(`/forms/${id}`);
          fetched.push(res.data.form);
        }
        setForms(fetched);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, [ids]);

  useEffect(() => {
    if (!loading && forms.length > 0) {
      setTimeout(() => window.print(), 1000);
    }
  }, [loading, forms]);

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin w-8 h-8 mx-auto" /></div>;

  return (
    <div className="print-multiple-container">
      {forms.map((form, idx) => (
        <div key={form._id} style={{ pageBreakAfter: idx < forms.length - 1 ? 'always' : 'auto' }}>
           {/* Rendering via an iframe to the preview page is one hack, or we can just redirect to a merged PDF on backend.
               Since we need it now, let's render an iframe that automatically prints. Or better: Just render the component. */}
           <iframe src={`/dashboard/forms/${form._id}/preview`} style={{ width: '100%', height: '100vh', border: 'none' }} />
        </div>
      ))}
    </div>
  );
}
