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

Create a professional report with these sections:
1. Executive Summary (2-3 sentences)
2. Investment Thesis (why buy/avoid)
3. Financial Analysis (key metrics interpretation)
4. Risk Factors (main concerns)
5. Conclusion & Recommendation

Keep it concise and professional.`;

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
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("STOCK ANALYSIS REPORT", 105, y, { align: "center" });
    y += 15;

    // Company Info
    pdf.setFontSize(12);
    pdf.text(`${result.stockName} (${result.tickerSymbol})`, 105, y, { align: "center" });
    y += 7;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Date: ${new Date().toLocaleDateString()} | Score: ${result.overallScore.toFixed(2)}/5.0`, 105, y, { align: "center" });
    y += 15;

    // Financial Snapshot
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Financial Snapshot", 20, y);
    y += 8;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const metrics = [
      `Share Price: LKR ${inputData.sharePrice.toFixed(2)}`,
      `P/E Ratio: ${result.ratios.pe.toFixed(2)}x | P/BV: ${result.ratios.pbv.toFixed(2)}x`,
      `ROE: ${result.ratios.roe.toFixed(2)}% | Debt/Equity: ${result.ratios.debtToEquity.toFixed(2)}`,
      `EPS Growth: ${inputData.epsGrowth.toFixed(2)}% | Revenue Growth: ${inputData.revenueGrowth.toFixed(2)}%`,
      `Dividend Yield: ${result.ratios.dividendYield.toFixed(2)}%`,
    ];
    metrics.forEach(m => { pdf.text(m, 20, y); y += 6; });
    y += 5;

    // Verdict
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Valuation Verdict", 20, y);
    y += 8;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Verdict: ${result.verdict} | Recommendation: ${result.recommendation}`, 20, y);
    y += 10;

    // Analysis
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Detailed Analysis", 20, y);
    y += 8;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    const lines = pdf.splitTextToSize(content, 170);
    lines.forEach((line: string) => {
      if (y > 270) { pdf.addPage(); y = 20; }
      pdf.text(line, 20, y);
      y += 5;
    });
    y += 5;

    // Strengths
    if (y > 250) { pdf.addPage(); y = 20; }
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Strengths", 20, y);
    y += 7;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    result.strengths.forEach((s, i) => {
      if (y > 270) { pdf.addPage(); y = 20; }
      const strengthLines = pdf.splitTextToSize(`${i + 1}. ${s}`, 170);
      strengthLines.forEach((line: string) => { pdf.text(line, 20, y); y += 5; });
    });
    y += 5;

    // Concerns
    if (y > 250) { pdf.addPage(); y = 20; }
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Concerns", 20, y);
    y += 7;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    result.concerns.forEach((c, i) => {
      if (y > 270) { pdf.addPage(); y = 20; }
      const concernLines = pdf.splitTextToSize(`${i + 1}. ${c}`, 170);
      concernLines.forEach((line: string) => { pdf.text(line, 20, y); y += 5; });
    });

    // Disclaimer
    if (y > 250) { pdf.addPage(); y = 20; }
    y += 10;
    pdf.setFontSize(8);
    pdf.setTextColor(100);
    const disclaimer = "Disclaimer: This report is for informational purposes only and does not constitute financial advice. Please consult with a qualified financial advisor before making investment decisions.";
    const disclaimerLines = pdf.splitTextToSize(disclaimer, 170);
    disclaimerLines.forEach((line: string) => { pdf.text(line, 20, y); y += 4; });

    pdf.save(`${result.tickerSymbol}_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
