// lib/services/version_service.dart
import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:universal_html/html.dart' as html;

// Current hardcoded version constant, must match pubspec.yaml version
const String kAppVersion = '2.0.1';
const int kAppBuild = 2;

final versionServiceProvider =
    StateNotifierProvider<VersionService, VersionState>((ref) {
  final service = VersionService();
  service.startChecking();
  return service;
});

class VersionState {
  final bool updateAvailable;
  final String currentVersion;
  final String latestVersion;

  VersionState({
    required this.updateAvailable,
    required this.currentVersion,
    required this.latestVersion,
  });

  factory VersionState.initial() => VersionState(
        updateAvailable: false,
        currentVersion: kAppVersion,
        latestVersion: kAppVersion,
      );
}

class VersionService extends StateNotifier<VersionState> {
  Timer? _timer;

  VersionService() : super(VersionState.initial());

  void startChecking() {
    // Check immediately, then check every 5 minutes
    _checkVersion();
    _timer = Timer.periodic(const Duration(minutes: 5), (_) => _checkVersion());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _checkVersion() async {
    // Version checking only applies to the deployed web application
    if (!kIsWeb) return;

    try {
      // Fetch relative to current site origin
      final origin = html.window.location.origin;
      // Prevent browser caching by appending a timestamp query parameter
      final url = Uri.parse('$origin/version.json?t=${DateTime.now().millisecondsSinceEpoch}');

      final res = await http.get(url).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        final String latestVer = data['version'] as String? ?? kAppVersion;
        final int latestBld = data['build'] as int? ?? kAppBuild;

        // Perform semantic/build comparison
        final updateNeeded = latestBld > kAppBuild || _isVersionGreater(latestVer, kAppVersion);

        if (updateNeeded) {
          state = VersionState(
            updateAvailable: true,
            currentVersion: kAppVersion,
            latestVersion: latestVer,
          );
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('[VersionService] Error checking version: $e');
      }
    }
  }

  bool _isVersionGreater(String v1, String v2) {
    try {
      final parts1 = v1.split('.').map(int.parse).toList();
      final parts2 = v2.split('.').map(int.parse).toList();

      for (int i = 0; i < parts1.length; i++) {
        if (i >= parts2.length) return true;
        if (parts1[i] > parts2[i]) return true;
        if (parts1[i] < parts2[i]) return false;
      }
      return false;
    } catch (_) {
      return v1 != v2;
    }
  }

  /// Triggers a clean reload, clears service worker caches, and reloads the page.
  Future<void> triggerUpdate() async {
    if (!kIsWeb) return;

    try {
      // 1. Unregister active service worker registrations so latest worker gets loaded immediately
      final req = await html.window.navigator.serviceWorker?.getRegistrations();
      if (req != null) {
        for (final reg in req) {
          await reg.unregister();
        }
      }
      // 2. Force browser cache reload
      html.window.location.reload();
    } catch (e) {
      // Fallback reload if SW APIs fail
      html.window.location.reload();
    }
  }
}
