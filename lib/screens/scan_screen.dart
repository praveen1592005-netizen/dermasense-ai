import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';
import '../services/firestore_service.dart';
import '../services/theme_service.dart';
import '../models/health_score_model.dart';
import '../services/health_score_service.dart';
import 'patient_info_screen.dart';
import 'result_screen.dart';
import 'skincare_screen.dart';

class ScanScreen extends ConsumerStatefulWidget {
  const ScanScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends ConsumerState<ScanScreen> {
  XFile? _imageFile;
  Uint8List? _imageBytes;
  bool _isLoading = false;
  String _loadingMessage = 'Processing image...';

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final XFile? picked = await picker.pickImage(
        source: source,
        maxWidth: 800,
        imageQuality: 85,
      );
      if (picked == null) return;
      final bytes = await picked.readAsBytes();
      setState(() {
        _imageFile = picked;
        _imageBytes = bytes;
      });

      // Show patient info form before running prediction
      if (!mounted) return;
      final patientInfo = await Navigator.push<PatientInfo?>(
        context,
        MaterialPageRoute(builder: (_) => const PatientInfoScreen()),
      );

      await _runPrediction(bytes, patientInfo: patientInfo);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not open image: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _runPrediction(Uint8List bytes, {PatientInfo? patientInfo}) async {
    setState(() {
      _isLoading = true;
      _loadingMessage = '🔍 Checking image quality...';
    });
    try {
      final base64Img = base64Encode(bytes);

      setState(() => _loadingMessage = '🧠 EfficientNet AI is classifying...');
      final api = ref.read(apiClientProvider);
      final response = await api.predictHybrid(base64Img, patientInfo: patientInfo);

      // Save result so SkincareScreen shows personalized content
      ref.read(lastScanResultProvider.notifier).state = response;

      // Persist to Firestore (non-blocking)
      try {
        setState(() => _loadingMessage = '💾 Saving to history...');
        ref.read(firestoreServiceProvider).saveScan(
          prediction: response,
          imageBytes: bytes,
        ).catchError((e) => null);

        final score = HealthScoreModel.fromPrediction(response);
        ref.read(healthScoreServiceProvider).saveHealthScore(score).catchError((e) => null);
      } catch (_) {}

      setState(() => _loadingMessage = '✅ Generating full report...');
      await Future.delayed(const Duration(milliseconds: 300));
      if (!mounted) return;
      Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => ResultScreen(prediction: response, imageBytes: bytes),
      ));
    } catch (e) {
      if (!mounted) return;
      final errStr = e.toString();
      if (errStr.contains('NO_SKIN_NO_API')) {
        setState(() => _isLoading = false);
        _showNoFaceDialog(
          title: 'API Key Required',
          message: 'To validate your image, a Gemini API key is required. Please add your API key in Settings, then try again.',
          icon: Icons.key_rounded,
          iconColor: Colors.orange,
        );
        return;
      }
      if (errStr.contains('NO_SKIN')) {
        setState(() => _isLoading = false);
        _showNoFaceDialog();
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Analysis failed: ${errStr.replaceAll('Exception:', '').trim()}'),
          backgroundColor: Colors.redAccent,
          duration: const Duration(seconds: 5),
        ),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
  void _showNoFaceDialog({
    String title = 'No Skin Detected',
    String message = 'The AI could not detect human skin in this image.\n\nPlease upload a clear photo of the affected skin area (face, arm, hand, back, etc.) for accurate analysis.',
    IconData icon = Icons.face_retouching_off_rounded,
    Color iconColor = Colors.amber,
  }) {
    final themeMode = ref.read(themeProvider);
    final isDark = themeMode == ThemeMode.dark;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF2A2A3B) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(icon, color: iconColor, size: 28),
            const SizedBox(width: 10),
            Expanded(
              child: Text(title,
                  style: TextStyle(
                      color: isDark ? Colors.white : Colors.black87,
                      fontSize: 17,
                      fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        content: Text(
          message,
          style: TextStyle(
              color: isDark ? Colors.white70 : Colors.black54,
              fontSize: 14,
              height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _imageBytes = null;
                _imageFile = null;
              });
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF6A1B9A), Color(0xFF283593)],
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text('Try Again',
                  style: TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeProvider);
    final isDark = themeMode == ThemeMode.dark;
    final bgColor = isDark ? const Color(0xFF1E1E2F) : const Color(0xFFF5F6FA);
    final textColor = isDark ? Colors.white : Colors.black87;
    final subtextColor = isDark ? Colors.white54 : Colors.black54;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('AI Skin Scanner',
            style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: textColor),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading ? _buildLoading(textColor) : _buildContent(isDark, textColor, subtextColor),
    );
  }

