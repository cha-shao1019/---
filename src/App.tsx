/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Globe, 
  Flame, 
  Terminal, 
  Layers, 
  Cpu, 
  HelpCircle, 
  Search, 
  Eye, 
  FileText, 
  MessageSquareWarning,
  BadgeAlert,
  BookOpen,
  X
} from "lucide-react";
import { AnalysisResult } from "./types";
import SandboxBrowser from "./components/SandboxBrowser";
import BehaviorReport from "./components/BehaviorReport";
import UrlHistory from "./components/UrlHistory";

// Pre-seeded Taiwan-frequent Scam Templates for instant preview & demonstration
const PRESEEDED_TEMPLATES: AnalysisResult[] = [
  {
    id: "scan_line_verification",
    url: "https://line-pay-login-security.tw.cc/auth/verification",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hr ago
    isReachable: true,
    threatScore: 94,
    verdict: "CRITICAL_THREAT",
    category: "Account Impersonation",
    mismatchedBrand: "LINE PAY",
    summary: "本釣魚網站借用 LINE Pay 官方經典綠色配色與標準登入布局，謊稱系統升級，強逼用戶重新鍵入電話、LINE App 安全密碼。沙盒安全代理於背景捕捉到該網頁含有向未知的第三國非法 IP 伺服器提交機敏資料的 API 反跳轉腳本，經核心自動偵測並全面封殺。",
    threatAnalysis: {
      domainRisk: "域名結構仿效 LINE Pay 生態圈，但使用不信任之託管頂級域名 '.cc'，且無正當 CDN TLS 憑證註冊跡象。",
      credentialHarvest: "強制表單收集 用戶手機號碼、LINE 註冊密碼 與 OTP 驗證簡訊。此資訊一旦流出，帳號會即刻遭盜用併發大規模投資詐騙、點數洗錢群發信。",
      urgencyManipulation: "利用「若未在 5 分鐘內進行安全綁定核實，本機支付功能將遭受自動停用限制」等威脅，施加心理壓力。",
      unauthorizedMimicry: "100% 剽竊 LINE Pay 外觀及 SVG 防偽標章，企圖瞞天過海。"
    },
    systemReport: {
      apiCallsDetected: [
        "https://telemetry-collect-line-stolen.xyz/v2/cookie_stealer.php",
        "https://telemetry-collect-line-stolen.xyz/auth/save"
      ],
      redirectChain: [
        "https://bit.ly/line-restore-sec",
        "https://line-pay-login-security.tw.cc/auth/verification"
      ],
      permissionsRequested: ["notification"],
      apkPayloadDetected: false,
      apkPayloadName: null
    },
    sandboxConsoleLogs: [
      { id: "sl_1", time: "+0.1s", action: "沙盒安全瀏覽器代理分配 IP 10.42.128.40 並建立隔離緩衝...", type: "info" },
      { id: "sl_2", time: "+0.3s", action: "域名信譽(URL Reputation)比對：偵測到偽裝 LINE PAY 指紋常模。", type: "danger" },
      { id: "sl_3", time: "+0.6s", action: "阻斷 cookie/localStorage 主動提取呼叫，防止 Session Hijacking 劫持。", type: "success" },
      { id: "sl_4", time: "+1.2s", action: "攔截跨站指令：阻截蒐集鍵盤軌跡與貼上板竊密行為。", type: "warning" },
      { id: "sl_5", time: "+1.9s", action: "重構畫面布局完畢，成功捕獲惡意 API 連線位址並全面封鎖。", type: "success" }
    ],
    visualMockup: {
      backgroundColor: "#00c300",
      textColor: "#ffffff",
      brandName: "LINE Pay 綠界安全支付中心",
      titleText: "安全帳號環境檢測認證",
      subText: "請依步驟核對您的 LINE Pay 身分，逾時將限制其轉帳交易",
      elements: [
        { id: "line_logo", type: "logo", label: "LINE Pay 官方假認證圖案", value: "仿冒標誌", riskLabel: "不法分子直接盜用 LINE 綠色盾牌 UI 素材以騙取信任。", hazardSeverity: "high" },
        { id: "line_phone", type: "input", label: "請輸入您的 LINE 綁定手機號碼", value: "", placeholder: "e.g. 0912345678", riskLabel: "收集手機號碼做為劫持第一步，後續會發送高額驗證請求簡訊。", hazardSeverity: "critical" },
        { id: "line_pwd", type: "input", label: "輸入 LINE 特殊登入密碼", value: "", placeholder: "輸入您的保護密碼", riskLabel: "登入個人防禦密碼！一旦遞交，詐騙端會在另一虛擬端立刻登錄您的真實 LINE 並向好友發送假投資訊息。", hazardSeverity: "critical" },
        { id: "line_submit", type: "button", label: "確認更新身分綁定 (隔離中)", value: "確認更新", riskLabel: "點擊後會向黑客伺服器提交 credentials 攔截點。", hazardSeverity: "critical" }
      ]
    },
    safetyRecommendations: [
      "切勿在非 line.me 主網域下輸入任何登錄與認證密碼。",
      "若已不慎輸入，請即刻至真實 LINE App 中重設密碼，並於隱私安全中「關閉允許自其他設備登入」功能。",
      "向 165 反詐騙系統或 Line 官方客服舉報此惡意 TLD 機構。"
    ]
  },
  {
    id: "scan_cathay_phishing",
    url: "https://cathaybk-net-verification-audit.top/index",
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hrs ago
    isReachable: false,
    threatScore: 89,
    verdict: "MALICIOUS",
    category: "Phishing Card",
    mismatchedBrand: "國泰世華銀行網銀",
    summary: "利用國泰世華『密碼超時未修正』與『網路銀行帳戶監護系統警示』的急迫騙局，要求用戶鍵入網銀身分證字號、使用者代號、登入密碼以及 OTP 安全驗證碼。本站沙盒探針雖然解析出該網際主機已被政府機構或警政封阻（DNS Sinkhole 下架狀態），但 AI 防禦模型仍全面解構其惡意要素，預警防制。",
    threatAnalysis: {
      domainRisk: "典型的海外託管主機域名 '.top'，非金管會與經濟部規範之合法商業機構 '.com.tw' 級網域。",
      credentialHarvest: "專門假藉登入失敗騙取 網銀使用者代號、個人密碼，甚至在背景發起轉帳，要求您寫入即時收款之「OTP 簡訊驗證碼」。",
      urgencyManipulation: "謊稱「因未能檢附金融安全聲明書，您的存款扣款服務將於明日午夜強制暫停」觸發集體恐慌心理。",
      unauthorizedMimicry: "盜用國泰世華銀行代表性的金綠色企業配色、字體與安全防護圖章。"
    },
    systemReport: {
      apiCallsDetected: [
        "https://cathaybk-net-verification-audit.top/api/steal/save_credentials",
        "https://cathaybk-net-verification-audit.top/api/steal/request_otp"
      ],
      redirectChain: [
        "https://cathaybk-net-verification-audit.top/index"
      ],
      permissionsRequested: [],
      apkPayloadDetected: false,
      apkPayloadName: null
    },
    sandboxConsoleLogs: [
      { id: "sc_1", time: "+0.1s", action: "發送背景探針分析協定... 連線逾時，判定此網址已被警方通報或已被 ISP 網際域名防護阻斷 (DNS Sinkhole)。", type: "warning" },
      { id: "sc_2", time: "+0.3s", action: "啟動 AIHeuristic 啟發式特徵推演引擎... 依 URL 字謎段落比對 182 項欺詐特徵。", type: "info" },
      { id: "sc_3", time: "+0.8s", action: "匹配到網銀釣魚(e-Banking Impersonation)規則庫，重構該網域惡意行為。", type: "danger" }
    ],
    visualMockup: {
      backgroundColor: "#015435",
      textColor: "#ffffff",
      brandName: "國泰世華網路個人銀行 擬真隔離區",
      titleText: "數位帳戶異常更新機制",
      subText: "請核對個人網路銀行重要憑證以重啟您的合約",
      elements: [
        { id: "ct_id", type: "input", label: "身分證字號 (ID Number)", value: "", placeholder: "e.g. A123456789", riskLabel: "本欄用於蒐集完整的個人 ID。金融機構並無強行要求重複檢驗 ID 的流程。", hazardSeverity: "high" },
        { id: "ct_username", type: "input", label: "網銀 使用者代號", value: "", placeholder: "輸入您的使用者別名", riskLabel: "網銀帳戶最重要的身分辨識一環，與密碼搭配即可完成第三方交易登錄。", hazardSeverity: "critical" },
        { id: "ct_pwd", type: "input", label: "網銀 使用者密碼", value: "", placeholder: "請輸入原網銀密碼", riskLabel: "核心登入密碼，嚴禁在外站提供。", hazardSeverity: "critical" },
        { id: "ct_otp", type: "input", label: "簡訊變更檢驗 OTP (非常危險)", value: "", placeholder: "e.g. 1 2 3 4 5 6", riskLabel: "防線的最後底牌！黑客此時在真實官網進行非授權轉帳或重設，若您在此填入 OTP，則銀行內存款會瞬間被劃走移轉！", hazardSeverity: "critical" },
        { id: "ct_btn", type: "button", label: "確認登入並恢復服務", value: "確認安全變更", riskLabel: "點擊後完成詐騙端密碼劫持流程。", hazardSeverity: "critical" }
      ]
    },
    safetyRecommendations: [
      "請使用官方「國泰世華 CUBE App」進行一切操作，網銀網址必定以 'cathaybk.com.tw' 結尾。",
      "銀行客服絕對不會發送任何附帶網址、要求登入解鎖或提供驗證簡訊的 SMS 文字訊息。",
      "若帳戶已登錄，請務必第一時間聯繫銀行人工客服進行網銀臨時止付凍結，並向警局備案。"
    ]
  },
  {
    id: "scan_post_scam",
    url: "https://taiwan-post-office-mail.top/tax-resend/parcel",
    timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hrs ago
    isReachable: true,
    threatScore: 92,
    verdict: "CRITICAL_THREAT",
    category: "Fake Shopping",
    mismatchedBrand: "中華郵政郵務通知",
    summary: "利用近期大量的「包裹配送失敗、需補付特許手續關稅 NT$ 82 元」手法，吸引民眾輸入信用卡卡號、有效期、以及極度敏感的 CCV 信用卡安全碼。安全沙盒於連線通連階段深度檢測，捕獲其底層隱含向海外高危信用卡欺詐扣款網關發起 API 惡意登錄之腳本。",
    threatAnalysis: {
      domainRisk: "該網頁將自己套在 '.top' 下。中華郵政官網正確註冊網域應為 '.post.gov.tw' 國營政務專用後綴。",
      credentialHarvest: "對準 信用卡卡號 (PAN)、有效期、卡片安全驗證碼 (CVV2) 進行 3D Secure 高強度持卡個資刷卡扣款。",
      urgencyManipulation: "施展常見欺詐手段：「若不在 24 小時內補齊配送關稅，您的包裹將會被自動退還海外原發件人且退款不發予」。",
      unauthorizedMimicry: "盜用中華郵政郵差卡通形象與綠色經典商標防偽排版。"
    },
    systemReport: {
      apiCallsDetected: [
        "https://merchant-checkout-scams.com/api/v2/gateway/pay"
      ],
      redirectChain: [
        "https://taiwan-post-office-mail.top/tax-resend/parcel"
      ],
      permissionsRequested: [],
      apkPayloadDetected: false,
      apkPayloadName: null
    },
    sandboxConsoleLogs: [
      { id: "sp_1", time: "+0.1s", action: "沙盒網域安全巡檢... HTTP 探針響應 OK，連接建立。", type: "info" },
      { id: "sp_2", time: "+0.4s", action: "觸發 CSS 盜標比對程序：仿冒郵局主題相似係數達 98.2%。", type: "warning" },
      { id: "sp_3", time: "+0.9s", action: "偵測到付款 API 端點非臺灣主流金流通路。背景域名指向非法跨境商務網關。", type: "danger" },
      { id: "sp_4", time: "+1.3s", action: "阻斷並回報：信用卡 3D 安全碼監聽事件成功攔截。", type: "success" }
    ],
    visualMockup: {
      backgroundColor: "#008453",
      textColor: "#ffffff",
      brandName: "中華郵政線上郵務安全補繳關稅處",
      titleText: "郵件未課關稅費用補繳指示",
      subText: "包裹編號: TW-49129033-HK. 當前物流狀態: 暫扣於海關 (等候補付關稅手續費)",
      elements: [
        { id: "post_warning", type: "warning_overlay", label: "關稅欠費未補通知", value: "尊敬的顧客，您的包裹已抵達本局關稅隔離帶，因海關進口手續費 NT$ 82 尚未補足而停滯。請立即在下方輸入您的信用卡進行補稅提領。補付成功後，包裹將在 2 小時內送抵派樣。", riskLabel: "典型關稅欠費釣魚，利用小額金額降低戒心，轉頭盜刷數萬元！", hazardSeverity: "critical" },
        { id: "post_card", type: "input", label: "請輸入 16 位 信用卡卡號 (Card Number)", value: "", placeholder: "e.g. 4579 1234 5678 1234", riskLabel: "獲取信用卡卡號，這項個資不合規地儲存於第三方盜刷端。", hazardSeverity: "critical" },
        { id: "post_expiry", type: "input", label: "卡片有效期限 (Expiry Date)", value: "", placeholder: "MM / YY", riskLabel: "信用卡刷卡核心拼圖，用以確認非到期卡片。", hazardSeverity: "high" },
        { id: "post_cvv", type: "input", label: "卡片背面三位 安全碼 (CVV)", value: "", placeholder: "e.g. 1 2 3", riskLabel: "卡片安全碼！只要將卡號、到期日與背面 CVV 流水丟出去，詐騙集團就能在外站瞬間發起無卡消費扣款！", hazardSeverity: "critical" },
        { id: "post_btn", type: "button", label: "立即安全支付關稅 (NT$ 82 元)", value: "立即補足稅金", riskLabel: "此按鈕將誘騙您提交並盜刷。", hazardSeverity: "critical" }
      ]
    },
    safetyRecommendations: [
      "中華郵政郵網絕對使用 '.post.gov.tw'，請認清政府機關專屬的 '.gov.tw' 後綴字樣。",
      "郵局不會主動使用線上刷卡方式要求繳交 100 元以下的微額稅關費用。",
      "如信用卡已不慎輸入，請即刻致電銀行客服部門申請掛失更換新卡。"
    ]
  }
];

