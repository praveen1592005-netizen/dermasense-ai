// lib/models/appointment_model.dart

class AppointmentModel {
  final String id;
  final String doctorName;
  final String specialty;
  final DateTime dateTime;
  final String type; // e.g. "Video", "Chat", "In-Person"
  final String status; // e.g. "Upcoming", "Completed", "Cancelled"
  final String? consultationUrl; // Twilio or Jitsi meeting link

  const AppointmentModel({
    required this.id,
    required this.doctorName,
    required this.specialty,
    required this.dateTime,
    required this.type,
    required this.status,
    this.consultationUrl,
  });

  factory AppointmentModel.fromMap(Map<String, dynamic> map, String docId) {
    return AppointmentModel(
      id: docId,
      doctorName: map['doctorName'] as String? ?? 'Dr. Specialist',
      specialty: map['specialty'] as String? ?? 'Dermatologist',
      dateTime: map['dateTime'] != null
          ? DateTime.tryParse(map['dateTime'].toString()) ?? DateTime.now()
          : DateTime.now(),
      type: map['type'] as String? ?? 'Video',
      status: map['status'] as String? ?? 'Upcoming',
      consultationUrl: map['consultationUrl'] as String?,
    );
  }

  Map<String, dynamic> toMap() => {
        'doctorName': doctorName,
        'specialty': specialty,
        'dateTime': dateTime.toIso8601String(),
        'type': type,
        'status': status,
        'consultationUrl': consultationUrl,
      };
}
