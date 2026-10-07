"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Edit2 } from 'lucide-react';
import Link from 'next/link';

export function HeaderBanner({ title, subtitle, isMarathi }: { title: string; subtitle?: string; isMarathi?: boolean }) {
  const displayTitle = isMarathi ? (title || 'महालक्ष्मी डेव्हलपर्स') : (title ? title : 'Mahalaxmi Developers');

  return (
    <div className="flex items-center gap-3 sm:gap-4 pb-2 mb-1 border-b-[1.5px] border-[#8b1a1a]">
      <div className="flex items-center shrink-0 pl-1">
        <img src="/mahalaxmi-group-logo.png" className="h-16 sm:h-20 object-contain" alt="Mahalaxmi Group" />
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <h1 className={`${
          isMarathi 
            ? 'text-[22px] sm:text-[28px] md:text-[32px] font-bold' 
            : 'text-[26px] sm:text-[32px] md:text-[38px] font-bold'
        } text-[#8b1a1a] leading-tight tracking-tight font-serif`}>
          {displayTitle}
        </h1>
        {subtitle && (
          <p className="text-[10px] sm:text-[11px] text-slate-500 tracking-wide uppercase mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export function SubtleWatermark() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-[0.15] print:opacity-[0.15] z-0">
      <div className="w-56 h-56 sm:w-[320px] sm:h-[320px] rounded-full overflow-hidden flex items-center justify-center">
        <img src="/rightsidelogo.png" className="w-full h-full object-contain filter grayscale contrast-125" alt="Watermark" />
      </div>
      <span className="text-sm sm:text-[26px] font-black tracking-[0.22em] text-gray-900 mt-2 uppercase text-center px-4">MAHALAXMI DEVELOPERS</span>
    </div>
  );
}

export function FieldLine({ label, value, bold, icon }: { label: string; value?: string; bold?: boolean; icon?: string }) {
  return (
    <div className={`flex flex-wrap sm:flex-nowrap items-baseline text-[12.5px] sm:text-[13.5px] md:text-[14px] ${bold ? 'text-[#8b1a1a] font-bold' : ''}`}>
      {icon && <span className="mr-1 mt-[2px] text-[10px]">{icon}</span>}
      <span className="font-bold shrink-0">{label} :</span>
      <span className="flex-1 ml-1.5 text-black font-bold break-words min-w-0" style={{ fontFamily: "var(--font-nunito-sans), 'Nunito Sans', sans-serif" }}>{value || '\u00A0'}</span>
    </div>
  );
}

export function ReceiptPreview({ form, d, fontClass, handlePrint }: any) {
  const isEN = form.language === 'EN';
  const t = isEN ? {
    title: 'Mahalaxmi Developers',
    receipt: 'RECEIPT',
    no: 'No:',
    date: 'Date:',
    name: 'Name :',
    details: 'Details :',
    paymentMode: 'Cash / Cheque / UTR No. :',
    bank: 'Bank :',
    branch: 'Branch :',
    chequeDate: 'Cheque Date :',
    amountWords: 'Amount in Words :',
    signature1: 'Signature of Payer',
    signature2: 'Signature of Receiver',
  } : {
    title: 'महालक्ष्मी डेव्हलपर्स',
    receipt: 'पावती',
    no: 'नंबर:',
    date: 'दिनांक:',
    name: 'नाव :',
    details: 'तपशिल :',
    paymentMode: 'द्वारा रोख / चेक / UTR नं. :',
    bank: 'बँक :',
    branch: 'शाखा :',
    chequeDate: 'चेक दिनांक :',
    amountWords: 'अक्षरी रु.',
    signature1: 'पैसे देणाऱ्याची सही',
    signature2: 'पैसे स्वीकारणाऱ्याची सही',
  };

  return (
    <div className={`space-y-6 print:space-y-0 w-full ${isEN ? 'font-sans' : fontClass}`}>
      <div className="flex justify-center w-full overflow-x-auto py-1 print:py-0 print:block">
        <div
          id="print-area"
          className="bg-white shadow-xl print:shadow-none text-black relative overflow-hidden print-sheet-receipt w-full max-w-[210mm] print:w-[210mm]"
          style={{ minHeight: '148.5mm', padding: '6mm 8mm', fontFamily: isEN ? 'sans-serif' : 'var(--font-marathi), Noto Sans Devanagari, sans-serif' }}
        >
          <SubtleWatermark />
          <div className="relative z-10 border border-[#8b1a1a] p-3 sm:p-4 rounded-sm">
            <HeaderBanner title={t.title} isMarathi={!isEN} />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-b border-gray-300 py-1.5 mt-2 mb-3 text-[11px] sm:text-[12px]">
              <div><span className="font-bold">{t.no}</span> <span className="px-2 min-w-[50px] inline-block font-bold">{form.formNumber}</span></div>
              <div className="bg-[#8b1a1a] text-white border border-[#8b1a1a] px-4 sm:px-6 py-0.5 font-extrabold text-[12px] sm:text-[13px] tracking-wider rounded-md shadow-xs">
                {t.receipt}
              </div>
              <div><span className="font-bold">{t.date}</span> <span className="px-2 inline-block min-w-[70px] font-bold">{new Date(form.createdAt).toLocaleDateString(isEN ? 'en-IN' : 'mr-IN')}</span></div>
            </div>

            <div className="space-y-3 sm:space-y-3.5 text-[12.5px] sm:text-[13.5px] px-1 sm:px-2">
              <div className="flex flex-col sm:flex-row items-start">
                <span className="font-bold shrink-0 w-full sm:w-[160px]">{t.name}</span>
                <span className="flex-1 text-black font-bold text-sm sm:text-[15.5px]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>{d.name || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start">
                <span className="font-bold shrink-0 w-full sm:w-[160px]">{t.details}</span>
                <span className="flex-1 text-black font-bold text-sm sm:text-[15.5px]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>{d.details || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start">
                <span className="font-bold shrink-0 w-full sm:w-[160px]">
                  {d.paymentType === 'Online' ? (isEN ? 'UPI ID :' : 'UPI आयडी :') : 
                   d.paymentType === 'Cheque' ? (isEN ? 'Cheque / RTGS / UTR No. :' : 'चेक / RTGS / UTR नं. :') : 
                   (isEN ? 'Payment Mode :' : 'पेमेंट प्रकार :')}
                </span>
                <span className="flex-1 text-black font-bold text-sm sm:text-[15.5px]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                  {d.paymentType} {d.paymentType !== 'Cash' && d.paymentModeNumber ? ` ${d.paymentModeNumber}` : ''}
                </span>
              </div>
              {d.paymentType !== 'Cash' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                  <div className="flex items-start">
                    <span className="font-bold shrink-0 mr-2">{d.paymentType === 'Online' ? (isEN ? 'Username :' : 'युजरनेम :') : t.bank}</span>
                    <span className="flex-1 text-black font-bold text-sm sm:text-[15.5px]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>{d.bank || '-'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-bold shrink-0 mr-2">{d.paymentType === 'Online' ? (isEN ? 'Reference :' : 'रिफरन्स :') : t.branch}</span>
                    <span className="flex-1 text-black font-bold text-sm sm:text-[15.5px]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>{d.branch || '-'}</span>
                  </div>
                  {d.paymentType === 'Cheque' && (
                    <div className="flex items-start">
                      <span className="font-bold shrink-0 mr-2">{t.chequeDate}</span>
                      <span className="flex-1 text-black font-bold text-sm sm:text-[15.5px]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>{d.chequeDate || '-'}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-start">
                <span className="font-bold shrink-0 w-full sm:w-[160px]">{t.amountWords}</span>
                <span className="flex-1 text-black font-bold text-sm sm:text-[15.5px]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>{d.amountWords || '-'}</span>
              </div>
              {d.remark && (
                <div className="flex flex-col sm:flex-row items-start">
                  <span className="font-bold shrink-0 w-full sm:w-[160px]">{isEN ? 'Remark :' : 'रिमार्क :'}</span>
                  <span className="flex-1 text-black font-bold text-sm sm:text-[15.5px]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>{d.remark || '-'}</span>
                </div>
              )}
            </div>

            <div className="flex items-stretch mt-3 sm:mt-4 mb-3">
              <div className="bg-[#8b1a1a] text-white border border-[#8b1a1a] border-r-0 flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-lg sm:text-[20px] font-black rounded-l">
                ₹
              </div>
              <div className="flex-1 border border-[#8b1a1a] rounded-r flex items-center px-3 text-base sm:text-[18px] font-black text-black bg-slate-50">
                {d.amount || '\u00A0'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 sm:mt-6 text-[10px]">
              <div className="text-gray-500 italic text-center sm:text-left">Cheque subject to realisation</div>
              <div className="flex justify-around sm:justify-end gap-6 w-full sm:w-auto">
                <div className="text-center">
                  <div className="border-t border-black w-28 sm:w-36 mb-1 mt-4"></div>
                  <span className="font-bold text-[#8b1a1a] text-[10px] sm:text-[11px]">{t.signature1}</span>
                </div>
                <div className="text-center">
                  <div className="border-t border-black w-28 sm:w-36 mb-1 mt-4"></div>
                  <span className="font-bold text-[#8b1a1a] text-[10px] sm:text-[11px]">{t.signature2}</span>
                </div>
              </div>
            </div>

            

          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomerInfoMarathiPreview({ form, d, fontClass, handlePrint, previewLang, setPreviewLang }: any) {
  return (
    <div className={`space-y-6 print:space-y-0 w-full ${fontClass}`}>
      <div id="print-area" className="print-container space-y-6 print:space-y-0 w-full">
        {/* Page 1 */}
        <div className="flex justify-center w-full overflow-x-auto py-1 print:py-0 print:block">
          <div
            className="bg-white shadow-xl print:shadow-none text-black flex flex-col justify-between relative overflow-hidden print-sheet-1 w-full max-w-[210mm] print:w-[210mm]"
            style={{ minHeight: '280mm', padding: '4mm 6mm', fontFamily: 'var(--font-marathi), Noto Sans Devanagari, sans-serif' }}
          >
            <SubtleWatermark />
            <div className="border border-[#8b1a1a] p-2 sm:p-[4.5mm] h-full flex flex-col justify-between flex-grow relative z-10 rounded-sm">
              <div>
                <HeaderBanner 
                  title="महालक्ष्मी डेव्हलपर्स" 
                  isMarathi={true} 
                />

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-b border-gray-300 py-1.5 text-[11px] sm:text-[12px] mb-3 mt-1">
                  <div><span className="font-bold">नंबर:</span> {form.formNumber}</div>
                  <div className="bg-[#8b1a1a] text-white px-4 sm:px-6 py-0.5 font-bold text-xs sm:text-[14px] rounded-full shadow-xs tracking-wide">
                    आनंदी ग्राहकांची माहिती
                  </div>
                  <div><span className="font-bold">दिनांक:</span> {new Date(form.createdAt).toLocaleDateString('mr-IN')}</div>
                </div>

                <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-[12px] mb-3.5">
                  <FieldLine label="ग्राहकाचे नाव" value={d.customerName} />
                  <FieldLine label="ग्राहकाचा संपूर्ण पत्ता" value={d.customerAddress} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-3">
                    <FieldLine label="व्हॉट्सॲप नंबर" value={d.whatsappNo} icon="📱" />
                    <FieldLine label="पर्यायी नंबर" value={d.alternateNumber} icon="💬" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-3 mt-2 sm:mt-3">
                    <FieldLine label="आधार कार्ड नं." value={d.aadharNo} icon="📄" />
                    <FieldLine label="पॅन कार्ड नं." value={d.panNo} icon="💳" />
                  </div>
                </div>

                <div className="bg-[#8b1a1a] text-white text-center py-1 sm:py-1.5 font-bold text-xs sm:text-[14px] mb-2.5 rounded-md shadow-xs tracking-wide">
                  {d.siteName || 'वेदांत पार्क'}
                </div>
                <div className="text-xs sm:text-[12px] space-y-2.5 sm:space-y-3 mb-3.5">
                  <div className="grid grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-3">
                    <FieldLine label="गट नं." value={d.gatNo} />
                    <FieldLine label="क्षेत्र" value={d.area} />
                    <FieldLine label="प्लॉट नं." value={d.plotNo} />
                    <FieldLine label="स्क्वे. फुट" value={d.sqFt} />
                  </div>
                </div>

                <div className="bg-[#8b1a1a] text-white text-center py-1 sm:py-1.5 font-bold text-xs sm:text-[14px] mb-2.5 rounded-md shadow-xs tracking-wide">
                  पेमेंटची माहिती
                </div>
                <div className="text-xs sm:text-[12px] space-y-2.5 sm:space-y-3 mb-3">
                  <FieldLine label="पेमेंटचा प्रकार" value={d.paymentType} />
                  {d.paymentType === 'Online/UTR' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-3 mt-2 sm:mt-3">
                      <FieldLine label="UPI आयडी" value={d.upiId} />
                      <FieldLine label="युजरनेम" value={d.username} />
                      <div className="sm:col-span-2">
                        <FieldLine label="रिफरन्स" value={d.chequeUtrUpiNumber} />
                      </div>
                    </div>
                  )}
                  {d.paymentType === 'Cheque' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-3 mt-2 sm:mt-3">
                      <div className="sm:col-span-2">
                        <FieldLine label="चेक / RTGS / UTR नं." value={d.chequeUtrUpiNumber} />
                      </div>
                      <FieldLine label="बँक" value={d.bankName} />
                      <FieldLine label="शाखा" value={d.branch} />
                    </div>
                  )}
                  <FieldLine label="बुकिंग रक्कम" value={d.bookingAmount} />
                  <FieldLine label="बुकिंग रक्कम अक्षरी" value={d.bookingAmountWords} />
                  <FieldLine label="खरेदीखताची रक्कम : ग्राहकाकडे राहील" value={d.registrationAmountText} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-3 mt-3 bg-slate-50/90 p-2 sm:p-2.5 rounded-md border border-slate-300 shadow-2xs">
                    <FieldLine label="एकूण प्लॉट रक्कम" value={d.totalPlotAmount} bold />
                    <FieldLine label="उर्वरित रक्कम" value={d.remainingAmount} bold />
                  </div>
                </div>

                {/* Table placed right beneath payment details */}
                {d.payments && d.payments.length > 0 && (
                  <div className="overflow-x-auto w-full mt-3">
                    <table className="w-full border-collapse text-[9px] sm:text-[10px]">
                      <thead>
                        <tr>
                          <th className="border border-slate-300 p-1 bg-[#8b1a1a] text-white text-left font-bold">दिनांक</th>
                          <th className="border border-slate-300 p-1 bg-[#8b1a1a] text-white text-left font-bold">रक्कम</th>
                          <th className="border border-slate-300 p-1 bg-[#8b1a1a] text-white text-left font-bold">प्रकार</th>
                          <th className="border border-slate-300 p-1 bg-[#8b1a1a] text-white text-left font-bold">रिमार्क</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.payments.map((p: any, i: number) => (
                          <tr key={i}>
                            <td className="border border-slate-300 p-1">{p.date || '\u00A0'}</td>
                            <td className="border border-slate-300 p-1">{p.amount || '\u00A0'}</td>
                            <td className="border border-slate-300 p-1">{p.type || '\u00A0'}</td>
                            <td className="border border-slate-300 p-1">{p.remark || '\u00A0'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Signatures at the bottom */}
              <div className="mt-auto pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-3 sm:gap-0 text-[10px] sm:text-[11px]">
                  <div className="text-center">
                    <div className="border-t border-black w-28 sm:w-36 mb-1 mt-3 sm:mt-4"></div>
                    <span className="font-bold text-[#8b1a1a]">ग्राहकाची सही</span>
                  </div>
                  <div className="text-center text-[10px]">
                    <span>रेफरन्स: <span className="italic font-bold">{d.reference || '____________________'}</span></span>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-black w-28 sm:w-36 mb-1 mt-3 sm:mt-4"></div>
                    <span className="font-bold text-[#8b1a1a]">पैसे स्वीकारणाऱ्याची सही</span>
                  </div>
                </div>
              </div>

              
              
            </div>
          </div>
        </div>
        
        {/* Page 2: Terms & Conditions */}
        <TermsAndConditionsPage fontClass={fontClass} />
      </div>
    </div>
  );
}

export function CustomerInfoEnglishPreview({ form, d, fontClass, handlePrint, previewLang, setPreviewLang }: any) {
  return (
    <div className="space-y-6 print:space-y-0 w-full">
      <div id="print-area" className="print-container space-y-6 print:space-y-0 w-full">
        {/* Page 1 */}
        <div className="flex justify-center w-full overflow-x-auto py-1 print:py-0 print:block">
          <div
            className="bg-white shadow-xl print:shadow-none text-black flex flex-col justify-between relative overflow-hidden print-sheet-1 w-full max-w-[210mm] print:w-[210mm]"
            style={{ minHeight: '280mm', padding: '4mm 6mm', fontFamily: 'sans-serif' }}
          >
            <SubtleWatermark />
            <div className="border border-[#8b1a1a] p-2 sm:p-[4.5mm] h-full flex flex-col justify-between flex-grow relative z-10 rounded-sm">
              <div>
                <HeaderBanner 
                  title="MAHALAXMI DEVELOPERS" 
                  isMarathi={false} 
                />

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-b border-gray-300 py-1.5 text-[11px] sm:text-[12px] mb-3 mt-1">
                  <div><span className="font-bold">No:</span> {form.formNumber}</div>
                  <div className="bg-[#8b1a1a] text-white px-4 sm:px-6 py-0.5 font-bold text-xs sm:text-[14px] rounded-full shadow-xs tracking-wide">
                    Happy Customer Information
                  </div>
                  <div><span className="font-bold">Date:</span> {new Date(form.createdAt).toLocaleDateString('en-IN')}</div>
                </div>

                <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-[12px] mb-3.5">
                  <FieldLine label="Customer Name" value={d.customerName} />
                  <FieldLine label="Full Address" value={d.customerAddress} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-3">
                    <FieldLine label="WhatsApp No." value={d.whatsappNo} icon="📱" />
                    <FieldLine label="Alternate No." value={d.alternateNumber} icon="💬" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-3 mt-2 sm:mt-3">
                    <FieldLine label="Aadhar Card No." value={d.aadharNo} icon="📄" />
                    <FieldLine label="PAN Card No." value={d.panNo} icon="💳" />
                  </div>
                </div>

                <div className="bg-[#8b1a1a] text-white text-center py-1 sm:py-1.5 font-bold text-xs sm:text-[14px] mb-2.5 rounded-md shadow-xs tracking-wide">
                  {d.siteName || 'Vedant Park'}
                </div>
                <div className="text-xs sm:text-[12px] space-y-2.5 sm:space-y-3 mb-3.5">
                  <div className="grid grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-3">
                    <FieldLine label="Gat No." value={d.gatNo} />
                    <FieldLine label="Area" value={d.area} />
                    <FieldLine label="Plot No." value={d.plotNo} />
                    <FieldLine label="Sq. Ft." value={d.sqFt} />
                  </div>
                </div>

                <div className="bg-[#8b1a1a] text-white text-center py-1 sm:py-1.5 font-bold text-xs sm:text-[14px] mb-2.5 rounded-md shadow-xs tracking-wide">
                  Payment Information
                </div>
                <div className="text-xs sm:text-[12px] space-y-2.5 sm:space-y-3 mb-3">
                  <FieldLine label="Payment Type" value={d.paymentType} />
                  {d.paymentType === 'Online/UTR' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-3 mt-2 sm:mt-3">
                      <FieldLine label="UPI ID" value={d.upiId} />
                      <FieldLine label="Username" value={d.username} />
                      <div className="sm:col-span-2">
                        <FieldLine label="Reference" value={d.chequeUtrUpiNumber} />
                      </div>
                    </div>
                  )}
                  {d.paymentType === 'Cheque' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-3 mt-2 sm:mt-3">
                      <div className="sm:col-span-2">
                        <FieldLine label="Cheque / RTGS / UTR No." value={d.chequeUtrUpiNumber} />
                      </div>
                      <FieldLine label="Bank" value={d.bankName} />
                      <FieldLine label="Branch" value={d.branch} />
                    </div>
                  )}
                  <FieldLine label="Booking Amount" value={d.bookingAmount} />
                  <FieldLine label="Amount in Words" value={d.bookingAmountWords} />
                  <FieldLine label="Registration Amt (stays with customer)" value={d.registrationAmountText} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-3 mt-3 bg-slate-50/90 p-2 sm:p-2.5 rounded-md border border-slate-300 shadow-2xs">
                    <FieldLine label="Total Plot Amount" value={d.totalPlotAmount} bold />
                    <FieldLine label="Remaining Amount" value={d.remainingAmount} bold />
                  </div>
                </div>

                {/* Table placed right beneath payment details */}
                {d.payments && d.payments.length > 0 && (
                  <div className="overflow-x-auto w-full mt-3">
                    <table className="w-full border-collapse text-[9px] sm:text-[10px]">
                      <thead>
                        <tr>
                          <th className="border border-slate-300 p-1 bg-[#8b1a1a] text-white text-left font-bold">Date</th>
                          <th className="border border-slate-300 p-1 bg-[#8b1a1a] text-white text-left font-bold">Amount</th>
                          <th className="border border-slate-300 p-1 bg-[#8b1a1a] text-white text-left font-bold">Type</th>
                          <th className="border border-slate-300 p-1 bg-[#8b1a1a] text-white text-left font-bold">Remark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.payments.map((p: any, i: number) => (
                          <tr key={i}>
                            <td className="border border-slate-300 p-1">{p.date || '\u00A0'}</td>
                            <td className="border border-slate-300 p-1">{p.amount || '\u00A0'}</td>
                            <td className="border border-slate-300 p-1">{p.type || '\u00A0'}</td>
                            <td className="border border-slate-300 p-1">{p.remark || '\u00A0'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Signatures at the bottom */}
              <div className="mt-auto pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-3 sm:gap-0 text-[10px] sm:text-[11px]">
                  <div className="text-center">
                    <div className="border-t border-black w-28 sm:w-36 mb-1 mt-3 sm:mt-4"></div>
                    <span className="font-bold text-[#8b1a1a]">Customer Signature</span>
                  </div>
                  <div className="text-center text-[10px]">
                    <span>Reference: <span className="italic font-bold">{d.reference || '____________________'}</span></span>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-black w-28 sm:w-36 mb-1 mt-3 sm:mt-4"></div>
                    <span className="font-bold text-[#8b1a1a]">Authorized Signature</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Page 2: Terms & Conditions */}
        <TermsAndConditionsEnglishPage fontClass={fontClass} />
      </div>
    </div>
  );
}

export function TermsAndConditionsPage({ fontClass }: { fontClass?: string }) {
  return (
    <div className="flex justify-center w-full overflow-x-auto py-1 print:py-0 print:block">
      <div
        className={`bg-white shadow-xl print:shadow-none text-black flex flex-col justify-between relative overflow-hidden print-sheet-2 w-full max-w-[210mm] print:w-[210mm] ${fontClass || ''}`}
        style={{ minHeight: '280mm', padding: '4mm 6mm', fontFamily: 'var(--font-marathi), Noto Sans Devanagari, sans-serif' }}
      >
        <SubtleWatermark />
        <div className="border border-[#8b1a1a] p-2 sm:p-[4mm] h-full flex flex-col justify-between flex-grow relative z-10 rounded-sm">
          <div>
            <div className="text-center mb-2">
              <h2 className="inline-block bg-[#8b1a1a] text-white px-5 sm:px-7 py-1 rounded-full font-bold text-sm sm:text-[17px] shadow-xs tracking-wide">
                ★ नियम व अटी ★
              </h2>
            </div>
            <ol className="list-none pl-0 space-y-1.5 sm:space-y-2 text-xs sm:text-[13.5px] md:text-[15px] lg:text-[15.5px] print:text-[13.8px] leading-[1.46] sm:leading-[1.5] print:leading-[1.42] font-semibold text-slate-900">
              <li>१) खरेदी खतावेळी काही तांत्रिक अडचण आली तर खरेदीखत पुढे ढकलण्यात येईल याची कल्पना लिहून घेणाऱ्यांना आहे.</li>
              <li>२) बुकिंग केलेला प्लॉट रद्द करावयाचा असल्यास १ दिवसांच्या आत लेखी अर्जाने कळवावे. तसे न केल्यास ४०% रक्कम कपात केली जाईल. कारण आम्हालाही शेतकऱ्यांचे पेमेंट द्यायचे आहे.</li>
              <li>३) खरेदी खताचा व ७/१२ नोंदणीचा खर्च खरेदी घेणाऱ्याकडे राहील.</li>
              <li>४) मुदतीचे चेक दिल्यास व बुकिंगचे चेक घेतल्यास ८% स्टॅम्प ड्युटी भरावी लागेल. तो खर्च खरेदी घेणाऱ्याकडे राहील.</li>
              <li>५) ज्या नावाने बुकिंग केले आहे त्याच नावाने खरेदीखत करून दिले जाईल.</li>
              <li>६) एखादा प्लॉट दोघांच्या नावावर करायचा असेल तर ती माहिती बुकिंग करतेवेळी प्लॉट धारकांनी बुकिंग घेणाऱ्या व्यक्तीला सांगणे व ग्राहकाने तेव्हाच स्वाक्षरी करणे.</li>
              <li>७) खरेदीखतावेळी ऐन वेळेस खरेदीखतामध्ये नाव वाढविले जाणार नाही व खरेदीखतामध्ये अचानक नावामध्ये बदल करता येणार नाही.</li>
              <li>८) जर ग्राहकाने अचानक प्लॉट रद्द केला व योग्य कारण असेल तर बुकिंग रक्कम ७ ते ९० दिवसांत दिली जाईल.</li>
              <li>९) भविष्यात लेआऊटमध्ये काही बदल करावयाचे असल्यास त्याचे संपूर्ण अधिकार महालक्ष्मी डेव्हलपर्स यांच्याकडेच राहतील.</li>
              <li>१०) खरेदीखतासाठी लागणारा खर्च (चेक), प्लॉटची रक्कम व लागणारे कागदपत्र (आधार कार्ड, पॅन कार्ड, २ फोटो), खरेदीखताच्या अगोदर २ दिवस ऑफिसमध्ये जमा करावे लागेल.</li>
              <li>११) काही कारणास्तव बुकिंगमध्ये बदल करण्याचे अधिकार महालक्ष्मी डेव्हलपर्स कडे राहतील.</li>
              <li>१२) दिलेल्या तारखेला बुकिंग रक्कम किंवा उर्वरित रक्कम न दिल्यास कुठलीही नोटीस अथवा कल्पना न देता बुकिंग कॅन्सल केले जाईल.</li>
              <li>१३) प्लॉटची किंमत व कॅन्सल करण्याचे अधिकार महालक्ष्मी डेव्हलपर्स कडे राहतील.</li>
              <li>१४) खरेदीखत पूर्ण झाल्यानंतर प्लॉटच्या मेंटेनन्सची पूर्णपणे जबाबदारी ही प्लॉट धारकाची राहील.</li>
              <li>१५) यदा कदाचित काही कारणांमुळे प्लॉट ओपन करण्यास भाग पडले तर तो अधिकार महालक्ष्मी डेव्हलपर्स कडे राहील. व ग्राहकांनी दिलेल्या रकमेवर १% ते १०% रिटर्न्स दिले जाईल.</li>
              <li>१६) मी बुकिंग केलेला प्लॉट मला दाखविला आहे, तसाच मला मान्य आहे. वरील सर्व नियम व अटी मला मान्य आहेत.</li>
              <li>१७) आम्ही सातत्याने ग्राहकांसोबत प्रामाणिक राहिलो आहोत. आजही आहोत व भविष्यातही राहू याची खात्री देत आहोत.</li>
            </ol>
          </div>
        
          <div className="mt-2">
            <div className="flex justify-between items-end pt-2 border-t border-slate-300 text-[11px] sm:text-[12px] font-bold text-[#8b1a1a]">
              <div className="text-xs sm:text-[13px]">धन्यवाद!</div>
              <div className="text-center">
                <div className="border-t border-black w-32 sm:w-40 mb-1 mt-2 sm:mt-3"></div>
                <span>ग्राहकाची सही</span>
              </div>
            </div>
            <div className="flex items-end justify-between mt-2">
              <div></div>
              <div className="flex justify-center flex-1">
                <img src="/mahalaxmi-group-logo.png" className="h-14 sm:h-16 object-contain opacity-80" alt="Footer Logo" />
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-[#8b1a1a] whitespace-nowrap">
                📞 Customer Support: +91 83788 14714
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TermsAndConditionsEnglishPage({ fontClass }: { fontClass?: string }) {
  return (
    <div className="flex justify-center w-full overflow-x-auto py-1 print:py-0 print:block">
      <div
        className={`bg-white shadow-xl print:shadow-none text-black flex flex-col justify-between relative overflow-hidden print-sheet-2 w-full max-w-[210mm] print:w-[210mm] ${fontClass || ''}`}
        style={{ minHeight: '280mm', padding: '4mm 6mm', fontFamily: 'sans-serif' }}
      >
        <SubtleWatermark />
        <div className="border border-[#8b1a1a] p-2 sm:p-[4mm] h-full flex flex-col justify-between flex-grow relative z-10 rounded-sm">
          <div>
            <div className="text-center mb-2">
              <h2 className="inline-block bg-[#8b1a1a] text-white px-5 sm:px-7 py-1 rounded-full font-bold text-sm sm:text-[17px] shadow-xs tracking-wide">
                ★ Terms & Conditions ★
              </h2>
            </div>
            <ol className="list-none pl-0 space-y-1.5 sm:space-y-2 text-xs sm:text-[13px] md:text-[14.5px] lg:text-[15px] print:text-[13.2px] leading-[1.44] sm:leading-[1.48] print:leading-[1.40] font-semibold text-slate-900">
              <li>1) If any technical difficulty arises at the time of execution/registration of the sale deed, the execution of the sale deed may be postponed. The purchaser acknowledges and accepts this condition.</li>
              <li>2) If the booked plot is to be cancelled, the purchaser must inform us through a written application within 1 day. If this is not done, 40% of the amount will be deducted, as we also have to make payments to the farmers.</li>
              <li>3) The expenses related to the sale deed and 7/12 land record registration shall be borne by the purchaser.</li>
              <li>4) If post-dated/term cheques are given and booking cheques are accepted, 8% stamp duty will be applicable. This expense shall be borne by the purchaser.</li>
              <li>5) The sale deed will be executed in the same name in which the booking was made.</li>
              <li>6) If a plot is to be registered in the names of two persons, the plot holder must inform the booking representative at the time of booking, and the customer must sign accordingly at that time.</li>
              <li>7) No additional name will be added to the sale deed at the last moment. No sudden changes to the name(s) in the sale deed will be permitted.</li>
              <li>8) If the customer suddenly cancels the plot for a valid reason, the booking amount will be refunded within 7 to 90 days.</li>
              <li>9) If any changes are required in the layout in the future, all rights to make such changes shall remain with Mahalaxmi Developers.</li>
              <li>10) The expenses required for the sale deed, the plot amount, and the required documents (Aadhaar Card, PAN Card, 2 photographs) must be submitted at the office 2 days before the sale deed.</li>
              <li>11) Mahalaxmi Developers shall have the right to make changes to the booking for any reason.</li>
              <li>12) If the booking amount or remaining amount is not paid on the specified date, the booking will be cancelled without any notice or prior intimation.</li>
              <li>13) The rights regarding the plot price and cancellation of the plot shall remain with Mahalaxmi Developers.</li>
              <li>14) After completion of the sale deed, the entire responsibility for the maintenance of the plot shall be that of the plot holder.</li>
              <li>15) If, for any reason, it becomes necessary to open/release the plot, the right to do so shall remain with Mahalaxmi Developers. A return of 1% to 10% will be given on the amount paid by the customer.</li>
              <li>16) I have been shown the plot that I booked, and I accept the plot as shown to me. I accept all the above terms and conditions.</li>
              <li>17) We have always been honest with our customers. We are honest today and assure you that we will continue to remain honest in the future as well.</li>
            </ol>
          </div>
        
          <div className="mt-2">
            <div className="flex justify-between items-end pt-2 border-t border-slate-300 text-[11px] sm:text-[12px] font-bold text-[#8b1a1a]">
              <div className="text-xs sm:text-[13px]">Thank You!</div>
              <div className="text-center">
                <div className="border-t border-black w-32 sm:w-40 mb-1 mt-2 sm:mt-3"></div>
                <span>Customer&apos;s Signature</span>
              </div>
            </div>
            <div className="flex items-end justify-between mt-2">
              <div></div>
              <div className="flex justify-center flex-1">
                <img src="/mahalaxmi-group-logo.png" className="h-14 sm:h-16 object-contain opacity-80" alt="Footer Logo" />
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-[#8b1a1a] whitespace-nowrap">
                📞 Customer Support: +91 83788 14714
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}