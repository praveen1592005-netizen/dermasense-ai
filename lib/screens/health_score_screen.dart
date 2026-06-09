// lib/screens/health_score_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/health_score_model.dart';
import '../services/health_score_service.dart';

class HealthScoreScreen extends ConsumerWidget {
  const HealthScoreScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final healthScoreAsync = ref.watch(healthScoresStreamProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      appBar: AppBar(
        title: const Text('Skin Health Analytics', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: healthScoreAsync.when(
        data: (scores) {
          if (scores.isEmpty) {
            return const Center(
              child: Text(
                'No scan history found.\nPerform your first skin scan to calculate scores!',
                style: TextStyle(color: Colors.white70),
                textAlign: TextAlign.center,
              ),
            );
          }
          final latest = scores.first;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Overall score meter card
                _overallScoreCard(latest),
                const SizedBox(height: 20),

                const Text(
                  'Skin Quality Indicators',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ).animate().fade().slideY(begin: 0.2, end: 0),
                const SizedBox(height: 12),

                // Individual score rows
                _scoreItem('Skin Hydration', latest.hydrationScore, Colors.blue),
                _scoreItem('Texture & Smoothness', latest.textureScore, Colors.green),
                _scoreItem('Pigmentation Uniformity', latest.pigmentationScore, Colors.purple),
                _scoreItem('Acne Clearance', latest.acneScore, Colors.orange),
                _scoreItem('Sun Damage Resistance', latest.sunDamageScore, Colors.red),

                const SizedBox(height: 24),
                _skincareRecommendationsCard(latest),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e', style: const TextStyle(color: Colors.red))),
      ),
    );
  }

  Widget _overallScoreCard(HealthScoreModel score) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF6A1B9A), Color(0xFF283593)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6A1B9A).withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 10),
          )
        ],
      ),
      child: Column(
        children: [
          const Text('Overall Skin Health Score', style: TextStyle(color: Colors.white70, fontSize: 16)),
          const SizedBox(height: 12),
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                height: 130,
                width: 130,
                child: CircularProgressIndicator(
                  value: score.overallScore / 100,
                  strokeWidth: 10,
                  backgroundColor: Colors.white12,
                  color: Colors.greenAccent,
                ),
              ),
              Column(
                children: [
                  Text(
                    score.overallScore.toStringAsFixed(0),
                    style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold),
                  ),
                  const Text('/100', style: TextStyle(color: Colors.white60, fontSize: 12)),
                ],
              ),
            ],
          ).animate().scale(delay: 100.ms, duration: 400.ms),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              'Grade: ${score.overallGrade}',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _scoreItem(String title, double score, Color color) {
    return Card(
      color: const Color(0xFF2A2A3B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                Text('${score.toStringAsFixed(0)}%', style: TextStyle(color: color, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: score / 100,
                color: color,
                backgroundColor: Colors.white12,
                minHeight: 8,
              ),
            ),
          ],
        ),
      ),
    ).animate().fade(duration: 300.ms).slideX(begin: -0.1, end: 0);
  }

  Widget _skincareRecommendationsCard(HealthScoreModel score) {
    List<String> insights = [];
    if (score.hydrationScore < 60) insights.add('• Your skin hydration is low. Incorporate hyaluronic acid or ceramides.');
    if (score.acneScore < 60) insights.add('• Active acne detected. Apply salicylic acid or niacinamide serum.');
    if (score.sunDamageScore < 60) insights.add('• High sun damage detected. Double down on sunscreen SPF 50+ application.');
    if (insights.isEmpty) insights.add('• Your skin shows excellent vitals! Maintain your standard routine.');

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.lightbulb_outline, color: Colors.yellowAccent),
              SizedBox(width: 8),
              Text(
                'AI Analysis Recommendations',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            insights.join('\n\n'),
            style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
          ),
        ],
      ),
    );
  }
}
