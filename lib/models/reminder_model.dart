// lib/models/reminder_model.dart

class ReminderModel {
  final String id;
  final String title;
  final String type; // e.g. "Medication", "Water", "Sunscreen", "Scan"
  final DateTime time;
  final bool isEnabled;
  final List<int> repeatDays; // 1 = Monday, 7 = Sunday

  const ReminderModel({
    required this.id,
    required this.title,
    required this.type,
    required this.time,
    this.isEnabled = true,
    this.repeatDays = const [],
  });

  factory ReminderModel.fromMap(Map<String, dynamic> map, String docId) {
    return ReminderModel(
      id: docId,
      title: map['title'] as String? ?? '',
      type: map['type'] as String? ?? 'Medication',
      time: map['time'] != null
          ? DateTime.tryParse(map['time'].toString()) ?? DateTime.now()
          : DateTime.now(),
      isEnabled: map['isEnabled'] as bool? ?? true,
      repeatDays: (map['repeatDays'] as List?)?.cast<int>() ?? [],
    );
  }

  Map<String, dynamic> toMap() => {
        'title': title,
        'type': type,
        'time': time.toIso8601String(),
        'isEnabled': isEnabled,
        'repeatDays': repeatDays,
      };
}
