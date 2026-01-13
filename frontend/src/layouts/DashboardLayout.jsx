import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-[#0a0a0a] overflow-hidden font-sans">
            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col md:ml-[260px] transition-all">
                <Navbar />

                <main className="flex-1 overflow-y-auto bg-hyrox-bg p-6 md:p-8">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
