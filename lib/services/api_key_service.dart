// lib/services/api_key_service.dart
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

const _kGeminiKey = 'gemini_api_key_override';

class ApiKeyService {
  static final ApiKeyService _instance = ApiKeyService._();
  ApiKeyService._();
  factory ApiKeyService() => _instance;

  /// Returns the Gemini API key.
  /// Priority: SharedPreferences (user entered) → .env file → null
  Future<String?> getGeminiApiKey() async {
    final prefs = await SharedPreferences.getInstance();
    final override = prefs.getString(_kGeminiKey);
    if (override != null && override.trim().isNotEmpty) {
      return override.trim();
    }
    // Fall back to .env
    final envKey = dotenv.env['GEMINI_API_KEY'];
    if (envKey != null && envKey.trim().isNotEmpty && envKey.startsWith('AIza')) {
      return envKey.trim();
    }
    return null;
  }

  /// Save a Gemini API key entered by the user at runtime.
  Future<bool> saveGeminiApiKey(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.setString(_kGeminiKey, key.trim());
  }

  /// Clear the user-saved key (revert to .env).
  Future<void> clearGeminiApiKey() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kGeminiKey);
  }

  /// Quickly checks if a key looks like a valid Gemini API key.
  bool isValidFormat(String key) => key.trim().startsWith('AIza') && key.trim().length > 20;
}
