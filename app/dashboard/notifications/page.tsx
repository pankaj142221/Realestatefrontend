"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Loader2, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  MessageCircle, 
  Phone, 
  ArrowUpRight, 
  CheckCircle2, 
  User, 
  MapPin, 
  Search,
  Filter,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  List,
  CalendarDays
} from 'lucide-react';
import { parseDueDate, getDueStatus, DueStatusResult } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import api from '@/lib/api';

const ADMIN_WHATSAPP_NUMBER = '918378814714';
const ADMIN_WHATSAPP_DISPLAY = '+91 83788 14714';

interface ReminderItem {
  id: string;
  type: 'PAYMENT' | 'VISIT';
  formId: string;
  formNumber: string;
  customerName: string;
  whatsappNo: string;
  siteName: string;
  plotNo: string;
  installmentLabel: string;
  expectedAmount: string;
  dateStr: string;
  dueDate: Date;
  statusInfo: DueStatusResult;
  remark?: string;
  language?: string;
}

function NotificationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL_ALERTS' | 'TOMORROW' | 'TODAY' | 'OVERDUE' | 'FUTURE' | 'VISITS'>('ALL_ALERTS');
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [search, setSearch] = useState('');
  
  // Calendar Month State
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const upper = tabParam.toUpperCase();
      if (['ALL_ALERTS', 'TOMORROW', 'TODAY', 'OVERDUE', 'FUTURE', 'VISITS'].includes(upper)) {
        setActiveTab(upper as any);
        setSelectedDate(null);
      }
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'ALL_ALERTS' | 'TOMORROW' | 'TODAY' | 'OVERDUE' | 'FUTURE' | 'VISITS') => {
    setActiveTab(tab);
    setSelectedDate(null);
    router.replace(`/dashboard/notifications?tab=${tab}`, { scroll: false });
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const isPaymentPaid = (p: any): boolean => {
    if (!p) return false;
    if (p.status === 'PAID') return true;
    if (p.receiptId) return true;
    return false;
  };

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const items: ReminderItem[] = [];

      // 1. Fetch Customer Forms with Payments
      const formsRes = await api.get('/forms');
      const forms = formsRes.data.forms || [];
      const customerForms = forms.filter((f: any) => f.formType === 'CUSTOMER_INFO');

      customerForms.forEach((form: any) => {
        const formData = form.formData || {};
        const payments = formData.payments || [];

        if (Array.isArray(payments)) {
          payments.forEach((p: any, idx: number) => {
            // Include all scheduled installments or unpaid dates
            const isScheduled = !isPaymentPaid(p);
            
            if (p.date && isScheduled) {
              const parsedDate = parseDueDate(p.date);
              if (parsedDate) {
                const statusInfo = getDueStatus(parsedDate, today);
                items.push({
                  id: p.id || `PAY-${form._id}-${idx}`,
                  type: 'PAYMENT',
                  formId: form._id,
                  formNumber: form.formNumber,
                  customerName: formData.customerName || formData.name || 'Valued Customer',
                  whatsappNo: formData.whatsappNo || formData.alternateNumber || '',
                  siteName: formData.siteName || '',
                  plotNo: formData.plotNo || '',
                  installmentLabel: p.remark || p.type || `Installment #${idx + 1}`,
                  expectedAmount: p.amount || '',
                  dateStr: p.date,
                  dueDate: parsedDate,
                  statusInfo,
                  remark: p.remark,
                  language: form.language || 'MR'
                });
              }
            }
          });
        }
      });

      // 2. Fetch Client Visits Follow-ups
      try {
        const visitsRes = await api.get('/visits');
        const visits = visitsRes.data.visits || [];
        visits.forEach((v: any) => {
          if (v.status === 'FOLLOWUP' && v.visitDate) {
            const parsedDate = parseDueDate(v.visitDate);
            if (parsedDate) {
              const statusInfo = getDueStatus(parsedDate, today);
              items.push({
                id: `VISIT-${v._id}`,
                type: 'VISIT',
                formId: v._id,
                formNumber: 'VISIT',
                customerName: v.clientName || 'Client',
                whatsappNo: v.contactNumber || '',
                siteName: v.siteInterested || '',
                plotNo: '',
                installmentLabel: 'Follow-up Client Visit',
                expectedAmount: '',
                dateStr: v.visitDate,
                dueDate: parsedDate,
                statusInfo,
                remark: v.remarks || 'Client visit follow-up required'
              });
            }
          }
        });
      } catch (e) {
        console.error('Visits fetch error:', e);
      }

      // Sort by urgency: Overdue first, then Today, then Tomorrow (1-Day Reminder), then upcoming chronological
      items.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

      setReminders(items);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp Message Generator for Customer
  const getCustomerWhatsAppLink = (item: ReminderItem) => {
    let cleanPhone = item.whatsappNo.replace(/\D/g, '');
    if (!cleanPhone) return '#';
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const formattedDate = item.dueDate.toLocaleDateString('en-IN');
    const isMR = item.language === 'MR';
    
    let message = '';
    if (item.statusInfo.type === 'TOMORROW') {
      message = isMR 
        ? `नमस्कार ${item.customerName} जी,\n\nमहालक्ष्मी डेव्हलपर्स कडून नम्र आठवण: आपल्या ${item.siteName ? `${item.siteName} (प्लॉट नं. ${item.plotNo || ''})` : 'प्लॉट'} च्या पुढील हप्त्याची (${item.installmentLabel}) तारीख उद्या ${formattedDate} रोजी आहे.${item.expectedAmount ? `\nरक्कम: ₹ ${parseFloat(item.expectedAmount).toLocaleString('en-IN')}` : ''}\n\nकृपया वेळेवर हप्ता जमा करून पावती प्राप्त करून घ्यावी.\nधन्यवाद!\n- महालक्ष्मी डेव्हलपर्स`
        : `Dear ${item.customerName},\n\nFriendly reminder from Mahalaxmi Developers: Your upcoming installment (${item.installmentLabel}) for ${item.siteName ? `${item.siteName} Plot ${item.plotNo || ''}` : 'your plot'} is due tomorrow on ${formattedDate}.${item.expectedAmount ? `\nAmount: ₹ ${parseFloat(item.expectedAmount).toLocaleString('en-IN')}` : ''}\n\nKindly make the payment to receive your official receipt.\nThank You!\n- Mahalaxmi Developers`;
    } else if (item.statusInfo.type === 'TODAY') {
      message = isMR
        ? `नमस्कार ${item.customerName} जी,\n\nमहालक्ष्मी डेव्हलपर्स कडून नम्र सूचना: आपल्या ${item.siteName ? `${item.siteName}` : 'प्लॉट'} चा हप्ता (${item.installmentLabel}) आज ${formattedDate} रोजी देय आहे.${item.expectedAmount ? `\nरक्कम: ₹ ${parseFloat(item.expectedAmount).toLocaleString('en-IN')}` : ''}\n\nधन्यवाद!\n- महालक्ष्मी डेव्हलपर्स`
        : `Dear ${item.customerName},\n\nReminder from Mahalaxmi Developers: Your installment (${item.installmentLabel}) for ${item.siteName ? `${item.siteName}` : 'your plot'} is due today, ${formattedDate}.${item.expectedAmount ? `\nAmount: ₹ ${parseFloat(item.expectedAmount).toLocaleString('en-IN')}` : ''}\n\nThank You!\n- Mahalaxmi Developers`;
    } else if (item.statusInfo.type === 'OVERDUE') {
      message = isMR
        ? `नमस्कार ${item.customerName} जी,\n\nमहालक्ष्मी डेव्हलपर्स: आपल्या प्लॉटचा हप्ता (${item.installmentLabel}) दिनांक ${formattedDate} रोजी थकीत आहे.${item.expectedAmount ? `\nरक्कम: ₹ ${parseFloat(item.expectedAmount).toLocaleString('en-IN')}` : ''}\nकृपया लवकरात लवकर संपर्क साधावा.\nधन्यवाद!\n- महालक्ष्मी डेव्हलपर्स`
        : `Dear ${item.customerName},\n\nPayment Overdue Notice from Mahalaxmi Developers: Your installment (${item.installmentLabel}) was due on ${formattedDate}.${item.expectedAmount ? `\nAmount: ₹ ${parseFloat(item.expectedAmount).toLocaleString('en-IN')}` : ''}\nKindly clear the pending installment.\nThank You!\n- Mahalaxmi Developers`;
    } else {
      message = isMR
        ? `नमस्कार ${item.customerName} जी,\n\nमहालक्ष्मी डेव्हलपर्स: आपल्या प्लॉटचा पुढील हप्ता (${item.installmentLabel}) ${formattedDate} रोजी नियोजित आहे.${item.expectedAmount ? ` रक्कम: ₹ ${parseFloat(item.expectedAmount).toLocaleString('en-IN')}` : ''}\n\nधन्यवाद!\n- महालक्ष्मी डेव्हलपर्स`
        : `Dear ${item.customerName},\n\nNotice from Mahalaxmi Developers: Your installment (${item.installmentLabel}) is scheduled for ${formattedDate}.${item.expectedAmount ? ` Amount: ₹ ${parseFloat(item.expectedAmount).toLocaleString('en-IN')}` : ''}\n\nThank You!\n- Mahalaxmi Developers`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // WhatsApp Message Generator specifically for Admin (+91 83788 14714)
  const getAdminWhatsAppLink = (item: ReminderItem) => {
    const formattedDate = item.dueDate.toLocaleDateString('en-IN');
    let statusHeadline = '';
    if (item.statusInfo.type === 'TOMORROW') {
      statusHeadline = '⚠️ *उद्या देय असलेला हप्ता (1-Day Advance Reminder)*';
    } else if (item.statusInfo.type === 'TODAY') {
      statusHeadline = '🚨 *आज देय असलेला हप्ता (Due Today Alert)*';
    } else if (item.statusInfo.type === 'OVERDUE') {
      statusHeadline = '❗ *थकबाकी असलेला हप्ता (Overdue Reminder)*';
    } else {
      statusHeadline = '📅 *नियोजित आगामी हप्ता (Scheduled Installment)*';
    }

    const message = `🔔 *महालक्ष्मी डेव्हलपर्स — ॲडमिन पेमेंट अलर्ट*\n\n${statusHeadline}\n\n👤 *ग्राहक:* ${item.customerName}\n📱 *ग्राहक मोबाईल:* ${item.whatsappNo || 'उपलब्ध नाही'}\n🏡 *प्रकल्प/साईट:* ${item.siteName || 'महालक्ष्मी प्रोजेक्ट'} ${item.plotNo ? `(प्लॉट नं. ${item.plotNo})` : ''}\n🔖 *हप्ता तपशील:* ${item.installmentLabel}\n📅 *देय दिनांक:* ${formattedDate}\n💰 *अपेक्षित रक्कम:* ${item.expectedAmount ? `₹ ${parseFloat(item.expectedAmount).toLocaleString('en-IN')}` : '—'}\n📄 *फॉर्म नं:* ${item.formNumber}\n\n📌 *सूचना:* कृपया उद्या या हप्त्याची वसुली व नोंद करावी.`;

    return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  // WhatsApp Batch / Digest Message to Admin (+91 83788 14714)
  const getAdminDigestWhatsAppLink = (filterType: 'TOMORROW' | 'ALL_URGENT') => {
    const targetItems = filterType === 'TOMORROW' 
      ? reminders.filter(r => r.statusInfo.type === 'TOMORROW')
      : reminders.filter(r => r.statusInfo.isUrgent);

    if (targetItems.length === 0) {
      const emptyMsg = `🔔 *महालक्ष्मी डेव्हलपर्स — ॲडमिन रिपोर्ट*\n\n✅ ${filterType === 'TOMORROW' ? 'उद्या देय असलेला कोणताही हप्ता नाही.' : 'आज किंवा उद्या कोणताही प्रलंबित ॲलर्ट नाही.'} सर्व पेमेंट शेड्युल सुरळीत आहेत.`;
      return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(emptyMsg)}`;
    }

    let text = `🔔 *महालक्ष्मी डेव्हलपर्स — ॲडमिन ${filterType === 'TOMORROW' ? '1-दिवस अगोदर (Due Tomorrow)' : 'दैनिक पेमेंट'} रिमाइंडर रिपोर्ट*\n`;
    text += `📅 *दिनांक:* ${new Date().toLocaleDateString('en-IN')}\n`;
    text += `📊 *एकूण हप्ते संख्या:* ${targetItems.length}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    targetItems.forEach((it, idx) => {
      const badge = it.statusInfo.type === 'TOMORROW' ? '⚠️ [उद्या देय]' :
                    it.statusInfo.type === 'TODAY' ? '🚨 [आज देय]' : '❗ [थकबाकी]';
      text += `${idx + 1}. ${badge} *${it.customerName}*\n`;
      text += `   • हप्ता: ${it.installmentLabel}\n`;
      if (it.expectedAmount) text += `   • रक्कम: ₹ ${parseFloat(it.expectedAmount).toLocaleString('en-IN')}\n`;
      text += `   • दिनांक: ${it.dueDate.toLocaleDateString('en-IN')}\n`;
      if (it.siteName) text += `   • साईट: ${it.siteName} ${it.plotNo ? `(Plot ${it.plotNo})` : ''}\n`;
      if (it.whatsappNo) text += `   • संपर्क: ${it.whatsappNo}\n`;
      text += `\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━\n📌 डॅशबोर्ड वरून थेट पावती तयार करा किंवा पेमेंट अपडेट करा.`;

    return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  // Filter counts
  const tomorrowCount = reminders.filter(r => r.statusInfo.type === 'TOMORROW').length;
  const todayCount = reminders.filter(r => r.statusInfo.type === 'TODAY').length;
  const overdueCount = reminders.filter(r => r.statusInfo.type === 'OVERDUE').length;
  const urgentCount = tomorrowCount + todayCount + overdueCount;
  const futureCount = reminders.filter(r => r.statusInfo.type === 'UPCOMING' || r.statusInfo.type === 'FUTURE').length;
  const visitCount = reminders.filter(r => r.type === 'VISIT').length;

  // Filtered List based on active tab, search, and optional date filter
  const filteredList = reminders.filter(item => {
    // Date filter if selected in calendar
    if (selectedDate) {
      const matchYear = item.dueDate.getFullYear() === selectedDate.getFullYear();
      const matchMonth = item.dueDate.getMonth() === selectedDate.getMonth();
      const matchDay = item.dueDate.getDate() === selectedDate.getDate();
      if (!matchYear || !matchMonth || !matchDay) return false;
    }

    // Search match
    const matchSearch = 
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.formNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.siteName.toLowerCase().includes(search.toLowerCase()) ||
      item.installmentLabel.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (!selectedDate) {
      if (activeTab === 'ALL_ALERTS') return item.statusInfo.isUrgent;
      if (activeTab === 'TOMORROW') return item.statusInfo.type === 'TOMORROW';
      if (activeTab === 'TODAY') return item.statusInfo.type === 'TODAY';
      if (activeTab === 'OVERDUE') return item.statusInfo.type === 'OVERDUE';
      if (activeTab === 'FUTURE') return item.statusInfo.type === 'UPCOMING' || item.statusInfo.type === 'FUTURE';
      if (activeTab === 'VISITS') return item.type === 'VISIT';
    }

    return true;
  });

  // Calendar Grid Builder Helpers
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthDays = Array.from({ length: firstDayOfWeek }, (_, i) => daysInPrevMonth - firstDayOfWeek + i + 1);
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalCells = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDaysCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => i + 1);

  const getRemindersForDate = (d: number, m: number, y: number) => {
    return reminders.filter(r => 
      r.dueDate.getDate() === d && 
      r.dueDate.getMonth() === m && 
      r.dueDate.getFullYear() === y
    );
  };

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(year, month + 1, 1));
  };

  const handleTodayMonth = () => {
    const now = new Date();
    setCalendarMonth(now);
    setSelectedDate(null);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-950/60 rounded-xl text-[#1e295d] dark:text-blue-300">
              <Bell className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#1e295d] dark:text-blue-300">
                Payment Due & Reminders
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Automated 1-day before payment due notifications, upcoming installments calendar, and WhatsApp alerts to Admin ({ADMIN_WHATSAPP_DISPLAY})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs">
            <button
              onClick={() => { setViewMode('LIST'); setSelectedDate(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
                viewMode === 'LIST' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List View
            </button>
            <button
              onClick={() => setViewMode('CALENDAR')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
                viewMode === 'CALENDAR' 
                  ? 'bg-[#1e295d] text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Calendar Schedule
            </button>
          </div>

          <Link href="/dashboard/payments">
            <Button className="bg-[#1e295d] hover:bg-[#151c40] text-white font-bold text-xs shadow-xs">
              <CreditCard className="w-4 h-4 mr-1.5" /> Ledger
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin WhatsApp Automation Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1a237e] via-[#1e295d] to-[#151c40] text-white shadow-md border border-blue-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
              <MessageCircle className="w-3.5 h-3.5 fill-current" /> WhatsApp Connected
            </span>
            <span className="text-xs font-semibold text-blue-200">Admin Auto-Reminders</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            Admin WhatsApp: <span className="text-amber-300 font-mono tracking-wide">{ADMIN_WHATSAPP_DISPLAY}</span>
          </h2>
          <p className="text-xs text-blue-100 max-w-xl">
            Automated alerts for payments due 1-day before (tomorrow), due today, and overdue installments are configured to remind the admin on WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          <a
            href={getAdminDigestWhatsAppLink('TOMORROW')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md">
              <Clock className="w-3.5 h-3.5 mr-1.5" /> Send 1-Day (Tomorrow) Digest ({tomorrowCount})
            </Button>
          </a>

          <a
            href={getAdminDigestWhatsAppLink('ALL_URGENT')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md">
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Send All Urgent Alerts ({urgentCount})
            </Button>
          </a>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Due Tomorrow (1-Day Reminder) */}
        <div 
          onClick={() => handleTabChange('TOMORROW')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'TOMORROW' && !selectedDate
              ? 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-400 shadow-md font-bold' 
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 hover:bg-amber-100/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${activeTab === 'TOMORROW' && !selectedDate ? '' : 'text-amber-900 dark:text-amber-300'}`}>Due Tomorrow (1-Day)</span>
            <Clock className={`w-4 h-4 ${activeTab === 'TOMORROW' && !selectedDate ? '' : 'text-amber-700 dark:text-amber-400'}`} />
          </div>
          <p className={`text-2xl font-black mt-2 ${activeTab === 'TOMORROW' && !selectedDate ? '' : 'text-amber-950 dark:text-amber-200'}`}>{tomorrowCount}</p>
          <p className={`text-[11px] mt-0.5 ${activeTab === 'TOMORROW' && !selectedDate ? 'opacity-80' : 'text-amber-800/70 dark:text-amber-400/80'}`}>1-day advance notifications</p>
        </div>

        {/* Due Today */}
        <div 
          onClick={() => handleTabChange('TODAY')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'TODAY' && !selectedDate
              ? 'bg-blue-800 text-white border-blue-900 ring-2 ring-blue-500 shadow-md font-bold' 
              : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60 hover:bg-blue-100/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${activeTab === 'TODAY' && !selectedDate ? '' : 'text-blue-900 dark:text-blue-300'}`}>Due Today</span>
            <CalendarIcon className={`w-4 h-4 ${activeTab === 'TODAY' && !selectedDate ? '' : 'text-blue-700 dark:text-blue-400'}`} />
          </div>
          <p className="text-2xl font-black mt-2 text-[#1e295d] dark:text-blue-300">{todayCount}</p>
          <p className={`text-[11px] mt-0.5 ${activeTab === 'TODAY' && !selectedDate ? 'opacity-80' : 'text-blue-800/70 dark:text-blue-400/80'}`}>Collect payment today</p>
        </div>

        {/* Overdue */}
        <div 
          onClick={() => handleTabChange('OVERDUE')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'OVERDUE' && !selectedDate
              ? 'bg-rose-700 text-white border-rose-800 ring-2 ring-rose-400 shadow-md font-bold' 
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 hover:bg-rose-100/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${activeTab === 'OVERDUE' && !selectedDate ? '' : 'text-rose-900 dark:text-rose-300'}`}>Overdue</span>
            <AlertTriangle className={`w-4 h-4 ${activeTab === 'OVERDUE' && !selectedDate ? '' : 'text-rose-700 dark:text-rose-400'}`} />
          </div>
          <p className="text-2xl font-black mt-2 text-rose-700 dark:text-rose-400">{overdueCount}</p>
          <p className={`text-[11px] mt-0.5 ${activeTab === 'OVERDUE' && !selectedDate ? 'opacity-80' : 'text-rose-800/70 dark:text-rose-400/80'}`}>Past due date</p>
        </div>

        {/* All Future Scheduled */}
        <div 
          onClick={() => handleTabChange('FUTURE')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'FUTURE' && !selectedDate
              ? 'bg-slate-800 text-white border-slate-900 ring-2 ring-slate-600 shadow-md font-bold' 
              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-200/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${activeTab === 'FUTURE' && !selectedDate ? '' : 'text-slate-800 dark:text-slate-300'}`}>Future Scheduled</span>
            <CalendarIcon className={`w-4 h-4 ${activeTab === 'FUTURE' && !selectedDate ? '' : 'text-slate-600 dark:text-slate-400'}`} />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 dark:text-slate-100">{futureCount}</p>
          <p className={`text-[11px] mt-0.5 ${activeTab === 'FUTURE' && !selectedDate ? 'opacity-80' : 'text-slate-500 dark:text-slate-400/80'}`}>Scheduled for upcoming months</p>
        </div>
      </div>

      {/* ============================================================
          INTERACTIVE CALENDAR VIEW
          ============================================================ */}
      {viewMode === 'CALENDAR' && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-950">
          <CardHeader className="p-4 bg-[#1e295d] text-white flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-6 h-6 text-amber-300" />
              <div>
                <CardTitle className="text-lg font-black text-white">
                  {monthNames[month]} {year}
                </CardTitle>
                <CardDescription className="text-xs text-blue-100">
                  Click any date to inspect scheduled installments and alert Admin ({ADMIN_WHATSAPP_DISPLAY})
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevMonth} 
                className="h-8 w-8 p-0 bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTodayMonth} 
                className="h-8 text-xs font-bold bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 px-2 sm:px-3"
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextMonth} 
                className="h-8 w-8 p-0 bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-2 sm:p-4">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center font-bold text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="text-rose-500">Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div className="text-blue-500">Sat</div>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 pt-2">
              {/* Previous Month Days */}
              {prevMonthDays.map((d) => (
                <div key={`prev-${d}`} className="min-h-[50px] sm:min-h-[85px] p-1 sm:p-1.5 bg-slate-50/50 dark:bg-slate-900/30 rounded sm:rounded-lg text-slate-400 opacity-40 text-[10px] sm:text-xs">
                  <span className="font-semibold">{d}</span>
                </div>
              ))}

              {/* Current Month Days */}
              {currentMonthDays.map((d) => {
                const dayReminders = getRemindersForDate(d, month, year);
                const isToday = 
                  new Date().getDate() === d && 
                  new Date().getMonth() === month && 
                  new Date().getFullYear() === year;

                const isSelected = selectedDate && 
                  selectedDate.getDate() === d && 
                  selectedDate.getMonth() === month && 
                  selectedDate.getFullYear() === year;

                const hasUrgent = dayReminders.some(r => r.statusInfo.type === 'TODAY' || r.statusInfo.type === 'OVERDUE');
                const hasTomorrow = dayReminders.some(r => r.statusInfo.type === 'TOMORROW');

                return (
                  <div 
                    key={`cur-${d}`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDate(null);
                      } else {
                        setSelectedDate(new Date(year, month, d));
                      }
                    }}
                    className={`min-h-[50px] sm:min-h-[85px] p-1 sm:p-1.5 rounded sm:rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#1e295d] ring-2 ring-blue-400 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm'
                        : isToday 
                        ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded ${
                        isToday 
                          ? 'bg-amber-500 text-slate-950' 
                          : isSelected 
                          ? 'bg-[#1e295d] text-white' 
                          : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {d}
                      </span>
                      {dayReminders.length > 0 && (
                        <span className={`text-[8px] sm:text-[10px] font-black px-1 sm:px-1.5 py-0.2 rounded-full ${
                          hasUrgent 
                            ? 'bg-rose-600 text-white animate-pulse' 
                            : hasTomorrow 
                            ? 'bg-amber-500 text-slate-950 font-black' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          {dayReminders.length}
                        </span>
                      )}
                    </div>

                    {/* Mini installment chips */}
                    <div className="space-y-0.5 sm:space-y-1 mt-0.5 sm:mt-1 overflow-hidden">
                      {dayReminders.slice(0, 2).map((item) => (
                        <div 
                          key={item.id}
                          className={`text-[8px] sm:text-[9px] font-bold p-0.5 sm:p-1 rounded truncate leading-tight ${
                            item.statusInfo.type === 'TODAY' || item.statusInfo.type === 'OVERDUE'
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : item.statusInfo.type === 'TOMORROW'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                          }`}
                          title={`${item.customerName}: ${item.installmentLabel} (₹ ${parseFloat(item.expectedAmount || '0').toLocaleString('en-IN')})`}
                        >
                          <span className="truncate block">
                            {item.customerName.split(' ')[0]}: {item.expectedAmount ? `₹${(parseFloat(item.expectedAmount)/100000).toFixed(1)}L` : 'Due'}
                          </span>
                        </div>
                      ))}
                      {dayReminders.length > 2 && (
                        <div className="text-[8px] sm:text-[9px] text-slate-400 font-bold pl-0.5 hidden sm:block">
                          +{dayReminders.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Next Month Days */}
              {nextMonthDays.map((d) => (
                <div key={`next-${d}`} className="min-h-[50px] sm:min-h-[85px] p-1 sm:p-1.5 bg-slate-50/50 dark:bg-slate-900/30 rounded sm:rounded-lg text-slate-400 opacity-40 text-[10px] sm:text-xs">
                  <span className="font-semibold">{d}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto w-full md:w-auto">
          <Button 
            size="sm" 
            variant={activeTab === 'ALL_ALERTS' && !selectedDate ? 'default' : 'ghost'} 
            className={`text-xs h-8 shrink-0 ${activeTab === 'ALL_ALERTS' && !selectedDate ? 'bg-[#1e295d] text-white font-bold' : ''}`}
            onClick={() => handleTabChange('ALL_ALERTS')}
          >
            All Urgent ({urgentCount})
          </Button>
          <Button 
            size="sm" 
            variant={activeTab === 'TOMORROW' && !selectedDate ? 'default' : 'ghost'} 
            className={`text-xs h-8 shrink-0 ${activeTab === 'TOMORROW' && !selectedDate ? 'bg-amber-500 text-slate-950 font-bold' : ''}`}
            onClick={() => handleTabChange('TOMORROW')}
          >
            Due Tomorrow (1-Day) ({tomorrowCount})
          </Button>
          <Button 
            size="sm" 
            variant={activeTab === 'TODAY' && !selectedDate ? 'default' : 'ghost'} 
            className={`text-xs h-8 shrink-0 ${activeTab === 'TODAY' && !selectedDate ? 'bg-blue-700 text-white font-bold' : ''}`}
            onClick={() => handleTabChange('TODAY')}
          >
            Due Today ({todayCount})
          </Button>
          <Button 
            size="sm" 
            variant={activeTab === 'OVERDUE' && !selectedDate ? 'default' : 'ghost'} 
            className={`text-xs h-8 shrink-0 ${activeTab === 'OVERDUE' && !selectedDate ? 'bg-rose-600 text-white font-bold' : ''}`}
            onClick={() => handleTabChange('OVERDUE')}
          >
            Overdue ({overdueCount})
          </Button>
          <Button 
            size="sm" 
            variant={activeTab === 'FUTURE' && !selectedDate ? 'default' : 'ghost'} 
            className={`text-xs h-8 shrink-0 ${activeTab === 'FUTURE' && !selectedDate ? 'bg-slate-800 text-white font-bold' : ''}`}
            onClick={() => handleTabChange('FUTURE')}
          >
            All Future ({futureCount})
          </Button>
          {visitCount > 0 && (
            <Button 
              size="sm" 
              variant={activeTab === 'VISITS' && !selectedDate ? 'default' : 'ghost'} 
              className={`text-xs h-8 shrink-0 ${activeTab === 'VISITS' && !selectedDate ? 'bg-indigo-600 text-white font-bold' : ''}`}
              onClick={() => handleTabChange('VISITS')}
            >
              Visits ({visitCount})
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Search customer, plot, or site..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 text-xs"
          />
        </div>
      </div>

      {/* Notification Cards List */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#1e295d] shrink-0" />
            {selectedDate ? (
              <span>
                Schedule for {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setSelectedDate(null)} 
                  className="ml-2 text-xs text-blue-700 hover:text-blue-800 underline p-0 h-auto inline"
                >
                  (Clear date filter)
                </Button>
              </span>
            ) : (
              <span>
                {activeTab === 'TOMORROW' ? 'Installments Due Tomorrow (1-Day Advance Reminder)' :
                 activeTab === 'TODAY' ? 'Installments Due Today' :
                 activeTab === 'OVERDUE' ? 'Overdue Installment Reminders' :
                 activeTab === 'FUTURE' ? 'All Scheduled Future Installments' :
                 'Active Payment Reminders & Alerts'}
              </span>
            )}
          </CardTitle>
          <span className="text-xs font-normal text-slate-500">
            Showing {filteredList.length} reminder{filteredList.length === 1 ? '' : 's'}
          </span>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="animate-spin w-8 h-8 text-[#1e295d] mb-2" />
              <span className="text-xs">Checking installment schedules and dates...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-70" />
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">No Reminders Found</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {selectedDate 
                  ? 'No installments or follow-ups are scheduled for this specific date.' 
                  : activeTab === 'TOMORROW' 
                  ? 'No customer payments are due tomorrow.' 
                  : 'All scheduled installment reminders are clear for this selection.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredList.map((item) => (
                <div 
                  key={item.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 ${
                    item.statusInfo.type === 'TOMORROW'
                      ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60 hover:shadow-xs'
                      : item.statusInfo.type === 'TODAY'
                      ? 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-300 dark:border-blue-900/60 hover:shadow-xs'
                      : item.statusInfo.type === 'OVERDUE'
                      ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 hover:shadow-xs'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {/* Left Column: Customer & Due Info */}
                  <div className="space-y-1.5 flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className={`text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-full border ${item.statusInfo.badgeClass}`}>
                        {item.statusInfo.label}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.formNumber}
                      </span>
                      {item.siteName && (
                        <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 truncate max-w-full">
                          <MapPin className="w-3 h-3 text-[#1e295d] shrink-0" />
                          <span className="truncate">{item.siteName} {item.plotNo ? `(Plot ${item.plotNo})` : ''}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {item.customerName}
                      </h3>
                      {item.whatsappNo && (
                        <span className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1">
                          • <Phone className="w-3 h-3 text-slate-400" /> {item.whatsappNo}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1">
                      <span>
                        <strong>Installment:</strong> <span className="text-slate-900 dark:text-slate-100 font-bold">{item.installmentLabel}</span>
                      </span>
                      <span>
                        <strong>Due Date:</strong> <span className="font-bold text-[#1e295d] dark:text-blue-400">{item.dueDate.toLocaleDateString('en-IN')}</span>
                      </span>
                      {item.expectedAmount && (
                        <span>
                          <strong>Expected:</strong> <span className="font-extrabold text-emerald-700 dark:text-emerald-400">₹ {parseFloat(item.expectedAmount).toLocaleString('en-IN')}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0 pt-2 sm:pt-0 border-t md:border-t-0 border-slate-200/50">
                    {/* Alert Admin WhatsApp (+91 83788 14714) */}
                    <a 
                      href={getAdminWhatsAppLink(item)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button 
                        size="sm" 
                        className="h-8 text-xs font-bold bg-[#1e295d] hover:bg-[#151c40] text-white shadow-xs flex items-center justify-center gap-1.5 w-full sm:w-auto"
                        title={`Send Reminder to Admin (${ADMIN_WHATSAPP_DISPLAY})`}
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> Alert Admin
                      </Button>
                    </a>

                    {/* Send WhatsApp Reminder to Customer */}
                    {item.whatsappNo && (
                      <a 
                        href={getCustomerWhatsAppLink(item)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto"
                      >
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 flex items-center justify-center gap-1.5 shadow-xs w-full sm:w-auto"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" /> Remind Customer
                        </Button>
                      </a>
                    )}

                    {/* Open Payment Ledger */}
                    <Link href="/dashboard/payments" className="w-full sm:w-auto">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 flex items-center justify-center gap-1 shadow-xs w-full sm:w-auto"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Ledger
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin w-8 h-8 text-[#1e295d] mb-2" />
        <span className="text-xs">Loading payment reminders & schedules...</span>
      </div>
    }>
      <NotificationsContent />
    </Suspense>
  );
}
