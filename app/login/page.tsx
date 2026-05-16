'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

const Login = () => {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        } else {
            router.push('/');
            router.refresh();
        }
    };

    const handleResetPassword = async () => {
        const emailInput = (document.getElementsByName('email')[0] as HTMLInputElement)?.value;
        if (!emailInput) {
            setErrorMsg("Silakan isi email Anda terlebih dahulu untuk reset password.");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(emailInput, {
            redirectTo: `${window.location.origin}/profile`, // Redirect ke halaman profil setelah klik link di email
        });

        if (error) {
            setErrorMsg(error.message);
        } else {
            alert("Email reset password telah dikirim! Silakan cek kotak masuk atau folder spam Anda.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-br from-blue-600/20 to-transparent opacity-20 -skew-x-12 translate-x-1/2 pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Tombol Kembali ke Beranda */}
                <Link href="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-itg-azure transition-colors font-bold text-sm mb-6 bg-card/50 backdrop-blur-md px-4 py-2 rounded-full border border-border w-fit">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Kembali ke Beranda
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-card p-10 rounded-2xl shadow-2xl border border-border"
                >
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="relative w-10 h-10 bg-white p-1 rounded-xl shadow-md border border-border overflow-hidden">
                                <Image src="/OIP.jpeg" alt="Logo ITG" fill className="object-contain p-1" />
                            </div>
                            <span className="font-montserrat font-black text-2xl text-foreground tracking-tighter">SIAP-PPKPT</span>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Selamat Datang Kembali</h1>
                        <p className="text-foreground/70 mt-2">Masuk untuk melaporkan atau memantau aduan</p>
                    </div>

                    {errorMsg && (
                        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg text-center">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider ml-1">Email</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-foreground/50">mail</span>
                                <input
                                    name="email"
                                    className="w-full h-12 pl-12 pr-4 bg-background border border-border rounded-lg focus:ring-2 focus:ring-itg-azure/20 focus:border-itg-azure outline-none transition-all text-foreground"
                                    type="email"
                                    placeholder="maba@kampus.ac.id"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider ml-1">Kata Sandi</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-foreground/50">lock</span>
                                <input
                                    name="password"
                                    className="w-full h-12 pl-12 pr-4 bg-background border border-border rounded-lg focus:ring-2 focus:ring-itg-azure/20 focus:border-itg-azure outline-none transition-all text-foreground"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="flex justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={handleResetPassword}
                                    className="text-xs font-bold text-itg-blue dark:text-itg-azure hover:underline transition-all"
                                >
                                    Lupa Password?
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.98] mt-2 disabled:opacity-50"
                        >
                            {loading ? 'Memproses...' : 'Masuk Sekarang'}
                        </button>
                    </form>



                    <p className="text-center text-foreground/70 text-sm mt-8">
                        Belum punya akun? <Link href="/register" className="text-itg-blue dark:text-itg-azure font-semibold hover:underline">Daftar sekarang</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;