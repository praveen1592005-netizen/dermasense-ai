// lib/screens/history_screen.dart
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import 'result_screen.dart';
import 'report_screen.dart';

final _scansStreamProvider = StreamProvider<List<ScanRecord>>((ref) {
  return ref.read(firestoreServiceProvider).watchScans();
});

class HistoryScreen extends ConsumerStatefulWidget {
  const HistoryScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends ConsumerState<HistoryScreen> {
  final Set<String> _selected = {};
  bool _compareMode = false;

  void _toggleSelect(String id) {
    setState(() {
      if (_selected.contains(id)) {
        _selected.remove(id);
      } else if (_selected.length < 2) {
        _selected.add(id);
      }
    });
  }

  Future<void> _delete(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A3B),
        title: const Text('Delete Scan',
            style: TextStyle(color: Colors.white)),
        content: const Text('Remove this scan from history?',
            style: TextStyle(color: Colors.white70)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel',
                  style: TextStyle(color: Colors.white54))),
          TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Delete',
                  style: TextStyle(color: Colors.redAccent))),
        ],
      ),
    );
    if (confirm == true) {
      await ref.read(firestoreServiceProvider).deleteScan(id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Scan deleted.'),
              backgroundColor: Color(0xFF2A2A3B)),
        );
      }
    }
  }

  void _openCompare(List<ScanRecord> scans) {
    final selected = scans.where((s) => _selected.contains(s.id)).toList();
    if (selected.length != 2) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _CompareSheet(a: selected[0], b: selected[1]),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final scansAsync = ref.watch(_scansStreamProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF2A2A3B),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Scan History',
            style:
                TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          // Compare mode toggle
          IconButton(
            icon: Icon(
              _compareMode
                  ? Icons.compare_arrows_rounded
                  : Icons.compare_outlined,
              color: _compareMode
                  ? const Color(0xFF8E24AA)
                  : Colors.white54,
            ),
            tooltip: 'Compare Mode',
            onPressed: () {
              setState(() {
                _compareMode = !_compareMode;
                _selected.clear();
              });
            },
          ),
        ],
      ),
      floatingActionButton: (_compareMode && _selected.length == 2)
          ? FloatingActionButton.extended(
              onPressed: () {
                scansAsync.whenData((scans) => _openCompare(scans));
              },
              label: const Text('Compare Selected'),
              icon: const Icon(Icons.compare_arrows_rounded),
              backgroundColor: const Color(0xFF6A1B9A),
            )
          : null,
      body: user == null
          ? const Center(
              child: Text('Please log in to view history.',
                  style: TextStyle(color: Colors.white54)))
          : scansAsync.when(
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
                        style: const TextStyle(
                            color: Colors.white54, fontSize: 13),
                        textAlign: TextAlign.center),
                  ],
                ),
              ),
              data: (scans) => scans.isEmpty
                  ? _EmptyState()
                  : Column(
                      children: [
                        if (_compareMode)
                          _CompareBanner(
                              selected: _selected.length, max: 2),
                        // Stats row
                        _StatsRow(scans: scans),
                        // List
                        Expanded(
                          child: ListView.separated(
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
                            itemCount: scans.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(height: 12),
                            itemBuilder: (_, i) => _ScanCard(
                              scan: scans[i],
                              compareMode: _compareMode,
                              selected: _selected.contains(scans[i].id),
                              canSelect: _selected.length < 2 ||
                                  _selected.contains(scans[i].id),
                              onTap: () {
                                if (_compareMode) {
                                  _toggleSelect(scans[i].id);
                                } else {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => ResultScreen(
                                        prediction: scans[i].toPredictionMap(),
                                        imageBytes: scans[i].imageBytes,
                                      ),
                                    ),
                                  );
                                }
                              },
                              onDelete: () => _delete(scans[i].id),
                              onReport: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ReportScreen(
                                    prediction: scans[i].toPredictionMap(),
                                    imageBytes: scans[i].imageBytes,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
            ),
    );
  }
}

// ─── Stats Row ───────────────────────────────────────────────────────────────
class _StatsRow extends StatelessWidget {
  final List<ScanRecord> scans;
  const _StatsRow({required this.scans});