  Widget _buildLoading(Color textColor) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_imageBytes != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.memory(_imageBytes!,
                    height: 180, width: 180, fit: BoxFit.cover),
              ),
            ),
          const SizedBox(
            width: 60,
            height: 60,
            child: CircularProgressIndicator(
              color: Color(0xFF6A1B9A),
              strokeWidth: 3,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            _loadingMessage,
            style:
                TextStyle(color: textColor, fontSize: 16, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          Text(
            'Powered by DermaSense AI',
            style: TextStyle(color: textColor.withOpacity(0.4), fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(bool isDark, Color textColor, Color subtextColor) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Hero banner (always gradient - looks great in both modes)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF6A1B9A), Color(0xFF283593)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              children: const [
                Icon(Icons.document_scanner,
                    color: Colors.white, size: 52),
                SizedBox(height: 14),
                Text(
                  'AI Skin Disease Detection',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Text(
                  'Upload a clear photo of the affected skin area for an instant AI-powered analysis.',
                  style: TextStyle(color: Colors.white70, fontSize: 14),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),

          // Image preview
          if (_imageBytes != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.memory(_imageBytes!,
                  height: 200, width: double.infinity, fit: BoxFit.cover),
            ),
            const SizedBox(height: 24),
          ],

          // Upload buttons
          _buildScanButton(
            icon: Icons.camera_alt_rounded,
            label: 'Take a Photo',
            subtitle: 'Use your camera now',
            gradient: const [Color(0xFF6A1B9A), Color(0xFF8E24AA)],
            onPressed: () => _pickImage(ImageSource.camera),
          ),
          const SizedBox(height: 16),
          _buildScanButton(
            icon: Icons.photo_library_rounded,
            label: 'Upload from Gallery',
            subtitle: 'Choose an existing photo',
            gradient: const [Color(0xFF283593), Color(0xFF1565C0)],
            onPressed: () => _pickImage(ImageSource.gallery),
          ),
          const SizedBox(height: 32),

          // Tips card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: isDark ? Colors.white.withOpacity(0.05) : Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                  color: isDark
                      ? Colors.white.withOpacity(0.1)
                      : Colors.black.withOpacity(0.07)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '📸  Tips for Best Results',
                  style: TextStyle(
                      color: textColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 15),
                ),
                const SizedBox(height: 12),
                _Tip('Ensure good natural lighting on the area', subtextColor),
                _Tip('Hold camera still — avoid motion blur', subtextColor),
                _Tip('Capture only the affected skin region', subtextColor),
                _Tip('Avoid shadows falling on the skin', subtextColor),
                _Tip('Clean the area before scanning', subtextColor),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScanButton({
    required IconData icon,
    required String label,
    required String subtitle,
    required List<Color> gradient,
    required VoidCallback onPressed,
  }) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: LinearGradient(
              colors: gradient,
              begin: Alignment.centerLeft,
              end: Alignment.centerRight),
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: gradient.first.withOpacity(0.4),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(icon, color: Colors.white, size: 32),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold)),
                Text(subtitle,
                    style: const TextStyle(color: Colors.white70, fontSize: 13)),
              ],
            ),
            const Spacer(),
            const Icon(Icons.arrow_forward_ios,
                color: Colors.white54, size: 16),
          ],
        ),
      ),
    );
  }
}

class _Tip extends StatelessWidget {
  final String text;
  final Color textColor;
  const _Tip(this.text, this.textColor);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 6,
            height: 6,
            margin: const EdgeInsets.only(top: 6, right: 10),
            decoration: const BoxDecoration(
                color: Color(0xFF6A1B9A), shape: BoxShape.circle),
          ),
          Expanded(
            child: Text(text,
                style: TextStyle(color: textColor, fontSize: 13)),
          ),
        ],
      ),
    );
  }
}
