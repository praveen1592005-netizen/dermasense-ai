// lib/screens/scan_screen.dart
import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';
import '../services/firestore_service.dart';
import '../models/health_score_model.dart';
import '../services/health_score_service.dart';
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
      await _runPrediction(bytes);
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

  Future<void> _runPrediction(Uint8List bytes) async {
    setState(() {
      _isLoading = true;
      _loadingMessage = 'Processing image...';
    });
    try {
      final base64Img = base64Encode(bytes);
      setState(() => _loadingMessage = 'AI is analyzing the skin condition...');
      final api = ref.read(apiClientProvider);
      final response = await api.predict(base64Img);
      // Save result so SkincareScreen shows personalized content
      ref.read(lastScanResultProvider.notifier).state = response;

      // Persist to Firestore (non-blocking — don't prevent result screen)
      try {
        setState(() => _loadingMessage = 'Saving to history...');
        await ref.read(firestoreServiceProvider).saveScan(
          prediction: response,
          imageBytes: bytes,
        );
        // Calculate and Save Skin Health Score
        final score = HealthScoreModel.fromPrediction(response);
        await ref.read(healthScoreServiceProvider).saveHealthScore(score);
      } catch (_) {
        // Firestore save failed (user not logged in / permissions) — continue
      }

      setState(() => _loadingMessage = 'Generating recommendations...');
      await Future.delayed(const Duration(milliseconds: 300));
      if (!mounted) return;
      Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => ResultScreen(prediction: response, imageBytes: bytes),
      ));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Analysis failed: $e'),
          backgroundColor: Colors.redAccent,
        ),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('AI Skin Scanner',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading ? _buildLoading() : _buildContent(),
    );
  }

  Widget _buildLoading() {
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
                const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          const Text(
            'Powered by DermaSense AI',
            style: TextStyle(color: Colors.white38, fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Hero banner
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
              children: [
                const Icon(Icons.document_scanner,
                    color: Colors.white, size: 52),
                const SizedBox(height: 14),
                const Text(
                  'AI Skin Disease Detection',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
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
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  '📸  Tips for Best Results',
                  style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15),
                ),
                SizedBox(height: 12),
                _Tip('Ensure good natural lighting on the area'),
                _Tip('Hold camera still — avoid motion blur'),
                _Tip('Capture only the affected skin region'),
                _Tip('Avoid shadows falling on the skin'),
                _Tip('Clean the area before scanning'),
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
  const _Tip(this.text);

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
                style:
                    const TextStyle(color: Colors.white70, fontSize: 13)),
          ),
        ],
      ),
    );
  }
}
