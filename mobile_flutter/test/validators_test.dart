import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_flutter/utils/validators.dart';

void main() {
  test('valid email', () {
    expect(isValidEmail('a@b.com'), isTrue);
    expect(isValidEmail('not-an-email'), isFalse);
  });

  test('valid phone', () {
    expect(isValidPhone('+1 (555) 123-4567'), isTrue);
    expect(isValidPhone('123'), isFalse);
  });
}
