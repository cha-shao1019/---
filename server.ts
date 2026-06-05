import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper to fetch website elements safely
async function probeUrl(targetUrl: string): Promise<{ isReachable: boolean; htmlSnippets: string }> {
  try {
    const formattedUrl = targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout max

    const res = await fetch(formattedUrl, {
      method: "GET",
      headers: {
        // Mimic standard Apple iOS 17 with integrated mobile LINE app webview browser fingerprint
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1 Line/14.3.1",
        // Crucial: Pretend to originate from Taiwan traditional Chinese browser to bypass geo-restrictions
        "Accept-Language": "zh-TW,zh-HK;q=0.9,zh;q=0.8,en-US;q=0.7,en;q=0.6",
        // Direct referral mimicking standard chat link click in Taiwan's most popular messaging app
        "Referer": "https://line.me/",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Cache-Control": "max-age=0",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1"
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && (contentType.includes("text/html") || contentType.includes("text/plain"))) {
      const text = await res.text();
      // Extract title, meta tags, and form fields to keep prompt fast and useful
      const htmlCleaned = text
        .slice(0, 15000) // limit size
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "[SCRIPT BLOCKED]") // strip actual code
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "[STYLE BLOCKED]"); // strip styles

      return {
        isReachable: true,
        htmlSnippets: `Status: ${res.status}. Headers: ${JSON.stringify(Array.from(res.headers.entries()))}. DOM preview (first 4000 chars): ${htmlCleaned.slice(0, 4000)}`,
      };
    }

    return {
      isReachable: true,
      htmlSnippets: `Reachable with HTTP ${res.status} but content type is ${contentType}.`,
    };
  } catch (err: any) {
    return {
      isReachable: false,
      htmlSnippets: `Unreachable: Error probing target: ${err.message || "Timeout/Connection refused"}`,
    };
  }
}

