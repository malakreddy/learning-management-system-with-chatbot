"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, X, Send, Bot, User, 
  Loader2, Sparkles, ChevronDown 
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your Kodnest Neural Assistant. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch response");

      setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: `System Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-6 w-[24rem] h-[34rem] glass rounded-[2.5rem] border border-white/40 shadow-premium overflow-hidden flex flex-col realistic-border"
          >
            {/* Header */}
            <div className="p-6 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Neural Sync</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-white/70 uppercase">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-secondary/10' : 'bg-primary/10'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 text-secondary" /> : <Bot className="w-4 h-4 text-primary" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white/60 text-slate-700 rounded-tl-none border border-white/40 backdrop-blur-md'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                     <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                     </div>
                     <div className="p-4 bg-white/60 text-slate-700 rounded-2xl rounded-tl-none border border-white/40 shadow-sm">
                        <div className="flex gap-1">
                           <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                           <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                           <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-white/40 backdrop-blur-xl border-t border-white/40">
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a technical question..."
                  className="w-full pl-6 pr-14 py-4 bg-white/60 border border-white/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-xs font-bold uppercase tracking-widest text-slate-700"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl shadow-premium hover:scale-110 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative p-6 bg-primary text-white rounded-[2rem] shadow-premium overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <MessageSquare className={`w-6 h-6 transition-all duration-500 ${isOpen ? 'rotate-90 opacity-0' : ''}`} />
          <X className={`w-6 h-6 absolute left-6 transition-all duration-500 ${isOpen ? '' : '-rotate-90 opacity-0'}`} />
          {!isOpen && (
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Sync</span>
          )}
        </div>
        
        {/* Glow effect */}
        {!isOpen && (
          <div className="absolute -inset-1 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </motion.button>
    </div>
  );
}
