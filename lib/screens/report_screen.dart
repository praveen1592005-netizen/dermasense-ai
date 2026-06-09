// lib/screens/report_screen.dart
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class ReportScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> prediction;
  final Uint8List? imageBytes;

  const ReportScreen({Key? key, required this.prediction, this.imageBytes})
      : super(key: key);

  @override
  ConsumerState<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends ConsumerState<ReportScreen> {
  bool _generating = false;

  // ── Build PDF document ────────────────────────────────────────────────────
  Future<Uint8List> _buildPdf() async {
    final pdf = pw.Document(
      theme: pw.ThemeData.withFont(
        base: pw.Font.helvetica(),
        bold: pw.Font.helveticaBold(),
        italic: pw.Font.helveticaOblique(),
      ),
    );

    final r = widget.prediction;
    final disease = r['disease'] as String? ?? 'Unknown';
    final confidence = (r['confidence'] as num?)?.toDouble() ?? 0.0;
    final severity = r['severity'] as String? ?? '';
    final risk = r['risk'] as String? ?? '';
    final explanation = r['explanation'] as String? ?? '';
    final treatment = r['treatment'] as String? ?? '';
    final skincare = (r['skincare'] as List?)?.cast<String>() ?? [];
    final urgency = r['urgency'] as String? ?? '';
    final needsDoctor = r['needsDoctor'] as bool? ?? false;
    final dateStr =
        DateFormat('MMMM dd, yyyy – hh:mm a').format(DateTime.now());

    // Purple accent colour
    const purple = PdfColor.fromInt(0xFF6A1B9A);
    const darkBg = PdfColor.fromInt(0xFF1E1E2F);
    const lightGray = PdfColor.fromInt(0xFFF5F5F5);
    const textDark = PdfColor.fromInt(0xFF212121);
    const textMid = PdfColor.fromInt(0xFF555555);

    pw.MemoryImage? skinImage;
    if (widget.imageBytes != null) {
      skinImage = pw.MemoryImage(widget.imageBytes!);
    }

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(36),
        header: (ctx) => _pdfHeader(purple, dateStr),
        footer: (ctx) => _pdfFooter(ctx, purple),
        build: (ctx) => [
          pw.SizedBox(height: 20),

          // ── Disease summary card ──────────────────────────────────────────
          pw.Container(
            padding: const pw.EdgeInsets.all(18),
            decoration: pw.BoxDecoration(
              color: lightGray,
              borderRadius: pw.BorderRadius.circular(12),
              border: pw.Border.all(
                  color: PdfColor.fromInt(0xFFDDD0F0), width: 1.5),
            ),
            child: pw.Row(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                if (skinImage != null)
                  pw.Container(
                    width: 100,
                    height: 100,
                    decoration: pw.BoxDecoration(
                      borderRadius: pw.BorderRadius.circular(10),
                      border: pw.Border.all(color: purple, width: 2),
                    ),
                    child: pw.ClipRRect(
                      horizontalRadius: 10,
                      verticalRadius: 10,
                      child: pw.Image(skinImage, fit: pw.BoxFit.cover),
                    ),
                  ),
                if (skinImage != null) pw.SizedBox(width: 18),
                pw.Expanded(
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(disease,
                          style: pw.TextStyle(
                              font: pw.Font.helveticaBold(),
                              fontSize: 20,
                              color: purple)),
                      pw.SizedBox(height: 8),
                      _pdfKV('Confidence', '${(confidence * 100).toStringAsFixed(1)}%'),
                      _pdfKV('Severity', severity),
                      _pdfKV('Risk Level', risk),
                      pw.SizedBox(height: 6),
                      pw.Container(
                        padding: const pw.EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
                        decoration: pw.BoxDecoration(
                          color: needsDoctor
                              ? PdfColor.fromInt(0xFFFFEBEE)
                              : PdfColor.fromInt(0xFFE8F5E9),
                          borderRadius: pw.BorderRadius.circular(6),
                        ),
                        child: pw.Text(
                          needsDoctor
                              ? '⚠ Doctor consultation recommended'
                              : '✔ Manageable with OTC care',
                          style: pw.TextStyle(
                              fontSize: 10,
                              color: needsDoctor
                                  ? PdfColor.fromInt(0xFFB71C1C)
                                  : PdfColor.fromInt(0xFF1B5E20)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          pw.SizedBox(height: 20),

          // ── About the condition ───────────────────────────────────────────
          _pdfSection('About This Condition', explanation, purple, textDark, textMid),
          pw.SizedBox(height: 16),

          // ── Treatment ────────────────────────────────────────────────────
          _pdfSection('Treatment Recommendations', treatment, purple, textDark, textMid),
          pw.SizedBox(height: 16),

          // ── Skincare routine ─────────────────────────────────────────────
          if (skincare.isNotEmpty) ...[
            pw.Text('Daily Skincare Routine',
                style: pw.TextStyle(
                    font: pw.Font.helveticaBold(),
                    fontSize: 14,
                    color: purple)),
            pw.SizedBox(height: 8),
            pw.Container(
              padding: const pw.EdgeInsets.all(14),
              decoration: pw.BoxDecoration(
                color: lightGray,
                borderRadius: pw.BorderRadius.circular(10),
              ),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: skincare
                    .map((s) => pw.Padding(
                          padding: const pw.EdgeInsets.only(bottom: 5),
                          child: pw.Row(
                            crossAxisAlignment: pw.CrossAxisAlignment.start,
                            children: [
                              pw.Text('• ',
                                  style: pw.TextStyle(
                                      color: purple, fontSize: 11)),
                              pw.Expanded(
                                child: pw.Text(s,
                                    style: pw.TextStyle(
                                        fontSize: 10.5, color: textMid)),
                              ),
                            ],
                          ),
                        ))
                    .toList(),
              ),
            ),
            pw.SizedBox(height: 16),
          ],

          // ── Doctor advice ─────────────────────────────────────────────────
          if (urgency.isNotEmpty) ...[
            pw.Container(
              padding: const pw.EdgeInsets.all(14),
              decoration: pw.BoxDecoration(
                color: needsDoctor
                    ? PdfColor.fromInt(0xFFFFEBEE)
                    : PdfColor.fromInt(0xFFE8F5E9),
                borderRadius: pw.BorderRadius.circular(10),
                border: pw.Border.all(
                  color: needsDoctor
                      ? PdfColor.fromInt(0xFFEF9A9A)
                      : PdfColor.fromInt(0xFFA5D6A7),
                ),
              ),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text(
                    needsDoctor
                        ? 'Doctor Consultation Recommended'
                        : 'No Urgent Visit Needed',
                    style: pw.TextStyle(
                        font: pw.Font.helveticaBold(),
                        fontSize: 12,
                        color: needsDoctor
                            ? PdfColor.fromInt(0xFFB71C1C)
                            : PdfColor.fromInt(0xFF1B5E20)),
                  ),
                  pw.SizedBox(height: 6),
                  pw.Text(urgency,
                      style: pw.TextStyle(
                          fontSize: 10.5,
                          color: needsDoctor
                              ? PdfColor.fromInt(0xFFC62828)
                              : PdfColor.fromInt(0xFF2E7D32))),
                ],
              ),
            ),
            pw.SizedBox(height: 16),
          ],

          // ── Disclaimer ────────────────────────────────────────────────────
          pw.Container(
            padding: const pw.EdgeInsets.all(12),
            decoration: pw.BoxDecoration(
              color: PdfColor.fromInt(0xFFFFFDE7),
              borderRadius: pw.BorderRadius.circular(8),
              border: pw.Border.all(color: PdfColor.fromInt(0xFFFFE082)),
            ),
            child: pw.Text(
              '⚠ Disclaimer: This AI-generated report is for informational purposes only and does NOT constitute a professional medical diagnosis. Always consult a qualified dermatologist for proper evaluation and treatment.',
              style:
                  pw.TextStyle(fontSize: 9, color: PdfColor.fromInt(0xFF795548)),
            ),
          ),
        ],
      ),
    );

    return pdf.save();
  }

  pw.Widget _pdfHeader(PdfColor purple, String dateStr) {
    return pw.Container(
      padding: const pw.EdgeInsets.only(bottom: 12),
      decoration: const pw.BoxDecoration(
        border: pw.Border(
          bottom: pw.BorderSide(color: PdfColor.fromInt(0xFF6A1B9A), width: 2),
        ),
      ),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.start, children: [
            pw.Text('DermaSense AI',
                style: pw.TextStyle(
                    font: pw.Font.helveticaBold(),
                    fontSize: 18,
                    color: purple)),
            pw.Text('Skin Analysis Report',
                style: pw.TextStyle(
                    fontSize: 11, color: PdfColor.fromInt(0xFF888888))),
          ]),
          pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.end, children: [
            pw.Text('Report Generated',
                style: pw.TextStyle(
                    fontSize: 9, color: PdfColor.fromInt(0xFF888888))),
            pw.Text(dateStr,
                style: pw.TextStyle(
                    font: pw.Font.helveticaBold(),
                    fontSize: 10,
                    color: PdfColor.fromInt(0xFF444444))),
          ]),
        ],
      ),
    );
  }

  pw.Widget _pdfFooter(pw.Context ctx, PdfColor purple) {
    return pw.Container(
      alignment: pw.Alignment.center,
      padding: const pw.EdgeInsets.only(top: 8),
      decoration: const pw.BoxDecoration(
        border: pw.Border(
          top: pw.BorderSide(color: PdfColor.fromInt(0xFFDDDDDD), width: 0.5),
        ),
      ),
      child: pw.Text(
        'Page ${ctx.pageNumber} of ${ctx.pagesCount}  •  DermaSense AI  •  For informational use only',
        style: pw.TextStyle(fontSize: 8, color: PdfColor.fromInt(0xFFAAAAAA)),
      ),
    );
  }

  pw.Widget _pdfSection(String title, String body, PdfColor accent,
      PdfColor titleColor, PdfColor bodyColor) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Text(title,
            style: pw.TextStyle(
                font: pw.Font.helveticaBold(),
                fontSize: 14,
                color: accent)),
        pw.SizedBox(height: 8),
        pw.Container(
          padding: const pw.EdgeInsets.all(14),
          decoration: pw.BoxDecoration(
            color: PdfColor.fromInt(0xFFF5F5F5),
            borderRadius: pw.BorderRadius.circular(10),
          ),
          child: pw.Text(body,
              style:
                  pw.TextStyle(fontSize: 10.5, lineSpacing: 4, color: bodyColor)),
        ),
      ],
    );
  }

  pw.Widget _pdfKV(String key, String val) {
    return pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 4),
      child: pw.Row(children: [
        pw.Text('$key: ',
            style: pw.TextStyle(
                font: pw.Font.helveticaBold(),
                fontSize: 10,
                color: PdfColor.fromInt(0xFF444444))),
        pw.Text(val,
            style: pw.TextStyle(fontSize: 10, color: PdfColor.fromInt(0xFF555555))),
      ]),
    );
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final r = widget.prediction;
    final disease = r['disease'] as String? ?? 'Unknown';
    final confidence = (r['confidence'] as num?)?.toDouble() ?? 0.0;
    final severity = r['severity'] as String? ?? '';
    final needsDoctor = r['needsDoctor'] as bool? ?? false;

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF2A2A3B),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Diagnosis Report',
            style:
                TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.print_rounded, color: Colors.white),
            tooltip: 'Print',
            onPressed: _generate,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Preview card ────────────────────────────────────────────────
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF6A1B9A), Color(0xFF283593)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF6A1B9A).withOpacity(0.4),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.picture_as_pdf_rounded,
                            color: Colors.white, size: 28),
                      ),
                      const SizedBox(width: 14),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Skin Analysis Report',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold)),
                            Text('PDF • Ready to generate',
                                style: TextStyle(
                                    color: Colors.white70, fontSize: 13)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  _previewRow('Condition', disease),
                  _previewRow('Confidence',
                      '${(confidence * 100).toStringAsFixed(1)}%'),
                  _previewRow('Severity', severity),
                  _previewRow('Consultation',
                      needsDoctor ? 'Recommended' : 'Not urgent'),
                  _previewRow('Generated',
                      DateFormat('MMM dd, yyyy').format(DateTime.now())),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Image preview ───────────────────────────────────────────────
            if (widget.imageBytes != null) ...[
              const Text('Scanned Image',
                  style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16)),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.memory(
                  widget.imageBytes!,
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: 24),
            ],

            // ── Report contents preview ─────────────────────────────────────
            const Text('Report Contents',
                style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16)),
            const SizedBox(height: 12),
            _contentItem(Icons.medical_information_rounded, 'Diagnosis Summary',
                'Disease name, confidence score, severity, risk level'),
            _contentItem(Icons.info_outline_rounded, 'About The Condition',
                'Detailed medical explanation'),
            _contentItem(Icons.medical_services_outlined,
                'Treatment Recommendations', 'Step-by-step treatment plan'),
            _contentItem(Icons.spa_outlined, 'Daily Skincare Routine',
                'Personalized skincare steps'),
            _contentItem(Icons.local_hospital_rounded, 'Doctor Advice',
                'When to consult a dermatologist'),
            _contentItem(Icons.warning_amber_rounded, 'Medical Disclaimer',
                'AI analysis disclaimer'),
            const SizedBox(height: 28),

            // ── Action buttons ──────────────────────────────────────────────
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton.icon(
                onPressed: _generating ? null : _generate,
                icon: _generating
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.share_rounded),
                label: Text(
                  _generating ? 'Generating PDF…' : 'Generate & Share PDF',
                  style: const TextStyle(
                      fontSize: 15, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6A1B9A),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: OutlinedButton.icon(
                onPressed: _generating ? null : _print,
                icon: const Icon(Icons.print_rounded),
                label: const Text('Print Report',
                    style: TextStyle(
                        fontSize: 15, fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF8E24AA),
                  side: const BorderSide(color: Color(0xFF6A1B9A)),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // ── Disclaimer ──────────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.04),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                '⚠️ This report is AI-generated for informational purposes only and does not constitute a professional medical diagnosis. Always consult a qualified dermatologist.',
                style: TextStyle(
                    color: Colors.white38, fontSize: 12, height: 1.5),
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _previewRow(String key, String val) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Text('$key: ',
              style: const TextStyle(
                  color: Colors.white60, fontSize: 13)),
          Text(val,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _contentItem(IconData icon, String title, String subtitle) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.07)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF6A1B9A).withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: const Color(0xFF8E24AA), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 13)),
                Text(subtitle,
                    style: const TextStyle(
                        color: Colors.white54, fontSize: 11)),
              ],
            ),
          ),
          const Icon(Icons.check_circle_rounded,
              color: Colors.greenAccent, size: 18),
        ],
      ),
    );
  }

  Future<void> _generate() async {
    setState(() => _generating = true);
    try {
      final bytes = await _buildPdf();
      await Printing.sharePdf(
        bytes: bytes,
        filename:
            'DermaSense_Report_${DateFormat('yyyyMMdd_HHmm').format(DateTime.now())}.pdf',
      );
    } finally {
      if (mounted) setState(() => _generating = false);
    }
  }

  Future<void> _print() async {
    setState(() => _generating = true);
    try {
      final bytes = await _buildPdf();
      await Printing.layoutPdf(onLayout: (_) => bytes);
    } finally {
      if (mounted) setState(() => _generating = false);
    }
  }
}
