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

    // Call Gemini to reconstruct the site behavior, layout and warnings
    const prompt = `
You are an advanced isolated safety browser virtual sandbox (防詐沙盒虛擬瀏覽器).
Your job is to analyze the following target URL and return a highly detailed sandbox behavior report, risk indicators, and simulated static screenshot mockup of what the webpage looks like inside a secure environment.

Target URL: "${cleanUrl}"
Real Probe Status: ${probe.isReachable ? "REACHABLE" : "UNREACHABLE / OFFLINE"}
Real Web-Scrape Clues:
\`\`\`
${probe.htmlSnippets}
\`\`\`

If the Real Web-Scrape is Reachable, utilize its headers, titles, and text contents (e.g. keywords, brand names, bank logos) to discover fraud mimicries. 
If the Real Web-Scrape is Unreachable or Offline, apply expert heuristic and lexical threat patterns. Analyze the domain URL string structure (e.g. misspelled subdomains, suspicious TLDs like .top, .cc, .xyz, weird paths like /line_login, /shopee301, brand impersonations of major entities like 中華郵政, 綠界, LINE Pay, 國泰世華銀行, 蝦皮購物, 富邦銀行, 監理站, 財政部全球資訊網, or popular web investment hubs).

Generate a complete, simulated safety analysis report answering the schema structure. Under no circumstances should you generate markdown wrapper text outside the JSON. Return a perfectly parseable JSON output representing Taiwanese target phishing or high-risk scam features context.

Please structure the "visualMockup" object to recreate the simulated screen visually:
- Choose an appropriate 'backgroundColor' matching the brand color palette (e.g. LINE = '#00c300', 中華郵政 = '#008453', Cathay Bank = '#fdf200' or '#015435', Shopee = '#ee4d2d', Netflix = '#e50914', custom fake pages = e.g. '#1e293b' gray/blue).
- Include standard mock page form factors such as mock 'elements' for:
  - logos, headings, inputs (like '用戶編號', '密碼', '身份證字號', '信用卡號', '驗證驗碼 OTP'), buttons (like '確認登入', '申請退稅', '領取紅包'), text warnings, or unrequested alert overlays.
  - For each mockup visual element, provide:
    - 'type': 'logo' | 'input' | 'button' | 'text' | 'form_field' | 'warning_overlay'
    - 'label': Element label text (in Traditional Chinese 繁體中文)
    - 'placeholder': Placeholder if raw input
    - 'riskLabel': Explanatory high-risk note on why this input/logo is dangerous or faked inside a scam page (Traditional Chinese, e.g. '此處騙取悠遊卡密碼與驗證簡訊', '網頁偽造中華郵政經典標誌讓您卸下心防')
    - 'hazardSeverity': 'none' | 'low' | 'high' | 'critical'
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
