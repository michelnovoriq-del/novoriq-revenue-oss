"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-obsidian text-slate-300 font-mono flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(to_right,#1a3a2f_1px,transparent_1px),linear-gradient(to_bottom,#1a3a2f_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl bg-jade-deep/70 border border-jade-line p-6 md:p-8"
      >
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-jade-muted" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-jade-muted" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-jade-muted" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-jade-muted" />

        <div className="flex items-center gap-3 border-b border-jade-line pb-4 mb-5">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h1 className="text-sm text-white font-bold tracking-[0.2em] uppercase">
            Runtime_Fault
          </h1>
        </div>

        <p className="text-[11px] text-jade-muted uppercase tracking-widest leading-relaxed">
          The interface caught an unexpected client fault and protected the
          session from a blank-screen failure.
        </p>

        <div className="mt-5 bg-obsidian/60 border border-jade-line p-4 overflow-hidden">
          <p className="text-[10px] text-red-500 uppercase tracking-widest break-words">
            {error.digest ? `Trace_ID: ${error.digest}` : "Trace_ID: Client_Render_Exception"}
          </p>
        </div>

        <button
          type="button"
          onClick={reset}
          className="mt-6 w-full border border-jade-muted text-jade-muted hover:bg-jade-muted hover:text-obsidian py-3 text-[10px] tracking-[0.3em] font-bold uppercase transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reboot_Interface
        </button>
      </motion.div>
    </div>
  );
}
