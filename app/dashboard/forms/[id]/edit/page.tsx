"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import FormEditor from '@/components/FormEditor';
import ReceiptEditor from '@/components/ReceiptEditor';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function EditFormPage() {
  const params = useParams();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await api.get(`/forms/${params.id}`);
        setForm(res.data.form);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchForm();
  }, [params.id]);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>;
  }

  if (!form) return <div>Form not found.</div>;

  // Route to the correct editor based on form type
  if (form.formType === 'RECEIPT') {
    return <ReceiptEditor initialData={form} formId={form._id} />;
  }

  return <FormEditor language={form.language} initialData={form} formId={form._id} />;
}
