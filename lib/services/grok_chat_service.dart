// lib/services/grok_chat_service.dart
// Delegates to GeminiChatService — kept for backwards compatibility

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/chat_message_model.dart';
import 'gemini_chat_service.dart';

final grokChatServiceProvider =
    Provider<GrokChatService>((ref) => GrokChatService(ref));

class GrokChatService {
  final Ref _ref;
  GrokChatService(this._ref);

  Future<String> sendMessage(
      String message, List<ChatMessageModel> history) async {
    return _ref.read(geminiChatServiceProvider).sendMessage(message, history);
  }
}
