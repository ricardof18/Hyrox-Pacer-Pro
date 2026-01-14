import React, { useState, useEffect } from 'react';
import api from '../api';
import ResultCard from '../components/ResultCard';
import PaceChart from '../components/PaceChart';
import PartnerStrategy from '../components/PartnerStrategy';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { splitTimeToSeconds, secondsToHHMMSS, secondsToMMSS } from '../utils/timeUtils';
import { Share2, Download, MessageCircle, Link } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CATEGORIES = [
    { id: 'Single Open', label: 'Single Open', defaultRox: 6 },
    { id: 'Single Pro', label: 'Single Pro', defaultRox: 6 },
    { id: 'Doubles Men', label: 'Doubles Men', defaultRox: 8 },
    { id: 'Doubles Women', label: 'Doubles Women', defaultRox: 8 },
    { id: 'Doubles Pro', label: 'Doubles Pro', defaultRox: 8 },
];

const INITIAL_TARGET = '01:15:00';

const Pacer = () => {
    const { user } = useAuth();
    const [targetTime, setTargetTime] = useState(INITIAL_TARGET);
    const [category, setCategory] = useState(CATEGORIES[0].id);
    const [globalRunPace, setGlobalRunPace] = useState('');
    const [roxzoneMinutes, setRoxzoneMinutes] = useState(CATEGORIES[0].defaultRox);
    const [splits, setSplits] = useState([]);
    const [calculatedTotal, setCalculatedTotal] = useState('00:00:00');
    const [timeDiff, setTimeDiff] = useState(null);
    const [loading, setLoading] = useState(false);
    const [warning, setWarning] = useState(null);
    const [athleteNames, setAthleteNames] = useState({ A: 'Athlete A', B: 'Athlete B' });
    const [lastSavedSim, setLastSavedSim] = useState(null);
    const [isElite, setIsElite] = useState(false);
    const [athleteLevel, setAthleteLevel] = useState('Competitivo');
    const [searchParams, setSearchParams] = useSearchParams();

    const isDoubles = category.toLowerCase().includes('doubles');

    useEffect(() => {
        // 1. Check URL Parameters for hydration (?t=01:15:00&c=Single+Open&p=05:00)
        const t = searchParams.get('t');
        const c = searchParams.get('c');
        const p = searchParams.get('p');
        if (t) setTargetTime(t);
        if (c) setCategory(c);
        if (p) setGlobalRunPace(p);

        // 2. Check LocalStorage (History Load)
        const saved = localStorage.getItem('loaded_simulation');
        if (saved) {
            try {
                const sim = JSON.parse(saved);
                setTargetTime(sim.tempo_alvo);
                setCategory(sim.categoria_hyrox || sim.json_resultados.categoria_hyrox || CATEGORIES[0].id);

                if (sim.json_resultados) {
                    setSplits(sim.json_resultados.splits || []);
                    setRoxzoneMinutes((sim.json_resultados.roxzone_total_seconds / 60).toFixed(1));
                    if (sim.json_resultados.athlete_names) {
                        setAthleteNames(sim.json_resultados.athlete_names);
                    }
                }
                // Clear after loading
                localStorage.removeItem('loaded_simulation');
            } catch (e) {
                console.error("Failed to load simulation:", e);
            }
        }
    }, [CATEGORIES]);

    useEffect(() => {
        if (!splits || splits.length === 0) {
            setCalculatedTotal('00:00:00');
            setTimeDiff(null);
            return;
        }
        const splitsTotalSeconds = splits.reduce((acc, curr) => acc + splitTimeToSeconds(curr.suggested_time_formatted), 0);
        const roxzoneSeconds = (parseFloat(roxzoneMinutes) || 0) * 60;
        const totalSeconds = splitsTotalSeconds + roxzoneSeconds;
        setCalculatedTotal(secondsToHHMMSS(totalSeconds));
        const targetSeconds = splitTimeToSeconds(targetTime);
        const diffSeconds = totalSeconds - targetSeconds;
        const sign = diffSeconds > 0 ? '+' : '-';
        setTimeDiff(`${sign}${secondsToHHMMSS(Math.abs(diffSeconds))}`);
    }, [splits, roxzoneMinutes, targetTime]);

    const handleGlobalPaceChange = (e) => setGlobalRunPace(e.target.value);
    const handleReset = () => {
        setSplits([]);
        setCalculatedTotal('00:00:00');
        setTimeDiff(null);
    };

    const handleGeneratePlan = async (e) => {
        e.preventDefault();
        setLoading(true);
        setWarning(null);
        try {
            const payload = {
                tempo_alvo: targetTime,
                categoria_hyrox: category,
                preferred_run_pace: globalRunPace || null,
                roxzone_minutes: parseFloat(roxzoneMinutes) || 0,
                is_elite: isElite || athleteLevel === 'Elite',
                athlete_level: athleteLevel
            };
            const response = await api.post('/calculate-pacer', payload);
            let newSplits = response.data.splits;
            if (isDoubles) {
                newSplits = newSplits.map(s => s.type === 'exercise' ? { ...s, workSplit: { A: 50, B: 50 } } : s);
            }
            if (splits.length > 0) {
                newSplits = newSplits.map(newS => {
                    const oldS = splits.find(s => s.station === newS.station);
                    if (oldS && oldS.locked) return oldS;
                    if (oldS && oldS.workSplit && newS.type === 'exercise') return { ...newS, workSplit: oldS.workSplit };
                    return newS;
                });
            }
            setSplits(newSplits);
            setRoxzoneMinutes((response.data.roxzone_total_seconds / 60).toFixed(1));
            if (response.data.warning) setWarning(response.data.warning);
        } catch (err) {
            console.error(err);
            alert('Error: ' + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSplitChange = (stationName, newVal) => {
        setSplits(splits.map(s => s.station === stationName ? {
            ...s,
            suggested_time_formatted: newVal,
            suggested_time_seconds: splitTimeToSeconds(newVal)
        } : s));
    };

    const handleWorkSplitChange = (stationName, athlete, value) => {
        const val = Math.min(100, Math.max(0, parseInt(value) || 0));
        let updated = splits.map(s => {
            if (s.station === stationName) {
                const newSplit = { ...s.workSplit, [athlete]: val };
                newSplit[athlete === 'A' ? 'B' : 'A'] = 100 - val;
                return { ...s, workSplit: newSplit };
            }
            return s;
        });
        const currentSplit = updated.find(s => s.station === stationName);
        if (currentSplit) {
            const nextIdx = updated.findIndex((s, i) => i > updated.findIndex(x => x.station === stationName) && s.type === 'exercise');
            if (nextIdx !== -1 && updated[nextIdx].workSplit.A === 50 && updated[nextIdx].workSplit.B === 50) {
                if (currentSplit.workSplit.A > 70) updated[nextIdx].workSplit = { A: 20, B: 80 };
                else if (currentSplit.workSplit.B > 70) updated[nextIdx].workSplit = { A: 80, B: 20 };
            }
        }
        setSplits(updated);
    };

    const handleInvertRoles = () => {
        setSplits(splits.map(s => (s.type === 'exercise' && s.workSplit) ? { ...s, workSplit: { A: s.workSplit.B, B: s.workSplit.A } } : s));
    };

    const handleLockToggle = (stationName) => {
        setSplits(splits.map(s => s.station === stationName ? { ...s, locked: !s.locked } : s));
    };

    const handleSavePlan = async () => {
        if (!splits || splits.length === 0) return null;
        try {
            const simulationData = {
                tempo_alvo: targetTime,
                categoria_hyrox: category,
                json_resultados: {
                    splits,
                    roxzone_total_seconds: (parseFloat(roxzoneMinutes) || 0) * 60,
                    roxzone_formatted: "00:" + secondsToMMSS((parseFloat(roxzoneMinutes) || 0) * 60),
                    calculated_total: calculatedTotal,
                    is_doubles: isDoubles,
                    athlete_names: isDoubles ? athleteNames : null
                }
            };
            const response = await api.post('/simulations', simulationData);
            setLastSavedSim(response.data);
            alert('Plan saved successfully!');
            return response.data;
        } catch (err) {
            console.error(err);
            alert('Failed to save plan.');
            return null;
        }
    };

    const handleShare = async () => {
        let sim = lastSavedSim;
        if (!sim) {
            sim = await handleSavePlan();
        }

        if (sim && sim.share_token) {
            const url = `${window.location.origin}/share/${sim.share_token}`;
            await navigator.clipboard.writeText(url);
            alert("Link de partilha pública copiado! 📋");
        }
    };

    const handleCopyStrategyLink = () => {
        const params = new URLSearchParams();
        params.set('t', targetTime);
        params.set('c', category);
        if (globalRunPace) params.set('p', globalRunPace);

        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        navigator.clipboard.writeText(url);
        alert("Link de estratégia (frontend) copiado! 🔗");
    };

    const handleWhatsAppShare = () => {
        const msg = `🚀 *HYROX PACER PRO - Estratégia de Prova*\n\n` +
            `🏁 *Plano:* ${category}\n` +
            `⏱️ *Target:* ${targetTime}\n` +
            `📊 *Tempo Calculado:* ${calculatedTotal}\n` +
            (isDoubles ? `👥 *Dupla:* ${athleteNames.A} & ${athleteNames.B}\n` : '') +
            `🔗 *Ver Detalhes:* ${window.location.href}\n\n` +
            `Bora esmagar! 🔥`;

        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const primaryColor = [255, 107, 0]; // Hyrox Orange

        // Header
        doc.setFillColor(30, 30, 30);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("HYROX PACER PRO", 15, 25);

        doc.setFontSize(10);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("OPTIMIZE YOUR RACE", 15, 32);

        // Meta Info
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(10);
        doc.text(`Categoria: ${category}`, 15, 50);
        doc.text(`Target Time: ${targetTime}`, 15, 56);
        doc.text(`Tempo Estimado: ${calculatedTotal}`, 15, 62);
        if (isDoubles) {
            doc.text(`Atletas: ${athleteNames.A} (A) e ${athleteNames.B} (B)`, 15, 68);
        }

        // Table
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

        doc.save(`Hyrox_Pacer_Plan_${category.replace(' ', '_')}.pdf`);
    };

    const getFatigueStats = () => {
        if (!isDoubles || !splits.length) return null;
        const exercises = splits.filter(s => s.type === 'exercise');
        if (!exercises.length) return null;

        const totalA = exercises.reduce((acc, s) => acc + (s.workSplit?.A || 50), 0) / exercises.length;
        const totalB = exercises.reduce((acc, s) => acc + (s.workSplit?.B || 50), 0) / exercises.length;

        return { A: totalA.toFixed(0), B: totalB.toFixed(0) };
    };

    const fatigue = getFatigueStats();

    return (
        <DashboardLayout>
            {/* STICKY TOTAL TIME SUMMARY */}
            {splits.length > 0 && (
                <div className="sticky top-4 z-50 mb-6 animate-fade-in">
                    <div className="bg-[#1a1a1a]/90 backdrop-blur-md border border-hyrox-orange/50 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4 max-w-5xl mx-auto ring-1 ring-hyrox-orange/20">
                        <div className="flex items-center gap-4">
                            <div className="bg-hyrox-orange/10 p-2 rounded-lg">
                                <span className="text-hyrox-orange font-black text-xl italic leading-none">TOTAL</span>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Calculated Time</div>
                                <div className="text-3xl font-mono font-black text-white leading-tight">{calculatedTotal}</div>
                            </div>
                        </div>

                        <div className="h-10 w-px bg-gray-800 hidden lg:block"></div>

                        {isDoubles && fatigue && (
                            <div className="flex items-center gap-4 px-4 border-l border-gray-800 lg:border-l-0">
                                <div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fatigue Cost</div>
                                    <div className="flex gap-3 mt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-hyrox-orange"></div>
                                            <span className="text-sm font-black text-white">{fatigue.A}%</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                            <span className="text-sm font-black text-gray-400">{fatigue.B}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="h-10 w-px bg-gray-800 hidden sm:block"></div>

                        <div className="flex items-center gap-6">
                            <div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target</div>
                                <div className="text-lg font-mono font-bold text-gray-300">{targetTime}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Diff</div>
                                <div className={`text-2xl font-mono font-black ${timeDiff?.startsWith('-') ? 'text-green-500' : 'text-red-500'}`}>
                                    {timeDiff}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <section className="mb-8">
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Race Pacer</h2>
                        <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-full border border-[#333]">
                            <span className="text-xs text-gray-500 font-bold uppercase">Category:</span>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-transparent text-hyrox-orange font-bold text-sm outline-none cursor-pointer">
                                {CATEGORIES.map(cat => <option key={cat.id} value={cat.id} className="bg-[#1a1a1a]">{cat.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <form onSubmit={handleGeneratePlan} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Time</label>
                                <input type="text" value={targetTime} onChange={(e) => setTargetTime(e.target.value)} className="w-full bg-[#121212] border border-[#333] text-white p-3 rounded font-mono focus:border-hyrox-orange outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Global Run Pace (min/km)</label>
                                <input type="text" value={globalRunPace} onChange={handleGlobalPaceChange} placeholder="05:00" className="w-full bg-[#121212] border border-[#333] text-hyrox-orange font-bold p-3 rounded font-mono focus:border-hyrox-orange outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Roxzone (Total Min)</label>
                                <input type="number" step="0.1" value={roxzoneMinutes} onChange={(e) => setRoxzoneMinutes(e.target.value)} className="w-full bg-[#121212] border border-[#333] text-white p-3 rounded font-mono focus:border-hyrox-orange outline-none" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Athlete Level</label>
                                <div className="flex p-1 bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-inner translate-y-[-4px]">
                                    {['Recreativo', 'Competitivo', 'Elite'].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setAthleteLevel(level)}
                                            className={`flex-1 py-2 px-3 text-[10px] font-black uppercase italic transition-all duration-300 rounded-lg ${athleteLevel === level
                                                    ? 'bg-hyrox-orange text-white shadow-lg'
                                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {isDoubles && (
                                <div className="col-span-1 md:col-span-4 grid grid-cols-2 gap-4 mt-4 p-4 border border-white/5 rounded-2xl bg-[#151515] ring-1 ring-white/5">
                                    <div>
                                        <label className="block text-[10px] font-black text-hyrox-orange uppercase mb-2 tracking-widest">Atleta A</label>
                                        <input type="text" value={athleteNames.A} onChange={(e) => setAthleteNames({ ...athleteNames, A: e.target.value })} className="w-full bg-black border border-[#333] text-white p-3 rounded-xl font-bold focus:border-hyrox-orange outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Atleta B</label>
                                        <input type="text" value={athleteNames.B} onChange={(e) => setAthleteNames({ ...athleteNames, B: e.target.value })} className="w-full bg-black border border-[#333] text-white p-3 rounded-xl font-bold focus:border-gray-500 outline-none transition-all" />
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button type="button" onClick={handleReset} className="px-4 py-3 bg-[#333] hover:bg-[#444] text-white font-bold rounded shadow transition-all">Reset</button>
                                <button type="submit" disabled={loading} className="flex-1 bg-hyrox-orange hover:bg-orange-600 text-white font-bold py-3 px-6 rounded shadow hover:shadow-lg transition-all">{loading ? 'Computing...' : 'Generate Plan'}</button>
                                {splits.length > 0 && <button type="button" onClick={handleSavePlan} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded shadow transition-all">SAVE</button>}
                                {splits.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded shadow transition-all border border-white/20 flex items-center gap-2"
                                    >
                                        <Share2 size={18} /> <span className="hidden sm:inline">SHARE</span>
                                    </button>
                                )}
                                {isDoubles && splits.length > 0 && <button type="button" onClick={handleInvertRoles} className="px-4 py-3 bg-blue-900/50 hover:bg-blue-800/50 text-blue-200 font-bold rounded shadow transition-all border border-blue-800">Swap Roles</button>}
                            </div>
                        </div>
                    </form>

                    {splits.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/5">
                            <button
                                onClick={handleExportPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] text-gray-300 rounded-lg text-xs font-black uppercase transition-all border border-white/5"
                            >
                                <Download size={14} /> Export PDF
                            </button>
                            <button
                                onClick={handleWhatsAppShare}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600/10 hover:bg-green-600/20 text-green-500 rounded-lg text-xs font-black uppercase transition-all border border-green-600/20"
                            >
                                <MessageCircle size={14} /> WhatsApp
                            </button>
                            <button
                                onClick={handleCopyStrategyLink}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-lg text-xs font-black uppercase transition-all border border-blue-600/20"
                            >
                                <Link size={14} /> Copy Config URL
                            </button>
                        </div>
                    )}
                </Card>
            </section>
            {
                isDoubles && splits.length > 0 && (
                    <div className="mb-8 animate-fade-in">
                        <PartnerStrategy splits={splits} athleteNames={athleteNames} />
                    </div>
                )
            }
            {
                splits.length > 0 && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {splits.map((split, idx) => (
                                <ResultCard key={idx} split={split} onTimeChange={handleSplitChange} onLockToggle={handleLockToggle} isDoubles={isDoubles} athleteNames={athleteNames} onWorkSplitChange={handleWorkSplitChange} />
                            ))}
                        </div>
                        <Card><PaceChart splits={splits} /></Card>
                    </div>
                )
            }

        </DashboardLayout >
    );
};

export default Pacer;
