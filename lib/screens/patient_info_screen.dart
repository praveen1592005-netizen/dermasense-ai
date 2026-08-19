// lib/screens/patient_info_screen.dart
// DermaSense AI — Patient Information Collector
// Collects clinical metadata before the scan for hybrid AI accuracy.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Model to hold patient metadata for hybrid AI analysis.
class PatientInfo {
  final int? age;
  final String? gender;
  final String? bodyLocation;
  final int? durationDays;
  final bool? itching;
  final bool? pain;
  final bool? bleeding;
  final bool? growing;
  final bool? familyHistory;

  const PatientInfo({
    this.age,
    this.gender,
    this.bodyLocation,
    this.durationDays,
    this.itching,
    this.pain,
    this.bleeding,
    this.growing,
    this.familyHistory,
  });

  Map<String, dynamic> toJson() => {
        'age': age,
        'gender': gender,
        'body_location': bodyLocation,
        'duration_days': durationDays,
        'itching': itching,
        'pain': pain,
        'bleeding': bleeding,
        'growing': growing,
        'family_history': familyHistory,
      };
}

class PatientInfoScreen extends StatefulWidget {
  const PatientInfoScreen({super.key});

  @override
  State<PatientInfoScreen> createState() => _PatientInfoScreenState();
}

class _PatientInfoScreenState extends State<PatientInfoScreen>
    with TickerProviderStateMixin {
  final _ageController = TextEditingController();
  String? _gender;
  String? _bodyLocation;
  int? _durationDays;
  bool? _itching;
  bool? _pain;
  bool? _bleeding;
  bool? _growing;
  bool? _familyHistory;

  late AnimationController _fadeCtrl;
  late Animation<double> _fadeAnim;

  final _bodyLocations = [
    'Face', 'Scalp', 'Neck', 'Chest', 'Back', 'Abdomen',
    'Upper Arm', 'Forearm', 'Hand', 'Thigh', 'Leg', 'Foot', 'Other',
  ];

  final _durationOptions = [
    {'label': 'Less than 1 week', 'days': 5},
    {'label': '1–4 weeks', 'days': 14},
    {'label': '1–3 months', 'days': 60},
    {'label': '3–12 months', 'days': 180},
    {'label': 'Over 1 year', 'days': 400},
  ];

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);
    _fadeCtrl.forward();
  }

  @override
  void dispose() {
    _ageController.dispose();
    _fadeCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    final info = PatientInfo(
      age: int.tryParse(_ageController.text.trim()),
      gender: _gender,
      bodyLocation: _bodyLocation,
      durationDays: _durationDays,
      itching: _itching,
      pain: _pain,
      bleeding: _bleeding,
      growing: _growing,
      familyHistory: _familyHistory,
    );
    Navigator.pop(context, info);
  }

  void _skip() => Navigator.pop(context, null);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A2E),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: _skip,
        ),
        title: const Text('Patient Information',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          TextButton(
            onPressed: _skip,
            child: const Text('Skip', style: TextStyle(color: Colors.white60)),
          ),
        ],
      ),
      body: FadeTransition(
        opacity: _fadeAnim,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Banner
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF6A1B9A), Color(0xFF283593)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.biotech_rounded, color: Colors.white, size: 36),
                    SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Improve AI Accuracy',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16)),
                          SizedBox(height: 4),
                          Text(
                              'Optional info helps the AI deliver a more personalized diagnosis.',
                              style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // ── Age & Gender ─────────────────────────────────────────────
              _sectionHeader('Basic Information', Icons.person_outline_rounded),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _inputField(
                      label: 'Age',
                      controller: _ageController,
                      keyboardType: TextInputType.number,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      icon: Icons.cake_outlined,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: _dropdownField<String>(
                      label: 'Gender',
                      value: _gender,
                      icon: Icons.wc_outlined,
                      items: ['Male', 'Female', 'Other', 'Prefer not to say'],
                      onChanged: (v) => setState(() => _gender = v),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // ── Body Location ─────────────────────────────────────────────
              _sectionHeader('Affected Area', Icons.location_on_outlined),
              const SizedBox(height: 12),
              _dropdownField<String>(
                label: 'Body Location',
                value: _bodyLocation,
                icon: Icons.medical_information_outlined,
                items: _bodyLocations,
                onChanged: (v) => setState(() => _bodyLocation = v),
              ),
              const SizedBox(height: 24),

              // ── Duration ──────────────────────────────────────────────────
              _sectionHeader('How Long?', Icons.schedule_outlined),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _durationOptions.map((opt) {
                  final days = opt['days'] as int;
                  final selected = _durationDays == days;
                  return ChoiceChip(
                    label: Text(opt['label'] as String),
                    selected: selected,
                    onSelected: (_) => setState(() => _durationDays = days),
                    selectedColor: const Color(0xFF6A1B9A),
                    backgroundColor: Colors.white.withOpacity(0.07),
                    labelStyle: TextStyle(
                      color: selected ? Colors.white : Colors.white60,
                      fontSize: 12,
                    ),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20)),
                    side: BorderSide(
                        color: selected
                            ? const Color(0xFF6A1B9A)
                            : Colors.white12),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              // ── Symptoms ──────────────────────────────────────────────────
              _sectionHeader('Symptoms', Icons.healing_outlined),
              const SizedBox(height: 12),
              _symptomRow('Itching / Burning', Icons.whatshot_outlined,
                  _itching, (v) => setState(() => _itching = v)),
              const SizedBox(height: 10),
              _symptomRow('Pain / Tenderness', Icons.sentiment_very_dissatisfied_outlined,
                  _pain, (v) => setState(() => _pain = v)),
              const SizedBox(height: 10),
              _symptomRow('Bleeding', Icons.water_drop_outlined,
                  _bleeding, (v) => setState(() => _bleeding = v)),
              const SizedBox(height: 10),
              _symptomRow('Growing / Changing', Icons.trending_up_rounded,
                  _growing, (v) => setState(() => _growing = v)),
              const SizedBox(height: 24),

              // ── Family History ─────────────────────────────────────────────
              _sectionHeader('Medical History', Icons.family_restroom_rounded),
              const SizedBox(height: 12),
              _symptomRow(
                  'Family history of skin cancer',
                  Icons.history_edu_outlined,
                  _familyHistory,
                  (v) => setState(() => _familyHistory = v)),
              const SizedBox(height: 32),

              // ── Submit / Skip Buttons ─────────────────────────────────────
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6A1B9A),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                    elevation: 4,
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.biotech_rounded, size: 22),
                      SizedBox(width: 10),
                      Text('Start AI Analysis',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton(
                  onPressed: _skip,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white60,
                    side: const BorderSide(color: Colors.white24),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Skip — Analyze Without Patient Info'),
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  // ── Widgets ──────────────────────────────────────────────────────────────

  Widget _sectionHeader(String title, IconData icon) => Row(
        children: [
          Icon(icon, color: const Color(0xFF9C27B0), size: 20),
          const SizedBox(width: 8),
          Text(title,
              style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 15)),
        ],
      );

  Widget _inputField({
    required String label,
    required TextEditingController controller,
    TextInputType? keyboardType,
    List<TextInputFormatter>? inputFormatters,
    IconData? icon,
  }) =>
      TextField(
        controller: controller,
        keyboardType: keyboardType,
        inputFormatters: inputFormatters,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.white60),
          prefixIcon: icon != null ? Icon(icon, color: Colors.white38) : null,
          filled: true,
          fillColor: Colors.white.withOpacity(0.07),
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none),
          focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF6A1B9A))),
        ),
      );

  Widget _dropdownField<T>({
    required String label,
    required T? value,
    required List<T> items,
    required ValueChanged<T?> onChanged,
    IconData? icon,
  }) =>
      DropdownButtonFormField<T>(
        value: value,
        dropdownColor: const Color(0xFF1E1E30),
        style: const TextStyle(color: Colors.white, fontSize: 14),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.white60),
          prefixIcon: icon != null ? Icon(icon, color: Colors.white38) : null,
          filled: true,
          fillColor: Colors.white.withOpacity(0.07),
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none),
          focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF6A1B9A))),
        ),
        items: items
            .map((e) => DropdownMenuItem<T>(value: e, child: Text(e.toString())))
            .toList(),
        onChanged: onChanged,
      );

  Widget _symptomRow(
    String label,
    IconData icon,
    bool? currentValue,
    ValueChanged<bool?> onChanged,
  ) =>
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white12),
        ),
        child: Row(
          children: [
            Icon(icon, color: Colors.white54, size: 20),
            const SizedBox(width: 12),
            Expanded(
                child: Text(label,
                    style: const TextStyle(color: Colors.white, fontSize: 14))),
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
              constraints: const BoxConstraints(minWidth: 44, minHeight: 34),
              children: const [
                Padding(padding: EdgeInsets.symmetric(horizontal: 8), child: Text('Yes', style: TextStyle(fontSize: 12))),
                Padding(padding: EdgeInsets.symmetric(horizontal: 8), child: Text('No', style: TextStyle(fontSize: 12))),
              ],
            ),
          ],
        ),
      );
}
