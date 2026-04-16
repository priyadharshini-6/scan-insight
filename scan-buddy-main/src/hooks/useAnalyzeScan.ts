import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ScanAnalysis } from "@/types/scan";
import { toast } from "sonner";

export function useAnalyzeScan() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ScanAnalysis | null>(null);

  const analyzeScan = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const base64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke("analyze-scan", {
        body: { imageBase64: base64, mimeType: file.type || "image/jpeg" },
      });

      if (error) throw error;
      setAnalysis(data as ScanAnalysis);
      toast.success("Analysis complete!");
    } catch (err: any) {
      console.error("Analysis failed:", err);
      toast.error(err?.message || "Failed to analyze scan. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return { isAnalyzing, analysis, analyzeScan, setAnalysis };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
