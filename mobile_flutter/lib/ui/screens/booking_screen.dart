import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import '../../providers/providers.dart';

class BookingScreen extends ConsumerStatefulWidget {
  final String serviceId;
  const BookingScreen({super.key, required this.serviceId});

  @override
  ConsumerState<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends ConsumerState<BookingScreen> {
  DateTime? _selected;
  final _nameCtrl = TextEditingController();
  final _contactCtrl = TextEditingController();
  String _notify = 'sms';

  @override
  Widget build(BuildContext context) {
    final services = ref.read(servicesListProvider);
    final service = services.firstWhere((e) => e.id == widget.serviceId);
    return Scaffold(
      appBar: AppBar(title: Text('Book ${service.name}')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            ListTile(
              title: Text(service.name),
              subtitle: Text(service.time),
              trailing: Text(
                service.price == null
                    ? 'Varies'
                    : '\$${service.price!.toStringAsFixed(0)}',
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Text(
                    _selected == null
                        ? 'No date chosen'
                        : DateFormat.yMMMMd().add_jm().format(_selected!),
                  ),
                ),
                ElevatedButton(
                  onPressed: _pickDateTime,
                  child: const Text('Choose'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(labelText: 'Your name'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _contactCtrl,
              decoration: const InputDecoration(labelText: 'Email or phone'),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Text('Notify via:'),
                const SizedBox(width: 12),
                DropdownButton<String>(
                  value: _notify,
                  items: const [
                    DropdownMenuItem(value: 'sms', child: Text('SMS')),
                    DropdownMenuItem(value: 'email', child: Text('Email')),
                  ],
                  onChanged: (v) => setState(() => _notify = v!),
                ),
              ],
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: _confirm,
              child: const Text('Confirm booking'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickDateTime() async {
    final d = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (d == null) return;
    final t = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 10, minute: 0),
    );
    if (t == null) return;
    setState(() {
      _selected = DateTime(d.year, d.month, d.day, t.hour, t.minute);
    });
  }

  Future<void> _confirm() async {
    if (_selected == null ||
        _nameCtrl.text.isEmpty ||
        _contactCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all fields')),
      );
      return;
    }
    final services = ref.read(servicesListProvider);
    final service = services.firstWhere((e) => e.id == widget.serviceId);

    final draft = {
      'serviceId': service.id,
      'serviceName': service.name,
      'startDateTimeISO': _selected!.toIso8601String(),
      'clientName': _nameCtrl.text,
      'contact': _contactCtrl.text,
      'notifyPref': _notify,
      'depositAmount': service.requiresDeposit
          ? service.depositAmount ?? 0.0
          : null,
      'status': 'pending',
    };

    await ref.read(appointmentsProvider.notifier).add(draft);
    // Use GoRouter to navigate and replace history
    context.go('/confirmation', extra: draft);
  }
}
