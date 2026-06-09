// lib/models/health_score_model.dart

class HealthScoreModel {
  final double hydrationScore;
  final double textureScore;
  final double pigmentationScore;
  final double acneScore;
  final double sunDamageScore;
  final DateTime timestamp;

  const HealthScoreModel({
    required this.hydrationScore,
    required this.textureScore,
    required this.pigmentationScore,
    required this.acneScore,
    required this.sunDamageScore,
    required this.timestamp,
  });

  double get overallScore {
    return ((hydrationScore + textureScore + pigmentationScore + acneScore + sunDamageScore) / 5)
        .clamp(0, 100);
  }

  String get overallGrade {
    final s = overallScore;
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 55) return 'Fair';
    if (s >= 40) return 'Poor';
    return 'Critical';
  }

  factory HealthScoreModel.fromMap(Map<String, dynamic> map) {
    return HealthScoreModel(
      hydrationScore: (map['hydrationScore'] as num?)?.toDouble() ?? 70,
      textureScore: (map['textureScore'] as num?)?.toDouble() ?? 70,
      pigmentationScore: (map['pigmentationScore'] as num?)?.toDouble() ?? 70,
      acneScore: (map['acneScore'] as num?)?.toDouble() ?? 70,
      sunDamageScore: (map['sunDamageScore'] as num?)?.toDouble() ?? 70,
      timestamp: map['timestamp'] != null
          ? DateTime.tryParse(map['timestamp'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() => {
        'hydrationScore': hydrationScore,
        'textureScore': textureScore,
        'pigmentationScore': pigmentationScore,
        'acneScore': acneScore,
        'sunDamageScore': sunDamageScore,
        'overallScore': overallScore,
        'timestamp': timestamp.toIso8601String(),
      };

  /// Generate scores from a disease prediction map
  factory HealthScoreModel.fromPrediction(Map<String, dynamic> prediction) {
    final disease = (prediction['disease'] as String? ?? '').toLowerCase();
    final confidence = (prediction['confidence'] as num?)?.toDouble() ?? 0.5;
    final isHealthy = disease.contains('clear') || disease.contains('healthy');

    double base = isHealthy ? 80 + (confidence * 15) : 100 - (confidence * 50);
    base = base.clamp(20.0, 95.0);

    double acne = disease.contains('acne') ? base - 20 : base + 5;
    double pigment = disease.contains('hyperpig') || disease.contains('vitiligo')
        ? base - 25
        : base + 3;
    double texture =
        disease.contains('psoriasis') || disease.contains('eczema') ? base - 20 : base + 2;
    double hydration = disease.contains('dermat') ? base - 15 : base + 5;
    double sunDamage = disease.contains('melanoma') || disease.contains('sun') ? base - 30 : base;

    return HealthScoreModel(
      hydrationScore: hydration.clamp(10.0, 100.0),
      textureScore: texture.clamp(10.0, 100.0),
      pigmentationScore: pigment.clamp(10.0, 100.0),
      acneScore: acne.clamp(10.0, 100.0),
      sunDamageScore: sunDamage.clamp(10.0, 100.0),
      timestamp: DateTime.now(),
    );
  }
}
