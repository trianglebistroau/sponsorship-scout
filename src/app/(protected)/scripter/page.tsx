'use client'

import React, { useState, useRef, useCallback, useEffect, use } from "react";
import DeckPage from "./pages/CardsDisplay";
import Blob from "./components/bubble";

import { motion, AnimatePresence } from 'framer-motion';
import { set } from "date-fns";


export default function TestPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);

    const [showHints, setShowHints] = useState(false);
    
    const blobRef = useRef(null);
    const idleTimer = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => setShowHints(true), 3000);
        console.log("set timeout for hints", timer);

        return () => clearTimeout(timer);
    }, []);

    const setBlob = useCallback((state, dur = 700) => {
        blobRef.current?.setState(state, { duration: dur });
    }, []);

    // Auto-return to idle
    const bumpIdle = useCallback((delayMs = 6000) => {
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => {
            if (!loading) setBlob('idle', 800);
        }, delayMs);
    }, [setBlob, loading]);

    useEffect(() => {
        bumpIdle(4000);
        return () => idleTimer.current && clearTimeout(idleTimer.current);
    }, [bumpIdle]);

    const handleAsk = async () => {
        if (!question.trim() || loading) return;
        
        const userMessage = question.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setQuestion('');
        setLoading(true);
        
        try {
            if (idleTimer.current) clearTimeout(idleTimer.current);
            setBlob('thinking', 350);
            
            // Your API call here
            await new Promise(resolve => setTimeout(resolve, 2000));
            const response = `Answer to: ${userMessage}`;
            
            setMessages(prev => [...prev, { role: 'assistant', text: response }]);
            setBlob('success', 650);
            bumpIdle(5000);
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'assistant', text: 'Failed to get answer' }]);
            setBlob('fail', 900);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <DeckPage />

            {/* <div className="fixed bottom-6 right-6 flex items-center gap-3">
                <AnimatePresence>
                    {showHints &&(
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 2.5 }}
                            className="text-sm font-medium"
                        >
                            click me!
                        
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <AnimatePresence>
                    {showHints &&(
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 1 }}
                            className="text-sm font-medium"
                        >
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="h-16 w-16 rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                            <Blob ref={blobRef}/>
                        </button>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div> */}
            {/* Floating Blob Button */}

            {/* Chat Panel */}
            <div
                className={`fixed bottom-0 right-0 w-full sm:w-96 bg-white dark:bg-slate-900 border-t sm:border-l border-slate-300 dark:border-slate-700 shadow-2xl transition-transform duration-300 z-40 ${
                    isOpen ? 'translate-y-0' : 'translate-y-full'
                }`}
                style={{ height: '70vh', maxHeight: '600px' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-700">
                    <h3 className="font-semibold">Chat Assistant</h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: 'calc(100% - 140px)' }}>
                    {messages.length === 0 ? (
                        <div className="text-center text-slate-500 mt-8">
                            Ask me anything!
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                        msg.role === 'user'
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-300 dark:border-slate-700">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 p-2">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => {
                                setQuestion(e.target.value);
                                bumpIdle(5000);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent px-2 py-1 outline-none"
                            disabled={loading}
                        />
                        <button
                            onClick={handleAsk}
                            disabled={loading || !question.trim()}
                            className="rounded-lg bg-indigo-500 text-white px-3 py-1 font-semibold hover:brightness-110 disabled:opacity-50 text-sm"
                        >
                            {loading ? '...' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay when chat is open */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/20 z-30 sm:hidden"
                />
            )}
        </div>
    );
}