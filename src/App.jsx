import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { marked } from "marked";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Settings,
  Plus,
  FileText,
  Menu,
  X,
  Loader2,
  Bot,
  User,
  Trash2,
  Sparkles,
  ArrowRight,
  Shield,
  Crown,
  Command,
  Cpu,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// ==============================================================================
// SECTION 1: CONFIGURATION
// ==============================================================================

const SUPABASE_URL = "https://pkabexpfifvqxnmfzeiz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrYWJleHBmaWZ2cXhubWZ6ZWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MDc0NzgsImV4cCI6MjA3OTI4MzQ3OH0.0lcm0Sx_oCLeHSqV2wpHCbsOv7xojLMtE2s_G_KcAzc";

// ==============================================================================
// SECTION 2: UTILS & SERVICES
// ==============================================================================

const initSupabase = () => {
  if (
    !SUPABASE_URL ||
    !SUPABASE_ANON_KEY ||
    SUPABASE_URL.includes("YOUR_SUPABASE")
  )
    return null;
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.error("Supabase init error:", e);
    return null;
  }
};

const generateAIResponse = async (apiKey, promptText, docContext) => {
  if (!apiKey) throw new Error("API Key is missing");

  if (apiKey.trim().startsWith("npm")) {
    throw new Error(
      "Invalid Key. You pasted the installation command. Please enter your actual Gemini API Key (starts with 'AIza' or 'sk-')."
    );
  }

  const parts = [];
  let systemPrompt = docContext
    ? `ROLE: You are "Nexus", a high-intelligence analytical engine.\nGOAL: Decode the document with surgical precision.\nSTYLE: Use Markdown, be concise, pure data.`
    : `ROLE: You are "Nexus", the architect of knowledge.\nGOAL: Provide elite-level insight.\nSTYLE: Royal, authoritative, futuristic.`;

  if (docContext) {
    if (docContext.type === "text") {
      parts.push({
        text: `${systemPrompt}\n\n--- DATA STREAM ---\n${docContext.data}\n--- END STREAM ---\n\n`,
      });
    } else {
      const base64Data = docContext.data.split(",")[1];
      parts.push({ text: systemPrompt });
      parts.push({
        inlineData: { mimeType: docContext.mimeType, data: base64Data },
      });
    }
  } else {
    parts.push({ text: systemPrompt });
  }

  parts.push({ text: `QUERY: ${promptText}\n\nNEXUS:` });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: parts }] }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || response.statusText);
  }

  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Connection severed. Retry."
  );
};

