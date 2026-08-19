import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

void main() async {
  final geminiApiKey = '';
  
  final url = Uri.parse(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$geminiApiKey',
  );
  const prompt = '''You are a dermatology AI assistant.
FIRST: Does this image contain a human face? Answer strictly with JSON only.
If NO face or no human skin is visible, respond: {"skin_type": "NO_FACE"}
If YES a face is visible, analyze the skin and respond with one of these exact skin types:
- Oily (shiny, enlarged pores, sebum visible)
- Dry (flaky, tight-looking, dull)
- Combination (oily T-zone, dry cheeks)
- Sensitive (redness, visible capillaries, irritation)
- Normal (balanced, healthy glow)
Respond ONLY with valid JSON: {"skin_type": "<type>"}''';

  // We will pass an empty image (1x1 pixel base64) to test non-face rejection
  final base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  final body = jsonEncode({
    'contents': [
      {
        'parts': [
          {'inline_data': {'mime_type': 'image/jpeg', 'data': base64Image}},
          {'text': prompt},
        ]
      }
    ],
    'generationConfig': {'temperature': 0.1, 'maxOutputTokens': 60},
  });

  try {
    print('Sending request to Gemini...');
    final response = await http
        .post(url, headers: {'Content-Type': 'application/json'}, body: body)
        .timeout(const Duration(seconds: 20));
    print('Status: ' + response.statusCode.toString());
    print('Body: ' + response.body);
  } catch (e) {
    print('Error: ' + e.toString());
  }
}
