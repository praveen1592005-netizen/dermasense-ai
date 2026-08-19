// lib/screens/skincare_analyzer_screen.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';
import 'skincare_result_screen.dart';

// ─── Skin type metadata ──────────────────────────────────────────────────────

const _kSkinTypeInfo = {
  'Oily': {
    'icon': '✨',
    'desc': 'Shiny appearance, enlarged pores, prone to breakouts',
    'color': Color(0xFFFFA000),
    'gradient': [Color(0xFF7B4F00), Color(0xFF5D3A00)],
  },
  'Dry': {
    'icon': '💧',
    'desc': 'Tight feeling, flaky patches, dull appearance',
    'color': Color(0xFF42A5F5),
    'gradient': [Color(0xFF0D47A1), Color(0xFF1565C0)],
  },
  'Sensitive': {
    'icon': '🌸',
    'desc': 'Redness, irritation, reacts easily to products',
    'color': Color(0xFFEC407A),
    'gradient': [Color(0xFF880E4F), Color(0xFFC2185B)],
  },
  'Normal': {
    'icon': '⚖️',
    'desc': 'Balanced, smooth, rarely has breakouts',
    'color': Color(0xFF66BB6A),
    'gradient': [Color(0xFF1B5E20), Color(0xFF2E7D32)],
  },
  'Combination': {
    'icon': '🔀',
    'desc': 'Oily T-zone (forehead, nose), dry on cheeks',
    'color': Color(0xFFAB47BC),
    'gradient': [Color(0xFF4A148C), Color(0xFF6A1B9A)],
  },
};

const _kBodyLocations = [
  'Face', 'Scalp', 'Neck', 'Chest', 'Back', 'Abdomen',
  'Upper Arm', 'Forearm', 'Hand', 'Thigh', 'Leg', 'Foot', 'Other',
];

const _kDurationOptions = [
  {'label': 'Less than 1 week', 'days': 5},
  {'label': '1–4 weeks', 'days': 14},
  {'label': '1–3 months', 'days': 60},
  {'label': '3–12 months', 'days': 180},
  {'label': 'Over 1 year', 'days': 400},
];

const _kGenders = ['Male', 'Female', 'Other', 'Prefer not to say'];

// ─── Screen ──────────────────────────────────────────────────────────────────

class SkincareAnalyzerScreen extends ConsumerStatefulWidget {
  const SkincareAnalyzerScreen({super.key});

  @override
  ConsumerState<SkincareAnalyzerScreen> createState() =>
      _SkincareAnalyzerScreenState();
}

