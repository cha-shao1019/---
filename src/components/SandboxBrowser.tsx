/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Globe, 
  Lock, 
  Unlock, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight, 
  HelpCircle,
  Eye,
  FileText,
  BadgeAlert,
  Terminal,
  ExternalLink,
  EyeOff
} from "lucide-react";
import { AnalysisResult } from "../types";

interface SandboxBrowserProps {
  result: AnalysisResult;
  isScanning: boolean;
  scanningUrl?: string;
}

export default function SandboxBrowser({ result, isScanning, scanningUrl }: SandboxBrowserProps) {
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"render" | "raw">("render");

  if (isScanning) {
    return (
      <div className="w-full bg-brand-surface border border-brand-border rounded-lg overflow-hidden shadow-sm h-[480px] flex flex-col justify-center items-center text-brand-text-primary p-8 relative">
        <div className="w-12 h-12 rounded-full border-2 border-brand-text-secondary/20 border-t-brand-text-primary animate-spin mb-6" />
        <h3 className="text-base font-serif font-bold italic tracking-tight mb-2">
          RECONSTRUCTING ENVIRONMENT...
        </h3>
        <p className="text-xs text-brand-text-secondary mb-4 max-w-sm text-center font-sans">
          分配隔離緩衝空間、防止特權特徵提取、阻斷自動 Cookie 偷竊與 HTTP 劫持...
        </p>
        <div className="bg-[#000000] rounded p-3.5 font-mono text-xs text-left w-full max-w-lg border border-brand-border text-brand-accent-safe flex items-center space-x-2">
          <Terminal size={14} className="animate-pulse flex-shrink-0" />
          <span className="truncate">ISOLATED_NODE_SPIN // RESOLVING HOST: {scanningUrl || result?.url || "AWAITING URL..."}</span>
        </div>
      </div>
    );
  }

  const { visualMockup, verdict, url, threatScore } = result;

  // Verdict style mapping
  const getVerdictStyle = () => {
    switch (verdict) {
      case "SAFE":
        return {
          bg: "bg-brand-accent-safe/10 border-brand-accent-safe/30 text-brand-accent-safe",
          icon: <ShieldCheck size={18} className="text-brand-accent-safe" />,
          label: "SECURE CONNECTION",
          lockIcon: <Lock size={14} className="text-brand-accent-safe" />,
          addressBg: "bg-brand-accent-safe/5",
          badgeBg: "bg-brand-accent-safe"
        };
      case "MILD_SUSPICION":
        return {
          bg: "bg-brand-accent-caution/10 border-brand-accent-caution/30 text-brand-accent-caution",
          icon: <AlertTriangle size={18} className="text-brand-accent-caution" />,
          label: "SUSPICIOUS VECTOR",
          lockIcon: <Unlock size={14} className="text-brand-accent-caution" />,
          addressBg: "bg-brand-accent-caution/5",
          badgeBg: "bg-brand-accent-caution"
        };
      case "MALICIOUS":
      case "CRITICAL_THREAT":
        return {
          bg: "bg-brand-accent-danger/10 border-brand-accent-danger/30 text-brand-accent-danger",
          icon: <ShieldAlert size={18} className="text-brand-accent-danger" />,
          label: verdict === "CRITICAL_THREAT" ? "CRITICAL PHISHING ACTION" : "MALICIOUS PAYLOAD",
          lockIcon: <Unlock size={14} className="text-brand-accent-danger animate-pulse" />,
          addressBg: "bg-brand-accent-danger/5",
          badgeBg: "bg-brand-accent-danger"
        };
      default:
        return {
          bg: "bg-[#222224]/10 border-brand-border text-brand-text-secondary",
          icon: <Shield size={18} className="text-brand-text-secondary" />,
          label: "UNKNOWN STATUS",
          lockIcon: <Lock size={14} className="text-brand-text-secondary" />,
          addressBg: "bg-brand-surface",
          badgeBg: "bg-brand-text-secondary"
        };
    }
  };

  const threatStyle = getVerdictStyle();

  return (
    <div className="w-full bg-brand-surface border border-brand-border rounded shadow-sm flex flex-col relative" id="sandbox-preview">
      {/* Chrome Window Header */}
      <div className="bg-[#000000] border-b border-brand-border px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
        
        {/* Nav Controls & URL Chrome Bar */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Windows Mac OS circles */}
          <div className="flex space-x-1.5 flex-shrink-0">
            <span className="w-3 h-3 rounded-full bg-brand-accent-danger/40 inline-block" />
            <span className="w-3 h-3 rounded-full bg-brand-accent-caution/40 inline-block" />
            <span className="w-3 h-3 rounded-full bg-brand-accent-safe/40 inline-block" />
          </div>

          <div className="flex space-x-1 items-center text-brand-text-secondary flex-shrink-0">
            <button className="p-1 hover:text-brand-text-primary transition-colors cursor-not-allowed">
              <ArrowLeft size={16} />
            </button>
            <button className="p-1 hover:text-brand-text-primary transition-colors cursor-not-allowed">
              <ArrowRight size={16} />
            </button>
            <button className="p-1 hover:text-brand-text-primary transition-colors">
              <RefreshCw size={12} />
            </button>
          </div>

          {/* Sizable chrome URL bar */}
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded border border-brand-border flex-1 min-w-0 ${threatStyle.addressBg}`}>
            {threatStyle.lockIcon}
            <span className="text-brand-text-primary text-xs truncate select-all flex-1 font-mono tracking-tight">
              {url}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-brand-text-secondary select-none mr-1.5 shrink-0 hidden md:inline">
              [AIRGAP_MODE]
            </span>
          </div>
        </div>

        {/* Live Indicator Action Switch Mode */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="flex bg-[#000000] rounded border border-brand-border p-0.5 text-xs text-brand-text-secondary">
            <button 
              onClick={() => setActiveTab("render")}
              className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1 text-[11px] uppercase tracking-wider font-mono font-bold ${
                activeTab === "render" 
                  ? "bg-brand-surface text-brand-text-primary" 
                  : "hover:text-brand-text-primary"
              }`}
            >
              <Eye size={13} />
              <span>RENDERED VIEW</span>
            </button>
            <button 
              onClick={() => setActiveTab("raw")}
              className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1 text-[11px] uppercase tracking-wider font-mono font-bold ${
                activeTab === "raw" 
                  ? "bg-brand-surface text-brand-text-primary" 
                  : "hover:text-brand-text-primary"
              }`}
            >
              <FileText size={13} />
              <span>RAW DATA</span>
            </button>
          </div>

          {activeTab === "render" && (
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`px-3 py-1.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border transition-all flex items-center space-x-1.5 ${
                showAnnotations 
                  ? "bg-brand-accent-danger/20 border-brand-accent-danger/50 text-brand-accent-danger hover:bg-brand-accent-danger/30" 
                  : "bg-[#000000] border-brand-border text-brand-text-secondary hover:bg-brand-surface"
              }`}
              title="切換安全標籤與釣魚偽造元件提醒"
            >
              {showAnnotations ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showAnnotations ? "HIDE CRITS" : "SHOW CRITS"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Sandbox Window Content */}
      <div className="flex-1 bg-[#000000] flex flex-col min-h-[460px] max-h-[560px] overflow-y-auto relative scrollbar-thin">
        
        {/* Render View */}
        {activeTab === "render" && (
          <div 
            className="flex-1 py-12 px-4 md:px-8 flex flex-col justify-center items-center transition-all duration-300 relative"
            style={{ backgroundColor: `${visualMockup.backgroundColor}25` }}
          >
            {/* Real threat overlay message top */}
            {showAnnotations && (verdict === "MALICIOUS" || verdict === "CRITICAL_THREAT") && (
              <div className="absolute top-4 left-4 right-4 bg-brand-surface border border-brand-accent-danger/70 text-brand-text-primary text-xs px-4 py-3 rounded shadow-xl flex items-start space-x-3 z-30 font-sans backdrop-blur-md">
                <BadgeAlert size={18} className="text-brand-accent-danger mt-0.5 flex-shrink-0 animate-pulse" />
                <div>
                  <span className="font-bold block tracking-wider uppercase text-brand-accent-danger text-[11px] font-mono mb-0.5">ISOLATED SANDBOX ACTIVE: USER INPUT RESTRICTED</span>
                  <p className="text-brand-text-secondary leading-relaxed text-[11px]">本畫面為安全重構之靜態擬真網頁（非直接跳轉危險網址），您可以安全地把滑鼠移到各區域，檢視其如何佈置釣魚陷阱。</p>
                </div>
              </div>
            )}

            {/* Simulated Webpage Core Container */}
            <div className="w-full max-w-lg bg-zinc-950 rounded shadow-2xl p-6 text-zinc-200 border border-brand-border relative overflow-hidden transition-all duration-200">
              
              {/* Fake Secure Padlock Decoration inside the UI designed to deceive */}
              <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-5 font-mono text-[10px]">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded bg-brand-accent-safe/15 text-brand-accent-safe flex items-center justify-center">
                    <ShieldCheck size={12} />
                  </div>
                  <span className="font-bold tracking-widest text-brand-accent-safe uppercase">
                    {visualMockup.brandName || "SECURE_CONNECTION_CONFIRMED"}
                  </span>
                </div>
                <div className="text-brand-text-secondary bg-[#000] border border-brand-border px-2 py-0.5 rounded">
                  PROXY // DISCONNECTED
                </div>
              </div>

              {/* Title Mimicry */}
              <h4 className="text-lg font-bold text-brand-text-primary tracking-tight text-center mb-1">
                {visualMockup.titleText}
              </h4>
              <p className="text-xs text-brand-text-secondary text-center mb-6">
                {visualMockup.subText}
              </p>

              {/* Recreated Visual Forms Elements */}
              <div className="space-y-4">
                {visualMockup.elements?.map((el, idx) => {
                  const elementId = `mock_el_${idx}`;
                  const isHovered = hoveredElement === elementId;
                  
                  const borderClass = showAnnotations && el.hazardSeverity !== "none"
                    ? el.hazardSeverity === "critical"
                      ? "border-brand-accent-danger/70 ring-1 ring-brand-accent-danger/30 relative"
                      : "border-brand-accent-caution/70 ring-1 ring-brand-accent-caution/30 relative"
                    : "border-brand-border";

                  return (
                    <div 
                      key={elementId}
                      className="relative group transition-all"
                      onMouseEnter={() => setHoveredElement(elementId)}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      {/* Highlight annotations marker badge */}
                      {showAnnotations && el.hazardSeverity !== "none" && (
                        <div className="absolute right-2 -top-2 z-20 flex space-x-1">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase text-white shadow-sm flex items-center ${
                            el.hazardSeverity === "critical" ? "bg-brand-accent-danger" : "bg-brand-accent-caution text-black"
                          }`}>
                            <AlertTriangle size={8} className="mr-0.5 inline" />
                            {el.hazardSeverity === "critical" ? "CRIT RISK" : "BRAND MISMATCH"}
                          </span>
                        </div>
                      )}

                      {/* Render relative to Type */}
                      {el.type === "logo" && (
                        <div className="flex justify-center p-3 mb-2">
                          <div className={`p-4 border rounded ${borderClass} bg-[#000] text-center text-xs font-semibold flex flex-col items-center max-w-xs`}>
                            <Globe size={20} className="text-brand-text-secondary mb-2" />
                            <span className="text-brand-text-primary font-mono tracking-wider">{el.label}</span>
                            <span className="text-[10px] text-brand-text-secondary font-normal mt-1">{el.value}</span>
                          </div>
                        </div>
                      )}

                      {(el.type === "input" || el.type === "form_field") && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-widest block">
                            {el.label}
                          </label>
                          <div className={`relative flex items-center rounded border ${borderClass} overflow-hidden bg-[#000] p-2 text-xs`}>
                            <input 
                              type="text" 
                              disabled 
                              placeholder={el.placeholder || "模擬隔離：禁止在此傳輸實體鍵盤紀錄..."}
                              className="bg-transparent outline-none w-full text-brand-text-primary placeholder-zinc-800 text-xs font-mono pr-12 cursor-not-allowed"
                            />
                            {el.hazardSeverity !== "none" && showAnnotations && (
                              <HelpCircle size={14} className="text-brand-accent-caution absolute right-3 shrink-0" />
                            )}
                          </div>
                        </div>
                      )}

                      {el.type === "button" && (
                        <button 
                          disabled
                          className={`w-full py-3 px-4 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all shadow flex items-center justify-center space-x-2 cursor-not-allowed mt-4 ${
                            el.hazardSeverity === "critical" 
                              ? "bg-brand-accent-danger text-white border border-brand-accent-danger" 
                              : "bg-brand-text-primary text-brand-bg border border-brand-text-primary"
                          } ${borderClass}`}
                        >
                          <span>{el.label || el.value || "CONFIRM"}</span>
                          <Lock size={12} className="opacity-60" />
                        </button>
                      )}

                      {el.type === "text" && (
                        <div className={`p-3 rounded border text-xs text-brand-text-secondary leading-relaxed bg-[#000] ${borderClass}`}>
                          {el.label}: {el.value}
                        </div>
                      )}

                      {el.type === "warning_overlay" && (
                        <div className={`p-4 rounded border border-brand-accent-danger/40 text-brand-accent-danger bg-brand-accent-danger/5 mb-4 text-xs font-sans space-y-1 ${borderClass}`}>
                          <div className="font-bold flex items-center text-[10px] font-mono uppercase tracking-widest">
                            <AlertTriangle size={14} className="mr-1.5 text-brand-accent-danger shrink-0" />
                            <span>{el.label}</span>
                          </div>
                          <p className="text-brand-text-primary/90 text-xs">{el.value}</p>
                        </div>
                      )}

                      {/* Floating tooltip callout for elements */}
                      {showAnnotations && isHovered && el.riskLabel && (
                        <div className="absolute left-1/2 -translate-x-1/2 -top-24 md:-top-20 z-40 bg-brand-surface text-brand-text-primary rounded p-3.5 shadow-xl text-xs w-64 border border-brand-border leading-relaxed font-mono">
                          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-brand-surface border-r border-b border-brand-border rotate-45" />
                          <div className="flex items-center text-brand-accent-danger font-bold mb-1 uppercase tracking-wider text-[10px]">
                            <BadgeAlert size={12} className="mr-1.5" />
                            <span>SANDBOX INDICATOR:</span>
                          </div>
                          <span className="text-zinc-300 text-[11px] font-sans block mt-1">{el.riskLabel}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Fake padlock assurance text designed to cheat user */}
              <div className="mt-8 pt-5 border-t border-brand-border flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                <div className="flex items-center space-x-1 uppercase">
                  <Lock size={10} className="text-zinc-650" />
                  <span>256-Bit SSL ENCRYPTED TRANSMISSION</span>
                </div>
                <span>© 2026 GENERAL PROTECT. ALL RIGHTS RESERVED</span>
              </div>
            </div>

            {/* Sandbox details marker box labels */}
            {showAnnotations && (
              <div className="mt-6 bg-[#000000] border border-brand-border rounded p-3.5 text-[10px] text-brand-text-secondary space-y-1.5 max-w-sm w-full font-mono">
                <div className="flex items-center text-brand-accent-safe font-bold border-b border-brand-border pb-1 mb-1 uppercase tracking-widest">
                  <Terminal size={12} className="mr-1.5" />
                  <span>ANALYSIS NOTES</span>
                </div>
                <div>✦ LAY_SCHEMATIC: RESTORED 100% SUCCESS</div>
                <div>✦ ACTIVE RE-REDIRECT STRATEGY: BLOCK_ALL</div>
                <div>✦ HOVER TO INTERROGATE FORM INTEGRITY</div>
              </div>
            )}
          </div>
        )}

        {/* Raw Probe Tab */}
        {activeTab === "raw" && (
          <div className="flex-1 p-6 md:p-8 font-mono text-xs text-brand-accent-safe space-y-6">
            <div>
              <span className="text-brand-accent-caution block mb-1 uppercase tracking-widest font-bold"># ACTIVE AIRGAP INSULATION PROFILE</span>
              <p className="text-brand-text-secondary font-sans text-xs leading-relaxed">
                當前瀏覽器正與遠端原伺服器保持安全的無狀態網誌代理，防範所有 XSS、黑屏網頁劫持及惡意腳本對本機系統實體讀取之安全威脅。
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="text-brand-accent-caution block border-b border-brand-border pb-1 uppercase tracking-widest font-bold"># HTTP PROBE SPECIFICATIONS</span>
              <div>
                <span className="text-brand-text-secondary">TARGET URL:</span> <span className="text-brand-text-primary">{url}</span>
              </div>
              <div>
                <span className="text-brand-text-secondary">IS REACHABLE:</span>{" "}
                <span className={result.isReachable ? "text-brand-accent-safe font-bold" : "text-brand-accent-danger font-bold"}>
                  {result.isReachable ? "YES // 200 OK" : "NO // OFFLINE OR Sinkhole"}
                </span>
              </div>
              <div>
                <span className="text-brand-text-secondary">THREAT CLOUDO score:</span>{" "}
                <span className="text-brand-accent-danger font-bold">CRIT SCORE: {threatScore}/100 | {verdict}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-brand-accent-caution block border-b border-brand-border pb-1 uppercase tracking-widest font-bold"># DOM SNIP SCRAPE</span>
              <div className="bg-[#000000] border border-brand-border rounded p-3 text-brand-text-primary overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all text-[11px]">
                {result.isReachable ? (
                  `網頁標題: ${result.visualMockup.titleText}\n重構模擬品牌: ${result.visualMockup.brandName}\n疑似遭偽裝品牌: ${result.mismatchedBrand}\n\n探針擷取記錄:\n${result.summary}`
                ) : (
                  "【網址無法解析】\n此網站可能已在您瀏覽前遭警政單位/頂級網域服務商下架(DNS Sinkhole)或轉移，或者網站設置了嚴格的網際代理黑名單。\n本沙盒使用 AI 啟發式威脅模型進行完整分析，為您重建其潛在的詐騙佈局與系統邏輯。"
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Frame Status Footer */}
      <div className="bg-[#000000] border-t border-brand-border px-4 py-3 flex items-center justify-between text-[10px] text-brand-text-secondary flex-shrink-0 font-mono tracking-wider">
        <div className="flex items-center space-x-2">
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-brand-accent-safe animate-pulse" />
          <span>PROXY STATUS: FULL AIRGAP INSULATION DISCONNECTED_NET</span>
        </div>
        <div className="hidden sm:flex items-center">
          <span>ENGINE VERSION: V2.14-STABLE</span>
        </div>
      </div>
    </div>
  );
}
