import 'dart:async';
import 'dart:math';

import '../models/appointment.dart';
import '../models/service.dart';
import 'persistence.dart';

/// A small mock API backed by Hive persistence during development.
class MockApi {
  MockApi();

  // ----- Services CRUD -----
  Future<Service> createService(Map<String, dynamic> data) async {
    final s = Service.fromMap(Map<String, dynamic>.from(data));
    final box = Persistence.servicesBox;
    if (box.containsKey(s.id)) throw Exception('service id exists');
    await Future.delayed(const Duration(milliseconds: 150));
    await Persistence.saveService(s.toMap());
    return s;
  }

  Future<Service?> updateService(String id, Map<String, dynamic> data) async {
    final box = Persistence.servicesBox;
    if (!box.containsKey(id)) return null;
    final existing = Map<String, dynamic>.from(box.get(id) as Map);
    final merged = {...existing, ...data};
    final s = Service.fromMap(merged);
    await Future.delayed(const Duration(milliseconds: 150));
    await Persistence.saveService(merged);
    return s;
  }

  Future<bool> deleteService(String id) async {
    final ok = await Persistence.deleteService(id);
    await Future.delayed(const Duration(milliseconds: 100));
    return ok;
  }

  Future<List<Service>> getServices() async {
    await Future.delayed(const Duration(milliseconds: 200));
    final list = Persistence.listServices();
    return List.unmodifiable(list.map((m) => Service.fromMap(m)).toList());
  }

  Future<Service?> getService(String id) async {
    final box = Persistence.servicesBox;
    if (!box.containsKey(id)) return null;
    final m = Map<String, dynamic>.from(box.get(id) as Map);
    return Service.fromMap(m);
  }

  Future<Appointment> createAppointment(Map<String, dynamic> draft) async {
    // create id
    final id = 'apt_${Random().nextInt(999999)}';
    final apptMap = {'id': id, ...draft};
    final appt = Appointment.fromMap(Map<String, dynamic>.from(apptMap));
    await Persistence.saveAppointment(appt.toMap());
    await Future.delayed(const Duration(milliseconds: 200));
    return appt;
  }

  Future<List<Appointment>> listAppointments() async {
    await Future.delayed(const Duration(milliseconds: 150));
    final list = Persistence.listAppointments();
    return List.unmodifiable(list.map((m) => Appointment.fromMap(m)).toList());
  }

  Future<bool> updateAppointmentStatus(String id, String status) async {
    final box = Persistence.appointmentsBox;
    if (!box.containsKey(id)) return false;
    final existing = Map<String, dynamic>.from(box.get(id) as Map);
    existing['status'] = status;
    await Persistence.saveAppointment(existing);
    return true;
  }

  /// Purge appointments older than [days]
  Future<int> purgeAppointments(int days) async {
    return await Persistence.purgeAppointments(days);
  }
}
