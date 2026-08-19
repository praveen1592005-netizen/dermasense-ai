// lib/screens/skincare_screen.dart
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';
import '../services/theme_service.dart';

/// Riverpod provider to store the last prediction result from a scan.
/// Accessible from both ScanScreen (writer) and SkincareScreen (reader).
final lastScanResultProvider =
    StateProvider<Map<String, dynamic>?>((ref) => null);

// Providers for the skincare-specific analysis
final _skincareAnalysisProvider =
    StateProvider<Map<String, dynamic>?>((ref) => null);
final _skincareLoadingProvider = StateProvider<bool>((ref) => false);
final _skincareImageBytesProvider = StateProvider<List<int>?>((ref) => null);

class SkincareScreen extends ConsumerStatefulWidget {
  const SkincareScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<SkincareScreen> createState() => _SkincareScreenState();
}

class _SkincareScreenState extends ConsumerState<SkincareScreen> {
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

  static const Map<String, Color> _conditionColors = {
    'Clear Skin': Color(0xFF66BB6A),
    'Acne & Pimples': Color(0xFFEF5350),
    'Post-Acne Marks & Scars': Color(0xFFFF7043),
    'Hyperpigmentation & Dark Spots': Color(0xFFFFA726),
    'Oily Skin': Color(0xFF42A5F5),
    'Dry & Dehydrated Skin': Color(0xFF26C6DA),
    'Combination Skin': Color(0xFF7E57C2),
    'Wrinkles & Fine Lines': Color(0xFFEC407A),
    'Redness & Sensitivity': Color(0xFFEF5350),
    'Dull & Uneven Skin Tone': Color(0xFFFFA726),
  };

