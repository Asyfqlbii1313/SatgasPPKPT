'use client'

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

const LacakPage = () => {
    const [searchCode, setSearchCode] = useState('');
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Untuk laporan saya jika login
    const [user, setUser] = useState<any>(null);
    const [myReports, setMyReports] = useState<any[]>([]);
    const [loadingMyReports, setLoadingMyReports] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        checkUserAndFetchReports();
    }, []);

    const checkUserAndFetchReports = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
                
            if (data) setMyReports(data);
        }
        setLoadingMyReports(false);
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchCode.trim()) return;

        setLoading(true);
        setError(null);
        setReport(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('reports')
                .select('*')
                .eq('id', searchCode.trim())
                .single();

            if (fetchError || !data) {
                console.error("Supabase Fetch Error:", fetchError);
                throw new Error(fetchError?.message || 'Laporan tidak ditemukan. Pastikan kode yang Anda masukkan benar.');
            }

            setReport(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper untuk mengecek apakah user yang sedang login adalah pemilik laporan
    const isOwner = user && report && user.id === report.user_id;

    // Helper memproses deskripsi dan bukti
    let cleanDescription = '';
    let evidenceUrl = '';
    let isImage = false;
    let isVideo = false;
    let isPdf = false;

    if (report) {
        cleanDescription = report.description;
        const evidenceMarker = '\n\nLink Bukti (Otomatis): ';
        if (cleanDescription.includes(evidenceMarker)) {
            const parts = cleanDescription.split(evidenceMarker);
            cleanDescription = parts[0];
            evidenceUrl = parts[1];
            
            isImage = evidenceUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) !== null;
            isVideo = evidenceUrl.match(/\.(mp4|webm|ogg)/i) !== null;
            isPdf = evidenceUrl.match(/\.(pdf)/i) !== null;
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
            <Header />

            <main className="flex-grow pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Search Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-3xl md:text-5xl font-montserrat font-black text-itg-blue dark:text-white mb-6">
                            Lacak Status <span className="text-itg-azure">Aduan</span>
                        </h1>
                        <p className="text-foreground/70 font-medium max-w-2xl mx-auto mb-10">
                            Masukkan kode unik laporan Anda untuk melihat perkembangan proses penanganan secara transparan.
                        </p>

                        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto group">
                            <input
                                type="text"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                placeholder="Masukkan Kode Laporan (UUID)"
                                className="w-full h-16 pl-14 pr-32 rounded-2xl bg-card border-2 border-border focus:border-itg-azure focus:ring-4 focus:ring-itg-azure/10 outline-none transition-all font-bold tracking-wider shadow-xl shadow-itg-blue/5 text-foreground"
                            />
                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-foreground/50 group-focus-within:text-itg-azure transition-colors">
                                search
                            </span>
                            <button 
                                type="submit"
                                disabled={loading || !searchCode.trim()}
                                className="absolute right-2 top-2 bottom-2 px-6 bg-itg-blue hover:bg-itg-azure text-white rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'MENCARI...' : 'CARI'}
                            </button>
                        </form>
                    </div>

                    {error && (
                        <div className="max-w-xl mx-auto p-4 mb-8 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-center font-bold rounded-xl border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    {/* Laporan Saya (Jika Login & Tidak sedang mencari spesifik) */}
                    {user && !report && !searchCode && (
                        <div className="mb-16">
                            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-itg-azure">history</span>
                                Riwayat Laporan Saya
                            </h2>
                            
                            {loadingMyReports ? (
                                <div className="text-center py-10 text-foreground/50">Memuat riwayat laporan...</div>
                            ) : myReports.length === 0 ? (
                                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                                    <span className="material-symbols-outlined text-5xl text-foreground/30 mb-3">inbox</span>
                                    <p className="text-foreground/60 font-medium">Anda belum pernah membuat laporan.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {myReports.map((item) => {
                                        let shortDesc = item.description;
                                        if (shortDesc.includes('\n\nLink Bukti (Otomatis): ')) {
                                            shortDesc = shortDesc.split('\n\nLink Bukti (Otomatis): ')[0];
                                        }

                                        return (
                                            <div 
                                                key={item.id} 
                                                onClick={() => { setSearchCode(item.id); handleSearch({ preventDefault: () => {} } as any); }}
                                                className="bg-card border border-border p-6 rounded-2xl hover:border-itg-azure/50 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group shadow-sm hover:shadow-md"
                                            >
                                                <div>
                                                    <p className="text-xs font-mono font-bold text-foreground/50 mb-1">{item.id}</p>
                                                    <h3 className="font-bold text-foreground capitalize">{item.category}</h3>
                                                    <p className="text-sm text-foreground/60 mt-1 line-clamp-1 max-w-md">{shortDesc}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        item.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                                        item.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                    <span className="material-symbols-outlined text-foreground/30 group-hover:text-itg-azure transition-colors">chevron_right</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timeline Result (Hanya muncul jika kode ditemukan) */}
                    {report && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card rounded-3xl border border-border p-8 md:p-12 shadow-[0_20px_50px_rgba(0,51,102,0.03)]"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-border">
                                <div>
                                    <p className="text-xs font-black text-foreground/50 uppercase tracking-widest mb-1">Kode Laporan</p>
                                    <h3 className="text-lg md:text-xl font-mono font-black text-itg-blue dark:text-itg-azure break-all">{report.id}</h3>
                                    <p className="text-sm text-foreground/60 mt-2">Dibuat pada: {new Date(report.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${
                                    report.status === 'resolved' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' :
                                    report.status === 'investigating' ? 'bg-itg-blue/5 dark:bg-itg-azure/10 border-itg-blue/10 dark:border-itg-azure/20' :
                                    'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
                                }`}>
                                    {report.status !== 'resolved' && <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${report.status === 'investigating' ? 'bg-itg-azure' : 'bg-orange-500'}`}></div>}
                                    {report.status === 'resolved' && <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">check_circle</span>}
                                    <span className={`text-sm font-black uppercase tracking-wider ${
                                        report.status === 'resolved' ? 'text-emerald-700 dark:text-emerald-400' :
                                        report.status === 'investigating' ? 'text-itg-blue dark:text-itg-azure' :
                                        'text-orange-700 dark:text-orange-400'
                                    }`}>
                                        {report.status === 'resolved' ? 'Selesai' : report.status === 'investigating' ? 'Sedang Diproses' : 'Menunggu'}
                                    </span>
                                </div>
                            </div>

                            {/* Detail Laporan (Tergantung Hak Akses) */}
                            <div className="mb-12 bg-background p-6 rounded-2xl border border-border">
                                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-itg-azure">info</span>
                                    Informasi Dasar
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-foreground/50 font-medium">Kategori:</p>
                                        <p className="font-bold text-foreground capitalize">{report.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-foreground/50 font-medium">Pelapor:</p>
                                        <p className="font-bold text-foreground">
                                            {report.is_anonymous ? '🕵️ Pelapor Anonim' : (isOwner ? report.profiles?.full_name || 'Anda (Pemilik)' : '🕵️ Disamarkan (Privasi)')}
                                        </p>
                                    </div>
                                </div>
                                
                                {isOwner ? (
                                    <div className="mt-6 pt-6 border-t border-border">
                                        <p className="text-foreground/50 font-medium mb-2">Kronologi (Hanya Anda yang bisa melihat ini):</p>
                                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">{cleanDescription}</p>

                                        {evidenceUrl && (
                                            <div className="mt-8">
                                                <p className="text-foreground/50 font-medium mb-3">Bukti Pendukung:</p>
                                                <div className="bg-background border border-border rounded-2xl p-2 max-w-md">
                                                    {isImage && (
                                                        <a href={evidenceUrl} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-xl">
                                                            <img src={evidenceUrl} alt="Bukti Laporan" className="w-full h-auto max-h-72 object-cover transition-transform duration-500 group-hover:scale-105" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                                                <div className="text-white flex flex-col items-center">
                                                                    <span className="material-symbols-outlined text-4xl mb-1">zoom_in</span>
                                                                    <span className="text-sm font-bold">Lihat Penuh</span>
                                                                </div>
                                                            </div>
                                                        </a>
                                                    )}
                                                    {isVideo && (
                                                        <div className="rounded-xl overflow-hidden bg-black">
                                                            <video src={evidenceUrl} controls className="w-full max-h-72" />
                                                        </div>
                                                    )}
                                                    {isPdf && (
                                                        <a href={evidenceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 hover:bg-card rounded-xl transition-colors group">
                                                            <span className="material-symbols-outlined text-red-500 text-4xl">picture_as_pdf</span>
                                                            <div className="flex-grow">
                                                                <p className="font-bold text-foreground group-hover:text-itg-azure transition-colors">Dokumen PDF</p>
                                                                <p className="text-xs text-foreground/50">Klik untuk mengunduh atau melihat dokumen</p>
                                                            </div>
                                                            <span className="material-symbols-outlined text-foreground/40 group-hover:text-itg-azure">download</span>
                                                        </a>
                                                    )}
                                                    {!isImage && !isVideo && !isPdf && (
                                                        <a href={evidenceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 hover:bg-card rounded-xl transition-colors group">
                                                            <span className="material-symbols-outlined text-itg-blue text-4xl">task</span>
                                                            <div className="flex-grow">
                                                                <p className="font-bold text-foreground group-hover:text-itg-azure transition-colors">File Bukti</p>
                                                                <p className="text-xs text-foreground/50">Klik untuk mengunduh</p>
                                                            </div>
                                                            <span className="material-symbols-outlined text-foreground/40 group-hover:text-itg-azure">download</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-6 pt-6 border-t border-border">
                                        <div className="bg-card p-4 rounded-xl border border-border flex items-start gap-3">
                                            <span className="material-symbols-outlined text-orange-500">lock</span>
                                            <p className="text-foreground/70 text-sm leading-relaxed">
                                                Detail kronologi dan bukti disembunyikan untuk melindungi privasi pelapor. Anda hanya dapat melihat status perkembangan dari laporan ini.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* TANGGAPAN PETUGAS (Dapat Dilihat Semua yang Punya Kode) */}
                                {report.admin_response && (
                                    <div className="mt-8 pt-8 border-t border-border">
                                        <div className="bg-itg-blue/5 dark:bg-itg-azure/10 p-6 rounded-2xl border border-itg-blue/20 dark:border-itg-azure/20">
                                            <h4 className="font-bold text-itg-blue dark:text-itg-azure mb-3 flex items-center gap-2">
                                                <span className="material-symbols-outlined">mark_email_read</span>
                                                Tanggapan Resmi Satgas PPKPT
                                            </h4>
                                            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-sm">
                                                {report.admin_response}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Visual Timeline */}
                            <div className="space-y-10 relative">
                                {/* Vertical Line Line */}
                                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border -z-0"></div>

                                <TimelineStep
                                    status={report.status === 'pending' ? 'current' : 'completed'}
                                    date={new Date(report.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    title="Laporan Diterima"
                                    desc="Laporan telah berhasil masuk ke sistem Satgas PPKPT dan sedang menunggu antrean untuk diverifikasi awal."
                                />
                                <TimelineStep
                                    status={report.status === 'resolved' ? 'completed' : report.status === 'investigating' ? 'current' : 'pending'}
                                    date={report.status !== 'pending' ? 'Sedang Berjalan' : 'Menunggu'}
                                    title="Proses Investigasi & Verifikasi"
                                    desc="Tim Satgas sedang meninjau kelengkapan bukti, memverifikasi kronologi, dan melakukan tindakan penanganan sesuai SOP."
                                />
                                <TimelineStep
                                    status={report.status === 'resolved' ? 'completed' : 'pending'}
                                    date={report.status === 'resolved' ? 'Selesai' : 'Belum Selesai'}
                                    title="Kasus Selesai"
                                    desc="Proses penanganan telah selesai dilakukan dan keputusan akhir telah ditetapkan oleh pihak kampus."
                                />
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

// Sub-component untuk Timeline biar rapi
const TimelineStep = ({ status, date, title, desc }: { status: 'completed' | 'current' | 'pending', date: string, title: string, desc: string }) => {
    const isCompleted = status === 'completed';
    const isCurrent = status === 'current';

    return (
        <div className="relative pl-12">
            {/* Icon Dot */}
            <div className={`absolute left-0 top-1 w-8 h-8 rounded-full z-10 flex items-center justify-center border-4 border-card transition-colors shadow-sm ${isCompleted ? 'bg-itg-blue' : isCurrent ? 'bg-itg-azure' : 'bg-border'
                }`}>
                {isCompleted && <span className="material-symbols-outlined text-[16px] text-white">check</span>}
                {isCurrent && <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>}
            </div>

            <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCurrent ? 'text-itg-azure' : 'text-foreground/50'}`}>
                    {date}
                </span>
                <h4 className={`text-lg font-bold mb-2 ${isCurrent ? 'text-itg-blue dark:text-white' : 'text-foreground/90'}`}>
                    {title}
                </h4>
                <p className="text-sm text-foreground/70 leading-relaxed max-w-2xl">
                    {desc}
                </p>
            </div>
        </div>
    );
};

export default LacakPage;