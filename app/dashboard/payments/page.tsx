"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Plus, Eye, Printer, Calendar, FileText, CheckCircle2, Clock, Trash2, ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { numberToWordsEnglish, numberToWordsMarathi } from '@/lib/utils';
import Link from 'next/link';
import api from '@/lib/api';

export default function PaymentsPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lang, setLang] = useState<'EN' | 'MR'>('EN');
  
  // New Payment State
  const [newPayment, setNewPayment] = useState({
    installmentLabel: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    amountWords: '',
    paymentMode: 'Cash',
    upiId: '',
    username: '',
    chequeUtrNo: '',
    bankName: '',
    branch: '',
    reference: '',
    remark: '',
    nextUpcomingDate: ''
  });

  // New Schedule State
  const [newSchedule, setNewSchedule] = useState({
    date: '',
    label: '',
    expectedAmount: ''
  });

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/forms');
      const validForms = res.data.forms.filter((f: any) => f.formType === 'CUSTOMER_INFO' && f.formData.totalPlotAmount);
      setForms(validForms);
      
      // If a form was currently selected in dialog, refresh its data
      if (selectedForm) {
        const updated = validForms.find((f: any) => f._id === selectedForm._id);
        if (updated) setSelectedForm(updated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Math & Status helper
  const isPaymentPaid = (p: any): boolean => {
    if (!p) return false;
    if (p.status === 'PAID') return true;
    if (p.receiptId) return true;
    return false;
  };

  const getTotals = (form: any) => {
    if (!form || !form.formData) return { total: 0, booking: 0, registration: 0, paidInstallments: 0, totalReceived: 0, pending: 0, paidCount: 0 };
    
    const total = parseFloat(form.formData.totalPlotAmount) || 0;
    const booking = parseFloat(form.formData.bookingAmount) || 0;
    
    const regRaw = form.formData.registrationAmount || form.formData.registrationAmountText;
    const registration = typeof regRaw === 'number' ? regRaw : (parseFloat(String(regRaw || '').replace(/[^0-9.]/g, '')) || 0);
    
    let paidInstallments = 0;
    let paidCount = 0;
    
    if (form.formData.payments && Array.isArray(form.formData.payments)) {
      form.formData.payments.forEach((p: any) => {
        if (isPaymentPaid(p)) {
          const amt = parseFloat(p.amount) || 0;
          if (amt > 0) {
            paidInstallments += amt;
            paidCount++;
          }
        }
      });
    }

    const totalReceived = booking + registration + paidInstallments;
    const pending = Math.max(0, total - totalReceived);

    return { total, booking, registration, paidInstallments, totalReceived, pending, paidCount };
  };

  const getOrdinalLabel = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    const suffix = s[(v - 20) % 10] || s[v] || s[0];
    return `${n}${suffix} Installment`;
  };

  const getOrdinalLabelMR = (n: number) => {
    const suffixes: { [key: number]: string } = {
      1: '१ ला हप्ता',
      2: '२ रा हप्ता',
      3: '३ रा हप्ता',
      4: '४ था हप्ता',
      5: '५ वा हप्ता',
      6: '६ वा हप्ता',
      7: '७ वा हप्ता',
      8: '८ वा हप्ता',
      9: '९ वा हप्ता',
      10: '१० वा हप्ता'
    };
    return suffixes[n] || `${n} वा हप्ता`;
  };

  const openAddPaymentModal = (form: any, prefillDate?: string, prefillLabel?: string, prefillAmount?: string) => {
    const { paidCount } = getTotals(form);
    const nextNum = paidCount + 1;
    const defaultLabel = prefillLabel || (lang === 'MR' ? getOrdinalLabelMR(nextNum) : getOrdinalLabel(nextNum));
    const isMR = (form.language === 'MR');
    const amtStr = prefillAmount && parseFloat(prefillAmount) > 0 ? prefillAmount : '';
    const words = amtStr && !isNaN(Number(amtStr))
      ? (isMR ? numberToWordsMarathi(amtStr) : numberToWordsEnglish(amtStr))
      : '';
    
    setSelectedForm(form);
    setNewPayment({
      installmentLabel: defaultLabel,
      date: prefillDate || new Date().toISOString().split('T')[0],
      amount: amtStr,
      amountWords: words,
      paymentMode: 'Cash',
      upiId: '',
      username: '',
      chequeUtrNo: '',
      bankName: '',
      branch: '',
      reference: form.formData.reference || '',
      remark: defaultLabel,
      nextUpcomingDate: ''
    });
    setIsPaymentDialogOpen(true);
  };

  const handleAddNewUpcomingRow = () => {
    if (!selectedForm) return;
    const { paidCount } = getTotals(selectedForm);
    const scheduledCount = (selectedForm.formData.payments || []).filter((p: any) => !isPaymentPaid(p)).length;
    const nextNum = paidCount + scheduledCount + 1;
    const defaultLabel = lang === 'MR' ? `${getOrdinalLabelMR(nextNum)} (नियोजित)` : `${getOrdinalLabel(nextNum)} (Scheduled)`;
    
    setNewSchedule({
      date: '',
      label: defaultLabel,
      expectedAmount: ''
    });
    setIsScheduleDialogOpen(true);
  };

  const handleAmountChange = (val: string) => {
    const isMR = (selectedForm?.language === 'MR');
    const words = val && !isNaN(Number(val)) 
      ? (isMR ? numberToWordsMarathi(val) : numberToWordsEnglish(val)) 
      : '';
    setNewPayment(prev => ({
      ...prev,
      amount: val,
      amountWords: words
    }));
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;

    const installmentAmt = parseFloat(newPayment.amount) || 0;
    if (installmentAmt <= 0) {
      toast.add({ title: 'Invalid Amount', description: 'Please enter a valid payment amount', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const { total, totalReceived } = getTotals(selectedForm);
      const newTotalReceived = totalReceived + installmentAmt;
      const newPending = Math.max(0, total - newTotalReceived);
      const isMR = selectedForm.language === 'MR';

      const custName = selectedForm.formData.customerName || selectedForm.formData.name || 'Customer';
      const siteName = selectedForm.formData.siteName || 'Mahalaxmi Project';
      const plotNo = selectedForm.formData.plotNo || '';

      const detailsText = isMR 
        ? `${newPayment.installmentLabel || 'हप्ता'} — ${siteName} (प्लॉट नं. ${plotNo}) | एकूण: ₹${total} | एकूण जमा: ₹${newTotalReceived} | उर्वरित: ₹${newPending}`
        : `${newPayment.installmentLabel || 'Installment'} for ${siteName} (Plot No: ${plotNo}) | Total: ₹${total} | Received: ₹${newTotalReceived} | Balance: ₹${newPending}`;

      // 1. Automatically Create Receipt Form
      const receiptRes = await api.post('/forms', {
        formType: 'RECEIPT',
        language: selectedForm.language || 'EN',
        status: 'SAVED',
        formData: {
          name: custName,
          details: detailsText,
          paymentType: newPayment.paymentMode,
          paymentModeNumber: newPayment.chequeUtrNo || newPayment.reference || '',
          upiId: newPayment.upiId,
          username: newPayment.username,
          chequeUtrUpiNumber: newPayment.chequeUtrNo,
          bank: newPayment.bankName,
          branch: newPayment.branch,
          chequeDate: newPayment.date,
          amount: newPayment.amount,
          amountWords: newPayment.amountWords || (isMR ? numberToWordsMarathi(newPayment.amount) : numberToWordsEnglish(newPayment.amount)),
          remark: newPayment.remark || newPayment.installmentLabel,
          customerFormId: selectedForm._id
        }
      });

      const createdReceipt = receiptRes.data.form;

      // 2. Prepare updated payments array for Customer Form
      const existingPayments = selectedForm.formData.payments || [];
      
      // Filter out any scheduled row that was paid (matching date, label, or id)
      const cleanedPayments = existingPayments.filter((p: any) => {
        if (!isPaymentPaid(p)) {
          const matchDate = p.date && p.date === newPayment.date;
          const matchLabel = p.remark && (p.remark === newPayment.installmentLabel || p.remark.includes(newPayment.installmentLabel));
          if (matchDate || matchLabel) return false;
        }
        return true;
      });

      const paymentEntry = {
        id: 'PAY-' + Date.now(),
        date: newPayment.date,
        amount: newPayment.amount,
        amountWords: newPayment.amountWords,
        paymentMode: newPayment.paymentMode,
        upiId: newPayment.upiId,
        username: newPayment.username,
        chequeUtrNo: newPayment.chequeUtrNo,
        bankName: newPayment.bankName,
        branch: newPayment.branch,
        reference: newPayment.reference,
        remark: newPayment.installmentLabel || newPayment.remark,
        status: 'PAID',
        receiptId: createdReceipt._id,
        receiptFormNumber: createdReceipt.formNumber
      };

      const updatedPayments = [...cleanedPayments, paymentEntry];

      // If user added next upcoming date, append as scheduled row
      if (newPayment.nextUpcomingDate) {
        const { paidCount } = getTotals(selectedForm);
        const nextUpcomingNum = paidCount + 2;
        const upcomingLabel = lang === 'MR' 
          ? `${getOrdinalLabelMR(nextUpcomingNum)} (नियोजित)` 
          : `${getOrdinalLabel(nextUpcomingNum)} (Scheduled)`;
        updatedPayments.push({
          id: 'SCHED-' + Date.now(),
          date: newPayment.nextUpcomingDate,
          amount: '',
          paymentMode: '—',
          remark: upcomingLabel,
          status: 'SCHEDULED'
        });
      }

      // 3. Update Customer Form
      const updatedFormData = {
        ...selectedForm.formData,
        payments: updatedPayments,
        remainingAmount: newPending.toString()
      };

      await api.put(`/forms/${selectedForm._id}`, {
        formData: updatedFormData,
        status: selectedForm.status || 'SAVED',
        language: selectedForm.language || 'EN',
        formType: selectedForm.formType || 'CUSTOMER_INFO'
      });

      toast.add({ 
        title: 'Payment & Receipt Created', 
        description: `Installment recorded and Receipt ${createdReceipt.formNumber} generated successfully!`, 
        type: 'success' 
      });

      setIsPaymentDialogOpen(false);
      await fetchForms();

      // Update selected form in detail modal
      setSelectedForm((prev: any) => ({
        ...prev,
        formData: updatedFormData
      }));

    } catch (error) {
      console.error('Save payment error:', error);
      toast.add({ title: 'Error', description: 'Failed to record payment', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm || !newSchedule.date) return;

    try {
      setSubmitting(true);
      const existingPayments = selectedForm.formData.payments || [];
      const scheduleEntry = {
        id: 'SCHED-' + Date.now(),
        date: newSchedule.date,
        amount: newSchedule.expectedAmount || '',
        paymentMode: 'N/A',
        remark: newSchedule.label || 'Upcoming Installment',
        status: 'SCHEDULED'
      };

      const updatedPayments = [...existingPayments, scheduleEntry];
      const updatedFormData = {
        ...selectedForm.formData,
        payments: updatedPayments
      };

      await api.put(`/forms/${selectedForm._id}`, {
        formData: updatedFormData,
        status: selectedForm.status || 'SAVED',
        language: selectedForm.language || 'EN',
        formType: selectedForm.formType || 'CUSTOMER_INFO'
      });

      toast.add({ title: 'Schedule Added', description: 'Upcoming installment date added successfully', type: 'success' });
      setIsScheduleDialogOpen(false);
      setNewSchedule({ date: '', label: '', expectedAmount: '' });
      await fetchForms();

      setSelectedForm((prev: any) => ({
        ...prev,
        formData: updatedFormData
      }));
    } catch (error) {
      toast.add({ title: 'Error', description: 'Failed to add schedule', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!selectedForm) return;
    try {
      const existingPayments = selectedForm.formData.payments || [];
      const updatedPayments = existingPayments.filter((p: any) => p.id !== scheduleId);
      const updatedFormData = { ...selectedForm.formData, payments: updatedPayments };

      await api.put(`/forms/${selectedForm._id}`, {
        formData: updatedFormData,
        status: selectedForm.status || 'SAVED',
        language: selectedForm.language || 'EN',
        formType: selectedForm.formType || 'CUSTOMER_INFO'
      });

      toast.add({ title: 'Removed', description: 'Scheduled installment removed', type: 'success' });
      await fetchForms();
      setSelectedForm((prev: any) => ({ ...prev, formData: updatedFormData }));
    } catch (error) {
      toast.add({ title: 'Error', description: 'Failed to remove schedule', type: 'error' });
    }
  };

  const handleDeletePayment = async (paymentItem: any, index: number) => {
    if (!selectedForm) return;
    try {
      const existingPayments = selectedForm.formData.payments || [];
      const updatedPayments = existingPayments.filter((p: any, idx: number) => {
        if (paymentItem.id && p.id) return p.id !== paymentItem.id;
        return idx !== index;
      });

      // Recalculate totals
      const booking = parseFloat(selectedForm.formData.bookingAmount) || 0;
      const regRaw = selectedForm.formData.registrationAmount || selectedForm.formData.registrationAmountText;
      const registration = typeof regRaw === 'number' ? regRaw : (parseFloat(String(regRaw || '').replace(/[^0-9.]/g, '')) || 0);
      const totalBudget = parseFloat(selectedForm.formData.totalPlotAmount) || 0;
      let paidInstallments = 0;
      updatedPayments.forEach((p: any) => {
        if (isPaymentPaid(p)) {
          const amt = parseFloat(p.amount) || 0;
          if (amt > 0) paidInstallments += amt;
        }
      });
      const newPending = Math.max(0, totalBudget - (booking + registration + paidInstallments));

      const updatedFormData = {
        ...selectedForm.formData,
        payments: updatedPayments,
        remainingAmount: newPending.toString()
      };

      await api.put(`/forms/${selectedForm._id}`, {
        formData: updatedFormData,
        status: selectedForm.status || 'SAVED',
        language: selectedForm.language || 'EN',
        formType: selectedForm.formType || 'CUSTOMER_INFO'
      });

      toast.add({ title: 'Payment Removed', description: 'Installment entry removed successfully', type: 'success' });
      await fetchForms();
      setSelectedForm((prev: any) => ({ ...prev, formData: updatedFormData }));
    } catch (error) {
      toast.add({ title: 'Error', description: 'Failed to remove installment', type: 'error' });
    }
  };

  const filteredForms = forms.filter((f: any) => 
    f.formNumber.toLowerCase().includes(search.toLowerCase()) ||
    (f.formData.customerName || f.formData.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.formData.siteName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1e295d] dark:text-blue-300">
            Payment Tracking & Installments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage customer installments, automatic receipts, and payment ledger
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search by Form No, Customer Name, or Site..." 
              className="pl-9 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <TableRow>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200">Form No</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200">Customer Name</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200">Site / Plot</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200">Total Budget</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200">Received Amt</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200">Pending Amt</TableHead>
                <TableHead className="text-right font-bold text-slate-700 dark:text-slate-200">Ledger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto text-[#1e295d]" />
                    <span className="text-xs text-slate-400 mt-2 block">Loading payment records...</span>
                  </TableCell>
                </TableRow>
              ) : filteredForms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-500 dark:text-slate-400">
                    No customer forms found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredForms.map((form: any) => {
                  const { total, totalReceived, pending } = getTotals(form);
                  return (
                    <TableRow 
                      key={form._id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedForm(form);
                        setLang(form.language === 'MR' ? 'MR' : 'EN');
                        setIsDetailDialogOpen(true);
                      }}
                    >
                      <TableCell className="font-bold text-[#1e295d] dark:text-blue-400">
                        {form.formNumber}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 hover:text-[#1e295d] hover:underline">
                          {form.formData.customerName || form.formData.name || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{form.formData.siteName || 'N/A'}</span>
                        {form.formData.plotNo && <span className="text-xs text-slate-500 block">Plot: {form.formData.plotNo}</span>}
                      </TableCell>
                      <TableCell className="font-extrabold text-slate-900 dark:text-slate-100">
                        ₹ {total.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹ {totalReceived.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <span className={`font-extrabold px-2.5 py-0.5 rounded-full text-xs ${
                          pending === 0 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                        }`}>
                          ₹ {pending.toLocaleString('en-IN')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="hover:bg-blue-50 text-slate-700 dark:text-slate-300 hover:text-[#1e295d]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedForm(form);
                            setLang(form.language === 'MR' ? 'MR' : 'EN');
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1 text-slate-500" /> View Ledger
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ============================================================
          CUSTOMER PAYMENT LEDGER MODAL (Clean, Professional Blue Theme)
          ============================================================ */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[780px] max-h-[92vh] overflow-y-auto p-0 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-slate-900 print:static print:top-0 print:left-0 print:translate-x-0 print:translate-y-0 print:transform-none print:w-[210mm] print:max-w-[210mm] print:p-0 print:m-0 print:border-none print:shadow-none print:bg-white print:overflow-visible">
          {selectedForm && (
            <div className="p-4 sm:p-6 print:p-0 print:m-0">
              {/* Modal Top Navigation Bar (Hidden on print) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3.5 mb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
                <div className="flex items-center gap-2.5">
                  <DialogTitle className="text-lg sm:text-xl font-black text-[#1e295d] dark:text-blue-300 truncate">
                    {lang === 'EN' ? 'Payment Ledger' : 'पेमेंट लेजर तपशील'}
                  </DialogTitle>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1e295d] dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                    {selectedForm.formNumber}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setLang(lang === 'EN' ? 'MR' : 'EN')}
                    className="text-xs h-8 flex-1 sm:flex-none border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    {lang === 'EN' ? 'मराठी (MR)' : 'English (EN)'}
                  </Button>
                  
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-[#1e295d] hover:bg-[#151c40] text-white font-bold text-xs h-8 flex-1 sm:flex-none shadow-xs"
                    onClick={() => openAddPaymentModal(selectedForm)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> {lang === 'EN' ? 'Add Installment' : 'हप्ता जमा करा'}
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs h-8 flex-1 sm:flex-none border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-[#1e295d]"
                    onClick={() => {
                      setNewSchedule({ date: '', label: '', expectedAmount: '' });
                      setIsScheduleDialogOpen(true);
                    }}
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1 text-[#1e295d]" /> {lang === 'EN' ? 'Schedule Date' : 'नियोजित तारीख'}
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.print()}
                    className="text-xs bg-slate-900 text-white hover:bg-slate-800 h-8 flex-1 sm:flex-none"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" /> {lang === 'EN' ? 'Print Ledger' : 'प्रिंट लेजर'}
                  </Button>
                </div>
              </div>

              {/* Printable Sheet Container */}
              <div id="print-area" className="print-sheet-ledger text-black flex flex-col justify-between min-h-full">
                <div className="flex-1 space-y-3 print:space-y-3">
                  {/* Header Banner on Print */}
                  <div className="hidden print:block mb-4">
                    <div className="border border-[#1e295d] rounded-lg p-3 bg-gradient-to-r from-[#1a237e] via-[#1e295d] to-[#1a237e] text-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full border-2 border-white bg-white p-1 overflow-hidden shrink-0">
                          <img src="/rightsidelogo.png" className="w-full h-full object-contain" alt="Logo" />
                        </div>
                        <div>
                          <h1 className="text-xl font-black text-white leading-tight">महालक्ष्मी डेव्हलपर्स (Mahalaxmi Developers)</h1>
                          <p className="text-[10px] font-bold text-blue-100 tracking-wider">ग्राहक पेमेंट लेजर व हप्ते नोंदवही (Customer Payment Statement)</p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-blue-100">
                        <p className="font-bold text-white">Form No: {selectedForm.formNumber}</p>
                        <p className="text-blue-200">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Details Info (Clean, Professional Minimalist Grid) */}
                  <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 sm:p-4 mb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          {lang === 'EN' ? 'CUSTOMER NAME' : 'ग्राहकाचे नाव'}
                        </p>
                        <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">
                          {selectedForm.formData.customerName || selectedForm.formData.name || 'N/A'}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          {lang === 'EN' ? 'SITE NAME' : 'साईटचे नाव'}
                        </p>
                        <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">
                          {selectedForm.formData.siteName || 'N/A'}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          {lang === 'EN' ? 'PLOT DETAILS' : 'प्लॉट तपशील'}
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          {lang === 'EN' ? 'Plot No' : 'प्लॉट नं'}: <span className="text-[#1e295d] dark:text-blue-400 font-extrabold">{selectedForm.formData.plotNo || 'N/A'}</span>
                          {selectedForm.formData.area && <span className="text-slate-600 dark:text-slate-400 font-medium"> | {selectedForm.formData.area} {selectedForm.formData.sqFt ? `(${selectedForm.formData.sqFt} sqft)` : ''}</span>}
                        </p>
                        {selectedForm.formData.gatNo && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{lang === 'EN' ? 'Gat No' : 'गट नं'}: {selectedForm.formData.gatNo}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          {lang === 'EN' ? 'REFERENCE' : 'रेफरन्स'}
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {selectedForm.formData.reference || '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment History Table (Clean & Professional Financial Table) */}
                  {(() => {
                    const paidPayments = (selectedForm.formData.payments || []).filter(isPaymentPaid);
                    const scheduledPayments = (selectedForm.formData.payments || []).filter((p: any) => !isPaymentPaid(p));

                    const paidCount = paidPayments.length;
                    const upcomingSlots: any[] = [];

                    // 1. Add all explicitly scheduled payments
                    scheduledPayments.forEach((sp: any) => {
                      upcomingSlots.push({
                        ...sp,
                        isExplicit: true
                      });
                    });

                    // 2. Add placeholder upcoming installment rows to fulfill at least 3 upcoming slots
                    const targetUpcomingCount = Math.max(3, scheduledPayments.length);
                    for (let i = scheduledPayments.length; i < targetUpcomingCount; i++) {
                      const slotNum = paidCount + i + 1;
                      const label = lang === 'MR' ? `${getOrdinalLabelMR(slotNum)} (नियोजित)` : `${getOrdinalLabel(slotNum)} (Upcoming)`;
                      upcomingSlots.push({
                        id: `VIRTUAL-${slotNum}`,
                        installmentNum: slotNum,
                        date: '',
                        amount: '',
                        paymentMode: '—',
                        remark: label,
                        status: 'UPCOMING',
                        isExplicit: false
                      });
                    }

                    return (
                      <div className="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-2xs mb-4 bg-white dark:bg-slate-900">
                        <div className="overflow-x-auto w-full">
                          <Table className="min-w-[500px] sm:min-w-full">
                          <TableHeader className="bg-[#1e295d] text-white">
                            <TableRow className="border-b border-[#151c40] hover:bg-[#1e295d]">
                              <TableHead className="text-white font-bold text-xs py-2.5 px-3 uppercase tracking-wider">{lang === 'EN' ? 'Date' : 'दिनांक'}</TableHead>
                              <TableHead className="text-white font-bold text-xs py-2.5 px-3 uppercase tracking-wider">{lang === 'EN' ? 'Amount' : 'रक्कम'}</TableHead>
                              <TableHead className="text-white font-bold text-xs py-2.5 px-3 uppercase tracking-wider">{lang === 'EN' ? 'Mode' : 'प्रकार'}</TableHead>
                              <TableHead className="text-white font-bold text-xs py-2.5 px-3 uppercase tracking-wider">{lang === 'EN' ? 'Details' : 'तपशील'}</TableHead>
                              <TableHead className="text-right text-white font-bold text-xs py-2.5 px-3 uppercase tracking-wider print:hidden">{lang === 'EN' ? 'Action / Receipt' : 'पावती'}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                            {/* Row 1: Initial Booking */}
                            {(parseFloat(selectedForm.formData.bookingAmount) > 0) && (
                              <TableRow className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                <TableCell className="font-bold text-[#1e295d] dark:text-blue-300 text-xs py-2.5 px-3">
                                  {lang === 'EN' ? 'Initial Booking' : 'सुरुवातीचे बुकिंग'}
                                </TableCell>
                                <TableCell className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm py-2.5 px-3">
                                  ₹ {parseFloat(selectedForm.formData.bookingAmount).toLocaleString('en-IN')}
                                </TableCell>
                                <TableCell className="text-xs text-slate-600 dark:text-slate-400 py-2.5 px-3">
                                  {selectedForm.formData.paymentType || 'Cash'}
                                </TableCell>
                                <TableCell className="text-xs text-slate-600 dark:text-slate-400 py-2.5 px-3">
                                  {lang === 'EN' ? 'Initial booking deposit' : 'सुरुवातीचा फॉर्म जमा केला'}
                                </TableCell>
                                <TableCell className="text-right print:hidden py-2.5 px-3">
                                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                                  </span>
                                </TableCell>
                              </TableRow>
                            )}

                            {/* Row 2: Registration Amount / खरेदीखत नोंदणी रक्कम */}
                            {(() => {
                              const regRaw = selectedForm.formData.registrationAmount || selectedForm.formData.registrationAmountText;
                              const reg = typeof regRaw === 'number' ? regRaw : (parseFloat(String(regRaw || '').replace(/[^0-9.]/g, '')) || 0);
                              if (reg <= 0) return null;
                              return (
                                <TableRow className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                  <TableCell className="font-bold text-[#1e295d] dark:text-blue-300 text-xs py-2.5 px-3">
                                    {lang === 'EN' ? 'Registration Amount' : 'खरेदीखताची रक्कम'}
                                  </TableCell>
                                  <TableCell className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm py-2.5 px-3">
                                    ₹ {reg.toLocaleString('en-IN')}
                                  </TableCell>
                                  <TableCell className="text-xs text-slate-600 dark:text-slate-400 py-2.5 px-3">
                                    {lang === 'EN' ? 'Kept with Customer' : 'ग्राहकाकडे राहील'}
                                  </TableCell>
                                  <TableCell className="text-xs text-slate-600 dark:text-slate-400 py-2.5 px-3">
                                    {lang === 'EN' ? 'Sale deed registration allowance' : 'खरेदीखताची रक्कम व नोंदणी कपात'}
                                  </TableCell>
                                  <TableCell className="text-right print:hidden py-2.5 px-3">
                                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                                      <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                                    </span>
                                  </TableCell>
                                </TableRow>
                              );
                            })()}

                            {/* Row 3+: Paid Installments (1st Installment, 2nd Installment, etc.) */}
                            {paidPayments.map((p: any, i: number) => {
                              const installmentNum = i + 1;
                              const defaultLabel = lang === 'MR' ? getOrdinalLabelMR(installmentNum) : getOrdinalLabel(installmentNum);
                              return (
                                <TableRow key={p.id || i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                  <TableCell className="font-medium text-xs text-slate-700 dark:text-slate-300 py-2.5 px-3">
                                    {p.date || '—'}
                                  </TableCell>
                                  <TableCell className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 py-2.5 px-3">
                                    ₹ {parseFloat(p.amount).toLocaleString('en-IN')}
                                  </TableCell>
                                  <TableCell className="text-xs text-slate-600 dark:text-slate-400 py-2.5 px-3">
                                    {p.paymentMode || 'Cash'}
                                  </TableCell>
                                  <TableCell className="text-xs py-2.5 px-3">
                                    <div className="font-bold text-slate-800 dark:text-slate-200">{p.remark || defaultLabel}</div>
                                    {p.chequeUtrNo && <span className="text-[10px] text-slate-500 block">Ref/UTR: {p.chequeUtrNo}</span>}
                                    {p.bankName && <span className="text-[10px] text-slate-500 block">{p.bankName} {p.branch ? `(${p.branch})` : ''}</span>}
                                  </TableCell>
                                  <TableCell className="text-right print:hidden py-2.5 px-3">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {p.receiptId ? (
                                        <Link href={`/dashboard/forms/${p.receiptId}/preview`} target="_blank">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-[11px] bg-blue-50 hover:bg-blue-100 text-[#1e295d] dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-bold"
                                          >
                                            <Printer className="w-3 h-3 mr-1" /> Receipt
                                          </Button>
                                        </Link>
                                      ) : (
                                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                                          <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                                        </span>
                                      )}
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                        onClick={() => handleDeletePayment(p, i)}
                                        title="Delete Installment"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}

                            {/* Row 4+: Upcoming Installments (Fillable Manually by Admin) */}
                            {upcomingSlots.map((p: any, idx: number) => {
                              const cleanLabel = (p.remark || '').replace(' (Upcoming)', '').replace(' (नियोजित)', '').replace(' (Scheduled)', '');
                              return (
                                <TableRow 
                                  key={p.id || idx}
                                  className="bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 border-dashed border-slate-200 dark:border-slate-700/60"
                                >
                                  <TableCell className="font-medium text-xs py-2.5 px-3">
                                    {p.date ? (
                                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.date}</span>
                                    ) : (
                                      <span className="text-slate-400 italic">TBD</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="font-extrabold text-sm py-2.5 px-3">
                                    {p.amount && parseFloat(p.amount) > 0 ? `₹ ${parseFloat(p.amount).toLocaleString('en-IN')}` : <span className="text-slate-400 italic font-normal text-xs">TBD</span>}
                                  </TableCell>
                                  <TableCell className="text-xs text-slate-400 py-2.5 px-3">
                                    {p.paymentMode || '—'}
                                  </TableCell>
                                  <TableCell className="text-xs py-2.5 px-3">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{p.remark}</span>
                                  </TableCell>
                                  <TableCell className="text-right print:hidden py-2.5 px-3">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <Button
                                        size="sm"
                                        className="h-7 text-[11px] bg-[#1e295d] hover:bg-[#151c40] text-white font-bold shadow-xs px-2.5"
                                        onClick={() => openAddPaymentModal(selectedForm, p.date, cleanLabel, p.amount)}
                                      >
                                        <Plus className="w-3 h-3 mr-1" /> Pay
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-[11px] bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 px-2"
                                        onClick={() => {
                                          setNewSchedule({ 
                                            date: p.date || '', 
                                            label: cleanLabel, 
                                            expectedAmount: p.amount || '' 
                                          });
                                          setIsScheduleDialogOpen(true);
                                        }}
                                        title="Set/Change Schedule Date"
                                      >
                                        <Calendar className="w-3 h-3 mr-1 text-[#1e295d] dark:text-blue-400" /> {p.date ? 'Edit' : 'Date'}
                                      </Button>
                                      {p.isExplicit && (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                          onClick={() => handleDeleteSchedule(p.id)}
                                          title="Delete Scheduled Date"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                        </div>

                        {/* Add Row Button below the table */}
                        <div className="p-3 bg-slate-50/90 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 print:hidden">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-1">
                            ★ {lang === 'EN' ? 'Upcoming installments (fillable manually by admin)' : 'नियोजित हप्ते (ॲडमिनद्वारे मॅन्युअली भरता येतील)'}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-[#1e295d] dark:text-blue-300 border-blue-200 dark:border-blue-800 font-bold w-full sm:w-auto"
                            onClick={handleAddNewUpcomingRow}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1 text-[#1e295d] dark:text-blue-400" />
                            {lang === 'EN' ? '+ Add Row (Upcoming Installment)' : '+ नवीन हप्ता जोडा'}
                          </Button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Bottom Summary Stats (Simple & Professional Cards) */}
                  {(() => {
                    const { total, totalReceived, pending } = getTotals(selectedForm);
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-3 sm:p-3.5 rounded-xl text-center shadow-2xs">
                          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                            {lang === 'EN' ? 'TOTAL BUDGET' : 'एकूण रक्कम'}
                          </p>
                          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                            ₹ {total.toLocaleString('en-IN')}
                          </p>
                        </div>
                        
                        <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 p-3 sm:p-3.5 rounded-xl text-center shadow-2xs">
                          <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">
                            {lang === 'EN' ? 'TOTAL RECEIVED' : 'एकूण जमा'}
                          </p>
                          <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">
                            ₹ {totalReceived.toLocaleString('en-IN')}
                          </p>
                        </div>
                        
                        <div className={`p-3 sm:p-3.5 rounded-xl text-center shadow-2xs border ${
                          pending === 0 
                            ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700' 
                            : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50'
                        }`}>
                          <p className={`text-[11px] font-bold ${pending === 0 ? 'text-slate-500 dark:text-slate-400' : 'text-rose-700 dark:text-rose-400'} uppercase tracking-widest mb-1`}>
                            {lang === 'EN' ? 'PENDING AMOUNT' : 'उर्वरित रक्कम'}
                          </p>
                          <p className={`text-xl sm:text-2xl font-black ${pending === 0 ? 'text-slate-900 dark:text-slate-100' : 'text-rose-700 dark:text-rose-400'}`}>
                            ₹ {pending.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Print Signatures Block - Anchored at the footer of Page 1 with generous gap */}
                <div className="hidden print:flex justify-between items-end mt-auto pt-8 pb-3 border-t border-slate-300 text-xs">
                  <div className="text-center">
                    <div className="border-t-2 border-slate-900 w-44 mb-1.5 mt-8"></div>
                    <span className="font-bold text-[#1e295d] text-[11px]">
                      {lang === 'EN' ? 'Customer Signature' : 'ग्राहकाची सही'}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-slate-900 w-44 mb-1.5 mt-8"></div>
                    <span className="font-bold text-[#1e295d] text-[11px]">
                      {lang === 'EN' ? 'Authorized Signature' : 'अधिकृत सही / शिक्का'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================
          ADD PAYMENT MODAL (Auto Receipt Generation)
          ============================================================ */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[550px] max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#1e295d] dark:text-blue-400" />
              Add Customer Installment & Generate Receipt
            </DialogTitle>
          </DialogHeader>

          {selectedForm && (
            <form onSubmit={handleSavePayment} className="space-y-4 pt-2">
              <div className="bg-blue-50/50 dark:bg-slate-800/50 p-3 rounded-lg border border-blue-200 dark:border-slate-700 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedForm.formData.customerName || selectedForm.formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Site / Plot:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedForm.formData.siteName || 'N/A'} (Plot {selectedForm.formData.plotNo || 'N/A'})</span>
                </div>
                <div className="flex justify-between text-[#1e295d] dark:text-blue-400 font-bold">
                  <span>Current Balance Remaining:</span>
                  <span>₹ {getTotals(selectedForm).pending.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Installment Name & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Installment Name / Label</label>
                  <Input 
                    required 
                    value={newPayment.installmentLabel} 
                    onChange={(e) => setNewPayment({...newPayment, installmentLabel: e.target.value, remark: e.target.value})}
                    placeholder="e.g. 2nd Installment"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Payment Date</label>
                  <Input 
                    type="date" 
                    required 
                    value={newPayment.date} 
                    onChange={(e) => setNewPayment({...newPayment, date: e.target.value})} 
                  />
                </div>
              </div>

              {/* Amount & Amount in Words */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Amount (₹)</label>
                <Input 
                  type="number" 
                  required 
                  min="1"
                  value={newPayment.amount} 
                  onChange={(e) => handleAmountChange(e.target.value)} 
                  placeholder="e.g. 200000"
                  className="font-bold text-lg"
                />
              </div>

              {newPayment.amountWords && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Amount in Words</label>
                  <Input 
                    value={newPayment.amountWords} 
                    onChange={(e) => setNewPayment({...newPayment, amountWords: e.target.value})}
                    className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              )}

              {/* Payment Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Payment Mode</label>
                <Select 
                  value={newPayment.paymentMode} 
                  onValueChange={(val) => setNewPayment({...newPayment, paymentMode: val || 'Cash'})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash (रोख)</SelectItem>
                    <SelectItem value="Online">Online / UPI / NetBanking</SelectItem>
                    <SelectItem value="Cheque">Cheque / RTGS / UTR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional Online Inputs */}
              {newPayment.paymentMode === 'Online' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/40 dark:bg-slate-800/50 rounded-lg border border-blue-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold">UPI ID</label>
                    <Input 
                      value={newPayment.upiId} 
                      onChange={(e) => setNewPayment({...newPayment, upiId: e.target.value})}
                      placeholder="e.g. user@okhdfc"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold">UTR / Reference No.</label>
                    <Input 
                      value={newPayment.chequeUtrNo} 
                      onChange={(e) => setNewPayment({...newPayment, chequeUtrNo: e.target.value})}
                      placeholder="UTR / Transaction ID"
                    />
                  </div>
                </div>
              )}

              {/* Conditional Cheque Inputs */}
              {newPayment.paymentMode === 'Cheque' && (
                <div className="space-y-2.5 p-3 bg-blue-50/40 dark:bg-slate-800/50 rounded-lg border border-blue-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold">Cheque / RTGS / UTR No.</label>
                    <Input 
                      value={newPayment.chequeUtrNo} 
                      onChange={(e) => setNewPayment({...newPayment, chequeUtrNo: e.target.value})}
                      placeholder="e.g. CHQ-981245"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold">Bank Name</label>
                      <Input 
                        value={newPayment.bankName} 
                        onChange={(e) => setNewPayment({...newPayment, bankName: e.target.value})}
                        placeholder="e.g. SBI Bank"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold">Branch</label>
                      <Input 
                        value={newPayment.branch} 
                        onChange={(e) => setNewPayment({...newPayment, branch: e.target.value})}
                        placeholder="e.g. Pune Branch"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Optional Next Installment Schedule Date */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#1e295d] dark:text-blue-400" />
                  Schedule Next Installment Date (Optional)
                </label>
                <Input 
                  type="date" 
                  value={newPayment.nextUpcomingDate} 
                  onChange={(e) => setNewPayment({...newPayment, nextUpcomingDate: e.target.value})}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-3 flex-col sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPaymentDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-[#1e295d] hover:bg-[#151c40] text-white font-bold w-full sm:w-auto shadow-xs"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Save Payment & Issue Receipt
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================
          ADD SCHEDULED DATE MODAL
          ============================================================ */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[440px] p-4 sm:p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-[#1e295d] dark:text-blue-300">
              <Calendar className="w-5 h-5 text-[#1e295d] dark:text-blue-400" />
              Schedule Upcoming Installment
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddSchedule} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold">Upcoming Installment Date</label>
              <Input 
                type="date" 
                required 
                value={newSchedule.date} 
                onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold">Installment Label / Description</label>
              <Input 
                value={newSchedule.label} 
                onChange={(e) => setNewSchedule({...newSchedule, label: e.target.value})}
                placeholder="e.g. 2nd Installment or 3rd Installment"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold">Expected Amount (₹) (Optional)</label>
              <Input 
                type="number" 
                value={newSchedule.expectedAmount} 
                onChange={(e) => setNewSchedule({...newSchedule, expectedAmount: e.target.value})}
                placeholder="₹ 0.00"
              />
            </div>

            <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsScheduleDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-[#1e295d] hover:bg-[#151c40] text-white font-bold w-full sm:w-auto shadow-xs">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
                Add Scheduled Date
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
