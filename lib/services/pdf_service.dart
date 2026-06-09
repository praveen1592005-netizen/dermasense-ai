// lib/services/pdf_service.dart

import 'dart:convert';
import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:uuid/uuid.dart';
import '../services/firestore_service.dart';

class PdfService {
  static Future<Uint8List> generateMedicalReport(ScanRecord scan, String userName) async {
    final pdf = pw.Document();

    Uint8List? imageBytes;
    if (scan.imageBase64 != null && scan.imageBase64!.isNotEmpty) {
      try {
        imageBytes = base64Decode(scan.imageBase64!);
      } catch (_) {}
    }

    final imageProvider = imageBytes != null ? pw.MemoryImage(imageBytes) : null;

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Container(
            padding: const pw.EdgeInsets.all(24),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                // Header
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text(
                          'DermaSense AI Pro',
                          style: pw.TextStyle(
                            fontSize: 24,
                            fontWeight: pw.FontWeight.bold,
                            color: PdfColors.purple,
                          ),
                        ),
                        pw.Text(
                          'AI-Powered Dermatology Platform',
                          style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey),
                        ),
                      ],
                    ),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Text('Report ID: ${const Uuid().v4().substring(0, 8).toUpperCase()}'),
                        pw.Text('Date: ${scan.timestamp?.toLocal().toString().split(' ')[0] ?? DateTime.now().toString().split(' ')[0]}'),
                      ],
                    ),
                  ],
                ),
                pw.Divider(thickness: 1.5, color: PdfColors.purple),
                pw.SizedBox(height: 16),

                // Patient Info
                pw.Text(
                  'Patient Information',
                  style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold, color: PdfColors.purple900),
                ),
                pw.SizedBox(height: 6),
                pw.Row(
                  children: [
                    pw.Text('Name: ', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                    pw.Text(userName),
                  ],
                ),
                pw.SizedBox(height: 16),

                // Diagnosis Details
                pw.Text(
                  'Analysis Results',
                  style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold, color: PdfColors.purple900),
                ),
                pw.SizedBox(height: 8),
                pw.Row(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    if (imageProvider != null)
                      pw.Container(
                        width: 140,
                        height: 140,
                        decoration: pw.BoxDecoration(
                          border: pw.Border.all(color: PdfColors.grey300),
                          borderRadius: const pw.BorderRadius.all(pw.Radius.circular(8)),
                        ),
                        child: pw.ClipRRect(
                          borderRadius: const pw.BorderRadius.all(pw.Radius.circular(8)),
                          child: pw.Image(imageProvider, fit: pw.BoxFit.cover),
                        ),
                      ),
                    if (imageProvider != null) pw.SizedBox(width: 16),
                    pw.Expanded(
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          _reportRow('Detected Condition', scan.disease),
                          _reportRow('Confidence Score', '${(scan.confidence * 100).toStringAsFixed(1)}%'),
                          _reportRow('Severity Level', scan.severity),
                          _reportRow('Risk Assessment', scan.risk),
                          _reportRow('Recommendation Urgency', scan.urgency),
                        ],
                      ),
                    ),
                  ],
                ),
                pw.SizedBox(height: 16),

                // Clinical Explanation
                pw.Text(
                  'Clinical Explanation',
                  style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold),
                ),
                pw.SizedBox(height: 4),
                pw.Text(scan.explanation, style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey800)),
                pw.SizedBox(height: 16),

                // Treatment & Skincare Recommendation
                pw.Text(
                  'AI Recommendations',
                  style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold),
                ),
                pw.SizedBox(height: 6),
                pw.Text('Suggested Treatments:', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold)),
                pw.Text(scan.treatment, style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700)),
                pw.SizedBox(height: 6),
                pw.Text('Suggested Skincare Routine:', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold)),
                pw.Bullet(text: scan.skincare.join('\n'), style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700)),

                pw.Spacer(),
                pw.Divider(color: PdfColors.grey400),
                pw.Align(
                  alignment: pw.Alignment.center,
                  child: pw.Text(
                    'Disclaimer: This analysis is AI-assisted and for informational purposes only. It is not a substitute for professional medical advice.',
                    style: pw.TextStyle(fontSize: 8, fontStyle: pw.FontStyle.italic, color: PdfColors.grey600),
                    textAlign: pw.TextAlign.center,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );

    return pdf.save();
  }

  static pw.Widget _reportRow(String label, String value) {
    return pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 6),
      child: pw.Row(
        cross: pw.CrossAxisAlignment.start,
        children: [
          pw.SizedBox(
            width: 120,
            child: pw.Text(label, style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10)),
          ),
          pw.Expanded(
            child: pw.Text(value, style: const pw.TextStyle(fontSize: 10)),
          ),
        ],
      ),
    );
  }

  static Future<void> sharePdf(ScanRecord scan, String userName) async {
    final pdfBytes = await generateMedicalReport(scan, userName);
    await Printing.sharePdf(bytes: pdfBytes, filename: 'DermaSense-Pro-${scan.disease.replaceAll(' ', '-')}.pdf');
  }

  static Future<void> printReport(ScanRecord scan, String userName) async {
    final pdfBytes = await generateMedicalReport(scan, userName);
    await Printing.layoutPdf(onLayout: (PdfPageFormat format) async => pdfBytes);
  }
}
