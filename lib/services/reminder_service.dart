// lib/services/reminder_service.dart

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timezone/data/latest_10y.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import '../models/reminder_model.dart';

final reminderServiceProvider = Provider<ReminderService>((ref) => ReminderService());

class ReminderService {
  final _db = FirebaseFirestore.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

  String? get _uid => FirebaseAuth.instance.currentUser?.uid;

  CollectionReference<Map<String, dynamic>>? get _remindersRef {
    final uid = _uid;
    if (uid == null) return null;
    return _db.collection('users').doc(uid).collection('reminders');
  }

  ReminderService() {
    _initNotifications();
  }

  Future<void> _initNotifications() async {
    tz.initializeTimeZones();
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings();
    const initSettings = InitializationSettings(android: androidInit, iOS: iosInit);
    await _localNotifications.initialize(initSettings);
  }

  Future<void> scheduleLocalNotification(ReminderModel reminder) async {
    if (!reminder.isEnabled) {
      await _localNotifications.cancel(reminder.id.hashCode);
      return;
    }

    final now = DateTime.now();
    DateTime scheduledTime = DateTime(
      now.year,
      now.month,
      now.day,
      reminder.time.hour,
      reminder.time.minute,
    );

    if (scheduledTime.isBefore(now)) {
      scheduledTime = scheduledTime.add(const Duration(days: 1));
    }

    const androidDetails = AndroidNotificationDetails(
      'dermasense_reminders',
      'DermaSense Reminders',
      channelDescription: 'Medication, Water, and Skincare reminders',
      importance: Importance.max,
      priority: Priority.high,
    );
    const notificationDetails = NotificationDetails(android: androidDetails, iOS: DarwinNotificationDetails());

    await _localNotifications.zonedSchedule(
      reminder.id.hashCode,
      'DermaSense Pro: ${reminder.title}',
      'It is time for your ${reminder.type.toLowerCase()}!',
      tz.TZDateTime.from(scheduledTime, tz.local),
      notificationDetails,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.time,
    );
  }

  Future<void> addReminder(ReminderModel reminder) async {
    final ref = _remindersRef;
    if (ref == null) return;
    final doc = await ref.add(reminder.toMap());
    final newReminder = ReminderModel(
      id: doc.id,
      title: reminder.title,
      type: reminder.type,
      time: reminder.time,
      isEnabled: reminder.isEnabled,
      repeatDays: reminder.repeatDays,
    );
    await scheduleLocalNotification(newReminder);
  }

  Future<void> toggleReminder(String id, bool isEnabled, ReminderModel reminder) async {
    final ref = _remindersRef;
    if (ref == null) return;
    await ref.doc(id).update({'isEnabled': isEnabled});
    final updated = ReminderModel(
      id: id,
      title: reminder.title,
      type: reminder.type,
      time: reminder.time,
      isEnabled: isEnabled,
      repeatDays: reminder.repeatDays,
    );
    if (isEnabled) {
      await scheduleLocalNotification(updated);
    } else {
      await _localNotifications.cancel(id.hashCode);
    }
  }

  Future<void> deleteReminder(String id) async {
    final ref = _remindersRef;
    if (ref == null) return;
    await ref.doc(id).delete();
    await _localNotifications.cancel(id.hashCode);
  }

  Stream<List<ReminderModel>> watchReminders() {
    final ref = _remindersRef;
    if (ref == null) return const Stream.empty();
    return ref.snapshots().map((snap) => snap.docs.map((doc) => ReminderModel.fromMap(doc.data(), doc.id)).toList());
  }
}
