import type { ScanAnalysis } from "@/types/scan";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Activity, Shield, Eye } from "lucide-react";

interface AnalysisResultsProps {
  analysis: ScanAnalysis;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const riskColor = analysis.riskLevel === "Low" ? "success" : analysis.riskLevel === "Medium" ? "warning" : "destructive";
  const resultIcon = analysis.overallResult === "Normal" 
    ? <CheckCircle2 className="h-6 w-6 text-success" /> 
    : <AlertTriangle className="h-6 w-6 text-warning" />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Result */}
      <div className="rounded-lg border border-border p-5 card-gradient shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {resultIcon}
            <div>
              <h3 className="font-semibold text-lg text-foreground">{analysis.overallResult}</h3>
              <p className="text-sm text-muted-foreground">Overall Assessment</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{analysis.overallConfidence}%</p>
            <p className="text-xs text-muted-foreground">Confidence</p>
          </div>
        </div>
        <Progress value={analysis.overallConfidence} className="h-2" />
      </div>

      {/* Scan Type & Quality */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border p-4 card-gradient shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Scan Type</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{analysis.scanType}</p>
          <p className="text-xs text-muted-foreground">{analysis.scanTypeConfidence}% confidence</p>
        </div>
        <div className="rounded-lg border border-border p-4 card-gradient shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Risk Level</span>
          </div>
          <Badge variant={riskColor === "success" ? "default" : riskColor === "warning" ? "secondary" : "destructive"} className={`text-sm ${riskColor === "success" ? "risk-low text-success-foreground" : riskColor === "warning" ? "risk-medium text-warning-foreground" : "risk-high text-destructive-foreground"}`}>
            {analysis.riskLevel} Risk
          </Badge>
          <QualityBadge quality={analysis.qualityAssessment.quality} />
        </div>
      </div>

      {/* Conditions */}
      <div className="rounded-lg border border-border p-5 card-gradient shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Detected Conditions</h3>
        </div>
        <div className="space-y-3">
          {analysis.conditions.map((condition, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{condition.name}</span>
                  <span className="text-sm font-bold text-foreground">{condition.confidence}%</span>
                </div>
                <Progress
                  value={condition.confidence}
                  className={`h-1.5 ${condition.confidence > 70 ? "[&>div]:bg-destructive" : condition.confidence > 40 ? "[&>div]:bg-warning" : "[&>div]:bg-success"}`}
                />
                <p className="text-xs text-muted-foreground mt-1">{condition.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Warning */}
      {analysis.qualityAssessment.quality === "Poor" && (
        <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Image Quality Warning</p>
            <p className="text-xs text-muted-foreground">{analysis.qualityAssessment.issues.join(", ")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function QualityBadge({ quality }: { quality: string }) {
  const color = quality === "Good" ? "text-success" : quality === "Acceptable" ? "text-warning" : "text-destructive";
  return <p className={`text-xs mt-1 ${color}`}>Quality: {quality}</p>;
}
