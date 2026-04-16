import type { ScanAnalysis } from "@/types/scan";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Microscope, MapPin, Ruler, AlertCircle } from "lucide-react";

interface DetailedAnalysisProps {
  analysis: ScanAnalysis;
}

export function DetailedAnalysis({ analysis }: DetailedAnalysisProps) {
  const detailedFindings = (analysis as any).detailedFindings as Array<{
    area: string;
    observation: string;
    significance: string;
    severity: string;
  }> | undefined;

  const measurements = (analysis as any).measurements as { notes: string[] } | undefined;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Per-condition deep dive */}
      <div className="rounded-lg border border-border p-5 card-gradient shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Microscope className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Condition Breakdown</h3>
        </div>
        <div className="space-y-4">
          {analysis.conditions.map((condition, i) => (
            <div key={i} className="border border-border rounded-md p-3 bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{condition.name}</span>
                <Badge
                  variant={condition.confidence > 70 ? "destructive" : condition.confidence > 40 ? "secondary" : "default"}
                  className="text-xs"
                >
                  {condition.confidence}%
                </Badge>
              </div>
              <Progress
                value={condition.confidence}
                className={`h-1.5 mb-2 ${condition.confidence > 70 ? "[&>div]:bg-destructive" : condition.confidence > 40 ? "[&>div]:bg-warning" : "[&>div]:bg-success"}`}
              />
              <p className="text-xs text-muted-foreground">{condition.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Findings */}
      {detailedFindings && detailedFindings.length > 0 && (
        <div className="rounded-lg border border-border p-5 card-gradient shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Anatomical Findings</h3>
          </div>
          <div className="space-y-3">
            {detailedFindings.map((finding, i) => {
              const severityColor =
                finding.severity === "severe" ? "text-destructive" :
                finding.severity === "moderate" ? "text-warning" :
                finding.severity === "mild" ? "text-yellow-500" :
                "text-success";
              return (
                <div key={i} className="border-l-2 border-primary/30 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{finding.area}</span>
                    <span className={`text-xs font-medium capitalize ${severityColor}`}>
                      ({finding.severity})
                    </span>
                  </div>
                  <p className="text-xs text-foreground">{finding.observation}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{finding.significance}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Region Details */}
      {analysis.regions.length > 0 && (
        <div className="rounded-lg border border-border p-5 card-gradient shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-foreground">Highlighted Regions</h3>
          </div>
          <div className="space-y-3">
            {analysis.regions.map((region, i) => (
              <div key={i} className="flex items-start gap-3 border border-border rounded-md p-3 bg-muted/20">
                <div
                  className="w-3 h-3 rounded-full mt-0.5 shrink-0"
                  style={{
                    backgroundColor: region.severity === "high" ? "rgb(239,68,68)" : region.severity === "medium" ? "rgb(245,158,11)" : "rgb(34,197,94)",
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{region.label}</p>
                  <p className="text-xs text-muted-foreground capitalize">Severity: {region.severity}</p>
                  {(region as any).description && (
                    <p className="text-xs text-foreground mt-1">{(region as any).description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Measurements */}
      {measurements && measurements.notes && measurements.notes.length > 0 && (
        <div className="rounded-lg border border-border p-5 card-gradient shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Measurements & Notes</h3>
          </div>
          <ul className="space-y-1">
            {measurements.notes.map((note, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="text-sm text-foreground">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quality issues detail */}
      {analysis.qualityAssessment.issues.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <p className="text-sm font-medium text-foreground mb-2">Quality Issues</p>
          <ul className="space-y-1">
            {analysis.qualityAssessment.issues.map((issue, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
