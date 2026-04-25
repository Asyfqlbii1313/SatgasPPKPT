'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="bg-background border-t border-border pt-16 pb-8 transition-colors">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative w-8 h-8 bg-white p-1 rounded-lg">
                                <Image src="/OIP.jpeg" alt="Logo ITG" fill className="object-contain p-0.5" />
                            </div>
                            <span className="font-montserrat font-bold text-xl text-slate-900 dark:text-white">Satgas PPKPT ITG</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 max-w-sm text-sm leading-relaxed">
                            Komitmen Institut Teknologi Garut dalam menciptakan lingkungan kampus yang inklusif, aman, dan bebas dari segala bentuk kekerasan.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground mb-6 uppercase text-[10px] tracking-widest text-itg-blue dark:text-itg-azure">Navigasi</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/lapor" className="text-foreground/70 hover:text-itg-blue dark:hover:text-itg-azure transition-colors">Buat Aduan</Link></li>
                            <li><Link href="/lacak" className="text-foreground/70 hover:text-itg-blue dark:hover:text-itg-azure transition-colors">Status Aduan</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground mb-6 uppercase text-[10px] tracking-widest text-itg-blue dark:text-itg-azure">Kontak</h4>
                        <div className="space-y-4 text-sm text-foreground/70 font-medium">
                            <p className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">mail</span> satgasppks@itg.ac.id</p>
                            <p className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">phone</span> +62 812-3456-7890 (CS Satgas)</p>
                            <p className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">location_on</span> Kampus ITG Garut</p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-foreground/60 uppercase tracking-[0.2em]">
                    <p>© 2026 Institut Teknologi Garut</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-itg-blue transition-colors">Privacy</a>
                        <a href="#" className="hover:text-itg-blue transition-colors">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;