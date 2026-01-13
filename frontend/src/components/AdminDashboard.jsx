import React, { useEffect, useState } from 'react';
import api from '../api';
import Card from './Card';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            await api.delete(`/users/${userId}`);
            // Optimistic update
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) return <div className="text-white">Loading users...</div>;

    return (
        <Card className="mb-12 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-hyrox-orange mb-6">User Management (Admin)</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-400">
                    <thead className="bg-[#121212] text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333]">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-[#252525] transition">
                                <td className="px-6 py-4">{user.id}</td>
                                <td className="px-6 py-4 font-medium text-white">{user.full_name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{user.categoria_hyrox}</td>
                                <td className="px-6 py-4">
                                    {user.role !== 'admin' && (
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-500 hover:text-red-400 font-bold text-sm"
                                        >
                                            DELETE
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default AdminDashboard;
