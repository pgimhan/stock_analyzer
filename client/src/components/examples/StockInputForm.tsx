import StockInputForm from '../StockInputForm';

export default function StockInputFormExample() {
  const handleAnalyze = (data: any) => {
    console.log('Stock analysis data:', data);
  };

  return <StockInputForm onAnalyze={handleAnalyze} />;
}
