import type { ScanAnalysis } from "@/types/scan";
import { Brain, Lightbulb, BookOpen } from "lucide-react";

interface ExplanationPanelProps {
  analysis: ScanAnalysis;
}

export function ExplanationPanel({ analysis }: ExplanationPanelProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-lg border border-border p-5 card-gradient shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Why This Result?</h3>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{analysis.explanation.summary}</p>
      </div>

      {analysis.explanation.details.length > 0 && (
        <div className="rounded-lg border border-border p-5 card-gradient shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-foreground">Key Findings</h3>
          </div>
          <ul className="space-y-2">
            {analysis.explanation.details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span className="text-sm text-foreground">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-border p-5 card-gradient shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-foreground">AI Reasoning</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{analysis.explanation.reasoning}</p>
      </div>

      {analysis.recommendations.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
          <h3 className="font-semibold text-foreground mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary font-bold text-sm">{i + 1}.</span>
                <span className="text-sm text-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
