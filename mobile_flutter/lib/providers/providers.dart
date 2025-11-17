import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/service.dart';
import '../models/appointment.dart';
import '../services/mock_api.dart';
import '../services/notification_service.dart';
import '../services/payment_service.dart';
import '../services/persistence.dart';

final mockApiProvider = Provider<MockApi>((ref) => MockApi());

final notificationProvider = Provider<NotificationService>(
  (ref) => MockNotificationService(),
);

final paymentProvider = Provider<PaymentService>((ref) => MockPaymentService());

// Admin auth provider: uses secure storage via Persistence to persist a token.
class AdminAuthNotifier extends StateNotifier<bool> {
  AdminAuthNotifier() : super(false) {
    _init();
  }

  Future<void> _init() async {
    print('[AdminAuthNotifier] Initializing...');
    final token = await Persistence.readAdminToken();
    print('[AdminAuthNotifier] Read token: ${token != null ? "exists" : "null"}');
    state = token != null;
    print('[AdminAuthNotifier] Initial state set to: $state');
  }

  Future<void> login(String token) async {
    print('[AdminAuthNotifier] Login called with token: $token');
    await Persistence.saveAdminToken(token);
    state = true;
    print('[AdminAuthNotifier] State set to true, current state: $state');
  }

  Future<void> logout() async {
    print('[AdminAuthNotifier] Logout called');
    await Persistence.deleteAdminToken();
    state = false;
    print('[AdminAuthNotifier] State set to false');
  }
}

final adminAuthProvider = StateNotifierProvider<AdminAuthNotifier, bool>(
  (ref) => AdminAuthNotifier(),
);

final servicesListProvider =
    StateNotifierProvider<ServiceListNotifier, List<Service>>((ref) {
      final api = ref.watch(mockApiProvider);
      return ServiceListNotifier(api);
    });

final appointmentsProvider =
    StateNotifierProvider<_AppointmentListNotifier, List<Appointment>>((ref) {
      final api = ref.watch(mockApiProvider);
      return _AppointmentListNotifier(api);
    });

class ServiceListNotifier extends StateNotifier<List<Service>> {
  final MockApi api;
  ServiceListNotifier(this.api) : super([]) {
    _load();
  }

  Future<void> _load() async {
    state = await api.getServices();
  }

  Future<void> create(Map<String, dynamic> data) async {
    final s = await api.createService(data);
    state = [...state, s];
  }

  Future<void> update(String id, Map<String, dynamic> data) async {
    final s = await api.updateService(id, data);
    if (s == null) return;
    state = [
      for (final item in state)
        if (item.id == id) s else item,
    ];
  }

  Future<void> delete(String id) async {
    final ok = await api.deleteService(id);
    if (!ok) return;
    state = state.where((s) => s.id != id).toList();
  }
}

class _AppointmentListNotifier extends StateNotifier<List<Appointment>> {
  final MockApi api;
  _AppointmentListNotifier(this.api) : super([]) {
    _load();
  }

  Future<void> _load() async {
    state = await api.listAppointments();
  }

  Future<void> add(Map<String, dynamic> draft) async {
    final appt = await api.createAppointment(draft);
    state = [...state, appt];
  }

  Future<void> refresh() async => _load();
}
