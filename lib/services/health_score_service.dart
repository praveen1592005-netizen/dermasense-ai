// lib/services/health_score_service.dart

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/health_score_model.dart';

final healthScoreServiceProvider = Provider<HealthScoreService>((ref) => HealthScoreService());

class HealthScoreService {
  final _db = FirebaseFirestore.instance;

  String? get _uid => FirebaseAuth.instance.currentUser?.uid;

  CollectionReference<Map<String, dynamic>>? get _scoresRef {
    final uid = _uid;
    if (uid == null) return null;
    return _db.collection('users').doc(uid).collection('health_scores');
  }

  Future<void> saveHealthScore(HealthScoreModel score) async {
    final ref = _scoresRef;
    if (ref == null) return;
    await ref.add(score.toMap());
  }

  Stream<List<HealthScoreModel>> watchHealthScores() {
    final ref = _scoresRef;
    if (ref == null) return const Stream.empty();
    return ref
        .orderBy('timestamp', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map((doc) => HealthScoreModel.fromMap(doc.data())).toList());
  }

  Future<HealthScoreModel?> getLatestHealthScore() async {
    final ref = _scoresRef;
    if (ref == null) return null;
    final snap = await ref.orderBy('timestamp', descending: true).limit(1).get();
    if (snap.docs.isEmpty) return null;
    return HealthScoreModel.fromMap(snap.docs.first.data());
  }
}

final healthScoresStreamProvider = StreamProvider<List<HealthScoreModel>>((ref) {
  return ref.watch(healthScoreServiceProvider).watchHealthScores();
});