  @override
  Widget build(BuildContext context) {
    final avgConf = scans.isEmpty
        ? 0.0
        : scans.map((s) => s.confidence).reduce((a, b) => a + b) / scans.length;
    final doctorNeeded = scans.where((s) => s.needsDoctor).length;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3B),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          _statItem('${scans.length}', 'Scans', const Color(0xFF6A1B9A)),
          _divider(),
          _statItem(
              '${(avgConf * 100).toStringAsFixed(0)}%',
              'Avg Confidence',
              const Color(0xFF283593)),
          _divider(),
          _statItem('$doctorNeeded', 'Need Doctor', Colors.redAccent),
        ],
      ),
    );
  }

  Widget _statItem(String value, String label, Color color) => Expanded(
        child: Column(
          children: [
            Text(value,
                style: TextStyle(
                    color: color,
                    fontSize: 20,
                    fontWeight: FontWeight.bold)),
            const SizedBox(height: 3),
            Text(label,
                style:
                    const TextStyle(color: Colors.white38, fontSize: 10),
                textAlign: TextAlign.center),
          ],
        ),
      );

  Widget _divider() => Container(
      width: 1, height: 36, color: Colors.white.withOpacity(0.08));
}

// ─── Scan Card ────────────────────────────────────────────────────────────────
class _ScanCard extends StatelessWidget {
  final ScanRecord scan;
  final bool compareMode;
  final bool selected;
  final bool canSelect;
  final VoidCallback onTap;
  final VoidCallback onDelete;
  final VoidCallback onReport;

  const _ScanCard({
    required this.scan,
    required this.compareMode,
    required this.selected,
    required this.canSelect,
    required this.onTap,
    required this.onDelete,
    required this.onReport,
  });

