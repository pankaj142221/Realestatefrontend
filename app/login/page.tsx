"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/components/ui/toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/login', { email, password });
      toast.add({ title: 'Success', description: 'Logged in successfully', type: 'success' });
      router.push('/dashboard');
    } catch (error: any) {
      toast.add({
        title: 'Login Failed',
        description: error.response?.data?.message || 'Authentication error',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100 blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-100 blur-3xl opacity-50" />
      
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden relative z-10 mx-4 border border-slate-100">
        
        {/* Left Side: Branding */}
        <div className="bg-slate-900 text-white p-12 flex flex-col justify-center items-start">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-8 shadow-lg">
            <ShieldCheck size={32} className="text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-white">Mahalaxmi Developers</h1>
          <p className="text-lg text-slate-300 leading-relaxed">Secure access to your digital documents.</p>
          <div className="mt-auto pt-12 flex items-center gap-3 text-slate-400 text-sm">
            <ShieldCheck size={16} />
            <span>Encrypted & Monitored Access</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800">Welcome Back</h2>
            <p className="text-slate-500 mt-1">Please sign in to your secure account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-md" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Secure Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