export default function App() {
  const [urlInput, setUrlInput] = useState("");
  const [showHFGuide, setShowHFGuide] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningUrl, setScanningUrl] = useState("");
  const [errorText, setErrorText] = useState("");

  // Loading saved history or seeding templates
  useEffect(() => {
    const cached = localStorage.getItem("sandbox_browsing_history");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setSelectedResult(parsed[0]);
          return;
        }
      } catch (err) {
        console.error("Cache parsing error, falling back to templates", err);
      }
    }
    
    // Seed template data as defaults
    setHistory(PRESEEDED_TEMPLATES);
    setSelectedResult(PRESEEDED_TEMPLATES[0]);
    localStorage.setItem("sandbox_browsing_history", JSON.stringify(PRESEEDED_TEMPLATES));
  }, []);

  const handleAnalyze = async (e?: React.FormEvent, targetOverrideUrl?: string) => {
    if (e) e.preventDefault();
    setErrorText("");

    const targetUrl = (targetOverrideUrl || urlInput).trim();
    if (!targetUrl) {
      setErrorText("請輸入一個有效的網址，例如 https://scam-site-tw.cc");
      return;
    }

    // Rough regex check for basic URL structure
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    if (!urlPattern.test(targetUrl) && !targetUrl.includes(".")) {
      setErrorText("請檢閱輸入之網址拼字，域名結構在系統中不合規。");
      return;
    }

    setScanningUrl(targetUrl);
    setIsScanning(true);

    try {
      const response = await fetch("/api/sandbox/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        let errMsg = "伺服器沙盒響應錯誤，請重試。";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = `${errData.error} ${errData.details || ""}`;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const result: AnalysisResult = await response.json();
      
      // Save logs to localStorage while avoiding duplicates
      const freshHistory = [result, ...history.filter(h => h.url !== result.url)];
      setHistory(freshHistory);
      setSelectedResult(result);
      localStorage.setItem("sandbox_browsing_history", JSON.stringify(freshHistory));
      
      if (!targetOverrideUrl) {
        setUrlInput("");
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "隔離抓取伺服器異常，請確認您的 API Key 與網路環境設定。");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectHistory = (id: string) => {
    const item = history.find(h => h.id === id);
    if (item) {
      setSelectedResult(item);
      setErrorText("");
    }
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    setSelectedResult(null);
    localStorage.removeItem("sandbox_browsing_history");
  };

  const loadTemplate = (tmpl: AnalysisResult) => {
    // Inject or update
    const alreadyExists = history.some(h => h.id === tmpl.id);
    const fresh = alreadyExists ? history : [tmpl, ...history];
    setHistory(fresh);
    setSelectedResult(tmpl);
    localStorage.setItem("sandbox_browsing_history", JSON.stringify(fresh));
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text-primary flex flex-col font-sans selection:bg-brand-accent-danger/20 selection:text-white">
      
      {/* Sophisticated subtle scan line simulation layout */}
      <div className="absolute inset-0 bg-[#000000] bg-[linear-gradient(rgba(34,34,36,0.3)_1px,transparent_1px)] bg-[size:100%_4px] opacity-10 pointer-events-none" />

      {/* Cyber Security Indicator HUD bar */}
      <div className="bg-brand-surface border-b border-brand-border px-6 py-2.5 flex items-center justify-between text-xs text-brand-text-secondary select-none z-10 shrink-0 tracking-wide font-mono">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-brand-accent-safe font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-safe animate-pulse mr-2" />
            SENTINEL GATEWAY // ACTIVE
          </span>
          <span className="hidden sm:inline text-brand-border">|</span>
          <span className="hidden sm:inline">165 ANTI-FRAUD RAW FEED: SYNCED</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-brand-text-secondary">PROTECTION STATE:</span>
          <span className="tag px-1.5 py-0.5 rounded bg-brand-bg text-brand-text-primary text-[10px] border border-brand-border">VIRTUAL_AIRGAP</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex-1 flex flex-col z-10">
        
        {/* Elegant display Georgia serif typography header */}
        <header className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-6 shrink-0">
          <div className="space-y-1.5">
            <div className="flex items-center justify-center md:justify-start space-x-2.5">
              <div className="logo font-serif text-2xl font-bold italic tracking-tight text-brand-text-primary">
                SENTINEL <span className="font-sans font-light tracking-widest text-[#8a8a8e] not-italic text-sm ml-1">SANDBOX</span>
              </div>
              <div className="status-badge badge-danger text-[10px] font-bold uppercase tracking-wider bg-[#ff4b4b]/15 text-brand-accent-danger border border-brand-accent-danger/35 px-2 py-0.5 rounded-full">
                THREAT DETECTOR: SECURED
              </div>
            </div>
            <p className="text-xs text-brand-text-secondary max-w-xl font-sans leading-relaxed">
              防詐沙盒虛擬安全瀏覽器 — 雲端微型沙盒隔離引擎，協助安全重繪臺灣主流高頻詐騙與釣魚連結、提取隱蔽 API 與威脅特徵，保護實體主機免受瀏覽感染。
            </p>
            <div className="pt-2 flex justify-center md:justify-start">
              <button
                type="button"
                onClick={() => setShowHFGuide(true)}
                className="inline-flex items-center space-x-1.5 text-[11px] text-[#ff4b4b] hover:text-[#ff3c3c] font-mono tracking-wider border border-[#ff4b4b]/20 hover:border-[#ff4b4b]/50 bg-[#ff4b4b]/5 px-3 py-1 rounded transition-all cursor-pointer uppercase select-none"
              >
                <span>🚀 Hugging Face 部署及排錯指引 (HF Spaces Guide)</span>
              </button>
            </div>
          </div>

          {/* Quick learning card */}
          <div className="bg-brand-surface border border-brand-border rounded-lg p-4 text-xs max-w-sm flex items-start space-x-2.5 justify-self-end text-left shadow-md">
            <BookOpen size={16} className="text-brand-text-primary mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-brand-text-primary block font-serif tracking-tight">VIRTUAL ISOLATION ARCHITECTURE</span>
              <p className="text-[11px] text-brand-text-secondary mt-1 leading-relaxed">
                絕大多數惡意代碼一經瀏覽器渲染即完成 Cookie 側錄或不合規指令執行。本防護沙盒由雲端進行轉接解析並靜態重繪除毒。
              </p>
            </div>
          </div>
        </header>

        {/* Input Bar Section with genuine elite input styling */}
        <section className="bg-brand-surface border border-brand-border rounded shadow-sm mb-8 relative overflow-hidden shrink-0">
          <div className="relative z-10 p-5">
            <div className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest mb-3 flex items-center">
              <Terminal size={12} className="text-brand-text-primary mr-2" />
              <span>SUBMIT CORRUPTED LINE PAY / POST / BANK NET DECEPTIVE URL SECURELY</span>
            </div>
            
            <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 flex items-center bg-[#000000] rounded border border-brand-border focus-within:border-brand-text-secondary transition-all p-1 shadow-inner">
                <span className="px-3 text-brand-text-secondary text-xs hidden md:inline font-mono tracking-widest">URL HOST //</span>
                <input 
                  type="text" 
                  placeholder="請在此貼上疑似詐騙的網址，例如：line-verification-tw.top/security"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isScanning}
                  className="bg-transparent border-0 outline-none w-full p-2.5 text-brand-text-primary placeholder-zinc-700 text-xs font-mono"
                />
              </div>
              
              <button 
                type="submit"
                disabled={isScanning}
                className="bg-brand-text-primary hover:bg-neutral-200 active:bg-neutral-300 text-brand-bg font-bold text-xs px-6 py-3.5 rounded transition-all flex items-center justify-center space-x-2 disabled:opacity-50 select-none cursor-pointer tracking-wider uppercase"
              >
                {isScanning ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-brand-bg/20 border-t-brand-bg animate-spin shrink-0" />
                    <span>SCANNING INTERFACE...</span>
                  </>
                ) : (
                  <>
                    <Cpu size={14} />
                    <span>RELAUNCH SANDBOX</span>
                  </>
                )}
              </button>
            </form>

            {errorText && (
              <p className="text-brand-accent-danger text-xs mt-3 flex items-center space-x-1 font-mono">
                <span>⚠</span>
                <span>{errorText}</span>
              </p>
            )}

            {/* Presets and template buttons styled premium and minimal */}
            <div className="mt-4 pt-3.5 border-t border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-brand-text-secondary">
              <div className="flex items-center space-x-1 shrink-0 font-mono text-[10px] tracking-wide uppercase">
                <BadgeAlert size={12} className="text-brand-text-secondary" />
                <span>頻繁黑名單模板快捷認證:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isScanning}
                  onClick={() => loadTemplate(PRESEEDED_TEMPLATES[0])}
                  className="bg-[#000000] hover:bg-zinc-900 text-[10px] text-brand-accent-safe font-mono tracking-wider px-2.5 py-1.5 rounded border border-brand-border transition-colors cursor-pointer text-left uppercase font-bold"
                >
                  [LINE PAY DECEPTION]
                </button>
                <button
                  type="button"
                  disabled={isScanning}
                  onClick={() => loadTemplate(PRESEEDED_TEMPLATES[1])}
                  className="bg-[#000000] hover:bg-zinc-900 text-[10px] text-brand-accent-caution font-mono tracking-wider px-2.5 py-1.5 rounded border border-brand-border transition-colors cursor-pointer text-left uppercase font-bold"
                >
                  [NET-BANK OUTAGE PANIC]
                </button>
                <button
                  type="button"
                  disabled={isScanning}
                  onClick={() => loadTemplate(PRESEEDED_TEMPLATES[2])}
                  className="bg-[#000000] hover:bg-zinc-900 text-[10px] text-brand-accent-danger font-mono tracking-wider px-2.5 py-1.5 rounded border border-brand-border transition-colors cursor-pointer text-left uppercase font-bold"
                >
                  [POSTAL POST TAX FRAUD]
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Split Layout Panel Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-visible">
          
          {/* Main Sandbox Interactive Render & System Behavior Panels */}
          <div className="lg:col-span-2 space-y-6 overflow-visible">
            {/* Component 1: Isolated Sandbox Renderer */}
            {selectedResult ? (
              <SandboxBrowser 
                result={selectedResult} 
                isScanning={isScanning} 
                scanningUrl={scanningUrl}
              />
            ) : (
              <div className="w-full bg-brand-surface border border-brand-border rounded overflow-hidden shadow-sm h-[480px] flex flex-col justify-center items-center text-brand-text-secondary p-8">
                <Globe size={40} className="text-zinc-800 mb-2" />
                <p className="text-xs font-semibold uppercase tracking-wider font-mono">SANDBOX ENGINE IDLE</p>
                <p className="text-[11px] text-brand-text-secondary/70 mt-1 font-mono">SUBMIT AN ACTIVE INTERNET DOMAIN PATH ABOVE TO ACTIVATE AIRGAP PREVIEW</p>
              </div>
            )}

            {/* Component 2: Comprehensive Security Audit & Action Recommendations */}
            <BehaviorReport 
              result={selectedResult} 
              isScanning={isScanning} 
            />
          </div>

          {/* Right Column: Catalog history logs panel with verdict tags */}
          <div className="lg:col-span-1">
            <UrlHistory 
              historyList={history}
              selectedId={selectedResult?.id || null}
              onSelect={handleSelectHistory}
              onClearAll={handleClearAllHistory}
            />
          </div>

        </div>

        {/* Real-time self-defense informational footers */}
        <footer className="mt-12 pt-6 border-t border-brand-border text-brand-text-secondary text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 font-mono tracking-wider uppercase">
          <div>
            <p>© 2026 SENTINEL ISOLATED DEFENSE ENVIRONMENT</p>
            <p className="text-[9px] text-[#8a8a8e]/60 mt-1 lowercase normal-case tracking-normal">
              all renderings and request translations are proxied by dynamic server handlers. original destination servers cannot see your real visitor details.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-[#8a8a8e]/70 justify-center">
            <span className="flex items-center space-x-1">
              <MessageSquareWarning size={12} className="text-brand-text-primary" />
              <span>165 NATIONAL POLICE REPOSITORY</span>
            </span>
            <span>・</span>
            <span>DOM-REGISTRY: SECURED</span>
          </div>
        </footer>

      </div>

      {/* Hugging Face Spaces Troubleshooter Guide Modal */}
      {showHFGuide && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0e10] border border-brand-border rounded-lg max-w-2xl w-full p-6 relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div className="flex items-center space-x-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff4b4b] animate-pulse" />
                <h3 className="font-serif text-sm md:text-base font-bold tracking-tight text-brand-text-primary">
                  HUGGING FACE SPACES 部署與自我診斷指南
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHFGuide(false)}
                className="text-brand-text-secondary hover:text-brand-text-primary transition-colors p-1 rounded hover:bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6 font-sans text-xs leading-relaxed text-brand-text-secondary pr-1">
              <p className="text-[13px] text-brand-text-primary leading-relaxed font-semibold">
                如果您發現網站發布到 Hugging Face Spaces 後一直無法啟用或卡在 Building/Runtime Error，請依照以下步驟一一核對自我排除：
              </p>

              {/* Step 1 */}
              <div className="space-y-2 bg-[#000]/60 p-4 border border-brand-border/40 rounded">
                <h4 className="font-mono text-[#ff4b4b] font-bold uppercase tracking-wider text-[11px] flex items-center">
                  <span className="bg-[#ff4b4b] text-black w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] mr-2 font-sans font-bold">1</span>
                  HF_TOKEN 權限設定錯誤（最常見的失敗原因）
                </h4>
                <p className="pl-6 leading-relaxed text-zinc-400">
                  Hugging Face 的 Access Token 預設是 <strong>Read (唯讀)</strong>。唯讀 Token 無法讓 GitHub Actions 推送代碼至 Space，會引發 <code>403 Forbidden</code> 錯誤。
                </p>
                <div className="pl-6 pt-1 text-brand-accent-safe font-mono text-[11px] space-y-1">
                  <p>👉 <strong>修復方式</strong>：前往 Hugging Face 個人設定 ➜ <strong>Access Tokens</strong> ➜ 點選建立或修改您的 Token，一定要將權限設為 <strong>Write (可寫入/寫入)</strong> 權限，再將其複製到 GitHub Secrets 覆蓋。</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-2 bg-[#000]/60 p-4 border border-brand-border/40 rounded">
                <h4 className="font-mono text-brand-accent-caution font-bold uppercase tracking-wider text-[11px] flex items-center">
                  <span className="bg-brand-accent-caution text-black w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] mr-2 font-sans font-bold">2</span>
                  確認是否在 GitHub 專案中貼對 Secret 名稱
                </h4>
                <p className="pl-6 leading-relaxed text-zinc-400">
                  GitHub Actions 找不到密鑰時，會出現 <code>HF_TOKEN is missing</code> 的中斷報錯。
                </p>
                <div className="pl-6 pt-1 text-zinc-300 font-mono text-[11px] space-y-1.5 leading-relaxed">
                  <p>👉 <strong>修復步驟</strong>：</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>前往 GitHub 您的 Repository 主頁。</li>
                    <li>點擊頂部選單 <strong>Settings</strong> ➜ 左側 <strong>Secrets and variables</strong> ➜ <strong>Actions</strong>。</li>
                    <li>點選 <strong>New repository secret</strong>。</li>
                    <li><strong>Name</strong> 填寫：<code className="text-white bg-zinc-800 px-1 py-0.5 rounded">HF_TOKEN</code>。</li>
                    <li><strong>Secret</strong> 貼上在第 1 步取得的 Hugging Face <strong>Write Token</strong>。</li>
                  </ol>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-2 bg-[#000]/60 p-4 border border-brand-border/40 rounded">
                <h4 className="font-mono text-brand-text-primary font-bold uppercase tracking-wider text-[11px] flex items-center">
                  <span className="bg-zinc-800 text-white w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] mr-2 font-sans font-bold">3</span>
                  確認 Hugging Face Spaces 項目名稱與個人網址
                </h4>
                <p className="pl-6 leading-relaxed text-zinc-400">
                  原系統預設的部署路徑是您之前的項目：<code>shaohan-webdesign/web-sandbox-testing</code>。<br />
                  若您當前 Hugging Face 的<strong>使用者帳號名稱</strong>（或組織名稱）或 <strong>Space名稱</strong>已修改，GitHub 推送會回報 <code>Repository not found</code>。
                </p>
                <div className="pl-6 pt-1.5 text-brand-accent-caution font-mono text-[11px] space-y-2">
                  <p>👉 <strong>修改方式</strong>：</p>
                  <p className="leading-relaxed">
                    請至 AI Studio 程式碼編輯器中，開啟 <code>/.github/workflows/deploy.yml</code> 檔案，在第 93 行左右：
                  </p>
                  <pre className="text-white bg-black/90 p-2.5 rounded border border-brand-border text-[10px] whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    HF_REPO_URL="https://oauth2:$&#123;CLEANED_TOKEN&#125;@huggingface.co/spaces/<span className="text-yellow-400 font-bold">[您的HF使用者名稱]</span>/<span className="text-yellow-400 font-bold">[您的Space項目名稱]</span>"
                  </pre>
                  <p className="leading-relaxed text-zinc-400">將其中的帳號、儲存庫（如 <code>shaohan-webdesign/web-sandbox-testing</code>）改成您的設定，Commit 並 Push 即可順利對接部署！</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-2 bg-[#000]/60 p-4 border border-brand-border/40 rounded">
                <h4 className="font-mono text-zinc-400 font-bold uppercase tracking-wider text-[11px] flex items-center">
                  <span className="bg-zinc-600 text-black w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] mr-2 font-sans font-bold">4</span>
                  確保 Space 的 SDK 選擇的是 Docker（重要）
                </h4>
                <p className="pl-6 leading-relaxed text-zinc-400">
                  由於本多功能隔離防詐分析工具需要 Node.js/Express 伺服器進行雙向中立安全探查，因此<b>不支援</b>靜態 HTML 或 Gradio/Streamlit 模板。
                </p>
                <div className="pl-6 pt-1 text-zinc-300 font-mono text-[11px] leading-relaxed">
                  <p>👉 點選 Hugging Face Spaces 主頁的 <strong>Settings</strong> ➜ 確認 <strong>SDK</strong> 被選定或修改為 <strong>Docker</strong>。如果在一開始建立 Space 時沒有選 Docker，可以重新建立一個 Space 並指定 SDK 為 Docker。</p>
                </div>
              </div>

              {/* Manual Backup option */}
              <div className="border border-brand-border rounded p-3 bg-brand-surface text-zinc-400">
                <p className="font-bold text-white mb-1 font-serif">💡 備用手動更新方案：</p>
                <p className="leading-relaxed text-[11px]">
                  若 GitHub Actions 部署有時效，您可以直接登入 Hugging Face Spaces 網頁，點選 <strong>Files</strong> 分頁 ➜ 點選 <strong>README.md</strong> ➜ 手動覆寫檔案或直接編輯將最頂端的 YAML Frontmatter 配好，Space 就會自動根據專案內的 Dockerfile 重新打包部署。
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-brand-border flex justify-end">
              <button
                type="button"
                onClick={() => setShowHFGuide(false)}
                className="bg-brand-text-primary hover:bg-neutral-200 text-brand-bg font-bold font-mono text-xs px-5 py-2.5 rounded transition-all cursor-pointer uppercase select-none"
              >
                CLOSE DIAGNOSTICS
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
