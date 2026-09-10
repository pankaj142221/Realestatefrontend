"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, FileCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { numberToWordsEnglish, numberToWordsMarathi } from '@/lib/utils';
import api from '@/lib/api';
import Link from 'next/link';

interface FormEditorProps {
  language: 'EN' | 'MR';
  initialData?: any;
  formId?: string;
}

export default function FormEditor({ language, initialData, formId }: FormEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  
  const [formData, setFormData] = useState(initialData?.formData || {
    customerName: '',
    customerAddress: '',
    whatsappNo: '',
    alternateNumber: '',
    aadharNo: '',
    panNo: '',
    siteName: '',
    gatNo: '',
    area: '',
    plotNo: '',
    sqFt: '',
    registrationAmountText: '',
    totalPlotAmount: '',
    bookingAmount: '',
    bookingAmountWords: '',
    paymentType: '',
    bankName: '',
    chequeUtrUpiNumber: '',
    branch: '',
    upiId: '',
    username: '',
    remainingAmount: '',
    payments: [],
    reference: '',
  });

  const labels = {
    EN: {
      title: 'Customer Information Form',
      customerName: 'Customer Name',
      customerAddress: 'Customer Full Address',
      whatsappNo: 'WhatsApp No.',
      alternateNumber: 'Alternate Number',
      aadharNo: 'Aadhar Card No.',
      panNo: 'PAN Card No.',
      siteSection: 'Site Details',
      siteName: 'Site Name',
      gatNo: 'Gat No.',
      area: 'Area',
      plotNo: 'Plot No.',
      sqFt: 'Sq. Ft.',
      registrationAmountText: 'Registration Amount Details',
      totalPlotAmount: 'Total  Amount',
      paymentInfo: 'Payment Information',
      bookingAmount: 'Booking Amount',
      bookingAmountWords: 'Booking Amount (in words)',
      paymentType: 'Payment Type',
      bankName: 'Bank',
      chequeUtrUpiNumber: 'Cheque/UTR/UPI Number',
      remainingAmount: 'Remaining Amount',
      branch: 'Branch',
      paymentsTable: 'Payment Schedule',
      date: 'Date',
      amount: 'Amount',
      remark: 'Remark',
      reference: 'Reference',
      saveDraft: 'Save Draft',
      saveForm: 'Save & Complete'
    },
    MR: {
      title: 'आनंदी ग्राहकाची माहिती',
      subtitle: 'वेदांत पार्क — महालक्ष्मी डेव्हलपर्स',
      customerName: 'ग्राहकाचे नाव',
      customerAddress: 'ग्राहकाचा संपूर्ण पत्ता',
      whatsappNo: 'व्हॉट्सॲप नंबर',
      alternateNumber: 'पर्यायी नंबर',
      aadharNo: 'आधार कार्ड नं.',
      panNo: 'पॅन कार्ड नं.',
      siteSection: 'साईट तपशील',
      siteName: 'साईट चे नाव',
      gatNo: 'गट नं.',
      area: 'क्षेत्र',
      plotNo: 'प्लॉट नं.',
      sqFt: 'स्क्वे. फुट',
      registrationAmountText: 'खरेदीखताची रक्कम : ग्राहकाकडे राहील.',
      totalPlotAmount: 'एकूण प्लॉट रक्कम',
      paymentInfo: 'पेमेंटची माहिती',
      bookingAmount: 'बुकिंग रक्कम',
      bookingAmountWords: 'बुकिंग रक्कम अक्षरी',
      paymentType: 'पेमेंटचा प्रकार',
      bankName: 'बँक',
      chequeUtrUpiNumber: 'चेक / UTR / UPI नंबर',
      remainingAmount: 'उर्वरित रक्कम',
      branch: 'शाखा',
      paymentsTable: 'पेमेंट तपशील',
      date: 'दिनांक',
      amount: 'रक्कम',
      remark: 'रिमार्क',
      reference: 'रेफरन्स',
      saveDraft: 'मसुदा जतन करा',
      saveForm: 'फॉर्म सेव्ह करा'
    }
  };

  const t = labels[language];
  const fontClass = language === 'MR' ? 'font-[family-name:var(--font-marathi)]' : '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    // Auto calculate words when bookingAmount changes
    if (name === 'bookingAmount') {
      const amt = parseFloat(value);
      if (!isNaN(amt) && amt > 0) {
        updated.bookingAmountWords = language === 'MR' ? numberToWordsMarathi(amt) : numberToWordsEnglish(amt);
      }
    }

    // Auto calculate Remaining Amount: Total - Booking - Registration - Any Initial Payments
    if (name === 'totalPlotAmount' || name === 'bookingAmount' || name === 'registrationAmountText' || name === 'registrationAmount') {
      const total = parseFloat(name === 'totalPlotAmount' ? value : updated.totalPlotAmount) || 0;
      const booking = parseFloat(name === 'bookingAmount' ? value : updated.bookingAmount) || 0;
      
      const regRaw = (name === 'registrationAmountText' || name === 'registrationAmount') ? value : (updated.registrationAmount || updated.registrationAmountText);
      const regNumber = typeof regRaw === 'number' ? regRaw : (parseFloat(String(regRaw || '').replace(/[^0-9.]/g, '')) || 0);

      let paid = 0;
      if (updated.payments && Array.isArray(updated.payments)) {
        updated.payments.forEach((p: any) => {
          if (p.status === 'PAID' || p.receiptId) {
            const amt = parseFloat(p.amount) || 0;
            if (amt > 0) paid += amt;
          }
        });
      }

      if (total > 0) {
        const remaining = Math.max(0, total - booking - regNumber - paid);
        updated.remainingAmount = remaining.toString();
      }
    }

    setFormData(updated);
  };

  const handlePaymentChange = (index: number, field: string, value: string) => {
    const newPayments = [...formData.payments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    setFormData({ ...formData, payments: newPayments });
  };

  const handleSubmit = async (status: 'DRAFT' | 'SAVED') => {
    if (status === 'SAVED') setLoading(true);
    else setSavingDraft(true);

    try {
      const cleanPayments = (formData.payments || [])
        .filter((p: any) => p.date || p.amount || p.type || p.remark)
        .map((p: any) => ({
          ...p,
          status: p.status || 'SCHEDULED'
        }));
      const payload = {
        formType: 'CUSTOMER_INFO',
        language,
        formData: {
          ...formData,
          payments: cleanPayments
        },
        status
      };

      if (formId) {
        await api.put(`/forms/${formId}`, payload);
      } else {
        await api.post('/forms', payload);
      }

      toast.add({ title: 'Success', description: `Form ${status === 'DRAFT' ? 'draft saved' : 'saved'} successfully.`, type: 'success' });
      router.push('/dashboard/forms');
    } catch (error) {
      toast.add({ title: 'Error', description: 'Failed to save form.', type: 'error' });
    } finally {
      setLoading(false);
      setSavingDraft(false);
    }
  };

  return (
    <div className={`space-y-4 sm:space-y-6 ${fontClass}`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">{t.title}</h1>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button variant="outline" onClick={() => handleSubmit('DRAFT')} disabled={savingDraft || loading} className="flex-1 sm:flex-none dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 text-xs sm:text-sm">
            {savingDraft ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
            {t.saveDraft}
          </Button>
          <Button onClick={() => handleSubmit('SAVED')} disabled={savingDraft || loading} className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-emerald-700 text-white hover:from-emerald-600 hover:to-emerald-800 text-xs sm:text-sm">
            {loading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <FileCheck className="w-4 h-4 mr-1.5" />}
            {t.saveForm}
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-3 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          
          {/* Customer Information Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base sm:text-lg text-slate-700 dark:text-slate-200 border-b dark:border-slate-700 pb-2">{language === 'MR' ? 'ग्राहक माहिती' : 'Customer Information'}</h3>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs sm:text-sm">{t.customerName}</Label>
                <Input name="customerName" value={formData.customerName} onChange={handleInputChange} className={fontClass} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs sm:text-sm">{t.customerAddress}</Label>
                <Input name="customerAddress" value={formData.customerAddress} onChange={handleInputChange} className={fontClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 sm:col-span-2">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">{t.whatsappNo}</Label>
                  <Input name="whatsappNo" value={formData.whatsappNo} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">{t.alternateNumber}</Label>
                  <Input name="alternateNumber" value={formData.alternateNumber} onChange={handleInputChange} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 sm:col-span-2">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">{t.aadharNo}</Label>
                  <Input name="aadharNo" value={formData.aadharNo || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">{t.panNo}</Label>
                  <Input name="panNo" value={formData.panNo || ''} onChange={handleInputChange} />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Site Details Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base sm:text-lg text-slate-700 dark:text-slate-200 border-b dark:border-slate-700 pb-2">{t.siteSection}</h3>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs sm:text-sm">{t.siteName}</Label>
                <Input name="siteName" value={formData.siteName || ''} onChange={handleInputChange} className={fontClass} placeholder="Ex :- Vedant Park" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">{t.gatNo}</Label>
                <Input name="gatNo" value={formData.gatNo} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">{t.area}</Label>
                <Input name="area" value={formData.area} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">{t.plotNo}</Label>
                <Input name="plotNo" value={formData.plotNo} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">{t.sqFt}</Label>
                <Input name="sqFt" value={formData.sqFt} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Payment Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base sm:text-lg text-slate-700 dark:text-slate-200 border-b dark:border-slate-700 pb-2">{t.paymentInfo}</h3>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs sm:text-sm">{t.paymentType}</Label>
                <Select onValueChange={(val) => setFormData({ ...formData, paymentType: val })} value={formData.paymentType || ''}>
                  <SelectTrigger><SelectValue placeholder={language === 'MR' ? 'निवडा' : 'Select type'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash (रोख)</SelectItem>
                    <SelectItem value="Cheque">Cheque (चेक)</SelectItem>
                    <SelectItem value="Online/UTR">Online / UTR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional fields based on payment type */}
              {formData.paymentType === 'Online/UTR' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">{language === 'MR' ? 'UPI आयडी' : 'UPI ID'}</Label>
                    <Input name="upiId" value={formData.upiId || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">{language === 'MR' ? 'युजरनेम' : 'Username'}</Label>
                    <Input name="username" value={formData.username || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs sm:text-sm">{language === 'MR' ? 'रिफरन्स' : 'Reference'}</Label>
                    <Input name="chequeUtrUpiNumber" value={formData.chequeUtrUpiNumber || ''} onChange={handleInputChange} />
                  </div>
                </>
              )}

              {formData.paymentType === 'Cheque' && (
                <>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs sm:text-sm">{language === 'MR' ? 'चेक / RTGS / UTR नं.' : 'Cheque / RTGS / UTR No.'}</Label>
                    <Input name="chequeUtrUpiNumber" value={formData.chequeUtrUpiNumber} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">{t.bankName}</Label>
                    <Input name="bankName" value={formData.bankName} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">{t.branch}</Label>
                    <Input name="branch" value={formData.branch} onChange={handleInputChange} />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">{t.bookingAmount}</Label>
                <Input name="bookingAmount" value={formData.bookingAmount} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">{t.bookingAmountWords}</Label>
                <Input name="bookingAmountWords" value={formData.bookingAmountWords} onChange={handleInputChange} className={fontClass} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs sm:text-sm">{t.registrationAmountText}</Label>
                <Input name="registrationAmountText" value={formData.registrationAmountText} onChange={handleInputChange} className={fontClass} />
              </div>

              <div className="space-y-2">
                <Label className="text-red-600 dark:text-red-400 font-bold text-sm sm:text-base">{t.totalPlotAmount}</Label>
                <Input name="totalPlotAmount" value={formData.totalPlotAmount} onChange={handleInputChange} className="border-red-200 dark:border-red-900 focus-visible:ring-red-300 dark:focus-visible:ring-red-700 bg-red-50/50 dark:bg-red-900/10 text-base sm:text-lg font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-red-600 dark:text-red-400 font-bold text-sm sm:text-base">{t.remainingAmount}</Label>
                <Input name="remainingAmount" value={formData.remainingAmount} onChange={handleInputChange} className="border-red-200 dark:border-red-900 focus-visible:ring-red-300 dark:focus-visible:ring-red-700 bg-red-50/50 dark:bg-red-900/10 text-base sm:text-lg font-bold" />
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Payment Details Table */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base sm:text-lg text-slate-700 dark:text-slate-200 border-b dark:border-slate-700 pb-2">{t.paymentsTable}</h3>
            <div className="overflow-x-auto w-full rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="min-w-[520px] bg-white dark:bg-slate-900">
                <div className="grid grid-cols-4 bg-slate-100 dark:bg-slate-800 p-2.5 font-semibold text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <div>{t.date}</div>
                  <div>{t.amount}</div>
                  <div>{t.paymentType}</div>
                  <div>{t.remark}</div>
                </div>
                {formData.payments.map((p: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-4 border-t border-slate-200 dark:border-slate-800">
                    <Input type="date" className="border-0 rounded-none h-10 text-xs sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent dark:text-slate-200" value={p.date} onChange={(e) => handlePaymentChange(idx, 'date', e.target.value)} />
                    <Input className="border-0 border-l border-slate-200 dark:border-slate-800 rounded-none h-10 text-xs sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent dark:text-slate-200" value={p.amount} onChange={(e) => handlePaymentChange(idx, 'amount', e.target.value)} placeholder="₹ 0.00" />
                    <Input className="border-0 border-l border-slate-200 dark:border-slate-800 rounded-none h-10 text-xs sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent dark:text-slate-200" value={p.type} onChange={(e) => handlePaymentChange(idx, 'type', e.target.value)} placeholder={language === 'MR' ? 'प्रकार (उदा. रोख)' : 'Type'} />
                    <Input className="border-0 border-l border-slate-200 dark:border-slate-800 rounded-none h-10 text-xs sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent dark:text-slate-200" value={p.remark} onChange={(e) => handlePaymentChange(idx, 'remark', e.target.value)} placeholder="..." />
                  </div>
                ))}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setFormData({...formData, payments: [...formData.payments, { date: '', amount: '', type: '', remark: '' }]})} className="text-xs">
              + Add Row
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">{t.reference}</Label>
            <Input name="reference" value={formData.reference} onChange={handleInputChange} className={fontClass} />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
