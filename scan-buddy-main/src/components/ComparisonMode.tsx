import { useState, useCallback } from "react";
import { ScanUpload } from "./ScanUpload";
import { useAnalyzeScan } from "@/hooks/useAnalyzeScan";
import { AnalysisResults } from "./AnalysisResults";
import { ArrowLeftRight } from "lucide-react";

export function ComparisonMode() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);
  const scan1 = useAnalyzeScan();
  const scan2 = useAnalyzeScan();

  const handleFile = useCallback((setter: (f: File) => void, previewSetter: (s: string) => void, analyzer: (f: File) => void) => {
    return (file: File) => {
      setter(file);
      const url = URL.createObjectURL(file);
      previewSetter(url);
      analyzer(file);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Scan 1</h4>
          <ScanUpload
            onFileSelected={handleFile(setFile1, setPreview1, scan1.analyzeScan)}
            preview={preview1}
            onClear={() => { setFile1(null); setPreview1(null); scan1.setAnalysis(null); }}
            isAnalyzing={scan1.isAnalyzing}
          />
          {scan1.analysis && <AnalysisResults analysis={scan1.analysis} />}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Scan 2</h4>
          <ScanUpload
            onFileSelected={handleFile(setFile2, setPreview2, scan2.analyzeScan)}
            preview={preview2}
            onClear={() => { setFile2(null); setPreview2(null); scan2.setAnalysis(null); }}
            isAnalyzing={scan2.isAnalyzing}
          />
          {scan2.analysis && <AnalysisResults analysis={scan2.analysis} />}
        </div>
      </div>

      {scan1.analysis && scan2.analysis && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Comparison Summary</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground">Metric</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Scan 1</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Scan 2</p>
            </div>
            {[
              { label: "Result", v1: scan1.analysis.overallResult, v2: scan2.analysis.overallResult },
              { label: "Confidence", v1: `${scan1.analysis.overallConfidence}%`, v2: `${scan2.analysis.overallConfidence}%` },
              { label: "Risk", v1: scan1.analysis.riskLevel, v2: scan2.analysis.riskLevel },
              { label: "Scan Type", v1: scan1.analysis.scanType, v2: scan2.analysis.scanType },
              { label: "Conditions", v1: scan1.analysis.conditions.length.toString(), v2: scan2.analysis.conditions.length.toString() },
            ].map((row) => (
              <>
                <div className="text-center text-muted-foreground">{row.label}</div>
                <div className="text-center text-foreground">{row.v1}</div>
                <div className="text-center text-foreground">{row.v2}</div>
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
