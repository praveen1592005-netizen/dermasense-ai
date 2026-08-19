// lib/screens/chatbot_screen.dart
// DermaSense Pro — Real Gemini AI Chatbot
// Features: Real Gemini 2.0 Flash, conversation history, voice input/output,
//           quick suggestion chips, copy message, animated typing indicator

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart';
import 'package:uuid/uuid.dart';
import '../services/gemini_chat_service.dart';
import '../models/chat_message_model.dart';

// ─── Providers ────────────────────────────────────────────────────────────────

final _chatMessagesProvider =
    StateNotifierProvider<_ChatNotifier, List<ChatMessageModel>>(
  (ref) => _ChatNotifier(),
);

final _isTypingProvider = StateProvider<bool>((ref) => false);

class _ChatNotifier extends StateNotifier<List<ChatMessageModel>> {
  _ChatNotifier()
      : super([
          ChatMessageModel(
            id: 'welcome',
            text:
                '👋 Hello! I\'m **DermaSense AI**, your personal skin health assistant powered by **Google Gemini**.\n\n'
                'I can help you with:\n'
                '• 🔬 Skin disease information\n'
                '• 💊 Treatment recommendations\n'
                '• 🧴 Personalized skincare routines\n'
                '• 🌡️ Ingredient analysis\n'
                '• 📋 Symptom assessment\n\n'
                'Ask me anything about your skin! 🌟',
            isUser: false,
            timestamp: DateTime.now(),
          ),
        ]);

  void addMessage(ChatMessageModel msg) {
    state = [...state, msg];
  }

