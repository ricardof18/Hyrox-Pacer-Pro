import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { ShieldCheck, Crown, Star, CheckCircle2, ChevronDown, ChevronUp, CreditCard, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const PricingCard = ({ title, price, features, tier, onSubscribe, currentRole, isPopular }) => {
    const isCurrent = currentRole === tier;

    return (
        <div className={`relative group transition-all duration-500 h-full ${isPopular ? 'scale-105 z-10' : ''}`}>
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-hyrox-orange text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest z-20 shadow-xl">
                    Mais Popular
                </div>
            )}

            <div className={`h-full bg-[#151515] border-2 rounded-[35px] p-8 flex flex-col transition-all duration-500 overflow-hidden relative ${isPopular ? 'border-hyrox-orange shadow-[0_0_40px_rgba(255,107,0,0.1)]' : 'border-white/5 hover:border-white/20'
                }`}>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    {tier === 'coach' ? <Crown size={120} /> : tier === 'pro' ? <Zap size={120} /> : <Star size={120} />}
                </div>

                <div className="mb-8">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-black/40 border border-white/5`}>
                        {tier === 'coach' ? <Crown className="text-yellow-400" /> : tier === 'pro' ? <Zap className="text-hyrox-orange" /> : <Star className="text-gray-400" />}
                    </div>
                    <h3 className="text-2xl font-black italic text-white uppercase mb-2 italic">{title}</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white italic">{price}</span>
                        <span className="text-gray-500 font-bold uppercase text-[10px]">/mês</span>
                    </div>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 size={16} className={isPopular ? "text-hyrox-orange mt-0.5" : "text-gray-600 mt-0.5"} />
                            <span className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors uppercase text-[11px] tracking-wide">{feature}</span>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => onSubscribe(tier)}
                    disabled={isCurrent}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isCurrent
                            ? 'bg-[#1a1a1a] text-gray-600 border border-white/5 cursor-default'
                            : isPopular
                                ? 'bg-hyrox-orange text-white hover:bg-orange-600 shadow-lg shadow-orange-900/20'
                                : 'bg-white text-black hover:bg-gray-200'
                        }`}
                >
                    {isCurrent ? 'Plano Atual' : 'Subscrever Agora'}
                </button>
            </div>
        </div>
    );
};

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/5">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors tracking-wide uppercase">{question}</span>
                {isOpen ? <ChevronUp className="text-hyrox-orange" /> : <ChevronDown className="text-gray-600" />}
            </button>
            {isOpen && (
                <div className="pb-6 animate-fade-in">
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                        {answer}
                    </p>
                </div>
            )}
        </div>
    );
};

const Pricing = () => {
    const { user, refreshUser } = useAuth();
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedTier, setSelectedTier] = useState(null);

    const handleSubscribe = async (tier) => {
        if (tier === 'free') return;
        try {
            await api.post('/users/upgrade', { new_role: tier });
            setSelectedTier(tier);
            setShowSuccess(true);
            refreshUser();
        } catch (error) {
            console.error("Upgrade failed:", error);
            alert("Erro ao processar subscrição.");
        }
    };

    const tiers = [
        {
            tier: 'user',
            title: "Plano Grátis",
            price: "€0",
            features: [
                "Calculadora de splits básica",
                "Exportação PDF Padrão",
                "Acesso a categorias Open",
                "Pace médio global"
            ]
        },
        {
            tier: 'pro',
            title: "Plano Pro",
            price: "€12",
            isPopular: true,
            features: [
                "Histórico MySQL Ilimitado",
                "Suporte total a Duplas (Athlete B)",
                "Fatigue Cost Real-time",
                "Edição de splits bloqueados",
                "Exportação PDF Premium Dark"
            ]
        },
        {
            tier: 'coach',
            title: "Plano Coach",
            price: "€29",
            features: [
                "Tudo do plano Pro",
                "Gestão de múltiplos atletas",
                "Exportação em lote (Batch)",
                "Análise de progresso anual",
                "Suporte VIP 24h & Consultoria"
            ]
        }
    ];

    const faqs = [
        {
            question: "Porquê o plano Elite (Coach)?",
            answer: "O plano Coach foi desenhado para treinadores que gerem vários atletas. Permite comparar o progresso entre épocas e exportar múltiplos planos de prova num só clique."
        },
        {
            question: "Como funciona a lógica de duplas?",
            answer: "A partir do plano Pro, o motor de cálculo aplica bónus de velocidade (15%) e tempos de transição específicos para duplas, além de permitir o controlo total do volume por atleta (Atleta A vs Atleta B)."
        },
        {
            question: "Posso cancelar a qualquer momento?",
            answer: "Sim, todas as nossas subscrições são mensais e sem fidelização. Podes gerir o teu plano diretamente no teu perfil de atleta."
        }
    ];

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto py-12 px-4">
                {/* Header */}
                <div className="text-center mb-20 animate-fade-in">
                    <div className="inline-flex items-center gap-2 bg-hyrox-orange/10 border border-hyrox-orange/20 px-4 py-2 rounded-full mb-6">
                        <Sparkles size={16} className="text-hyrox-orange" />
                        <span className="text-hyrox-orange text-[10px] font-black uppercase tracking-widest italic">Upgrade do Pacer</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic text-white mb-4 uppercase tracking-tighter leading-tight">
                        ESCOLHE O TEU <span className="text-hyrox-orange">PASSE</span>
                    </h1>
                    <p className="text-gray-500 text-lg font-bold uppercase text-xs tracking-widest">
                        Otimiza o teu desempenho com ferramentas de elite.
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {tiers.map((t, idx) => (
                        <PricingCard
                            key={idx}
                            {...t}
                            onSubscribe={handleSubscribe}
                            currentRole={user?.role}
                        />
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto mb-20">
                    <div className="flex items-center gap-3 mb-10 border-l-4 border-hyrox-orange pl-6">
                        <h2 className="text-3xl font-black italic text-white uppercase italic">Perguntas Frequentes</h2>
                    </div>
                    <div className="space-y-2">
                        {faqs.map((faq, idx) => (
                            <FAQItem key={idx} {...faq} />
                        ))}
                    </div>
                </div>

                {/* Support Badge */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-6 bg-[#111] border border-white/5 p-8 rounded-[40px] ring-1 ring-white/5">
                        <div className="w-12 h-12 rounded-full bg-hyrox-orange/10 flex items-center justify-center border border-hyrox-orange/20">
                            <CreditCard size={20} className="text-hyrox-orange" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-white font-black text-sm uppercase italic">Pagamento Seguro</h4>
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Processado via Stripe • Encriptação de 256-bit</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1a1a1a] border-2 border-hyrox-orange rounded-[40px] p-12 max-w-lg w-full text-center shadow-[0_0_50px_rgba(255,107,0,0.2)] animate-scale-in">
                        <div className="w-20 h-20 bg-hyrox-orange rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-orange-900/40">
                            <ShieldCheck size={40} className="text-black" />
                        </div>
                        <h2 className="text-4xl font-black italic text-white uppercase mb-4 italic">BEM-VINDO AO PLANO {selectedTier?.toUpperCase()}!</h2>
                        <p className="text-gray-400 font-medium mb-8">
                            A tua conta foi atualizada com sucesso. Agora tens acesso total a todas as ferramentas premium.
                        </p>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Começar a Treinar
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Pricing;
