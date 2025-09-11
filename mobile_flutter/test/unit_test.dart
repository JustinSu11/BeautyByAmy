import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_flutter/main.dart';

void main() {
  group('Iseven group', () {
    test('Is Even', () {
      bool result = isEven(26);
      expect(result, true);
    });
    test('Is Odd', () {
      bool result = isEven(1999);
      expect(result, false);
    });
  });
}