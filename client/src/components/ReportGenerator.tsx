import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import type { AnalysisResult, StockAnalysis } from "@shared/schema";
import jsPDF from "jspdf";

interface ReportGeneratorProps {
  result: AnalysisResult;
  inputData: StockAnalysis;
}

export default function ReportGenerator({ result, inputData }: ReportGeneratorProps) {
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      alert("Please save your OpenAI API key in AI Insights section first.");
      return;
    }

    setLoading(true);

    const prompt = `Generate a professional investment analysis report for this Sri Lankan stock:

STOCK: ${result.stockName} (${result.tickerSymbol})

VALUATION SUMMARY:
- Overall Score: ${result.overallScore.toFixed(2)}/5.0
- Verdict: ${result.verdict}
- Recommendation: ${result.recommendation}

KEY METRICS:
- Share Price: LKR ${inputData.sharePrice.toFixed(2)}
- P/E Ratio: ${result.ratios.pe.toFixed(2)} (Industry: ${inputData.industryAvgPE.toFixed(2)})
- P/BV Ratio: ${result.ratios.pbv.toFixed(2)}
- ROE: ${result.ratios.roe.toFixed(2)}%
- EPS Growth: ${inputData.epsGrowth.toFixed(2)}%
- Dividend Yield: ${result.ratios.dividendYield.toFixed(2)}%
- Debt/Equity: ${result.ratios.debtToEquity.toFixed(2)}

STRENGTHS:
${result.strengths.map(s => `- ${s}`).join('\n')}

CONCERNS:
${result.concerns.map(c => `- ${c}`).join('\n')}

Create a professional report with these EXACT section headers:

EXECUTIVE SUMMARY:
[2-3 sentences overview]

INVESTMENT THESIS:
[Why buy or avoid - 3-4 sentences]

FINANCIAL HEALTH:
[Key metrics interpretation - 3-4 sentences]

RISK ASSESSMENT:
[Main concerns - 2-3 sentences]

FINAL RECOMMENDATION:
[Clear action and rationale - 2 sentences]

Keep each section concise and use the exact headers shown above.`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(`Error: ${data.error.message}`);
        setLoading(false);
        return;
      }

      const reportContent = data.choices[0].message.content;
      downloadReport(reportContent);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Failed to generate report"}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (content: string) => {
    const pdf = new jsPDF();
    let y = 20;

    // Header
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(20, y, 190, y);
    y += 8;
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("INVESTMENT ANALYSIS REPORT", 105, y, { align: "center" });
    y += 10;
    pdf.setFontSize(16);
    pdf.text(`${result.stockName} (${result.tickerSymbol})`, 105, y, { align: "center" });
    y += 8;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 105, y, { align: "center" });
    y += 5;
    pdf.line(20, y, 190, y);
    y += 12;

    // Investment Rating
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("INVESTMENT RATING", 20, y);
    y += 8;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Overall Score: ${result.overallScore.toFixed(1)}/5.0`, 25, y);
    y += 6;
    pdf.text(`Verdict: ${result.verdict}`, 25, y);
    y += 6;
    pdf.text(`Recommendation: ${result.recommendation}`, 25, y);
    y += 10;

    // Financial Metrics
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("FINANCIAL METRICS", 20, y);
    y += 8;

    const metrics = [
      ["Share Price", `LKR ${inputData.sharePrice.toFixed(2)}`],
      ["EPS (TTM)", `LKR ${inputData.epsTTM.toFixed(2)}`],
      ["EPS (Forward)", inputData.epsForward ? `LKR ${inputData.epsForward.toFixed(2)}` : "N/A"],
      ["Revenue", `LKR ${(inputData.revenue / 1000000).toFixed(2)} Million`],
      ["Net Profit", `LKR ${(inputData.netProfit / 1000000).toFixed(2)} Million`],
      ["Total Assets", `LKR ${(inputData.totalAssets / 1000000).toFixed(2)} Million`],
      ["Total Debt", `LKR ${(inputData.debt / 1000000).toFixed(2)} Million`],
      ["Total Equity", `LKR ${(inputData.equity / 1000000).toFixed(2)} Million`],
      ["Cash Flow", `LKR ${(inputData.cashFlow / 1000000).toFixed(2)} Million`],
      ["P/E Ratio", `${result.ratios.pe.toFixed(2)}x`],
      ["Industry Avg P/E", `${inputData.industryAvgPE.toFixed(2)}x`],
      ["P/BV Ratio", `${result.ratios.pbv.toFixed(2)}x`],
      ["Industry Avg P/BV", `${inputData.industryAvgPBV.toFixed(2)}x`],
      ["ROE", `${result.ratios.roe.toFixed(2)}%`],
      ["Industry Avg ROE", `${inputData.industryAvgROE.toFixed(2)}%`],
      ["PEG Ratio", result.ratios.peg ? `${result.ratios.peg.toFixed(2)}` : "N/A"],
      ["EV/EBITDA", inputData.evEbitda ? `${result.ratios.evEbitda.toFixed(2)}x` : "N/A"],
      ["EPS Growth", `${inputData.epsGrowth.toFixed(2)}%`],
      ["Revenue Growth", `${inputData.revenueGrowth.toFixed(2)}%`],
      ["Dividend Yield", `${result.ratios.dividendYield.toFixed(2)}%`],
      ["Debt-to-Equity", `${result.ratios.debtToEquity.toFixed(2)}`],
      ["Market Index P/E", `${inputData.marketIndexPE?.toFixed(2) || '15.00'}x`],
    ];

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    metrics.forEach(([label, value]) => {
      pdf.text(`${label}:`, 25, y);
      pdf.setFont("helvetica", "bold");
      pdf.text(value, 100, y);
      pdf.setFont("helvetica", "normal");
      y += 6;
    });
    y += 8;

    // Score Breakdown
    if (y > 240) { pdf.addPage(); y = 20; }
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("SCORE BREAKDOWN", 20, y);
    y += 8;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const scores = [
      ["P/E vs Industry", `${result.scores.peVsIndustry.toFixed(2)}/5.0`, `(Weight: ${(result.weights.peVsIndustry * 100).toFixed(0)}%)`],
      ["P/BV vs Book", `${result.scores.pbvVsBook.toFixed(2)}/5.0`, `(Weight: ${(result.weights.pbvVsBook * 100).toFixed(0)}%)`],
      ["ROE Score", `${result.scores.roeScore.toFixed(2)}/5.0`, `(Weight: ${(result.weights.roeScore * 100).toFixed(0)}%)`],
      ["EPS Growth", `${result.scores.epsGrowthScore.toFixed(2)}/5.0`, `(Weight: ${(result.weights.epsGrowthScore * 100).toFixed(0)}%)`],
      ["Debt Score", `${result.scores.debtScore.toFixed(2)}/5.0`, `(Weight: ${(result.weights.debtScore * 100).toFixed(0)}%)`],
      ["Cash Flow", `${result.scores.cashFlowScore.toFixed(2)}/5.0`, `(Weight: ${(result.weights.cashFlowScore * 100).toFixed(0)}%)`],
      ["Dividend Score", `${result.scores.dividendScore.toFixed(2)}/5.0`, `(Weight: ${(result.weights.dividendScore * 100).toFixed(0)}%)`],
    ];
    scores.forEach(([label, score, weight]) => {
      if (y > 280) { pdf.addPage(); y = 20; }
      pdf.text(`${label}:`, 25, y);
      pdf.setFont("helvetica", "bold");
      pdf.text(score, 100, y);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(weight, 130, y);
      pdf.setFontSize(10);
      y += 6;
    });
    y += 8;

    // Industry Comparisons
    if (y > 240) { pdf.addPage(); y = 20; }
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("INDUSTRY COMPARISONS", 20, y);
    y += 8;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const comparisons = [
      ["P/E vs Industry", `${result.comparisons.peVsIndustry > 0 ? '+' : ''}${result.comparisons.peVsIndustry.toFixed(2)}%`],
      ["P/BV vs Industry", `${result.comparisons.pbvVsIndustry > 0 ? '+' : ''}${result.comparisons.pbvVsIndustry.toFixed(2)}%`],
      ["ROE vs Industry", `${result.comparisons.roeVsIndustry > 0 ? '+' : ''}${result.comparisons.roeVsIndustry.toFixed(2)}%`],
    ];
    comparisons.forEach(([label, value]) => {
      if (y > 280) { pdf.addPage(); y = 20; }
      pdf.text(`${label}:`, 25, y);
      pdf.setFont("helvetica", "bold");
      pdf.text(value, 100, y);
      pdf.setFont("helvetica", "normal");
      y += 6;
    });
    y += 8;

    // Key Strengths
    if (y > 240) { pdf.addPage(); y = 20; }
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("KEY STRENGTHS", 20, y);
    y += 8;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    result.strengths.forEach((s, i) => {
      const lines = pdf.splitTextToSize(`${i + 1}. ${s}`, 165);
      lines.forEach((line: string) => {
        if (y > 280) { pdf.addPage(); y = 20; }
        pdf.text(line, 25, y);
        y += 5;
      });
      y += 3;
    });
    y += 8;

    // Risk Factors
    if (y > 240) { pdf.addPage(); y = 20; }
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("RISK FACTORS", 20, y);
    y += 8;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    result.concerns.forEach((c, i) => {
      const lines = pdf.splitTextToSize(`${i + 1}. ${c}`, 165);
      lines.forEach((line: string) => {
        if (y > 280) { pdf.addPage(); y = 20; }
        pdf.text(line, 25, y);
        y += 5;
      });
      y += 3;
    });
    y += 10;

    // Professional Analysis
    if (y > 230) { pdf.addPage(); y = 20; }
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("PROFESSIONAL ANALYSIS", 20, y);
    y += 10;

    const sections = content.split(/\n(?=[A-Z][A-Z ]+:)/g);
    sections.forEach(section => {
      const lines = section.trim().split('\n');
      if (lines.length === 0) return;
      const header = lines[0];
      const body = lines.slice(1).join(' ').trim();
      
      if (header.includes(':') && body) {
        if (y > 250) { pdf.addPage(); y = 20; }
        
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(header.replace(':', ''), 20, y);
        y += 7;
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        const bodyLines = pdf.splitTextToSize(body, 170);
        bodyLines.forEach((line: string) => {
          if (y > 280) { pdf.addPage(); y = 20; }
          pdf.text(line, 20, y);
          y += 5;
        });
        y += 8;
      }
    });

    // Footer
    if (y > 260) { pdf.addPage(); y = 20; } else { y += 10; }
    pdf.setLineWidth(0.5);
    pdf.line(20, y, 190, y);
    y += 6;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    const disclaimer = "DISCLAIMER: This report is for informational purposes only and does not constitute investment advice. Past performance is not indicative of future results. Please consult a qualified financial advisor before making investment decisions. All data should be independently verified.";
    const disclaimerLines = pdf.splitTextToSize(disclaimer, 170);
    disclaimerLines.forEach((line: string) => { pdf.text(line, 20, y); y += 4; });

    pdf.save(`${result.tickerSymbol}_Investment_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Button 
      onClick={generateReport} 
      disabled={loading}
      variant="outline"
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Export Report
        </>
      )}
    </Button>
  );
}
