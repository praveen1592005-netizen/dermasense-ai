// lib/screens/admin_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../services/firestore_service.dart';

// Admin UIDs — add your Firebase admin UID here
const _adminUids = {'your-admin-firebase-uid-here'};

final _adminStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(firestoreServiceProvider).getAdminStats();
});

class AdminScreen extends ConsumerWidget {
  const AdminScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(_adminStatsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF2A2A3B),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                    colors: [Color(0xFF6A1B9A), Color(0xFF283593)]),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.admin_panel_settings_rounded,
                  color: Colors.white, size: 18),
            ),
            const SizedBox(width: 10),
            const Text('Admin Dashboard',
                style: TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            onPressed: () => ref.invalidate(_adminStatsProvider),
          ),
        ],
      ),
      body: statsAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: Color(0xFF6A1B9A)),
        ),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline_rounded,
                  color: Colors.redAccent, size: 48),
              const SizedBox(height: 12),
              Text('$e',
                  style: const TextStyle(color: Colors.white54, fontSize: 13)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(_adminStatsProvider),
                style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6A1B9A)),
                child: const Text('Retry',
                    style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
        data: (stats) => _AdminBody(stats: stats),
      ),
    );
  }
}

class _AdminBody extends StatelessWidget {
  final Map<String, dynamic> stats;
  const _AdminBody({required this.stats});

  @override
  Widget build(BuildContext context) {
    final userCount = stats['userCount'] as int? ?? 0;
    final totalScans = stats['totalScans'] as int? ?? 0;
    final diseaseCounts =
        (stats['diseaseCounts'] as Map<String, int>? ?? {});

    // Sort diseases by frequency
    final sortedDiseases = diseaseCounts.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    final top5 = sortedDiseases.take(5).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Stats row ──────────────────────────────────────────────────────
          Row(
            children: [
              Expanded(
                  child: _StatCard(
                value: '$userCount',
                label: 'Total Users',
                icon: Icons.people_alt_rounded,
                color: const Color(0xFF6A1B9A),
              )),
              const SizedBox(width: 12),
              Expanded(
                  child: _StatCard(
                value: '$totalScans',
                label: 'Total Scans',
                icon: Icons.document_scanner_rounded,
                color: const Color(0xFF283593),
              )),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                  child: _StatCard(
                value: totalScans > 0
                    ? (totalScans / (userCount == 0 ? 1 : userCount))
                        .toStringAsFixed(1)
                    : '0',
                label: 'Avg Scans/User',
                icon: Icons.analytics_rounded,
                color: const Color(0xFF00695C),
              )),
              const SizedBox(width: 12),
              Expanded(
                  child: _StatCard(
                value: '${sortedDiseases.length}',
                label: 'Unique Diseases',
                icon: Icons.biotech_rounded,
                color: const Color(0xFF880E4F),
              )),
            ],
          ),
          const SizedBox(height: 24),

