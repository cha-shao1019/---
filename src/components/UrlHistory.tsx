/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  History, 
  Search, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Flame, 
  X,
  FileCheck
} from "lucide-react";
import { AnalysisResult } from "../types";

interface UrlHistoryProps {
  historyList: AnalysisResult[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClearAll: () => void;
}

type VerdictFilter = "ALL" | "SAFE" | "SUSPICIOUS" | "MALICIOUS";

export default function UrlHistory({ historyList, selectedId, onSelect, onClearAll }: UrlHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>("ALL");

  // Filtering logic
  const filteredList = historyList.filter((item) => {
    // Search match
    const matchesSearch = item.url.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.mismatchedBrand || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter match
    if (verdictFilter === "ALL") return matchesSearch;
    if (verdictFilter === "SAFE") return matchesSearch && item.verdict === "SAFE";
    if (verdictFilter === "SUSPICIOUS") return matchesSearch && item.verdict === "MILD_SUSPICION";
    if (verdictFilter === "MALICIOUS") return matchesSearch && (item.verdict === "MALICIOUS" || item.verdict === "CRITICAL_THREAT");
    
    return matchesSearch;
  });

  const getVerdictBadge = (verdict: string, score: number) => {
    switch (verdict) {
      case "SAFE":
        return (
          <span className="flex items-center space-x-1 text-[9px] px-1.5 py-0.5 rounded bg-brand-accent-safe/10 text-brand-accent-safe font-mono font-bold border border-brand-accent-safe/25 uppercase tracking-wider">
            <ShieldCheck size={9} />
            <span>SAFE ({score})</span>
          </span>
        );
      case "MILD_SUSPICION":
        return (
          <span className="flex items-center space-x-1 text-[9px] px-1.5 py-0.5 rounded bg-brand-accent-caution/10 text-brand-accent-caution font-mono font-bold border border-brand-accent-caution/25 uppercase tracking-wider">
            <AlertTriangle size={9} />
            <span>SUSP ({score})</span>
          </span>
        );
      case "MALICIOUS":
      case "CRITICAL_THREAT":
        return (
          <span className="flex items-center space-x-1 text-[9px] px-1.5 py-0.5 rounded bg-brand-accent-danger/10 text-brand-accent-danger font-mono font-bold border border-brand-accent-danger/25 uppercase tracking-wider animate-pulse">
            <ShieldAlert size={9} />
            <span>CRIT ({score})</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-brand-surface border border-brand-border rounded overflow-hidden flex flex-col h-[520px] shadow-sm">
      {/* Header */}
      <div className="bg-[#000000] px-4 py-3 border-b border-brand-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <History size={14} className="text-brand-text-primary" />
          <span className="text-[10px] font-mono font-bold text-brand-text-primary tracking-widest uppercase">AIRGAP_URL_LOGS</span>
        </div>
        {historyList.length > 0 && (
          <button 
            onClick={onClearAll}
            className="text-brand-text-secondary hover:text-brand-accent-danger transition-colors p-1 rounded hover:bg-brand-surface cursor-pointer"
            title="清除所有歷史分析軌跡"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Main filter controls */}
      <div className="p-3 bg-[#000000]/40 border-b border-brand-border/85 space-y-2.5 flex-shrink-0">
        <div className="relative flex items-center bg-[#000000] rounded border border-brand-border px-2 text-xs">
          <Search size={14} className="text-zinc-650 shrink-0" />
          <input 
            type="text" 
            placeholder="搜尋網址或偽造品牌..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 outline-none w-full p-2 text-xs text-brand-text-primary placeholder-zinc-700 font-mono"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-brand-text-secondary hover:text-brand-text-primary cursor-pointer p-0.5">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filters pills row */}
        <div className="flex flex-wrap gap-1 text-[10px] text-brand-text-secondary font-mono pt-1">
          {(["ALL", "SAFE", "SUSPICIOUS", "MALICIOUS"] as VerdictFilter[]).map((filter) => {
            const getFilterLabel = () => {
              if (filter === "ALL") return `ALL [${historyList.length}]`;
              if (filter === "SAFE") return `SAFE [${historyList.filter(h => h.verdict === "SAFE").length}]`;
              if (filter === "SUSPICIOUS") return `SUSP [${historyList.filter(h => h.verdict === "MILD_SUSPICION").length}]`;
              if (filter === "MALICIOUS") return `CRIT [${historyList.filter(h => h.verdict === "MALICIOUS" || h.verdict === "CRITICAL_THREAT").length}]`;
              return filter;
            };

            const isSelected = verdictFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setVerdictFilter(filter)}
                className={`px-2 py-1.5 rounded transition-all cursor-pointer font-bold uppercase text-[9px] tracking-wider ${
                  isSelected 
                    ? "bg-brand-text-primary text-brand-bg font-bold" 
                    : "bg-[#000000] border border-brand-border text-brand-text-secondary hover:text-brand-text-primary hover:border-brand-text-secondary"
                }`}
              >
                {getFilterLabel()}
              </button>
            );
          })}
        </div>
      </div>

      {/* History List Scrolling Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-track-[#000000] scrollbar-thumb-brand-border">
        {filteredList.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-brand-text-secondary text-center p-4">
            <FileCheck size={28} className="text-zinc-850 mb-2" />
            <p className="text-[10px] font-mono uppercase tracking-wider text-brand-text-primary">NO HISTORY ENTRIES FOUND</p>
            <p className="text-[9px] text-brand-text-secondary mt-1 font-mono leading-relaxed max-w-[160px]">INPUT A URL PATH ABOVE TO SPAWN A SECURE DESERIALIZED BUFFER</p>
          </div>
        ) : (
          filteredList.map((item) => {
            const isSelected = item.id === selectedId;
            const hasMimic = item.mismatchedBrand && item.mismatchedBrand !== "None";

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`p-2.5 rounded border transition-all cursor-pointer select-none text-left flex flex-col space-y-1.5 ${
                  isSelected 
                    ? "bg-[#000000] border-brand-text-primary shadow-sm" 
                    : "bg-[#000000]/25 border-brand-border hover:bg-brand-surface/80 hover:border-brand-text-secondary"
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[11px] text-brand-text-primary font-mono truncate flex-1 block">
                    {item.url}
                  </span>
                  {getVerdictBadge(item.verdict, item.threatScore)}
                </div>

                <div className="flex justify-between items-center text-[9px] text-brand-text-secondary font-mono tracking-wider select-none">
                  <span className="truncate uppercase font-bold text-zinc-400">
                    {hasMimic ? `MIMIC: ${item.mismatchedBrand}` : item.category}
                  </span>
                  <span>
                    {new Date(item.timestamp).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer warning indicators */}
      <div className="bg-[#000000] p-3.5 border-t border-brand-border text-[9px] text-brand-text-secondary flex items-center justify-between font-mono tracking-widest uppercase flex-shrink-0">
        <span>GATEWAY_DB: SECURE_SYNC</span>
        <div className="flex items-center text-brand-accent-danger font-bold space-x-1">
          <Flame size={12} className="animate-pulse" />
          <span>WAF_ENGAGE</span>
        </div>
      </div>
    </div>
  );
}
