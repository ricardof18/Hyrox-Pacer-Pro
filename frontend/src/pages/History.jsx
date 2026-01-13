import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api';
import Card from '../components/Card';
import { Trash2, ExternalLink } from 'lucide-react';

const History = () => {
    const [simulations, setSimulations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchSimulations = async () => {
        try {
            const response = await api.get('/simulations/me');
            setSimulations(response.data);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSimulations();
    }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this plan?")) return;
        try {
            await api.delete(`/simulations/${id}`);
            setSimulations(simulations.filter(s => s.id !== id));
        } catch (err) {
            alert("Failed to delete.");
        }
    };

    const handleLoad = (sim) => {
        localStorage.setItem('loaded_simulation', JSON.stringify(sim));
        navigate('/dashboard');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Race History</h2>
                <p className="text-gray-400">View and manage your past planned races.</p>
            </div>

            {loading ? (
                <div className="text-white">Loading history...</div>
            ) : simulations.length === 0 ? (
                <div className="p-8 bg-[#1E1E1E] rounded-xl border border-[#333] text-center text-gray-400">
                    <p>No past races found. Create a plan in the Dashboard and save it!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {simulations.map((sim) => (
                        <Card key={sim.id} className="hover:border-hyrox-orange/50 transition flex flex-col md:flex-row justify-between md:items-center gap-4 group">
                            <div className="flex-1">
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">
                                    {formatDate(sim.created_at)}
                                </div >
                                <div className="text-xl font-bold text-white flex items-center gap-2">
                                    Target: <span className="text-hyrox-orange">{sim.tempo_alvo}</span>
                                </div>
                                {sim.categoria_hyrox && (
                                    <div className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-tight">{sim.categoria_hyrox}</div>
                                )}
                            </div>

                            <div className="flex items-center gap-6">
                                {sim.json_resultados && sim.json_resultados.calculated_total && (
                                    <div className="text-right">
                                        <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-tighter">Projected</span>
                                        <span className="font-mono text-2xl font-bold text-white leading-none">{sim.json_resultados.calculated_total}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 border-l border-gray-800 pl-4">
                                    <button
                                        onClick={() => handleLoad(sim)}
                                        className="p-2 bg-hyrox-orange/10 hover:bg-hyrox-orange text-hyrox-orange hover:text-white rounded-lg transition-all flex items-center gap-2 text-xs font-bold uppercase"
                                        title="Load into Dashboard"
                                    >
                                        <ExternalLink size={16} />
                                        <span className="hidden sm:inline">Load</span>
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, sim.id)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default History;
