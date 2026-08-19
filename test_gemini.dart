import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  const apiKey = '';
  final url = Uri.parse('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey');

  final body = jsonEncode({
    'contents': [
      {
        'parts': [
          {'text': 'Hello! Are you working?'}
        ]
      }
    ]
  });

  try {
    print('Sending request to Gemini...');
    final response = await http.post(
      url, 
      headers: {'Content-Type': 'application/json'}, 
      body: body
    );

    print('Status Code: ${response.statusCode}');
    print('Response Body: ${response.body}');
  } catch (e) {
    print('Exception: $e');
  }
}
