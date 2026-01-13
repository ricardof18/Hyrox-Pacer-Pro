import React from 'react';
import { LayoutDashboard, Calculator, History, ThermometerSnowflake, ShieldCheck, LogOut, Star, Crown, Gauge } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { logout } = useAuth();

    const menuItems = [
        { name: 'Home', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Simulador Hyrox', icon: Calculator, path: '/pacer' },
        { name: 'Pace Calculator', icon: Gauge, path: '/pace-calculator' },
        { name: 'Histórico', icon: History, path: '/history' },
        { name: 'Recovery Lab', icon: ThermometerSnowflake, path: '/recovery' },
        { name: 'Planos & Upgrade', icon: Crown, path: '/pricing' },
    ];

    const userRole = localStorage.getItem('user_role');

    const handleLogout = () => {
        logout();
    };

    return (
        <aside className="hidden md:flex flex-col w-[260px] h-screen bg-[#1a1a1a] border-r border-[#333] fixed left-0 top-0 z-50">
            {/* LOGO */}
            <div className="p-8 border-b border-[#333]">
                <h1 className="text-xl font-bold tracking-tighter text-white">
                    HYROX <span className="text-hyrox-orange">PACER PRO</span>
                </h1>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 group ${location.pathname === item.path
                            ? 'bg-hyrox-orange text-white shadow-lg shadow-orange-900/20'
                            : 'text-gray-400 hover:bg-[#252525] hover:text-white'
                            }`}
                    >
                        <item.icon size={20} className={`mr-3 ${location.pathname === item.path ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                        <span className="font-medium text-sm">{item.name}</span>
                    </button>
                ))}

                {userRole === 'admin' && (
                    <div className="mt-10">
                        <span className="text-[10px] text-gray-500 ml-4 mb-2 uppercase tracking-widest">Gestão</span>
                        <hr className="border-gray-800 my-4 mx-4" />
                        <button
                            onClick={() => navigate('/admin')}
                            className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 group ${location.pathname === '/admin'
                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20'
                                : 'text-gray-400 hover:bg-[#252525] hover:text-white'
                                }`}
                        >
                            <ShieldCheck size={20} className={`mr-3 ${location.pathname === '/admin' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                            <span className="font-medium text-sm">Admin Panel</span>
                        </button>
                    </div>
                )}
            </nav>

            {/* FOOTER */}
            <div className="p-4 border-t border-[#333]">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <LogOut size={20} className="mr-3" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
