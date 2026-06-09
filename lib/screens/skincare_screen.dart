// lib/screens/skincare_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Riverpod provider to store the last prediction result from a scan.
/// Accessible from both ScanScreen (writer) and SkincareScreen (reader).
final lastScanResultProvider =
    StateProvider<Map<String, dynamic>?>((ref) => null);

class SkincareScreen extends ConsumerWidget {
  const SkincareScreen({Key? key}) : super(key: key);

  // --- Generic (non-scan) daily skincare tips shown at the top always ---
  static const List<Map<String, dynamic>> _genericTips = [
    {
      'title': 'Morning Cleanse',
      'detail': 'Use a gentle, pH-balanced foaming cleanser to remove overnight build-up.',
      'icon': Icons.water_drop_outlined,
      'color': Color(0xFF42A5F5),
    },
    {
      'title': 'SPF Every Day',
      'detail': 'Apply a broad-spectrum SPF 30+ sunscreen even on cloudy days.',
      'icon': Icons.wb_sunny_rounded,
      'color': Color(0xFFFFA726),
    },
    {
      'title': 'Stay Hydrated',
      'detail': 'Drink 8+ glasses of water daily. Hydrated skin is healthy skin.',
      'icon': Icons.local_drink_outlined,
      'color': Color(0xFF26C6DA),
    },
    {
      'title': 'Night Repair',
      'detail': 'Apply a hydrating night cream or retinol serum before sleep.',
      'icon': Icons.nightlight_round,
      'color': Color(0xFF7E57C2),
    },
    {
      'title': 'No Touch Rule',
      'detail': 'Avoid touching your face — hands transfer bacteria and oil.',
      'icon': Icons.do_not_touch_rounded,
      'color': Color(0xFFEF5350),
    },
    {
      'title': 'Diet & Skin',
      'detail': 'Eat antioxidant-rich foods (berries, greens) for radiant skin from within.',
      'icon': Icons.eco_rounded,
      'color': Color(0xFF66BB6A),
    },
  ];

  // --- Medicine guidelines per disease ---
  static const Map<String, List<Map<String, String>>> _medicineMap = {
    'Melanocytic Nevi': [
      {'name': 'No medication needed', 'use': 'Monitor monthly using the ABCDE rule.', 'icon': '💊'},
      {'name': 'SPF 50+ Sunscreen', 'use': 'Apply every morning to reduce UV damage.', 'icon': '🧴'},
    ],
    'Melanoma': [
      {'name': '⚠️ Urgent Dermatologist Visit', 'use': 'Clinical biopsy and staging required immediately.', 'icon': '🏥'},
      {'name': 'Imiquimod Cream (Rx)', 'use': 'Topical immunotherapy if prescribed.', 'icon': '💊'},
      {'name': 'SPF 50+ Sunscreen', 'use': 'Apply daily; avoid sun on affected area.', 'icon': '🧴'},
    ],
    'Actinic Keratosis': [
      {'name': 'Fluorouracil Cream (Rx)', 'use': 'Topical chemo cream applied for 2–4 weeks as directed.', 'icon': '💊'},
      {'name': 'Diclofenac Gel (Rx)', 'use': 'Anti-inflammatory topical for mild cases.', 'icon': '💊'},
      {'name': 'SPF 30+ Sunscreen', 'use': 'Essential daily to prevent worsening.', 'icon': '🧴'},
      {'name': 'Gentle Exfoliant', 'use': 'Weekly AHA exfoliant to manage scaling.', 'icon': '🧴'},
    ],
    'Basal Cell Carcinoma': [
      {'name': 'Vismodegib (Rx)', 'use': 'Systemic therapy for advanced cases — dermatologist only.', 'icon': '💊'},
      {'name': 'Imiquimod Cream (Rx)', 'use': 'Topical option for superficial BCC.', 'icon': '💊'},
      {'name': 'Mineral Sunscreen SPF 30+', 'use': 'Daily protection to prevent further damage.', 'icon': '🧴'},
    ],
    'Benign Keratosis': [
      {'name': 'No medication needed', 'use': 'Cosmetic removal only if desired (cryotherapy).', 'icon': '💊'},
      {'name': 'Urea Cream 10–20%', 'use': 'Softens and hydrates scaly patches.', 'icon': '🧴'},
      {'name': 'Gentle Moisturizer', 'use': 'Apply twice daily to prevent dryness.', 'icon': '🧴'},
    ],
    'Dermatofibroma': [
      {'name': 'No medication needed', 'use': 'Safe to leave untreated; monitor for growth.', 'icon': '💊'},
      {'name': 'Hydrating Moisturizer', 'use': 'Keep skin around nodule hydrated.', 'icon': '🧴'},
    ],
    'Vascular Lesion': [
      {'name': 'No medication needed', 'use': 'No treatment unless cosmetic removal is desired.', 'icon': '💊'},
      {'name': 'Gentle Cleanser', 'use': 'Use a non-abrasive cleanser around the lesion.', 'icon': '🧴'},
      {'name': 'SPF 30+ Sunscreen', 'use': 'Protect skin from sun exposure.', 'icon': '🧴'},
    ],
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lastResult = ref.watch(lastScanResultProvider);
    final hasResult = lastResult != null;
    final disease = hasResult ? (lastResult['disease'] as String? ?? '') : '';
    final skincare = hasResult
        ? (lastResult['skincare'] as List?)?.cast<String>() ?? []
        : <String>[];
    final medicines = hasResult ? (_medicineMap[disease] ?? []) : <Map<String, String>>[];
    final confidence = hasResult ? (lastResult['confidence'] as num?)?.toDouble() ?? 0.0 : 0.0;
    final urgency = hasResult ? (lastResult['urgency'] as String? ?? '') : '';
    final needsDoctor = hasResult ? (lastResult['needsDoctor'] as bool? ?? false) : false;

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Skincare & Medicines',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.camera_alt_rounded, color: Color(0xFF8E24AA)),
            tooltip: 'Scan Skin',
            onPressed: () => Navigator.pushNamed(context, '/scan'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ---- Scan Banner ----
            if (!hasResult) ...[
              _scanPromptBanner(context),
              const SizedBox(height: 20),
            ],

            // ---- Personalized section (shown only after scan) ----
            if (hasResult) ...[
              _sectionHeader('🎯 Personalized for You'),
              const SizedBox(height: 10),
              _diagnosisCard(disease, confidence, needsDoctor, urgency),
              const SizedBox(height: 16),

              if (medicines.isNotEmpty) ...[
                _sectionHeader('💊 Recommended Medicines'),
                const SizedBox(height: 10),
                ...medicines.map((m) => _medicineCard(m)).toList(),
                const SizedBox(height: 16),
              ],

              if (skincare.isNotEmpty) ...[
                _sectionHeader('🧴 Your Skincare Routine'),
                const SizedBox(height: 10),
                _skincareRoutineCard(skincare),
                const SizedBox(height: 20),
              ],

              const Divider(color: Colors.white12, height: 32),
            ],

            // ---- Generic daily tips (always shown) ----
            _sectionHeader('📋 Daily Skincare Tips'),
            const SizedBox(height: 4),
            const Text(
              'Good habits for everyone — every single day.',
              style: TextStyle(color: Colors.white38, fontSize: 12),
            ),
            const SizedBox(height: 12),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.15,
              ),
              itemCount: _genericTips.length,
              itemBuilder: (_, i) => _tipCard(_genericTips[i]),
            ),
            const SizedBox(height: 20),