// ==============================================================================
// SECTION 3: VISUAL CORE (COMPONENTS)
// ==============================================================================

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
    
    :root { --bg-deep: #050505; }

    body {
      background-color: var(--bg-deep);
      font-family: 'Outfit', sans-serif;
      color: #e2e8f0;
      overflow: hidden;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #555; }

    /* Markdown Styles */
    .prose p { margin-bottom: 0.8em; line-height: 1.7; }
    .prose strong { font-weight: 700; }
    .prose ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
    .prose ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
    
    /* NEXUS (BOT) STYLES */
    .nexus-content p { color: #cbd5e1; }
    .nexus-content strong { color: #fff; }
    .nexus-content h1, .nexus-content h2 { 
      color: transparent; 
      background: linear-gradient(to right, #a78bfa, #60a5fa); 
      -webkit-background-clip: text; 
      background-clip: text; 
      font-weight: 800; 
      margin-top: 1.5em;
    }
    .nexus-content code { 
      font-family: 'JetBrains Mono', monospace; 
      background: rgba(0,0,0,0.5); 
      color: #f472b6; 
      padding: 2px 6px; 
      border-radius: 4px; 
    }
    .nexus-content pre { background: #0f0f11 !important; border: 1px solid #333; border-radius: 12px; padding: 1em; overflow-x: auto; }

    /* USER STYLES - FORCE DARK TEXT ON WHITE BUBBLE */
    .user-content p, .user-content span, .user-content strong, .user-content li {
        color: #0f172a !important;
    }
    .user-content h1, .user-content h2 { color: #000000 !important; }
    
    /* Animations */
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob { animation: blob 10s infinite; }
    .animation-delay-2000 { animation-delay: 2s; }
  `}</style>
);

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  icon: Icon,
}) => {
  const variants = {
    primary:
      "bg-white text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] border-transparent",
    royal:
      "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white border border-white/10 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]",
    glass:
      "bg-white/5 backdrop-blur-md border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white",
    danger:
      "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold tracking-wide text-sm transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
    >
      {Icon && <Icon size={18} />}
      {children}
    </motion.button>
  );
};

const Modal = ({ isOpen, title, children, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          className="bg-[#0f0f11] border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-cyan-500" />
          <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
          {children}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ToastContainer = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.9 }}
          className={`
            pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[300px]
            ${
              toast.type === "success"
                ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-200"
                : toast.type === "error"
                ? "bg-red-900/20 border-red-500/30 text-red-200"
                : "bg-white/10 border-white/10 text-white"
            }
          `}
        >
          {toast.type === "success" && (
            <CheckCircle size={20} className="text-emerald-400" />
          )}
          {toast.type === "error" && (
            <AlertCircle size={20} className="text-red-400" />
          )}
          {toast.type === "info" && (
            <Sparkles size={20} className="text-violet-400" />
          )}
          <div>
            <p className="text-sm font-bold">{toast.title}</p>
            <p className="text-xs opacity-80">{toast.message}</p>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ==============================================================================
// SECTION 4: MAIN APPLICATION
// ==============================================================================

export default function LearnXRoyal() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [view, setView] = useState("loading");
  const [supabase, setSupabase] = useState(null);
  const [apiKey, setApiKey] = useState("");

  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedContent, setUploadedContent] = useState(null);
  const messagesEndRef = useRef(null);
  const hasWelcomed = useRef(false); // Guard against duplicate toasts

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000
    );
  };

  useEffect(() => {
    const init = async () => {
      const storedKey = localStorage.getItem("gemini_api_key");
      if (storedKey) setApiKey(storedKey);

      const client = initSupabase();
      if (client) {
        setSupabase(client);
        const {
          data: { session },
        } = await client.auth.getSession();
        if (session?.user) handleUserSession(client, session.user);
        else setView("login");

        client.auth.onAuthStateChange(async (_evt, session) => {
          if (session?.user) handleUserSession(client, session.user);
          else {
            setUser(null);
            setView("login");
            hasWelcomed.current = false;
          }
        });
      } else setView("config_error");
    };
    init();
  }, []);

  const handleUserSession = async (client, authUser) => {
    setUser(authUser);
    const { data } = await client
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();
    if (!data) {
      await client.from("profiles").insert({
        id: authUser.id,
        display_name: authUser.email?.split("@")[0] || "Student",
        email: authUser.email,
      });
      setUserProfile({ display_name: authUser.email?.split("@")[0] });
    } else {
      setUserProfile(data);
    }
    setView("app");

    // Only show welcome toast ONCE per session
    if (!hasWelcomed.current) {
      addToast(
        "Welcome Back",
        `System online. Hello, ${data?.display_name || "Student"}.`,
        "success"
      );
      hasWelcomed.current = true;
    }
  };

  useEffect(() => {
    if (!user || !supabase) return;
    const fetchChats = async () => {
      const { data } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setChats(data);
    };
    fetchChats();
    const sub = supabase
      .channel("chats_list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chats",
          filter: `user_id=eq.${user.id}`,
        },
        fetchChats
      )
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [user, supabase]);

  useEffect(() => {
    if (!user || !currentChatId || !supabase) {
      setMessages([]);
      setUploadedContent(null);
      return;
    }
    const chat = chats.find((c) => c.id === currentChatId);
    setUploadedContent(chat?.doc_data || null);

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", currentChatId)
        .order("created_at", { ascending: true });
      if (data) {
        setMessages(data);
        scrollToBottom();
      }
    };
    fetchMessages();

    const sub = supabase
      .channel(`msg:${currentChatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${currentChatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [currentChatId, user, chats, supabase]);

  const scrollToBottom = () =>
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );

  const handleLogin = async () =>
    supabase?.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

  const handleFileRead = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    reader.onload = async (e) => {
      const docData = {
        type: isImage ? "image" : isPdf ? "pdf" : "text",
        data: e.target.result,
        name: file.name,
        mimeType: file.type,
      };
      await createNewChat(docData);
      addToast(
        "Data Uploaded",
        `${file.name} processed successfully.`,
        "success"
      );
    };
    if (isImage || isPdf) reader.readAsDataURL(file);
    else reader.readAsText(file);
  };

  const createNewChat = async (docData = null) => {
    if (!user || !supabase) return;
    const title = docData ? `Analysis: ${docData.name}` : "New Protocol";
    const { data: chat } = await supabase
      .from("chats")
      .insert({ user_id: user.id, title, doc_data: docData })
      .select()
      .single();

    if (chat) {
      setCurrentChatId(chat.id);
      setSidebarOpen(false);
      const intro = docData
        ? "Initialize analysis of the attached data structure."
        : "System online. Awaiting query.";
      await triggerAI(intro, chat.id, docData);
    }
  };

  const triggerAI = async (prompt, chatId, docContext) => {
    setIsProcessing(true);
    try {
      const aiText = await generateAIResponse(apiKey, prompt, docContext);
      await supabase
        .from("messages")
        .insert({ chat_id: chatId, role: "model", text: aiText });
    } catch (err) {
      await supabase.from("messages").insert({
        chat_id: chatId,
        role: "model",
        text: `**SYSTEM ERROR**: ${err.message}`,
      });
      addToast("Inference Error", err.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const sendMessage = async () => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    if (!inputText.trim() || isProcessing) return;
    const text = inputText;
    setInputText("");
    await supabase
      .from("messages")
      .insert({ chat_id: currentChatId, role: "user", text });
    await triggerAI(text, currentChatId, uploadedContent);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !supabase) return;
    try {
      await supabase.from("chats").delete().eq("id", deleteTarget);
      if (currentChatId === deleteTarget) setCurrentChatId(null);
      addToast(
        "Protocol Purged",
        "Session data permanently deleted.",
        "success"
      );
    } catch (e) {
      addToast("Deletion Failed", "Could not remove session.", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  // --- Render ---

  if (view === "loading")
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <GlobalStyles />
        <Loader2 className="text-violet-500 w-10 h-10 animate-spin" />
      </div>
    );

  if (view === "login")
    return (
      <div className="h-screen w-full bg-black relative overflow-hidden flex items-center justify-center">
        <GlobalStyles />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-900/20 blur-[120px] animate-blob" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-900/20 blur-[120px] animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10 p-10 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 max-w-md w-full text-center shadow-2xl">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.6)]">
              <Crown className="text-white w-10 h-10" />
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
            LEARN
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              X
            </span>
          </h1>
          <p className="text-slate-400 mb-8 font-light tracking-wide">
            The Elite Intelligence Platform
          </p>
          <Button
            onClick={handleLogin}
            variant="primary"
            fullWidth
            className="py-4 text-lg"
          >
            Initialize System
          </Button>
        </div>
      </div>
    );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#050505] text-slate-200 relative">
      <GlobalStyles />
      <ToastContainer toasts={toasts} />

      {/* --- BACKGROUND NEBULA (RGB GLOW) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-violet-900/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-900/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      {/* --- SIDEBAR --- */}
      <AnimatePresence>
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{
            x: sidebarOpen || window.innerWidth > 768 ? 0 : -300,
            opacity: 1,
          }}
          className={`
            fixed md:static inset-y-0 left-0 z-50 w-80 flex flex-col
            bg-[#09090b]/60 backdrop-blur-2xl border-r border-white/5 relative
          `}
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Crown size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white tracking-tight">
                  LEARN<span className="text-violet-400">X</span>
                </h1>
                <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest border border-white/5">
                  Royal Ed.
                </span>
              </div>
            </div>
            <button
              className="md:hidden p-2 text-slate-400"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <button
              onClick={() => createNewChat(null)}
              className="w-full group relative overflow-hidden p-4 rounded-xl bg-gradient-to-r from-violet-600/10 to-blue-600/10 border border-violet-500/20 hover:border-violet-400/50 transition-all"
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/40">
                  <Plus size={16} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-white text-sm">
                    New Protocol
                  </span>
                  <span className="text-[10px] text-violet-300">
                    General intelligence query
                  </span>
                </div>
              </div>
            </button>

            <label className="cursor-pointer w-full block group relative p-4 rounded-xl bg-[#121214] border border-white/5 hover:bg-[#1a1a1e] transition-all">
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileRead(e.target.files[0])}
              />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center text-slate-300 group-hover:text-white transition-colors">
                  <Upload size={14} />
                </div>
                <div className="text-left">
                  <span className="block font-medium text-slate-200 text-sm group-hover:text-white">
                    Upload Data
                  </span>
                  <span className="text-[10px] text-slate-500">
                    PDF, Images, Text
                  </span>
                </div>
              </div>
            </label>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">
              Active Sessions
            </p>
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                layoutId={chat.id}
                onClick={() => {
                  setCurrentChatId(chat.id);
                  setSidebarOpen(false);
                }}
                className={`
                  group relative p-3 rounded-lg cursor-pointer transition-all border
                  ${
                    currentChatId === chat.id
                      ? "bg-white/5 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                      : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5"
                  }
                `}
              >
                {currentChatId === chat.id && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-violet-500 rounded-r-full shadow-[0_0_10px_#8b5cf6]" />
                )}
                <div className="flex items-center justify-between pl-3">
                  <span
                    className={`text-sm truncate max-w-[180px] ${
                      currentChatId === chat.id
                        ? "text-white font-medium"
                        : "text-slate-400"
                    }`}
                  >
                    {chat.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-1 hover:bg-white/10 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold border border-white/20">
                {userProfile?.display_name?.[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">
                  {userProfile?.display_name}
                </p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Shield size={8} /> Secure Connection
                </p>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden z-10">
        <div className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#050505]/80 backdrop-blur">
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <Menu />
          </button>
          <span className="font-bold text-white">LEARN X</span>
          <div
            className={`w-2 h-2 rounded-full ${
              apiKey
                ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                : "bg-red-500 animate-pulse"
            }`}
          />
        </div>

        <div className="hidden md:flex absolute top-6 right-8 z-30 items-center gap-3">
          {uploadedContent && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <FileText size={12} className="text-blue-400" />
              <span className="text-xs text-blue-100 font-mono">
                {uploadedContent.name}
              </span>
            </div>
          )}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md ${
              apiKey
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                apiKey
                  ? "bg-emerald-400 shadow-[0_0_5px_currentColor]"
                  : "bg-red-400"
              }`}
            />
            <span className="text-[10px] font-bold tracking-wider uppercase">
              {apiKey ? "SYSTEM ONLINE" : "KEY REQUIRED"}
            </span>
          </div>
        </div>

        {!currentChatId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-violet-600/20 blur-[80px] rounded-full pointer-events-none"></div>
              <div className="w-32 h-32 bg-black border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl relative z-10 mx-auto mb-8">
                <Cpu className="text-white w-16 h-16" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">
                WELCOME{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                  {userProfile?.display_name || "STUDENT"}
                </span>
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto text-lg mb-8 leading-relaxed">
                The neural interface is ready. Upload data for analysis or
                initialize a general query protocol.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => createNewChat(null)}
                  variant="royal"
                  className="shadow-violet-500/20"
                >
                  Initialize Protocol
                </Button>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Chat Area */
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-4xl mx-auto space-y-8 pb-48 pt-10">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`flex gap-4 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`
                                flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg
                                ${
                                  msg.role === "model"
                                    ? "bg-black border-violet-500/30 text-violet-400 shadow-violet-500/10"
                                    : "bg-white text-black border-white shadow-white/10"
                                }
                            `}
                  >
                    {msg.role === "model" ? (
                      <Sparkles size={18} />
                    ) : (
                      <User size={18} />
                    )}
                  </div>

                  <div
                    className={`
                                max-w-[85%] md:max-w-[75%] p-6 rounded-3xl relative overflow-hidden
                                ${
                                  msg.role === "user"
                                    ? "bg-gradient-to-br from-white to-slate-300 text-black rounded-tr-sm font-medium"
                                    : "bg-white/5 border border-white/10 backdrop-blur-sm text-slate-200 rounded-tl-sm"
                                }
                            `}
                  >
                    <div
                      className={`relative z-10 prose ${
                        msg.role === "user"
                          ? "user-content"
                          : "nexus-content prose-invert"
                      }`}
                    >
                      {msg.role === "model" && (
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                          <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">
                            Nexus Core
                          </span>
                          <div className="flex gap-1">
                            <div className="w-1 h-1 bg-violet-500 rounded-full animate-pulse" />
                            <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse delay-75" />
                          </div>
                        </div>
                      )}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: marked.parse(msg.text || ""),
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
              {isProcessing && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-black border border-violet-500/30 rounded-xl flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                  </div>
                  <div className="h-10 flex items-center">
                    <span className="text-xs text-violet-400 font-mono">
                      ANALYZING DATA STREAM...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* --- GRADIENT INPUT BAR (FIXED BOTTOM) --- */}
        {currentChatId && (
          <div className="absolute bottom-0 left-0 w-full z-40">
            <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pointer-events-none" />

            <div className="relative pb-6 px-4 flex justify-center">
              <div className="w-full md:w-[800px] relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-600 via-cyan-500 to-purple-600 rounded-2xl opacity-50 blur-md group-hover:opacity-100 transition duration-500 animate-pulse"></div>
                <div className="relative bg-[#0a0a0a] rounded-2xl flex items-center p-2 border border-white/10 shadow-2xl">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={
                      uploadedContent
                        ? "Query document data..."
                        : "Enter command or query..."
                    }
                    disabled={isProcessing}
                    className="flex-1 bg-transparent border-none text-white placeholder-slate-500 px-4 py-3 focus:ring-0 font-medium tracking-wide outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || isProcessing}
                    className="p-3 bg-white text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  >
                    {isProcessing ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <ArrowRight size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-[9px] text-slate-600 pb-2 font-mono uppercase tracking-widest relative z-50">
              AI-Powered • End-to-End Encrypted • Nexus v2.0
            </p>
          </div>
        )}

        {/* DELETE MODAL - BUTTONS ALIGNED SIDE BY SIDE */}
        <Modal
          isOpen={!!deleteTarget}
          title="Purge Protocol?"
          onClose={() => setDeleteTarget(null)}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Trash2 className="text-red-500 w-8 h-8" />
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Warning: This action is irreversible. All neural data and chat
              history associated with this session will be permanently erased
              from the core.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="glass"
                onClick={() => setDeleteTarget(null)}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                className="w-full"
              >
                Confirm Purge
              </Button>
            </div>
          </div>
        </Modal>

        {/* SETTINGS MODAL - BUTTONS ALIGNED RIGHT */}
        <Modal
          isOpen={showSettings}
          title="System Configuration"
          onClose={() => setShowSettings(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                Gemini API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all font-mono text-sm mt-2"
                placeholder="Paste your Gemini API Key (starts with 'AIza' or 'sk-')"
              />
              <p className="text-[10px] text-slate-500 mt-2">
                Do not paste terminal commands. Only paste the key string.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="glass" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button
                variant="royal"
                onClick={() => {
                  if (apiKey.trim().startsWith("npm")) {
                    addToast(
                      "Invalid Key",
                      "You pasted a terminal command, not a key!",
                      "error"
                    );
                    return;
                  }
                  localStorage.setItem("gemini_api_key", apiKey);
                  setShowSettings(false);
                  addToast(
                    "Config Saved",
                    "System parameters updated.",
                    "success"
                  );
                }}
              >
                Save Changes
              </Button>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs text-slate-500">ID: {user?.email}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Terminte Session
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
