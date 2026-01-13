import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    Thermometer, Snowflake, ShieldCheck, Clock, Zap, CheckCircle2,
    Waves, Activity, Brain, Dumbbell, Timer, Play, Pause, RotateCcw
} from 'lucide-react';
import Card from '../components/Card';
import api from '../api';

const Recovery = () => {
    // Form Inputs
    const [workoutType, setWorkoutType] = useState('Endurance'); // Strength, Endurance, Hyrox, Active
    const [rpe, setRpe] = useState(7);
    const [fatigueFocus, setFatigueFocus] = useState('Geral'); // Pernas, Core, Upper Body, Geral

    // UI State
    const [protocol, setProtocol] = useState(null);
    const [timerActive, setTimerActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [saving, setSaving] = useState(false);
    const [sessionStatus, setSessionStatus] = useState(null);

    // Physiological Algorithm
    const generateRecoveryProtocol = useCallback(() => {
        if (rpe > 9) {
            return {
                type: "SNC Recovery",
                icon: <Brain className="text-purple-400" />,
                cards: [
                    {
                        title: "Sauna Infravermelha",
                        value: "15 min @ 55°C",
                        description: "Calor suave para restaurar o sistema nervoso sem stress térmico adicional.",
                        icon: <Thermometer size={18} />
                    },
                    {
                        title: "Benefício Fisiológico",
                        value: "Vagal Tone Increase",
                        description: "Ativação do sistema parassimpático e redução imediata de Cortisol.",
                        icon: <Activity size={18} />
                    },
                    {
                        title: "Biohacking Tip",
                        value: "Box Breathing",
                        description: "O teu SNC está exausto. Foca na respiração (4s in, 4s hold, 4s out, 4s hold).",
                        icon: <Zap size={18} />
                    }
                ],
                duration: 15 * 60,
                protocolName: "Infrared + Box Breathing"
            };
        }

        if (workoutType === 'Strength') {
            return {
                type: "Hypertrophy Guard",
                icon: <Dumbbell className="text-orange-400" />,
                cards: [
                    {
                        title: "Sauna Tradicional",
                        value: "20 min @ 80°C",
                        description: "Aumento de Heat Shock Proteins para reparação tecidular.",
                        icon: <Thermometer size={18} />
                    },
                    {
                        title: "Benefício Fisiológico",
                        value: "Hormona do Crescimento",
                        description: "Otimização da síntese proteica e relaxamento das fibras musculares.",
                        icon: <Activity size={18} />
                    },
                    {
                        title: "Biohacking Tip",
                        value: "Evitar Gelo",
                        description: "Não uses gelo hoje para não anular a sinalização anabólica (mTOR).",
                        icon: <ShieldCheck size={18} />
                    }
                ],
                duration: 20 * 60,
                protocolName: "Sauna + Hypertrophy Focus"
            };
        }

        if (workoutType === 'Endurance' || workoutType === 'Hyrox') {
            return {
                type: "Inflammation Control",
                icon: <Snowflake className="text-blue-400" />,
                cards: [
                    {
                        title: "Banheira de Gelo",
                        value: "4 min @ 4°C-6°C",
                        description: "Vasoconstrição potente para controlo de dano muscular.",
                        icon: <Snowflake size={18} />
                    },
                    {
                        title: "Benefício Fisiológico",
                        value: "Gestão C-Reativa",
                        description: "Redução de Proteína C-Reativa e remoção de resíduos metabólicos.",
                        icon: <Activity size={18} />
                    },
                    {
                        title: "Biohacking Tip",
                        value: "Contraste Térmico",
                        description: "Termina com 10min de Sauna para um 'flush' linfático completo.",
                        icon: <Zap size={18} />
                    }
                ],
                duration: 4 * 60,
                protocolName: "Ice Bath + Lymphatic Flush"
            };
        }

        return {
            type: "Metabolic Reset",
            icon: <Waves className="text-green-400" />,
            cards: [
                {
                    title: "Pressoterapia",
                    value: "20 min",
                    description: "Modo linfático para acelerar o retorno venoso.",
                    icon: <Activity size={18} />
                },
                {
                    title: "Benefício Fisiológico",
                    value: "Recuperação Lática",
                    description: "Drenagem de subprodutos metabólicos sem stress oxidativo.",
                    icon: <Activity size={18} />
                },
                {
                    title: "Biohacking Tip",
                    value: "Hidratação",
                    description: "Adiciona eletrólitos (Magnésio/Sódio) para repor o balanço hídrico.",
                    icon: <ShieldCheck size={18} />
                }
            ],
            duration: 20 * 60,
            protocolName: "Pneumatic Compression Mode"
        };
    }, [workoutType, rpe]);

    // Update protocol when inputs change
    useEffect(() => {
        const newProtocol = generateRecoveryProtocol();
        setProtocol(newProtocol);
        setTimeLeft(newProtocol.duration);
        setTimerActive(false);
    }, [generateRecoveryProtocol]);

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setTimerActive(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleStartSession = () => setTimerActive(true);
    const handlePauseSession = () => setTimerActive(false);
    const handleResetSession = () => setTimeLeft(protocol.duration);

    const handleFinalizeSession = async () => {
        setSaving(true);
        try {
            await api.post('/recovery/logs', {
                intensity: parseInt(rpe),
                protocol_name: protocol.protocolName,
                duration_minutes: Math.ceil(protocol.duration / 60)
            });
            setSessionStatus('success');
            setTimeout(() => setSessionStatus(null), 3000);
        } catch (error) {
            console.error("Error saving recovery log:", error);
            alert("Erro ao guardar a sessão.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto py-8 px-4">
                {/* Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4 bg-blue-500/10 border border-blue-500/20 w-fit px-4 py-1.5 rounded-full">
                            <Waves size={14} className="text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 italic">Physiology Lab AI</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-tight">
                            RECOVERY <span className="text-blue-500">ENGINE</span>
                        </h1>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-2">
                            Algoritmo de Biohacking Baseado em Stress Físico.
                        </p>
                    </div>

                    <div className="bg-[#111] border border-white/5 p-6 rounded-[30px] flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Status do Timer</p>
                            <div className="text-4xl font-mono font-black text-white">{formatTime(timeLeft)}</div>
                        </div>
                        <div className="flex gap-2">
                            {!timerActive ? (
                                <button onClick={handleStartSession} className="p-3 bg-white text-black rounded-full hover:scale-105 transition-all"><Play size={20} fill="currentColor" /></button>
                            ) : (
                                <button onClick={handlePauseSession} className="p-3 bg-white text-black rounded-full hover:scale-105 transition-all"><Pause size={20} fill="currentColor" /></button>
                            )}
                            <button onClick={handleResetSession} className="p-3 bg-white/5 text-white rounded-full border border-white/10 hover:bg-white/10 transition-all"><RotateCcw size={20} /></button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Input Form */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-white/5 bg-[#151515] p-8">
                            <h3 className="text-lg font-black italic text-white uppercase mb-8 flex items-center gap-2">
                                <Activity size={18} className="text-blue-500" /> Stress do Treino
                            </h3>

                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Tipo de Treino</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Strength', 'Endurance', 'Hyrox', 'Active'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setWorkoutType(type)}
                                                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${workoutType === type
                                                        ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                                                        : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20'
                                                    }`}
                                            >
                                                {type === 'Strength' ? 'Força / Pesos' : type === 'Endurance' ? 'Endurance / Run' : type === 'Hyrox' ? 'Hyrox Sim' : 'Recuperação'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Esforço Real (RPE)</label>
                                        <span className="text-xl font-mono font-black text-blue-400">{rpe}/10</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="10" value={rpe} onChange={(e) => setRpe(e.target.value)}
                                        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Foco de Fadiga</label>
                                    <select
                                        value={fatigueFocus}
                                        onChange={(e) => setFatigueFocus(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs font-black uppercase text-gray-300 focus:border-blue-500 outline-none"
                                    >
                                        {['Geral', 'Pernas', 'Core', 'Upper Body'].map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right: Prescription Result */}
                    <div className="lg:col-span-8 space-y-6">
                        {protocol && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 px-2">
                                    <div className="p-3 bg-blue-500/20 rounded-2xl">
                                        {protocol.icon}
                                    </div>
                                    <h2 className="text-2xl font-black italic text-white uppercase italic">{protocol.type}</h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {protocol.cards.map((card, i) => (
                                        <Card key={i} className={`border-white/5 bg-[#151515] hover:border-blue-500/30 transition-all duration-500 group`}>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-black/40 border border-white/5 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                                                    {card.icon}
                                                </div>
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{card.title}</span>
                                            </div>
                                            <div className="text-xl font-black text-white italic mb-3 uppercase tracking-tighter">
                                                {card.value}
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed uppercase">
                                                {card.description}
                                            </p>
                                        </Card>
                                    ))}
                                </div>

                                <Card className="bg-gradient-to-br from-[#111] to-[#151515] border border-blue-500/20 p-8">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="flex items-center gap-6 text-left">
                                            <div className="p-4 bg-blue-500/20 rounded-full animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                                <Timer size={32} className="text-blue-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-black text-lg uppercase italic">Pronto para Recomeçar?</h4>
                                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Registo automático no teu perfil de performance.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleFinalizeSession}
                                            disabled={saving}
                                            className={`px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 ${sessionStatus === 'success'
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                                                }`}
                                        >
                                            {saving ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                                            ) : sessionStatus === 'success' ? (
                                                <><CheckCircle2 size={16} /> Sessão Guardada!</>
                                            ) : (
                                                <><Zap size={16} fill="currentColor" /> Finalizar Sessão</>
                                            )}
                                        </button>
                                    </div>
                                </Card>

                                <div className="flex items-center gap-3 bg-[#111] border border-white/5 p-6 rounded-[30px]">
                                    <Brain size={20} className="text-purple-400" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
                                        <span className="text-white">Dica Neurobiológica:</span> O algoritmo baseia-se na janela de <span className="text-blue-400">4 horas pós-treino</span>. Não quebres os processos adaptativos naturais do corpo.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Recovery;
