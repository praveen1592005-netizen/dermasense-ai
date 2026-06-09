// lib/models/symptom_model.dart

class SymptomModel {
  final bool itching;
  final bool pain;
  final bool burning;
  final bool swelling;
  final bool fever;
  final String duration; // e.g. "1-3 days", "1 week", "More than 2 weeks"

  const SymptomModel({
    required this.itching,
    required this.pain,
    required this.burning,
    required this.swelling,
    required this.fever,
    required this.duration,
  });

  factory SymptomModel.empty() {
    return const SymptomModel(
      itching: false,
      pain: false,
      burning: false,
      swelling: false,
      fever: false,
      duration: '1-3 days',
    );
  }

  factory SymptomModel.fromMap(Map<String, dynamic> map) {
    return SymptomModel(
      itching: map['itching'] as bool? ?? false,
      pain: map['pain'] as bool? ?? false,
      burning: map['burning'] as bool? ?? false,
      swelling: map['swelling'] as bool? ?? false,
      fever: map['fever'] as bool? ?? false,
      duration: map['duration'] as String? ?? '1-3 days',
    );
  }

  Map<String, dynamic> toMap() => {
        'itching': itching,
        'pain': pain,
        'burning': burning,
        'swelling': swelling,
        'fever': fever,
        'duration': duration,
      };
}
