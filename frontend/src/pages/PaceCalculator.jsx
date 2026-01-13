import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import { Activity, Gauge, Timer, Ruler, Info, ArrowRight, Table, Hash, Clock, Navigation } from 'lucide-react';

const PaceCalculator = () => {
    const [activeTab, setActiveTab] = useState('running');
    const [calcMode, setCalcMode] = useState('pace'); // 'pace', 'time', 'distance'

    // Inputs
    const [distance, setDistance] = useState('1'); // km for run, m for ergs
    const [time, setTime] = useState('04:00'); // MM:SS or HH:MM:SS
    const [pace, setPace] = useState('04:00'); // MM:SS (/km or /500m)

    // Result
    const [result, setResult] = useState('');
    const [runKmh, setRunKmh] = useState('15.0');
    const [quickPace, setQuickPace] = useState('4:00');

    // Utility: Time string to seconds
    const timeToSeconds = (timeStr) => {
        if (!timeStr || !timeStr.includes(':')) return 0;
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 3) { // HH:MM:SS
            return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        } else if (parts.length === 2) { // MM:SS
            return (parts[0] * 60) + parts[1];
        }
        return 0;
    };

    // Utility: Seconds to time string
    const secondsToTime = (totalSeconds, forceHHMMSS = false) => {
        if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);

        if (h > 0 || forceHHMMSS) {
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // CORE ARITHMETIC
    const calculate = () => {
        const distNum = parseFloat(distance);
        const timeSec = timeToSeconds(time);
        const paceSec = timeToSeconds(pace);

        if (calcMode === 'pace') {
            if (distNum > 0 && timeSec > 0) {
                if (activeTab === 'running') {
                    const pSec = timeSec / distNum;
                    setResult(secondsToTime(pSec));
                } else { // Ergs
                    const pSec = (timeSec / distNum) * 500;
                    setResult(secondsToTime(pSec));
                }
            }
        } else if (calcMode === 'time') {
            if (distNum > 0 && paceSec > 0) {
                if (activeTab === 'running') {
                    const tSec = distNum * paceSec;
                    setResult(secondsToTime(tSec, distNum * paceSec >= 3600));
                } else { // Ergs
                    const tSec = (distNum / 500) * paceSec;
                    setResult(secondsToTime(tSec, tSec >= 3600));
                }
            }
        } else if (calcMode === 'distance') {
            if (timeSec > 0 && paceSec > 0) {
                if (activeTab === 'running') {
                    const d = timeSec / paceSec;
                    setResult(d.toFixed(2) + ' km');
                } else { // Ergs
                    const d = (timeSec / paceSec) * 500;
                    setResult(Math.round(d) + ' m');
                }
            }
        }
    };

    // Quick Converter logic (Running only)
    const runKmhToPace = (kmh) => {
        const k = parseFloat(kmh);
        if (k > 0) {
            const paceSec = 3600 / k;
            setQuickPace(secondsToTime(paceSec));
        }
    };

    const referenceTable = [
        { pace: '3:30', kmh: '17.1', row500: '1:45', ski500: '1:50' },
        { pace: '4:00', kmh: '15.0', row500: '1:55', ski500: '2:00' },
        { pace: '4:30', kmh: '13.3', row500: '2:05', ski500: '2:10' },
        { pace: '5:00', kmh: '12.0', row500: '2:15', ski500: '2:20' },
        { pace: '5:30', kmh: '10.9', row500: '2:25', ski500: '2:30' },
        { pace: '6:00', kmh: '10.0', row500: '2:35', ski500: '2:40' },
    ];

    return (
        <DashboardLayout>
            <div className="py-8">
                <header className="mb-12">
                    <div className="flex items-center gap-2 mb-4 bg-orange-500/10 border border-orange-500/20 w-fit px-4 py-1.5 rounded-full">
                        <Gauge size={14} className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 italic">Conversor Universal</span>
                    </div>
                    <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-tight">
                        PACE <span className="text-orange-500">CALCULATOR</span>
                    </h1>
                </header>

                {/* MODALITY TABS */}
                <div className="flex flex-wrap gap-2 mb-6 bg-[#111] p-2 rounded-[24px] border border-white/5 w-fit">
                    {[
                        { id: 'running', label: 'RUNNING', icon: Activity },
                        { id: 'row', label: 'ROW ERG', icon: Timer },
                        { id: 'ski', label: 'SKI ERG', icon: Timer },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id !== 'running') setDistance('500');
                                else setDistance('1');
                            }}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase italic tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/20'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* CALCULATION MODE SUB-TABS */}
                <div className="flex flex-wrap gap-2 mb-8 bg-black/40 p-1.5 rounded-[20px] border border-white/5 w-fit">
                    {[
                        { id: 'pace', label: 'Calcular Pace', icon: Gauge },
                        { id: 'time', label: 'Calcular Tempo', icon: Clock },
                        { id: 'distance', label: 'Calcular Distância', icon: Navigation },
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => {
                                setCalcMode(mode.id);
                                setResult('');
                            }}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${calcMode === mode.id
                                ? 'bg-white text-black'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            <mode.icon size={14} />
                            {mode.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* CALCULATOR BOX */}
                    <Card className="bg-[#111] border-white/5 p-8 rounded-[40px] border-2">
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* DISTANCE INPUT - Hidden if calculating distance */}
                                {calcMode !== 'distance' && (
                                    <div className="animate-fade-in">
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-2">
                                            Distância ({activeTab === 'running' ? 'km' : 'm'})
                                        </label>
                                        <input
                                            type="number"
                                            value={distance}
                                            onChange={(e) => setDistance(e.target.value)}
                                            className="w-full bg-black border-2 border-white/5 rounded-3xl p-6 text-3xl font-black text-white focus:border-orange-500 outline-none transition-all"
                                        />
                                    </div>
                                )}

                                {/* TIME INPUT - Hidden if calculating time */}
                                {calcMode !== 'time' && (
                                    <div className="animate-fade-in">
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-2">Tempo (MM:SS)</label>
                                        <input
                                            type="text"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            placeholder="00:00"
                                            className="w-full bg-black border-2 border-white/5 rounded-3xl p-6 text-3xl font-black text-white focus:border-orange-500 outline-none transition-all placeholder:text-white/10"
                                        />
                                    </div>
                                )}

                                {/* PACE INPUT - Hidden if calculating pace */}
                                {calcMode !== 'pace' && (
                                    <div className="animate-fade-in">
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-2">
                                            Pace {activeTab === 'running' ? '/km' : '/500m'}
                                        </label>
                                        <input
                                            type="text"
                                            value={pace}
                                            onChange={(e) => setPace(e.target.value)}
                                            placeholder="00:00"
                                            className="w-full bg-black border-2 border-white/5 rounded-3xl p-6 text-3xl font-black text-white focus:border-orange-500 outline-none transition-all placeholder:text-white/10"
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={calculate}
                                className="w-full py-6 bg-white text-black rounded-3xl font-black text-sm uppercase tracking-widest italic hover:bg-orange-500 hover:text-white transition-all shadow-xl"
                            >
                                Calcular {calcMode.charAt(0).toUpperCase() + calcMode.slice(1)}
                            </button>

                            {result && (
                                <div className="p-10 bg-orange-500/5 rounded-[30px] border-2 border-orange-500/20 text-center animate-scale-in relative">
                                    <span className="block text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4 italic">Resultado Estimado</span>
                                    <h2 className="text-6xl font-black text-white italic">
                                        {result}
                                        {calcMode === 'pace' && <span className="text-xl ml-2 text-gray-500">/{activeTab === 'running' ? 'km' : '500m'}</span>}
                                    </h2>
                                </div>
                            )}

                            {activeTab === 'running' && (
                                <div className="mt-12">
                                    <div className="h-px bg-white/5 mb-8" />
                                    <div className="p-2">
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 px-2">Conversor Rápido KM/H para Pace</label>
                                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                                            <div className="relative flex-1 w-full">
                                                <input
                                                    type="number"
                                                    value={runKmh}
                                                    onChange={(e) => {
                                                        setRunKmh(e.target.value);
                                                        runKmhToPace(e.target.value);
                                                    }}
                                                    className="w-full bg-black border-2 border-white/5 rounded-3xl p-6 text-3xl font-black text-white focus:border-orange-500 outline-none transition-all"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 font-black italic">KM/H</span>
                                            </div>
                                            <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-orange-500 hidden sm:block">
                                                <ArrowRight size={24} />
                                            </div>
                                            <div
                                                className="w-full sm:flex-1 py-6 bg-orange-500/10 border-2 border-orange-500/30 text-orange-500 rounded-3xl font-black text-3xl text-center italic"
                                            >
                                                {quickPace}<span className="text-xs ml-1">/km</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* QUICK REFERENCE TABLE */}
                    <Card className="bg-[#111] border-white/5 p-8 rounded-[40px] border-2 flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <Table size={20} className="text-orange-500" />
                            <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Quick <span className="text-orange-500">Reference</span></h3>
                        </div>
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Pace/km</th>
                                        <th className="py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest italic">KM/H</th>
                                        <th className="py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Row 500m</th>
                                        <th className="py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Ski 500m</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {referenceTable.map((row, idx) => (
                                        <tr key={idx} className="group hover:bg-white/[0.02]">
                                            <td className="py-4 text-sm font-black text-white italic uppercase">{row.pace}</td>
                                            <td className="py-4 text-sm font-bold text-gray-400">{row.kmh}</td>
                                            <td className="py-4 text-sm font-medium text-blue-400/70">{row.row500}</td>
                                            <td className="py-4 text-sm font-medium text-green-400/70">{row.ski500}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-8 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                            <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed text-center tracking-tighter">
                                <Info size={10} className="inline mr-2" />
                                Valores Aproximados baseados em standards de competição.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PaceCalculator;