class _SkincareAnalyzerScreenState
    extends ConsumerState<SkincareAnalyzerScreen> {
  // ── Photo ─────────────────────────────────────────────────────────────────
  Uint8List? _imageBytes;
  bool _isLoading = false;
  String _loadingMessage = 'Analyzing your skin...';
  String? _detectedSkinType;
  String? _selectedSkinType;
  bool _showForm = false; // true after photo is successfully loaded

  // ── Form fields (required, marked with *) ─────────────────────────────────
  final _ageController = TextEditingController();
  String? _gender;
  String? _bodyLocation;
  int? _durationDays;

  // At least one skin concern required
  final Set<String> _skinConcerns = {};
  static const _kConcernOptions = [
    'Acne / Breakouts',
    'Dryness / Flakiness',
    'Oiliness',
    'Redness / Sensitivity',
    'Dark Spots',
    'Wrinkles / Aging',
    'Uneven Tone',
    'Itching / Burning',
  ];

  // ── Optional symptom fields ───────────────────────────────────────────────
  bool? _pain;
  bool? _bleeding;
  bool? _growing;
  bool? _familyHistory;

  // ── Validation state ──────────────────────────────────────────────────────
  bool _showValidationError = false;
  final _scrollCtrl = ScrollController();
  // Keys for auto-scrolling to first incomplete field
  final _ageKey = GlobalKey();
  final _genderKey = GlobalKey();
  final _locationKey = GlobalKey();
  final _durationKey = GlobalKey();
  final _concernKey = GlobalKey();

  // ── Computed: all required fields filled? ─────────────────────────────────
  bool get _isFormComplete =>
      _ageController.text.trim().isNotEmpty &&
      int.tryParse(_ageController.text.trim()) != null &&
      _gender != null &&
      _bodyLocation != null &&
      _durationDays != null &&
      _skinConcerns.isNotEmpty &&
      _selectedSkinType != null;

  @override
  void dispose() {
    _ageController.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  // ── Image Picking ─────────────────────────────────────────────────────────

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final XFile? picked = await picker.pickImage(
        source: source,
        maxWidth: 800,
        imageQuality: 85,
      );
      if (picked == null) return;
      final bytes = await picked.readAsBytes();
      setState(() {
        _imageBytes = bytes;
        _showForm = false;
        _selectedSkinType = null;
        _detectedSkinType = null;
        _showValidationError = false;
      });
      await _analyzeSkinType(bytes);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text('Could not open image: $e'),
            backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _analyzeSkinType(Uint8List bytes) async {
    setState(() {
      _isLoading = true;
      _loadingMessage = 'Analyzing skin type from photo...';
    });
    try {
      final base64Img = base64Encode(bytes);
      final api = ref.read(apiClientProvider);
      final skinType = await api.predictSkinType(base64Img);

      if (!mounted) return;

      if (skinType == 'NO_FACE') {
        setState(() {
          _isLoading = false;
          _imageBytes = null;
          _showForm = false;
          _selectedSkinType = null;
          _detectedSkinType = null;
        });
        _showNoFaceDialog();
        return;
      }

      setState(() {
        _detectedSkinType = skinType;
        _selectedSkinType = skinType;
        _showForm = true;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _showForm = true;
        _detectedSkinType = 'Normal';
        _selectedSkinType = 'Normal';
      });
    }
  }

  // ── Proceed to result ─────────────────────────────────────────────────────

  void _tryProceed() {
    if (!_isFormComplete) {
      setState(() => _showValidationError = true);
      _scrollToFirstIncomplete();
      return;
    }
    setState(() => _showValidationError = false);
    _proceedWithSkinType();
  }

  void _proceedWithSkinType() {
    if (_selectedSkinType == null || _imageBytes == null) return;
    final api = ref.read(apiClientProvider);
    final plan = api.getSkincarePlan(_selectedSkinType!);
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => SkincareResultScreen(
          skinType: _selectedSkinType!,
          imageBytes: _imageBytes!,
          skincarePlan: plan,
        ),
      ),
    );
  }

  void _scrollToFirstIncomplete() {
    GlobalKey? target;
    if (_ageController.text.trim().isEmpty ||
        int.tryParse(_ageController.text.trim()) == null) {
      target = _ageKey;
    } else if (_gender == null) {
      target = _genderKey;
    } else if (_bodyLocation == null) {
      target = _locationKey;
    } else if (_durationDays == null) {
      target = _durationKey;
    } else if (_skinConcerns.isEmpty) {
      target = _concernKey;
    }

    if (target != null) {
      final ctx = target.currentContext;
      if (ctx != null) {
        Scrollable.ensureVisible(ctx,
            duration: const Duration(milliseconds: 450),
            curve: Curves.easeInOut,
            alignment: 0.1);
      }
    }
  }

  // ── No face dialog ────────────────────────────────────────────────────────

  void _showNoFaceDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1A1A2E), Color(0xFF16213E)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(28),
            border:
                Border.all(color: const Color(0xFFEF5350).withValues(alpha: 0.5), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFEF5350).withValues(alpha: 0.2),
                blurRadius: 30,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  gradient: const RadialGradient(
                    colors: [Color(0xFFFF5252), Color(0xFFB71C1C)],
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFEF5350).withValues(alpha: 0.4),
                      blurRadius: 20,
                    ),
                  ],
                ),
                child: const Icon(Icons.face_retouching_off_rounded,
                    color: Colors.white, size: 40),
              ),
              const SizedBox(height: 20),
              const Text('No Face Detected',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5)),
              const SizedBox(height: 12),
              const Text(
                'Our AI could not detect a human face. Please upload a clear selfie of your face for accurate skin analysis.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white60, fontSize: 14, height: 1.6),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                ),
                child: const Column(
                  children: [
                    _DialogTip(
                        icon: Icons.light_mode_outlined,
                        text: 'Use natural lighting — avoid dark environments'),
                    SizedBox(height: 8),
                    _DialogTip(
                        icon: Icons.face_outlined,
                        text: 'Ensure your full face is clearly visible'),
                    SizedBox(height: 8),
                    _DialogTip(
                        icon: Icons.camera_front_outlined,
                        text: 'Use the front camera or a close-up face photo'),
                    SizedBox(height: 8),
                    _DialogTip(
                        icon: Icons.filter_none_outlined,
                        text: 'Avoid filters, stickers or heavy edits'),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        Navigator.pop(ctx);
                        _pickImage(ImageSource.gallery);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.07),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white24),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.photo_library_rounded,
                                color: Colors.white70, size: 18),
                            SizedBox(width: 6),
                            Text('Gallery',
                                style: TextStyle(
                                    color: Colors.white70,
                                    fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        Navigator.pop(ctx);
                        _pickImage(ImageSource.camera);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF1B5E20), Color(0xFF43A047)],
                          ),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.camera_alt_rounded,
                                color: Colors.white, size: 18),
                            SizedBox(width: 6),
                            Text('Take Selfie',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Build
  // ─────────────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D1A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Skin Care Analysis',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: _isLoading ? _buildLoading() : _buildContent(),
    );
  }

  Widget _buildLoading() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_imageBytes != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Image.memory(_imageBytes!,
                    height: 200, width: 200, fit: BoxFit.cover),
              ),
            ),
          const SizedBox(
            width: 60,
            height: 60,
            child: CircularProgressIndicator(
                color: Color(0xFF66BB6A), strokeWidth: 3),
          ),
          const SizedBox(height: 24),
          Text(_loadingMessage,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w500)),
          const SizedBox(height: 8),
          const Text('Powered by DermaSense AI',
              style: TextStyle(color: Colors.white38, fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      controller: _scrollCtrl,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header Banner ───────────────────────────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1B5E20), Color(0xFF2E7D32)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: const Column(
              children: [
                Icon(Icons.face_retouching_natural,
                    color: Colors.white, size: 48),
                SizedBox(height: 12),
                Text('Skin Type Detection',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold)),
                SizedBox(height: 6),
                Text(
                  'Upload a clear selfie of your face in good lighting for accurate skin type detection.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white70, fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── Image preview ───────────────────────────────────────────────
          if (_imageBytes != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Image.memory(_imageBytes!,
                  height: 220, width: double.infinity, fit: BoxFit.cover),
            ),
            const SizedBox(height: 12),
            // Change photo button
            Center(
              child: TextButton.icon(
                onPressed: () {
                  setState(() {
                    _imageBytes = null;
                    _showForm = false;
                    _selectedSkinType = null;
                    _detectedSkinType = null;
                    _showValidationError = false;
                  });
                },
                icon: const Icon(Icons.refresh_rounded,
                    color: Colors.white54, size: 16),
                label: const Text('Take another photo',
                    style: TextStyle(color: Colors.white54)),
              ),
            ),
            const SizedBox(height: 8),
          ],

          // ── Mandatory skin details form (shows after photo upload) ───────
          if (_showForm) ...[
            // AI detected skin type badge
            if (_detectedSkinType != null) ...[
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF66BB6A).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: const Color(0xFF66BB6A).withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.auto_awesome,
                        color: Color(0xFF66BB6A), size: 14),
                    const SizedBox(width: 6),
                    Text(
                      'AI detected: $_detectedSkinType Skin',
                      style: const TextStyle(
                          color: Color(0xFF66BB6A),
                          fontSize: 13,
                          fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // ── Validation error banner ─────────────────────────────────
            if (_showValidationError) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF5350).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                      color: const Color(0xFFEF5350).withValues(alpha: 0.5)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.error_outline_rounded,
                        color: Color(0xFFEF5350), size: 20),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Please complete all required fields marked with *',
                        style: TextStyle(
                            color: Color(0xFFEF5350),
                            fontSize: 13,
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // ════════════════════════════════════════════════════════════
            // MANDATORY SKIN DETAILS FORM
            // ════════════════════════════════════════════════════════════
            _formSectionHeader('Skin Details', Icons.assignment_outlined,
                subtitle: 'Required fields are marked with '),

            const SizedBox(height: 16),

            // ── 1. Age * ───────────────────────────────────────────────
            _requiredLabel('Age', _ageKey),
            const SizedBox(height: 8),
            TextField(
              key: _ageKey,
              controller: _ageController,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              style: const TextStyle(color: Colors.white),
              onChanged: (_) => setState(() {}),
              decoration: _inputDecoration(
                hint: 'Enter your age',
                icon: Icons.cake_outlined,
                isError: _showValidationError &&
                    (_ageController.text.trim().isEmpty ||
                        int.tryParse(_ageController.text.trim()) == null),
              ),
            ),
            const SizedBox(height: 20),

            // ── 2. Gender * ────────────────────────────────────────────
            _requiredLabel('Gender', _genderKey),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              key: _genderKey,
              initialValue: _gender,
              dropdownColor: const Color(0xFF1E1E30),
              style: const TextStyle(color: Colors.white, fontSize: 14),
              hint: const Text('Select gender',
                  style: TextStyle(color: Colors.white54)),
              decoration: _inputDecoration(
                hint: '',
                icon: Icons.wc_outlined,
                isError: _showValidationError && _gender == null,
              ),
              items: _kGenders
                  .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                  .toList(),
              onChanged: (v) => setState(() => _gender = v),
            ),
            const SizedBox(height: 20),

            // ── 3. Body Location / Affected Area * ─────────────────────
            _requiredLabel('Affected Area', _locationKey),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              key: _locationKey,
              initialValue: _bodyLocation,
              dropdownColor: const Color(0xFF1E1E30),
              style: const TextStyle(color: Colors.white, fontSize: 14),
              hint: const Text('Where is the concern?',
                  style: TextStyle(color: Colors.white54)),
              decoration: _inputDecoration(
                hint: '',
                icon: Icons.location_on_outlined,
                isError: _showValidationError && _bodyLocation == null,
              ),
              items: _kBodyLocations
                  .map((l) => DropdownMenuItem(value: l, child: Text(l)))
                  .toList(),
              onChanged: (v) => setState(() => _bodyLocation = v),
            ),
            const SizedBox(height: 20),

            // ── 4. Duration * ──────────────────────────────────────────
            _requiredLabel('How long have you had this?', _durationKey),
            const SizedBox(height: 10),
            Container(
              key: _durationKey,
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _kDurationOptions.map((opt) {
                  final days = opt['days'] as int;
                  final selected = _durationDays == days;
                  return GestureDetector(
                    onTap: () => setState(() => _durationDays = days),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        gradient: selected
                            ? const LinearGradient(
                                colors: [Color(0xFF6A1B9A), Color(0xFF283593)])
                            : null,
                        color: selected
                            ? null
                            : Colors.white.withValues(alpha: 0.07),
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(
                          color: _showValidationError && _durationDays == null
                              ? const Color(0xFFEF5350).withValues(alpha: 0.6)
                              : selected
                                  ? const Color(0xFF6A1B9A)
                                  : Colors.white.withValues(alpha: 0.15),
                          width: selected ? 1.5 : 1,
                        ),
                      ),
                      child: Text(
                        opt['label'] as String,
                        style: TextStyle(
                          color: selected ? Colors.white : Colors.white60,
                          fontSize: 12.5,
                          fontWeight: selected
                              ? FontWeight.w600
                              : FontWeight.normal,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 20),

            // ── 5. Skin Concerns * (at least one) ─────────────────────
            _requiredLabel('Skin Concerns', _concernKey,
                subtitle: '(select at least one)'),
            const SizedBox(height: 10),
            Container(
              key: _concernKey,
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _kConcernOptions.map((concern) {
                  final selected = _skinConcerns.contains(concern);
                  return GestureDetector(
                    onTap: () => setState(() {
                      if (selected) {
                        _skinConcerns.remove(concern);
                      } else {
                        _skinConcerns.add(concern);
                      }
                    }),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        gradient: selected
                            ? const LinearGradient(
                                colors: [Color(0xFF1B5E20), Color(0xFF2E7D32)])
                            : null,
                        color: selected
                            ? null
                            : Colors.white.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(
                          color: _showValidationError &&
                                  _skinConcerns.isEmpty
                              ? const Color(0xFFEF5350).withValues(alpha: 0.6)
                              : selected
                                  ? const Color(0xFF2E7D32)
                                  : Colors.white.withValues(alpha: 0.12),
                          width: selected ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (selected) ...[
                            const Icon(Icons.check_circle_rounded,
                                color: Colors.white, size: 14),
                            const SizedBox(width: 5),
                          ],
                          Text(
                            concern,
                            style: TextStyle(
                              color: selected ? Colors.white : Colors.white60,
                              fontSize: 12.5,
                              fontWeight: selected
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 28),

            // ── 6. Confirm / change skin type * ───────────────────────
            const Text(
              'Confirm your skin type:',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 2),
            const Text(
              '* AI has pre-selected this — you may adjust if needed',
              style: TextStyle(color: Colors.white38, fontSize: 12),
            ),
            const SizedBox(height: 12),
            ...(_kSkinTypeInfo.entries.map((entry) => _SkinTypeOption(
                  type: entry.key,
                  icon: entry.value['icon'] as String,
                  desc: entry.value['desc'] as String,
                  color: entry.value['color'] as Color,
                  gradient: entry.value['gradient'] as List<Color>,
                  isSelected: _selectedSkinType == entry.key,
                  onTap: () =>
                      setState(() => _selectedSkinType = entry.key),
                ))),
            const SizedBox(height: 28),

            // ── Optional extras ────────────────────────────────────────
            _optionalSectionHeader(
                'Additional Symptoms', Icons.healing_outlined),
            const SizedBox(height: 12),
            _symptomRow('Pain / Tenderness', Icons.sentiment_very_dissatisfied_outlined,
                _pain, (v) => setState(() => _pain = v)),
            const SizedBox(height: 10),
            _symptomRow('Bleeding', Icons.water_drop_outlined, _bleeding,
                (v) => setState(() => _bleeding = v)),
            const SizedBox(height: 10),
            _symptomRow('Growing / Changing', Icons.trending_up_rounded,
                _growing, (v) => setState(() => _growing = v)),
            const SizedBox(height: 10),
            _symptomRow(
                'Family history of skin cancer',
                Icons.history_edu_outlined,
                _familyHistory,
                (v) => setState(() => _familyHistory = v)),
            const SizedBox(height: 32),

            // ── Analyze Skin button ────────────────────────────────────
            SizedBox(
              width: double.infinity,
              child: AnimatedOpacity(
                opacity: _isFormComplete ? 1.0 : 0.45,
                duration: const Duration(milliseconds: 300),
                child: GestureDetector(
                  onTap: _tryProceed,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1B5E20), Color(0xFF43A047)],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: _isFormComplete
                          ? [
                              BoxShadow(
                                color: const Color(0xFF2E7D32)
                                    .withValues(alpha: 0.45),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              ),
                            ]
                          : [],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _isFormComplete
                              ? Icons.spa_rounded
                              : Icons.lock_outline_rounded,
                          color: Colors.white,
                          size: 22,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          _isFormComplete
                              ? 'Analyze Skin →'
                              : 'Complete required fields to continue',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 30),
          ],

          // ── Upload buttons (before photo) ────────────────────────────
          if (!_showForm && _imageBytes == null) ...[
            _buildPickButton(
              icon: Icons.camera_alt_rounded,
              label: 'Take a Selfie',
              subtitle: 'Use your front camera',
              gradient: const [Color(0xFF1B5E20), Color(0xFF43A047)],
              onTap: () => _pickImage(ImageSource.camera),
            ),
            const SizedBox(height: 14),
            _buildPickButton(
              icon: Icons.photo_library_rounded,
              label: 'Upload from Gallery',
              subtitle: 'Choose an existing photo',
              gradient: const [Color(0xFF1565C0), Color(0xFF1976D2)],
              onTap: () => _pickImage(ImageSource.gallery),
            ),
            const SizedBox(height: 28),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.04),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('📸  Tips for best skin type detection',
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14)),
                  SizedBox(height: 10),
                  _Tip('Use a clear, well-lit selfie in natural light'),
                  _Tip('Remove makeup before taking the photo'),
                  _Tip('Avoid filters or heavily edited photos'),
                  _Tip('Face the camera directly, not at an angle'),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers & sub-widgets
  // ─────────────────────────────────────────────────────────────────────────

  Widget _formSectionHeader(String title, IconData icon,
      {String? subtitle}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1A1A2E), Color(0xFF16213E)],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF6A1B9A).withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFF9C27B0), size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16)),
                if (subtitle != null) ...[
                  const SizedBox(height: 4),
                  RichText(
                    text: TextSpan(
                      text: subtitle,
                      style: const TextStyle(
                          color: Colors.white60, fontSize: 12),
                      children: const [
                        TextSpan(
                            text: ' *',
                            style: TextStyle(
                                color: Color(0xFFEF5350),
                                fontWeight: FontWeight.bold,
                                fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _requiredLabel(String label, GlobalKey key, {String? subtitle}) {
    return Container(
      key: key,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            label,
            style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w600),
          ),
          const SizedBox(width: 4),
          const Text('*',
              style: TextStyle(
                  color: Color(0xFFEF5350),
                  fontSize: 16,
                  fontWeight: FontWeight.bold)),
          if (subtitle != null) ...[
            const SizedBox(width: 6),
            Text(subtitle,
                style:
                    const TextStyle(color: Colors.white38, fontSize: 12)),
          ],
        ],
      ),
    );
  }

  Widget _optionalSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: Colors.white38, size: 18),
        const SizedBox(width: 8),
        Text(title,
            style: const TextStyle(
                color: Colors.white60,
                fontWeight: FontWeight.w600,
                fontSize: 14)),
        const SizedBox(width: 8),
        Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Text('Optional',
              style: TextStyle(color: Colors.white38, fontSize: 11)),
        ),
      ],
    );
  }

  InputDecoration _inputDecoration({
    required String hint,
    IconData? icon,
    bool isError = false,
  }) {
    return InputDecoration(
      hintText: hint.isEmpty ? null : hint,
      hintStyle: const TextStyle(color: Colors.white38),
      prefixIcon: icon != null ? Icon(icon, color: Colors.white38) : null,
      filled: true,
      fillColor: isError
          ? const Color(0xFFEF5350).withValues(alpha: 0.08)
          : Colors.white.withValues(alpha: 0.07),
      border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: isError
              ? const Color(0xFFEF5350).withValues(alpha: 0.5)
              : Colors.white.withValues(alpha: 0.1),
        ),
      ),
      focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: isError
                ? const Color(0xFFEF5350)
                : const Color(0xFF6A1B9A),
            width: 1.5,
          )),
    );
  }

  Widget _symptomRow(
    String label,
    IconData icon,
    bool? currentValue,
    ValueChanged<bool?> onChanged,
  ) =>
      Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white12),
        ),
        child: Row(
          children: [
            Icon(icon, color: Colors.white54, size: 20),
            const SizedBox(width: 12),
            Expanded(
                child: Text(label,
                    style: const TextStyle(
                        color: Colors.white, fontSize: 14))),
            ToggleButtons(
              isSelected: [
                currentValue == true,
                currentValue == false,
              ],
              onPressed: (i) => onChanged(i == 0 ? true : false),
              borderRadius: BorderRadius.circular(8),
              selectedColor: Colors.white,
              fillColor: const Color(0xFF6A1B9A),
              color: Colors.white60,
              borderColor: Colors.white24,
              selectedBorderColor: const Color(0xFF6A1B9A),
              constraints:
                  const BoxConstraints(minWidth: 44, minHeight: 34),
              children: const [
                Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: Text('Yes',
                        style: TextStyle(fontSize: 12))),
                Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: Text('No',
                        style: TextStyle(fontSize: 12))),
              ],
            ),
          ],
        ),
      );

  Widget _buildPickButton({
    required IconData icon,
    required String label,
    required String subtitle,
    required List<Color> gradient,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: LinearGradient(
              colors: gradient,
              begin: Alignment.centerLeft,
              end: Alignment.centerRight),
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
                color: gradient.first.withValues(alpha: 0.4),
                blurRadius: 12,
                offset: const Offset(0, 6)),
          ],
        ),
        child: Row(
          children: [
            Icon(icon, color: Colors.white, size: 30),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold)),
                Text(subtitle,
                    style: const TextStyle(
                        color: Colors.white70, fontSize: 13)),
              ],
            ),
            const Spacer(),
            const Icon(Icons.arrow_forward_ios,
                color: Colors.white54, size: 16),
          ],
        ),
      ),
    );
  }
}

