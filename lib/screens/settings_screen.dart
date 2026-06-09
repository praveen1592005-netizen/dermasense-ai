// lib/screens/settings_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/theme_service.dart';

final languageProvider = StateProvider<String>((ref) => 'en');

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  static const _languages = {
    'en': 'English',
    'ta': 'தமிழ் (Tamil)',
    'hi': 'हिन्दी (Hindi)',
    'te': 'తెలుగు (Telugu)',
    'ml': 'മലയാളം (Malayalam)',
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);
    final currentLang = ref.watch(languageProvider);

    return Scaffold(
      backgroundColor: themeMode == ThemeMode.dark ? const Color(0xFF1E1E2F) : Colors.grey[100],
      appBar: AppBar(
        title: const Text('Settings & Preferences', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Localization Selection Card
          _settingsCard(
            title: 'Language / மொழி',
            subtitle: 'Choose your preferred language',
            icon: Icons.language_rounded,
            child: DropdownButtonFormField<String>(
              value: currentLang,
              dropdownColor: themeMode == ThemeMode.dark ? const Color(0xFF2A2A3B) : Colors.white,
              decoration: const InputDecoration(border: InputBorder.none),
              items: _languages.entries.map((e) {
                return DropdownMenuItem<String>(
                  value: e.key,
                  child: Text(e.value, style: TextStyle(color: themeMode == ThemeMode.dark ? Colors.white : Colors.black87)),
                );
              }).toList(),
              onChanged: (lang) {
                if (lang != null) {
                  ref.read(languageProvider.notifier).state = lang;
                }
              },
            ),
          ),
          const SizedBox(height: 16),

          // Theme Settings Card
          _settingsCard(
            title: 'Appearance Mode',
            subtitle: 'Toggle dark and light theme styles',
            icon: Icons.dark_mode_rounded,
            child: SwitchListTile(
              title: Text(
                themeMode == ThemeMode.dark ? 'Dark Mode' : 'Light Mode',
                style: TextStyle(color: themeMode == ThemeMode.dark ? Colors.white : Colors.black87),
              ),
              value: themeMode == ThemeMode.dark,
              activeColor: const Color(0xFF8E24AA),
              onChanged: (_) {
                ref.read(themeProvider.notifier).toggle();
              },
            ),
          ),
          const SizedBox(height: 16),

          // Platform info & disclaimer
          _settingsCard(
            title: 'Platform Information',
            subtitle: 'DermaSense AI Pro v2.0.0',
            icon: Icons.info_outline_rounded,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'This platform integrates EfficientNetB3/MobileNetV3 convolutional networks trained on clinical skin disease datasets (HAM10000, ISIC, DermNet).',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                SizedBox(height: 12),
                Text(
                  '⚠️ Medical Disclaimer:\nThis application provides AI-assisted skin analysis and is not a replacement for professional medical diagnosis, advice, or treatment.',
                  style: TextStyle(fontSize: 12, color: Colors.orangeAccent, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _settingsCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Widget child,
  }) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: const Color(0xFF8E24AA)),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
              ],
            ),
            const Divider(height: 24),
            child,
          ],
        ),
      ),
    );
  }
}
