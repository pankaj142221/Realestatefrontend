"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Edit2, Loader2, Globe } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  ReceiptPreview, 
  CustomerInfoMarathiPreview, 
  CustomerInfoEnglishPreview 
} from '@/components/FormPreviews';

export default function PreviewFormPage() {
  const params = useParams();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewLang, setPreviewLang] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await api.get(`/forms/${params.id}`);
        setForm(res.data.form);
        setPreviewLang(res.data.form.language || 'MR');
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchForm();
  }, [params.id]);

  const handlePrint = async () => {
    try {
      await api.post(`/forms/${params.id}/print`);
    } catch (e) {
      // Logging silently
    }
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin text-red-600 w-8 h-8 mb-2" />
        <span className="text-xs">Loading form document...</span>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="font-bold">Form not found.</p>
        <Link href="/dashboard/forms" className="text-xs text-red-600 underline mt-2 inline-block">
          Return to saved forms
        </Link>
      </div>
    );
  }

  const d = form.formData;
  const fontClass = 'font-[family-name:var(--font-marathi)]';
  const isReceipt = form.formType === 'RECEIPT';
  const isMR = (previewLang || form.language) === 'MR';

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto w-full">
      {/* Top Responsive Action Bar (Hidden on print) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/forms">
            <Button variant="outline" size="icon" className="h-9 w-9 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 truncate">
              {isReceipt ? (isMR ? 'पावती' : 'Receipt') : (isMR ? 'ग्राहक माहिती' : 'Customer Info')} Preview
            </h1>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 block truncate">
              {form.formNumber} {d.customerName || d.name ? `• ${d.customerName || d.name}` : ''}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {!isReceipt && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPreviewLang(isMR ? 'EN' : 'MR')} 
              className="text-xs font-bold dark:border-slate-700 h-9"
            >
              <Globe className="w-3.5 h-3.5 mr-1 text-amber-500" />
              {isMR ? 'Switch to English' : 'मराठी मध्ये पहा'}
            </Button>
          )}

          <Link href={`/dashboard/forms/${form._id}/edit`}>
            <Button variant="outline" size="sm" className="text-xs font-bold dark:border-slate-700 dark:text-white h-9">
              <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Form
            </Button>
          </Link>

          <Button 
            onClick={handlePrint} 
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 shadow-md flex-1 sm:flex-none"
          >
            <Printer className="w-4 h-4 mr-1.5" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Render Document Sheets */}
      <div className="w-full">
        {isReceipt ? (
          <ReceiptPreview form={form} d={d} fontClass={fontClass} handlePrint={handlePrint} />
        ) : isMR ? (
          <CustomerInfoMarathiPreview form={form} d={d} fontClass={fontClass} handlePrint={handlePrint} previewLang={previewLang} setPreviewLang={setPreviewLang} />
        ) : (
          <CustomerInfoEnglishPreview form={form} d={d} fontClass={fontClass} handlePrint={handlePrint} previewLang={previewLang} setPreviewLang={setPreviewLang} />
        )}
      </div>
    </div>
  );
}
