class Service {
  final String id;
  final String name;
  final double? price;
  final String time;
  final bool requiresDeposit;
  final double? depositAmount;

  Service({
    required this.id,
    required this.name,
    this.price,
    required this.time,
    this.requiresDeposit = false,
    this.depositAmount,
  });

  factory Service.fromMap(Map<String, dynamic> m) => Service(
    id: m['id'] as String,
    name: m['name'] as String,
    price: m['price'] == null ? null : (m['price'] as num).toDouble(),
    time: m['time'] as String,
    requiresDeposit: m['requiresDeposit'] as bool? ?? false,
    depositAmount: m['depositAmount'] == null
        ? null
        : (m['depositAmount'] as num).toDouble(),
  );

  Map<String, dynamic> toMap() => {
    'id': id,
    'name': name,
    'price': price,
    'time': time,
    'requiresDeposit': requiresDeposit,
    'depositAmount': depositAmount,
  };
}
