import 'dart:async';

/// Notification channel interface and a simple mock implementation.
abstract class NotificationService {
  Future<void> sendSms(String to, String message);
  Future<void> sendEmail(String to, String subject, String html);
}

class MockNotificationService implements NotificationService {
  @override
  Future<void> sendEmail(String to, String subject, String html) async {
    // Mock: print masked recipient and pretend to send
    final masked = _mask(to);
    print('[MockEmail] to=$masked subject=$subject');
    await Future.delayed(const Duration(milliseconds: 200));
  }

  @override
  Future<void> sendSms(String to, String message) async {
    final masked = _mask(to);
    print(
      '[MockSMS] to=$masked message=${message.substring(0, message.length.clamp(0, 60))}',
    );
    await Future.delayed(const Duration(milliseconds: 200));
  }

  String _mask(String v) {
    if (v.contains('@')) {
      final parts = v.split('@');
      final name = parts[0];
      if (name.length <= 2) return '***@${parts[1]}';
      return '${name.substring(0, 1)}***@${parts[1]}';
    }
    if (v.length <= 4) return '***';
    return '${v.substring(0, 2)}***${v.substring(v.length - 2)}';
  }
}
