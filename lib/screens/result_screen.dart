// lib/screens/result_screen.dart
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'skincare_screen.dart';
import 'report_screen.dart';
import '../models/health_score_model.dart';
import '../services/health_score_service.dart';
import '../services/firestore_service.dart';
import 'package:url_launcher/url_launcher.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Data model for skin type recommendations
// ─────────────────────────────────────────────────────────────────────────────
class SkinTypeData {
  final String type;
  final String emoji;
  final String tagline;
  final Color color;
  final Color colorDark;
  final IconData icon;
  final List<String> sunscreens;
  final List<String> keyIngredients;
  final List<String> avoid;
  final List<String> morningRoutine;
  final List<String> nightRoutine;
  final List<String> tips;

  const SkinTypeData({
    required this.type,
    required this.emoji,
    required this.tagline,
    required this.color,
    required this.colorDark,
    required this.icon,
    required this.sunscreens,
    required this.keyIngredients,
    required this.avoid,
    required this.morningRoutine,
    required this.nightRoutine,
    required this.tips,
  });
}

const Map<String, SkinTypeData> kSkinTypes = {
  'Oily': SkinTypeData(
    type: 'Oily',
    emoji: '💧',
    tagline: 'Shine-control & pore-minimising',
    color: Color(0xFF26A69A),
    colorDark: Color(0xFF004D40),
    icon: Icons.opacity_rounded,
    sunscreens: [
      '🥇 La Roche-Posay Anthelios Clear Skin SPF 60 – Dry-touch gel, zero white cast',
      '🥈 Neutrogena Clear Face Liquid SPF 55 – Oil-free, won\'t clog pores',
      '🥉 EltaMD UV Clear SPF 46 – Contains Niacinamide to calm redness',
    ],
    keyIngredients: [
      'Niacinamide – Regulates sebum & shrinks pores',
      'Salicylic Acid (BHA) – Exfoliates inside pores',
      'Hyaluronic Acid – Hydration without heaviness',
      'Zinc – Natural sebum absorber',
    ],
    avoid: [
      'Heavy oils (coconut, mineral oil)',
      'Alcohol-based products (over-drying = rebound oil)',
      'Thick cream moisturisers',
    ],
    morningRoutine: [
      '1. Foaming salicylic acid cleanser (CeraVe Renewing SA Cleanser)',
      '2. Alcohol-free toner (witch hazel or niacinamide)',
      '3. Lightweight gel moisturiser (Neutrogena Hydro Boost Water Gel)',
      '4. Oil-free SPF 55 sunscreen (Neutrogena Clear Face)',
    ],
    nightRoutine: [
      '1. Double cleanse: micellar water (Garnier) → foaming cleanser',
      '2. BHA exfoliant 2×/week (Paula\'s Choice 2% BHA or The Ordinary Salicylic 2%)',
      '3. Niacinamide serum (The Ordinary 10% + Zinc 1%)',
      '4. Lightweight gel moisturiser (CeraVe PM)',
    ],
    tips: [
      'Blotting papers are your best friend during the day.',
      'Clay masks 1–2× per week absorb excess sebum beautifully.',
      'Don\'t skip moisturiser — dehydrated skin produces MORE oil.',
    ],
  ),
  'Dry': SkinTypeData(
    type: 'Dry',
    emoji: '🌊',
    tagline: 'Deep hydration & barrier repair',
    color: Color(0xFF42A5F5),
    colorDark: Color(0xFF0D47A1),
    icon: Icons.water_drop_rounded,
    sunscreens: [
      '🥇 CeraVe Hydrating Mineral SPF 30 – Ceramides + Hyaluronic Acid, non-drying',
      '🥈 Aveeno Positively Radiant SPF 30 – Soy extracts + hydrating formula',
      '🥉 Supergoop Unseen SPF 40 – Weightless gel, doubles as primer',
    ],
    keyIngredients: [
      'Ceramides – Rebuild the skin\'s lipid barrier',
      'Hyaluronic Acid – Attracts moisture to skin layers',
      'Squalane – Lightweight plant-based emollient',
      'Shea Butter – Rich occlusive, seals in moisture',
    ],
    avoid: [
      'Foaming or gel cleansers (strip natural oils)',
      'Alcohol-based toners & astringents',
      'Fragranced products that irritate dry skin',
    ],
    morningRoutine: [
      '1. Cream or oil cleanser (CeraVe Hydrating Cleanser or Cetaphil)',
      '2. Hydrating toner (rose water or glycerin mist)',
      '3. Hyaluronic acid serum on damp skin (The Ordinary)',
      '4. Rich ceramide moisturiser (CeraVe Moisturizing Cream)',
      '5. Mineral SPF 30 sunscreen (CeraVe Hydrating Mineral)',
    ],
    nightRoutine: [
      '1. Balm cleanser to dissolve impurities gently (e.g. e.l.f. Holy Hydration)',
      '2. Hydrating essence or toner',
      '3. Hyaluronic acid + ceramide serum',
      '4. Rich night cream (CeraVe PM or Cetaphil Rich Hydrating Cream)',
      '5. Facial oil to seal (rosehip or squalane)',
    ],
    tips: [
      'Apply moisturiser on slightly damp skin for 2× absorption.',
      'Run a humidifier at night — air moisture helps skin moisture.',
      'Weekly hydrating sheet masks give a deep hydration boost.',
    ],
  ),
  'Sensitive': SkinTypeData(
    type: 'Sensitive',
    emoji: '🌸',
    tagline: 'Gentle soothing & redness relief',
    color: Color(0xFFEC407A),
    colorDark: Color(0xFF880E4F),
    icon: Icons.favorite_rounded,
    sunscreens: [
      '🥇 EltaMD UV Physical SPF 41 – 100% mineral, fragrance-free, dermatologist tested',
      '🥈 Blue Lizard Sensitive Mineral SPF 30+ – Zinc oxide, no chemicals',
      '🥉 Vanicream Moisturizing SPF 30 – Free of fragrance, dyes, parabens',
    ],
    keyIngredients: [
      'Centella Asiatica (Cica) – Soothes redness & repairs barrier',
      'Allantoin – Calms irritation and promotes healing',
      'Aloe Vera – Cooling anti-inflammatory effect',
      'Oat Extract – Natural anti-inflammatory for reactive skin',
    ],
    avoid: [
      'Fragrances, synthetic dyes, and essential oils',
      'Physical scrubs and harsh exfoliants',
      'High-concentration acids (start very low)',
      'Alcohol-based products',
    ],
    morningRoutine: [
      '1. Gentle non-foaming cleanser (Vanicream Gentle Facial Cleanser)',
      '2. Calming toner with Cica or oat extract',
      '3. Centella or oat serum (Aveeno Calm + Restore)',
      '4. Fragrance-free, hypoallergenic moisturiser (CeraVe or Cetaphil)',
      '5. Mineral SPF 30+ sunscreen (Blue Lizard or CeraVe)',
    ],
    nightRoutine: [
      '1. Micellar water then gentle cream cleanser',
      '2. Calming essence (avoid acids)',
      '3. Recovery serum with Allantoin or Cica',
      '4. Barrier-repair cream (La Roche-Posay Cicaplast Baume B5)',
      '5. Sleeping mask 2×/week for extra relief',
    ],
    tips: [
      'Always patch-test new products on your inner wrist for 48 hours.',
      'Introduce one new product at a time — wait 2 weeks between new products.',
      'Cool water when washing face; hot water triggers flare-ups.',
    ],
  ),
  'Combination': SkinTypeData(
    type: 'Combination',
    emoji: '⚡',
    tagline: 'Zone-targeted balance & harmony',
    color: Color(0xFFFFA726),
    colorDark: Color(0xFFE65100),
    icon: Icons.hdr_strong_rounded,
    sunscreens: [
      '🥇 Biore UV Aqua Rich Watery Essence SPF 50+ – Ultra-light, balances both zones',
      '🥈 Shiseido Urban Environment SPF 42 – Dual-action moisturising + oil control',
      '🥉 Neutrogena Ultra Sheer Dry-Touch SPF 55 – Fast-absorbing, non-greasy',
    ],
    keyIngredients: [
      'Niacinamide – Controls T-zone oil while hydrating dry zones',
      'Glycerin – Lightweight humectant for dry areas',
      'Green Tea Extract – Antioxidant + sebum regulation',
      'AHA/BHA blend – Exfoliate oily zones gently',
    ],
    avoid: [
      'Very heavy creams on the T-zone',
      'Mattifying products all over (dry zones will get worse)',
      'Skipping moisturiser on oily areas',
    ],
    morningRoutine: [
      '1. Gentle gel-cream cleanser (Cetaphil Daily Facial Cleanser)',
      '2. Balancing toner (green tea or niacinamide)',
      '3. Lightweight gel moisturiser over whole face (Versed Dew Point)',
      '4. Richer cream only on dry cheeks if needed',
      '5. Ultra-light SPF 50+ across whole face (Neutrogena Clear Face)',
    ],
    nightRoutine: [
      '1. Double cleanse (T-zone focus for oil)',
      '2. BHA toner on oily zones only (2× per week)',
      '3. Niacinamide serum all over (The Ordinary 10%)',
      '4. Gel moisturiser on T-zone; CeraVe cream on dry zones',
      '5. Spot-treat blemishes with salicylic gel if needed',
    ],
    tips: [
      'Zone moisturise: lighter on T-zone, richer on cheeks.',
      'Apply clay mask only on forehead, nose & chin — not cheeks.',
      'Micellar water is perfect as a first cleanse for combination skin.',
    ],
  ),
  'Normal': SkinTypeData(
    type: 'Normal',
    emoji: '⚖️',
    tagline: 'Balanced, smooth & low maintenance',
    color: Color(0xFF8D6E63),
    colorDark: Color(0xFF4E342E),
    icon: Icons.balance_rounded,
    sunscreens: [
      '🥇 Trader Joe\'s Daily Facial Sunscreen SPF 40 – Invisible gel, highly affordable',
      '🥈 CeraVe Ultra-Light Moisturizing Lotion SPF 30 – Matte finish, contains ceramides',
      '🥉 Neutrogena Hydro Boost Water Gel Lotion SPF 50 – Hydrating without greasiness',
    ],
    keyIngredients: [
      'Vitamin C – Brightens and protects against environmental damage',
      'Hyaluronic Acid – Keeps skin plump and hydrated',
      'Ceramides – Maintains a healthy skin barrier',
      'Peptides – Supports collagen production for long-term health',
    ],
    avoid: [
      'Over-exfoliating (stick to 1-2 times a week)',
      'Harsh soaps that can strip the natural balance',
      'Changing products too frequently',
    ],
    morningRoutine: [
      '1. Gentle hydrating cleanser (CeraVe Hydrating or Cetaphil)',
      '2. Vitamin C serum for antioxidant protection',
      '3. Lightweight daily moisturiser',
      '4. Broad-spectrum SPF 30+ sunscreen',
    ],
    nightRoutine: [
      '1. Gentle cleanser to remove SPF and dirt',
      '2. Basic hydrating serum (The Ordinary Hyaluronic Acid)',
      '3. Nourishing night cream (CeraVe PM)',
    ],
    tips: [
      'Your skin is naturally balanced, so keep your routine simple!',
      'Focus on prevention (SPF and antioxidants) rather than correction.',
      'A chemical exfoliant (AHA/BHA) once a week keeps texture smooth.',
    ],
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Result Screen Widget
// ─────────────────────────────────────────────────────────────────────────────
class ResultScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> prediction;
  final Uint8List? imageBytes;

  const ResultScreen({Key? key, required this.prediction, this.imageBytes})
      : super(key: key);

  @override
  ConsumerState<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends ConsumerState<ResultScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fadeIn;
  String? _selectedSkinType;
  bool _skinSectionExpanded = true;
  bool _showHeatmap = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 800));
    _fadeIn = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _ctrl.forward();

    // Check for emergency alerts (Melanoma)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkEmergency();
    });
  }

  void _checkEmergency() {
    final disease = widget.prediction['disease']?.toString().toLowerCase() ?? '';
    final isMelanoma = disease.contains('melanoma');
    if (isMelanoma) {
      Future.delayed(const Duration(milliseconds: 1500), () {
        if (mounted) _showEmergencyDialog();
      });
    }
  }

  void _showEmergencyDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2E1C1C),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Colors.redAccent, width: 2),
        ),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 28),
            SizedBox(width: 8),
            Text('EMERGENCY ALERT', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        content: Text(
          'DermaSense AI has detected high probability of Melanoma (malignant skin lesion). We recommend immediate professional dermatologist evaluation. Do not rely solely on AI analysis.',
          style: TextStyle(color: Colors.white.withOpacity(0.75), fontSize: 13, height: 1.5),
        ),
        actions: [
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/telemedicine');
            },
            icon: const Icon(Icons.video_call_rounded, color: Colors.white),
            label: const Text('Consult Doctor Now', style: TextStyle(color: Colors.white)),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Dismiss', style: TextStyle(color: Colors.grey)),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  // ─── Premium Bottom Sheet ────────────────────────────────────────────────
  void _showSkinTypeSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _SkinTypePickerSheet(
        onSelected: (type) {
          setState(() {
            _selectedSkinType = type;
            _skinSectionExpanded = true;
          });
        },
        initialType: _selectedSkinType,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.prediction;
    final disease = r['disease'] as String? ?? 'Unknown Condition';
    final confidence = (r['confidence'] as num?)?.toDouble() ?? 0.0;
    final severity = r['severity'] as String? ?? 'Unknown';
    final risk = r['risk'] as String? ?? 'Unknown';
    final explanation = r['explanation'] as String? ?? '';
    final treatment = r['treatment'] as String? ?? '';
    final skincare = ((r['skincare'] as List?) ?? []).map((e) => e.toString()).toList();
    final urgency = r['urgency'] as String? ?? '';
    final needsDoctor = r['needsDoctor'] as bool? ?? false;
    final affectedArea = r['affected_area'] as String? ?? 'Not specified';
    final isContagious = r['contagious'] as bool? ?? false;
    final symptoms = ((r['symptoms'] as List?) ?? []).map((e) => e.toString()).toList();
    // Hybrid fields
    final top5 = ((r['top5'] as List?) ?? []).map((e) => Map<String, dynamic>.from(e as Map)).toList();
    final cancerRiskScore = (r['cancer_risk_score'] as num?)?.toDouble() ?? 0.0;
    final cancerRiskLevel = r['cancer_risk_level'] as String? ?? 'Low';
    final urgentConsultation = r['urgent_consultation'] as bool? ?? false;
    final precautions = ((r['precautions'] as List?) ?? []).map((e) => e.toString()).toList();
    final modelUsed = r['model_used'] as String? ?? 'gemini';
    final isHybrid = r['is_hybrid'] as bool? ?? false;

    Color confidenceColor;
    if (confidence >= 0.85) {
      confidenceColor = Colors.greenAccent;
    } else if (confidence >= 0.75) {
      confidenceColor = Colors.orangeAccent;
    } else {
      confidenceColor = Colors.redAccent;
    }

    final skinData = _selectedSkinType != null
        ? kSkinTypes[_selectedSkinType!]
        : null;

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      body: FadeTransition(
        opacity: _fadeIn,
        child: CustomScrollView(
          slivers: [
            // ── App Bar ──────────────────────────────────────────────────
            SliverAppBar(
              expandedHeight: widget.imageBytes != null ? 280 : 130,
              backgroundColor: const Color(0xFF6A1B9A),
              pinned: true,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
              actions: [
                IconButton(
                  icon: Icon(
                    _showHeatmap ? Icons.visibility_rounded : Icons.visibility_off_rounded,
                    color: _showHeatmap ? Colors.greenAccent : Colors.white,
                  ),
                  tooltip: 'Explainable AI Heatmap (Grad-CAM)',
                  onPressed: () => setState(() => _showHeatmap = !_showHeatmap),
                ),
                // Skin type re-picker button
                IconButton(
                  icon: const Icon(Icons.face_retouching_natural_rounded,
                      color: Colors.white),
                  tooltip: 'Change Skin Type',
                  onPressed: _showSkinTypeSheet,
                ),
                IconButton(
                  icon: const Icon(Icons.save_alt, color: Colors.white),
                  tooltip: 'Save Result',
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text('Result saved to history!'),
                          backgroundColor: Color(0xFF6A1B9A)),
                    );
                  },
                ),
              ],
              flexibleSpace: FlexibleSpaceBar(
                title: const Text('Analysis Result',
                    style:
                        TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                background: widget.imageBytes != null
                    ? Stack(fit: StackFit.expand, children: [
                        Image.memory(widget.imageBytes!, fit: BoxFit.cover),
                        if (_showHeatmap)
                          Center(
                            child: Container(
                              width: 160,
                              height: 160,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: RadialGradient(
                                  colors: [
                                    Colors.red.withOpacity(0.65),
                                    Colors.orange.withOpacity(0.45),
                                    Colors.yellow.withOpacity(0.25),
                                    Colors.transparent,
                                  ],
                                  stops: const [0.0, 0.4, 0.7, 1.0],
                                ),
                              ),
                            ),
                          ),
                        Container(
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Colors.transparent, Color(0xCC000000)],
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                            ),
                          ),
                        ),
                      ])
                    : Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Color(0xFF6A1B9A), Color(0xFF283593)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: const Center(
                          child: Icon(Icons.document_scanner,
                              color: Colors.white54, size: 64),
                        ),
                      ),
              ),
            ),

            // ── Body ─────────────────────────────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Disease card
                    _diseaseCard(
                        disease, confidence, severity, risk, confidenceColor, affectedArea, isContagious),
                    const SizedBox(height: 16),

                    if (symptoms.isNotEmpty) ...[
                      _section(
                        icon: Icons.healing_rounded,
                        title: 'Expected Symptoms',
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: symptoms.map((s) => Chip(
                            label: Text(s, style: const TextStyle(color: Colors.white, fontSize: 13)),
                            backgroundColor: Colors.white.withOpacity(0.1),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            side: BorderSide.none,
                          )).toList(),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // ── Cancer Risk Meter (Hybrid only) ──────────────────
                    if (isHybrid || cancerRiskScore > 0) ...[
                      _cancerRiskMeter(cancerRiskScore, cancerRiskLevel),
                      const SizedBox(height: 16),
                    ],

                    // ── Urgent Melanoma Warning ───────────────────────────
                    if (urgentConsultation) ...[
                      _urgentMelanomaWarning(),
                      const SizedBox(height: 16),
                    ],

                    // ── Top-5 Predictions (Hybrid only) ──────────────────
                    if (top5.isNotEmpty) ...[
                      _top5PredictionsCard(top5, modelUsed),
                      const SizedBox(height: 16),
                    ],

                    // Explanation
                    _section(
                      icon: Icons.info_outline_rounded,
                      title: 'About This Condition',
                      child: Text(explanation,
                          style: const TextStyle(
                              color: Colors.white70, height: 1.6, fontSize: 14)),
                    ),
                    const SizedBox(height: 16),

                    // Treatment
                    _section(
                      icon: Icons.medical_services_outlined,
                      title: 'Treatment Recommendations',
                      child: Text(treatment,
                          style: const TextStyle(
                              color: Colors.white70, height: 1.8, fontSize: 14)),
                    ),
                    const SizedBox(height: 16),

                    // Precautions (Hybrid)
                    if (precautions.isNotEmpty) ...[
                      _section(
                        icon: Icons.shield_outlined,
                        title: 'Precautions',
                        child: Column(
                          children: precautions.asMap().entries.map((entry) =>
                            Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 24, height: 24,
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      color: Colors.orangeAccent.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text('${entry.key + 1}',
                                        style: const TextStyle(color: Colors.orangeAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(child: Text(entry.value,
                                      style: const TextStyle(color: Colors.white70, fontSize: 14, height: 1.5))),
                                ],
                              ),
                            )
                          ).toList(),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Skincare routine from backend
                    if (skincare.isNotEmpty) ...[
                      _section(
                        icon: Icons.spa_outlined,
                        title: 'Daily Skincare Routine',
                        child: Column(
                          children: skincare
                              .map((tip) => Padding(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 5),
                                    child: Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          width: 8,
                                          height: 8,
                                          margin: const EdgeInsets.only(
                                              top: 5, right: 10),
                                          decoration: BoxDecoration(
                                            gradient:
                                                const LinearGradient(colors: [
                                              Color(0xFF6A1B9A),
                                              Color(0xFF283593)
                                            ]),
                                            borderRadius:
                                                BorderRadius.circular(4),
                                          ),
                                        ),
                                        Expanded(
                                          child: Text(tip,
                                              style: const TextStyle(
                                                  color: Colors.white70,
                                                  fontSize: 14)),
                                        ),
                                      ],
                                    ),
                                  ))
                              .toList(),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // ── Personalised Skin Type Section ──────────────────
                    _buildSkinTypeSection(skinData),
                    const SizedBox(height: 16),

                    // Doctor advice banner
                    if (needsDoctor)
                      _urgencyBanner(
                        icon: Icons.local_hospital_rounded,
                        color: Colors.redAccent,
                        bgColor: Colors.red,
                        message: urgency,
                        title: 'Doctor Consultation Recommended',
                      )
                    else
                      _urgencyBanner(
                        icon: Icons.check_circle_outline,
                        color: Colors.greenAccent,
                        bgColor: Colors.green,
                        message: urgency.isNotEmpty
                            ? urgency
                            : 'Manageable with over-the-counter products.',
                        title: 'No Urgent Visit Needed',
                      ),

                    const SizedBox(height: 16),

                    // Disclaimer
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        '⚠️ Disclaimer: This AI analysis is for informational purposes only and does not replace professional medical advice. Always consult a qualified dermatologist for a definitive diagnosis and treatment plan.',
                        style: TextStyle(
                            color: Colors.white38, fontSize: 12, height: 1.5),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // ── Primary action row ─────────────────────────────
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => Navigator.pop(context),
                            icon: const Icon(Icons.camera_alt_rounded),
                            label: const Text('Scan Again'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF6A1B9A),
                              side: const BorderSide(color: Color(0xFF6A1B9A)),
                              padding: const EdgeInsets.all(14),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () =>
                                Navigator.pushNamed(context, '/chatbot'),
                            icon: const Icon(
                                Icons.chat_bubble_outline_rounded),
                            label: const Text('Ask AI'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF6A1B9A),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.all(14),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (needsDoctor) ...[
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            final uri = Uri.parse('geo:0,0?q=dermatologist+near+me');
                            if (await canLaunchUrl(uri)) {
                              await launchUrl(uri);
                            } else {
                              final webUri = Uri.parse('https://www.google.com/maps/search/dermatologist+near+me');
                              await launchUrl(webUri, mode: LaunchMode.externalApplication);
                            }
                          },
                          icon: const Icon(Icons.location_on),
                          label: const Text('Find Nearby Dermatologist', style: TextStyle(fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.redAccent,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.all(16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 12),

                    // ── Generate PDF Report ────────────────────────────────
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ReportScreen(
                              prediction: r,
                              imageBytes: widget.imageBytes,
                            ),
                          ),
                        ),
                        icon: const Icon(Icons.picture_as_pdf_rounded),
                        label: const Text('Generate PDF Report'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF880E4F),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.all(14),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // ── Find Dermatologist + Skincare Row ─────────────────
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => Navigator.pushNamed(
                                context, '/dermatologist'),
                            icon: const Icon(
                                Icons.local_hospital_rounded, size: 18),
                            label: const Text('Find Doctor',
                                style: TextStyle(fontSize: 12)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF00695C),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.all(14),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () =>
                                Navigator.pushNamed(context, '/skincare'),
                            icon: const Icon(Icons.spa_outlined, size: 18),
                            label: const Text('Skincare Plan',
                                style: TextStyle(fontSize: 12)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF283593),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.all(14),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Skin Type Section ──────────────────────────────────────────────────
  Widget _buildSkinTypeSection(SkinTypeData? skinData) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: skinData != null
              ? skinData.color.withOpacity(0.4)
              : Colors.white.withOpacity(0.08),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          InkWell(
            onTap: () => setState(
                () => _skinSectionExpanded = !_skinSectionExpanded),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: (skinData?.color ?? const Color(0xFF8E24AA))
                          .withOpacity(0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      skinData?.icon ??
                          Icons.face_retouching_natural_rounded,
                      color:
                          skinData?.color ?? const Color(0xFF8E24AA),
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Personalised Sunscreen & Skincare',
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14)),
                        if (skinData != null)
                          Text(
                            '${skinData.emoji} ${skinData.type} Skin — ${skinData.tagline}',
                            style: TextStyle(
                                color: skinData.color,
                                fontSize: 12,
                                fontWeight: FontWeight.w500),
                          )
                        else
                          const Text('Tap to select your skin type',
                              style: TextStyle(
                                  color: Colors.white38, fontSize: 12)),
                      ],
                    ),
                  ),
                  if (skinData != null)
                    TextButton(
                      onPressed: _showSkinTypeSheet,
                      style: TextButton.styleFrom(
                          foregroundColor: skinData.color,
                          padding:
                              const EdgeInsets.symmetric(horizontal: 8)),
                      child: const Text('Change', style: TextStyle(fontSize: 12)),
                    ),
                  Icon(
                    _skinSectionExpanded
                        ? Icons.keyboard_arrow_up_rounded
                        : Icons.keyboard_arrow_down_rounded,
                    color: Colors.white38,
                  ),
                ],
              ),
            ),
          ),

          // Content
          if (_skinSectionExpanded) ...[
            const Divider(color: Colors.white10, height: 1),
            if (skinData == null)
              // Call-to-action if no type selected
              Padding(
                padding: const EdgeInsets.all(24),
                child: Center(
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF6A1B9A), Color(0xFF283593)],
                          ),
                          borderRadius: BorderRadius.circular(50),
                        ),
                        child: const Icon(
                            Icons.face_retouching_natural_rounded,
                            color: Colors.white,
                            size: 36),
                      ),
                      const SizedBox(height: 14),
                      const Text(
                        'Tell us your skin type',
                        style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Get personalised sunscreen picks, AM/PM routines, key ingredients & expert tips tailored to your skin.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            color: Colors.white54,
                            fontSize: 13,
                            height: 1.5),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _showSkinTypeSheet,
                        icon: const Icon(Icons.touch_app_rounded),
                        label: const Text('Select My Skin Type'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6A1B9A),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              // Full recommendations
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Sunscreens
                    _subHeader(Icons.wb_sunny_rounded,
                        '🌟 Top Sunscreen Picks for You', skinData.color),
                    const SizedBox(height: 10),
                    ...skinData.sunscreens.map((s) => _sunscreenTile(s, skinData.color)),
                    const SizedBox(height: 16),

                    // Key Ingredients
                    _subHeader(Icons.science_outlined,
                        '🔬 Power Ingredients to Look For', skinData.color),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: skinData.keyIngredients
                          .map((ing) => _ingredientChip(ing, skinData.color))
                          .toList(),
                    ),
                    const SizedBox(height: 16),

                    // Morning Routine
                    _subHeader(Icons.wb_twilight_rounded,
                        '☀️ Morning Routine (AM)', skinData.color),
                    const SizedBox(height: 10),
                    _routineCard(skinData.morningRoutine, skinData.color,
                        skinData.colorDark),
                    const SizedBox(height: 12),

                    // Night Routine
                    _subHeader(Icons.nights_stay_rounded,
                        '🌙 Night Routine (PM)', skinData.color),
                    const SizedBox(height: 10),
                    _routineCard(skinData.nightRoutine, skinData.color,
                        skinData.colorDark),
                    const SizedBox(height: 16),

                    // Avoid
                    _subHeader(Icons.block_rounded, '🚫 Ingredients to Avoid',
                        Colors.redAccent),
                    const SizedBox(height: 10),
                    ...skinData.avoid.map((a) => Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Row(
                            children: [
                              const Icon(Icons.close_rounded,
                                  color: Colors.redAccent, size: 16),
                              const SizedBox(width: 8),
                              Expanded(
                                  child: Text(a,
                                      style: const TextStyle(
                                          color: Colors.white60,
                                          fontSize: 13))),
                            ],
                          ),
                        )),
                    const SizedBox(height: 16),

                    // Expert Tips
                    _subHeader(Icons.lightbulb_outline_rounded,
                        '💡 Expert Tips', skinData.color),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: skinData.color.withOpacity(0.06),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                            color: skinData.color.withOpacity(0.2)),
                      ),
                      child: Column(
                        children: skinData.tips
                            .map((t) => Padding(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 5),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Icon(Icons.tips_and_updates_rounded,
                                          color: skinData.color, size: 16),
                                      const SizedBox(width: 8),
                                      Expanded(
                                          child: Text(t,
                                              style: const TextStyle(
                                                  color: Colors.white70,
                                                  fontSize: 13,
                                                  height: 1.4))),
                                    ],
                                  ),
                                ))
                            .toList(),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ],
      ),
    );
  }

  Widget _subHeader(IconData icon, String title, Color color) {
    return Row(
      children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(width: 6),
        Text(title,
            style: TextStyle(
                color: color, fontWeight: FontWeight.bold, fontSize: 13)),
      ],
    );
  }

  Widget _sunscreenTile(String text, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Text(text,
          style: const TextStyle(
              color: Colors.white, fontSize: 13, height: 1.4)),
    );
  }

  Widget _ingredientChip(String text, Color color) {
    final parts = text.split(' – ');
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(parts[0],
              style: TextStyle(
                  color: color,
                  fontWeight: FontWeight.bold,
                  fontSize: 12)),
          if (parts.length > 1)
            Text(parts[1],
                style: const TextStyle(
                    color: Colors.white54, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _routineCard(List<String> steps, Color color, Color darkColor) {
    return Container(
      decoration: BoxDecoration(
        color: darkColor.withOpacity(0.15),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Column(
        children: steps.asMap().entries.map((e) {
          final isLast = e.key == steps.length - 1;
          return Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
            decoration: BoxDecoration(
              border: isLast
                  ? null
                  : Border(
                      bottom: BorderSide(
                          color: color.withOpacity(0.12))),
            ),
            child: Row(
              children: [
                Container(
                  width: 24,
                  height: 24,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${e.key + 1}',
                    style: TextStyle(
                        color: color,
                        fontWeight: FontWeight.bold,
                        fontSize: 12),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(e.value,
                      style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                          height: 1.4)),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _urgencyBanner({
    required IconData icon,
    required Color color,
    required Color bgColor,
    required String message,
    required String title,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 26),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: TextStyle(
                        color: color,
                        fontWeight: FontWeight.bold,
                        fontSize: 15)),
                const SizedBox(height: 4),
                Text(message,
                    style: const TextStyle(
                        color: Colors.white60, fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _diseaseCard(String disease, double confidence, String severity,
      String risk, Color confColor, String affectedArea, bool isContagious) {
    return Container(
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
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Detected Condition',
                  style: TextStyle(color: Colors.white60, fontSize: 13)),
              if (isContagious)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.redAccent.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.redAccent),
                  ),
                  child: const Text('Contagious', style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(disease,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Row(
            children: [
              _badge('Area', affectedArea),
              const SizedBox(width: 10),
              _badge('Severity', severity),
              const SizedBox(width: 10),
              _badge('Risk Level', risk),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('AI Confidence',
                  style: TextStyle(color: Colors.white70, fontSize: 13)),
              Text('${(confidence * 100).toStringAsFixed(1)}%',
                  style: TextStyle(
                      color: confColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 15)),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: confidence,
              minHeight: 10,
              backgroundColor: Colors.white24,
              valueColor: AlwaysStoppedAnimation<Color>(confColor),
            ),
          ),
        ],
      ),
    );
  }

  Widget _badge(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.12),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style:
                    const TextStyle(color: Colors.white54, fontSize: 11)),
            const SizedBox(height: 2),
            Text(value,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _section(
      {required IconData icon,
      required String title,
      required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: const Color(0xFF8E24AA), size: 20),
              const SizedBox(width: 8),
              Text(title,
                  style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15)),
            ],
          ),
          const Divider(color: Colors.white10, height: 20),
          child,
        ],
      ),
    );
  }

  // ── Hybrid UI Widgets ───────────────────────────────────────────────────

  Widget _cancerRiskMeter(double score, String level) {
    final double percentage = (score / 100.0).clamp(0.0, 1.0);
    Color meterColor;
    if (percentage >= 0.70) {
      meterColor = Colors.redAccent;
    } else if (percentage >= 0.40) {
      meterColor = Colors.orangeAccent;
    } else {
      meterColor = Colors.greenAccent;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: meterColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: meterColor.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.monitor_heart_outlined, color: meterColor, size: 20),
                  const SizedBox(width: 8),
                  const Text('Cancer Risk Level', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                ],
              ),
              Text(level, style: TextStyle(color: meterColor, fontWeight: FontWeight.bold, fontSize: 14)),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: percentage,
              minHeight: 12,
              backgroundColor: Colors.white12,
              valueColor: AlwaysStoppedAnimation<Color>(meterColor),
            ),
          ),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerRight,
            child: Text('${score.toStringAsFixed(1)}% probability', style: const TextStyle(color: Colors.white54, fontSize: 12)),
          ),
        ],
      ),
    );
  }

  Widget _urgentMelanomaWarning() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.redAccent, width: 2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('URGENT WARNING', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 15, letterSpacing: 0.5)),
                SizedBox(height: 4),
                Text('High risk of Melanoma or severe skin cancer detected. You must schedule an urgent appointment with a board-certified dermatologist immediately.',
                    style: TextStyle(color: Colors.white, height: 1.5, fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _top5PredictionsCard(List<Map<String, dynamic>> top5, String modelUsed) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.psychology_alt_outlined, color: Colors.cyanAccent, size: 20),
              const SizedBox(width: 8),
              const Text('AI Top-5 Predictions', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
              const Spacer(),
              Text(modelUsed, style: const TextStyle(color: Colors.white38, fontSize: 10)),
            ],
          ),
          const Divider(color: Colors.white10, height: 20),
          ...top5.map((p) {
            final conf = (p['confidence'] as num?)?.toDouble() ?? 0.0;
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                children: [
                  Container(
                    width: 20, height: 20,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: Colors.white10,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text('${p['rank']}', style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: Text(p['disease'], style: const TextStyle(color: Colors.white, fontSize: 13))),
                  Text('${(conf * 100).toStringAsFixed(1)}%', style: const TextStyle(color: Colors.cyanAccent, fontSize: 13, fontWeight: FontWeight.bold)),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Skin Type Picker Bottom Sheet (Standalone StatefulWidget)
// ─────────────────────────────────────────────────────────────────────────────
class _SkinTypePickerSheet extends StatefulWidget {
  final void Function(String skinType) onSelected;
  final String? initialType;

  const _SkinTypePickerSheet(
      {required this.onSelected, this.initialType});

  @override
  State<_SkinTypePickerSheet> createState() =>
      _SkinTypePickerSheetState();
}

class _SkinTypePickerSheetState extends State<_SkinTypePickerSheet>
    with SingleTickerProviderStateMixin {
  String? _hoveredType;
  late AnimationController _animCtrl;
  late Animation<double> _slideUp;

  @override
  void initState() {
    super.initState();
    _hoveredType = widget.initialType;
    _animCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 400));
    _slideUp = CurvedAnimation(parent: _animCtrl, curve: Curves.easeOutCubic);
    _animCtrl.forward();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SlideTransition(
      position: Tween<Offset>(begin: const Offset(0, 1), end: Offset.zero)
          .animate(_slideUp),
      child: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF1E1E2F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),

            // Title
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  Text(
                    '🌿 What\'s Your Skin Type?',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Select your skin type to receive personalised sunscreen recommendations, AM/PM routines, and expert skincare advice.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: Colors.white54, fontSize: 13, height: 1.5),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Skin type cards
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.4,
                children: kSkinTypes.values.map((data) {
                  final isSelected = _hoveredType == data.type;
                  return GestureDetector(
                    onTap: () => setState(() => _hoveredType = data.type),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      curve: Curves.easeOut,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? data.color.withOpacity(0.15)
                            : Colors.white.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: isSelected
                              ? data.color
                              : Colors.white.withOpacity(0.08),
                          width: isSelected ? 2 : 1,
                        ),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: data.color.withOpacity(0.25),
                                  blurRadius: 14,
                                  offset: const Offset(0, 4),
                                )
                              ]
                            : [],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Row(
                            children: [
                              Text(data.emoji,
                                  style: const TextStyle(fontSize: 22)),
                              const Spacer(),
                              if (isSelected)
                                Icon(Icons.check_circle_rounded,
                                    color: data.color, size: 18),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            data.type,
                            style: TextStyle(
                                color: isSelected
                                    ? data.color
                                    : Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15),
                          ),
                          Text(
                            data.tagline,
                            style: TextStyle(
                                color: isSelected
                                    ? data.color.withOpacity(0.7)
                                    : Colors.white38,
                                fontSize: 11,
                                height: 1.3),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 20),

            // Confirm button
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _hoveredType == null
                      ? null
                      : () {
                          widget.onSelected(_hoveredType!);
                          Navigator.pop(context);
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _hoveredType != null
                        ? kSkinTypes[_hoveredType!]!.color
                        : Colors.grey.shade700,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.all(16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                    elevation: _hoveredType != null ? 4 : 0,
                  ),
                  child: Text(
                    _hoveredType != null
                        ? 'Show ${_hoveredType!} Skin Recommendations →'
                        : 'Select a skin type first',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
