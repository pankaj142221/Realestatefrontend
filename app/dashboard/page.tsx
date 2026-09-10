"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Receipt, Clock, FilePlus, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, customerInfo: 0, receipts: 0 });
  const [recentForms, setRecentForms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/forms');
        const forms = res.data.forms || [];
        setStats({
          total: forms.length,
          customerInfo: forms.filter((f: any) => f.formType === 'CUSTOMER_INFO').length,
          receipts: forms.filter((f: any) => f.formType === 'RECEIPT').length,
        });
        setRecentForms(forms.slice(0, 5));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="border-slate-100 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Forms</CardTitle>
            <FileText className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-100 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Customer Info Forms</CardTitle>
            <FileText className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.customerInfo}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-100 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Receipts (पावती)</CardTitle>
            <Receipt className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.receipts}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-100 dark:border-slate-700 dark:bg-slate-800 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <div className="h-2 w-full bg-amber-500"></div>
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-marathi)] dark:text-slate-100">ग्राहक माहिती (मराठी)</CardTitle>
            <CardDescription className="dark:text-slate-400">Customer Info Form — Marathi</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/forms/create/marathi">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-md">
                <FilePlus className="mr-2 h-4 w-4" /> Create Form
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-100 dark:border-slate-700 dark:bg-slate-800 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <div className="h-2 w-full bg-blue-500"></div>
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Customer Info (English)</CardTitle>
            <CardDescription className="dark:text-slate-400">Customer Info Form — English</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/forms/create/english">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md">
                <FilePlus className="mr-2 h-4 w-4" /> Create Form
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-100 dark:border-slate-700 dark:bg-slate-800 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <div className="h-2 w-full bg-emerald-500"></div>
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-marathi)] dark:text-slate-100">पावती (Receipt)</CardTitle>
            <CardDescription className="dark:text-slate-400">Payment Receipt</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/forms/create/receipt">
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-md">
                <FilePlus className="mr-2 h-4 w-4" /> Create Receipt
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Recent Forms</h2>
          <Link href="/dashboard/forms">
            <Button variant="ghost" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              View all <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <Card className="border-slate-100 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {recentForms.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">No forms created yet.</div>
            ) : (
              recentForms.map((form: any) => (
                <div key={form._id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      form.formType === 'RECEIPT'
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : form.language === 'EN'
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    }`}>
                      {form.formType === 'RECEIPT' ? <Receipt className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{form.formData.customerName || form.formData.name || form.formNumber}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{form.formNumber}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(form.createdAt).toLocaleDateString()}
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                          form.formType === 'RECEIPT'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        }`}>
                          {form.formType === 'RECEIPT' ? 'Receipt' : 'Customer Info'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{form.status}</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/dashboard/forms/${form._id}/preview`}>
                    <Button variant="outline" size="sm" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">View</Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