// ─── Skin Type Option ─────────────────────────────────────────────────────────

class _SkinTypeOption extends StatelessWidget {
  final String type;
  final String icon;
  final String desc;
  final Color color;
  final List<Color> gradient;
  final bool isSelected;
  final VoidCallback onTap;

  const _SkinTypeOption({
    required this.type,
    required this.icon,
    required this.desc,
    required this.color,
    required this.gradient,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: double.infinity,
        margin: const EdgeInsets.only(bottom: 10),
        padding:
            const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        decoration: BoxDecoration(
          gradient: isSelected
              ? LinearGradient(
                  colors: gradient,
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight)
              : null,
          color:
              isSelected ? null : Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? color.withValues(alpha: 0.6)
                : Colors.white.withValues(alpha: 0.1),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Text(icon, style: const TextStyle(fontSize: 26)),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('$type Skin',
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: isSelected
                              ? FontWeight.bold
                              : FontWeight.w500,
                          fontSize: 15)),
                  const SizedBox(height: 3),
                  Text(desc,
                      style: const TextStyle(
                          color: Colors.white60, fontSize: 12)),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle,
                  color: Colors.white, size: 22),
          ],
        ),
      ),
    );
  }
}

// ─── Small helper widgets ─────────────────────────────────────────────────────

class _Tip extends StatelessWidget {
  final String text;
  const _Tip(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 5,
            height: 5,
            margin: const EdgeInsets.only(top: 7, right: 10),
            decoration: const BoxDecoration(
                color: Color(0xFF66BB6A), shape: BoxShape.circle),
          ),
          Expanded(
              child: Text(text,
                  style: const TextStyle(
                      color: Colors.white70, fontSize: 13))),
        ],
      ),
    );
  }
}

class _DialogTip extends StatelessWidget {
  final IconData icon;
  final String text;
  const _DialogTip({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: const Color(0xFFEF5350).withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: const Color(0xFFEF5350), size: 15),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(text,
              style: const TextStyle(
                  color: Colors.white60,
                  fontSize: 12.5,
                  height: 1.4)),
        ),
      ],
    );
  }
}
