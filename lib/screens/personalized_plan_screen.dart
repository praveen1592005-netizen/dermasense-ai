// lib/screens/personalized_plan_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/health_score_service.dart';

class PersonalizedPlanScreen extends ConsumerWidget {
  const PersonalizedPlanScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final healthScoreAsync = ref.watch(healthScoresStreamProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      appBar: AppBar(
        title: const Text('Personalized Skincare Plan', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: healthScoreAsync.when(
        data: (scores) {
          final hydration = scores.isNotEmpty ? scores.first.hydrationScore : 75.0;
          final acne = scores.isNotEmpty ? scores.first.acneScore : 80.0;
          final sunDamage = scores.isNotEmpty ? scores.first.sunDamageScore : 70.0;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _routineCard(
                title: '🌅 Morning Routine',
                color: Colors.amber,
                steps: [
                  '1. Wash with a Gentle Hydrating Cleanser to clear oils without stripping.',
                  hydration < 65
                      ? '2. Apply Hyaluronic Acid Serum onto damp skin to boost hydration.'
                      : '2. Apply Vitamin C Serum for antioxidant protection and brightening.',
                  '3. Use a lightweight Ceramide Moisturizer to lock in active ingredients.',
                  sunDamage < 65
                      ? '4. Apply SPF 50+ Broad-Spectrum Mineral Sunscreen (zinc oxide).'
                      : '4. Apply SPF 30+ Broad-Spectrum Sunscreen to protect from daily UV.',
                ],
              ),
              const SizedBox(height: 16),
              _routineCard(
                title: '🌌 Evening Routine',
                color: Colors.indigoAccent,
                steps: [
                  '1. Double Cleanse with Micellar Water followed by a foaming wash.',
                  acne < 65
                      ? '2. Apply 2% Salicylic Acid (BHA) or Adapalene gel spot treatment.'
                      : '2. Apply Retinol serum (0.5%) to promote skin cell renewal.',
                  '3. Moisturize deeply with a Rich Night Cream to restore skin barrier.',
                ],
              ),
              const SizedBox(height: 16),
              _routineCard(
                title: '🗓️ Weekly Routine',
                color: Colors.teal,
                steps: [
                  '• Exfoliation: Use a mild AHA/BHA chemical peel once a week.',
                  '• Rejuvenation: Apply a soothing clay mask or sheet mask for 15 minutes.',
                ],
              ),
              const SizedBox(height: 20),
              const Text(
                'AI Product Recommendations',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _productItem('CeraVe Hydrating Cleanser', 'Best for maintaining moisture barrier.', 'Hydration'),
              _productItem('The Ordinary Niacinamide 10%', 'Regulates sebum and treats pigmentation.', 'Texture & Acne'),
              _productItem('La Roche-Posay Anthelios SPF 50+', 'Maximum UV protection, non-greasy.', 'Sun Protection'),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e', style: const TextStyle(color: Colors.red))),
      ),
    );
  }

  Widget _routineCard({
    required String title,
    required Color color,
    required List<String> steps,
  }) {
    return Card(
      color: const Color(0xFF2A2A3B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(title, style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            const Divider(color: Colors.white10, height: 24),
            ...steps.map((step) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Text(step, style: const TextStyle(color: Color(0xFFCCCCCC), fontSize: 13, height: 1.4)),
                )),
          ],
        ),
      ),
    );
  }

  Widget _productItem(String name, String desc, String benefit) {
    return Card(
      color: Colors.white.withOpacity(0.05),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ListTile(
        title: Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        subtitle: Text(desc, style: const TextStyle(color: Colors.white70, fontSize: 12)),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(color: Colors.purple.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
          child: Text(benefit, style: const TextStyle(color: Color(0xFFCE93D8), fontSize: 10, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}
