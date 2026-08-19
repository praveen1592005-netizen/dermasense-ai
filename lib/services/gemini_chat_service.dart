// lib/services/gemini_chat_service.dart
// Real Gemini AI Chat Service — DermaSense Pro

import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/chat_message_model.dart';

final geminiChatServiceProvider =
    Provider<GeminiChatService>((ref) => GeminiChatService());

class GeminiChatService {
  // Use gemini-flash-latest: best availability & rate limits for chat use
  static const _model = 'gemini-flash-latest';

  // System instruction defining DermaBot's persona
  static const String _systemInstruction =
      'You are DermaSense AI, an expert AI dermatologist and skincare consultant '
      'built into the DermaSense Pro app. You have deep knowledge of dermatology, '
      'skincare ingredients, skin diseases, routines, treatments, and cosmetic procedures. '
      'Always give detailed, helpful, and accurate answers. Use bullet points (•) and emojis '
      'to make responses easy to read. Format key terms in **bold**. '
      'If a user describes symptoms, give your best educational assessment but always remind them '
      'to consult a real dermatologist for clinical diagnosis. '
      'You support voice input, so keep responses conversational yet professional. '
      'Do NOT refuse to answer skin-related questions — always try to help. '
      'For non-skin topics, politely redirect to skin health. '
      'Keep responses concise but thorough — aim for 150-300 words.';

  String? get _apiKey => dotenv.env['GEMINI_API_KEY'];

  /// Sends a message to Gemini with full conversation history.
  /// Returns the AI response text.
  Future<String> sendMessage(
    String userMessage,
    List<ChatMessageModel> history,
  ) async {
    final apiKey = _apiKey;

    if (apiKey == null || apiKey.isEmpty) {
      return '⚠️ **API Key Missing**\n\n'
          'The GEMINI_API_KEY is not configured. '
          'Please contact the app administrator to set up the AI chat feature.';
    }

    final url = Uri.parse(
      'https://generativelanguage.googleapis.com/v1beta/models/$_model:generateContent?key=$apiKey',
    );

    // Build conversation history for Gemini (skip welcome message)
    final contents = <Map<String, dynamic>>[];

    for (final msg in history) {
      if (msg.id == 'welcome') continue;
      contents.add({
        'role': msg.isUser ? 'user' : 'model',
        'parts': [
          {'text': msg.text}
        ],
      });
    }

    // Add current user message
    contents.add({
      'role': 'user',
      'parts': [
        {'text': userMessage}
      ],
    });

    final body = jsonEncode({
      'system_instruction': {
        'parts': [
          {'text': _systemInstruction}
        ]
      },
      'contents': contents,
      'generationConfig': {
        'temperature': 0.75,
        'maxOutputTokens': 1024,
        'topP': 0.9,
      },
      'safetySettings': [
        {
          'category': 'HARM_CATEGORY_HARASSMENT',
          'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          'category': 'HARM_CATEGORY_HATE_SPEECH',
          'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
          'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
        },
      ],
    });

    // Retry with exponential backoff (handles 429 rate limits)
    for (int attempt = 1; attempt <= 3; attempt++) {
      try {
        final response = await http
            .post(
              url,
              headers: {'Content-Type': 'application/json'},
              body: body,
            )
            .timeout(const Duration(seconds: 30));

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body) as Map<String, dynamic>;
          final candidates = data['candidates'] as List?;
          if (candidates != null && candidates.isNotEmpty) {
            final candidate = candidates[0] as Map<String, dynamic>;

            // Check for safety block
            final finishReason = candidate['finishReason'] as String?;
            if (finishReason == 'SAFETY') {
              return '⚠️ I wasn\'t able to respond to that specific question due to safety guidelines. '
                  'Please rephrase your question and try again.';
            }

            final content = candidate['content'] as Map<String, dynamic>?;
            final parts = content?['parts'] as List?;
            if (parts != null && parts.isNotEmpty) {
              final text = parts[0]['text'] as String?;
              return text?.trim() ??
                  'I could not generate a response. Please try again.';
            }
          }
          return 'I received an empty response. Please try again.';

        } else if (response.statusCode == 429) {
          if (attempt < 3) {
            // Wait before retrying: 3s, then 6s
            await Future.delayed(Duration(seconds: 3 * attempt));
            continue;
          }
          return '⏳ **Too Many Requests**\n\n'
              'The AI is currently handling many requests. '
              'Please wait a moment and try again.';

        } else if (response.statusCode == 400) {
          final err = jsonDecode(response.body);
          final msg = err['error']?['message'] ?? 'Bad request';
          // ignore: avoid_print
          print('[DermaBot] 400 error: $msg');
          return '⚠️ Request error. Please try rephrasing your question.';

        } else if (response.statusCode == 401 || response.statusCode == 403) {
          return '⚠️ **Authentication Failed**\n\n'
              'The Gemini API key is invalid or expired. '
              'Please contact the app administrator.';

        } else if (response.statusCode == 503) {
          if (attempt < 3) {
            await Future.delayed(Duration(seconds: 2 * attempt));
            continue;
          }
          return '🔧 The AI service is temporarily unavailable. Please try again in a few seconds.';

        } else {
          // ignore: avoid_print
          print('[DermaBot] Error ${response.statusCode}: ${response.body}');
          return '⚠️ Something went wrong (Error ${response.statusCode}). Please try again.';
        }
      } on Exception catch (e) {
        // ignore: avoid_print
        print('[DermaBot] Exception attempt $attempt: $e');
        if (attempt == 3) {
          if (e.toString().contains('TimeoutException')) {
            return '⏱️ The request timed out. Please check your internet connection and try again.';
          }
          return '📶 Connection failed. Please check your internet connection and try again.';
        }
        await Future.delayed(Duration(seconds: 2 * attempt));
      }
    }

    return '⚠️ Unable to get a response after multiple attempts. Please try again.';
  }
}
