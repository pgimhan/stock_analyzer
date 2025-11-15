import express from "express";
import multer from "multer";
import fs from "fs/promises";
import { createRequire } from "module";
import OpenAI from "openai";
import dotenv from "dotenv";
import { db } from "../server/db";
import { users, analyses } from "../shared/db-schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { log, logError, logRequest } from "../server/logger";

dotenv.config();

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const app = express();
const upload = multer({ dest: "/tmp/" });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  logRequest('POST', '/api/auth/register');
  try {
    const { email, password, name } = req.body;
    log('Register attempt', { email, name });
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name: name || null,
    }).returning();

    log('User registered', { userId: user.id, email: user.email });
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    logError('Registration failed', error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/signin", async (req, res) => {
  logRequest('POST', '/api/auth/signin');
  try {
    const { email, password } = req.body;
    log('Login attempt', { email });
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user?.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    log('Login successful', { userId: user.id, email: user.email });
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    logError('Login failed', error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/session", async (req, res) => {
  logRequest('GET', '/api/auth/session');
  res.json(null);
});

app.post("/api/auth/signout", async (req, res) => {
  logRequest('POST', '/api/auth/signout');
  res.json({ success: true });
});

// Analysis routes
app.post("/api/analyses", async (req, res) => {
  logRequest('POST', '/api/analyses');
  try {
    const { userId, stockName, tickerSymbol, inputData, result } = req.body;
    log('Save analysis', { userId, stockName, tickerSymbol });
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [analysis] = await db.insert(analyses).values({
      userId,
      stockName,
      tickerSymbol,
      inputData: JSON.stringify(inputData),
      result: JSON.stringify(result),
    }).returning();

    log('Analysis saved', { analysisId: analysis.id, userId });
    res.json(analysis);
  } catch (error: any) {
    logError('Save analysis failed', error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analyses/:userId", async (req, res) => {
  logRequest('GET', '/api/analyses/:userId');
  try {
    const { userId } = req.params;
    log('Fetch analyses', { userId });
    
    const userAnalyses = await db.query.analyses.findMany({
      where: eq(analyses.userId, userId),
      orderBy: [desc(analyses.createdAt)],
    });

    const formatted = userAnalyses.map(a => ({
      id: a.id,
      stockName: a.stockName,
      tickerSymbol: a.tickerSymbol,
      inputData: JSON.parse(a.inputData),
      result: JSON.parse(a.result),
      timestamp: a.createdAt,
    }));

    log('Analyses fetched', { userId, count: formatted.length });
    res.json(formatted);
  } catch (error: any) {
    logError('Fetch analyses failed', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/analyses/:id", async (req, res) => {
  logRequest('DELETE', '/api/analyses/:id');
  try {
    const { id } = req.params;
    log('Delete analysis', { analysisId: id });
    await db.delete(analyses).where(eq(analyses.id, id));
    log('Analysis deleted', { analysisId: id });
    res.json({ success: true });
  } catch (error: any) {
    logError('Delete analysis failed', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin route
app.get("/api/admin/users", async (req, res) => {
  logRequest('GET', '/api/admin/users');
  try {
    log('Fetch admin stats');
    const allUsers = await db.query.users.findMany();
    const allAnalyses = await db.query.analyses.findMany();
    
    const usersWithStats = allUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.emailVerified || new Date(),
      analysisCount: allAnalyses.filter(a => a.userId === user.id).length,
    }));

    log('Admin stats fetched', { totalUsers: allUsers.length, totalAnalyses: allAnalyses.length });
    res.json({
      users: usersWithStats,
      stats: {
        totalUsers: allUsers.length,
        totalAnalyses: allAnalyses.length,
      },
    });
  } catch (error: any) {
    logError('Fetch admin stats failed', error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/upload-financial-report", upload.single("file"), async (req, res) => {
  logRequest('POST', '/api/upload-financial-report');
  try {
    log('PDF upload started');
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

    log('PDF processed', { companyName: extracted.companyName });
    res.json({ extracted, calculated, missing });
  } catch (error: any) {
    logError('PDF processing failed', error);
    res.status(500).json({ error: error.message || "Failed to process report" });
  }
});

export default app;
