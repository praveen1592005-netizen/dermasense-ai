// lib/screens/progress_tracker_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/firestore_service.dart';
import 'package:fl_chart/fl_chart.dart';

final scansStreamProvider = StreamProvider<List<ScanRecord>>((ref) {
  return ref.watch(firestoreServiceProvider).watchScans();
});

class ProgressTrackerScreen extends ConsumerWidget {
  const ProgressTrackerScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scansAsync = ref.watch(scansStreamProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      appBar: AppBar(
        title: const Text('Disease Progress Tracker', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: scansAsync.when(
        data: (scans) {
          if (scans.isEmpty) {
            return const Center(
              child: Text(
                'No scan history found.\nStart scanning your skin to monitor progress!',
                style: TextStyle(color: Colors.white70),
                textAlign: TextAlign.center,
              ),
            );
          }

          final latest = scans.first;
          final oldest = scans.last;

          double improvement = 0.0;
          if (scans.length > 1) {
            final latestSeverityVal = _getSeverityValue(latest.severity);
            final oldestSeverityVal = _getSeverityValue(oldest.severity);
            if (oldestSeverityVal > 0) {
              improvement = ((oldestSeverityVal - latestSeverityVal) / oldestSeverityVal) * 100;
            }
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _statsCard(scans.length, improvement),
                const SizedBox(height: 20),
                const Text(
                  'Severity Trend Chart',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ).animate().fade(),
                const SizedBox(height: 12),
                _trendChart(scans),
                const SizedBox(height: 24),
                const Text(
                  'Compare Scan Timeline',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _timelineList(scans),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
      ),
    );
  }

  double _getSeverityValue(String severity) {
    final s = severity.toLowerCase();
    if (s.contains('severe')) return 4.0;
    if (s.contains('moderate')) return 3.0;
    if (s.contains('mild')) return 2.0;
    if (s.contains('cosmetic')) return 1.0;
    return 0.0;
  }

  Widget _statsCard(int scanCount, double improvement) {
    final improvementText = improvement > 0
        ? '+${improvement.toStringAsFixed(0)}% Better'
        : improvement < 0
            ? '${improvement.toStringAsFixed(0)}% Worsened'
            : 'Stable';

    final badgeColor = improvement > 0
        ? Colors.greenAccent
        : improvement < 0
            ? Colors.redAccent
            : Colors.blueAccent;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Total Scans Saved', style: TextStyle(color: Colors.white60, fontSize: 12)),
              Text('$scanCount Scans', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text('Overall Progress', style: TextStyle(color: Colors.white60, fontSize: 12)),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: badgeColor.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
                child: Text(
                  improvementText,
                  style: TextStyle(color: badgeColor, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _trendChart(List<ScanRecord> scans) {
    final reversedScans = scans.reversed.toList();
    final spots = <FlSpot>[];
    for (int i = 0; i < reversedScans.length; i++) {
      spots.add(FlSpot(i.toDouble(), _getSeverityValue(reversedScans[i].severity)));
    }

    return Container(
      height: 180,
      padding: const EdgeInsets.only(right: 16, top: 16),
      decoration: BoxDecoration(color: const Color(0xFF2A2A3B), borderRadius: BorderRadius.circular(16)),
      child: LineChart(
        LineChartData(
          gridData: const FlGridData(show: false),
          titlesData: FlTitlesData(
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  switch (value.toInt()) {
                    case 4:
                      return const Text('Sev', style: TextStyle(color: Colors.white54, fontSize: 10));
                    case 3:
                      return const Text('Mod', style: TextStyle(color: Colors.white54, fontSize: 10));
                    case 2:
                      return const Text('Mild', style: TextStyle(color: Colors.white54, fontSize: 10));
                    case 1:
                      return const Text('Cos', style: TextStyle(color: Colors.white54, fontSize: 10));
                    default:
                      return const Text('', style: TextStyle(color: Colors.white54, fontSize: 10));
                  }
                },
                reservedSize: 28,
              ),
            ),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
          borderData: FlBorderData(show: false),
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true,
              color: const Color(0xFFCE93D8),
              barWidth: 4,
              isStrokeCapRound: true,
              dotData: const FlDotData(show: true),
              belowBarData: BarAreaData(show: true, color: const Color(0xFFCE93D8).withOpacity(0.15)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _timelineList(List<ScanRecord> scans) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: scans.length,
      itemBuilder: (context, idx) {
        final scan = scans[idx];
        final dateStr = scan.timestamp?.toLocal().toString().split(' ')[0] ?? 'Today';

        return Card(
          color: const Color(0xFF2A2A3B),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: scan.imageBytes != null
                  ? Image.memory(scan.imageBytes!, width: 44, height: 44, fit: BoxFit.cover)
                  : Container(color: Colors.purple.withOpacity(0.2), width: 44, height: 44, child: const Icon(Icons.spa_outlined, color: Colors.purple)),
            ),
            title: Text(scan.disease, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            subtitle: Text('Severity: ${scan.severity} | $dateStr', style: const TextStyle(color: Colors.white60, fontSize: 12)),
            trailing: Text(
              '${(scan.confidence * 100).toStringAsFixed(0)}% Conf',
              style: const TextStyle(color: Colors.greenAccent, fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
        );
      },
    );
  }
}
