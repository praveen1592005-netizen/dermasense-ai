// lib/screens/profile_screen.dart
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../services/theme_service.dart';
import 'admin_screen.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  // ── Edit name dialog ──────────────────────────────────────────────────────
  Future<void> _editName(String current) async {
    final ctrl = TextEditingController(text: current);
    final result = await showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A3B),
        title: const Text('Edit Display Name',
            style: TextStyle(color: Colors.white)),
        content: TextField(
          controller: ctrl,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: 'Your name',
            hintStyle: const TextStyle(color: Colors.white38),
            filled: true,
            fillColor: const Color(0xFF1E1E2F),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide.none,
            ),
          ),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel',
                  style: TextStyle(color: Colors.white38))),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, ctrl.text.trim()),
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6A1B9A)),
            child: const Text('Save',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (result != null && result.isNotEmpty) {
      await FirebaseAuth.instance.currentUser?.updateDisplayName(result);
      if (mounted) setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final themeMode = ref.watch(themeProvider);
    final isDark = themeMode == ThemeMode.dark;
    final name = user?.displayName ?? 'User';
    final email = user?.email ?? '';
    final photoUrl = user?.photoURL;

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('My Profile',
            style:
                TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // ── Avatar ──────────────────────────────────────────────────────
            Stack(
              children: [
                CircleAvatar(
                  radius: 52,
                  backgroundColor: const Color(0xFF6A1B9A),
                  backgroundImage:
                      photoUrl != null ? NetworkImage(photoUrl) : null,
                  child: photoUrl == null
                      ? Text(
                          name.isNotEmpty ? name[0].toUpperCase() : 'U',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 42,
                              fontWeight: FontWeight.bold),
                        )
                      : null,
                ),
                Positioned(
                  bottom: 2,
                  right: 2,
                  child: GestureDetector(
                    onTap: () => _editName(name),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(
                        color: Color(0xFF6A1B9A),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.edit_rounded,
                          color: Colors.white, size: 14),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            GestureDetector(
              onTap: () => _editName(name),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(name,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(width: 6),
                  const Icon(Icons.edit_rounded,
                      color: Colors.white38, size: 14),
                ],
              ),
            ),
            const SizedBox(height: 4),
            Text(email,
                style:
                    const TextStyle(color: Colors.white54, fontSize: 14)),
            const SizedBox(height: 24),

            // ── Scan stats card ──────────────────────────────────────────
            FutureBuilder<int>(
              future:
                  ref.read(firestoreServiceProvider).getScanCount(),
              builder: (_, snap) {
                final count = snap.data ?? 0;
                return Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF6A1B9A), Color(0xFF283593)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF6A1B9A).withOpacity(0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _statItem('$count', 'Total Scans',
                          Icons.document_scanner_rounded),
                      _vDivider(),
                      _statItem('AI', 'Powered By',
                          Icons.smart_toy_outlined),
                      _vDivider(),
                      _statItem('∞', 'Free Tier',
                          Icons.all_inclusive_rounded),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 24),

            // ── Settings section ─────────────────────────────────────────
            _sectionLabel('PREFERENCES'),
            const SizedBox(height: 8),

            // Dark/Light Mode Toggle
            _settingTile(
              icon: isDark
                  ? Icons.dark_mode_rounded
                  : Icons.light_mode_rounded,
              label: isDark ? 'Dark Mode' : 'Light Mode',
              color: const Color(0xFF6A1B9A),
              trailing: Switch(
                value: isDark,
                activeColor: const Color(0xFF8E24AA),
                onChanged: (_) => ref.read(themeProvider.notifier).toggle(),
              ),
            ),
            const SizedBox(height: 8),

            // ── Navigation section ──────────────────────────────────────
            _sectionLabel('FEATURES'),
            const SizedBox(height: 8),
            _profileTile(Icons.history_rounded, 'Scan History',
                'View all past diagnoses', () {
              Navigator.pushNamed(context, '/history');
            }),
            const SizedBox(height: 8),
            _profileTile(Icons.chat_bubble_outline_rounded, 'AI Chatbot',
                'Ask skin health questions', () {
              Navigator.pushNamed(context, '/chatbot');
            }),
            const SizedBox(height: 8),
            _profileTile(Icons.camera_alt_rounded, 'New Skin Scan',
                'Analyze a skin condition', () {
              Navigator.pushNamed(context, '/scan');
            }),
            const SizedBox(height: 8),
            _profileTile(Icons.local_hospital_rounded,
                'Find Dermatologist', 'Locate nearby specialists', () {
              Navigator.pushNamed(context, '/dermatologist');
            }),
            const SizedBox(height: 8),
            _profileTile(
                Icons.info_outline_rounded, 'About DermaSense AI',
                'App info & version', () {
              _showAbout(context);
            }),

            // ── Admin section (visible to all for demo) ──────────────────
            const SizedBox(height: 8),
            _profileTile(
                Icons.admin_panel_settings_rounded,
                'Admin Dashboard',
                'Platform statistics & management',
                () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const AdminScreen())),
                color: const Color(0xFF880E4F)),

            const SizedBox(height: 16),
            const Divider(color: Colors.white12),
            const SizedBox(height: 12),

            // ── Disclaimer ───────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.04),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                '⚠️ DermaSense AI provides AI-assisted analysis and is not a substitute for professional medical diagnosis.',
                style: TextStyle(
                    color: Colors.white38, fontSize: 12, height: 1.5),
              ),
            ),
            const SizedBox(height: 16),

            // ── Sign out ─────────────────────────────────────────────────
            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton.icon(
                onPressed: () async {
                  await FirebaseAuth.instance.signOut();
                  if (context.mounted) {
                    Navigator.pushReplacementNamed(context, '/login');
                  }
                },
                icon: const Icon(Icons.logout_rounded,
                    color: Colors.redAccent),
                label: const Text('Sign Out',
                    style: TextStyle(
                        color: Colors.redAccent,
                        fontSize: 15,
                        fontWeight: FontWeight.w600)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.redAccent),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  void _showAbout(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A3B),
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                    colors: [Color(0xFF6A1B9A), Color(0xFF283593)]),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.medical_services_rounded,
                  color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            const Text('DermaSense AI',
                style: TextStyle(color: Colors.white, fontSize: 16)),
          ],
        ),
        content: const Text(
          'DermaSense AI is an AI-powered skin disease detection and skincare analysis platform.\n\n'
          '• 10+ skin conditions detected\n'
          '• Personalized treatment plans\n'
          '• PDF report generation\n'
          '• Dermatologist finder\n'
          '• Firebase-backed history\n\n'
          'Version 1.0.0\nBuilt with Flutter & TensorFlow',
          style: TextStyle(color: Colors.white70, height: 1.6),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close',
                  style: TextStyle(color: Color(0xFF8E24AA)))),
        ],
      ),
    );
  }

  Widget _statItem(String value, String label, IconData icon) => Column(
        children: [
          Icon(icon, color: Colors.white70, size: 20),
          const SizedBox(height: 6),
          Text(value,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold)),
          Text(label,
              style: const TextStyle(
                  color: Colors.white60, fontSize: 10)),
        ],
      );

  Widget _vDivider() => Container(
      width: 1, height: 40, color: Colors.white.withOpacity(0.15));

  Widget _sectionLabel(String label) => Align(
        alignment: Alignment.centerLeft,
        child: Text(label,
            style: const TextStyle(
                color: Colors.white38,
                fontSize: 11,
                letterSpacing: 1.2,
                fontWeight: FontWeight.w600)),
      );

  Widget _settingTile(
      {required IconData icon,
      required String label,
      required Color color,
      required Widget trailing}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.07)),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(label,
                style: const TextStyle(color: Colors.white, fontSize: 14)),
          ),
          trailing,
        ],
      ),
    );
  }

  Widget _profileTile(
    IconData icon,
    String label,
    String subtitle,
    VoidCallback onTap, {
    Color color = const Color(0xFF6A1B9A),
  }) {
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
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 14)),
                  Text(subtitle,
                      style: const TextStyle(
                          color: Colors.white54, fontSize: 11)),
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
}