  Color get _accentColor {
    try {
      return Color(int.parse(scan.colorHex));
    } catch (_) {
      return const Color(0xFF8E24AA);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateStr = scan.timestamp != null
        ? DateFormat('MMM dd, yyyy · h:mm a').format(scan.timestamp!)
        : 'Unknown date';

    return Dismissible(
      key: Key(scan.id),
      direction: compareMode
          ? DismissDirection.none
          : DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: Colors.redAccent.withOpacity(0.8),
          borderRadius: BorderRadius.circular(18),
        ),
        child: const Icon(Icons.delete_rounded, color: Colors.white),
      ),
      onDismissed: (_) => onDelete(),
      child: GestureDetector(
        onTap: canSelect ? onTap : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: selected
                ? _accentColor.withOpacity(0.15)
                : const Color(0xFF2A2A3B),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: selected
                  ? _accentColor
                  : Colors.white.withOpacity(0.07),
              width: selected ? 2 : 1,
            ),
          ),
          child: Column(
            children: [
              // Top row
              Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    // Image or placeholder
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: scan.imageBytes != null
                          ? Image.memory(
                              scan.imageBytes!,
                              width: 60,
                              height: 60,
                              fit: BoxFit.cover,
                            )
                          : Container(
                              width: 60,
                              height: 60,
                              color: _accentColor.withOpacity(0.15),
                              child: Icon(Icons.image_rounded,
                                  color: _accentColor, size: 28),
                            ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(scan.disease,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15)),
                          const SizedBox(height: 4),
                          Text(dateStr,
                              style: const TextStyle(
                                  color: Colors.white38, fontSize: 11)),
                          const SizedBox(height: 5),
                          Row(
                            children: [
                              _badge(scan.severity, _accentColor),
                              const SizedBox(width: 6),
                              if (scan.needsDoctor)
                                _badge('Consult Doctor', Colors.redAccent),
                            ],
                          ),
                        ],
                      ),
                    ),
                    // Confidence + select
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        if (compareMode)
                          Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: _accentColor, width: 2),
                              color: selected
                                  ? _accentColor
                                  : Colors.transparent,
                            ),
                            child: selected
                                ? const Icon(Icons.check,
                                    color: Colors.white, size: 14)
                                : null,
                          )
                        else
                          Text(
                            '${(scan.confidence * 100).toStringAsFixed(0)}%',
                            style: const TextStyle(
                                color: Colors.greenAccent,
                                fontWeight: FontWeight.bold,
                                fontSize: 18),
                          ),
                        if (!compareMode)
                          const Text('confidence',
                              style: TextStyle(
                                  color: Colors.white38, fontSize: 10)),
                      ],
                    ),
                  ],
                ),
              ),

              // Action bar
              if (!compareMode)
                Container(
                  padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
                  child: Row(
                    children: [
                      _miniBtn(Icons.visibility_rounded, 'View',
                          const Color(0xFF6A1B9A), onTap),
                      const SizedBox(width: 8),
                      _miniBtn(Icons.picture_as_pdf_rounded, 'Report',
                          const Color(0xFF283593), onReport),
                      const SizedBox(width: 8),
                      _miniBtn(Icons.delete_outline_rounded, 'Delete',
                          Colors.redAccent, onDelete),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _badge(String text, Color color) => Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Text(text,
            style: TextStyle(
                color: color,
                fontSize: 10,
                fontWeight: FontWeight.w500)),
      );

  Widget _miniBtn(
      IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withOpacity(0.25)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 14),
            const SizedBox(width: 5),
            Text(label,
                style: TextStyle(
                    color: color,
                    fontSize: 11,
                    fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}

// ─── Compare Banner ───────────────────────────────────────────────────────────
class _CompareBanner extends StatelessWidget {
  final int selected;
  final int max;
  const _CompareBanner({required this.selected, required this.max});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
            colors: [Color(0xFF6A1B9A), Color(0xFF283593)]),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.compare_arrows_rounded,
              color: Colors.white, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              selected < max
                  ? 'Select ${max - selected} more scan(s) to compare'
                  : 'Tap "Compare Selected" to see side-by-side',
              style: const TextStyle(color: Colors.white, fontSize: 13),
            ),
          ),
          Text('$selected/$max',
              style: const TextStyle(
                  color: Colors.white70,
                  fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

// ─── Compare Sheet ────────────────────────────────────────────────────────────
class _CompareSheet extends StatelessWidget {
  final ScanRecord a;
  final ScanRecord b;
  const _CompareSheet({required this.a, required this.b});

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, ctrl) => Container(
        decoration: const BoxDecoration(
          color: Color(0xFF1E1E2F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            // Handle
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(bottom: 12),
              child: Text('Scan Comparison',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 17,
                      fontWeight: FontWeight.bold)),
            ),
            Expanded(
              child: SingleChildScrollView(
                controller: ctrl,
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                child: Column(
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: _CompareColumn(scan: a, label: 'Scan A')),
                        const SizedBox(width: 12),
                        Expanded(child: _CompareColumn(scan: b, label: 'Scan B')),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CompareColumn extends StatelessWidget {
  final ScanRecord scan;
  final String label;
  const _CompareColumn({required this.scan, required this.label});

  Color get _color {
    try {
      return Color(int.parse(scan.colorHex));
    } catch (_) {
      return const Color(0xFF8E24AA);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateStr = scan.timestamp != null
        ? DateFormat('MMM dd').format(scan.timestamp!)
        : '—';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Label
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(label,
                style: TextStyle(
                    color: _color,
                    fontSize: 12,
                    fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 10),
          // Image
          if (scan.imageBytes != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.memory(scan.imageBytes!,
                  height: 100,
                  width: double.infinity,
                  fit: BoxFit.cover),
            ),
          const SizedBox(height: 10),
          _row('Date', dateStr),
          _row('Disease', scan.disease),
          _row(
              'Confidence', '${(scan.confidence * 100).toStringAsFixed(0)}%'),
          _row('Severity', scan.severity),
          _row('Risk', scan.risk),
        ],
      ),
    );
  }

  Widget _row(String k, String v) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(k,
                style: const TextStyle(
                    color: Colors.white38, fontSize: 10)),
            Text(v,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w500),
                maxLines: 2,
                overflow: TextOverflow.ellipsis),
          ],
        ),
      );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                    colors: [Color(0xFF6A1B9A), Color(0xFF283593)]),
                borderRadius: BorderRadius.circular(50),
              ),
              child: const Icon(Icons.history_rounded,
                  color: Colors.white, size: 48),
            ),
            const SizedBox(height: 20),
            const Text('No scans yet',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text(
              'Scan a skin area to get started.\nYour history will appear here.',
              textAlign: TextAlign.center,
              style: TextStyle(
                  color: Colors.white54, fontSize: 14, height: 1.5),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => Navigator.pushNamed(context, '/scan'),
              icon: const Icon(Icons.camera_alt_rounded),
              label: const Text('Start First Scan'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6A1B9A),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                    horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
