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
  Edit3,
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
      "Invalid Key. You pasted the installation command. Please enter your actual Gemini API Key."
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

    /* Mobile-First Reset */
    html, body {
      background-color: var(--bg-deep);
      font-family: 'Outfit', sans-serif;
      color: #e2e8f0;
      height: 100%;
      width: 100%;
      overflow: hidden; /* Handle scroll in react root */
      -webkit-tap-highlight-color: transparent;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
    
    /* Markdown Styles */
    .prose p { margin-bottom: 0.8em; line-height: 1.6; font-size: 0.95rem; }
    .prose strong { font-weight: 700; }
    .prose ul { list-style-type: disc; padding-left: 1.2em; margin-bottom: 1em; }
    .prose ol { list-style-type: decimal; padding-left: 1.2em; margin-bottom: 1em; }
    
    /* NEXUS STYLES */
    .nexus-content p { color: #cbd5e1; }
    .nexus-content strong { color: #fff; }
    .nexus-content h1, .nexus-content h2 { 
      color: transparent; 
      background: linear-gradient(to right, #a78bfa, #60a5fa); 
      -webkit-background-clip: text; 
      background-clip: text; 
      font-weight: 800; 
      margin-top: 1.2em;
      font-size: 1.1em;
    }
    .nexus-content code { 
      font-family: 'JetBrains Mono', monospace; 
      background: rgba(0,0,0,0.5); 
      color: #f472b6; 
      padding: 2px 6px; 
      border-radius: 4px; 
      font-size: 0.85em;
    }
    .nexus-content pre { background: #0f0f11 !important; border: 1px solid #333; border-radius: 12px; padding: 1em; overflow-x: auto; }

    /* USER STYLES */
    .user-content p, .user-content span, .user-content strong, .user-content li {
        color: #0f172a !important;
    }
    
    /* Animations */
    .animate-blob { animation: blob 10s infinite; }
    .animation-delay-2000 { animation-delay: 2s; }
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
  `}</style>
);

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  icon: Icon,
  fullWidth = false,
}) => {
  const variants = {
    primary: "bg-white text-black active:scale-95 border-transparent",
    royal:
      "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white border border-white/10 active:scale-95",
    glass:
      "bg-white/5 backdrop-blur-md border border-white/10 text-slate-300 active:bg-white/10 active:text-white",
    danger:
      "bg-red-500/10 border border-red-500/20 text-red-400 active:bg-red-500/20",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold tracking-wide text-sm transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}
      `}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Modal = ({ isOpen, title, children, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          className="bg-[#0f0f11] border border-white/10 p-6 w-full max-w-sm rounded-3xl shadow-2xl relative overflow-hidden"
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
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] flex flex-col gap-2 pointer-events-none w-[90%] max-w-sm">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl w-full
            ${
              toast.type === "success"
                ? "bg-emerald-900/80 border-emerald-500/30 text-emerald-100"
                : toast.type === "error"
                ? "bg-red-900/80 border-red-500/30 text-red-100"
                : "bg-slate-800/80 border-white/10 text-white"
            }
          `}
        >
          {toast.type === "success" && (
            <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
          )}
          {toast.type === "error" && (
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          )}
          {toast.type === "info" && (
            <Sparkles size={18} className="text-violet-400 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{toast.title}</p>
            <p className="text-xs opacity-80 line-clamp-1">{toast.message}</p>
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
  const hasWelcomed = useRef(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [tempName, setTempName] = useState("");

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
      const defaultName = authUser.email?.split("@")[0] || "Student";
      await client.from("profiles").insert({
        id: authUser.id,
        display_name: defaultName,
        email: authUser.email,
      });
      setUserProfile({ display_name: defaultName });
      setTempName(defaultName);
    } else {
      setUserProfile(data);
      setTempName(data.display_name);
    }
    setView("app");

    if (!hasWelcomed.current) {
      addToast("Welcome Back", `System online.`, "success");
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
      addToast("Data Uploaded", `${file.name} processed.`, "success");
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
      addToast("Protocol Purged", "Session deleted.", "success");
    } catch (e) {
      addToast("Deletion Failed", "Could not remove session.", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSaveSettings = async () => {
    if (apiKey.trim().startsWith("npm")) {
      addToast("Invalid Key", "You pasted a terminal command!", "error");
      return;
    }

    localStorage.setItem("gemini_api_key", apiKey);

    if (tempName !== userProfile.display_name && supabase && user) {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: tempName })
        .eq("id", user.id);
      if (!error) {
        setUserProfile((prev) => ({ ...prev, display_name: tempName }));
      } else {
        addToast("Update Failed", "Could not update name.", "error");
        return;
      }
    }

    setShowSettings(false);
    addToast("Saved", "Settings updated.", "success");
  };

  // --- Render ---
  if (view === "loading")
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <GlobalStyles />
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="relative z-10 text-violet-500 w-10 h-10 animate-spin" />
        </div>
        <p className="text-neutral-500 text-sm font-medium tracking-wider animate-pulse">
          ESTABLISHING CONNECTION...
        </p>
      </div>
    );

  if (view === "login")
    return (
      <div className="min-h-screen w-full bg-[#050505] relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
        <GlobalStyles />

        {/* Ambient Background - Made slightly more subtle for professionalism */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-900/10 blur-[100px] animate-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/10 blur-[100px] animate-blob animation-delay-2000" />
        </div>

        {/* Main Card */}
        <div className="relative z-10 w-full max-w-[420px] flex flex-col">
          {/* Glass Container */}
          <div className="backdrop-blur-3xl bg-white/[0.03] border border-white/[0.08] rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col items-center text-center ring-1 ring-white/5">
            {/* Logo Section */}
            <div className="mb-8 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-cyan-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-900 to-slate-900 border border-white/10 flex items-center justify-center shadow-inner">
                <Crown className="text-white w-8 h-8" strokeWidth={1.5} />
              </div>
            </div>

            {/* Header Text */}
            <div className="space-y-2 mb-10">
              <h1 className="text-4xl font-bold tracking-tight text-white">
                LEARN
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                  X
                </span>
              </h1>
              <p className="text-slate-400 text-sm font-normal leading-relaxed">
                The Elite Intelligence Platform
              </p>
            </div>

            {/* Action Section */}
            <div className="w-full space-y-4">
              <Button
                onClick={handleLogin}
                variant="primary"
                fullWidth
                className="group relative py-3.5 text-base font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-2">
                  Initialize System
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              <p className="text-xs text-slate-600 pt-4 border-t border-white/5">
                Secure Encrypted Connection
              </p>
            </div>
          </div>

          {/* Footer Links (Optional for standard look) */}
          <div className="mt-6 flex justify-center gap-6 text-xs text-slate-600 font-medium">
            <button className="hover:text-slate-400 transition-colors">
              Privacy
            </button>
            <button className="hover:text-slate-400 transition-colors">
              Terms
            </button>
            <button className="hover:text-slate-400 transition-colors">
              Help
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#050505] text-slate-200 relative">
      <GlobalStyles />
      <ToastContainer toasts={toasts} />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-violet-900/10 blur-[150px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-900/10 blur-[150px] opacity-50" />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed md:static inset-y-0 left-0 z-[70] w-80 flex flex-col
          bg-[#09090b] border-r border-white/5 shadow-2xl md:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Crown size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight">
                LEARN<span className="text-violet-400">X</span>
              </h1>
              <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400 uppercase tracking-widest border border-white/5">
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
            onClick={() => {
              createNewChat(null);
              setSidebarOpen(false);
            }}
            className="w-full group relative overflow-hidden p-3.5 rounded-xl bg-gradient-to-r from-violet-600/10 to-blue-600/10 border border-violet-500/20 transition-all"
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-white shadow-md">
                <Plus size={14} />
              </div>
              <div className="text-left">
                <span className="block font-bold text-white text-xs">
                  New Protocol
                </span>
                <span className="text-[9px] text-violet-300">
                  General intelligence query
                </span>
              </div>
            </div>
          </button>

          <label className="cursor-pointer w-full block group relative p-3.5 rounded-xl bg-[#121214] border border-white/5 active:bg-[#1a1a1e] transition-all">
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                handleFileRead(e.target.files[0]);
                setSidebarOpen(false);
              }}
            />
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#27272a] flex items-center justify-center text-slate-300">
                <Upload size={14} />
              </div>
              <div className="text-left">
                <span className="block font-medium text-slate-200 text-xs">
                  Upload Data
                </span>
                <span className="text-[9px] text-slate-500">
                  PDF, Images, Text
                </span>
              </div>
            </div>
          </label>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">
            Sessions
          </p>
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                setSidebarOpen(false);
              }}
              className={`
                  group relative p-3 rounded-lg cursor-pointer transition-all border flex items-center justify-between
                  ${
                    currentChatId === chat.id
                      ? "bg-white/5 border-violet-500/50"
                      : "bg-transparent border-transparent active:bg-white/5"
                  }
                `}
            >
              <span
                className={`text-xs truncate max-w-[180px] ${
                  currentChatId === chat.id
                    ? "text-white font-medium"
                    : "text-slate-400"
                }`}
              >
                {chat.title}
              </span>
              {currentChatId === chat.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(chat.id);
                  }}
                  className="text-red-400 p-1 rounded hover:bg-white/10"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold border border-white/20 text-xs">
              {userProfile?.display_name?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">
                {userProfile?.display_name}
              </p>
              <p className="text-[9px] text-emerald-400 flex items-center gap-1">
                <Shield size={8} /> Secure
              </p>
            </div>
            <button
              onClick={() => {
                setShowSettings(true);
                setSidebarOpen(false);
              }}
              className="text-slate-500 hover:text-white"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 relative flex flex-col h-full overflow-hidden z-10">
        {/* Mobile Header */}
        <div className="md:hidden h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#050505]/90 backdrop-blur-md z-40 sticky top-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white p-1"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-white text-sm tracking-wide">
            LEARN X
          </span>
          <div
            className={`w-2 h-2 rounded-full ${
              apiKey
                ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                : "bg-red-500 animate-pulse"
            }`}
          />
        </div>

        {/* Desktop Status */}
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
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-lg"
            >
              <div className="w-20 h-20 md:w-28 md:h-28 bg-black border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl relative z-10 mx-auto mb-6">
                <Cpu className="text-white w-10 h-10 md:w-14 md:h-14" />
              </div>
              <h2 className="text-2xl md:text-5xl font-black text-white mb-3 tracking-tighter uppercase">
                WELCOME{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                  {userProfile?.display_name || "STUDENT"}
                </span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed px-2">
                The neural interface is ready. Upload data for analysis or
                initialize a general query protocol.
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={() => createNewChat(null)}
                  variant="royal"
                  className="shadow-violet-500/20 w-full md:w-auto"
                >
                  Initialize Protocol
                </Button>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-4xl mx-auto space-y-5 md:space-y-8 pb-32 md:pb-48 pt-2 md:pt-10">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 md:gap-4 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`
                                flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border shadow-lg mt-1
                                ${
                                  msg.role === "model"
                                    ? "bg-black border-violet-500/30 text-violet-400"
                                    : "bg-white text-black border-white"
                                }
                            `}
                  >
                    {msg.role === "model" ? (
                      <Sparkles size={14} />
                    ) : (
                      <User size={14} />
                    )}
                  </div>

                  <div
                    className={`
                                max-w-[85%] md:max-w-[75%] p-3 md:p-5 rounded-2xl relative overflow-hidden text-sm md:text-base
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
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                          <span className="text-[9px] text-violet-400 font-bold uppercase tracking-widest">
                            Nexus Core
                          </span>
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
                <div className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-black border border-violet-500/30 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                  </div>
                  <div className="h-8 flex items-center">
                    <span className="text-[10px] text-violet-400 font-mono">
                      PROCESSING...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input Bar */}
        {currentChatId && (
          <div className="fixed md:absolute bottom-0 left-0 w-full z-30">
            {/* Void Gradient */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pointer-events-none" />

            <div className="relative pb-4 md:pb-6 px-3 md:px-4 flex justify-center">
              <div className="w-full md:w-[800px] relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-600 via-cyan-500 to-purple-600 rounded-2xl opacity-50 blur-md transition duration-500 animate-pulse"></div>
                <div className="relative bg-[#0a0a0a] rounded-2xl flex items-center p-1.5 md:p-2 border border-white/10 shadow-2xl">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={
                      uploadedContent ? "Ask about data..." : "Command..."
                    }
                    disabled={isProcessing}
                    className="flex-1 bg-transparent border-none text-white placeholder-slate-500 px-3 py-3 focus:ring-0 font-medium tracking-wide outline-none text-sm md:text-base"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || isProcessing}
                    className="p-2.5 md:p-3 bg-white text-black rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  >
                    {isProcessing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ArrowRight size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="hidden md:block text-center text-[9px] text-slate-600 pb-2 font-mono uppercase tracking-widest relative z-50">
              AI-Powered • End-to-End Encrypted • Nexus v2.0
            </p>
          </div>
        )}

        <Modal
          isOpen={!!deleteTarget}
          title="Purge Protocol?"
          onClose={() => setDeleteTarget(null)}
        >
          <div className="text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Trash2 className="text-red-500 w-6 h-6" />
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Irreversible action. All chat history for this session will be
              erased.
            </p>
            <div className="grid grid-cols-2 gap-3">
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
                Purge
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showSettings}
          title="System Configuration"
          onClose={() => setShowSettings(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                Display Name
              </label>
              <div className="relative mt-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-sm"
                  placeholder="Enter your name..."
                />
                <Edit3
                  size={14}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                Gemini API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all font-mono text-sm mt-2"
                placeholder="Paste your Gemini API Key..."
              />
              <p className="text-[10px] text-slate-500 mt-2">
                Securely stored locally. Never shared.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="glass" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button variant="royal" onClick={handleSaveSettings}>
                Save
              </Button>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs text-slate-500 truncate max-w-[150px]">
                ID: {user?.email}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
