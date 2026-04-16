import { useState } from "react";
import type { ScanAnalysis } from "@/types/scan";
import { Button } from "@/components/ui/button";
import { Eye, Layers, Image as ImageIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ScanVisualizationProps {
  preview: string;
  analysis: ScanAnalysis;
}

type ViewMode = "original" | "highlighted" | "overlay";

export function ScanVisualization({ preview, analysis }: ScanVisualizationProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("overlay");
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return { border: "rgba(239, 68, 68, 0.9)", bg: "rgba(239, 68, 68, 0.25)", glow: "rgba(239, 68, 68, 0.4)" };
      case "medium": return { border: "rgba(245, 158, 11, 0.9)", bg: "rgba(245, 158, 11, 0.2)", glow: "rgba(245, 158, 11, 0.35)" };
      default: return { border: "rgba(34, 197, 94, 0.9)", bg: "rgba(34, 197, 94, 0.15)", glow: "rgba(34, 197, 94, 0.3)" };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[
          { mode: "original" as ViewMode, icon: ImageIcon, label: "Original" },
          { mode: "highlighted" as ViewMode, icon: Eye, label: "Highlighted" },
          { mode: "overlay" as ViewMode, icon: Layers, label: "Overlay" },
        ].map(({ mode, icon: Icon, label }) => (
          <Button
            key={mode}
            size="sm"
            variant={viewMode === mode ? "default" : "outline"}
            onClick={() => setViewMode(mode)}
            className="gap-1.5"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </div>

      <div className="relative rounded-lg overflow-hidden border border-border shadow-card bg-muted/30">
        {/* Base image */}
        <img
          src={preview}
          alt="Medical scan"
          className={`w-full h-auto max-h-[400px] object-contain transition-all duration-300 ${
            viewMode === "highlighted" ? "brightness-75 contrast-110" : ""
          }`}
        />

        {/* Overlay: semi-transparent dark layer with cutouts */}
        {viewMode === "overlay" && analysis.regions.length > 0 && (
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        )}

        {/* Region boxes */}
        {viewMode !== "original" && analysis.regions.map((region, i) => {
          const colors = getSeverityColor(region.severity);
          const isHovered = hoveredRegion === i;

          return (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute cursor-pointer transition-all duration-200"
                    style={{
                      left: `${region.x}%`,
                      top: `${region.y}%`,
                      width: `${region.width}%`,
                      height: `${region.height}%`,
                      border: `2px solid ${colors.border}`,
                      borderRadius: "4px",
                      backgroundColor: viewMode === "overlay"
                        ? (isHovered ? colors.glow : colors.bg)
                        : "transparent",
                      boxShadow: viewMode === "highlighted"
                        ? `0 0 ${isHovered ? "12px" : "8px"} ${colors.glow}, inset 0 0 ${isHovered ? "8px" : "4px"} ${colors.glow}`
                        : isHovered ? `0 0 10px ${colors.glow}` : "none",
                      transform: isHovered ? "scale(1.02)" : "scale(1)",
                    }}
                    onMouseEnter={() => setHoveredRegion(i)}
                    onMouseLeave={() => setHoveredRegion(null)}
                  >
                    {/* Corner markers for highlighted mode */}
                    {viewMode === "highlighted" && (
                      <>
                        <span className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: colors.border }} />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: colors.border }} />
                        <span className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: colors.border }} />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: colors.border }} />
                      </>
                    )}

                    {/* Label */}
                    <span
                      className="absolute -top-5 left-0 text-xs px-1.5 py-0.5 rounded font-medium whitespace-nowrap"
                      style={{
                        backgroundColor: colors.border,
                        color: "white",
                        fontSize: "10px",
                      }}
                    >
                      {region.label}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="font-medium">{region.label}</p>
                  <p className="text-xs text-muted-foreground capitalize">Severity: {region.severity}</p>
                  {(region as any).description && (
                    <p className="text-xs mt-1">{(region as any).description}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {analysis.regions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {analysis.regions.map((region, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer transition-all ${
                hoveredRegion === i ? "ring-2 ring-primary" : ""
              } ${
                region.severity === "high"
                  ? "bg-destructive/10 text-destructive"
                  : region.severity === "medium"
                  ? "bg-warning/10 text-warning"
                  : "bg-success/10 text-success"
              }`}
              onMouseEnter={() => setHoveredRegion(i)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              {region.label} ({region.severity})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