          // ── Disease frequency bar chart ─────────────────────────────────
          if (top5.isNotEmpty) ...[
            _sectionHeader('Disease Detection Trends'),
            const SizedBox(height: 4),
            const Text('Top 5 most detected conditions',
                style: TextStyle(color: Colors.white38, fontSize: 12)),
            const SizedBox(height: 16),
            Container(
              height: 220,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF2A2A3B),
                borderRadius: BorderRadius.circular(18),
                border:
                    Border.all(color: Colors.white.withOpacity(0.07)),
              ),
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: (top5.first.value * 1.3).toDouble(),
                  barTouchData: BarTouchData(
                    enabled: true,
                    touchTooltipData: BarTouchTooltipData(
                      tooltipRoundedRadius: 8,
                      getTooltipItem: (group, _, rod, __) => BarTooltipItem(
                        '${top5[group.x].key}\n${rod.toY.toInt()} scans',
                        const TextStyle(
                            color: Colors.white, fontSize: 11),
                      ),
                    ),
                  ),
                  titlesData: FlTitlesData(
                    show: true,
                    rightTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (val, _) {
                          final i = val.toInt();
                          if (i >= top5.length) return const SizedBox();
                          final name = top5[i].key;
                          final short = name.length > 8
                              ? '${name.substring(0, 8)}…'
                              : name;
                          return Padding(
                            padding: const EdgeInsets.only(top: 6),
                            child: Text(short,
                                style: const TextStyle(
                                    color: Colors.white54,
                                    fontSize: 9)),
                          );
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 30,
                        getTitlesWidget: (val, _) => Text(
                          '${val.toInt()}',
                          style: const TextStyle(
                              color: Colors.white38, fontSize: 10),
                        ),
                      ),
                    ),
                  ),
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: false,
                    getDrawingHorizontalLine: (val) => FlLine(
                      color: Colors.white.withOpacity(0.05),
                      strokeWidth: 1,
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  barGroups: List.generate(top5.length, (i) {
                    final colors = [
                      const Color(0xFF6A1B9A),
                      const Color(0xFF283593),
                      const Color(0xFF00695C),
                      const Color(0xFF880E4F),
                      const Color(0xFF1565C0),
                    ];
                    return BarChartGroupData(
                      x: i,
                      barRods: [
                        BarChartRodData(
                          toY: top5[i].value.toDouble(),
                          gradient: LinearGradient(
                            colors: [
                              colors[i % colors.length],
                              colors[i % colors.length]
                                  .withOpacity(0.5),
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                          width: 28,
                          borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(6)),
                        ),
                      ],
                    );
                  }),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],

          // ── Full disease table ─────────────────────────────────────────────
          _sectionHeader('All Detected Conditions'),
          const SizedBox(height: 12),
          if (sortedDiseases.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text('No scan data yet.',
                    style: TextStyle(color: Colors.white38)),
              ),
            )
          else
            ...sortedDiseases.map((e) => _DiseaseRow(
                  disease: e.key,
                  count: e.value,
                  total: totalScans,
                )),

          const SizedBox(height: 24),


        ],
      ),
    );
  }

  Widget _sectionHeader(String title) => Text(
        title,
        style: const TextStyle(
            color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
      );

  Widget _adminActionTile(IconData icon, String title, String subtitle,
      Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF2A2A3B),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(0.07)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 14)),
                  Text(subtitle,
                      style: const TextStyle(
                          color: Colors.white54, fontSize: 12)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded,
                color: Colors.white38),
          ],
        ),
      ),
    );
  }

  void _showComingSoon(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('This feature is coming soon!'),
        backgroundColor: Color(0xFF6A1B9A),
      ),
    );
  }
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.value,
    required this.label,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3B),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.15),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(value,
              style: TextStyle(
                  color: color,
                  fontSize: 28,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(label,
              style: const TextStyle(color: Colors.white54, fontSize: 12)),
        ],
      ),
    );
  }
}

// ─── Disease Row ──────────────────────────────────────────────────────────────
class _DiseaseRow extends StatelessWidget {
  final String disease;
  final int count;
  final int total;

  const _DiseaseRow({
    required this.disease,
    required this.count,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    final pct = total > 0 ? count / total : 0.0;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3B),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(disease,
                    style: const TextStyle(
                        color: Colors.white, fontSize: 13)),
              ),
              Text('$count scans',
                  style: const TextStyle(
                      color: Colors.white54, fontSize: 12)),
              const SizedBox(width: 8),
              Text('${(pct * 100).toStringAsFixed(1)}%',
                  style: const TextStyle(
                      color: Color(0xFF8E24AA),
                      fontWeight: FontWeight.bold,
                      fontSize: 12)),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: pct,
              backgroundColor: Colors.white.withOpacity(0.07),
              valueColor: const AlwaysStoppedAnimation(Color(0xFF6A1B9A)),
              minHeight: 5,
            ),
          ),
        ],
      ),
    );
  }
}