            // ---- Disclaimer ----
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.04),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                '⚠️ Disclaimer: All skincare and medicine recommendations are for informational purposes only. Always consult a qualified dermatologist before starting any treatment.',
                style: TextStyle(color: Colors.white38, fontSize: 12, height: 1.5),
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  // ---- Widgets ----

  Widget _scanPromptBanner(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, '/scan'),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(22),
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
              blurRadius: 18,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Scan Your Skin First',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Take or upload a photo of your skin to get personalized medicine and skincare recommendations.',
                    style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.5),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 30),
            ),
          ],
        ),
      ),
    );
  }

  Widget _diagnosisCard(String disease, double confidence, bool needsDoctor, String urgency) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: needsDoctor
              ? Colors.redAccent.withOpacity(0.4)
              : Colors.greenAccent.withOpacity(0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                needsDoctor ? Icons.local_hospital_rounded : Icons.check_circle_outline,
                color: needsDoctor ? Colors.redAccent : Colors.greenAccent,
                size: 22,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  disease,
                  style: const TextStyle(
                      color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${(confidence * 100).toStringAsFixed(0)}%',
                  style: const TextStyle(
                      color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ],
          ),
          if (urgency.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(
              urgency,
              style: TextStyle(
                color: needsDoctor ? Colors.redAccent.shade100 : Colors.white60,
                fontSize: 13,
                height: 1.4,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _medicineCard(Map<String, String> medicine) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(medicine['icon'] ?? '💊', style: const TextStyle(fontSize: 24)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  medicine['name'] ?? '',
                  style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 4),
                Text(
                  medicine['use'] ?? '',
                  style: const TextStyle(color: Colors.white60, fontSize: 13, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _skincareRoutineCard(List<String> steps) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF6A1B9A).withOpacity(0.3)),
      ),
      child: Column(
        children: steps.asMap().entries.map((entry) {
          final i = entry.key;
          final step = entry.value;
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 7),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 26,
                  height: 26,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF6A1B9A), Color(0xFF283593)],
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${i + 1}',
                    style: const TextStyle(
                        color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    step,
                    style: const TextStyle(
                        color: Colors.white70, fontSize: 14, height: 1.5),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _tipCard(Map<String, dynamic> tip) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: (tip['color'] as Color).withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(tip['icon'] as IconData,
                color: tip['color'] as Color, size: 22),
          ),
          const SizedBox(height: 10),
          Text(
            tip['title'] as String,
            style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
          ),
          const SizedBox(height: 4),
          Text(
            tip['detail'] as String,
            style: const TextStyle(color: Colors.white54, fontSize: 11, height: 1.4),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
          color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
    );
  }
}
