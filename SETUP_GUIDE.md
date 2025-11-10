# Financial Report Import - Setup Guide

## Quick Setup

### 1. Get OpenAI API Key
- Visit https://platform.openai.com/api-keys
- Create new API key
- Copy the key

### 2. Configure Environment
Create `.env` file in project root:
```
OPENAI_API_KEY=sk-your-key-here
```

### 3. Run Application
```bash
npm run dev
```

## How to Use

1. Open the app in browser
2. Find "Upload Financial Report" card
3. Click "Choose File" and select PDF
4. Click "Extract Data"
5. View extracted data and calculated ratios

## What Gets Extracted

- Company Name & Report Period
- Revenue, Net Income, Assets, Equity
- EPS, Book Value Per Share
- Auto-calculated: ROE, ROA, Current Ratio, Debt-to-Equity, Profit Margin

## Features

✅ AI-powered data extraction from PDFs
✅ Automatic ratio calculation
✅ Clear missing data indicators
✅ Secure file handling (auto-deleted after processing)
✅ Cost-effective (~$0.01-0.03 per report)

## Files Created

- `client/src/components/FinancialReportUpload.tsx` - Upload UI
- `server/financialExtractor.ts` - AI extraction logic
- `server/routes.ts` - API endpoint
- `shared/financialSchema.ts` - Type definitions
