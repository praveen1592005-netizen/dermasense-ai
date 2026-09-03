import { Report } from '../types/report';

/**
 * PDF Report Service
 * Generates a properly formatted, printable PDF from analysis report data.
 * Uses browser's built-in print-to-PDF with a print-specific CSS layout.
 * No external libraries required.
 */
export const pdfReportService = {
  /**
   * Opens a new window with a formatted medical report and triggers browser print dialog.
   * Users can "Save as PDF" from the print dialog on any modern browser.
   */
  downloadPDF(report: Report): void {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Please allow popups for DermaSense AI to download reports.');
      return;
    }

    const formatDate = (iso: string) => {
      try {
        return new Date(iso).toLocaleDateString('en-IN', {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
      } catch {
        return iso;
      }
    };

    const section = (title: string, items: string[] | undefined) => {
      if (!items || items.length === 0) return '';
      return `
        <div class="section">
          <h3>${title}</h3>
          <ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>
        </div>
      `;
    };

    const imageSection = report.imagePreview
      ? `<div class="image-section"><img src="${report.imagePreview}" alt="Skin Analysis Image" /></div>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DermaSense AI Report – ${report.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; color: #1e293b; font-size: 12px; line-height: 1.6; background: white; padding: 32px; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }
    .logo { font-size: 20px; font-weight: 700; color: #6366f1; }
    .logo span { color: #0d9488; }
    .report-meta { text-align: right; font-size: 11px; color: #64748b; }
    .report-id { font-weight: 600; color: #1e293b; }
    h2.report-title { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 100px; font-size: 10px; font-weight: 600; background: #ede9fe; color: #7c3aed; margin-bottom: 16px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .info-box h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 6px; }
    .info-box p { font-weight: 600; font-size: 13px; color: #1e293b; }
    .section { margin-bottom: 16px; }
    .section h3 { font-size: 12px; font-weight: 700; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em; }
    .section ul { padding-left: 18px; }
    .section ul li { margin-bottom: 3px; color: #475569; }
    .image-section { margin-bottom: 16px; }
    .image-section img { max-width: 220px; border-radius: 8px; border: 2px solid #e2e8f0; }
    .disclaimer { margin-top: 24px; padding: 12px 16px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; font-size: 10px; color: #92400e; line-height: 1.6; }
    .disclaimer strong { display: block; margin-bottom: 4px; font-size: 11px; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Derma<span>Sense</span> AI</div>
    <div class="report-meta">
      <div class="report-id">${report.id.toUpperCase()}</div>
      <div>Generated: ${formatDate(report.date)}</div>
    </div>
  </div>

  <h2 class="report-title">${report.title}</h2>
  <div class="badge">${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Analysis Report</div>

  ${imageSection}

  <div class="two-col">
    <div class="info-box">
      <h4>Analysis Date</h4>
      <p>${formatDate(report.date)}</p>
    </div>
    <div class="info-box">
      <h4>Report Type</h4>
      <p>${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Analysis</p>
    </div>
    <div class="info-box">
      <h4>Report Status</h4>
      <p>${report.status === 'ready' ? '✓ Complete' : report.status}</p>
    </div>
    <div class="info-box">
      <h4>Model & Version</h4>
      <p>${report.modelName || 'Standard AI'} (${report.modelVersion || 'v1.0'})</p>
    </div>
  </div>

  ${(report.prediction || report.confidence) ? `
  <div class="section" style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
    <h3 style="border-bottom: none; margin-bottom: 8px; color: #4338ca;">AI Screening Results</h3>
    <div class="two-col" style="margin-bottom: 0;">
      ${report.prediction ? `<div><strong style="font-size: 10px; color: #64748b; text-transform: uppercase;">Top Prediction</strong><br><span style="font-size: 14px; font-weight: 700; color: #1e293b;">${report.prediction}</span></div>` : ''}
      ${report.confidence !== undefined ? `<div><strong style="font-size: 10px; color: #64748b; text-transform: uppercase;">Confidence</strong><br><span style="font-size: 14px; font-weight: 700; color: #1e293b;">${report.confidence <= 1 ? Math.round(report.confidence * 100) + '%' : report.confidence + '%'}</span></div>` : ''}
      ${report.riskLevel ? `<div><strong style="font-size: 10px; color: #64748b; text-transform: uppercase;">Risk Level</strong><br><span style="font-size: 14px; font-weight: 700; color: ${report.riskLevel.toLowerCase() === 'high' ? '#dc2626' : report.riskLevel.toLowerCase() === 'moderate' ? '#d97706' : '#16a34a'};">${report.riskLevel.toUpperCase()}</span></div>` : ''}
      ${report.hospitalRecommendation ? `<div><strong style="font-size: 10px; color: #64748b; text-transform: uppercase;">Next Steps</strong><br><span style="font-size: 14px; font-weight: 700; color: #dc2626;">Professional Evaluation Recommended</span></div>` : ''}
    </div>
  </div>
  ` : ''}

  <div class="section">
    <h3>Summary</h3>
    <p style="color:#475569">${report.summary}</p>
  </div>

  ${section('Clinical Observations', report.observations)}
  ${section('Morning Skincare Routine', report.morningRoutine)}
  ${section('Evening Skincare Routine', report.eveningRoutine)}
  ${section('Recommended Product Categories', report.productCategories)}
  ${section('Lifestyle Guidance', report.lifestyleGuidance)}
  ${section('Nutrition & Diet Guidance', report.nutritionGuidance)}

  <div class="disclaimer">
    <strong>⚠️ Medical Disclaimer</strong>
    DermaSense AI provides AI-assisted informational screening and does not provide a definitive medical diagnosis. This report is intended for informational purposes only. AI analysis results may be inaccurate or incomplete. A qualified, licensed healthcare professional must evaluate your skin condition, symptoms, and medical history before starting any treatment. Do not use this report as a substitute for professional medical advice.
  </div>

  <div class="footer">
    <span>DermaSense AI • Confidential Health Record</span>
    <span>© ${new Date().getFullYear()} DermaSense AI. All rights reserved.</span>
  </div>

  <script>
    window.onload = () => { window.print(); }
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  },

  /**
   * Triggers native browser print dialog for the current report detail page.
   */
  printReport(): void {
    window.print();
  },

  /**
   * Downloads a structured JSON health archive summary.
   */
  downloadJsonSummary(report: Report): void {
    const { imagePreview, ...safeReport } = report as any;
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(safeReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `DermaSense_Report_${report.id}_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },
};
