// lib/services/firestore_service.dart
import 'dart:convert';
import 'dart:typed_data';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final firestoreServiceProvider = Provider<FirestoreService>((ref) => FirestoreService());

class FirestoreService {
  final _db = FirebaseFirestore.instance;

  String? get _uid => FirebaseAuth.instance.currentUser?.uid;

  CollectionReference<Map<String, dynamic>>? get _scansRef {
    final uid = _uid;
    if (uid == null) return null;
    return _db.collection('users').doc(uid).collection('scans');
  }

  /// Save a new scan result to Firestore.
  Future<String?> saveScan({
    required Map<String, dynamic> prediction,
    Uint8List? imageBytes,
  }) async {
    final ref = _scansRef;
    if (ref == null) return null;
    try {
      final data = <String, dynamic>{
        'disease': prediction['disease'] ?? 'Unknown',
        'confidence': prediction['confidence'] ?? 0.0,
        'severity': prediction['severity'] ?? '',
        'risk': prediction['risk'] ?? '',
        'explanation': prediction['explanation'] ?? '',
        'treatment': prediction['treatment'] ?? '',
        'skincare': prediction['skincare'] ?? [],
        'urgency': prediction['urgency'] ?? '',
        'needsDoctor': prediction['needsDoctor'] ?? false,
        'colorHex': prediction['colorHex'] ?? '0xFF8E24AA',
        'timestamp': FieldValue.serverTimestamp(),
        'imageBase64': imageBytes != null ? base64Encode(imageBytes) : null,
      };
      final docRef = await ref.add(data);
      return docRef.id;
    } catch (e) {
      return null;
    }
  }

  /// Stream all scans for the current user, ordered by time descending.
  Stream<List<ScanRecord>> watchScans() {
    final ref = _scansRef;
    if (ref == null) return const Stream.empty();
    return ref
        .orderBy('timestamp', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map(ScanRecord.fromDoc).toList());
  }

  /// Delete a scan by document ID.
  Future<void> deleteScan(String docId) async {
    await _scansRef?.doc(docId).delete();
  }

  /// Get total scans count for the current user.
  Future<int> getScanCount() async {
    final ref = _scansRef;
    if (ref == null) return 0;
    final snap = await ref.count().get();
    return snap.count ?? 0;
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  /// Get aggregate stats across ALL users (admin only — requires Firestore rules).
  Future<Map<String, dynamic>> getAdminStats() async {
    try {
      // Count all users (collection group query)
      final usersSnap = await _db.collection('users').get();
      final userCount = usersSnap.docs.length;

      // Collect all scans via collection group
      final allScans = await _db.collectionGroup('scans').get();
      final totalScans = allScans.docs.length;

      // Disease frequency map
      final Map<String, int> diseaseCounts = {};
      for (final doc in allScans.docs) {
        final d = doc.data()['disease'] as String? ?? 'Unknown';
        diseaseCounts[d] = (diseaseCounts[d] ?? 0) + 1;
      }

      return {
        'userCount': userCount,
        'totalScans': totalScans,
        'diseaseCounts': diseaseCounts,
      };
    } catch (_) {
      return {'userCount': 0, 'totalScans': 0, 'diseaseCounts': <String, int>{}};
    }
  }
}

class ScanRecord {
  final String id;
  final String disease;
  final double confidence;
  final String severity;
  final String risk;
  final String explanation;
  final String treatment;
  final List<String> skincare;
  final String urgency;
  final bool needsDoctor;
  final String colorHex;
  final DateTime? timestamp;
  final String? imageBase64;

  const ScanRecord({
    required this.id,
    required this.disease,
    required this.confidence,
    required this.severity,
    required this.risk,
    required this.explanation,
    required this.treatment,
    required this.skincare,
    required this.urgency,
    required this.needsDoctor,
    required this.colorHex,
    this.timestamp,
    this.imageBase64,
  });

  factory ScanRecord.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data()!;
    return ScanRecord(
      id: doc.id,
      disease: d['disease'] as String? ?? 'Unknown',
      confidence: (d['confidence'] as num?)?.toDouble() ?? 0.0,
      severity: d['severity'] as String? ?? '',
      risk: d['risk'] as String? ?? '',
      explanation: d['explanation'] as String? ?? '',
      treatment: d['treatment'] as String? ?? '',
      skincare: (d['skincare'] as List?)?.cast<String>() ?? [],
      urgency: d['urgency'] as String? ?? '',
      needsDoctor: d['needsDoctor'] as bool? ?? false,
      colorHex: d['colorHex'] as String? ?? '0xFF8E24AA',
      timestamp: (d['timestamp'] as Timestamp?)?.toDate(),
      imageBase64: d['imageBase64'] as String?,
    );
  }

  Map<String, dynamic> toPredictionMap() => {
        'disease': disease,
        'confidence': confidence,
        'severity': severity,
        'risk': risk,
        'explanation': explanation,
        'treatment': treatment,
        'skincare': skincare,
        'urgency': urgency,
        'needsDoctor': needsDoctor,
        'colorHex': colorHex,
      };

  Uint8List? get imageBytes {
    if (imageBase64 == null || imageBase64!.isEmpty) return null;
    try {
      return base64Decode(imageBase64!);
    } catch (_) {
      return null;
    }
  }
}
