bool isValidEmail(String s) {
  final re = RegExp(r"^[^@\s]+@[^@\s]+\.[^@\s]+$");
  return re.hasMatch(s);
}

bool isValidPhone(String s) {
  final digits = s.replaceAll(RegExp(r'[^0-9]'), '');
  return digits.length >= 7 && digits.length <= 15;
}
