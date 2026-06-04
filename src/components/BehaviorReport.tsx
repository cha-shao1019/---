/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  AlertOctagon, 
  Cpu, 
  Download, 
  Key, 
  Clock, 
  Network, 
  ListChecks, 
  FileCode,
  Compass,
  AlertTriangle
} from "lucide-react";
import { AnalysisResult } from "../types";

interface BehaviorReportProps {
  result: AnalysisResult | null;
  isScanning: boolean;
}

export default function BehaviorReport({ result, isScanning }: BehaviorReportProps) {
  if (isScanning) {
    return (
      <div className="bg-brand-surface border border-brand-border rounded p-6 h-[400px] flex flex-col justify-center items-center text-brand-text-secondary">
        <Activity size={24} className="animate-pulse text-brand-text-primary mb-3" />
        <span className="text-xs font-mono tracking-wider uppercase animate-pulse text-brand-text-primary">
          EXAMINING THREAT VECTORS & CONSTRUCTING SECURITY AUDIT REPORT...
        </span>
        <div className="w-48 bg-[#000] h-1.5 rounded-full overflow-hidden mt-4 border border-brand-border">
          <div className="h-full bg-brand-text-primary animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-brand-surface/40 border border-dashed border-brand-border rounded p-8 h-[400px] flex flex-col justify-center items-center text-brand-text-secondary text-center">
        <Cpu size={32} className="text-zinc-800 mb-3" />
        <p className="text-xs font-mono uppercase tracking-wider text-brand-text-primary">NO ACTIVE REPORT GENERATED</p>
        <p className="text-[11px] text-brand-text-secondary mt-1 font-mono max-w-xs leading-relaxed">
          SUBMIT A SUSPICIOUS ADDRESS TO ACTIVATE THREAT LANDSCAPE SCAN & 24 AUDIT CHECKS
        </p>
      </div>
    );
  }

  const { threatScore, verdict, category, mismatchedBrand, threatAnalysis, systemReport, sandboxConsoleLogs, safetyRecommendations } = result;

  // Gauge details helper
  const getScoreDetails = (score: number) => {
    if (score <= 20) {
      return {
        color: "text-brand-accent-safe border-brand-accent-safe/30 bg-brand-accent-safe/5",
        barColor: "bg-brand-accent-safe",
        label: "SAFE // LOW RISK",
        desc: "未偵測到任何關鍵釣魚指紋，域名信譽良好且無敏感欄位騙取特徵。"
      };
    } else if (score <= 55) {
      return {
        color: "text-brand-accent-caution border-brand-accent-caution/30 bg-brand-accent-caution/5",
        barColor: "bg-brand-accent-caution",
        label: "CAUTION // SUSPICIOUS",
        desc: "偵測到輕微的仿冒嫌疑或誘導用語。請仔細比對主域名，切勿遞交敏感密碼。"
      };
    } else if (score <= 85) {
      return {
        color: "text-brand-accent-danger border-brand-accent-danger/30 bg-brand-accent-danger/5",
        barColor: "bg-brand-accent-danger",
        label: "MALICIOUS // SEVERE RISK",
        desc: "多項釣魚規則匹配！網頁包含仿冒特定品牌的特徵、極高可能為釣魚或支付卡盜刷頁面。"
      };
    } else {
      return {
        color: "text-[#ff4b4b] border-[#ff4b4b]/30 bg-[#ff4b4b]/5",
        barColor: "bg-brand-accent-danger animate-pulse",
        label: "CRITICAL THREAT // FRAUD DOMAIN",
        desc: "沙盒核心偵測到誘騙一次性驗證密碼（OTP）、信用卡個資竊取、甚至是未知的腳本自動下載或木馬漏洞利用。"
      };
    }
  };

  const scoreDetails = getScoreDetails(threatScore);

  return (
    <div className="space-y-6">
      
      {/* Risk Metrics Card Layout */}
      <div className="bg-brand-surface border border-brand-border rounded p-5 md:p-6 shadow-sm relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between border-b border-brand-border pb-6">
          {/* Circular Gauge Representation */}
          <div className="flex items-center space-x-5">
            <div className="relative w-20 h-20 rounded-full border-2 border-brand-border flex flex-col justify-center items-center shadow-inner bg-[#000] flex-shrink-0">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle 
                  cx="38" 
                  cy="38" 
                  r="34" 
                  stroke={threatScore > 55 ? "#ff4b4b" : threatScore > 20 ? "#fbbf24" : "#34d399"} 
                  strokeWidth="3" 
                  fill="transparent" 
                  strokeDasharray="213"
                  strokeDashoffset={213 - (213 * Math.min(threatScore, 100)) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="text-2xl font-mono font-bold text-brand-text-primary">{threatScore}</span>
              <span className="text-[8px] text-brand-text-secondary uppercase tracking-[2px] mt-0.5">SCORE</span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border tracking-wider ${scoreDetails.color}`}>
                  {scoreDetails.label}
                </span>
                <span className="text-[10px] text-brand-text-secondary font-mono uppercase tracking-wider bg-[#000] border border-brand-border px-1.5 py-0.5 rounded">
                  {category}
                </span>
              </div>
              <p className="text-sm font-semibold text-brand-text-primary mt-2.5">
                {mismatchedBrand !== "None" ? `高度擬真仿造「${mismatchedBrand}」之不法連結。` : "非典型品牌防冒型網站，多具備新型投資詐騙或虛假抽獎活動特徵。"}
              </p>
              <p className="text-[11px] text-[#8a8a8e] mt-1.5 max-w-xl leading-relaxed">
                {scoreDetails.desc}
              </p>
            </div>
          </div>

          {/* Rules Match Stats Table */}
          <div className="flex-shrink-0 bg-[#000000] border border-brand-border rounded p-3.5 text-[10px] flex flex-col space-y-1.5 md:w-56 font-mono text-brand-text-secondary shadow-inner">
            <div className="flex justify-between border-b border-brand-border pb-1.5 mb-1 font-bold text-brand-text-primary uppercase tracking-wider">
              <span>AUDIT CHECKS</span>
              <span>VERDICT</span>
            </div>
            <div className="flex justify-between">
              <span>DOMAIN_CHAR_IMPER</span>
              <span className={threatScore > 20 ? "text-brand-accent-danger font-bold" : "text-brand-accent-safe"}>
                {threatScore > 20 ? "ALERT" : "OK"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>CREDENTIAL_SIPHON</span>
              <span className={threatScore > 50 ? "text-brand-accent-danger font-bold" : "text-brand-accent-safe"}>
                {threatScore > 50 ? "DETECTED" : "CLEAN"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>SOCIAL_COERCION</span>
              <span className={threatScore > 35 ? "text-brand-accent-caution font-bold" : "text-brand-accent-safe"}>
                {threatScore > 35 ? "FLAGGED" : "OK"}
              </span>
            </div>
          </div>
        </div>

        {/* Traditional Chinese detailed summaries of fraud vectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
          <div className="space-y-4">
            <div className="bg-[#000000]/50 rounded p-4 border border-brand-border text-xs">
              <span className="text-zinc-300 font-mono text-[10px] font-bold tracking-widest uppercase flex items-center mb-1.5">
                <Compass size={14} className="text-brand-text-primary mr-1.5 shrink-0" />
                域名特徵與註冊指標 (Domain Risk Profile)
              </span>
              <p className="text-brand-text-secondary leading-relaxed font-sans">{threatAnalysis.domainRisk}</p>
            </div>

            <div className="bg-[#000000]/50 rounded p-4 border border-brand-border text-xs">
              <span className="text-zinc-300 font-mono text-[10px] font-bold tracking-widest uppercase flex items-center mb-1.5">
                <Key size={14} className="text-brand-accent-danger mr-1.5 shrink-0" />
                敏感資料騙取行為 (Credential Harvesting)
              </span>
              <p className="text-brand-text-secondary leading-relaxed font-sans">{threatAnalysis.credentialHarvest}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#000000]/50 rounded p-4 border border-brand-border text-xs">
              <span className="text-zinc-300 font-mono text-[10px] font-bold tracking-widest uppercase flex items-center mb-1.5">
                <Clock size={14} className="text-brand-accent-caution mr-1.5 shrink-0" />
                心理操控急迫防線 (Psychological Coercion)
              </span>
              <p className="text-brand-text-secondary leading-relaxed font-sans">{threatAnalysis.urgencyManipulation}</p>
            </div>

            <div className="bg-[#000000]/50 rounded p-4 border border-brand-border text-xs">
              <span className="text-zinc-300 font-mono text-[10px] font-bold tracking-widest uppercase flex items-center mb-1.5">
                <FileCode size={14} className="text-brand-accent-safe mr-1.5 shrink-0" />
                防偽圖章侵權特徵 (Visual & Brand Imitation)
              </span>
              <p className="text-brand-text-secondary leading-relaxed font-sans">{threatAnalysis.unauthorizedMimicry}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Under-the-hood sandbox system logs & networks details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sandbox Console Logs timeline */}
        <div className="lg:col-span-2 bg-brand-surface border border-brand-border rounded p-5 shadow-sm flex flex-col h-[400px]">
          <div className="flex justify-between items-center border-b border-brand-border pb-3 mb-4 flex-shrink-0">
            <h4 className="text-xs font-mono font-bold text-brand-text-primary uppercase tracking-wider flex items-center space-x-2">
              <Activity size={16} className="text-brand-text-primary" />
              <span>ISOLATION CONSOLE EVENT TIMELINE</span>
            </h4>
            <span className="text-[9px] bg-[#000] text-brand-text-primary border border-brand-border px-2 py-0.5 rounded font-mono tracking-widest">
              SECURE_OUTPUT
            </span>
          </div>

          {/* Scrolling output log lines */}
          <div className="flex-1 overflow-y-auto font-mono text-xs text-brand-text-primary space-y-3 pr-2 scrollbar-thin">
            {sandboxConsoleLogs?.map((log, idx) => {
              const getLogTypeStyle = () => {
                switch (log.type) {
                  case "success": return "text-brand-accent-safe bg-brand-accent-safe/5 border-brand-accent-safe/10";
                  case "warning": return "text-brand-accent-caution bg-brand-accent-caution/5 border-brand-accent-caution/10";
                  case "danger": return "text-brand-accent-danger bg-brand-accent-danger/5 border-brand-accent-danger/10";
                  default: return "text-brand-text-secondary bg-[#000000] border-brand-border";
                }
              };

              return (
                <div key={idx} className={`p-2.5 rounded border flex items-start space-x-3 text-[11px] ${getLogTypeStyle()}`}>
                  <span className="text-zinc-600 font-bold shrink-0 select-none">[{log.time}]</span>
                  <p className="flex-1 leading-normal font-mono">{log.action}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hooked APIs endpoint destinations permissions & auto-downloads block block */}
        <div className="bg-brand-surface border border-brand-border rounded p-5 shadow-sm flex flex-col h-[400px]">
          <div className="border-b border-brand-border pb-3 mb-4 flex-shrink-0">
            <h4 className="text-xs font-mono font-bold text-brand-text-primary uppercase tracking-wider flex items-center space-x-2">
              <Network size={16} className="text-brand-accent-caution" />
              <span>TRAFFIC INSPECTOR</span>
            </h4>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto pr-1 scrollbar-thin text-xs font-mono">
            {/* Automatic download alert APK Payload */}
            <div className="p-3 bg-[#000000] border border-brand-border rounded space-y-2">
              <span className="text-zinc-400 font-bold tracking-wider text-[10px] uppercase flex items-center">
                <Download size={14} className="text-brand-accent-safe mr-1.5" />
                TROJAN DOWNLOAD AUDIT
              </span>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-brand-text-secondary">AUTO-DOWNLOAD APK:</span>
                {systemReport.apkPayloadDetected ? (
                  <span className="text-brand-accent-danger font-bold flex items-center">
                    <AlertOctagon size={12} className="mr-1 inline animate-pulse" />
                    BLOCKED
                  </span>
                ) : (
                  <span className="text-brand-accent-safe font-bold">CLEAN</span>
                )}
              </div>
              {systemReport.apkPayloadDetected && systemReport.apkPayloadName && (
                <div className="bg-brand-accent-danger/10 border border-brand-accent-danger/35 p-2 rounded text-[11px] text-brand-accent-danger font-mono flex flex-col space-y-1">
                  <span className="font-bold uppercase tracking-wider">Intercepted file:</span>
                  <span className="break-all">{systemReport.apkPayloadName}</span>
                </div>
              )}
            </div>

            {/* Stealer API backend endpoints */}
            <div className="space-y-1.5">
              <span className="text-zinc-400 font-bold tracking-wider text-[10px] uppercase flex items-center">
                <Network size={14} className="text-brand-accent-danger mr-1.5" />
                EXFILTRATION HOST SEEDS
              </span>
              <div className="bg-[#000000] border border-brand-border rounded p-2.5 space-y-1 font-mono text-[11px]">
                {systemReport.apiCallsDetected?.length > 0 ? (
                  systemReport.apiCallsDetected.map((api, idx) => (
                    <div key={idx} className="flex items-center space-x-1 text-brand-accent-danger overflow-x-auto truncate">
                      <span className="text-zinc-700">✦</span>
                      <span className="truncate">{api}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-zinc-600">ZERO OUTWARD APIS RECORDED</span>
                )}
              </div>
            </div>

            {/* Redirect chains hops */}
            <div className="space-y-1.5">
              <span className="text-zinc-400 font-bold tracking-wider text-[10px] uppercase flex items-center">
                <Compass size={14} className="text-brand-accent-caution mr-1.5" />
                REDIRECT HOPS CHAIN
              </span>
              <div className="bg-[#000000] border border-brand-border rounded p-2.5 font-mono text-[10px] space-y-1">
                {systemReport.redirectChain?.length > 0 ? (
                  systemReport.redirectChain.map((urlHop, idx) => (
                    <div key={idx} className="text-brand-text-secondary truncate flex items-center space-x-1">
                      <span className="text-zinc-650 font-bold shrink-0">#{idx + 1}:</span>
                      <span className="text-brand-text-primary truncate" title={urlHop}>{urlHop}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-zinc-600">NO REDIRECT HUBS</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety recommendations & action steps */}
      <div className="bg-brand-surface border border-brand-border rounded p-5 shadow-sm">
        <h4 className="text-xs font-mono font-bold text-brand-text-primary uppercase tracking-wider flex items-center space-x-2 mb-4 border-b border-brand-border pb-2.5">
          <ListChecks size={16} className="text-brand-accent-safe" />
          <span>防護指引與被騙自救流程 (Emergency Response Action Plan)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safetyRecommendations?.map((rec, idx) => (
            <div key={idx} className="flex items-start space-x-3 text-xs text-brand-text-primary bg-[#000000]/40 p-3.5 rounded border border-brand-border">
              <div className="w-5 h-5 rounded bg-brand-text-primary text-brand-bg flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="leading-relaxed font-sans text-brand-text-secondary">{rec}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
