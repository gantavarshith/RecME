import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToChatbot } from '../services/api';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
    const [message, setMessage] = useState('');
    const [responses, setResponses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [responses]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = message;
        setMessage('');
        setResponses(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const data = await sendMessageToChatbot(userMsg);
            setResponses(prev => [...prev, { role: 'bot', content: data.response }]);
        } catch (error) {
            setResponses(prev => [...prev, { role: 'bot', content: "I'm sorry, I'm having trouble connecting right now. Please try again later!" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-160px)] flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-100 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">RecME AI</h2>
                    <p className="text-sm text-gray-500 font-medium tracking-wide flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Active and ready to help
                    </p>
                </div>
            </div>

            <div 
                ref={scrollRef}
                className="flex-grow overflow-y-auto mb-6 pr-4 space-y-6 scroll-smooth scrollbar-hide"
            >
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center max-w-md mx-auto mb-8">
                    <p className="text-sm text-purple-700 font-medium">
                        👋 Hi! I'm your movie expert. Ask me for recommendations based on mood, genre, or specific actors!
                    </p>
                </div>

                <AnimatePresence initial={false}>
                    {responses.map((resp, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${resp.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[80%] ${resp.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${resp.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                    {resp.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                    resp.role === 'user' 
                                        ? 'bg-purple-600 text-white rounded-tr-none' 
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                }`}>
                                    {resp.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="flex gap-3 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                    <Loader2 size={16} className="animate-spin" />
                                </div>
                                <div className="px-5 py-3 rounded-2xl rounded-tl-none bg-white border border-gray-100 text-gray-400 text-xs font-mono tracking-widest italic flex items-center gap-2">
                                    Thinking...
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <form onSubmit={handleSend} className="relative group">
                <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    placeholder="Describe your mood or ask for a recommendation..."
                    disabled={isLoading}
                    className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-6 pr-16 text-gray-900 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all shadow-xl disabled:opacity-50"
                />
                <button 
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed group-hover:scale-105 active:scale-95 duration-200"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default Chatbot;
