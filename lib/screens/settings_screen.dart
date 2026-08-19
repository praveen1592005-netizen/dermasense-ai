// lib/screens/settings_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/theme_service.dart';
import '../services/language_service.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);
    final isDark = themeMode == ThemeMode.dark;
    final locale = ref.watch(languageProvider);
    final currentCode = locale.languageCode;
    final strings = kAppStrings[currentCode] ?? kAppStrings['en']!;

    final bgColor = isDark ? const Color(0xFF1E1E2F) : Colors.grey[100]!;
    final cardColor = isDark ? const Color(0xFF2A2A3B) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final subColor = isDark ? Colors.white54 : Colors.black54;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          strings['settings_title'] ?? 'Settings & Preferences',
          style: TextStyle(color: textColor, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textColor),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Language Card ──────────────────────────────────────────────────
          _settingsCard(
            isDark: isDark,
            cardColor: cardColor,
            textColor: textColor,
            subColor: subColor,
            title: strings['language'] ?? 'Language',
            subtitle: strings['choose_language'] ?? 'Choose your preferred language',
            icon: Icons.language_rounded,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white.withOpacity(0.06) : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isDark ? Colors.white.withOpacity(0.08) : Colors.grey.shade300,
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: currentCode,
                      isExpanded: true,
                      dropdownColor: isDark ? const Color(0xFF2A2A3B) : Colors.white,
                      icon: Icon(Icons.expand_more_rounded, color: const Color(0xFF8E24AA)),
                      items: kLanguageLabels.entries.map((e) {
                        return DropdownMenuItem<String>(
                          value: e.key,
                          child: Row(
                            children: [
                              Text(
                                _langFlag(e.key),
                                style: const TextStyle(fontSize: 20),
                              ),
                              const SizedBox(width: 10),
                              Text(
                                e.value,
                                style: TextStyle(
                                  color: textColor,
                                  fontWeight: e.key == currentCode
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                                ),
                              ),
                              if (e.key == currentCode) ...[
                                const Spacer(),
                                const Icon(Icons.check_circle_rounded,
                                    color: Color(0xFF8E24AA), size: 16),
                              ],
                            ],
                          ),
                        );
                      }).toList(),
                      onChanged: (lang) {
                        if (lang != null) {
                          ref.read(languageProvider.notifier).setLanguage(lang);
                          final newStrings = kAppStrings[lang] ?? kAppStrings['en']!;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Row(
                                children: [
                                  const Icon(Icons.check_circle_rounded,
                                      color: Colors.white, size: 18),
                                  const SizedBox(width: 10),
                                  Text(newStrings['saved'] ?? 'Language changed!'),
                                ],
                              ),
                              backgroundColor: const Color(0xFF8E24AA),
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        }
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF8E24AA).withOpacity(0.08),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline_rounded,
                          color: Color(0xFF8E24AA), size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Changing the language updates the app immediately.',
                          style: TextStyle(
                              color: const Color(0xFF8E24AA), fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ── Theme Card ──────────────────────────────────────────────────
          _settingsCard(
            isDark: isDark,
            cardColor: cardColor,
            textColor: textColor,
            subColor: subColor,
            title: strings['theme'] ?? 'Appearance Mode',
            subtitle: 'Toggle between dark and light themes',
            icon: isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
            child: GestureDetector(
              onTap: () => ref.read(themeProvider.notifier).toggle(),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withOpacity(0.06) : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? Colors.white.withOpacity(0.08) : Colors.grey.shade300,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      isDark ? Icons.nightlight_round : Icons.wb_sunny_rounded,
                      color: isDark ? Colors.indigo[200] : Colors.orange,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        isDark
                            ? (strings['dark_mode'] ?? 'Dark Mode')
                            : (strings['light_mode'] ?? 'Light Mode'),
                        style: TextStyle(color: textColor, fontWeight: FontWeight.w600),
                      ),
                    ),
                    Switch(
                      value: isDark,
                      activeColor: const Color(0xFF8E24AA),
                      onChanged: (_) => ref.read(themeProvider.notifier).toggle(),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // ── Platform Info Card ──────────────────────────────────────────
          _settingsCard(
            isDark: isDark,
            cardColor: cardColor,
            textColor: textColor,
            subColor: subColor,
            title: 'Platform Information',
            subtitle: 'DermaSense AI Pro v2.0.0',
            icon: Icons.info_outline_rounded,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'This platform integrates Gemini 2.5 Flash Vision AI for real-time dermatological skin disease detection and cosmetic analysis.',
                  style: TextStyle(fontSize: 12, color: subColor, height: 1.5),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.orange.withOpacity(0.2)),
                  ),
                  child: const Text(
                    '⚠️ Medical Disclaimer: This application provides AI-assisted skin analysis and is NOT a replacement for professional medical diagnosis, advice, or treatment. Always consult a qualified dermatologist.',
                    style: TextStyle(
                        fontSize: 12, color: Colors.orangeAccent, height: 1.5),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ── Test Credentials Card ───────────────────────────────────────
          _settingsCard(
            isDark: isDark,
            cardColor: cardColor,
            textColor: textColor,
            subColor: subColor,
            title: 'Test Login Credentials',
            subtitle: 'Development accounts for testing',
            icon: Icons.lock_person_outlined,
            child: Column(
              children: [
                _credentialRow('Email', 'test@dermasense.ai', isDark, textColor, subColor),
                const SizedBox(height: 8),
                _credentialRow('Password', 'Test@123456', isDark, textColor, subColor),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _credentialRow(String label, String value, bool isDark,
      Color textColor, Color subColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.04) : Colors.grey.shade100,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
            color: isDark ? Colors.white.withOpacity(0.07) : Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Text('$label: ',
              style: TextStyle(
                  color: subColor, fontSize: 13, fontWeight: FontWeight.w600)),
          Expanded(
            child: Text(value,
                style: TextStyle(
                    color: textColor,
                    fontSize: 13,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  String _langFlag(String code) {
    const flags = {
      'en': '🇬🇧',
      'ta': '🇮🇳',
      'hi': '🇮🇳',
      'te': '🇮🇳',
      'ml': '🇮🇳',
    };
    return flags[code] ?? '🌐';
  }

  Widget _settingsCard({
    required bool isDark,
    required Color cardColor,
    required Color textColor,
    required Color subColor,
    required String title,
    required String subtitle,
    required IconData icon,
    required Widget child,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.25 : 0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF8E24AA).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: const Color(0xFF8E24AA), size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title,
                          style: TextStyle(
                              color: textColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 15)),
                      Text(subtitle,
                          style: TextStyle(color: subColor, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
            Divider(
                height: 22,
                color: isDark ? Colors.white12 : Colors.grey.shade200),
            child,
          ],
        ),
      ),
    );
  }
}
