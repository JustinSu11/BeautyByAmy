class Appointment {
  final String id;
  final String serviceId;
  final String serviceName;
  final String startDateTimeISO;
  final String clientName;
  final String contact; // email or phone
  final String notifyPref; // 'sms'|'email'
  final double? depositAmount;
  final String? paymentIntentId;
  final String status; // 'pending'|'confirmed'|'canceled'

  Appointment({
    required this.id,
    required this.serviceId,
    required this.serviceName,
    required this.startDateTimeISO,
    required this.clientName,
    required this.contact,
    this.notifyPref = 'sms',
    this.depositAmount,
    this.paymentIntentId,
    this.status = 'pending',
  });

  factory Appointment.fromMap(Map<String, dynamic> m) => Appointment(
    id: m['id'] as String,
    serviceId: m['serviceId'] as String,
    serviceName: m['serviceName'] as String,
    startDateTimeISO: m['startDateTimeISO'] as String,
    clientName: m['clientName'] as String,
    contact: m['contact'] as String,
    notifyPref: m['notifyPref'] as String? ?? 'sms',
    depositAmount: m['depositAmount'] == null
        ? null
        : (m['depositAmount'] as num).toDouble(),
    paymentIntentId: m['paymentIntentId'] as String?,
    status: m['status'] as String? ?? 'pending',
  );

  Map<String, dynamic> toMap() => {
    'id': id,
    'serviceId': serviceId,
    'serviceName': serviceName,
    'startDateTimeISO': startDateTimeISO,
    'clientName': clientName,
    'contact': contact,
    'notifyPref': notifyPref,
    'depositAmount': depositAmount,
    'paymentIntentId': paymentIntentId,
    'status': status,
  };
}
