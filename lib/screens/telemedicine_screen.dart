// lib/screens/telemedicine_screen.dart

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/appointment_model.dart';

final appointmentsStreamProvider = StreamProvider<List<AppointmentModel>>((ref) {
  final uid = FirebaseAuth.instance.currentUser?.uid;
  if (uid == null) return const Stream.empty();
  return FirebaseFirestore.instance
      .collection('users')
      .doc(uid)
      .collection('appointments')
      .snapshots()
      .map((snap) => snap.docs.map((doc) => AppointmentModel.fromMap(doc.data(), doc.id)).toList());
});

class TelemedicineScreen extends ConsumerWidget {
  const TelemedicineScreen({Key? key}) : super(key: key);

  static const List<Map<String, String>> _doctors = [
    {'name': 'Dr. Priya Sharma', 'specialty': 'Pediatric Dermatologist', 'exp': '12 yrs exp', 'charge': '₹800'},
    {'name': 'Dr. Rajesh Kumar', 'specialty': 'Trichologist & Clinical Derm', 'exp': '15 yrs exp', 'charge': '₹1000'},
    {'name': 'Dr. Ananya Iyer', 'specialty': 'Aesthetic Dermatologist', 'exp': '8 yrs exp', 'charge': '₹1200'},
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appointmentsAsync = ref.watch(appointmentsStreamProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      appBar: AppBar(
        title: const Text('Telemedicine Portal', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Book an Appointment',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ).animate().fade(),
            const SizedBox(height: 12),
            SizedBox(
              height: 180,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _doctors.length,
                itemBuilder: (context, idx) {
                  final doc = _doctors[idx];
                  return Card(
                    color: const Color(0xFF2A2A3B),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    margin: const EdgeInsets.only(right: 12),
                    child: Container(
                      width: 200,
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(doc['name']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                          Text(doc['specialty']!, style: const TextStyle(color: Colors.white60, fontSize: 11)),
                          const Spacer(),
                          Text('${doc['exp']} | ${doc['charge']}', style: const TextStyle(color: Colors.greenAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 10),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () => _bookDoc(context, doc),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF6A1B9A),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: EdgeInsets.zero,
                              ),
                              child: const Text('Book Video Call', style: TextStyle(fontSize: 11, color: Colors.white)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Your Consultations',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            appointmentsAsync.when(
              data: (appointments) {
                if (appointments.isEmpty) {
                  return Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.02), borderRadius: BorderRadius.circular(16)),
                    child: const Text(
                      'No consultations scheduled yet.',
                      style: TextStyle(color: Colors.white60),
                      textAlign: TextAlign.center,
                    ),
                  );
                }
                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: appointments.length,
                  itemBuilder: (context, idx) {
                    final app = appointments[idx];
                    final dateStr = '${app.dateTime.year}-${app.dateTime.month.toString().padLeft(2, '0')}-${app.dateTime.day.toString().padLeft(2, '0')}';
                    return Card(
                      color: const Color(0xFF2A2A3B),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.purple.withOpacity(0.2),
                          child: const Icon(Icons.video_camera_front_rounded, color: Color(0xFFCE93D8)),
                        ),
                        title: Text(app.doctorName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        subtitle: Text('${app.specialty} | $dateStr', style: const TextStyle(color: Colors.white60, fontSize: 12)),
                        trailing: app.status == 'Upcoming'
                            ? TextButton.icon(
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Starting video consultation call... (Mock WebRTC/Twilio link)')),
                                  );
                                },
                                icon: const Icon(Icons.call, size: 16, color: Colors.greenAccent),
                                label: const Text('Join', style: TextStyle(color: Colors.greenAccent)),
                              )
                            : Text(app.status, style: const TextStyle(color: Colors.grey)),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, s) => Center(child: Text('Error: $e')),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _bookDoc(BuildContext context, Map<String, String> doc) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;

    final app = AppointmentModel(
      id: '',
      doctorName: doc['name']!,
      specialty: doc['specialty']!,
      dateTime: DateTime.now().add(const Duration(days: 1)),
      type: 'Video',
      status: 'Upcoming',
      consultationUrl: 'https://meet.jit.si/dermasense-consultation-room',
    );

    await FirebaseFirestore.instance.collection('users').doc(uid).collection('appointments').add(app.toMap());

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Successfully booked consultation with ${doc['name']}!')),
      );
    }
  }
}
