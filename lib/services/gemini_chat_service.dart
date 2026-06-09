// lib/services/gemini_chat_service.dart

import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../models/chat_message_model.dart';

final geminiChatServiceProvider = Provider<GeminiChatService>((ref) => GeminiChatService());

class GeminiChatService {
  // Replace with actual API key or retrieve via Remote Config / Environment Variables.
  // Using a fallback placeholder so the user can easily plug in their API key.
  static const String _apiKey = 'YOUR_GEMINI_API_KEY';

  Future<String> sendMessage(String prompt, List<ChatMessageModel> history) async {
    try {
      if (_apiKey == 'YOUR_GEMINI_API_KEY') {
        return _getMockDermatologyResponse(prompt);
      }

      final url = Uri.parse(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$_apiKey',
      );

      final contentsList = <Map<String, dynamic>>[];

      // Build history
      for (final msg in history) {
        contentsList.add({
          'role': msg.isUser ? 'user' : 'model',
          'parts': [
            {'text': msg.text}
          ],
        });
      }

      // Add current message
      contentsList.add({
        'role': 'user',
        'parts': [
          {'text': 'You are a professional AI dermatologist consultant. Keep advice educational and remind user it is not medical diagnosis. Current query: $prompt'}
        ],
      });

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'contents': contentsList}),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final candidates = data['candidates'] as List?;
        if (candidates != null && candidates.isNotEmpty) {
          final content = candidates[0]['content'];
          final parts = content['parts'] as List?;
          if (parts != null && parts.isNotEmpty) {
            return parts[0]['text'] as String? ?? 'I could not process that request.';
          }
        }
      }
    } catch (_) {
      // Fallback below
    }

    return _getMockDermatologyResponse(prompt);
  }

  String _getMockDermatologyResponse(String prompt) {
    final query = prompt.toLowerCase();
    if (query.contains('acne')) {
      return 'Acne Vulgaris is typically treated with salicylic acid cleansers, benzoyl peroxide, or topical retinoids. Be sure to avoid squeezing pimples, moisturize daily with non-comedogenic lotions, and wear SPF 30+. Consultation with a doctor is advised for moderate/severe cystic acne.';
    } else if (query.contains('eczema') || query.contains('dry') || query.contains('itch')) {
      return 'For dry, itchy skin or eczema flare-ups, prioritize thick, fragrance-free emollient creams containing ceramides. Avoid hot showers and harsh soaps. OTC hydrocortisone can relieve intense itching temporarily. Please consult a dermatologist for persistent inflammation.';
    } else if (query.contains('sun') || query.contains('uv') || query.contains('spf')) {
      return 'Sun protection is essential for preventing skin cancer and premature aging. Use a broad-spectrum sunscreen of SPF 30 or higher daily. Reapply every two hours when outdoors, and wear protective clothing and hats when the UV index is high.';
    } else if (query.contains('diet') || query.contains('eat') || query.contains('food')) {
      return 'A balanced diet rich in antioxidants, vitamins A, C, E, and omega-3 fatty acids supports a healthy skin barrier. Minimizing high-glycemic foods and processed sugars can also reduce acne breakouts for some individuals. Stay well-hydrated!';
    }
    return 'Thank you for reaching out to DermaSense Pro AI Chat. I am here to answer your questions about skin types, general skincare routines, OTC treatments, and common skin conditions. Please remember, for official clinical diagnosis, consult a certified dermatologist.';
  }
}