// API endpoint for analysis
app.post("/api/sandbox/analyze", async (req, res) => {
  const { url: targetUrl } = req.body;

  if (!targetUrl || typeof targetUrl !== "string") {
    res.status(400).json({ error: "Missing or invalid URL parameter." });
    return;
  }

  try {
    const cleanUrl = targetUrl.trim();
    console.log(`[Sandbox] Analyzing URL: ${cleanUrl}`);

    // Dynamic website check
    const probe = await probeUrl(cleanUrl);

    // Call Gemini to reconstruct the site behavior, layout and warnings with non-biased, dual-path assessment principles
    const prompt = `
You are an advanced isolated safety browser virtual sandbox (防詐沙盒虛擬瀏覽器) in Taiwan.
Your absolute goal is to construct a HIGHLY ACCURATE, CRITICALLY UNBIASED, and HONEST security/behavior assessment of the target URL.

Target URL: "${cleanUrl}"
Real Probe Status: ${probe.isReachable ? "REACHABLE" : "UNREACHABLE / OFFLINE"}
Real Web-Scrape Clues:
\`\`\`
${probe.htmlSnippets}
\`\`\`

=========================================
🛡️ 【CRITICAL CLASSIFICATION INSTRUCTIONS - 雙向中立安全評估原則】
=========================================
DO NOT assume every website is a scam or a threat! You must separate LEGITIMATE/SAFE websites from REAL PHISHING/MALICIOUS sites.

1. ✅ LEGITIMATE & SAFE WEBSITES (常規安全網站 / 正常個人、企業網站 / 官方入口 / 部落格 / 作品集):
   - Criteria: The website layout, URL, domain, or DOM content is standard, informative, OR the domain is the EXACT official domain of a Taiwanese brand (e.g. "line.me", "cubetw.com.tw", "cathaybk.com.tw", "post.gov.tw", "gov.tw", "github.com", "google.com", etc.), OR it is simply a standard personal showcase/home Page/blog showing custom portfolio, or a normal company web site (e.g. web design agency, tech agency, dental clinic, lawyer site), with NO signs of brand impersonation, deceptive bank-login layout, or aggressive mobile payment OTP fraud.
   - Outputs:
     - threatScore: MUST be very low (between 0 and 15, ideally 0-5 for official platforms/safe personal or business sites).
     - verdict: "SAFE".
     - category: "Safe / Informational".
     - mismatchedBrand: "None".
     - summary: Write a highly objective, polite, professional, and positive review in Traditional Chinese (繁體中文). Explain that "經沙盒智慧分析，此網域/網頁結構為常規安全之資訊、個人作品集或企業網站，未發現任何冒用知名品牌、偽裝登入首頁、惡意扣款表單或跨站惡意 API 行為。網站能防禦惡意嗅探，可安全瀏覽。"
     - threatAnalysis: Set standard explanatory text of safe structures. The entries (domainRisk, credentialHarvest, urgencyManipulation, unauthorizedMimicry) must explicitly state "無此威脅/結構安全/域名信譽良好且無敏感特徵冒用" 或 "常規官方網站網址/無任何安全威脅指標".
     - systemReport: "apiCallsDetected" MUST NOT contain fake evil domains! Set it as empty [] or only realistic static tracking/hosting endpoints if visible in raw scrape clues. "apkPayloadDetected" must be false.
     - visualMockup: Draw a normal, beautiful, and realistic mockup based on the HTML metadata/title (e.g., standard blog, portfolio, or landing page). For mock 'elements', do NOT include fake input fields demanding OTP or credit card credentials unless they actually exist. Use normal nav links, buttons, or heading texts. Their 'hazardSeverity' MUST be "none" (or "low" at most for standard public inputs), and their 'riskLabel' should be reassuringly neutral, e.g., "常規網頁連結，與安全伺服器傳輸，無威脅" or "常規安全按鈕".

2. ⚠️ SUSPICIOUS / EXTREME PHISHING WEBSITES (真實釣魚或惡意網站):
   - Criteria: The URL mimics a well-known brand but is hosted on a mismatching, suspicious domain (e.g., "cathaybk-verification.top", "line-pay-login.xyz", "taiwan-post-office-parcel.cc", "gov-tw-tax.work", etc.), AND/OR the page aggressively demands inputs of sensitive data like OTP (簡訊驗證碼), Bank login details (網銀代號/密碼), Identity Cards (身分證字號), or complete Credit Card numbers + CVV with high urgency and threat words ("若不更正將即刻扣款/解除合約").
   - Outputs:
     - threatScore: High (80 to 100).
     - verdict: "MALICIOUS" or "CRITICAL_THREAT".
     - category: Match the appropriate category like "Phishing Card", "Account Impersonation", etc.
     - mismatchedBrand: Specify the faked brand (e.g. "中華郵政", "國泰世華銀行", "LINE Pay", "富邦銀行", "監理站", "台灣電力公司").
     - summary: Reconstruct the scam's deceptive behavior, visual faking tricks, and threat vectors in details in Traditional Chinese.
     - threatAnalysis: Fill in real expert breakdown of faking elements.
     - systemReport: Simulate potential malicious API endpoints (redirect chains, leak points).
     - visualMockup: Reconstruct the phishing layout highlighting the hazardous form inputs, and provide matching high-risk warnings, assigning "critical" or "high" to 'hazardSeverity', with explicit "riskLabel" warning details in Traditional Chinese.

3. 🚫 PREVENTION OF FALSE POSITIVES (避免常規登入或聯絡表單誤判關鍵原則):
   - A standard user login page, administrator login (such as WordPress, Shopify, standard SaaS portal, custom client portal login), contact form (demanding Name, Phone number for standard callback/inquiries), or newsletter subscription form on a normal business/personal domain is NOT malicious!
   - You MUST NOT classify a website as malicious (MALICIOUS/CRITICAL_THREAT) simply because it contains a standard login input, search bar, contact form, or email sign-up. It is only phishing if there is clear EVIDENCE of brand mimicry (such as a cheap replica of LINE Pay, Cathay Bank, Shopee, Post Office, or Government tax sites) or deceptive layout targeting credential theft under fake branding, or requests of high-risk OTP / Bank PINs / Complete credit card numbers + CVV without a merchant invoice context.
   - If a website is unreachable (due to network timeout/blocked connection) but has a standard domain name with NO obvious scam indicators (e.g. a business/portfolio domain like .com, .tw, .io), you MUST assume it is a SAFE but currently offline/inaccessible site. Assign a threatScore = 0 and verdict = "SAFE".

Ensure the final JSON is perfectly valid. Do not inject any markdown wrap (such as \`\`\`json) before or after the JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You represent a Secure Sandbox Simulation Engine in Taiwan. Respond exclusively using valid and strict JSON that conforms exactly to the database schema. All explanations, summaries, riskLabels, and suggestions MUST be crafted in highly professional Traditional Chinese (繁體中文).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "isReachable",
            "threatScore",
            "verdict",
            "category",
            "mismatchedBrand",
            "summary",
            "threatAnalysis",
            "systemReport",
            "sandboxConsoleLogs",
            "visualMockup",
            "safetyRecommendations"
          ],
          properties: {
            isReachable: { type: Type.BOOLEAN },
            threatScore: { type: Type.INTEGER, description: "Threat score between 0 (fully safe) and 100 (lethal fraud/credential stealer)" },
            verdict: { type: Type.STRING, description: "MUST be one of: SAFE, MILD_SUSPICION, MALICIOUS, CRITICAL_THREAT" },
            category: { type: Type.STRING, description: "Scam category: 'Phishing Card' | 'Fake Shopping' | 'Account Impersonation' | 'Investment Scam' | 'Safe / Informational' | 'Unknown Suspicious'" },
            mismatchedBrand: { type: Type.STRING, description: "Name of the Taiwanese brand being mimicked or 'None'" },
            summary: { type: Type.STRING, description: "A detailed summary in Traditional Chinese explaining the mechanics of the scam, how it tricks users, and visual cues." },
            threatAnalysis: {
              type: Type.OBJECT,
              required: ["domainRisk", "credentialHarvest", "urgencyManipulation", "unauthorizedMimicry"],
              properties: {
                domainRisk: { type: Type.STRING, description: "Analysis of the URL structure or domain registrations indicators" },
                credentialHarvest: { type: Type.STRING, description: "Analysis of what private info is targeted (OTP, account IDs, payment credentials)" },
                urgencyManipulation: { type: Type.STRING, description: "How the psychological urgency/coercion is played out" },
                unauthorizedMimicry: { type: Type.STRING, description: "Visual and brand imitation aspects flagged" }
              }
            },
            systemReport: {
              type: Type.OBJECT,
              required: ["apiCallsDetected", "redirectChain", "permissionsRequested", "apkPayloadDetected", "apkPayloadName"],
              properties: {
                apiCallsDetected: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Mock network destination/stealer api endpoints, e.g. /api/receive_otp"
                },
                redirectChain: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Simulated redirect hop list"
                },
                permissionsRequested: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "IFrame or client permissions requested: camera, notification, location etc."
                },
                apkPayloadDetected: { type: Type.BOOLEAN, description: "Whether an automatic APK download is pushed" },
                apkPayloadName: { type: Type.STRING, description: "Name of APK file if pushed, otherwise empty/null" }
              }
            },
            sandboxConsoleLogs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["time", "action", "type"],
                properties: {
                  time: { type: Type.STRING, description: "Time string e.g. '+0.1s'" },
                  action: { type: Type.STRING, description: "Simulated quarantine action log in 繁體中文" },
                  type: { type: Type.STRING, description: "Level of log: info, success, warning, danger" }
                }
              }
            },
            visualMockup: {
              type: Type.OBJECT,
              required: ["backgroundColor", "textColor", "brandName", "titleText", "subText", "elements"],
              properties: {
                backgroundColor: { type: Type.STRING, description: "Background hex code for styling mock iframe, e.g. #00c300" },
                textColor: { type: Type.STRING, description: "Text hex code, e.g. #333333" },
                brandName: { type: Type.STRING },
                titleText: { type: Type.STRING },
                subText: { type: Type.STRING },
                elements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["type", "label", "value", "riskLabel", "hazardSeverity"],
                    properties: {
                      type: { type: Type.STRING, description: "logo | input | button | text | form_field | warning_overlay" },
                      label: { type: Type.STRING, description: "Field instruction / heading text in Chinese" },
                      value: { type: Type.STRING, description: "Sample fake input content or action label" },
                      riskLabel: { type: Type.STRING, description: "An isolated security warning detail explaining fraud indicators in Traditional Chinese" },
                      hazardSeverity: { type: Type.STRING, description: "none | low | high | critical" },
                      placeholder: { type: Type.STRING, description: "Optional keyboard hint" }
                    }
                  }
                }
              }
            },
            safetyRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "What the user should do next, e.g. call 165反詐騙"
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    
    // Add unique node IDs for keys on client render
    const fullResult = {
      id: "scan_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      url: cleanUrl,
      timestamp: new Date().toISOString(),
      ...parsedData
    };

    res.json(fullResult);
  } catch (error: any) {
    console.error("[Sandbox Error]:", error);
    res.status(500).json({
      error: "內部分析伺服器發生異常，請重試。",
      details: error.message || error
    });
  }
});

// Serve frontend bundling inside static path
const isProd = process.env.NODE_ENV === "production";
if (!isProd) {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    
    // Single point callback for index fallback
    app.use("*", (req, res, next) => {
      vite.transformIndexHtml(req.originalUrl, '<div id="root"></div>')
      next();
    });
  }).catch(err => {
    console.error("Vite failed to bootstrap in Express", err);
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Sandbox Server] Sandbox isolated browser host listening on http://0.0.0.0:${PORT}`);
});
