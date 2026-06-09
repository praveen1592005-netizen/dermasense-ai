// lib/models/chat_message_model.dart

class ChatMessageModel {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final String? voiceUrl; // If it's a voice message or has TTS

  const ChatMessageModel({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.voiceUrl,
  });

  factory ChatMessageModel.fromMap(Map<String, dynamic> map, String docId) {
    return ChatMessageModel(
      id: docId,
      text: map['text'] as String? ?? '',
      isUser: map['isUser'] as bool? ?? true,
      timestamp: map['timestamp'] != null
          ? DateTime.tryParse(map['timestamp'].toString()) ?? DateTime.now()
          : DateTime.now(),
      voiceUrl: map['voiceUrl'] as String?,
    );
  }

  Map<String, dynamic> toMap() => {
        'text': text,
        'isUser': isUser,
        'timestamp': timestamp.toIso8601String(),
        'voiceUrl': voiceUrl,
      };
}