  void _showNoSkinDialog() {
    final themeMode = ref.read(themeProvider);
    final isDark = themeMode == ThemeMode.dark;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF2A2A3B) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.amber, size: 28),
            const SizedBox(width: 10),
            Text('No Skin Detected',
                style: TextStyle(
                    color: isDark ? Colors.white : Colors.black87,
                    fontSize: 18)),
          ],
        ),
        content: Text(
          'We couldn\'t detect human skin or a face in the image.\n\nPlease upload a clear photo of your face or skin for an accurate skincare analysis.',
          style: TextStyle(
              color: isDark ? Colors.white70 : Colors.black54,
              fontSize: 14,
              height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(_skincareImageBytesProvider.notifier).state = null;
              ref.read(_skincareAnalysisProvider.notifier).state = null;
            },
            child: const Text('Try Again',
                style: TextStyle(
                    color: Colors.amber, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Future<void> _pickAndAnalyse(BuildContext context, WidgetRef ref) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
      maxWidth: 1024,
    );
    if (picked == null) return;

    final bytes = await picked.readAsBytes();
    ref.read(_skincareImageBytesProvider.notifier).state = bytes;
    ref.read(_skincareAnalysisProvider.notifier).state = null;
    ref.read(_skincareLoadingProvider.notifier).state = true;

    try {
      final base64Img = base64Encode(bytes);
      final apiClient = ref.read(apiClientProvider);
      final result = await apiClient.skincareAnalyze(base64Img);
      ref.read(_skincareAnalysisProvider.notifier).state = result;
    } catch (e) {
      if (!mounted) return;
      if (e.toString().contains('NO_SKIN')) {
        ref.read(_skincareLoadingProvider.notifier).state = false;
        _showNoSkinDialog();
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Analysis failed: $e'),
          backgroundColor: Colors.redAccent,
        ),
      );
    } finally {
      ref.read(_skincareLoadingProvider.notifier).state = false;
    }
  }

  Future<void> _takeAndAnalyse(BuildContext context, WidgetRef ref) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 85,
      maxWidth: 1024,
    );
    if (picked == null) return;

    final bytes = await picked.readAsBytes();
    ref.read(_skincareImageBytesProvider.notifier).state = bytes;
    ref.read(_skincareAnalysisProvider.notifier).state = null;
    ref.read(_skincareLoadingProvider.notifier).state = true;

    try {
      final base64Img = base64Encode(bytes);
      final apiClient = ref.read(apiClientProvider);
      final result = await apiClient.skincareAnalyze(base64Img);
      ref.read(_skincareAnalysisProvider.notifier).state = result;
    } catch (e) {
      if (!mounted) return;
      if (e.toString().contains('NO_SKIN')) {
        ref.read(_skincareLoadingProvider.notifier).state = false;
        _showNoSkinDialog();
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Analysis failed: $e'),
          backgroundColor: Colors.redAccent,
        ),
      );
    } finally {
      ref.read(_skincareLoadingProvider.notifier).state = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeProvider);
    final isDark = themeMode == ThemeMode.dark;
    final analysis = ref.watch(_skincareAnalysisProvider);
    final isLoading = ref.watch(_skincareLoadingProvider);
    final imageBytes = ref.watch(_skincareImageBytesProvider);

    final bgColor = isDark ? const Color(0xFF1E1E2F) : const Color(0xFFF5F6FA);
    final textColor = isDark ? Colors.white : Colors.black87;
    final subtextColor = isDark ? Colors.white54 : Colors.black54;
    final cardColor = isDark ? Colors.white.withOpacity(0.05) : Colors.white;
    final cardBorder = isDark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.06);


    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: textColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Skincare Analysis',
          style: TextStyle(color: textColor, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Image Upload Section ──────────────────────────────────────
            _buildUploadSection(context, ref, imageBytes, isLoading),
            const SizedBox(height: 20),

            // ── AI Analysis Result ────────────────────────────────────────
            if (isLoading) _buildLoadingCard(),
            if (!isLoading && analysis != null) ...[
              _buildConditionCard(analysis),
              const SizedBox(height: 16),
              _buildVitalsCard(analysis),
              const SizedBox(height: 16),
              _buildObservationCard(analysis),
              const SizedBox(height: 16),
              _buildRoutineCard('☀️ Morning Routine',
                  (analysis['morning_routine'] as List<dynamic>? ?? [])
                      .map((e) => e.toString())
                      .toList(),
                  const Color(0xFFFFA726)),
              const SizedBox(height: 12),
              _buildRoutineCard('🌙 Night Routine',
                  (analysis['night_routine'] as List<dynamic>? ?? [])
                      .map((e) => e.toString())
                      .toList(),
                  const Color(0xFF7E57C2)),
              const SizedBox(height: 16),
              _buildIngredientsCard(
                  (analysis['key_ingredients'] as List<dynamic>? ?? [])
                      .map((e) => e.toString())
                      .toList()),
              const SizedBox(height: 12),
              _buildAvoidCard(
                  (analysis['avoid'] as List<dynamic>? ?? [])
                      .map((e) => e.toString())
                      .toList()),
              const SizedBox(height: 12),
              if ((analysis['tip'] as String? ?? '').isNotEmpty)
                _buildTipCard(analysis['tip'] as String),
              const SizedBox(height: 20),
              const Divider(color: Colors.white12, height: 32),
            ],

            // ── Daily Tips (always shown) ─────────────────────────────────
            _sectionHeader('📋 Daily Skincare Tips', textColor),
            const SizedBox(height: 4),
            Text(
              'Good habits for everyone — every single day.',
              style: TextStyle(color: subtextColor, fontSize: 12),
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
              itemBuilder: (_, i) => _tipCard(_genericTips[i], textColor, subtextColor, cardColor, cardBorder),
            ),
            const SizedBox(height: 20),

            // ── Disclaimer ────────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withOpacity(0.04) : Colors.black.withOpacity(0.04),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '⚠️ Disclaimer: All skincare recommendations are for informational purposes only. Always consult a qualified dermatologist before starting any treatment.',
                style: TextStyle(color: subtextColor, fontSize: 12, height: 1.5),
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  // ── Upload Section ────────────────────────────────────────────────────────

  Widget _buildUploadSection(
    BuildContext context,
    WidgetRef ref,
    List<int>? imageBytes,
    bool isLoading,
  ) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF6A1B9A), Color(0xFF283593)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6A1B9A).withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          // Uploaded image preview
          if (imageBytes != null)
            ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(24)),
              child: Image.memory(
                imageBytes as dynamic,
                width: double.infinity,
                height: 220,
                fit: BoxFit.cover,
              ),
            ),

          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                if (imageBytes == null) ...[
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.face_retouching_natural,
                      color: Colors.white,
                      size: 42,
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Analyse Your Skin',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Upload a clear photo of your face.\nOur AI will detect pimples, marks, dark spots\nand create your personalised skincare routine.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: Colors.white70, fontSize: 13, height: 1.6),
                  ),
                  const SizedBox(height: 18),
                ],
                if (imageBytes != null) ...[
                  const Text(
                    'Analyse a different photo',
                    style: TextStyle(
                        color: Colors.white70,
                        fontSize: 13,
                        fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 10),
                ],

                // Buttons
                Row(
                  children: [
                    Expanded(
                      child: _actionButton(
                        icon: Icons.photo_library_rounded,
                        label: 'Upload Photo',
                        onTap: isLoading
                            ? null
                            : () => _pickAndAnalyse(context, ref),
                      ),
                    ),
                    if (!kIsWeb) ...[
                      const SizedBox(width: 10),
                      Expanded(
                        child: _actionButton(
                          icon: Icons.camera_alt_rounded,
                          label: 'Take Photo',
                          onTap: isLoading
                              ? null
                              : () => _takeAndAnalyse(context, ref),
                          outlined: true,
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionButton({
    required IconData icon,
    required String label,
    required VoidCallback? onTap,
    bool outlined = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 13),
        decoration: BoxDecoration(
          color: outlined ? Colors.transparent : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: outlined
              ? Border.all(color: Colors.white54, width: 1.5)
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon,
                size: 18,
                color: outlined ? Colors.white : const Color(0xFF6A1B9A)),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                  color: outlined ? Colors.white : const Color(0xFF6A1B9A),
                  fontWeight: FontWeight.bold,
                  fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }

  // ── Loading Card ──────────────────────────────────────────────────────────

  Widget _buildLoadingCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF6A1B9A).withOpacity(0.3)),
      ),
      child: const Column(
        children: [
          SizedBox(
            width: 48,
            height: 48,
            child: CircularProgressIndicator(
              color: Color(0xFF8E24AA),
              strokeWidth: 3,
            ),
          ),
          SizedBox(height: 16),
          Text(
            '🤖 AI Analysing Your Skin...',
            style: TextStyle(
                color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
          ),
          SizedBox(height: 6),
          Text(
            'Detecting pimples, marks, dark spots\nand preparing your personalised routine',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white54, fontSize: 13, height: 1.5),
          ),
        ],
      ),
    );
  }

  // ── Result Cards ──────────────────────────────────────────────────────────

  Widget _buildConditionCard(Map<String, dynamic> analysis) {
    final condition = analysis['condition'] as String? ?? 'Unknown';
    final confidence =
        ((analysis['confidence'] as num?)?.toDouble() ?? 0.0) * 100;
    final conditionColor =
        _conditionColors[condition] ?? const Color(0xFF8E24AA);
    final isClear = condition == 'Clear Skin';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: conditionColor.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: conditionColor.withOpacity(0.4), width: 1.5),
      ),
      child: Row(
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: conditionColor.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isClear
                  ? Icons.check_circle_rounded
                  : Icons.face_retouching_natural,
              color: conditionColor,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  condition,
                  style: TextStyle(
                      color: conditionColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 17),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      '${confidence.toStringAsFixed(0)}% confidence',
                      style: const TextStyle(
                          color: Colors.white60, fontSize: 13),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: confidence / 100,
                          backgroundColor: Colors.white12,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(conditionColor),
                          minHeight: 6,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVitalsCard(Map<String, dynamic> analysis) {
    final skinType = analysis['skin_type_detected'] as String? ?? 'Unknown';
    final hydration = analysis['hydration_level'] as String? ?? 'Unknown';
    final isDark = ref.read(themeProvider) == ThemeMode.dark;

    if (skinType == 'Unknown' && hydration == 'Unknown') {
      return const SizedBox.shrink();
    }

    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF4FC3F7).withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF4FC3F7).withOpacity(0.3)),
            ),
            child: Column(
              children: [
                const Icon(Icons.water_drop_outlined, color: Color(0xFF4FC3F7)),
                const SizedBox(height: 8),
                Text('Hydration', style: TextStyle(color: isDark ? Colors.white60 : Colors.black54, fontSize: 12)),
                const SizedBox(height: 4),
                Text(hydration, style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontWeight: FontWeight.bold, fontSize: 14)),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF81C784).withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF81C784).withOpacity(0.3)),
            ),
            child: Column(
              children: [
                const Icon(Icons.face_retouching_natural, color: Color(0xFF81C784)),
                const SizedBox(height: 8),
                Text('Skin Type', style: TextStyle(color: isDark ? Colors.white60 : Colors.black54, fontSize: 12)),
                const SizedBox(height: 4),
                Text(skinType, style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontWeight: FontWeight.bold, fontSize: 14)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildObservationCard(Map<String, dynamic> analysis) {
    final obs = analysis['observations'] as String? ?? '';
    if (obs.isEmpty) return const SizedBox.shrink();
    final isDark = ref.read(themeProvider) == ThemeMode.dark;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.05) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.white12 : Colors.black.withOpacity(0.06)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('🔍', style: TextStyle(fontSize: 22)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('AI Observations',
                    style: TextStyle(
                        color: isDark ? Colors.white : Colors.black87,
                        fontWeight: FontWeight.bold,
                        fontSize: 14)),
                const SizedBox(height: 6),
                Text(obs,
                    style: TextStyle(
                        color: isDark ? Colors.white70 : Colors.black54, fontSize: 13, height: 1.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoutineCard(String title, List<String> steps, Color accent) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: accent.withOpacity(0.07),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: accent.withOpacity(0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: TextStyle(
                  color: accent,
                  fontWeight: FontWeight.bold,
                  fontSize: 15)),
          const SizedBox(height: 12),
          ...steps.asMap().entries.map((entry) {
            final i = entry.key;
            final step = entry.value;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: accent.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${i + 1}',
                      style: TextStyle(
                          color: accent,
                          fontSize: 12,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(step,
                        style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                            height: 1.5)),
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildIngredientsCard(List<String> ingredients) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('✨ Key Ingredients to Look For',
              style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ingredients
                .map((ing) => Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF6A1B9A).withOpacity(0.25),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: const Color(0xFF8E24AA).withOpacity(0.4)),
                      ),
                      child: Text(ing,
                          style: const TextStyle(
                              color: Color(0xFFCE93D8),
                              fontSize: 13,
                              fontWeight: FontWeight.w600)),
                    ))
                .toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildAvoidCard(List<String> avoid) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.redAccent.withOpacity(0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.redAccent.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('🚫 Avoid These',
              style: TextStyle(
                  color: Colors.redAccent,
                  fontWeight: FontWeight.bold,
                  fontSize: 14)),
          const SizedBox(height: 10),
          ...avoid.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  children: [
                    const Icon(Icons.cancel_outlined,
                        color: Colors.redAccent, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                        child: Text(item,
                            style: const TextStyle(
                                color: Colors.white70, fontSize: 13))),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildTipCard(String tip) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF283593).withOpacity(0.5),
            const Color(0xFF6A1B9A).withOpacity(0.5),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF8E24AA).withOpacity(0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('💡', style: TextStyle(fontSize: 22)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Personalised Tip',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14)),
                const SizedBox(height: 6),
                Text(tip,
                    style: const TextStyle(
                        color: Colors.white70, fontSize: 13, height: 1.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _tipCard(Map<String, dynamic> tip, Color textColor, Color subtextColor, Color cardColor, Color cardBorder) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorder),
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
            style: TextStyle(
                color: textColor, fontWeight: FontWeight.bold, fontSize: 13),
          ),
          const SizedBox(height: 4),
          Text(
            tip['detail'] as String,
            style: TextStyle(
                color: subtextColor, fontSize: 11, height: 1.4),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title, Color textColor) {
    return Text(
      title,
      style: TextStyle(
          color: textColor, fontSize: 16, fontWeight: FontWeight.bold),
    );
  }
}
