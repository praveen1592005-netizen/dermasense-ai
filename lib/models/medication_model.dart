// lib/models/medication_model.dart

class MedicationModel {
  final String id;
  final String name;
  final String dosage; // e.g. "Once daily", "Twice daily"
  final String timeOfDay; // e.g. "Morning", "Night", "After food"
  final String instructions;
  final List<String> sideEffects;
  final List<String> precautions;
  final bool isCompleted;

  const MedicationModel({
    required this.id,
    required this.name,
    required this.dosage,
    required this.timeOfDay,
    required this.instructions,
    required this.sideEffects,
    required this.precautions,
    this.isCompleted = false,
  });

  factory MedicationModel.fromMap(Map<String, dynamic> map, String docId) {
    return MedicationModel(
      id: docId,
      name: map['name'] as String? ?? '',
      dosage: map['dosage'] as String? ?? '',
      timeOfDay: map['timeOfDay'] as String? ?? '',
      instructions: map['instructions'] as String? ?? '',
      sideEffects: (map['sideEffects'] as List?)?.cast<String>() ?? [],
      precautions: (map['precautions'] as List?)?.cast<String>() ?? [],
      isCompleted: map['isCompleted'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toMap() => {
        'name': name,
        'dosage': dosage,
        'timeOfDay': timeOfDay,
        'instructions': instructions,
        'sideEffects': sideEffects,
        'precautions': precautions,
        'isCompleted': isCompleted,
      };
}
