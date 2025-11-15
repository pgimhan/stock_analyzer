export async function saveAnalysisToDb(userId: string, stockName: string, tickerSymbol: string, inputData: any, result: any) {
  const res = await fetch("/api/analyses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, stockName, tickerSymbol, inputData, result }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to save analysis: ${error}`);
  }
  return res.json();
}

export async function getAnalysesFromDb(userId: string) {
  const res = await fetch(`/api/analyses/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch analyses");
  return res.json();
}

export async function deleteAnalysisFromDb(id: string) {
  const res = await fetch(`/api/analyses/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete analysis");
  return res.json();
}
