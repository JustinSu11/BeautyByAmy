import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../data/seed_services.dart';

/// Lightweight persistence helper using Hive for simple offline caching.
/// Stores raw maps for services and appointments (no codegen adapters).
class Persistence {
  static const _servicesBox = 'services';
  static const _appointmentsBox = 'appointments';
  static const _notificationsBox = 'notifications';
  static const _metaBox = 'meta';

  static final _secure = FlutterSecureStorage();

  /// Initialize Hive and open boxes. Seeds `services` if empty using `SERVICES`.
  static Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(_servicesBox);
    await Hive.openBox(_appointmentsBox);
    await Hive.openBox(_notificationsBox);
    await Hive.openBox(_metaBox);

    final services = Hive.box(_servicesBox);
    if (services.isEmpty) {
      for (final m in SERVICES) {
        // Ensure map is a simple Map<String, dynamic>
        services.put(m['id'] as String, Map<String, dynamic>.from(m));
      }
    }
  }

  // Boxes getters
  static Box get servicesBox => Hive.box(_servicesBox);
  static Box get appointmentsBox => Hive.box(_appointmentsBox);
  static Box get notificationsBox => Hive.box(_notificationsBox);
  static Box get metaBox => Hive.box(_metaBox);

  // Service helpers
  static List<Map<String, dynamic>> listServices() => servicesBox.values
      .cast<Map>()
      .map((e) => Map<String, dynamic>.from(e))
      .toList();
  static Future<void> saveService(Map<String, dynamic> service) async =>
      servicesBox.put(
        service['id'] as String,
        Map<String, dynamic>.from(service),
      );
  static Future<bool> deleteService(String id) async {
    if (!servicesBox.containsKey(id)) return false;
    await servicesBox.delete(id);
    return true;
  }

  // Appointment helpers
  static List<Map<String, dynamic>> listAppointments() => appointmentsBox.values
      .cast<Map>()
      .map((e) => Map<String, dynamic>.from(e))
      .toList();
  static Future<void> saveAppointment(Map<String, dynamic> appt) async =>
      appointmentsBox.put(
        appt['id'] as String,
        Map<String, dynamic>.from(appt),
      );
  static Future<bool> deleteAppointment(String id) async {
    if (!appointmentsBox.containsKey(id)) return false;
    await appointmentsBox.delete(id);
    return true;
  }

  static Future<int> purgeAppointments(int days) async {
    final cutoff = DateTime.now().subtract(Duration(days: days));
    final keysToRemove = <dynamic>[];
    for (final key in appointmentsBox.keys) {
      final Map m = appointmentsBox.get(key) as Map;
      final iso = m['startDateTimeISO'] as String?;
      if (iso == null) continue;
      try {
        final dt = DateTime.parse(iso);
        if (dt.isBefore(cutoff)) keysToRemove.add(key);
      } catch (_) {}
    }
    for (final k in keysToRemove) await appointmentsBox.delete(k);
    return appointmentsBox.length;
  }

  // Notification queue helpers
  static List<Map<String, dynamic>> listNotifications() => notificationsBox
      .values
      .cast<Map>()
      .map((e) => Map<String, dynamic>.from(e))
      .toList();
  static Future<void> enqueueNotification(
    String id,
    Map<String, dynamic> payload,
  ) async => notificationsBox.put(id, Map<String, dynamic>.from(payload));
  static Future<void> removeNotification(String id) async =>
      notificationsBox.delete(id);

  // Admin token helpers (secure)
  static Future<void> saveAdminToken(String token) async =>
      _secure.write(key: 'admin_token', value: token);
  static Future<String?> readAdminToken() async =>
      _secure.read(key: 'admin_token');
  static Future<void> deleteAdminToken() async =>
      _secure.delete(key: 'admin_token');
}
