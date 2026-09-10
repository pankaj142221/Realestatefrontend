"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldAlert, 
  LogOut, 
  Loader2, 
  PlusCircle, 
  Building, 
  Users, 
  CreditCard, 
  Bell, 
  Moon, 
  Sun,
  Clock,
  Calendar as CalendarIcon,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  CalendarDays,
  Menu,
  X,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseDueDate, getDueStatus, DueStatusResult } from '@/lib/utils';

const ADMIN_WHATSAPP_NUMBER = '918378814714';
const ADMIN_WHATSAPP_DISPLAY = '+91 83788 14714';

interface AlertNotificationItem {
  id: string;
  customerName: string;
  whatsappNo?: string;
  siteName: string;
  plotNo: string;
  installmentLabel: string;
  expectedAmount: string;
  dueDate: Date;
  dateStr: string;
  statusInfo: DueStatusResult;
  tab: 'TOMORROW' | 'TODAY' | 'OVERDUE' | 'FUTURE';
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [tomorrowCount, setTomorrowCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [futureCount, setFutureCount] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState<AlertNotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setIsNotifOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  useEffect(() => {
    // Check initial preference
    if (document.documentElement.classList.contains('dark') || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const fetchUserAndAlerts = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);

        // Calculate urgent reminder alerts (Tomorrow 1-Day, Today, Overdue, Future)
        try {
          const formsRes = await api.get('/forms');
          const forms = formsRes.data.forms || [];
          const today = new Date();
          let countTomorrow = 0;
          let countToday = 0;
          let countOverdue = 0;
          let countFuture = 0;
          const alertsList: AlertNotificationItem[] = [];

          forms.filter((f: any) => f.formType === 'CUSTOMER_INFO').forEach((f: any) => {
            const formData = f.formData || {};
            const payments = formData.payments || [];
            if (Array.isArray(payments)) {
              payments.forEach((p: any, idx: number) => {
                const isScheduledOrPending = p.status !== 'PAID' && !p.receiptId;
                if (p.date && isScheduledOrPending) {
                  const pDate = parseDueDate(p.date);
                  if (pDate) {
                    const statusInfo = getDueStatus(pDate, today);
                    let tabType: 'TOMORROW' | 'TODAY' | 'OVERDUE' | 'FUTURE' = 'FUTURE';

                    if (statusInfo.type === 'TOMORROW') {
                      countTomorrow++;
                      tabType = 'TOMORROW';
                    } else if (statusInfo.type === 'TODAY') {
                      countToday++;
                      tabType = 'TODAY';
                    } else if (statusInfo.type === 'OVERDUE') {
                      countOverdue++;
                      tabType = 'OVERDUE';
                    } else {
                      countFuture++;
                      tabType = 'FUTURE';
                    }

                    if (statusInfo.isUrgent) {
                      alertsList.push({
                        id: p.id || `PAY-${f._id}-${idx}`,
                        customerName: formData.customerName || formData.name || f.formNumber,
                        whatsappNo: formData.whatsappNo || formData.alternateNumber || '',
                        siteName: formData.siteName || '',
                        plotNo: formData.plotNo || '',
                        installmentLabel: p.remark || p.type || `Installment #${idx + 1}`,
                        expectedAmount: p.amount || '',
                        dueDate: pDate,
                        dateStr: p.date,
                        statusInfo,
                        tab: tabType
                      });
                    }
                  }
                }
              });
            }
          });

          // Sort alerts: Overdue first, then Today, then Tomorrow
          alertsList.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

          setTomorrowCount(countTomorrow);
          setTodayCount(countToday);
          setOverdueCount(countOverdue);
          setFutureCount(countFuture);
          setAlertCount(countTomorrow + countToday + countOverdue);
          setRecentAlerts(alertsList);
        } catch (e) {
          console.error('Alerts count error:', e);
        }

      } catch (error) {
        // Interceptor handles redirect
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndAlerts();
  }, [pathname]);

  // WhatsApp Batch / Digest Message to Admin (+91 83788 14714)
  const getAdminDigestWhatsAppLink = (filterType: 'TOMORROW' | 'ALL_URGENT') => {
    const targetItems = filterType === 'TOMORROW' 
      ? recentAlerts.filter(r => r.tab === 'TOMORROW')
      : recentAlerts;

    if (targetItems.length === 0) {
      const emptyMsg = `🔔 *महालक्ष्मी डेव्हलपर्स — ॲडमिन रिपोर्ट*\n\n✅ ${filterType === 'TOMORROW' ? 'उद्या देय असलेला कोणताही हप्ता नाही.' : 'आज किंवा उद्या कोणताही प्रलंबित ॲलर्ट नाही.'} सर्व पेमेंट शेड्युल सुरळीत आहेत.`;
      return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(emptyMsg)}`;
    }

    let text = `🔔 *महालक्ष्मी डेव्हलपर्स — ॲडमिन ${filterType === 'TOMORROW' ? '1-दिवस अगोदर (Due Tomorrow)' : 'दैनिक पेमेंट'} रिमाइंडर रिपोर्ट*\n`;
    text += `📅 *दिनांक:* ${new Date().toLocaleDateString('en-IN')}\n`;
    text += `📊 *एकूण हप्ते संख्या:* ${targetItems.length}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    targetItems.forEach((it, idx) => {
      const badge = it.tab === 'TOMORROW' ? '⚠️ [उद्या देय]' :
                    it.tab === 'TODAY' ? '🚨 [आज देय]' : '❗ [थकबाकी]';
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

  const getAdminSingleWhatsAppLink = (item: AlertNotificationItem) => {
    const formattedDate = item.dueDate.toLocaleDateString('en-IN');
    let statusHeadline = '';
    if (item.tab === 'TOMORROW') {
      statusHeadline = '⚠️ *उद्या देय असलेला हप्ता (1-Day Advance Reminder)*';
    } else if (item.tab === 'TODAY') {
      statusHeadline = '🚨 *आज देय असलेला हप्ता (Due Today Alert)*';
    } else if (item.tab === 'OVERDUE') {
      statusHeadline = '❗ *थकबाकी असलेला हप्ता (Overdue Reminder)*';
    } else {
      statusHeadline = '📅 *नियोजित आगामी हप्ता (Scheduled Installment)*';
    }

    const message = `🔔 *महालक्ष्मी डेव्हलपर्स — ॲडमिन पेमेंट अलर्ट*\n\n${statusHeadline}\n\n👤 *ग्राहक:* ${item.customerName}\n📱 *ग्राहक मोबाईल:* ${item.whatsappNo || 'उपलब्ध नाही'}\n🏡 *प्रकल्प/साईट:* ${item.siteName || 'महालक्ष्मी प्रोजेक्ट'} ${item.plotNo ? `(प्लॉट नं. ${item.plotNo})` : ''}\n🔖 *हप्ता तपशील:* ${item.installmentLabel}\n📅 *देय दिनांक:* ${formattedDate}\n💰 *अपेक्षित रक्कम:* ${item.expectedAmount ? `₹ ${parseFloat(item.expectedAmount).toLocaleString('en-IN')}` : '—'}\n\n📌 *सूचना:* कृपया उद्या या हप्त्याची वसुली व नोंद करावी.`;

    return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error(error);
    }
  };

  const handleNavigateToTab = (tab: 'TOMORROW' | 'TODAY' | 'OVERDUE' | 'FUTURE' | 'ALL_ALERTS') => {
    setIsNotifOpen(false);
    router.push(`/dashboard/notifications?tab=${tab}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-slate-400 w-8 h-8" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar - Hidden on mobile and print */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-slate-300 flex-col print:hidden shrink-0">
        <div className="p-6 flex items-center gap-3 text-white border-b border-yellow-500/20 bg-gradient-to-r from-yellow-500 to-black">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400/80 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            <img src="/rightsidelogo.png" className="w-full h-full object-contain rounded-full" alt="Logo" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white drop-shadow-md">Mahalaxmi Developers</span>
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-2">
          <Link href="/dashboard">
            <span className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/dashboard' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
              <LayoutDashboard size={20} /> Dashboard
            </span>
          </Link>
          <Link href="/dashboard/forms">
            <span className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/dashboard/forms' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
              <FileText size={20} /> Saved Forms
            </span>
          </Link>
          <Link href="/dashboard/visits">
            <span className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/dashboard/visits' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
              <Users size={20} /> Client Visits
            </span>
          </Link>
          <Link href="/dashboard/payments">
            <span className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/dashboard/payments' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
              <CreditCard size={20} /> Payments
            </span>
          </Link>
          <Link href="/dashboard/notifications">
            <span className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${pathname === '/dashboard/notifications' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
              <div className="flex items-center gap-3">
                <Bell size={20} /> Reminders
              </div>
              {alertCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                  {alertCount}
                </span>
              )}
            </span>
          </Link>
        </div>

        <div className="p-6 border-t border-slate-800">
          <div className="mb-4 px-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Logged in as</p>
            <p className="text-sm text-white truncate">{user.name}</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
            <LogOut size={20} className="mr-3" /> Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Slide-out Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer Sidebar */}
          <div className="relative w-72 max-w-[80vw] bg-slate-900 text-slate-300 flex flex-col z-50 h-full shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b border-yellow-500/20 bg-gradient-to-r from-yellow-500 to-black text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full border-2 border-amber-400/80 bg-white p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="/rightsidelogo.png" className="w-full h-full object-contain rounded-full" alt="Logo" />
                </div>
                <span className="font-bold text-sm tracking-tight text-white">Mahalaxmi</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-1.5 overflow-y-auto">
              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <span className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/dashboard' ? 'bg-slate-800 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'}`}>
                  <LayoutDashboard size={18} /> Dashboard
                </span>
              </Link>
              <Link href="/dashboard/forms" onClick={() => setIsMobileMenuOpen(false)}>
                <span className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/dashboard/forms' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white font-bold shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
                  <FileText size={18} /> Saved Forms
                </span>
              </Link>
              <Link href="/dashboard/visits" onClick={() => setIsMobileMenuOpen(false)}>
                <span className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/dashboard/visits' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white font-bold shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
                  <Users size={18} /> Client Visits
                </span>
              </Link>
              <Link href="/dashboard/payments" onClick={() => setIsMobileMenuOpen(false)}>
                <span className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/dashboard/payments' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white font-bold shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
                  <CreditCard size={18} /> Payments
                </span>
              </Link>
              <Link href="/dashboard/notifications" onClick={() => setIsMobileMenuOpen(false)}>
                <span className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/dashboard/notifications' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white font-bold shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
                  <div className="flex items-center gap-3">
                    <Bell size={18} /> Reminders
                  </div>
                  {alertCount > 0 && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                      {alertCount}
                    </span>
                  )}
                </span>
              </Link>
            </div>

            <div className="p-4 border-t border-slate-800">
              <div className="mb-3 px-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Logged in as</p>
                <p className="text-xs text-white truncate font-medium">{user.name}</p>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-xs text-slate-400 hover:text-white hover:bg-slate-800 h-9">
                <LogOut size={16} className="mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar - Hidden on print */}
        <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center print:hidden shadow-xs relative z-40">
          <div className="flex items-center gap-2 md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-700 dark:text-slate-200 h-9 w-9 p-0"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="font-black text-sm sm:text-base flex items-center gap-1.5 text-slate-900 dark:text-slate-100 truncate">
              <div className="w-7 h-7 rounded-full border border-amber-400/80 bg-white p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                <img src="/rightsidelogo.png" className="w-full h-full object-contain rounded-full" alt="Logo" />
              </div>
              <span className="truncate">Mahalaxmi</span>
            </div>
          </div>
          
          <div className="hidden md:block">
            {/* Spacer for desktop left side */}
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notification Bell with Dropdown Popover */}
            <div className="relative" ref={notifRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative rounded-full transition-colors h-9 w-9 ${
                  isNotifOpen 
                    ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600'
                }`}
                title="Payment Due Notifications"
              >
                <Bell size={20} className={alertCount > 0 ? 'text-red-600' : ''} />
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs animate-pulse">
                    {alertCount > 99 ? '99+' : alertCount}
                  </span>
                )}
              </Button>

              {/* Popover Menu */}
              {isNotifOpen && (
                <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto right-2 sm:right-0 top-14 sm:top-auto sm:mt-2 w-auto sm:w-96 max-w-[95vw] sm:max-w-none bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  {/* Dropdown Header */}
                  <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-white">Payment Due Notifications</h3>
                    </div>
                    {alertCount > 0 ? (
                      <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                        {alertCount} Action Required
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        All Clear
                      </span>
                    )}
                  </div>

                  {/* Admin WhatsApp Automation 1-Click Action */}
                  <div className="p-2.5 bg-gradient-to-r from-[#1a237e] to-[#1e295d] text-white flex items-center justify-between gap-2 border-b border-blue-900 shadow-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-3.5 h-3.5 text-slate-950 fill-current" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black truncate text-white leading-tight">Admin: {ADMIN_WHATSAPP_DISPLAY}</p>
                        <p className="text-[9px] text-blue-200 truncate">1-Day Advance WhatsApp Alert</p>
                      </div>
                    </div>
                    <a
                      href={getAdminDigestWhatsAppLink('TOMORROW')}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button 
                        size="sm" 
                        className="h-7 text-[10px] font-black bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 rounded-lg shadow-xs"
                      >
                        Send 1-Day Digest ({tomorrowCount})
                      </Button>
                    </a>
                  </div>

                  {/* 4 Quick Filter Tabs */}
                  <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                    <div 
                      onClick={() => handleNavigateToTab('TOMORROW')}
                      className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100 cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-[11px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-tight">Due Tomorrow</span>
                        <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-base sm:text-lg font-black text-amber-950 dark:text-amber-200">{tomorrowCount}</span>
                        <span className="text-[9px] text-amber-700/80 dark:text-amber-400 font-medium">1-day advance</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => handleNavigateToTab('TODAY')}
                      className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 hover:bg-red-100 cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-[11px] font-black text-red-900 dark:text-red-300 uppercase tracking-tight">Due Today</span>
                        <CalendarIcon className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-base sm:text-lg font-black text-red-950 dark:text-red-200">{todayCount}</span>
                        <span className="text-[9px] text-red-700/80 dark:text-red-400 font-medium">Collect today</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => handleNavigateToTab('OVERDUE')}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-[11px] font-black text-rose-900 dark:text-rose-300 uppercase tracking-tight">Overdue</span>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-base sm:text-lg font-black text-rose-950 dark:text-rose-200">{overdueCount}</span>
                        <span className="text-[9px] text-rose-700/80 dark:text-rose-400 font-medium">Past due</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => handleNavigateToTab('FUTURE')}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-[11px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-tight">Future</span>
                        <CalendarDays className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">{futureCount}</span>
                        <span className="text-[9px] text-slate-500 font-medium">Scheduled</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-Time Notification Items Feed */}
                  <div className="max-h-52 sm:max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
                    {recentAlerts.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center gap-1.5">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
                        <p className="font-semibold">No urgent alerts for today or tomorrow</p>
                        <p className="text-[10px] text-slate-400">Click &apos;Future&apos; to view upcoming scheduled installments</p>
                      </div>
                    ) : (
                      recentAlerts.slice(0, 5).map((item) => (
                        <div 
                          key={item.id}
                          className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors flex items-start justify-between gap-2 ${
                            item.tab === 'TOMORROW' 
                              ? 'bg-amber-50/50 dark:bg-amber-950/20' 
                              : item.tab === 'TODAY' 
                              ? 'bg-red-50/50 dark:bg-red-950/20' 
                              : 'bg-rose-50/50 dark:bg-rose-950/20'
                          }`}
                        >
                          <div 
                            onClick={() => handleNavigateToTab(item.tab)}
                            className="flex items-start gap-2.5 flex-1 cursor-pointer min-w-0"
                          >
                            <div className="mt-0.5 shrink-0">
                              {item.tab === 'TOMORROW' ? (
                                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                              ) : item.tab === 'TODAY' ? (
                                <CalendarIcon className="w-4 h-4 text-red-600 animate-pulse" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                                  {item.customerName}
                                </p>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                                {item.tab === 'TOMORROW' ? '⚠️ Scheduled tomorrow' :
                                 item.tab === 'TODAY' ? '🚨 Due today' :
                                 '❗ Overdue'} ({item.installmentLabel})
                              </p>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="text-[10px] text-slate-400">
                                  {item.dueDate.toLocaleDateString('en-IN')} {item.siteName ? `• ${item.siteName}` : ''}
                                </span>
                                {item.expectedAmount && (
                                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                    ₹ {parseFloat(item.expectedAmount).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center self-center pl-1">
                            <a
                              href={getAdminSingleWhatsAppLink(item)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={`WhatsApp Admin alert for ${item.customerName}`}
                            >
                              <Button
                                size="icon"
                                className="h-7 w-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-xs"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                              </Button>
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Dropdown Footer Link */}
                  <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Button 
                      size="sm" 
                      onClick={() => handleNavigateToTab('ALL_ALERTS')}
                      className="w-full text-xs font-bold bg-[#1e295d] hover:bg-[#151c40] text-white h-8"
                    >
                      Open Reminders & Calendar Schedule <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-3 sm:p-6 lg:p-10 overflow-auto print:p-0 print:overflow-visible bg-slate-50 dark:bg-slate-950">
          {children}
        </div>
      </main>
    </div>
  );
}
