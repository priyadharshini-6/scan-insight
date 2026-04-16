import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { ScanUpload } from "@/components/ScanUpload";
import { AnalysisResults } from "@/components/AnalysisResults";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { DetailedAnalysis } from "@/components/DetailedAnalysis";
import { ScanVisualization } from "@/components/ScanVisualization";
import { ScanChat } from "@/components/ScanChat";
import { ComparisonMode } from "@/components/ComparisonMode";
import { useAnalyzeScan } from "@/hooks/useAnalyzeScan";
import { useScanChat } from "@/hooks/useScanChat";
import { useTheme } from "@/hooks/useTheme";
import { generateReport } from "@/lib/generateReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, ArrowLeftRight, FileText, BarChart3, Brain, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [preview, setPreview] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [mimeType, setMimeType] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState("analyze");
  const [manualScanType, setManualScanType] = useState<string | null>(null);

  const { isAnalyzing, analysis, analyzeScan, setAnalysis } = useAnalyzeScan();
  const { messages, isLoading: chatLoading, sendMessage, clearChat } = useScanChat();

  const handleFileSelected = useCallback((file: File) => {
    setCurrentFile(file);
    setPreview(URL.createObjectURL(file));
    setManualScanType(null);

    // Store base64 for chat
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageBase64(result.split(",")[1]);
      setMimeType(file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);

    analyzeScan(file);
  }, [analyzeScan]);

  const handleClear = useCallback(() => {
    setCurrentFile(null);
    setPreview(null);
    setImageBase64(undefined);
    setMimeType(undefined);
    setAnalysis(null);
    setManualScanType(null);
    clearChat();
  }, [setAnalysis, clearChat]);

  const handleDownloadReport = useCallback(() => {
    if (!analysis) return;
    generateReport(analysis, preview || undefined);
    toast.success("Report downloaded!");
  }, [analysis, preview]);

  const handleChatSend = useCallback((msg: string) => {
    sendMessage(msg, analysis, imageBase64, mimeType);
  }, [sendMessage, analysis, imageBase64, mimeType]);

  return (
    <div className="min-h-screen bg-background">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      {/* Disclaimer */}
      <div className="bg-warning/10 border-b border-warning/20">
        <div className="container mx-auto px-4 py-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
          <p className="text-xs text-foreground">
            <strong>Disclaimer:</strong> This system is for educational purposes only and not a substitute for professional medical diagnosis.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <TabsList className="bg-secondary">
              <TabsTrigger value="analyze" className="gap-1.5">
                <BarChart3 className="h-4 w-4" />
                Analyze
              </TabsTrigger>
              <TabsTrigger value="compare" className="gap-1.5">
                <ArrowLeftRight className="h-4 w-4" />
                Compare
              </TabsTrigger>
            </TabsList>

            {analysis && (
              <Button onClick={handleDownloadReport} className="gap-2 medical-gradient text-primary-foreground hover:opacity-90">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            )}
          </div>

          <TabsContent value="analyze">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Upload & Visualization */}
              <div className="lg:col-span-1 space-y-4">
                <div className="rounded-lg border border-border p-4 card-gradient shadow-card">
                  <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Upload Scan
                  </h2>
                  <ScanUpload
                    onFileSelected={handleFileSelected}
                    preview={preview}
                    onClear={handleClear}
                    isAnalyzing={isAnalyzing}
                  />

                  {/* Manual Scan Type Override */}
                  {analysis && (
                    <div className="mt-3">
                      <label className="text-xs text-muted-foreground mb-1 block">Override Scan Type</label>
                      <Select value={manualScanType || analysis.scanType} onValueChange={setManualScanType}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="X-ray">X-ray</SelectItem>
                          <SelectItem value="MRI">MRI</SelectItem>
                          <SelectItem value="CT Scan">CT Scan</SelectItem>
                          <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Visualization */}
                {analysis && preview && (
                  <div className="rounded-lg border border-border p-4 card-gradient shadow-card">
                    <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      Region Analysis
                    </h2>
                    <ScanVisualization preview={preview} analysis={analysis} />
                  </div>
                )}
              </div>

              {/* Middle Column - Results */}
              <div className="lg:col-span-1 space-y-4">
                {analysis ? (
                  <Tabs defaultValue="overview">
                    <TabsList className="w-full bg-secondary">
                      <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                      <TabsTrigger value="detailed" className="flex-1">Details</TabsTrigger>
                      <TabsTrigger value="explanation" className="flex-1">Explain</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                      <AnalysisResults analysis={analysis} />
                    </TabsContent>
                    <TabsContent value="detailed">
                      <DetailedAnalysis analysis={analysis} />
                    </TabsContent>
                    <TabsContent value="explanation">
                      <ExplanationPanel analysis={analysis} />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="rounded-lg border border-border p-8 card-gradient shadow-card text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Upload a medical scan to see analysis results</p>
                  </div>
                )}
              </div>

              {/* Right Column - Chat */}
              <div className="lg:col-span-1">
                <ScanChat
                  messages={messages}
                  isLoading={chatLoading}
                  onSend={handleChatSend}
                  onClear={clearChat}
                  hasAnalysis={!!analysis}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compare">
            <ComparisonMode />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
