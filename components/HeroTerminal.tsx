"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

const TERMINAL_LINES = [
  { type: "command", text: "$ distiller summarize --topic ai" },
  { type: "status", text: "→ Fetching latest articles..." },
  { type: "status", text: "→ Building context (3 relevant snippets found)" },
  { type: "status", text: "→ Analyzing with AI model..." },
  { type: "output", text: "" },
  { type: "label", text: "── AI Summary ──────────────────────────────" },
  { type: "bullet", text: "• Models above 70B parameters demonstrate chain-of-thought reasoning" },
  { type: "bullet", text: "• Scaling laws predict 2x improvement with 4x compute budget" },
  { type: "bullet", text: "• Capability emergence is consistent across architecture families" },
  { type: "output", text: "" },
  { type: "meta", text: "✓ 3 bullets · 94% confidence · 1.2s · grounded in source" },
];

function useTypingAnimation(lines: typeof TERMINAL_LINES, speed = 30) {
  const [displayedLines, setDisplayedLines] = useState<typeof TERMINAL_LINES>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedLines(lines);
      setIsComplete(true);
      return;
    }

    if (currentLine >= lines.length) {
      setIsComplete(true);
      return;
    }

    const line = lines[currentLine];
    if (currentChar >= line.text.length) {
      setDisplayedLines((prev) => [...prev, line]);
      setCurrentLine((prev) => prev + 1);
      setCurrentChar(0);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentChar((prev) => prev + 1);
    }, line.type === "command" ? speed * 1.5 : speed);

    return () => clearTimeout(timer);
  }, [currentLine, currentChar, lines, speed, prefersReducedMotion]);

  return { displayedLines, currentLine, currentChar, isComplete };
}

export function HeroTerminal() {
  const { displayedLines, currentLine, currentChar, isComplete } = useTypingAnimation(TERMINAL_LINES);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedLines]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto mt-8 sm:mt-12 max-w-2xl"
    >
      {/* Ambient glow */}
      <div className="absolute -inset-4 sm:-inset-8 -z-10">
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-xl sm:blur-2xl" />
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 blur-2xl sm:blur-3xl" />
      </div>
      
      {/* Terminal window - always dark */}
      <div className="dark overflow-hidden rounded-xl sm:rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/95 shadow-2xl backdrop-blur-xl">
        {/* Terminal header */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex gap-1.5 sm:gap-2">
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#ff5f57] shadow-[0_0_8px_rgba(255,95,87,0.4)]" />
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#febc2e] shadow-[0_0_8px_rgba(254,188,46,0.4)]" />
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#28c840] shadow-[0_0_8px_rgba(40,200,64,0.4)]" />
          </div>
          <span className="ml-2 sm:ml-3 text-[10px] sm:text-[11px] font-medium text-white/30">distiller — ai summarize</span>
        </div>

        {/* Terminal body */}
        <div
          ref={terminalRef}
          className="max-h-56 sm:max-h-72 overflow-y-auto p-3 sm:p-5 font-mono text-[11px] sm:text-[13px] leading-[1.6] sm:leading-[1.7]"
          aria-label="Terminal animation showing AI summarization process"
        >
          {displayedLines.map((line, i) => (
            <TerminalLine key={i} line={line} />
          ))}
          
          {/* Current typing line */}
          {!isComplete && currentLine < TERMINAL_LINES.length && (
            <div className="flex items-center gap-2">
              <span className={getLineColor(TERMINAL_LINES[currentLine].type)}>
                {TERMINAL_LINES[currentLine].text.slice(0, currentChar)}
              </span>
              <span className="inline-block h-3 w-1.5 sm:h-[14px] sm:w-[7px] animate-pulse rounded-sm bg-primary" />
            </div>
          )}

          {/* Cursor at end when complete */}
          {isComplete && (
            <div className="flex items-center gap-2 text-white/20">
              <span>$</span>
              <span className="inline-block h-3 w-1.5 sm:h-[14px] sm:w-[7px] animate-pulse rounded-sm bg-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Floating badge - hidden on very small screens */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-4 hidden sm:flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-foreground shadow-xl backdrop-blur-xl"
      >
        <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
        AI-powered
      </motion.div>
    </motion.div>
  );
}

function TerminalLine({ line }: { line: (typeof TERMINAL_LINES)[number] }) {
  return (
    <div className={getLineColor(line.type)}>
      {line.text}
    </div>
  );
}

function getLineColor(type: string): string {
  switch (type) {
    case "command":
      return "text-primary font-semibold";
    case "status":
      return "text-white/40";
    case "label":
      return "text-white/20 text-[11px] tracking-[0.2em] font-light";
    case "bullet":
      return "text-white/80";
    case "meta":
      return "text-emerald-400/80";
    case "output":
      return "h-2";
    default:
      return "text-white/70";
  }
}
