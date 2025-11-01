import 'dart:async';

/// Thin PaymentService interface. In production this will call the backend
/// endpoint POST /payments/create-intent and return a clientSecret string.
abstract class PaymentService {
  /// Create a payment intent for [amount] (in cents) and return client secret.
  Future<String> createPaymentIntent({
    required int amount,
    required String currency,
    Map<String, dynamic>? metadata,
  });

  /// Confirmation will be handled via Stripe SDK in-app (not implemented here).
}

class MockPaymentService implements PaymentService {
  @override
  Future<String> createPaymentIntent({
    required int amount,
    required String currency,
    Map<String, dynamic>? metadata,
  }) async {
    // Return a fake client secret for development/testing.
    await Future.delayed(const Duration(milliseconds: 300));
    return 'pi_fake_client_secret_${DateTime.now().millisecondsSinceEpoch}';
  }
}
