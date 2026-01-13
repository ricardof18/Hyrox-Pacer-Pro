import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import { Calculator, Thermometer, History, ShieldCheck, ArrowRight, Trophy, Crown } from 'lucide-react';

const Dashboard = () => {
    const apps = [
        {
            title: "Simulador Hyrox",
            description: "Planeia o teu próximo recorde pessoal com precisão cirúrgica.",
            icon: <Calculator size={32} className="text-hyrox-orange" />,
            href: "/pacer",
            color: "border-hyrox-orange/20 hover:border-hyrox-orange/50",
            bg: "bg-hyrox-orange/5"
        },
        {
            title: "Recovery Lab",
            description: "Protocolos de gelo e calor baseados no teu volume de treino.",
            icon: <Thermometer size={32} className="text-blue-400" />,
            href: "/recovery",
            color: "border-blue-500/20 hover:border-blue-500/50",
            bg: "bg-blue-500/5"
        },
        {
            title: "Histórico",
            description: "Vê a tua evolução, tempos passados e planos de prova anteriores.",
            icon: <History size={32} className="text-green-400" />,
            href: "/history",
            color: "border-green-500/20 hover:border-green-500/50",
            bg: "bg-green-500/5"
        },
        {
            title: "Planos & Upgrade",
            description: "Gere a tua assinatura e desbloqueia funcionalidades Pro.",
            icon: <Crown size={32} className="text-yellow-400" />,
            href: "/pricing",
            color: "border-yellow-500/20 hover:border-yellow-500/50",
            bg: "bg-yellow-500/5"
        }
    ];

    return (
        <DashboardLayout>
            <div className="py-12">
                <header className="mb-16">
                    <div className="flex items-center gap-2 mb-4 bg-white/5 border border-white/10 w-fit px-4 py-1.5 rounded-full">
                        <Trophy size={14} className="text-hyrox-orange" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Central de Performance</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-tight">
                        OLÁ, <span className="text-hyrox-orange">ATLETA</span>
                    </h1>
                    <p className="text-gray-500 text-lg font-bold uppercase text-xs tracking-widest mt-2">
                        Escolhe a tua ferramenta para dominar a arena Hyrox.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {apps.map((app, idx) => (
                        <Link key={idx} to={app.href} className="group">
                            <Card className={`h-full transition-all duration-500 border-2 ${app.color} ${app.bg} relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                    {app.icon}
                                </div>

                                <div className="mb-8 p-4 bg-black/40 w-fit rounded-2xl border border-white/5">
                                    {app.icon}
                                </div>

                                <h3 className="text-2xl font-black italic text-white uppercase mb-2 group-hover:text-hyrox-orange transition-colors">
                                    {app.title}
                                </h3>
                                <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                                    {app.description}
                                </p>

                                <div className="flex items-center gap-2 text-white font-black text-xs uppercase italic tracking-tighter mt-auto">
                                    Aceder Agora <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mt-24 text-center">
                    <div className="inline-flex flex-col md:flex-row items-center gap-4 bg-[#111] border border-white/5 p-6 rounded-[30px] ring-1 ring-white/5">
                        <div className="flex items-center gap-3 px-4 py-2 bg-hyrox-orange/10 rounded-full border border-hyrox-orange/20">
                            <ShieldCheck size={18} className="text-hyrox-orange" />
                            <span className="text-hyrox-orange text-xs font-black uppercase italic tracking-widest">Oficial Pacer Strategy</span>
                        </div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                            A utilizar a versão mais recente do <span className="text-white">Hyrox Pacer Pro 2.0</span>
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
