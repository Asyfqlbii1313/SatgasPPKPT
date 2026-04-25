'use client'

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import Image from 'next/image';

const AdminDashboard = () => {
    const supabase = createClient();
    const [reports, setReports] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Tab Navigation
    const [activeTab, setActiveTab] = useState<'dashboard' | 'laporan'>('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // State untuk Modal Detail
    const [selectedReport, setSelectedReport] = useState<any | null>(null);
    const [responseInput, setResponseInput] = useState('');
    const [savingResponse, setSavingResponse] = useState(false);
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => {
        checkAuthAndFetchData();
    }, []);

    const checkAuthAndFetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                window.location.href = '/login';
                return;
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error("Auth Error:", error);
                // Jika error RLS, coba tetap lanjut tapi beri peringatan
                if (error.code === 'PGRST116') {
                    alert("Profil tidak ditemukan. Pastikan Anda sudah terdaftar.");
                }
            }

            const role = profile?.role || 'null';
            setUserRole(role);
            const detectedRole = role.toLowerCase();

            if (!profile || detectedRole !== 'admin') {
                setLoading(false);
                setIsAuthorized(false);
                return;
            }

            setIsAuthorized(true);
            fetchDashboardData();
        } catch (err) {
            console.error("System Error:", err);
            setLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Ambil data laporan
            const { data: reportsData, error: reportsError } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (reportsError) throw reportsError;

            if (reportsData) {
                // 2. Ambil data profil secara manual untuk menghindari error join
                const { data: profiles, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email');

                if (profileError) console.warn("Gagal mengambil data profil:", profileError.message);

                const finalReports = reportsData.map(report => {
                    const profile = profiles?.find(p => p.id === report.user_id);
                    return {
                        ...report,
                        profiles: profile || { full_name: 'User Tidak Dikenal', email: 'Email tidak ditemukan' }
                    };
                });

                setReports(finalReports);
                setStats({
                    total: finalReports.length,
                    pending: finalReports.filter(r => r.status === 'pending').length,
                    resolved: finalReports.filter(r => r.status === 'resolved').length,
                });
            }
        } catch (error: any) {
            console.error("Dashboard Fetch Error:", error);
            setToast({ msg: "Gagal memuat data: " + error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const originalReports = [...reports];
        const updatedReports = reports.map(r => r.id === id ? { ...r, status: newStatus } : r);
        setReports(updatedReports);
        setStats({
            total: updatedReports.length,
            pending: updatedReports.filter(r => r.status === 'pending').length,
            resolved: updatedReports.filter(r => r.status === 'resolved').length,
        });

        if (selectedReport && selectedReport.id === id) {
            setSelectedReport({ ...selectedReport, status: newStatus });
        }

        const { data, error } = await supabase
            .from('reports')
            .update({ status: newStatus })
            .eq('id', id)
            .select();

        if (error || !data || data.length === 0) {
            setReports(originalReports);
            setToast({ msg: "Gagal mengubah status: Izin ditolak atau masalah DB.", type: 'error' });
        } else {
            setToast({ msg: "Status berhasil diperbarui!", type: 'success' });
        }
    };

    const handleSaveResponse = async () => {
        if (!selectedReport) return;
        setSavingResponse(true);

        const { data, error } = await supabase
            .from('reports')
            .update({ admin_response: responseInput })
            .eq('id', selectedReport.id)
            .select();

        if (error || !data || data.length === 0) {
            setToast({ msg: 'Gagal menyimpan tanggapan.', type: 'error' });
        } else {
            const updatedReports = reports.map(r => r.id === selectedReport.id ? { ...r, admin_response: responseInput } : r);
            setReports(updatedReports);
            setSelectedReport({ ...selectedReport, admin_response: responseInput });
            setToast({ msg: 'Tanggapan berhasil dikirim!', type: 'success' });
        }
        setSavingResponse(false);
    };

    const openDetailModal = (report: any) => {
        setSelectedReport(report);
        setResponseInput(report.admin_response || '');
    };

    const closeDetailModal = () => {
        setSelectedReport(null);
        setResponseInput('');
    };

    const getCleanDescriptionAndEvidence = (rawDesc: string) => {
        let clean = rawDesc;
        let url = '';
        const marker = '\n\nLink Bukti (Otomatis): ';
        if (clean && clean.includes(marker)) {
            const parts = clean.split(marker);
            clean = parts[0];
            url = parts[1];
        }
        return { clean, url };
    };

    const filteredReports = reports.filter(r => {
        const matchSearch = r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = filterCategory ? r.category === filterCategory : true;
        return matchSearch && matchCategory;
    });

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-itg-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-red-500/10">
                    <span className="material-symbols-outlined text-5xl">lock_person</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-3">Akses Terbatas</h1>
                <p className="text-foreground/60 max-w-md mb-8 leading-relaxed">
                    Maaf, akun Anda tidak memiliki izin untuk mengakses halaman Admin.
                    Role Anda saat ini: <span className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-bold rounded-lg ml-1 font-mono">"{userRole || 'tidak diketahui'}"</span>
                </p>
                <div className="flex gap-4">
                    <button onClick={() => window.location.href = '/'} className="px-8 py-4 bg-itg-blue text-white rounded-2xl font-black hover:bg-itg-azure shadow-lg shadow-itg-blue/20 transition-all">
                        Kembali ke Beranda
                    </button>
                    <button onClick={() => window.location.reload()} className="px-8 py-4 bg-card border border-border text-foreground rounded-2xl font-bold hover:bg-background transition-all">
                        Coba Lagi
                    </button>
                </div>
                <p className="mt-10 text-[10px] text-foreground/40 uppercase tracking-[0.2em] font-black">
                    Hubungi Database Administrator jika ini adalah kesalahan.
                </p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background font-inter overflow-x-hidden">
            {/* Overlay Mobile */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 h-screen bg-card border-r border-border z-50 transition-all duration-300 flex flex-col p-6 w-64 flex-shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} print:hidden`}>
                <div className="mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative w-10 h-10 bg-white p-1 rounded-xl shadow-md overflow-hidden">
                            <Image src="/OIP.jpeg" alt="Logo ITG" fill className="object-contain p-1" />
                        </div>
                        <span className="text-xl font-black text-foreground font-montserrat tracking-tighter">SATGAS PPKPT</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-foreground/50"><span className="material-symbols-outlined">close</span></button>
                </div>
                <nav className="space-y-2 flex-grow overflow-y-auto">
                    <button onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-itg-blue/5 dark:bg-itg-azure/10 text-itg-blue dark:text-itg-azure' : 'text-foreground/70 hover:bg-background'}`}>
                        <span className="material-symbols-outlined">dashboard</span> Dashboard
                    </button>
                    <button onClick={() => { setActiveTab('laporan'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTab === 'laporan' ? 'bg-itg-blue/5 dark:bg-itg-azure/10 text-itg-blue dark:text-itg-azure' : 'text-foreground/70 hover:bg-background'}`}>
                        <span className="material-symbols-outlined">description</span> Laporan Masuk
                        {stats.pending > 0 && <span className="ml-auto bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">{stats.pending}</span>}
                    </button>
                    <Link href="/profile" className="w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-foreground/70 hover:bg-background">
                        <span className="material-symbols-outlined">account_circle</span> Profil Saya
                    </Link>
                </nav>
                <div className="mt-auto space-y-4 pt-6 border-t border-border">
                    <div className="flex items-center justify-between p-3 bg-background border border-border rounded-xl">
                        <span className="text-xs font-bold text-foreground/70">Tema</span>
                        <ThemeToggle />
                    </div>
                    <button onClick={handleLogout} className="w-full p-3 flex items-center justify-center gap-3 text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                        <span className="material-symbols-outlined">logout</span> Keluar
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow flex flex-col min-w-0">
                <header className="md:hidden p-4 bg-card border-b border-border flex items-center justify-between sticky top-0 z-30 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 bg-white p-1 rounded-lg">
                            <Image src="/OIP.jpeg" alt="Logo ITG" fill className="object-contain p-0.5" />
                        </div>
                        <span className="font-bold text-foreground tracking-tight">SATGAS PPKPT</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-foreground"><span className="material-symbols-outlined">menu</span></button>
                </header>

                <div className="p-6 md:p-10 flex-grow">
                    {activeTab === 'dashboard' ? (
                        <>
                            <header className="flex justify-between items-end mb-10 print:hidden">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard Admin</h1>
                                    <p className="text-sm text-foreground/70 mt-1">Ringkasan statistik aduan Satgas PPKPT.</p>
                                </div>
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 print:hidden">
                                <StatCard label="Total Aduan" value={stats.total} icon="analytics" color="bg-blue-600" />
                                <StatCard label="Perlu Tindakan" value={stats.pending} icon="pending_actions" color="bg-orange-500" />
                                <StatCard label="Selesai" value={stats.resolved} icon="task_alt" color="bg-emerald-500" />
                            </div>
                            <div className="flex justify-between items-center mb-4 print:hidden">
                                <h2 className="text-xl font-bold text-foreground">Laporan Terbaru</h2>
                                <button onClick={() => setActiveTab('laporan')} className="text-sm font-bold text-itg-blue dark:text-itg-azure hover:underline">Lihat Semua</button>
                            </div>
                            {loading && reports.length === 0 ? (
                                <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-itg-blue border-t-transparent rounded-full animate-spin"></div></div>
                            ) : (
                                <ReportTable reports={reports.slice(0, 5)} loading={loading} openDetailModal={openDetailModal} updateStatus={updateStatus} />
                            )}
                        </>
                    ) : (
                        <>
                            <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 print:hidden">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Semua Laporan Masuk</h1>
                                    <p className="text-foreground/70 mt-1">Kelola, cari, dan filter seluruh aduan yang masuk.</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 text-[18px]">search</span>
                                        <input type="text" placeholder="Cari ID, Nama..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm outline-none focus:border-itg-azure text-foreground w-full md:w-64" />
                                    </div>
                                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2 bg-card border border-border rounded-xl text-sm outline-none focus:border-itg-azure text-foreground cursor-pointer">
                                        <option value="">Semua Kategori</option>
                                        <option value="fisik">Kekerasan Fisik</option>
                                        <option value="psikis">Kekerasan Psikis</option>
                                        <option value="seksual">Kekerasan Seksual</option>
                                        <option value="perundungan">Perundungan</option>
                                        <option value="diskriminasi">Diskriminasi</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>
                            </header>
                            {loading && reports.length === 0 ? (
                                <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-itg-blue border-t-transparent rounded-full animate-spin"></div></div>
                            ) : (
                                <ReportTable reports={filteredReports} loading={loading} openDetailModal={openDetailModal} updateStatus={updateStatus} />
                            )}
                        </>
                    )}

                    {/* MODAL DETAIL LAPORAN */}
                    {selectedReport && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 print:static print:block bg-black/80 backdrop-blur-sm">
                            <div className="absolute inset-0 print:hidden" onClick={closeDetailModal}></div>
                            <div className="bg-card print:bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] shadow-2xl relative z-10 border border-border print:border-none print:shadow-none flex flex-col">
                                <div className="p-6 md:p-8 border-b border-border flex items-center justify-between bg-card/95 backdrop-blur-md sticky top-0 z-20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-itg-blue/10 dark:bg-itg-azure/10 rounded-2xl flex items-center justify-center">
                                            <span className="material-symbols-outlined text-itg-blue dark:text-itg-azure">description</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-foreground">Detail Berkas Laporan</h2>
                                            <p className="text-xs font-mono text-foreground/50">ID: {selectedReport.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 print:hidden">
                                        <button onClick={() => window.print()} className="h-11 px-5 bg-background border border-border hover:bg-border rounded-xl text-xs font-bold flex items-center gap-2 transition-all text-foreground">
                                            <span className="material-symbols-outlined text-[18px]">print</span> Cetak
                                        </button>
                                        <button onClick={closeDetailModal} className="w-11 h-11 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-grow overflow-y-auto p-8 md:p-10 space-y-10 bg-card">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-2">Informasi & Kontak Pelapor</p>
                                            <div className="p-4 bg-background rounded-2xl border border-border space-y-3">
                                                <div>
                                                    <p className="text-xs text-foreground/50 font-bold uppercase mb-1">Nama / Status</p>
                                                    <p className="text-base font-bold text-foreground">
                                                        {selectedReport.is_anonymous ? '🕵️ (Anonim)' : '👤 ' + (selectedReport.profiles?.full_name || 'Tanpa Nama')}
                                                    </p>
                                                </div>
                                                <div className="pt-2 border-t border-border/50">
                                                    <p className="text-xs text-foreground/50 font-bold uppercase mb-1">Email Pelapor</p>
                                                    <div className="flex items-center justify-between group">
                                                        <p className="text-sm font-mono text-itg-blue dark:text-itg-azure font-bold select-all">
                                                            {selectedReport.profiles?.email || 'Email tidak tersedia'}
                                                        </p>
                                                        <button onClick={() => { navigator.clipboard.writeText(selectedReport.profiles?.email); setToast({ msg: 'Email berhasil disalin!', type: 'success' }); }} className="text-xs bg-itg-blue/10 text-itg-blue px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">Salin</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-2">Kategori & Status</p>
                                            <div className="p-4 bg-background rounded-2xl border border-border h-[calc(100%-2rem)] flex flex-col justify-center">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="px-3 py-1 bg-itg-blue/10 dark:bg-itg-azure/20 border border-itg-blue/20 dark:border-itg-azure/30 rounded-lg text-xs font-black text-itg-blue dark:text-itg-azure uppercase tracking-wider">{selectedReport.category}</span>
                                                    <StatusBadge status={selectedReport.status} />
                                                </div>
                                                <p className="text-[10px] text-foreground/50 leading-tight"><span className="material-symbols-outlined text-[12px] align-middle mr-1">schedule</span> Dilaporkan: {new Date(selectedReport.created_at).toLocaleString('id-ID')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hearing Email Helper */}
                                    <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-[1.5rem] border border-blue-200 dark:border-blue-900/30 print:hidden">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"><span className="material-symbols-outlined">mail</span></div>
                                                <div>
                                                    <h4 className="font-bold text-blue-900 dark:text-blue-300">Email Pengingat Sidang</h4>
                                                    <p className="text-[10px] text-blue-700/70 dark:text-blue-400/70">Siapkan undangan sidang untuk pelapor melalui email.</p>
                                                </div>
                                            </div>
                                            <button onClick={() => {
                                                const template = `Yth. ${selectedReport.profiles?.full_name || 'Pelapor'},\n\nKami dari Satgas PPKPT Institut Teknologi Garut ingin menginformasikan bahwa laporan Anda dengan ID: ${selectedReport.id.substring(0, 8)}... telah kami tinjau.\n\nSehubungan dengan hal tersebut, kami mengundang Anda untuk menghadiri sesi klarifikasi/sidang yang akan dilaksanakan pada:\n\nHari/Tanggal: [Isi Hari/Tgl]\nWaktu: [Isi Jam]\nTempat: [Isi Lokasi/Link Zoom]\n\nTerlampir kami sertakan salinan bukti laporan Anda dalam format PDF.\n\nSalam,\nSatgas PPKPT ITG`;
                                                navigator.clipboard.writeText(template);
                                                setToast({ msg: 'Format email berhasil disalin!', type: 'success' });
                                            }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">content_copy</span> Salin Format Email
                                            </button>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-900/30 flex items-start gap-2">
                                            <span className="material-symbols-outlined text-orange-500 text-[18px]">warning</span>
                                            <p className="text-[10px] text-orange-700 dark:text-orange-400 font-bold leading-relaxed">PENTING: Jangan lupa klik tombol "Cetak" di atas, simpan sebagai PDF, lalu lampirkan secara manual saat Anda mengirimkan email ke pelapor.</p>
                                        </div>
                                    </div>

                                    {/* Kronologi */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2"><span className="w-1.5 h-6 bg-itg-azure rounded-full"></span><h3 className="font-bold text-foreground">Kronologi Kejadian</h3></div>
                                        <div className="p-6 bg-background rounded-[1.5rem] border border-border leading-relaxed text-foreground/80 text-sm whitespace-pre-wrap">{getCleanDescriptionAndEvidence(selectedReport.description).clean}</div>
                                    </div>

                                    {/* Bukti Pendukung */}
                                    {getCleanDescriptionAndEvidence(selectedReport.description).url && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2"><span className="w-1.5 h-6 bg-orange-500 rounded-full"></span><h3 className="font-bold text-foreground">Bukti Pendukung</h3></div>
                                            <div className="p-6 bg-background rounded-[1.5rem] border border-border">
                                                {getCleanDescriptionAndEvidence(selectedReport.description).url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                                                    <div className="space-y-4">
                                                        <img src={getCleanDescriptionAndEvidence(selectedReport.description).url} alt="Bukti Foto" className="max-w-full h-auto rounded-xl shadow-md border border-border" />
                                                        <a href={getCleanDescriptionAndEvidence(selectedReport.description).url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-itg-blue text-sm font-bold print:hidden"><span className="material-symbols-outlined text-[18px]">open_in_new</span> Buka Gambar Ukuran Penuh</a>
                                                    </div>
                                                ) : (
                                                    <a href={getCleanDescriptionAndEvidence(selectedReport.description).url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-itg-blue hover:text-itg-azure font-bold transition-colors group">
                                                        <div className="w-10 h-10 bg-itg-blue text-white rounded-xl flex items-center justify-center shadow-lg shadow-itg-blue/20 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[20px]">description</span></div>
                                                        <span>Buka Dokumen Bukti (Non-Foto)</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tanggapan Petugas */}
                                    <div className="space-y-3 pt-4">
                                        <div className="flex items-center gap-2"><span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span><h3 className="font-bold text-foreground">Tanggapan & Tindak Lanjut Satgas</h3></div>
                                        <div className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[1.5rem] border border-emerald-200 dark:border-emerald-800/30 print:bg-transparent">
                                            <div className="print:hidden">
                                                {selectedReport.status === 'resolved' ? (
                                                    <div className="bg-emerald-100 dark:bg-emerald-900/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 mb-4">
                                                        <span className="material-symbols-outlined text-emerald-600">lock_person</span>
                                                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Laporan ini sudah Selesai. Tanggapan tidak dapat diubah lagi.</p>
                                                    </div>
                                                ) : selectedReport.status === 'pending' ? (
                                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800 flex items-center gap-3 mb-4">
                                                        <span className="material-symbols-outlined text-orange-600">info</span>
                                                        <p className="text-xs font-bold text-orange-800 dark:text-orange-400">Status harus "Investigasi" terlebih dahulu sebelum Anda bisa mengisi tanggapan.</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-foreground/60 mb-4 bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-border/50">Pesan ini akan terlihat oleh pelapor di halaman Lacak.</p>
                                                )}

                                                <textarea
                                                    value={responseInput}
                                                    onChange={(e) => setResponseInput(e.target.value)}
                                                    disabled={selectedReport.status !== 'investigating'}
                                                    placeholder={selectedReport.status === 'investigating' ? "Ketik tanggapan resmi..." : "Status belum dalam investigasi..."}
                                                    rows={5}
                                                    className="w-full p-5 rounded-2xl bg-background border border-border focus:border-itg-azure focus:ring-4 focus:ring-itg-azure/10 outline-none resize-none mb-4 text-sm text-foreground disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900/50"
                                                />

                                                {selectedReport.status === 'investigating' && (
                                                    <button onClick={handleSaveResponse} disabled={savingResponse} className="w-full md:w-auto px-8 py-4 bg-itg-blue text-white font-black rounded-2xl hover:bg-itg-azure transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                                        <span className="material-symbols-outlined text-[20px]">send_and_archive</span> {savingResponse ? 'Sedang Menyimpan...' : 'Simpan & Kirim Tanggapan'}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="hidden print:block text-sm text-black whitespace-pre-wrap leading-loose">{selectedReport.admin_response || '(Belum ada tanggapan)'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {toast && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
                        <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'}`}>
                            <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
                            <span className="font-bold text-sm">{toast.msg}</span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const StatCard = ({ label, value, icon, color }: any) => (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white mb-4`}><span className="material-symbols-outlined">{icon}</span></div>
        <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-foreground">{value}</h3>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
        pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 print:text-orange-700',
        investigating: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 print:text-blue-700',
        resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 print:text-emerald-700',
    };
    return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>{status}</span>;
};

const ReportTable = ({ reports, loading, openDetailModal, updateStatus }: any) => (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm print:hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-background border-b border-border">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-foreground/50 uppercase tracking-widest">Pelapor</th>
                        <th className="px-6 py-4 text-xs font-bold text-foreground/50 uppercase tracking-widest">Kategori</th>
                        <th className="px-6 py-4 text-xs font-bold text-foreground/50 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-foreground/50 uppercase tracking-widest">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {reports.map((report: any) => (
                        <tr key={report.id} className="hover:bg-background transition-colors cursor-pointer group">
                            <td className="px-6 py-4" onClick={() => openDetailModal(report)}>
                                <div className="flex flex-col">
                                    <span className="font-bold text-foreground group-hover:text-itg-azure transition-colors">{report.is_anonymous ? '🕵️ Pelapor Anonim' : report.profiles?.full_name || 'Tanpa Nama'}</span>
                                    <span className="text-xs text-foreground/50 font-mono mt-1">{report.id.substring(0, 13)}...</span>
                                </div>
                            </td>
                            <td className="px-6 py-4"><span className={`px-3 py-1 bg-background border border-border rounded-lg text-xs font-bold text-foreground/70 capitalize w-fit ${report.category === 'seksual' ? 'border-red-500/30 text-red-600' : ''}`}>{report.category}</span></td>
                            <td className="px-6 py-4" onClick={() => openDetailModal(report)}><StatusBadge status={report.status} /></td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <select onChange={(e) => updateStatus(report.id, e.target.value)} disabled={report.status === 'resolved'} className="text-xs bg-background border border-border p-2 rounded-lg outline-none text-foreground font-bold hover:border-itg-azure cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed" value={report.status}>
                                        <option value="pending">Set Pending</option>
                                        <option value="investigating">Investigasi</option>
                                        <option value="resolved">Selesai</option>
                                    </select>
                                    <button onClick={() => openDetailModal(report)} className="px-3 py-2 bg-itg-blue/10 text-itg-blue dark:text-itg-azure rounded-lg text-xs font-bold hover:bg-itg-blue hover:text-white transition-colors">Detail</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default AdminDashboard;