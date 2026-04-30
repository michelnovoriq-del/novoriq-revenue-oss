"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-obsidian text-slate-300 font-mono flex items-center justify-center p-4 overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(to_right,#1a3a2f_1px,transparent_1px),linear-gradient(to_bottom,#1a3a2f_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-xl bg-jade-deep/70 border border-jade-line p-6 md:p-8"
          >
            <div className="flex items-center gap-3 border-b border-jade-line pb-4 mb-5">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h1 className="text-sm text-white font-bold tracking-[0.2em] uppercase">
                Core_Interface_Fault
              </h1>
            </div>

            <p className="text-[11px] text-jade-muted uppercase tracking-widest leading-relaxed">
              Revenue_OS intercepted a root-level render failure. Restart the
              interface shell to retry the session.
            </p>

            <div className="mt-5 bg-obsidian/60 border border-jade-line p-4 overflow-hidden">
              <p className="text-[10px] text-red-500 uppercase tracking-widest break-words">
                {error.digest ? `Trace_ID: ${error.digest}` : "Trace_ID: Root_Render_Exception"}
              </p>
            </div>

            <button
              type="button"
              onClick={reset}
              className="mt-6 w-full border border-jade-muted text-jade-muted hover:bg-jade-muted hover:text-obsidian py-3 text-[10px] tracking-[0.3em] font-bold uppercase transition-all"
            >
              Reboot_Core
            </button>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
