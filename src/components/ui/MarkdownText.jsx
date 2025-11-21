import React from "react";

export const MarkdownText = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div className="text-sm leading-7 space-y-4 font-normal text-slate-200">
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const content = part.slice(3, -3).replace(/^[a-z]+\n/, "");
          return (
            <div key={i} className="relative group my-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <pre className="relative bg-slate-950 border border-slate-800 text-slate-100 p-4 rounded-xl overflow-x-auto font-mono text-xs shadow-inner">
                <code>{content}</code>
              </pre>
            </div>
          );
        }
        return part.split("\n").map((line, j) => {
          if (!line.trim()) return <div key={`${i}-${j}`} className="h-2" />;
          const formattedLine = line.split(/(\*\*.*?\*\*)/g).map((segment, k) =>
            segment.startsWith("**") && segment.endsWith("**") ? (
              <strong key={k} className="font-bold text-indigo-300">
                {segment.slice(2, -2)}
              </strong>
            ) : (
              segment
            )
          );
          if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
            return (
              <div key={`${i}-${j}`} className="flex gap-2 ml-2">
                <span className="text-indigo-400 mt-1.5">•</span>
                <span>{formattedLine.slice(1)}</span>
              </div>
            );
          }
          return <p key={`${i}-${j}`}>{formattedLine}</p>;
        });
      })}
    </div>
  );
};
