import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Camera, Menu, X, MessageSquare } from 'lucide-react';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${searchQuery}`);
            setSearchQuery('');
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-2 group">
                    <Camera className="w-8 h-8 text-purple-600 transition-transform group-hover:scale-110" />
                    <span className="text-2xl font-black tracking-tighter text-gray-900">RecME</span>
                </NavLink>

                {/* Desktop Search */}
                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for movies, actors, genres..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                    />
                </form>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
                    <NavLink to="/" className={({ isActive }) => `hover:text-gray-900 transition-colors ${isActive ? 'text-gray-900 flex flex-col items-center after:content-[""] after:w-1 after:h-1 after:bg-purple-600 after:rounded-full after:mt-1' : ''}`}>
                        Discover
                    </NavLink>
                    <NavLink to="/chatbot" className={({ isActive }) => `flex items-center gap-2 hover:text-gray-900 transition-colors ${isActive ? 'text-gray-900 after:content-[""] after:w-1 after:h-1 after:bg-purple-600 after:rounded-full after:mt-1 flex-col' : ''}`}>
                        <MessageSquare className="w-4 h-4" />
                        AI Assistant
                    </NavLink>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-4 shadow-xl animate-in slide-in-from-top-2">
                    <div className="flex flex-col gap-4 text-center font-bold text-lg text-gray-500">
                        <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => isActive ? 'text-purple-600' : ''}>Discover</NavLink>
                        <NavLink to="/chatbot" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => isActive ? 'text-purple-600' : ''}>AI Assistant</NavLink>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
