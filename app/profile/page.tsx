'use client'

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const ProfilePage = () => {
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    
    // Form States
    const [fullName, setFullName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            setLoading(false);
            window.location.href = '/login';
            return;
        }

        setUser(user);
        
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
        if (profileData) {
            setProfile(profileData);
            setFullName(profileData.full_name || '');
        }
        setLoading(false);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setUpdatingProfile(true);

        const { error } = await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', user.id);

        if (error) {
            setToast({ msg: 'Gagal memperbarui profil: ' + error.message, type: 'error' });
        } else {
            setToast({ msg: 'Profil berhasil diperbarui!', type: 'success' });
            setProfile({ ...profile, full_name: fullName });
        }
        setUpdatingProfile(false);
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setToast({ msg: 'Konfirmasi password tidak cocok!', type: 'error' });
            return;
        }
        if (newPassword.length < 6) {
            setToast({ msg: 'Password minimal 6 karakter!', type: 'error' });
            return;
        }

        setUpdatingPassword(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            setToast({ msg: 'Gagal memperbarui password: ' + error.message, type: 'error' });
        } else {
            setToast({ msg: 'Password berhasil diperbarui!', type: 'success' });
            setNewPassword('');
            setConfirmPassword('');
        }
        setUpdatingPassword(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-itg-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6 font-inter">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Profile */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-[2rem] border border-border shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-itg-blue/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-20 h-20 bg-itg-blue text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl shadow-itg-blue/20">
                            {fullName.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{fullName || 'User'}</h1>
                            <p className="text-sm text-foreground/50 font-mono mt-1">{user?.email}</p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="px-3 py-1 bg-itg-blue/10 text-itg-blue text-[10px] font-black uppercase tracking-wider rounded-lg border border-itg-blue/20">
                                    {profile?.role === 'admin' ? 'Administrator' : 'Pelapor / Pengguna'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Link href={profile?.role === 'admin' ? '/admin' : '/'} className="relative z-10 px-6 py-3 bg-background border border-border hover:bg-border rounded-xl text-xs font-bold transition-all flex items-center gap-2 w-fit">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span> Kembali
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Update Info Dasar */}
                    <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-itg-azure/10 text-itg-azure rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Informasi Profil</h2>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Masukkan nama lengkap Anda"
                                    className="w-full p-4 bg-background border border-border rounded-2xl outline-none focus:border-itg-azure focus:ring-4 focus:ring-itg-azure/5 transition-all text-sm text-foreground font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest ml-1">Email (Akun)</label>
                                <input 
                                    type="email" 
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full p-4 bg-background border border-border rounded-2xl opacity-50 cursor-not-allowed text-sm text-foreground font-medium"
                                />
                                <p className="text-[10px] text-foreground/40 ml-1">Email tidak dapat diubah demi keamanan data.</p>
                            </div>
                            <button 
                                type="submit"
                                disabled={updatingProfile}
                                className="w-full py-4 bg-itg-blue text-white rounded-2xl font-black shadow-lg shadow-itg-blue/20 hover:bg-itg-azure transition-all disabled:opacity-50 mt-4"
                            >
                                {updatingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </form>
                    </div>

                    {/* Update Password */}
                    <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined">lock</span>
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Keamanan Akun</h2>
                        </div>
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest ml-1">Password Baru</label>
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    className="w-full p-4 bg-background border border-border rounded-2xl outline-none focus:border-itg-azure focus:ring-4 focus:ring-itg-azure/5 transition-all text-sm text-foreground font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest ml-1">Konfirmasi Password Baru</label>
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Ulangi password baru"
                                    className="w-full p-4 bg-background border border-border rounded-2xl outline-none focus:border-itg-azure focus:ring-4 focus:ring-itg-azure/5 transition-all text-sm text-foreground font-medium"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={updatingPassword}
                                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all disabled:opacity-50 mt-4"
                            >
                                {updatingPassword ? 'Memperbarui...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info Tambahan */}
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/30 flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-600">shield_check</span>
                    <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium leading-relaxed">
                        Data Anda dilindungi secara enkripsi. Pastikan Anda menggunakan password yang kuat untuk menjaga keamanan akun Satgas PPKPT Anda.
                    </p>
                </div>
            </div>

            {/* Toast Notifications */}
            {toast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
                        toast.type === 'success' 
                        ? 'bg-emerald-500 text-white border-emerald-400' 
                        : 'bg-red-500 text-white border-red-400'
                    }`}>
                        <span className="material-symbols-outlined">
                            {toast.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <span className="font-bold text-sm">{toast.msg}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
