"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function SecurityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/security/logs');
        setLogs(res.data.logs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const formatEventName = (event: string) => {
    return event.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  const getEventBadgeClass = (event: string) => {
    if (event.includes('FAILED')) return 'bg-red-50 text-red-700';
    if (event.includes('SUCCESS')) return 'bg-green-50 text-green-700';
    if (event.includes('DELETE')) return 'bg-red-50 text-red-700';
    if (event.includes('PRINT')) return 'bg-purple-50 text-purple-700';
    return 'bg-blue-50 text-blue-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-slate-900 rounded-xl text-white">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security Activity</h1>
          <p className="text-slate-500 text-sm mt-1">Audit log of system events and document accesses.</p>
        </div>
      </div>

      <Card className="border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Browser/Device</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: any) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getEventBadgeClass(log.event)}`}>
                        {formatEventName(log.event)}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.ip || 'Unknown'}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-slate-500" title={log.userAgent}>
                      {log.userAgent || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {log.metadata?.formNumber && `Form: ${log.metadata.formNumber}`}
                      {log.metadata?.attemptedEmail && `Email: ${log.metadata.attemptedEmail}`}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No security logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
