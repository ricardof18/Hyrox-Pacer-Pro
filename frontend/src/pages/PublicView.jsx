import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Card from '../components/Card';
import { Timer, Trophy, Share2, ArrowRight, Download, ShieldCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PublicView = () => {
    const { token } = useParams();
    const [sim, setSim] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShared = async () => {
            try {
                const response = await api.get(`/share/${token}`);
                setSim(response.data);
            } catch (err) {
                setError("Plano não encontrado ou expirado.");
            } finally {
                setLoading(false);
            }
        };
        fetchShared();
    }, [token]);

    if (loading) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-hyrox-orange"></div>
            <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Carregando Plano...</p>
        </div>
    );

    if (error || !sim) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <Trophy size={48} className="text-gray-800 mb-4" />
            <h1 className="text-2xl font-black italic mb-2 text-hyrox-orange">UPS!</h1>
            <p className="text-gray-400 max-w-xs">{error || "Não conseguimos encontrar este plano de prova."}</p>
        </div>
    );

    const { json_resultados, tempo_alvo } = sim;
    const { splits, calculated_total, athlete_names } = json_resultados;
    const isDoubles = sim.categoria_hyrox?.toLowerCase().includes('doubles');

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const primaryColor = [255, 107, 0]; // Hyrox Orange

        doc.setFillColor(30, 30, 30);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("HYROX PACER PRO", 15, 25);

        doc.setFontSize(10);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("OFFICIAL PACER STRATEGY PLAN", 15, 32);

        doc.setTextColor(60, 60, 60);
        doc.setFontSize(10);
        doc.text(`Categoria: ${sim.categoria_hyrox}`, 15, 50);
        doc.text(`Target Time: ${tempo_alvo}`, 15, 56);
        doc.text(`Tempo Estimado: ${calculated_total}`, 15, 62);
        if (athlete_names) {
            doc.text(`Atletas: ${athlete_names.A} (A) e ${athlete_names.B} (B)`, 15, 68);
        }

        const tableData = splits.map(s => {
            const row = [s.station, s.suggested_time_formatted];
            if (isDoubles) {
                row.push(s.type === 'exercise' ? `${s.workSplit?.A}% / ${s.workSplit?.B}%` : '-');
            }
            return row;
        });

        autoTable(doc, {
            startY: 75,
            head: [isDoubles ? ['Station', 'Time', 'Work Split (A/B)'] : ['Station', 'Time']],
            body: tableData,
            headStyles: { fillColor: primaryColor },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: 15, right: 15 }
        });

        doc.save(`Hyrox_Shared_Plan_${sim.categoria_hyrox?.replace(' ', '_')}.pdf`);
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <header className="bg-hyrox-orange p-6 pt-12 rounded-b-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Trophy size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter italic">Pacer Pro Plan</div>
                        <div className="flex items-center gap-1 text-black font-black text-[10px] uppercase">
                            <ShieldCheck size={12} /> Oficial Strategy
                        </div>
                    </div>
                    <h1 className="text-4xl font-black italic text-black leading-tight">VAMOS A ISTO!</h1>
                    <p className="text-black/70 font-bold text-sm uppercase tracking-wide">
                        {sim.categoria_hyrox || "Race Day Plan"}
                    </p>
                </div>
            </header>

            <main className="px-4 -mt-8 relative z-20 space-y-6">
                {/* Summary Card */}
                <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6 shadow-2xl flex justify-around items-center ring-1 ring-white/5">
                    <div className="text-center">
                        <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Target</p>
                        <p className="text-2xl font-mono font-black text-white leading-none">{tempo_alvo}</p>
                    </div>
                    <div className="h-10 w-px bg-gray-800"></div>
                    <div className="text-center">
                        <p className="text-[10px] text-hyrox-orange font-black uppercase mb-1">Projected</p>
                        <p className="text-2xl font-mono font-black text-hyrox-orange leading-none">{calculated_total}</p>
                    </div>
                </div>

                {athlete_names && (
                    <div className="flex gap-4 px-2">
                        <div className="flex-1 bg-hyrox-orange/10 border border-hyrox-orange/20 p-2 rounded-xl text-center">
                            <span className="text-[8px] text-hyrox-orange uppercase font-black block">Atleta A</span>
                            <span className="text-xs font-bold text-white truncate block">{athlete_names.A}</span>
                        </div>
                        <div className="flex-1 bg-gray-800/50 border border-white/5 p-2 rounded-xl text-center">
                            <span className="text-[8px] text-gray-500 uppercase font-black block">Atleta B</span>
                            <span className="text-xs font-bold text-white truncate block">{athlete_names.B}</span>
                        </div>
                    </div>
                )}

                {/* Splits List */}
                <div className="space-y-3">
                    <h3 className="px-2 text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Timer size={14} /> Race Splits
                    </h3>

                    {splits.map((s, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${s.type === 'run' ? 'bg-[#121212] border-[#222]' : 'bg-[#1E1E1E] border-[#333]'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-1 font-black h-8 rounded-full ${s.type === 'run' ? 'bg-gray-700' : 'bg-hyrox-orange'}`}></div>
                                <div>
                                    <p className="text-xs font-black italic text-white uppercase tracking-tighter">{s.station}</p>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                                        {s.type === 'run' ? 'Running' : 'Exercise'}
                                        {s.workSplit && (
                                            <span className="ml-2 bg-gray-800 px-1 rounded text-[8px]">
                                                {s.workSplit.A}% / {s.workSplit.B}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-mono font-black text-white">{s.suggested_time_formatted.substring(3)}</p>
                                <p className="text-[8px] font-black text-gray-600 uppercase">Sugestão</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 px-2">
                    <button
                        onClick={handleExportPDF}
                        className="w-full bg-[#1a1a1a] hover:bg-[#222] text-gray-400 border border-white/5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                        <Download size={14} className="text-hyrox-orange" /> Descarregar Plano PDF
                    </button>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md border-t border-white/5 flex justify-center">
                <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-black text-xs uppercase italic tracking-tighter">
                    Fazer O Meu Plano <ArrowRight size={14} />
                </button>
            </footer>
        </div>
    );
};

export default PublicView;
