// lib/screens/medication_screen.dart

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/medication_model.dart';

final medicationsStreamProvider = StreamProvider<List<MedicationModel>>((ref) {
  final uid = FirebaseAuth.instance.currentUser?.uid;
  if (uid == null) return const Stream.empty();
  return FirebaseFirestore.instance
      .collection('users')
      .doc(uid)
      .collection('medications')
      .snapshots()
      .map((snap) => snap.docs.map((doc) => MedicationModel.fromMap(doc.data(), doc.id)).toList());
});

class MedicationScreen extends ConsumerWidget {
  const MedicationScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final medicationsAsync = ref.watch(medicationsStreamProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      appBar: AppBar(
        title: const Text('Medication Tracker', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddMedicationDialog(context),
        backgroundColor: const Color(0xFF6A1B9A),
        child: const Icon(Icons.add_rounded, color: Colors.white),
      ),
      body: medicationsAsync.when(
        data: (meds) {
          if (meds.isEmpty) {
            return const Center(
              child: Text(
                'No medication scheduled.\nAdd your daily medication or creams here!',
                style: TextStyle(color: Colors.white70),
                textAlign: TextAlign.center,
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: meds.length,
            itemBuilder: (context, idx) {
              final med = meds[idx];
              return Card(
                color: const Color(0xFF2A2A3B),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: med.isCompleted ? Colors.green.withOpacity(0.2) : Colors.purple.withOpacity(0.2),
                    child: Icon(
                      med.isCompleted ? Icons.check_circle_rounded : Icons.medical_services_outlined,
                      color: med.isCompleted ? Colors.green : const Color(0xFF8E24AA),
                    ),
                  ),
                  title: Text(
                    med.name,
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      decoration: med.isCompleted ? TextDecoration.lineThrough : null,
                    ),
                  ),
                  subtitle: Text(
                    '${med.dosage} (${med.timeOfDay})\n${med.instructions}',
                    style: const TextStyle(color: Colors.white60, fontSize: 12),
                  ),
                  trailing: IconButton(
                    icon: Icon(
                      med.isCompleted ? Icons.undo_rounded : Icons.check_rounded,
                      color: med.isCompleted ? Colors.grey : Colors.green,
                    ),
                    onPressed: () => _toggleMedicationCompletion(med),
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e', style: const TextStyle(color: Colors.red))),
      ),
    );
  }

  Future<void> _toggleMedicationCompletion(MedicationModel med) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;
    await FirebaseFirestore.instance
        .collection('users')
        .doc(uid)
        .collection('medications')
        .doc(med.id)
        .update({'isCompleted': !med.isCompleted});
  }

  void _showAddMedicationDialog(BuildContext context) {
    final nameController = TextEditingController();
    final dosageController = TextEditingController();
    final timeController = TextEditingController();
    final instructionsController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF2A2A3B),
          title: const Text('Add Medication', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _textField(nameController, 'Medication Name (e.g. Ketoconazole)'),
                const SizedBox(height: 12),
                _textField(dosageController, 'Dosage (e.g. Twice daily)'),
                const SizedBox(height: 12),
                _textField(timeController, 'Time (e.g. Morning & Night)'),
                const SizedBox(height: 12),
                _textField(instructionsController, 'Instructions (e.g. Apply after washing face)'),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () async {
                final uid = FirebaseAuth.instance.currentUser?.uid;
                if (uid != null && nameController.text.isNotEmpty) {
                  final newMed = MedicationModel(
                    id: '',
                    name: nameController.text,
                    dosage: dosageController.text,
                    timeOfDay: timeController.text,
                    instructions: instructionsController.text,
                    sideEffects: const ['Mild redness', 'Dry skin'],
                    precautions: const ['Avoid contact with eyes'],
                  );

                  await FirebaseFirestore.instance
                      .collection('users')
                      .doc(uid)
                      .collection('medications')
                      .add(newMed.toMap());

                  if (context.mounted) {
                    Navigator.pop(context);
                  }
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6A1B9A)),
              child: const Text('Add', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  Widget _textField(TextEditingController controller, String hint) {
    return TextField(
      controller: controller,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white30, fontSize: 13),
        filled: true,
        fillColor: Colors.white.withOpacity(0.05),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      ),
    );
  }
}
