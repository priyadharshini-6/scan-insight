import jsPDF from "jspdf";
import type { ScanAnalysis } from "@/types/scan";

export async function generateReport(analysis: ScanAnalysis, imageDataUrl?: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFillColor(30, 100, 180);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("Medical Scan Analysis Report", pageWidth / 2, 18, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: "center" });
  doc.text("Multi-Scan Medical Analyzer", pageWidth / 2, 36, { align: "center" });

  y = 50;
  doc.setTextColor(0, 0, 0);

  // Disclaimer
  doc.setFillColor(255, 243, 205);
  doc.rect(15, y, pageWidth - 30, 12, "F");
  doc.setFontSize(8);
  doc.setTextColor(120, 80, 0);
  doc.text("⚠ DISCLAIMER: This report is for educational purposes only and not a substitute for professional medical diagnosis.", pageWidth / 2, y + 7, { align: "center" });
  y += 18;

  doc.setTextColor(0, 0, 0);

  // Scan Image
  if (imageDataUrl) {
    try {
      doc.addImage(imageDataUrl, "JPEG", 15, y, 60, 60);
    } catch {}
    // Info next to image
    const infoX = 85;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Scan Information", infoX, y + 8);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Scan Type: ${analysis.scanType} (${analysis.scanTypeConfidence}% confidence)`, infoX, y + 18);
    doc.text(`Overall Result: ${analysis.overallResult}`, infoX, y + 26);
    doc.text(`Confidence: ${analysis.overallConfidence}%`, infoX, y + 34);
    doc.text(`Risk Level: ${analysis.riskLevel}`, infoX, y + 42);
    doc.text(`Image Quality: ${analysis.qualityAssessment.quality}`, infoX, y + 50);
    y += 68;
  } else {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Scan Information", 15, y + 8);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    y += 12;
    doc.text(`Scan Type: ${analysis.scanType} (${analysis.scanTypeConfidence}% confidence)`, 15, y);
    y += 8;
    doc.text(`Overall Result: ${analysis.overallResult} (${analysis.overallConfidence}% confidence)`, 15, y);
    y += 8;
    doc.text(`Risk Level: ${analysis.riskLevel}`, 15, y);
    y += 8;
    doc.text(`Image Quality: ${analysis.qualityAssessment.quality}`, 15, y);
    y += 14;
  }

  // Separator
  doc.setDrawColor(200);
  doc.line(15, y, pageWidth - 15, y);
  y += 8;

  // Conditions
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detected Conditions", 15, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  for (const condition of analysis.conditions) {
    if (y > 260) { doc.addPage(); y = 20; }
    const barWidth = (condition.confidence / 100) * 60;
    doc.setFillColor(condition.confidence > 70 ? 220 : condition.confidence > 40 ? 245 : 144, condition.confidence > 70 ? 50 : condition.confidence > 40 ? 158 : 200, condition.confidence > 70 ? 50 : condition.confidence > 40 ? 11 : 100);
    doc.rect(15, y - 3, barWidth, 5, "F");
    doc.setFillColor(230, 230, 230);
    doc.rect(15 + barWidth, y - 3, 60 - barWidth, 5, "F");
    doc.text(`${condition.name}: ${condition.confidence}%`, 80, y);
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(condition.description, 80, y);
    doc.setFontSize(10);
    doc.setTextColor(0);
    y += 10;
  }

  // Explanation
  y += 4;
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setDrawColor(200);
  doc.line(15, y, pageWidth - 15, y);
  y += 8;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Analysis Explanation", 15, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const summaryLines = doc.splitTextToSize(analysis.explanation.summary, pageWidth - 30);
  doc.text(summaryLines, 15, y);
  y += summaryLines.length * 5 + 6;

  if (analysis.explanation.details.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Key Findings:", 15, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    for (const detail of analysis.explanation.details) {
      if (y > 270) { doc.addPage(); y = 20; }
      const lines = doc.splitTextToSize(`• ${detail}`, pageWidth - 35);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 2;
    }
  }

  // Recommendations
  if (analysis.recommendations.length > 0) {
    y += 6;
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.text("Recommendations:", 15, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    for (let i = 0; i < analysis.recommendations.length; i++) {
      if (y > 270) { doc.addPage(); y = 20; }
      const lines = doc.splitTextToSize(`${i + 1}. ${analysis.recommendations[i]}`, pageWidth - 35);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 2;
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Multi-Scan Medical Analyzer • Page ${i} of ${pageCount} • For educational purposes only`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save("medical-scan-report.pdf");
}
