'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

const Header = () => {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userName, setUserName] = useState<string>('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        
        // Cek user saat ini dan rolenya
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, full_name')
                    .eq('id', user.id)
                    .single();
                
                setIsAdmin(profile?.role === 'admin');
                setUserName(profile?.full_name || user.email?.split('@')[0] || 'User');
            } else {
                setIsAdmin(false);
                setUserName('');
            }
        };
        
        checkUser();

        // Listen pada perubahan state otentikasi
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                checkUser();
            } else {
                setIsAdmin(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-background/90 backdrop-blur-xl border-b border-border h-20 transition-all duration-300 shadow-sm dark:shadow-[0_2px_15px_-3px_rgba(0,51,102,0.07)]">
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                {/* Logo ITG Garut */}
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="relative w-12 h-12 bg-white dark:bg-white/10 p-1.5 rounded-full shadow-xl shadow-itg-blue/10 dark:shadow-none border border-itg-blue/5 dark:border-white/10 overflow-hidden group-hover:scale-110 transition-all duration-300">
                        <Image 
                            src="/OIP.jpeg" 
                            alt="Logo ITG" 
                            fill
                            className="object-contain p-1"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-montserrat font-black text-lg text-slate-950 dark:text-white tracking-tighter leading-none mb-0.5">SATGAS PPKPT</span>
                        <span className="text-[9px] font-extrabold text-slate-600 dark:text-itg-azure uppercase tracking-[0.2em] leading-none">Institut Teknologi Garut</span>
                    </div>
                </Link>

                {/* Navigasi yang lebih "hidup" */}
                <nav className="hidden md:flex items-center gap-2">
                    {['Beranda', 'Lapor', 'Lacak'].filter(item => !isAdmin || item === 'Beranda').map((item) => (
                        <Link
                            key={item}
                            href={item === 'Beranda' ? '/' : `/${item.toLowerCase()}`}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-itg-blue hover:bg-itg-blue/5 dark:hover:text-itg-azure dark:hover:bg-itg-azure/10 transition-all"
                        >
                            {item}
                        </Link>
                    ))}
                </nav>

                {/* Action Area */}
                <div className="flex items-center gap-2 md:gap-4">
                    <ThemeToggle />
                    
                    {/* User Area */}
                    <div className="hidden sm:flex items-center gap-3">
                        {user ? (
                            <>
                                <Link href="/profile" className="hidden lg:flex flex-col items-end mr-2 border-r border-border pr-4 text-right hover:opacity-70 transition-opacity group">
                                    <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest leading-none mb-1 group-hover:text-itg-azure transition-colors">{isAdmin ? 'Administrator' : 'Pengguna'}</span>
                                    <span className="text-sm font-bold text-foreground capitalize truncate max-w-[120px] leading-none group-hover:text-itg-blue transition-colors">{userName}</span>
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin" className="hidden md:flex bg-card border border-border text-foreground px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-background transition-all active:scale-95 items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span> Dashboard
                                    </Link>
                                )}
                                <button 
                                    onClick={async () => {
                                        const supabase = createClient();
                                        await supabase.auth.signOut();
                                        window.location.href = '/login';
                                    }}
                                    className="hidden md:flex bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-red-500 hover:text-white transition-all active:scale-95 items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">logout</span> Keluar
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="bg-itg-blue text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-itg-blue/20 hover:bg-itg-azure transition-all active:scale-95">
                                Masuk
                            </Link>
                        )}
                    </div>

                    {/* Hamburger Menu (Mobile) */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-border text-foreground hover:bg-background transition-all"
                    >
                        <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-card border-b border-border shadow-2xl animate-in slide-in-from-top-5 duration-300 z-40">
                    <div className="p-6 space-y-6">
                        <nav className="flex flex-col gap-2">
                            {['Beranda', 'Lapor', 'Lacak'].filter(item => !isAdmin || item === 'Beranda').map((item) => (
                                <Link
                                    key={item}
                                    href={item === 'Beranda' ? '/' : `/${item.toLowerCase()}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-all ${
                                        isActive(item === 'Beranda' ? '/' : `/${item.toLowerCase()}`)
                                            ? 'bg-itg-blue/5 text-itg-blue dark:bg-itg-azure/10 dark:text-itg-azure'
                                            : 'text-foreground/70 hover:bg-background'
                                    }`}
                                >
                                    {item}
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="pt-6 border-t border-border space-y-4">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 p-4 bg-background rounded-2xl border border-border">
                                        <div className="w-10 h-10 bg-itg-blue/10 rounded-full flex items-center justify-center text-itg-blue font-black uppercase">
                                            {userName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-foreground/50 uppercase">{isAdmin ? 'Admin' : 'Pengguna'}</p>
                                            <p className="text-sm font-bold text-foreground">{userName}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="bg-itg-blue/10 text-itg-blue px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">person</span> Profil
                                        </Link>
                                        {isAdmin && (
                                            <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="bg-card border border-border text-foreground px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span> Admin
                                            </Link>
                                        )}
                                        <button 
                                            onClick={async () => {
                                                const supabase = createClient();
                                                await supabase.auth.signOut();
                                                window.location.href = '/login';
                                            }}
                                            className="bg-red-50 dark:bg-red-900/20 text-red-600 px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">logout</span> Keluar
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full py-4 bg-itg-blue text-white rounded-2xl font-black text-center block shadow-xl shadow-itg-blue/20">
                                    Masuk ke Akun
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;