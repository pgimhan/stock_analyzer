import express from "express";
import multer from "multer";
import { extractFinancialData } from "./financialExtractor";
import fs from "fs/promises";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const app = express();
const upload = multer({ dest: "/tmp/uploads/" });

// Ensure tmp directory exists
try {
  await fs.mkdir('/tmp/uploads', { recursive: true });
} catch (e) {
  console.log('Tmp directory setup:', e);
}

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

    console.log('Processing file:', req.file.originalname, 'Size:', req.file.size);
    
    const dataBuffer = await fs.readFile(req.file.path);
    console.log('File read successfully, parsing PDF...');
    
    const pdfData = await pdfParse(dataBuffer);
    console.log('PDF parsed, text length:', pdfData.text.length);
    
    const result = await extractFinancialData(pdfData.text, apiKey);
    console.log('Financial data extracted successfully');

    try {
      await fs.unlink(req.file.path);
    } catch (e) {
      console.warn('Failed to delete temp file:', e);
    }

    res.json(result);
  } catch (error: any) {
    console.error("Error processing report:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: error.message || "Failed to process report" });
  }
});

export default app;
