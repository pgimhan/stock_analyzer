import express from "express";
import multer from "multer";
import fs from "fs/promises";
import { createRequire } from "module";
import OpenAI from "openai";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const app = express();
const upload = multer({ dest: "/tmp/" });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/api/upload-financial-report", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const apiKey = req.headers["x-openai-api-key"] as string;
    if (!apiKey) {
      return res.status(400).json({ error: "OpenAI API key is required" });
    }

    const dataBuffer = await fs.readFile(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    
    const openai = new OpenAI({ apiKey });
    const prompt = `Extract financial data from this report. Return ONLY valid JSON with these fields (use null for missing data):
{
  "companyName": string or null,
  "tickerSymbol": string or null,
  "reportPeriod": string or null,
  "periodStart": string or null (format: YYYY-MM-DD),
  "periodEnd": string or null (format: YYYY-MM-DD),
  "sharePrice": number or null,
  "totalAssets": number or null,
  "totalLiabilities": number or null,
  "totalEquity": number or null,
  "currentAssets": number or null,
  "currentLiabilities": number or null,
  "revenue": number or null,
  "netIncome": number or null,
  "operatingIncome": number or null,
  "grossProfit": number or null,
  "ebitda": number or null,
  "operatingCashFlow": number or null,
  "eps": number or null,
  "bookValuePerShare": number or null,
  "dividendPerShare": number or null,
  "revenueGrowth": number or null,
  "epsGrowth": number or null,
  "peRatio": number or null,
  "pbvRatio": number or null,
  "pegRatio": number or null,
  "evEbitda": number or null,
  "dividendYield": number or null,
  "roe": number or null,
  "roa": number or null,
  "currentRatio": number or null,
  "debtToEquity": number or null,
  "profitMargin": number or null
}

IMPORTANT: If values are in thousands (Rs.'000), multiply by 1000 to get actual values. Per-share values and ratios should NOT be multiplied.

Report text:
${pdfData.text.slice(0, 15000)}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    let content = response.choices[0].message.content || "{}";
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const extracted = JSON.parse(content);

    const calculated: any = {};
    if (extracted.netIncome && extracted.totalEquity) calculated.roe = (extracted.netIncome / extracted.totalEquity) * 100;
    if (extracted.netIncome && extracted.totalAssets) calculated.roa = (extracted.netIncome / extracted.totalAssets) * 100;
    if (extracted.netIncome && extracted.revenue) calculated.profitMargin = (extracted.netIncome / extracted.revenue) * 100;
    if (extracted.currentAssets && extracted.currentLiabilities) calculated.currentRatio = extracted.currentAssets / extracted.currentLiabilities;
    if (extracted.totalLiabilities && extracted.totalEquity) calculated.debtToEquity = extracted.totalLiabilities / extracted.totalEquity;
    if (extracted.sharePrice && extracted.eps) calculated.peRatio = extracted.sharePrice / extracted.eps;
    if (extracted.sharePrice && extracted.bookValuePerShare) calculated.pbvRatio = extracted.sharePrice / extracted.bookValuePerShare;

    const missing: string[] = [];
    if (!extracted.eps) missing.push("EPS");
    if (!extracted.revenue) missing.push("Revenue");
    if (!extracted.netIncome) missing.push("Net Income");

    await fs.unlink(req.file.path).catch(() => {});

    res.json({ extracted, calculated, missing });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to process report" });
  }
});

export default app;
