// lib/screens/symptom_checker_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/symptom_model.dart';

final symptomStateProvider = StateProvider<SymptomModel>((ref) => SymptomModel.empty());

class SymptomCheckerScreen extends ConsumerWidget {
  const SymptomCheckerScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final symptoms = ref.watch(symptomStateProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      appBar: AppBar(
        title: const Text('AI Symptom Analyser', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
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
              'Specify Your Symptoms',
              style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
            ).animate().fade().slideY(begin: 0.1, end: 0),
            const SizedBox(height: 6),
            const Text(
              'Select any symptoms you are currently experiencing to combine with skin analysis predictions.',
              style: TextStyle(color: Colors.white60, fontSize: 13),
            ),
            const SizedBox(height: 20),

            _checkboxTile(
              ref: ref,
              title: 'Pruritus / Itching',
              value: symptoms.itching,
              onChanged: (val) {
                ref.read(symptomStateProvider.notifier).state = SymptomModel(
                  itching: val,
                  pain: symptoms.pain,
                  burning: symptoms.burning,
                  swelling: symptoms.swelling,
                  fever: symptoms.fever,
                  duration: symptoms.duration,
                );
              },
            ),
            _checkboxTile(
              ref: ref,
              title: 'Pain / Tenderness',
              value: symptoms.pain,
              onChanged: (val) {
                ref.read(symptomStateProvider.notifier).state = SymptomModel(
                  itching: symptoms.itching,
                  pain: val,
                  burning: symptoms.burning,
                  swelling: symptoms.swelling,
                  fever: symptoms.fever,
                  duration: symptoms.duration,
                );
              },
            ),
            _checkboxTile(
              ref: ref,
              title: 'Burning Sensation',
              value: symptoms.burning,
              onChanged: (val) {
                ref.read(symptomStateProvider.notifier).state = SymptomModel(
                  itching: symptoms.itching,
                  pain: symptoms.pain,
                  burning: val,
                  swelling: symptoms.swelling,
                  fever: symptoms.fever,
                  duration: symptoms.duration,
                );
              },
            ),
            _checkboxTile(
              ref: ref,
              title: 'Edema / Swelling',
              value: symptoms.swelling,
              onChanged: (val) {
                ref.read(symptomStateProvider.notifier).state = SymptomModel(
                  itching: symptoms.itching,
                  pain: symptoms.pain,
                  burning: symptoms.burning,
                  swelling: val,
                  fever: symptoms.fever,
                  duration: symptoms.duration,
                );
              },
            ),
            _checkboxTile(
              ref: ref,
              title: 'Systemic Fever',
              value: symptoms.fever,
              onChanged: (val) {
                ref.read(symptomStateProvider.notifier).state = SymptomModel(
                  itching: symptoms.itching,
                  pain: symptoms.pain,
                  burning: symptoms.burning,
                  swelling: symptoms.swelling,
                  fever: val,
                  duration: symptoms.duration,
                );
              },
            ),

            const SizedBox(height: 16),
            const Text(
              'Symptom Duration',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white10),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: symptoms.duration,
                  dropdownColor: const Color(0xFF2A2A3B),
                  style: const TextStyle(color: Colors.white),
                  items: ['1-3 days', '4-7 days', '1-2 weeks', 'More than 2 weeks'].map((d) {
                    return DropdownMenuItem<String>(
                      value: d,
                      child: Text(d),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      ref.read(symptomStateProvider.notifier).state = SymptomModel(
                        itching: symptoms.itching,
                        pain: symptoms.pain,
                        burning: symptoms.burning,
                        swelling: symptoms.swelling,
                        fever: symptoms.fever,
                        duration: val,
                      );
                    }
                  },
                ),
              ),
            ),

            const SizedBox(height: 40),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Symptom profile updated! Proceed to Scan skin.')),
                  );
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6A1B9A),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Save and Return', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _checkboxTile({
    required WidgetRef ref,
    required String title,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Card(
      color: value ? const Color(0xFF2E243A) : const Color(0xFF2A2A3B),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: value ? const Color(0xFF8E24AA) : Colors.transparent),
      ),
      margin: const EdgeInsets.only(bottom: 12),
      child: CheckboxListTile(
        title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        value: value,
        activeColor: const Color(0xFF8E24AA),
        checkColor: Colors.white,
        onChanged: (val) => onChanged(val ?? false),
      ),
    );
  }
}
