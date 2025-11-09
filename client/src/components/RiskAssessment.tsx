import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Shield, TrendingDown } from "lucide-react";
import type { AnalysisResult, StockAnalysis } from "@shared/schema";

interface RiskAssessmentProps {
  result: AnalysisResult;
  inputData: StockAnalysis;
}

export default function RiskAssessment({ result, inputData }: RiskAssessmentProps) {
  const [risks, setRisks] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [aiRiskLevel, setAiRiskLevel] = useState<"Low" | "Medium" | "High">("Medium");
  const [scoreRiskLevel, setScoreRiskLevel] = useState<"Low" | "Medium" | "High">("Medium");

  const assessRisks = async () => {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      setRisks("Please save your OpenAI API key in AI Insights section first.");
      return;
    }

    setLoading(true);

    const prompt = `As a risk analyst, assess the overall risk level and identify hidden risks for this Sri Lankan stock:

Stock: ${result.stockName} (${result.tickerSymbol})
Overall Score: ${result.overallScore.toFixed(2)}/5.0

Financial Patterns:
- Debt/Equity: ${result.ratios.debtToEquity.toFixed(2)}
- Cash Flow: ${inputData.cashFlow.toFixed(2)}M LKR vs Net Profit: ${inputData.netProfit.toFixed(2)}M LKR
- ROE: ${result.ratios.roe.toFixed(2)}% vs Industry: ${inputData.industryAvgROE.toFixed(2)}%
- P/E: ${result.ratios.pe.toFixed(2)} vs Industry: ${inputData.industryAvgPE.toFixed(2)}
- EPS Growth: ${inputData.epsGrowth.toFixed(2)}%
- Revenue Growth: ${inputData.revenueGrowth.toFixed(2)}%
- Dividend Yield: ${result.ratios.dividendYield.toFixed(2)}%

First line must be: RISK_LEVEL: [Low/Medium/High]

Then identify 3-5 specific risks in this format:

**🔴 [Risk Category]**
- Issue: [What's wrong with specific numbers]
- Impact: [Why it matters for investors]
- Warning Sign: [Red flag indicator]

Prioritize the most critical risks first. Focus on: debt levels, cash flow issues, declining metrics, overvaluation, sector risks.`;

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
          temperature: 0.5,
          max_tokens: 600,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setRisks(`Error: ${data.error.message}`);
      } else {
        const content = data.choices[0].message.content;
        const riskLevelMatch = content.match(/RISK_LEVEL:\s*(Low|Medium|High)/i);
        
        if (riskLevelMatch) {
          setAiRiskLevel(riskLevelMatch[1] as "Low" | "Medium" | "High");
          setRisks(content.replace(/RISK_LEVEL:.*\n/, ''));
        } else {
          setRisks(content);
        }
      }
    } catch (error) {
      setRisks(`Error: ${error instanceof Error ? error.message : "Failed to assess risks"}`);
    } finally {
      setLoading(false);
    }
  };



  const calculateScoreRisk = () => {
    let riskScore = 0;
    
    if (result.ratios.debtToEquity > 1) riskScore += 2;
    else if (result.ratios.debtToEquity > 0.7) riskScore += 1;
    
    if (inputData.cashFlow < 0) riskScore += 2;
    else if (inputData.cashFlow < inputData.netProfit * 0.5) riskScore += 1;
    
    if (result.ratios.roe < 5) riskScore += 2;
    else if (result.ratios.roe < 10) riskScore += 1;
    
    if (result.ratios.pe > inputData.industryAvgPE * 2) riskScore += 2;
    else if (result.ratios.pe > inputData.industryAvgPE * 1.5) riskScore += 1;
    
    if (inputData.epsGrowth < 0) riskScore += 2;
    
    if (riskScore >= 6) setScoreRiskLevel("High");
    else if (riskScore >= 3) setScoreRiskLevel("Medium");
    else setScoreRiskLevel("Low");
  };

  useEffect(() => {
    calculateScoreRisk();
    if (localStorage.getItem("openai_api_key")) {
      assessRisks();
    }
  }, []);

  const getRiskColor = (level: "Low" | "Medium" | "High") => {
    if (level === "High") return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900";
    if (level === "Medium") return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900";
    return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900";
  };

  const getRiskIcon = (level: "Low" | "Medium" | "High") => {
    if (level === "High") return <AlertTriangle className="h-5 w-5" />;
    if (level === "Medium") return <TrendingDown className="h-5 w-5" />;
    return <Shield className="h-5 w-5" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Risk Assessment
        </CardTitle>
        <CardDescription>AI identifies hidden risks and red flags</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Score-Based Risk */}
          <div className={`p-4 rounded-md border ${getRiskColor(scoreRiskLevel)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getRiskIcon(scoreRiskLevel)}
                <span className="font-bold text-sm">Score-Based Risk</span>
              </div>
              <div className="text-xl font-bold">
                {scoreRiskLevel === "High" && "⚠️"}
                {scoreRiskLevel === "Medium" && "⚡"}
                {scoreRiskLevel === "Low" && "✓"}
              </div>
            </div>
            <div className="text-lg font-bold mb-2">{scoreRiskLevel}</div>
            <div className="text-xs opacity-90">
              Based on financial metrics: Debt/Equity, Cash Flow, ROE, P/E, EPS Growth
            </div>
          </div>

          {/* AI Risk Assessment */}
          <div className={`p-4 rounded-md border ${getRiskColor(aiRiskLevel)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getRiskIcon(aiRiskLevel)}
                <span className="font-bold text-sm">AI Risk Assessment</span>
              </div>
              <div className="text-xl font-bold">
                {aiRiskLevel === "High" && "⚠️"}
                {aiRiskLevel === "Medium" && "⚡"}
                {aiRiskLevel === "Low" && "✓"}
              </div>
            </div>
            <div className="text-lg font-bold mb-2">{aiRiskLevel}</div>
            <div className="text-xs opacity-90">
              AI-powered analysis of hidden risks and market patterns
            </div>
          </div>
        </div>

        {!risks && !loading && (
          <Button onClick={assessRisks} variant="outline" className="w-full gap-2">
            <AlertTriangle className="h-4 w-4" />
            Get AI Risk Analysis
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Analyzing risk patterns...</span>
          </div>
        )}

        {risks && !loading && (
          <div className="space-y-3">
            {risks.split('**').filter(Boolean).map((section, i) => {
              if (!section.trim()) return null;
              
              const lines = section.trim().split('\n').filter(Boolean);
              const title = lines[0].replace(/🔴|\[|\]/g, '').trim();
              const content = lines.slice(1).join('\n');
              
              let issue = '';
              let impact = '';
              let warning = '';
              
              content.split('\n').forEach(line => {
                const cleanLine = line.replace(/^-\s*/, '').trim();
                if (cleanLine.startsWith('Issue:')) {
                  issue = cleanLine.replace('Issue:', '').trim();
                } else if (cleanLine.startsWith('Impact:')) {
                  impact = cleanLine.replace('Impact:', '').trim();
                } else if (cleanLine.startsWith('Warning Sign:')) {
                  warning = cleanLine.replace('Warning Sign:', '').trim();
                }
              });
              
              return (
                <div key={i} className="border-l-4 border-red-500 bg-white dark:bg-gray-900 p-4 rounded-r-lg shadow-sm">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-3 flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    {title}
                  </h4>
                  
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {issue && <p>{issue}</p>}
                    {impact && <p className="text-gray-600 dark:text-gray-400">{impact}</p>}
                    {warning && (
                      <p className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 font-medium">
                        ⚠️ {warning}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