  void clearChat() {
    state = [
      ChatMessageModel(
        id: 'welcome',
        text:
            '👋 Hello! I\'m **DermaSense AI**, your personal skin health assistant powered by **Google Gemini**.\n\n'
            'I can help you with:\n'
            '• 🔬 Skin disease information\n'
            '• 💊 Treatment recommendations\n'
            '• 🧴 Personalized skincare routines\n'
            '• 🌡️ Ingredient analysis\n'
            '• 📋 Symptom assessment\n\n'
            'Ask me anything about your skin! 🌟',
        isUser: false,
        timestamp: DateTime.now(),
      ),
    ];
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

class ChatbotScreen extends ConsumerStatefulWidget {
  const ChatbotScreen({super.key});

  @override
  ConsumerState<ChatbotScreen> createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends ConsumerState<ChatbotScreen>
    with TickerProviderStateMixin {
  final _ctrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _focusNode = FocusNode();

  late stt.SpeechToText _speech;
  bool _isListening = false;
  late FlutterTts _tts;
  bool _isSpeaking = false;
  String? _speakingMsgId;

  // Typing indicator animation
  late AnimationController _dotController;

  static const _suggestions = [
    '🌟 Best morning routine for oily skin',
    '💊 How to treat acne at home?',
    '☀️ What SPF should I use daily?',
    '🔬 What are signs of eczema?',
    '🧴 Best ingredients for dark spots',
    '💧 How to fix dry, flaky skin?',
    '🩺 When should I see a dermatologist?',
    '🌙 Night routine for anti-aging',
  ];

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    _tts = FlutterTts();
    _dotController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
    _initTts();
  }

  Future<void> _initTts() async {
    await _tts.setLanguage('en-US');
    await _tts.setPitch(1.0);
    await _tts.setSpeechRate(0.48);
    await _tts.setVolume(1.0);
    _tts.setStartHandler(() {
      if (mounted) setState(() => _isSpeaking = true);
    });
    _tts.setCompletionHandler(() {
      if (mounted) {
        setState(() {
          _isSpeaking = false;
          _speakingMsgId = null;
        });
      }
    });
    _tts.setErrorHandler((_) {
      if (mounted) {
        setState(() {
          _isSpeaking = false;
          _speakingMsgId = null;
        });
      }
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _scrollCtrl.dispose();
    _focusNode.dispose();
    _dotController.dispose();
    _tts.stop();
    super.dispose();
  }

  Future<void> _toggleSpeak(ChatMessageModel msg) async {
    if (_isSpeaking && _speakingMsgId == msg.id) {
      await _tts.stop();
      setState(() {
        _isSpeaking = false;
        _speakingMsgId = null;
      });
    } else {
      if (_isSpeaking) await _tts.stop();
      // Strip markdown for TTS
      final plainText = msg.text
          .replaceAll(RegExp(r'\*\*(.+?)\*\*'), r'$1')
          .replaceAll(RegExp(r'\*(.+?)\*'), r'$1')
          .replaceAll(RegExp(r'#+ '), '')
          .replaceAll('•', '')
          .trim();
      setState(() {
        _isSpeaking = true;
        _speakingMsgId = msg.id;
      });
      await _tts.speak(plainText);
    }
  }

  Future<void> _listen() async {
    if (!_isListening) {
      final available = await _speech.initialize(
        onStatus: (s) {
          if (s == 'done' || s == 'notListening') {
            if (mounted) setState(() => _isListening = false);
          }
        },
        onError: (_) {
          if (mounted) setState(() => _isListening = false);
        },
      );
      if (available) {
        setState(() => _isListening = true);
        _speech.listen(
          onResult: (val) {
            if (mounted) {
              _ctrl.text = val.recognizedWords;
              _ctrl.selection = TextSelection.fromPosition(
                  TextPosition(offset: _ctrl.text.length));
            }
          },
          listenOptions: stt.SpeechListenOptions(
            listenFor: const Duration(seconds: 30),
            pauseFor: const Duration(seconds: 4),
            partialResults: true,
          ),
        );
      } else {
        _showSnack('Microphone permission required');
      }
    } else {
      _speech.stop();
      setState(() => _isListening = false);
      if (_ctrl.text.trim().isNotEmpty) _send();
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(msg), duration: const Duration(seconds: 2)));
  }

  Future<void> _send([String? quickMsg]) async {
    final text = (quickMsg ?? _ctrl.text).trim();
    if (text.isEmpty) return;

    if (quickMsg == null) _ctrl.clear();
    _focusNode.unfocus();

    final userMsg = ChatMessageModel(
      id: const Uuid().v4(),
      text: text,
      isUser: true,
      timestamp: DateTime.now(),
    );

    ref.read(_chatMessagesProvider.notifier).addMessage(userMsg);
    ref.read(_isTypingProvider.notifier).state = true;
    _scrollToBottom();

    final messages = ref.read(_chatMessagesProvider);
    final responseText =
        await ref.read(geminiChatServiceProvider).sendMessage(text, messages);

    if (!mounted) return;

    final botMsg = ChatMessageModel(
      id: const Uuid().v4(),
      text: responseText,
      isUser: false,
      timestamp: DateTime.now(),
    );

    ref.read(_chatMessagesProvider.notifier).addMessage(botMsg);
    ref.read(_isTypingProvider.notifier).state = false;
    _scrollToBottom();
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 150), () {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeOutCubic,
        );
      }
    });
  }

  void _copyMessage(String text) {
    Clipboard.setData(ClipboardData(text: text));
    _showSnack('Message copied');
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(_chatMessagesProvider);
    final isTyping = ref.watch(_isTypingProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF121218),
      appBar: _buildAppBar(messages),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollCtrl,
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
              itemCount: messages.length + (isTyping ? 1 : 0),
              itemBuilder: (ctx, i) {
                if (isTyping && i == messages.length) {
                  return _TypingBubble(controller: _dotController);
                }
                return _MessageBubble(
                  msg: messages[i],
                  isSpeaking: _isSpeaking && _speakingMsgId == messages[i].id,
                  onSpeak: () => _toggleSpeak(messages[i]),
                  onCopy: () => _copyMessage(messages[i].text),
                  onSuggestionTap: (s) => _send(s),
                  isLastBotMsg: !messages[i].isUser &&
                      i == messages.length - 1 &&
                      !isTyping,
                );
              },
            ),
          ),

          // Quick suggestion chips
          if (!isTyping) _SuggestionBar(suggestions: _suggestions, onTap: _send),

          // Input bar
          _InputBar(
            controller: _ctrl,
            focusNode: _focusNode,
            isListening: _isListening,
            onSend: _send,
            onListen: _listen,
          ),
        ],
      ),
    );
  }

  AppBar _buildAppBar(List<ChatMessageModel> messages) {
    return AppBar(
      backgroundColor: const Color(0xFF1A1A2E),
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
        onPressed: () => Navigator.pop(context),
      ),
      title: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF6A1B9A), Color(0xFF1565C0)],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.auto_awesome_rounded,
                color: Colors.white, size: 20),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text('DermaSense AI',
                  style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15)),
              Text('Powered by Gemini 2.0',
                  style: TextStyle(color: Colors.white54, fontSize: 10)),
            ],
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.delete_outline_rounded, color: Colors.white54),
          tooltip: 'Clear chat',
          onPressed: () {
            showDialog(
              context: context,
              builder: (_) => AlertDialog(
                backgroundColor: const Color(0xFF1A1A2E),
                title: const Text('Clear Chat',
                    style: TextStyle(color: Colors.white)),
                content: const Text(
                    'Are you sure you want to clear this conversation?',
                    style: TextStyle(color: Colors.white70)),
                actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel',
                          style: TextStyle(color: Colors.white54))),
                  TextButton(
                    onPressed: () {
                      ref.read(_chatMessagesProvider.notifier).clearChat();
                      Navigator.pop(context);
                    },
                    child: const Text('Clear',
                        style: TextStyle(color: Color(0xFFEF5350))),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

class _MessageBubble extends StatelessWidget {
  final ChatMessageModel msg;
  final bool isSpeaking;
  final VoidCallback onSpeak;
  final VoidCallback onCopy;
  final void Function(String) onSuggestionTap;
  final bool isLastBotMsg;

  const _MessageBubble({
    required this.msg,
    required this.isSpeaking,
    required this.onSpeak,
    required this.onCopy,
    required this.onSuggestionTap,
    required this.isLastBotMsg,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment:
            msg.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!msg.isUser) ...[
            _BotAvatar(),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: GestureDetector(
              onLongPress: onCopy,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  gradient: msg.isUser
                      ? const LinearGradient(
                          colors: [Color(0xFF6A1B9A), Color(0xFF1565C0)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        )
                      : null,
                  color: msg.isUser ? null : const Color(0xFF1E1E30),
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(20),
                    topRight: const Radius.circular(20),
                    bottomLeft: Radius.circular(msg.isUser ? 20 : 4),
                    bottomRight: Radius.circular(msg.isUser ? 4 : 20),
                  ),
                  border: msg.isUser
                      ? null
                      : Border.all(color: Colors.white.withValues(alpha: 0.08)),
                  boxShadow: [
                    BoxShadow(
                      color: (msg.isUser
                              ? const Color(0xFF6A1B9A)
                              : Colors.black)
                          .withValues(alpha: 0.25),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _FormattedText(text: msg.text, isUser: msg.isUser),
                    if (!msg.isUser) ...[
                      const SizedBox(height: 8),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _IconAction(
                            icon: isSpeaking
                                ? Icons.volume_off_rounded
                                : Icons.volume_up_rounded,
                            tooltip: isSpeaking ? 'Stop' : 'Listen',
                            onTap: onSpeak,
                            color: isSpeaking
                                ? const Color(0xFF8E24AA)
                                : Colors.white38,
                          ),
                          const SizedBox(width: 4),
                          _IconAction(
                            icon: Icons.copy_rounded,
                            tooltip: 'Copy',
                            onTap: onCopy,
                            color: Colors.white38,
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
          if (msg.isUser) ...[
            const SizedBox(width: 8),
            _UserAvatar(),
          ],
        ],
      ),
    );
  }
}

// ─── Formatted Text (basic markdown renderer) ─────────────────────────────────

class _FormattedText extends StatelessWidget {
  final String text;
  final bool isUser;

  const _FormattedText({required this.text, required this.isUser});

  @override
  Widget build(BuildContext context) {
    final lines = text.split('\n');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: lines.map((line) => _buildLine(line)).toList(),
    );
  }

  Widget _buildLine(String line) {
    // Bold text: **text**
    final boldRegex = RegExp(r'\*\*(.+?)\*\*');
    if (line.isEmpty) return const SizedBox(height: 4);

    final spans = <TextSpan>[];
    int lastEnd = 0;
    for (final match in boldRegex.allMatches(line)) {
      if (match.start > lastEnd) {
        spans.add(TextSpan(
          text: line.substring(lastEnd, match.start),
          style: TextStyle(
              color: isUser ? Colors.white : Colors.white70,
              fontSize: 14,
              height: 1.55),
        ));
      }
      spans.add(TextSpan(
        text: match.group(1),
        style: TextStyle(
            color: isUser ? Colors.white : Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 14,
            height: 1.55),
      ));
      lastEnd = match.end;
    }
    if (lastEnd < line.length) {
      spans.add(TextSpan(
        text: line.substring(lastEnd),
        style: TextStyle(
            color: isUser ? Colors.white : Colors.white70,
            fontSize: 14,
            height: 1.55),
      ));
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 1),
      child: spans.isEmpty
          ? Text(line,
              style: TextStyle(
                  color: isUser ? Colors.white : Colors.white70,
                  fontSize: 14,
                  height: 1.55))
          : RichText(text: TextSpan(children: spans)),
    );
  }
}

// ─── Typing Bubble ────────────────────────────────────────────────────────────

class _TypingBubble extends StatelessWidget {
  final AnimationController controller;
  const _TypingBubble({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          _BotAvatar(),
          const SizedBox(width: 8),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1E30),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
                bottomRight: Radius.circular(20),
                bottomLeft: Radius.circular(4),
              ),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(3, (i) => _Dot(controller: controller, delay: i * 0.2)),
            ),
          ),
        ],
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  final AnimationController controller;
  final double delay;
  const _Dot({required this.controller, required this.delay});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (_, __) {
        final t = ((controller.value + (1 - delay)) % 1.0);
        final opacity = t < 0.5 ? t * 2 : (1 - t) * 2;
        final offset = (t < 0.5 ? t * 2 : (1 - t) * 2) * -5;
        return Transform.translate(
          offset: Offset(0, offset),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 3),
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: Color.lerp(const Color(0xFF6A1B9A), const Color(0xFF1565C0), opacity),
              shape: BoxShape.circle,
            ),
          ),
        );
      },
    );
  }
}

