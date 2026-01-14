import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, Menu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userName, setUserName] = useState(localStorage.getItem('user_name') || 'Guest');
    const [userRole, setUserRole] = useState(localStorage.getItem('user_role') || 'user');
    const userEmail = localStorage.getItem('user_email') || '';

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        const storedRole = localStorage.getItem('user_role');
        if (storedName) setUserName(storedName === 'System Admin' ? 'System Admin' : storedName);
        if (storedRole) setUserRole(storedRole);
    }, []);

    const userRoleDisplay = userRole === 'admin' ? 'Admin' : 'Athlete';

    const getInitials = (name) => {
        if (!name || name === 'Guest') return 'U';
        if (name === 'System Admin') return 'S';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <header className="sticky top-0 z-40 w-full h-16 bg-[#121212]/80 backdrop-blur-md border-b border-[#333] flex items-center justify-between px-6 md:px-12">
            {/* LEFT (Mobile Toggle) */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition"
                >
                    <Menu size={24} />
                </button>

                <div className="hidden md:block">
                    {/* Breadcrumbs or Title could go here */}
                </div>
            </div>

            {/* RIGHT - PROFILE DROPDOWN */}
            <div className="relative">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-3 focus:outline-none hover:bg-[#1a1a1a] p-2 rounded-lg transition"
                >
                    <div className="flex flex-col text-right hidden lg:block">
                        <span className="text-sm font-black italic text-white uppercase tracking-tight">
                            {userRoleDisplay} {userName}
                        </span>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hyrox-orange to-orange-700 flex items-center justify-center text-white font-bold shadow-lg border-2 border-[#333]">
                        {getInitials(userName)}
                    </div>

                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1E1E1E] rounded-xl shadow-2xl border border-[#333] py-2 animate-fade-in-up">
                        <div className="px-4 py-2 border-b border-[#333] mb-2 lg:hidden">
                            <p className="text-sm text-white font-medium">{userName}</p>
                            <p className="text-xs text-gray-500">{userRole}</p>
                        </div>

                        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-[#252525] hover:text-white transition">
                            <User size={16} className="mr-3" /> Profile
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-[#252525] hover:text-white transition">
                            <Settings size={16} className="mr-3" /> Settings
                        </a>

                        <div className="h-px bg-[#333] my-2"></div>

                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
                        >
                            <LogOut size={16} className="mr-3" /> Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
