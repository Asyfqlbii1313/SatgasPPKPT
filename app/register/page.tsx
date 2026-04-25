'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const Register = () => {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const fullName = formData.get('fullName') as string;

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName, // Data ini akan masuk ke metadata auth dan ditarik oleh trigger SQL ke tabel profiles
                },
            },
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        } else {
            setSuccessMsg('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
            setLoading(false);
            // Opsional: arahkan ke login setelah beberapa detik
            setTimeout(() => router.push('/login'), 5000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6 relative overflow-hidden">
            {/* Background Decor - Mirror dari Login biar konsisten */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-blue-600/20 to-transparent opacity-20 skew-x-12 -translate-x-1/2 pointer-events-none"></div>

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
                        <div className="inline-flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-itg-blue dark:text-itg-azure text-4xl">security</span>
                            <span className="font-bold text-2xl text-foreground">Satgas PPKPT</span>
                        </div>
                    <h1 className="text-2xl font-bold text-foreground">Buat Akun Baru</h1>
                    <p className="text-foreground/70 mt-2">Daftar untuk mulai melaporkan dengan aman</p>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg text-center font-medium">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg text-center font-medium">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider ml-1">Nama Lengkap</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-foreground/50">person</span>
                            <input
                                name="fullName"
                                className="w-full h-12 pl-12 pr-4 bg-background border border-border rounded-lg focus:ring-2 focus:ring-itg-azure/20 focus:border-itg-azure outline-none transition-all text-foreground"
                                type="text"
                                placeholder="Nama Lengkap sesuai KTM"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider ml-1">Email Kampus</label>
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
                                placeholder="Minimal 6 karakter"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-foreground/70 text-sm">
                        Sudah punya akun? <Link href="/login" className="text-itg-blue dark:text-itg-azure font-semibold hover:underline">Masuk di sini</Link>
                    </p>
                </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;