// ─── Suggestion Bar ───────────────────────────────────────────────────────────

class _SuggestionBar extends StatelessWidget {
  final List<String> suggestions;
  final void Function(String) onTap;
  const _SuggestionBar({required this.suggestions, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 42,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        scrollDirection: Axis.horizontal,
        itemCount: suggestions.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (_, i) {
          final s = suggestions[i];
          return GestureDetector(
            onTap: () => onTap(s.replaceAll(RegExp(r'^[\S]+\s'), '')),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E30),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF6A1B9A).withValues(alpha: 0.4)),
              ),
              child: Text(
                s,
                style: const TextStyle(
                    color: Colors.white70, fontSize: 12, height: 1.2),
              ),
            ),
          );
        },
      ),
    );
  }
}

// ─── Input Bar ────────────────────────────────────────────────────────────────

class _InputBar extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool isListening;
  final VoidCallback onSend;
  final VoidCallback onListen;

  const _InputBar({
    required this.controller,
    required this.focusNode,
    required this.isListening,
    required this.onSend,
    required this.onListen,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
          12, 10, 12, MediaQuery.of(context).padding.bottom + 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A2E),
        border: Border(
            top: BorderSide(color: Colors.white.withValues(alpha: 0.07))),
      ),
      child: Row(
        children: [
          // Mic button
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: isListening
                  ? Colors.red.withValues(alpha: 0.2)
                  : Colors.white.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(
                color: isListening
                    ? Colors.red.withValues(alpha: 0.5)
                    : Colors.white.withValues(alpha: 0.1),
              ),
            ),
            child: IconButton(
              icon: Icon(
                isListening ? Icons.mic_rounded : Icons.mic_none_rounded,
                color: isListening ? Colors.red : Colors.white54,
                size: 20,
              ),
              onPressed: onListen,
              padding: EdgeInsets.zero,
            ),
          ),
          const SizedBox(width: 10),

          // Text input
          Expanded(
            child: TextField(
              controller: controller,
              focusNode: focusNode,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              maxLines: 4,
              minLines: 1,
              textInputAction: TextInputAction.newline,
              decoration: InputDecoration(
                hintText: isListening
                    ? '🎤 Listening...'
                    : 'Ask DermaSense AI anything...',
                hintStyle:
                    const TextStyle(color: Colors.white38, fontSize: 14),
                filled: true,
                fillColor: const Color(0xFF0D0D1A),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(26),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(26),
                  borderSide:
                      BorderSide(color: Colors.white.withValues(alpha: 0.08)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(26),
                  borderSide:
                      const BorderSide(color: Color(0xFF6A1B9A)),
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),

          // Send button
          GestureDetector(
            onTap: onSend,
            child: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF6A1B9A), Color(0xFF1565C0)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF6A1B9A).withValues(alpha: 0.4),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: const Icon(Icons.send_rounded,
                  color: Colors.white, size: 22),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Avatars ─────────────────────────────────────────────────────────────────

class _BotAvatar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
            colors: [Color(0xFF6A1B9A), Color(0xFF1565C0)]),
        borderRadius: BorderRadius.circular(10),
      ),
      child: const Icon(Icons.auto_awesome_rounded,
          color: Colors.white, size: 16),
    );
  }
}

class _UserAvatar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3B),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
      ),
      child:
          const Icon(Icons.person_rounded, color: Colors.white54, size: 18),
    );
  }
}

class _IconAction extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;
  final Color color;

  const _IconAction({
    required this.icon,
    required this.tooltip,
    required this.onTap,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(4),
          child: Icon(icon, color: color, size: 16),
        ),
      ),
    );
  }
}
