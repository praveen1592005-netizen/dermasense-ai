import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'screens/splash_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/scan_screen.dart';
import 'screens/result_screen.dart';
import 'screens/chatbot_screen.dart';
import 'screens/history_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/skincare_screen.dart';
import 'screens/dermatologist_screen.dart';
import 'screens/admin_screen.dart';
import 'screens/progress_tracker_screen.dart';
import 'screens/symptom_checker_screen.dart';
import 'screens/health_score_screen.dart';
import 'screens/telemedicine_screen.dart';
import 'screens/weather_screen.dart';
import 'screens/medication_screen.dart';
import 'screens/reminders_screen.dart';
import 'screens/personalized_plan_screen.dart';
import 'screens/settings_screen.dart';
import 'services/theme_service.dart';

import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const ProviderScope(child: DermaSenseApp()));
}

class DermaSenseApp extends ConsumerWidget {
  const DermaSenseApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);

    return MaterialApp(
      title: 'DermaSense AI Pro',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6A1B9A)),
        brightness: Brightness.light,
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF6A1B9A), brightness: Brightness.dark),
        brightness: Brightness.dark,
      ),
      themeMode: themeMode,
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashScreen(),
        '/onboarding': (context) => const OnboardingScreen(),
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/forgot': (context) => const ForgotPasswordScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/scan': (context) => const ScanScreen(),
        '/chatbot': (context) => const ChatbotScreen(),
        '/history': (context) => const HistoryScreen(),
        '/profile': (context) => const ProfileScreen(),
        '/skincare': (context) => const SkincareScreen(),
        '/dermatologist': (context) => const DermatologistScreen(),
        '/admin': (context) => const AdminScreen(),
        '/progress': (context) => const ProgressTrackerScreen(),
        '/symptom': (context) => const SymptomCheckerScreen(),
        '/health_score': (context) => const HealthScoreScreen(),
        '/telemedicine': (context) => const TelemedicineScreen(),
        '/weather': (context) => const WeatherScreen(),
        '/medication': (context) => const MedicationScreen(),
        '/reminders': (context) => const RemindersScreen(),
        '/skincare_plans': (context) => const PersonalizedPlanScreen(),
        '/settings': (context) => const SettingsScreen(),
      },
    );
  }
}
