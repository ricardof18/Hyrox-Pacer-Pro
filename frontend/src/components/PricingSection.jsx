import React from 'react';
import Card from './Card';
import { Check, Zap, Sparkles, Trophy, ShieldCheck } from 'lucide-react';

const PricingSection = ({ showHeader = true }) => {
    const plans = [
        {
            name: "Grátis",
            price: "0",
            description: "Para atletas ocasionais.",
            features: [
                "Calculadora de splits",
                "Exportação PDF Básico",
                "Acesso a categorias Open",
                "Pace médio global"
            ],
            cta: "Plano Atual",
            highlight: false,
            icon: <Zap size={24} className="text-gray-400" />
        },
        {
            name: "Pro",
            price: "9.99",
            period: "/mês",
            description: "Para competidores sérios.",
            features: [
                "Histórico MySQL",
                "Suporte total a Duplas",
                "Fatigue Cost Real-time",
                "Edição de splits bloqueados",
                "Exportação PDF Premium"
            ],
            cta: "Upgrade para Pro",
            highlight: true,
            icon: <Sparkles size={24} className="text-hyrox-orange" />
        },
        {
            name: "Coach",
            price: "24.99",
            period: "/mês",
            description: "Para treinadores e equipas.",
            features: [
                "Tudo do plano Pro",
                "Gestão de múltiplos atletas",
                "Exportação em lote (Batch)",
                "Análise de progresso anual",
                "Suporte VIP 24h"
            ],
            cta: "Go Coach",
            highlight: false,
            icon: <Trophy size={24} className="text-yellow-500" />
        }
    ];

    const handleUpgrade = (planName) => {
        if (planName === "Grátis") return;
        alert(`Redirecionando para pagamento do plano ${planName}... 💳`);
    };

    return (
        <section className="py-12 px-4">
            {showHeader && (
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-hyrox-orange/10 border border-hyrox-orange/20 px-4 py-2 rounded-full mb-6 animate-bounce">
                        <ShieldCheck size={16} className="text-hyrox-orange" />
                        <span className="text-hyrox-orange text-[10px] font-black uppercase tracking-widest italic">Oficial Pacer Strategy</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black italic text-white mb-4 uppercase tracking-tighter">
                        PLANOS & <span className="text-hyrox-orange">PREÇOS</span>
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto font-bold uppercase text-xs tracking-widest">
                        Maximiza a tua performance com ferramentas profissionais.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan, idx) => (
                    <div key={idx} className={`relative flex flex-col ${plan.highlight ? 'md:scale-105 z-10' : ''}`}>
                        {plan.highlight && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-hyrox-orange text-black text-[10px] font-black uppercase px-6 py-1.5 rounded-full shadow-[0_0_20px_rgba(255,107,0,0.4)] italic border border-orange-400/50">
                                Mais Popular
                            </div>
                        )}

                        <Card className={`flex-1 flex flex-col border-2 transition-all duration-500 ${plan.highlight ? 'border-hyrox-orange shadow-[0_0_40px_rgba(255,107,0,0.15)] bg-[#111]' : 'border-white/5 bg-[#1a1a1a] hover:border-gray-700'}`}>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">{plan.name}</h3>
                                    <p className="text-[10px] text-gray-500 font-black uppercase mt-1 tracking-widest">{plan.description}</p>
                                </div>
                                <div className={`p-3 rounded-2xl ${plan.highlight ? 'bg-hyrox-orange/10' : 'bg-white/5'}`}>
                                    {plan.icon}
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white tracking-tighter">€{plan.price}</span>
                                    {plan.period && <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">{plan.period}</span>}
                                </div>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-3">
                                        <div className={`p-1 rounded-full ${plan.highlight ? 'bg-hyrox-orange shadow-[0_0_10px_rgba(255,107,0,0.5)] text-black' : 'bg-white/5 text-gray-500'}`}>
                                            <Check size={10} strokeWidth={4} />
                                        </div>
                                        <span className="text-sm text-gray-400 font-bold uppercase text-[11px] tracking-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleUpgrade(plan.name)}
                                className={`w-full py-4 rounded-xl font-black italic uppercase tracking-widest transition-all duration-300 ${plan.highlight
                                        ? 'bg-hyrox-orange text-black hover:bg-orange-600 hover:shadow-[0_0_30px_rgba(255,107,0,0.4)]'
                                        : plan.name === "Grátis"
                                            ? 'bg-white/5 text-gray-600 cursor-default border border-white/5'
                                            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                                    }`}
                            >
                                {plan.cta}
                            </button>
                        </Card>
                    </div>
                ))}
            </div>

            {!showHeader && (
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-full">
                        <ShieldCheck size={14} className="text-hyrox-orange" />
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">A Segurar a tua melhor performance com Certificação <span className="text-hyrox-orange">Oficial Pacer Strategy</span></span>
                    </div>
                </div>
            )}
        </section>
    );
};

export default PricingSection;
