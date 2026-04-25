'use client'

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const LaporPage = () => {
    const [category, setCategory] = useState('');
    const [incidentDate, setIncidentDate] = useState('');
    const [incidentLocation, setIncidentLocation] = useState('');
    const [description, setDescription] = useState('');
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !description || !incidentDate || !incidentLocation) {
            setError('Semua informasi kejadian wajib diisi.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            
            // Dapatkan user_id saat ini
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                setError('Anda harus login terlebih dahulu.');
                setLoading(false);
                return;
            }

            let evidenceUrl = '';
            if (evidenceFile) {
                // Generate nama file unik
                const fileExt = evidenceFile.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                
                // Upload ke storage bucket bernama 'evidence_bucket'
                const { error: uploadError } = await supabase.storage
                    .from('evidence_bucket')
                    .upload(`public/${fileName}`, evidenceFile);

                if (uploadError) {
                    throw new Error('Gagal upload bukti: pastikan bucket "evidence_bucket" ada dan public di Supabase!');
                }

                // Dapatkan public URL
                const { data: publicUrlData } = supabase.storage
                    .from('evidence_bucket')
                    .getPublicUrl(`public/${fileName}`);
                
                evidenceUrl = publicUrlData.publicUrl;
            }

            const finalDescription = `Tanggal Kejadian: ${incidentDate}\nLokasi Kejadian: ${incidentLocation}\n\nKronologi:\n${description}${evidenceUrl ? `\n\nLink Bukti (Otomatis): ${evidenceUrl}` : ''}`;

            const { data, error: insertError } = await supabase
                .from('reports')
                .insert([
                    {
                        user_id: user.id,
                        category,
                        description: finalDescription,
                        is_anonymous: isAnonymous,
                        // status dan created_at otomatis dihandle PostgreSQL
                    }
                ])
                .select('id')
                .single();

            if (insertError) throw insertError;

            // Berhasil
            setSuccessId(data.id);
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan saat mengirim laporan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
            <Header />

            <main className="flex-grow pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-16 h-16 bg-itg-blue rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-itg-blue/20"
                        >
                            <span className="material-symbols-outlined text-white text-3xl">edit_note</span>
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-montserrat font-black text-itg-blue dark:text-white mb-4">
                            Formulir Pengaduan
                        </h1>
                        <p className="text-foreground/70 font-medium">
                            Laporan Anda akan kami proses secara rahasia dan profesional. Mohon isi data dengan sebenar-benarnya.
                        </p>
                    </div>

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none relative overflow-hidden"
                    >
                        {successId ? (
                            <div className="text-center py-10">
                                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-5xl text-emerald-600 dark:text-emerald-400">check_circle</span>
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-4">Laporan Berhasil Dikirim!</h2>
                                <p className="text-foreground/70 mb-8">
                                    Terima kasih telah berani melaporkan. Kami akan segera menindaklanjuti laporan Anda.
                                    <br /><br />
                                    Kode Laporan Anda (simpan untuk melacak status):<br />
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <span className="inline-block px-4 py-2 bg-background border border-border rounded-xl font-mono font-bold text-lg text-itg-blue dark:text-itg-azure select-all">
                                            {successId}
                                        </span>
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(successId as string);
                                                alert('Kode laporan berhasil disalin!\\n\\nCatatan: Fitur notifikasi email akan segera ditambahkan.');
                                            }}
                                            className="px-4 py-2 bg-itg-blue text-white rounded-xl font-bold shadow-md hover:bg-itg-azure transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                            Salin
                                        </button>
                                    </div>
                                </p>
                                <div className="flex justify-center gap-4 flex-wrap">
                                    <button onClick={() => { 
                                        setSuccessId(null); 
                                        setCategory(''); 
                                        setDescription(''); 
                                        setIncidentDate(''); 
                                        setIncidentLocation(''); 
                                        setEvidenceFile(null); 
                                        setPreviewUrl(null);
                                        setIsAnonymous(false); 
                                    }} className="px-6 py-3 bg-background border border-border text-foreground rounded-xl font-bold hover:bg-card transition-all">
                                        Buat Laporan Baru
                                    </button>
                                    <Link href="/lacak" className="px-6 py-3 bg-itg-blue text-white rounded-xl font-bold shadow-lg hover:bg-itg-azure transition-all">
                                        Lacak Laporan
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {error && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl border border-red-200 dark:border-red-800">
                                        {error}
                                    </div>
                                )}

                                {/* Data Kejadian Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border">
                                        <span className="material-symbols-outlined text-itg-azure">event_note</span>
                                        <h2 className="font-bold text-itg-blue dark:text-white uppercase tracking-wider text-sm">Informasi Kejadian</h2>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-foreground/60 uppercase tracking-widest ml-1">Kategori Kekerasan</label>
                                        <select 
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full h-14 px-5 rounded-2xl bg-background border border-border focus:border-itg-azure focus:ring-4 focus:ring-itg-azure/10 outline-none transition-all font-medium text-foreground appearance-none cursor-pointer"
                                            required
                                        >
                                            <option disabled value="">Pilih jenis kekerasan</option>
                                            <option value="fisik">Kekerasan Fisik</option>
                                            <option value="psikis">Kekerasan Psikis</option>
                                            <option value="seksual">Kekerasan Seksual</option>
                                            <option value="perundungan">Perundungan (Bullying)</option>
                                            <option value="diskriminasi">Diskriminasi & Intoleransi</option>
                                            <option value="lainnya">Lainnya</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-foreground/60 uppercase tracking-widest ml-1">Tanggal Kejadian</label>
                                            <input 
                                                type="date" 
                                                value={incidentDate}
                                                onChange={(e) => setIncidentDate(e.target.value)}
                                                className="w-full h-14 px-5 rounded-2xl bg-background border border-border focus:border-itg-azure focus:ring-4 focus:ring-itg-azure/10 outline-none transition-all font-medium text-foreground" 
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-foreground/60 uppercase tracking-widest ml-1">Lokasi Kejadian</label>
                                            <input 
                                                type="text" 
                                                value={incidentLocation}
                                                onChange={(e) => setIncidentLocation(e.target.value)}
                                                placeholder="Misal: Lab Komputer" 
                                                className="w-full h-14 px-5 rounded-2xl bg-background border border-border focus:border-itg-azure focus:ring-4 focus:ring-itg-azure/10 outline-none transition-all font-medium text-foreground" 
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-foreground/60 uppercase tracking-widest ml-1">Ceritakan Kronologi (Deskripsi)</label>
                                        <textarea 
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={6} 
                                            placeholder="Jelaskan kronologi kejadian secara detail dan jelas..." 
                                            className="w-full p-5 rounded-2xl bg-background border border-border focus:border-itg-azure focus:ring-4 focus:ring-itg-azure/10 outline-none transition-all font-medium resize-none text-foreground"
                                            required
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Bukti & Saksi Section */}
                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border">
                                        <span className="material-symbols-outlined text-itg-azure">upload_file</span>
                                        <h2 className="font-bold text-itg-blue dark:text-white uppercase tracking-wider text-sm">Bukti Pendukung (Opsional)</h2>
                                    </div>

                                    <div className="relative border-2 border-dashed border-border rounded-3xl p-8 text-center hover:border-itg-azure transition-colors group bg-background/50 overflow-hidden min-h-[200px] flex items-center justify-center">
                                        {/* Input file sembunyi tapi menutupi seluruh area selama belum ada file */}
                                        {!evidenceFile && (
                                            <input 
                                                type="file" 
                                                accept="image/*,video/mp4,application/pdf"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 5 * 1024 * 1024) { // Limit 5MB
                                                            setError('Ukuran file maksimal 5MB untuk menghemat penyimpanan server!');
                                                            setEvidenceFile(null);
                                                            setPreviewUrl(null);
                                                            e.target.value = ''; // Reset
                                                        } else {
                                                            setEvidenceFile(file);
                                                            setError(null);
                                                            // Jika file adalah gambar, buat URL preview
                                                            if (file.type.startsWith('image/')) {
                                                                setPreviewUrl(URL.createObjectURL(file));
                                                            } else {
                                                                setPreviewUrl(null);
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        )}

                                        {/* Tampilan jika ADA file terpilih */}
                                        {evidenceFile ? (
                                            <div className="flex flex-col items-center justify-center relative z-30 w-full">
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Preview Bukti" className="w-32 h-32 object-cover rounded-2xl mb-4 shadow-lg border border-border" />
                                                ) : (
                                                    <div className="w-24 h-24 bg-card rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-border">
                                                        <span className="material-symbols-outlined text-5xl text-itg-blue dark:text-itg-azure">
                                                            {evidenceFile.type.includes('pdf') ? 'picture_as_pdf' : evidenceFile.type.includes('video') ? 'movie' : 'task'}
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-sm font-bold text-foreground mb-1 w-full truncate px-4">{evidenceFile.name}</p>
                                                <p className="text-xs text-foreground/50 font-medium bg-foreground/5 px-3 py-1 rounded-full mb-4">
                                                    {(evidenceFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                                
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setEvidenceFile(null);
                                                        setPreviewUrl(null);
                                                    }}
                                                    className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                    Hapus & Ganti File
                                                </button>
                                            </div>
                                        ) : (
                                            /* Tampilan jika BELUM ada file terpilih */
                                            <div className="flex flex-col items-center justify-center pointer-events-none">
                                                <span className="material-symbols-outlined text-5xl text-foreground/40 group-hover:text-itg-azure transition-colors mb-3">cloud_upload</span>
                                                <p className="text-sm font-bold text-foreground/70 mb-2">Klik atau drag file bukti ke sini</p>
                                                <p className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold">Maksimal 5MB (PDF, JPG, PNG, MP4)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Privacy Section */}
                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border">
                                        <span className="material-symbols-outlined text-itg-azure">security</span>
                                        <h2 className="font-bold text-itg-blue dark:text-white uppercase tracking-wider text-sm">Privasi & Keamanan</h2>
                                    </div>

                                    <label className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-background cursor-pointer hover:border-itg-azure/50 transition-all">
                                        <input 
                                            type="checkbox" 
                                            checked={isAnonymous}
                                            onChange={(e) => setIsAnonymous(e.target.checked)}
                                            className="w-5 h-5 rounded text-itg-blue focus:ring-itg-azure border-border bg-card"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground">Sembunyikan Identitas Saya (Anonim)</span>
                                            <span className="text-xs text-foreground/60">Nama Anda tidak akan terlihat oleh siapa pun, termasuk admin Satgas.</span>
                                        </div>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-6">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full h-16 bg-itg-blue hover:bg-itg-azure text-white rounded-2xl font-black text-lg shadow-xl shadow-itg-blue/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0"
                                    >
                                        {loading ? 'Mengirim...' : 'Kirim Laporan Resmi'}
                                        {!loading && <span className="material-symbols-outlined">send</span>}
                                    </button>
                                    <p className="text-center text-[11px] text-foreground/60 mt-6 leading-relaxed">
                                        Dengan menekan tombol di atas, Anda menyatakan bahwa data yang diberikan adalah benar. <br />
                                        <span className="text-itg-blue dark:text-itg-azure font-bold">Identitas Anda akan kami rahasiakan sepenuhnya.</span>
                                    </p>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LaporPage;