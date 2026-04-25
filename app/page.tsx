'use client'

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-background transition-colors duration-300">
      <Header />

      <main className="flex-grow pt-20">
        {/* Hero Section - Forced Contrast Fix */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-white dark:bg-transparent transition-colors duration-500">
          {/* Decorative Gradients for depth */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-transparent dark:from-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-bl from-sky-50/50 to-transparent dark:from-transparent pointer-events-none"></div>
          {/* Background ITG Logo - Using mix-blend-multiply to hide white bg in light mode */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] opacity-[0.07] dark:opacity-[0.05] pointer-events-none grayscale blur-[1px] -rotate-12 mix-blend-multiply dark:mix-blend-normal">
            <Image 
              src="/OIP.jpeg" 
              alt="Background Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Background Ornaments - Hanya muncul/terang di Dark Mode */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-itg-azure/10 dark:bg-itg-azure/5 skew-x-12 translate-x-1/4 pointer-events-none"></div>

          {/* Blur Effects untuk Light Mode agar tidak "mokad" */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-itg-blue/5 dark:bg-itg-azure/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-itg-azure/5 dark:bg-itg-blue/20 rounded-full blur-3xl"></div>

          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-slate-100 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 mb-10 shadow-sm"
            >
              <div className="w-5 h-5 bg-blue-600 dark:bg-itg-azure rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[12px] text-white font-black">check</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-600 dark:text-itg-azure">Layanan Resmi ITG Garut</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-montserrat font-black text-slate-950 dark:text-white mb-8 leading-[1.05]"
            >
              Wujudkan Kampus <br />
              <span className="bg-gradient-to-r from-blue-800 to-sky-600 dark:from-itg-azure dark:to-white bg-clip-text text-transparent">Aman & Bermartabat</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-800 dark:text-slate-300 max-w-2xl mb-12 font-medium leading-relaxed"
            >
              Suaramu adalah awal dari perubahan. Laporkan kekerasan secara aman, anonim, dan terlindungi di lingkungan Institut Teknologi Garut.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-5"
            >
              <Link href="/lapor" className="px-10 py-4 bg-itg-blue dark:bg-itg-azure text-white dark:text-itg-blue rounded-2xl font-black shadow-xl shadow-itg-blue/25 dark:shadow-itg-azure/20 hover:scale-105 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">campaign</span>
                Buat Laporan Sekarang
              </Link>
              <Link href="/lacak" className="px-10 py-4 bg-white dark:bg-white/5 text-itg-blue dark:text-white border-2 border-itg-blue/30 dark:border-white/10 rounded-2xl font-black hover:bg-itg-blue/5 dark:hover:bg-white/10 transition-all flex items-center gap-2 group shadow-xl shadow-itg-blue/5 dark:shadow-none">
                <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">track_changes</span>
                Lacak Aduan
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Feature Cards Section - Subtle Light Mode Background */}
        <section className="py-24 px-6 bg-slate-50/50 dark:bg-background transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon="shield_person"
                title="Privasi Total"
                desc="Identitas Anda dijamin kerahasiaannya. Laporan dapat dilakukan secara anonim demi keamanan Anda."
              />
              <FeatureCard
                icon="bolt"
                title="Respon Cepat"
                desc="Setiap aduan akan ditinjau oleh tim Satgas ITG dalam waktu kurang dari 24 jam kerja."
              />
              <FeatureCard
                icon="gavel"
                title="Tindakan Tegas"
                desc="Kami berkomitmen menindaklanjuti setiap pelanggaran sesuai dengan regulasi kampus dan hukum."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-card py-20 border-y border-border transition-colors">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-itg-blue dark:text-white mb-6">Bersama Wujudkan Kampus Sehat</h2>
            <p className="text-foreground/70 mb-10 text-lg leading-relaxed">
              Jangan biarkan kekerasan menjadi normal. Langkah kecil Anda hari ini bisa menyelamatkan masa depan teman sejawat lainnya.
            </p>
            <Link href="/lapor" className="inline-flex items-center gap-2 text-itg-azure font-black hover:underline decoration-itg-azure decoration-2 underline-offset-8 transition-all">
              Mulai Konsultasi atau Lapor <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="p-10 rounded-[2.5rem] border border-border bg-card/50 backdrop-blur-sm hover:border-itg-azure/50 hover:shadow-2xl hover:shadow-itg-blue/5 transition-all duration-500 group relative overflow-hidden">
    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-itg-blue/5 rounded-full blur-3xl group-hover:bg-itg-azure/10 transition-colors"></div>
    <div className="w-16 h-16 bg-gradient-to-br from-itg-blue to-itg-azure rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-itg-blue/20">
      <span className="material-symbols-outlined text-white text-4xl">{icon}</span>
    </div>
    <h3 className="text-xl font-bold text-itg-blue dark:text-white mb-4 group-hover:text-itg-azure transition-colors">{title}</h3>
    <p className="text-foreground/70 leading-relaxed font-medium relative z-10">{desc}</p>
  </div>
);

export default Home;