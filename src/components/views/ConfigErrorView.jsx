import React from "react";
import { AlertTriangle } from "lucide-react";

export const ConfigErrorView = () => (
  <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
    <div className="bg-red-500/10 p-8 rounded-3xl border border-red-500/20 max-w-lg w-full shadow-2xl shadow-red-900/20">
      <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-400">
        <AlertTriangle size={32} />
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">
        Configuration Missing
      </h1>
      <p className="text-slate-400 mb-6 leading-relaxed">
        The application cannot connect to the backend. You must add your
        Supabase URL and Anonymous Key to the source code.
      </p>
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-left font-mono text-xs text-slate-300 overflow-x-auto">
        <p className="text-slate-500 mb-2">// src/lib/supabase.js</p>
        <p>
          <span className="text-purple-400">const</span>{" "}
          <span className="text-blue-400">SUPABASE_URL</span> ={" "}
          <span className="text-green-400">'YOUR_URL_HERE'</span>;
        </p>
        <p>
          <span className="text-purple-400">const</span>{" "}
          <span className="text-blue-400">SUPABASE_ANON_KEY</span> ={" "}
          <span className="text-green-400">'YOUR_KEY_HERE'</span>;
        </p>
      </div>
    </div>
  </div>
);
