"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

const TERMINAL_LINES = [
  { type: "command", text: "$ distiller summarize --topic ai" },
  { type: "status", text: "→ Fetching articles from NewsAPI..." },
  { type: "status", text: "→ Building RAG context (3 snippets retrieved)" },
  { type: "status", text: "→ Routing to balanced tier (nvidia/llama-3.3-nemotron-super-49b)" },
  { type: "output", text: "" },
  { type: "label", text: "── AI Summary ──────────────────────────────" },
  { type: "bullet", text: "• Models above 70B parameters demonstrate chain-of-thought reasoning" },
  { type: "bullet", text: "• Scaling laws predict 2x improvement with 4x compute budget" },
  { type: "bullet", text: "• Capability emergence is consistent across architecture families" },
  { type: "output", text: "" },
  { type: "meta", text: "✓ 3 bullets · 94% confidence · 1.2s · grounded in 3 snippets" },
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
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto mt-10 max-w-2xl"
    >
      {/* Glow effect behind terminal */}
      <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-xl" />
      
      {/* Terminal window */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-soft backdrop-blur">
        {/* Terminal header */}
        <div className="flex items-center gap-2 border-b border-border/40 bg-muted/30 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-2 text-xs font-medium text-muted-foreground">distiller — ai summarize</span>
        </div>

        {/* Terminal body */}
        <div
          ref={terminalRef}
          className="max-h-80 overflow-y-auto p-4 font-mono text-sm leading-relaxed"
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
              <span className="inline-block h-4 w-2 animate-pulse bg-primary" />
            </div>
          )}

          {/* Cursor at end when complete */}
          {isComplete && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>$</span>
              <span className="inline-block h-4 w-2 animate-pulse bg-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        className="absolute -bottom-3 -right-3 flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-soft"
      >
        <Sparkles className="h-3 w-3 text-primary" />
        Powered by NVIDIA Build
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
      return "text-muted-foreground";
    case "label":
      return "text-muted-foreground/60 text-xs tracking-wider";
    case "bullet":
      return "text-foreground";
    case "meta":
      return "text-emerald-500 dark:text-emerald-400";
    case "output":
      return "";
    default:
      return "text-foreground";
  }
}
