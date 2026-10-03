"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit2, FileText, Printer, Download, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function FormsListPage() {
  const [forms, setForms] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'RECEIPTS' | 'EN' | 'MR'>('RECEIPTS');
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchForms();
  }, [search]);

  const fetchForms = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      const res = await api.get(`/forms?${params.toString()}`);
      setForms(res.data.forms);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await api.delete(`/forms/${id}`);
        fetchForms();
      } catch (error) {
        console.error('Failed to delete form:', error);
        alert('Failed to delete form');
      }
    }
  };

  const handleSelect = (id: string) => {
    setSelectedForms(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handlePrintSelected = () => {
    if (selectedForms.length === 0) return;
    // Open a multi-print window or route
    // Since we don't have a multi-print route yet, we can open them in new tabs or navigate to a special route.
    // For now, let's navigate to the first one, or ideal implementation: a dedicated multi-print page.
    const query = selectedForms.join(',');
    window.open(`/dashboard/forms/print-multiple?ids=${query}`, '_blank');
  };

  const receipts = forms.filter((f: any) => f.formType === 'RECEIPT');
  const enForms = forms.filter((f: any) => f.formType === 'CUSTOMER_INFO' && f.language === 'EN');
  const mrForms = forms.filter((f: any) => f.formType === 'CUSTOMER_INFO' && f.language === 'MR');

  const getActiveForms = () => {
    if (activeTab === 'RECEIPTS') return receipts;
    if (activeTab === 'EN') return enForms;
    return mrForms;
  };

  const renderTable = (data: any[]) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
          <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent dark:hover:bg-transparent">
            <TableHead className="w-12 text-slate-700 dark:text-slate-300">
              <CheckSquare className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Form Number</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Customer Name</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Date</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.map((form: any) => (
            <TableRow 
              key={form._id}
              className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
            >
              <TableCell>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-red-600 focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
                  checked={selectedForms.includes(form._id)}
                  onChange={() => handleSelect(form._id)}
                />
              </TableCell>
              <TableCell className="font-medium text-slate-900 dark:text-slate-100">{form.formNumber}</TableCell>
              <TableCell className="text-slate-800 dark:text-slate-200">{form.formData.customerName || form.formData.name || 'N/A'}</TableCell>
              <TableCell className="text-slate-500 dark:text-slate-400">{new Date(form.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  form.status === 'SAVED' 
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50' 
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}>
                  {form.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Link href={`/dashboard/forms/${form._id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit Form">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/forms/${form._id}/preview`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800" title="Preview Form">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(form._id)}
                    className="h-8 w-8 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" 
                    title="Delete Form"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
              <TableCell colSpan={6} className="text-center py-12 text-slate-500 dark:text-slate-400">
                No forms found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">Saved Forms</h1>
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <Link href="/dashboard/forms/create/receipt" className="flex-1 sm:flex-none">
            <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs font-bold text-xs sm:text-sm border-0">
              <Plus className="w-3.5 h-3.5 mr-1" /> Receipt
            </Button>
          </Link>
          <Link href="/dashboard/forms/create/english" className="flex-1 sm:flex-none">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs font-bold text-xs sm:text-sm border-0">
              <Plus className="w-3.5 h-3.5 mr-1" /> EN Form
            </Button>
          </Link>
          <Link href="/dashboard/forms/create/marathi" className="flex-1 sm:flex-none">
            <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-xs font-bold text-xs sm:text-sm border-0">
              <Plus className="w-3.5 h-3.5 mr-1" /> MR Form
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg w-full sm:w-auto border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('RECEIPTS')}
              className={`flex-1 sm:flex-none px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-all whitespace-nowrap ${activeTab === 'RECEIPTS' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
            >
              Receipts ({receipts.length})
            </button>
            <button 
              onClick={() => setActiveTab('EN')}
              className={`flex-1 sm:flex-none px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-all whitespace-nowrap ${activeTab === 'EN' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
            >
              English ({enForms.length})
            </button>
            <button 
              onClick={() => setActiveTab('MR')}
              className={`flex-1 sm:flex-none px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-all whitespace-nowrap ${activeTab === 'MR' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
            >
              Marathi ({mrForms.length})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto items-stretch sm:items-center">
            {selectedForms.length > 0 && (
              <Button onClick={handlePrintSelected} className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 shrink-0 shadow-xs text-xs h-9">
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Selected ({selectedForms.length})
              </Button>
            )}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
              <Input 
                placeholder="Search forms..." 
                className="pl-9 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm h-9 focus-visible:ring-red-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        {renderTable(getActiveForms())}
      </Card>
    </div>
  );
}
