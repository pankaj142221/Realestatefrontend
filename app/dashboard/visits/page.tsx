"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Loader2, Printer, Eye, MapPin, Phone, User, Calendar } from 'lucide-react';
import api from '@/lib/api';

export default function VisitsPage() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [lang, setLang] = useState('EN');
  
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    visitDate: new Date().toISOString().split('T')[0],
    location: '',
    birthdayDate: '',
    budget: '',
    siteName: 'Vedant Park',
    remarks: '',
    status: 'PENDING',
    followUpDate: ''
  });

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const res = await api.get('/visits');
      setVisits(res.data.visits);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/visits', formData);
      setIsDialogOpen(false);
      setFormData({
        clientName: '',
        phone: '',
        visitDate: new Date().toISOString().split('T')[0],
        location: '',
        birthdayDate: '',
        budget: '',
        siteName: 'Vedant Park',
        remarks: '',
        status: 'PENDING',
        followUpDate: ''
      });
      fetchVisits();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredVisits = visits.filter((v: any) => 
    (v.clientName || '').toLowerCase().includes(search.toLowerCase()) || 
    (v.phone || '').includes(search)
  );

  const handlePrintVisit = (visit: any) => {
    setSelectedVisit(visit);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">Client Visits</h1>
        <Button className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md hover:from-red-700 hover:to-red-800" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Visit
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[92vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle>{lang === 'EN' ? 'Add Client Visit' : 'नवीन क्लायंट भेट जोडा'}</DialogTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => setLang(lang === 'EN' ? 'MR' : 'EN')} className="mr-6 text-xs">
                {lang === 'EN' ? 'मराठी (MR)' : 'English (EN)'}
              </Button>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{lang === 'EN' ? 'Client Name' : 'क्लायंटचे नाव'}</label>
                  <Input required value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{lang === 'EN' ? 'Phone' : 'फोन'}</label>
                  <Input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{lang === 'EN' ? 'Visit Date' : 'भेट दिनांक'}</label>
                  <Input type="date" required value={formData.visitDate} onChange={(e) => setFormData({...formData, visitDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{lang === 'EN' ? 'Site Name' : 'साईटचे नाव'}</label>
                  <Input value={formData.siteName} onChange={(e) => setFormData({...formData, siteName: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{lang === 'EN' ? 'Location' : 'ठिकाण'}</label>
                  <Input required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder={lang === 'EN' ? "Pune, Aurangabad, etc." : "पुणे, औरंगाबाद..."} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{lang === 'EN' ? 'Birthday Date' : 'जन्म तारीख'}</label>
                  <Input type="date" value={formData.birthdayDate} onChange={(e) => setFormData({...formData, birthdayDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{lang === 'EN' ? 'Budget' : 'बजेट'}</label>
                  <Input value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{lang === 'EN' ? 'Status' : 'स्थिती'}</label>
                  <Select value={formData.status} onValueChange={(val: string | null) => { if (val) setFormData({...formData, status: val}); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">{lang === 'EN' ? 'Pending' : 'प्रलंबित'}</SelectItem>
                      <SelectItem value="FOLLOWUP">{lang === 'EN' ? 'Follow Up' : 'फॉलो-अप'}</SelectItem>
                      <SelectItem value="CONVERTED">{lang === 'EN' ? 'Converted' : 'रूपांतरित'}</SelectItem>
                      <SelectItem value="LOST">{lang === 'EN' ? 'Lost' : 'गमावले'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.status === 'FOLLOWUP' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{lang === 'EN' ? 'Follow-up Date' : 'फॉलो-अप दिनांक'}</label>
                  <Input type="date" value={formData.followUpDate || ''} onChange={(e) => setFormData({...formData, followUpDate: e.target.value})} />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">{lang === 'EN' ? 'Remarks' : 'रिमार्क्स'}</label>
                <Input value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800">{lang === 'EN' ? 'Save Visit' : 'भेट जतन करा'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search by client name or phone..." 
              className="pl-9 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead className="dark:text-slate-300">Date</TableHead>
                <TableHead className="dark:text-slate-300">Client Name</TableHead>
                <TableHead className="dark:text-slate-300">Phone</TableHead>
                <TableHead className="dark:text-slate-300">Site / Location</TableHead>
                <TableHead className="dark:text-slate-300">Status</TableHead>
                <TableHead className="dark:text-slate-300">Remarks</TableHead>
                <TableHead className="dark:text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto text-slate-400" />
                  </TableCell>
                </TableRow>
              ) : filteredVisits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No visits found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisits.map((visit: any) => (
                  <TableRow key={visit._id} className="dark:hover:bg-slate-800/50">
                    <TableCell className="text-slate-500 dark:text-slate-400">{new Date(visit.visitDate).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{visit.clientName}</TableCell>
                    <TableCell className="dark:text-slate-300">{visit.phone}</TableCell>
                    <TableCell>
                      <div className="text-sm dark:text-slate-200">{visit.siteName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{visit.location}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        visit.status === 'CONVERTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        visit.status === 'LOST' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' :
                        visit.status === 'FOLLOWUP' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {visit.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400 max-w-[150px] truncate">{visit.remarks}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" onClick={() => handlePrintVisit(visit)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Visit Detail / Print Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[760px] max-h-[92vh] overflow-y-auto p-0 border border-slate-200 dark:border-slate-800 shadow-2xl print:static print:top-0 print:left-0 print:translate-x-0 print:translate-y-0 print:transform-none print:w-[210mm] print:max-w-[210mm] print:p-0 print:m-0 print:border-none print:shadow-none print:bg-white print:overflow-visible">
          {/* Modal Top Navigation Bar (Hidden on print) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-6 pb-3 sm:pb-4 mb-2 border-b border-slate-200 dark:border-slate-800 print:hidden">
            <DialogTitle className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
              {lang === 'EN' ? 'Client Visit Details' : 'क्लायंट भेट तपशील'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setLang(lang === 'EN' ? 'MR' : 'EN')} className="text-xs h-8 flex-1 sm:flex-none">
                {lang === 'EN' ? 'मराठी (MR)' : 'English (EN)'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()} className="bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs h-8 flex-1 sm:flex-none">
                <Printer className="w-4 h-4 mr-1.5" /> {lang === 'EN' ? 'Print Report' : 'प्रिंट अहवाल'}
              </Button>
            </div>
          </div>
          
          {selectedVisit && (
            <div id="print-area" className="print-sheet-visit text-black p-3 sm:p-6 pt-2 print:p-2">
              {/* Outer Decorative Border Frame (Leaves nice side border lines on left and right) */}
              <div className="border-2 border-red-900/85 rounded-2xl p-3 sm:p-6 bg-white print:border-2 print:border-red-900 print:p-6 shadow-xs relative">
                {/* Header Banner */}
                <div className="border-b-2 border-amber-500/80 pb-3 sm:pb-4 mb-4 sm:mb-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3.5">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-amber-400 bg-white p-1 overflow-hidden shadow-xs shrink-0">
                        <img src="/rightsidelogo.png" className="w-full h-full object-contain" alt="Mahalaxmi Developers Logo" />
                      </div>
                      <div>
                        <h1 className="text-lg sm:text-2xl font-black text-red-700 leading-tight tracking-tight">
                          महालक्ष्मी डेव्हलपर्स (Mahalaxmi Developers)
                        </h1>
                        <p className="text-[10px] sm:text-xs font-bold text-amber-900 tracking-wider mt-0.5">
                          {lang === 'EN' ? 'CLIENT VISIT & INQUIRY STATEMENT' : 'ग्राहक भेट व चौकशी नोंद अहवाल'}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                          Site: Vedant Park | Land Development & Housing Projects
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right text-xs self-end sm:self-auto">
                      <div className="bg-slate-900 text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded font-bold inline-block text-[10px] sm:text-[11px] mb-1 shadow-xs">
                        VISIT REPORT
                      </div>
                      <p className="font-bold text-slate-700 text-[11px] sm:text-xs">
                        {lang === 'EN' ? 'Date' : 'दिनांक'}: {new Date(selectedVisit.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Structured Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-4">
                  {/* Client Name */}
                  <div className="bg-slate-50 border border-slate-200 p-2.5 sm:p-3.5 rounded-xl shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-red-600" /> {lang === 'EN' ? 'CLIENT NAME' : 'ग्राहकाचे नाव'}
                    </p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900">{selectedVisit.clientName}</p>
                  </div>

                  {/* Phone */}
                  <div className="bg-slate-50 border border-slate-200 p-2.5 sm:p-3.5 rounded-xl shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> {lang === 'EN' ? 'CONTACT NUMBER' : 'संपर्क क्रमांक'}
                    </p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900">{selectedVisit.phone}</p>
                  </div>

                  {/* Site & Location */}
                  <div className="bg-slate-50 border border-slate-200 p-2.5 sm:p-3.5 rounded-xl shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-600" /> {lang === 'EN' ? 'SITE & LOCATION' : 'साईट आणि ठिकाण'}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{selectedVisit.siteName || 'Vedant Park'}</p>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">{selectedVisit.location || 'N/A'}</p>
                  </div>

                  {/* Visit Date */}
                  <div className="bg-slate-50 border border-slate-200 p-2.5 sm:p-3.5 rounded-xl shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> {lang === 'EN' ? 'VISIT DATE' : 'भेट दिनांक'}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {new Date(selectedVisit.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {selectedVisit.birthdayDate && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lang === 'EN' ? 'DOB' : 'जन्म तारीख'}: {new Date(selectedVisit.birthdayDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>

                  {/* Budget */}
                  <div className="bg-slate-50 border border-slate-200 p-2.5 sm:p-3.5 rounded-xl shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      {lang === 'EN' ? 'EXPECTED BUDGET' : 'अपेक्षित बजेट'}
                    </p>
                    <p className="text-base sm:text-lg font-black text-red-700">
                      {selectedVisit.budget ? `₹ ${parseFloat(selectedVisit.budget).toLocaleString('en-IN')}` : 'N/A'}
                    </p>
                  </div>

                  {/* Status & Follow-up */}
                  <div className="bg-slate-50 border border-slate-200 p-2.5 sm:p-3.5 rounded-xl shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      {lang === 'EN' ? 'LEAD STATUS' : 'सद्य स्थिती'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-block border ${
                        selectedVisit.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        selectedVisit.status === 'LOST' ? 'bg-slate-200 text-slate-800 border-slate-300' :
                        selectedVisit.status === 'FOLLOWUP' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {selectedVisit.status}
                      </span>
                    </div>
                    {selectedVisit.status === 'FOLLOWUP' && selectedVisit.followUpDate && (
                      <p className="text-xs font-bold text-blue-700 mt-1.5">
                        {lang === 'EN' ? 'Next Follow-up:' : 'पुढील फॉलो-अप:'} {new Date(selectedVisit.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Remarks & Requirements */}
                {selectedVisit.remarks && (
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-2xs mb-5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      {lang === 'EN' ? 'DISCUSSION NOTES & REMARKS' : 'चर्चा तपशील व रिमार्क्स'}
                    </p>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">{selectedVisit.remarks}</p>
                  </div>
                )}

                {/* Signatures Block */}
                <div className="flex justify-between items-end mt-8 pt-4 border-t border-slate-300 text-xs">
                  <div className="text-center">
                    <div className="border-t border-black w-40 mb-1 mt-6"></div>
                    <span className="font-bold text-slate-800">{lang === 'EN' ? 'Client Signature' : 'ग्राहकाची सही'}</span>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-black w-40 mb-1 mt-6"></div>
                    <span className="font-bold text-slate-800">{lang === 'EN' ? 'Authorized Representative' : 'अधिकृत प्रतिनिधी'}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Mahalaxmi Developers</p>
                  </div>
                </div>

                {/* Footer Tagline */}
                <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
                  <p className="font-semibold text-slate-700">Mahalaxmi Developers — Building Dreams with Trust & Excellence</p>
                  <p>Corporate Office: Vedant Park | Contact: +91 92112 97169</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
