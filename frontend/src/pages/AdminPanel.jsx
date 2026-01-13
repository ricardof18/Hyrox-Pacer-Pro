import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    Users, Search, Filter, Edit3, Trash2, Key,
    CheckCircle2, AlertCircle, X, Shield, ShieldCheck, User as UserIcon, Crown,
    MoreVertical, Info, Power, PowerOff
} from 'lucide-react';
import api from '../api';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Modals
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [showResetModal, setShowResetModal] = useState(null);
    const [resetResponse, setResetResponse] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (roleFilter) params.role = roleFilter;
            if (searchQuery) params.q = searchQuery;

            const response = await api.get('/admin/users', { params });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [searchQuery, roleFilter]);

    const handleUpdateUser = async (userId, data) => {
        try {
            await api.patch(`/admin/users/${userId}`, data);
            fetchUsers();
        } catch (error) {
            alert("Erro ao atualizar utilizador.");
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await api.delete(`/users/${userId}`);
            setShowDeleteModal(null);
            fetchUsers();
        } catch (error) {
            alert("Erro ao eliminar utilizador.");
        }
    };

    const handleResetPassword = async (userId) => {
        try {
            const response = await api.post(`/admin/users/${userId}/reset-password`);
            setResetResponse(response.data);
        } catch (error) {
            alert("Erro ao resetar password.");
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic">Admin</span>;
            case 'coach':
                return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic">Coach</span>;
            case 'pro':
                return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic">Pro</span>;
            default:
                return <span className="bg-gray-500/10 text-gray-400 border border-gray-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic">User</span>;
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto py-8 px-4">
                {/* Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4 bg-orange-500/10 border border-orange-500/20 w-fit px-4 py-1.5 rounded-full">
                            <Shield size={14} className="text-orange-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 italic">Central de Administração</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-tight">
                            ADMIN <span className="text-orange-500">PANEL</span>
                        </h1>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Procurar por nome ou email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white w-full md:w-[300px] focus:border-orange-500/50 outline-none transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white appearance-none w-full md:w-[180px] focus:border-orange-500/50 outline-none transition-all uppercase font-black"
                            >
                                <option value="">Todos os Cargos</option>
                                <option value="admin">Admin</option>
                                <option value="coach">Coach</option>
                                <option value="pro">Pro</option>
                                <option value="user">User</option>
                            </select>
                        </div>
                    </div>
                </header>

                <div className="bg-[#111] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-[#1a1a1a]/50">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Utilizador</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Email</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Cargo</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Registado em</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest italic text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500 mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center text-gray-500 font-bold uppercase tracking-widest">Nenhum utilizador encontrado.</td>
                                    </tr>
                                ) : users.map((u) => (
                                    <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400 font-black italic">
                                                    {u.full_name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-black text-white italic uppercase block">{u.full_name || 'N/A'}</span>
                                                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">ID: #{u.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-gray-400 font-medium">{u.email}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                {getRoleBadge(u.role)}
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 rounded-lg text-[10px] font-black uppercase px-2 py-1 outline-none focus:border-orange-500"
                                                >
                                                    <option value="user">USER</option>
                                                    <option value="pro">PRO</option>
                                                    <option value="coach">COACH</option>
                                                    <option value="admin">ADMIN</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {u.is_active ? (
                                                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                                                    <CheckCircle2 size={10} /> Ativo
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                                                    <X size={10} /> Desativado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleUpdateUser(u.id, { is_active: !u.is_active })}
                                                    className={`p-3 border rounded-xl transition-all hover:scale-110 ${u.is_active
                                                            ? 'bg-red-500/5 border-red-500/10 text-red-500/50 hover:text-red-500 hover:bg-red-500/10'
                                                            : 'bg-green-500/5 border-green-500/10 text-green-500/50 hover:text-green-500 hover:bg-green-500/10'
                                                        }`}
                                                    title={u.is_active ? "Desativar Conta" : "Ativar Conta"}
                                                >
                                                    {u.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => setShowResetModal(u)}
                                                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all hover:scale-110"
                                                    title="Reset Password"
                                                >
                                                    <Key size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteModal(u)}
                                                    className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all hover:scale-110"
                                                    title="Eliminar Utilizador"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Reset Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1a1a1a] border-2 border-white/5 rounded-[40px] p-10 max-w-md w-full text-center relative">
                        <button onClick={() => { setShowResetModal(null); setResetResponse(null); }} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>

                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
                            <Key size={32} className="text-blue-400" />
                        </div>

                        {!resetResponse ? (
                            <>
                                <h2 className="text-3xl font-black italic text-white uppercase mb-4 italic">RESET PASSWORD</h2>
                                <p className="text-gray-500 font-medium mb-10 text-sm">
                                    Desejas gerar uma nova password temporária para <span className="text-white">{showResetModal.email}</span>?
                                </p>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowResetModal(null)} className="flex-1 py-4 bg-white/5 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Cancelar</button>
                                    <button onClick={() => handleResetPassword(showResetModal.id)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20">Confirmar Reset</button>
                                </div>
                            </>
                        ) : (
                            <div className="animate-scale-in">
                                <h2 className="text-3xl font-black italic text-white uppercase mb-4 italic">SUCESSO!</h2>
                                <p className="text-gray-500 font-medium mb-6 text-sm">Password alterada com sucesso. Copia esta password temporária:</p>
                                <div className="p-6 bg-black rounded-2xl border border-blue-500/30 font-mono text-2xl font-black text-blue-400 mb-8 tracking-widest">
                                    {resetResponse.temporary_password}
                                </div>
                                <button onClick={() => { setShowResetModal(null); setResetResponse(null); }} className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all">Fechar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1a1a1a] border-2 border-red-500/20 rounded-[40px] p-10 max-w-md w-full text-center relative">
                        <button onClick={() => setShowDeleteModal(null)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>

                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>

                        <h2 className="text-3xl font-black italic text-white uppercase mb-4 italic">ELIMINAR ATLETA</h2>
                        <p className="text-gray-500 font-medium mb-10 text-sm">
                            Tens a certeza que desejas eliminar <span className="text-white">{showDeleteModal.email}</span>? Esta ação não pode ser revertida.
                        </p>

                        <div className="flex gap-4">
                            <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-4 bg-white/5 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Cancelar</button>
                            <button onClick={() => handleDeleteUser(showDeleteModal.id)} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/20">Eliminar Agora</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminPanel;
