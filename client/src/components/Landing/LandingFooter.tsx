import { Wallet } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-slate-800/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              MoneyLens.ai
            </span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-slate-500 text-sm">
              © 2025 MoneyLens.ai. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm">
              Vibe coded with ❤️ by{" "}
              <a
                href="https://github.com/alok722"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition-colors underline"
              >
                Alok Raj
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
