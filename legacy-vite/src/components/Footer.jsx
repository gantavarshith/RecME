import React from 'react';
import { Camera, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="mt-20 border-t border-gray-100 py-12 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Camera className="w-6 h-6 text-purple-600" />
                        <span className="text-xl font-bold tracking-tighter">RecME</span>
                    </div>
                    <p className="text-gray-500 max-w-sm leading-relaxed">
                        Your intelligent partner in discovering cinema. Powered by advanced recommendation engines and AI insights.
                    </p>
                </div>
                
                <div>
                    <h4 className="font-semibold mb-4 text-gray-900">Platform</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                        <li className="hover:text-purple-600 cursor-pointer transition-colors">Movies</li>
                        <li className="hover:text-purple-600 cursor-pointer transition-colors">AI Assistant</li>
                        <li className="hover:text-purple-600 cursor-pointer transition-colors">Mood Discovery</li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="font-semibold mb-4 text-gray-900">Connect</h4>
                    <div className="flex gap-4">
                        <Github className="w-5 h-5 text-gray-400 hover:text-gray-900 cursor-pointer transition-all" />
                        <Twitter className="w-5 h-5 text-gray-400 hover:text-gray-900 cursor-pointer transition-all" />
                        <Mail className="w-5 h-5 text-gray-400 hover:text-gray-900 cursor-pointer transition-all" />
                    </div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 uppercase tracking-widest">
                <p>© 2026 RecME AI. All rights reserved.</p>
                <div className="flex gap-8">
                    <span className="hover:text-gray-900 cursor-pointer transition-colors">Privacy</span>
                    <span className="hover:text-gray-900 cursor-pointer transition-colors">Terms</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
