import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, Shield, User, CornerDownLeft } from "lucide-react";

interface SiaChatBubbleProps {
  user: { _id: string; name: string; email: string; mobile_number?: string } | null;
}

interface ChatMessage {
  id: string;
  sender: "user" | "sia";
  text: string;
  suggestions?: string[];
  timestamp: Date;
}

export default function SiaChatBubble({ user }: SiaChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "Scammer is asking for OTP to verify a payment.",
    "Got a call saying my Aadhaar KYC is suspended.",
    "Lottery win message asking for advance registration fee."
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when user logs in
  useEffect(() => {
    if (user) {
      setMessages([
        {
          id: "welcome",
          sender: "sia",
          text: `Hello standard citizen **${user.name}**. I am **SIA**, your National Cyber Defense assistant. 
          
If you are being pressured by a potential scammer on another call or message right now, **tell me what they are saying below!** 

I will instantly analyze their tactics, give you tricky questions to trap them, and outline active safety steps.`,
          timestamp: new Date()
        }
      ]);
    }
  }, [user]);

  // Handle scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/sia-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend.trim() })
      });

      if (!res.ok) {
        throw new Error("SIA network link failed.");
      }

      const data = await res.json();

      const siaMsg: ChatMessage = {
        id: `sia_${Date.now()}`,
        sender: "sia",
        text: data.reply || "I am unable to analyze this suspicious pattern at this moment. Please terminate the suspect call immediately.",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, siaMsg]);

      if (data.suggestions && data.suggestions.length > 0) {
        setQuickReplies(data.suggestions);
      } else {
        setQuickReplies([
          "Block this caller number.",
          "Check standard bank rules.",
          "File another complain."
        ]);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: "sia",
        text: `⚠️ **Security Connection Check Failed**
        
SIA was unable to parse the scenario safely. Please block the suspect caller immediately, do not give any details, and report this communication in the complaints form first.`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleSendMessage(inputValue);
  };

  // Helper function to render text with basic markdown styling safely
  const formatSiaText = (txt: string) => {
    return txt.split("\n").map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Header replacement style
      if (trimmed.startsWith("⚠️")) {
        return (
          <h4 key={idx} className="text-rose-600 font-extrabold text-[12.5px] mt-1 flex items-center gap-1 font-mono uppercase tracking-wide">
            {trimmed}
          </h4>
        );
      }
      if (trimmed.startsWith("🎯") || trimmed.startsWith("🛡️")) {
        return (
          <h5 key={idx} className="text-slate-900 font-bold text-xs mt-3 flex items-center gap-1">
            {trimmed}
          </h5>
        );
      }
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const itemText = trimmed.substring(1).trim().replace(/\*\*/g, "");
        return (
          <li key={idx} className="text-[11px] text-slate-700 ml-3.5 list-disc leading-relaxed mt-0.5">
            {itemText}
          </li>
        );
      }

      // Standard double asterisk text replacement
      const parts = line.split("**");
      return (
        <p key={idx} className="text-[11.5px] text-slate-700 leading-relaxed mt-1">
          {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-slate-900 font-bold">{part}</strong> : part))}
        </p>
      );
    });
  };

  if (!user) return null; // Chatbot only available for authenticated citizens

  return (
    <div id="sia-chatbot-container" className="fixed bottom-6 right-6 z-50 select-none">
      
      {/* Floating Action Trigger Button */}
      <button
        id="sia-floating-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer border ${
          isOpen 
            ? "bg-slate-900 border-slate-800 text-white rotate-90 scale-95" 
            : "bg-gradient-to-tr from-blue-600 to-blue-500 border-blue-400 text-white hover:shadow-blue-500/25 hover:scale-105"
        }`}
        title="Assist with SIA AI Scammer Chatbot"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
              AI
            </span>
          </div>
        )}
      </button>

      {/* Floating Chat Panel Drawer */}
      {isOpen && (
        <div
          id="sia-chat-drawer"
          className="absolute bottom-16 right-0 w-[360px] max-w-[calc(100vw-32px)] h-[500px] bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-slide-up"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1 px-1.5 bg-blue-600 rounded-lg text-white font-mono text-[10px] uppercase font-black tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                SIA
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-tight">AI Scammer Assistant</h3>
                <span className="text-[9px] text-slate-400 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-blue-400 animate-pulse" /> National Protection Protocol
                </span>
              </div>
            </div>
            <button
              id="sia-chat-close"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/80 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 w-full ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Visual Avatar */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${
                    msg.sender === "user"
                      ? "bg-slate-200 border-slate-300 text-slate-800"
                      : "bg-slate-900 border-slate-800 text-blue-400"
                  }`}
                >
                  {msg.sender === "user" ? <User className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                </div>

                {/* Bubble Container */}
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs border ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white border-blue-500 rounded-tr-none"
                      : "bg-white text-slate-800 border-slate-200 shadow-sm rounded-tl-none space-y-1.5"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  ) : (
                    <div>{formatSiaText(msg.text)}</div>
                  )}
                  <div
                    className={`text-[8.5px] font-mono mt-1 text-right block ${
                      msg.sender === "user" ? "text-blue-200" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 w-full flex-row">
                <div className="w-6 h-6 rounded-full bg-slate-905 border border-slate-800 text-blue-400 flex items-center justify-center shrink-0">
                  <Shield className="w-3 h-3 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                  SIA is formulating scam-analysis vectors
                  <span className="animate-ping text-blue-500 -ml-0.5">.</span>
                  <span className="animate-ping text-blue-500 delay-100 -ml-0.5">.</span>
                  <span className="animate-ping text-blue-500 delay-200 -ml-0.5">.</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick replies */}
          {quickReplies.length > 0 && !isTyping && (
            <div className="p-2 border-t border-slate-100 bg-white flex flex-col gap-1.5 max-h-[110px] overflow-y-auto shrink-0 custom-scrollbar">
              <span className="text-[8.5px] font-mono uppercase tracking-wider text-slate-450 px-1 block">
                Suggested Scenarios
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(reply)}
                    className="text-[10px] bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-650 font-medium px-2.5 py-1 rounded-full transition-all text-left truncate max-w-full cursor-pointer active:scale-95"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              id="sia-chat-input"
              type="text"
              placeholder="Describe scammer command or query (e.g. asking for card PIN)..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 disabled:opacity-60"
            />
            <button
              id="sia-chat-send-btn"
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
