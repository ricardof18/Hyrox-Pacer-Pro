import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                const formData = new FormData();
                formData.append('username', email); // OAuth2 spec expects 'username'
                formData.append('password', password);

                const response = await api.post('/login', formData);
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user_name', response.data.user_name);
                localStorage.setItem('user_role', response.data.user_role);
                localStorage.setItem('user_email', response.data.user_email);

                // Use window.location.href to force a full internal state reset and sync with localStorage
                window.location.href = '/dashboard';
            } else {
                await api.post('/signup', {
                    email,
                    password,
                    full_name: fullName,
                    age: 25, // Default or add input
                    categoria_hyrox: "Open" // Default or add input
                });
                // Auto login or ask to login? Let's switch to login view
                setIsLogin(true);
                setError('Registered successfully! Please login.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'An error occurred');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-hyrox-bg text-white">
            <div className="w-full max-w-md p-8 bg-[#1E1E1E] rounded-2xl shadow-2xl border border-[#333]">
                <h2 className="text-3xl font-bold text-center mb-8 text-hyrox-orange">
                    {isLogin ? 'WELCOME BACK' : 'JOIN THE ELITE'}
                </h2>

                {error && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 bg-[#121212] border border-[#333] rounded-lg focus:outline-none focus:border-hyrox-orange text-white"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-[#121212] border border-[#333] rounded-lg focus:outline-none focus:border-hyrox-orange text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#121212] border border-[#333] rounded-lg focus:outline-none focus:border-hyrox-orange text-white"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-hyrox-orange hover:bg-orange-600 text-white font-bold rounded-lg transition duration-200 uppercase tracking-wide"
                    >
                        {isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-hyrox-orange hover:underline font-semibold"
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
