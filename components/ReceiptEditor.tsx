"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, FileCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import Link from 'next/link';
import { numberToWordsEnglish, numberToWordsMarathi } from '@/lib/utils';

interface ReceiptEditorProps {
  initialData?: any;
  formId?: string;
}

export default function ReceiptEditor({ initialData, formId }: ReceiptEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [language, setLanguage] = useState<'MR' | 'EN'>(initialData?.language || 'MR');

  const [formData, setFormData] = useState(initialData?.formData || {
    name: '',
    details: '',
    paymentType: '',
    paymentMode: '',
    paymentModeNumber: '',
    bank: '',
    branch: '',
    chequeDate: '',
    amountWords: '',
    amount: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    
    if (name === 'amount') {
      const amt = parseFloat(value.replace(/,/g, ''));
      if (!isNaN(amt) && amt > 0) {
        updated.amountWords = language === 'MR' ? numberToWordsMarathi(amt) : numberToWordsEnglish(amt);
      }
    }
    
    setFormData(updated);
  };

  const handleSubmit = async (status: 'DRAFT' | 'SAVED') => {
    if (status === 'SAVED') setLoading(true);
    else setSavingDraft(true);

    try {
      const payload = {
        formType: 'RECEIPT',
        language,
        formData,
        status
      };

      if (formId) {
        await api.put(`/forms/${formId}`, payload);
      } else {
        await api.post('/forms', payload);
      }

      toast.add({ title: 'Success', description: language === 'MR' ? 'पावती सेव्ह झाली.' : 'Receipt saved successfully.', type: 'success' });
      router.push('/dashboard/forms');
    } catch (error) {
      toast.add({ title: 'Error', description: language === 'MR' ? 'पावती सेव्ह करता आली नाही.' : 'Failed to save receipt.', type: 'error' });
    } finally {
      setLoading(false);
      setSavingDraft(false);
    }
  };

  const t = language === 'MR' ? {
    title: 'पावती (Receipt)',
    subtitle: 'महालक्ष्मी डेव्हलपर्स — वेदांत पार्क',
    receiptInfo: 'पावती माहिती',
    name: 'नाव (Name)',
    details: 'तपशिल (Details)',
    paymentInfo: 'पेमेंट माहिती',
    paymentType: 'पेमेंट प्रकार (Payment Type)',
    paymentModeNumber: 'रोख / चेक / UTR नं.',
    bank: 'बँक (Bank)',
    branch: 'शाखा (Branch)',
    chequeDate: 'चेक दिनांक (Cheque Date)',
    amountSection: 'रक्कम (Amount)',
    amountWords: 'अक्षरी रु. (Amount in Words)',
    amount: 'रक्कम ₹ (Amount)',
    saveDraft: 'मसुदा जतन करा',
    saveComplete: 'पावती सेव्ह करा',
  } : {
    title: 'Receipt',
    subtitle: 'Mahalaxmi Developers — Vedant Park',
    receiptInfo: 'Receipt Information',
    name: 'Name',
    details: 'Details',
    paymentInfo: 'Payment Information',
    paymentType: 'Payment Type',
    paymentModeNumber: 'Cheque / UTR No.',
    bank: 'Bank',
    branch: 'Branch',
    chequeDate: 'Cheque Date',
    amountSection: 'Amount',
    amountWords: 'Amount in Words',
    amount: 'Amount ₹',
    saveDraft: 'Save as Draft',
    saveComplete: 'Save & Complete',
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-[family-name:var(--font-marathi)]">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">{t.title}</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          {/* Language Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 sm:p-1 gap-1">
            <button
              onClick={() => setLanguage('MR')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${language === 'MR' ? 'bg-amber-500 text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              मराठी
            </button>
            <button
              onClick={() => setLanguage('EN')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${language === 'EN' ? 'bg-blue-500 text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              English
            </button>
          </div>
          <Button variant="outline" onClick={() => handleSubmit('DRAFT')} disabled={savingDraft || loading} className="flex-1 sm:flex-none dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 text-xs sm:text-sm">
            {savingDraft ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
            {t.saveDraft}
          </Button>
          <Button onClick={() => handleSubmit('SAVED')} disabled={savingDraft || loading} className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-emerald-700 text-white hover:from-emerald-600 hover:to-emerald-800 text-xs sm:text-sm">
            {loading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <FileCheck className="w-4 h-4 mr-1.5" />}
            {t.saveComplete}
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-3 sm:p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-base sm:text-lg text-slate-700 dark:text-slate-200 border-b dark:border-slate-700 pb-2">{t.receiptInfo}</h3>
            <div className="grid gap-3 sm:gap-4 grid-cols-1">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">{t.name}</Label>
                <Input name="name" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">{t.details}</Label>
                <Input name="details" value={formData.details} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Amount Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base sm:text-lg text-slate-700 dark:text-slate-200 border-b dark:border-slate-700 pb-2">{t.amountSection}</h3>
            <div className="grid gap-3 sm:gap-4 grid-cols-1">
              <div className="space-y-2">
                <Label className="text-red-600 dark:text-red-400 font-bold text-xs sm:text-sm">{t.amount}</Label>
                <Input name="amount" value={formData.amount} onChange={handleInputChange} className="border-red-200 dark:border-red-900 focus-visible:ring-red-300 text-base sm:text-lg font-bold" placeholder="₹" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">{t.amountWords}</Label>
                <Input name="amountWords" value={formData.amountWords} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base sm:text-lg text-slate-700 dark:text-slate-200 border-b dark:border-slate-700 pb-2">{t.paymentInfo}</h3>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs sm:text-sm">{t.paymentType}</Label>
                <Select value={formData.paymentType} onValueChange={(val) => setFormData({...formData, paymentType: val})}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash (रोख)</SelectItem>
                    <SelectItem value="Cheque">Cheque (चेक)</SelectItem>
                    <SelectItem value="Online">Online / UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Online / UPI fields */}
              {formData.paymentType === 'Online' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">{language === 'MR' ? 'UPI आयडी' : 'UPI ID'}</Label>
                    <Input name="paymentModeNumber" value={formData.paymentModeNumber || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">{language === 'MR' ? 'युजरनेम' : 'Username'}</Label>
                    <Input name="bank" value={formData.bank || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs sm:text-sm">{language === 'MR' ? 'रिफरन्स' : 'Reference'}</Label>
                    <Input name="branch" value={formData.branch || ''} onChange={handleInputChange} />
                  </div>
                </>
              )}

              {/* Cheque fields */}
              {formData.paymentType === 'Cheque' && (
                <>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs sm:text-sm">{language === 'MR' ? 'चेक / RTGS / UTR नं.' : 'Cheque / RTGS / UTR No.'}</Label>
                    <Input name="paymentModeNumber" value={formData.paymentModeNumber} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">{t.bank}</Label>
                    <Input name="bank" value={formData.bank} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">{t.branch}</Label>
                    <Input name="branch" value={formData.branch} onChange={handleInputChange} />
                  </div>
                </>
              )}
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Remark */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base sm:text-lg text-slate-700 dark:text-slate-200 border-b dark:border-slate-700 pb-2">{language === 'MR' ? 'रिमार्क / तपशील' : 'Remark / Details'}</h3>
            <div className="space-y-2">
              <Input name="remark" value={formData.remark || ''} onChange={handleInputChange} placeholder={language === 'MR' ? 'रिमार्क लिहा...' : 'Enter remark...'} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
