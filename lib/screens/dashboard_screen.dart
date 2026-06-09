// lib/screens/dashboard_screen.dart
import 'dart:ui';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  static const List<Map<String, dynamic>> _tips = [
    {
      'tip': 'Apply SPF 30+ sunscreen every morning, even on cloudy days.',
      'icon': Icons.wb_sunny_rounded,
    },
    {
      'tip': 'Cleanse your face twice daily with a gentle, pH-balanced cleanser.',
      'icon': Icons.water_drop_outlined,
    },
    {
      'tip': 'Stay hydrated — drink at least 8 glasses of water daily for skin health.',
      'icon': Icons.local_drink_outlined,
    },
    {
      'tip': 'Never sleep with makeup on — always remove it before bedtime.',
      'icon': Icons.nightlight_round,
    },
    {
      'tip': 'Moisturize while skin is still slightly damp for maximum absorption.',
      'icon': Icons.spa_outlined,
    },
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final name = user?.displayName ?? user?.email?.split('@').first ?? 'User';
    final photoUrl = user?.photoURL;
    final dayIndex = DateTime.now().day % _tips.length;
    final dailyTip = _tips[dayIndex];

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('DermaSense AI',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded,
                color: Colors.white),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.white),
            tooltip: 'Sign Out',
            onPressed: () async {
              await FirebaseAuth.instance.signOut();
              if (context.mounted) {
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, '/scan'),
        label: const Text('Scan Skin',
            style: TextStyle(fontWeight: FontWeight.bold)),
        icon: const Icon(Icons.camera_alt_rounded),
        backgroundColor: const Color(0xFF6A1B9A),
      ),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: const Color(0xFF2A2A3B),
        selectedItemColor: const Color(0xFF8E24AA),
        unselectedItemColor: Colors.white38,
        currentIndex: 0,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.history_rounded), label: 'History'),
          BottomNavigationBarItem(icon: Icon(Icons.spa_outlined), label: 'Skincare'),
          BottomNavigationBarItem(
              icon: Icon(Icons.chat_bubble_outline_rounded), label: 'AI Chat'),
          BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
        ],
        onTap: (index) {
          if (index == 1) Navigator.pushNamed(context, '/history');
          if (index == 2) Navigator.pushNamed(context, '/skincare');
          if (index == 3) Navigator.pushNamed(context, '/chatbot');
          if (index == 4) Navigator.pushNamed(context, '/profile');
        },
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome card
              _glassCard(
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: const Color(0xFF6A1B9A),
                      backgroundImage:
                          photoUrl != null ? NetworkImage(photoUrl) : null,
                      child: photoUrl == null
                          ? Text(
                              name.isNotEmpty ? name[0].toUpperCase() : 'U',
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold),
                            )
                          : null,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Welcome back,',
                              style: TextStyle(
                                  color: Colors.white.withOpacity(0.6),
                                  fontSize: 13)),
                          Text(name,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Scan CTA card
              GestureDetector(
                onTap: () => Navigator.pushNamed(context, '/scan'),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF6A1B9A), Color(0xFF283593)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(22),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF6A1B9A).withOpacity(0.4),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text('Analyze Your Skin',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold)),
                            SizedBox(height: 6),
                            Text(
                                'Take or upload a photo to get an instant AI skin disease diagnosis.',
                                style: TextStyle(
                                    color: Colors.white70, fontSize: 13)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(Icons.camera_alt_rounded,
                            color: Colors.white, size: 30),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Features grid
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.3,
                children: [
                  _featureCard(
                    context,
                    icon: Icons.track_changes_rounded,
                    label: 'Progress Tracker',
                    subtitle: 'Monitor recovery',
                    route: '/progress',
                  ),
                  _featureCard(
                    context,
                    icon: Icons.checklist_rtl_rounded,
                    label: 'Symptom Checker',
                    subtitle: 'Describe symptoms',
                    route: '/symptom',
                  ),
                  _featureCard(
                    context,
                    icon: Icons.favorite_rounded,
                    label: 'Skin Vitals',
                    subtitle: 'Skin Health Score',
                    route: '/health_score',
                  ),
                  _featureCard(
                    context,
                    icon: Icons.video_camera_front_rounded,
                    label: 'Telemedicine',
                    subtitle: 'Specialist consultation',
                    route: '/telemedicine',
                  ),
                  _featureCard(
                    context,
                    icon: Icons.wb_sunny_rounded,
                    label: 'UV & Weather',
                    subtitle: 'Current UV exposure',
                    route: '/weather',
                  ),
                  _featureCard(
                    context,
                    icon: Icons.medical_services_outlined,
                    label: 'Medications',
                    subtitle: 'Schedule dosage',
                    route: '/medication',
                  ),
                  _featureCard(
                    context,
                    icon: Icons.alarm_rounded,
                    label: 'Smart Reminders',
                    subtitle: 'Routines & scan alerts',
                    route: '/reminders',
                  ),
                  _featureCard(
                    context,
                    icon: Icons.auto_awesome_rounded,
                    label: 'Skincare Plans',
                    subtitle: 'Personalized routine',
                    route: '/skincare_plans',
                  ),
                  _featureCard(
                    context,
                    icon: Icons.chat_bubble_outline_rounded,
                    label: 'AI Chatbot Pro',
                    subtitle: 'Ask Gemini skin tips',
                    route: '/chatbot',
                  ),
                  _featureCard(
                    context,
                    icon: Icons.settings_rounded,
                    label: 'Settings',
                    subtitle: 'Language & theme',
                    route: '/settings',
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Daily tip
              _glassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(dailyTip['icon'] as IconData,
                            color: const Color(0xFF8E24AA)),
                        const SizedBox(width: 8),
                        const Text('Daily Skincare Tip',
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(dailyTip['tip'] as String,
                        style: const TextStyle(
                            color: Colors.white70, fontSize: 14, height: 1.5)),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // UV Index info card
              _glassCard(
                child: Row(
                  children: const [
                    Icon(Icons.wb_twilight_rounded, color: Color(0xFFFFA726), size: 28),
                    SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('UV Index: 5 (Moderate)',
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w600)),
                        Text('Apply sunscreen before going outside',
                            style:
                                TextStyle(color: Colors.white54, fontSize: 12)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }

  Widget _glassCard({required Widget child}) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.07),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: Colors.white.withOpacity(0.12)),
          ),
          child: child,
        ),
      ),
    );
  }

  Widget _featureCard(BuildContext context,
      {required IconData icon,
      required String label,
      required String subtitle,
      required String route}) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, route),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.07),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: const Color(0xFF8E24AA), size: 28),
                const SizedBox(height: 8),
                Text(label,
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14)),
                Text(subtitle,
                    style: const TextStyle(
                        color: Colors.white54, fontSize: 11)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
