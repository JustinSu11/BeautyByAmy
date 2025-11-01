import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import '../../models/service.dart';
import '../../providers/providers.dart';

class AdminScreen extends ConsumerStatefulWidget {
  const AdminScreen({super.key});

  @override
  ConsumerState<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends ConsumerState<AdminScreen> {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();

  Future<void> _loginAsOwner() async {
    final owner = dotenv.env['OWNER_EMAIL'] ?? '';
    final email = _emailCtrl.text.trim();
    // Mock: magic link or password. On success, persist a fake token via AdminAuthNotifier
    if (email == owner) {
      // simulate magic link accepted
      await ref
          .read(adminAuthProvider.notifier)
          .login('tok_owner_${DateTime.now().millisecondsSinceEpoch}');
    } else if (email.isNotEmpty && _passwordCtrl.text == 'adminpass') {
      await ref
          .read(adminAuthProvider.notifier)
          .login('tok_admin_${DateTime.now().millisecondsSinceEpoch}');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid admin credentials')),
      );
    }
  }

  void _openCreateDialog() {
    showDialog(context: context, builder: (_) => CreateServiceDialog());
  }

  @override
  Widget build(BuildContext context) {
    final isAdmin = ref.watch(adminAuthProvider);
    if (!isAdmin) {
      return Scaffold(
        appBar: AppBar(title: const Text('Admin login')),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              TextField(
                controller: _emailCtrl,
                decoration: const InputDecoration(labelText: 'Owner email'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _passwordCtrl,
                decoration: const InputDecoration(
                  labelText: 'Password (or leave empty for magic link)',
                ),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: _loginAsOwner,
                child: const Text('Send magic link / Login'),
              ),
            ],
          ),
        ),
      );
    }

    final services = ref.watch(servicesListProvider);
    final auth = ref.read(adminAuthProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin — Services'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await auth.logout();
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Services',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                ElevatedButton(
                  onPressed: _openCreateDialog,
                  child: const Text('Add service'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.builder(
                itemCount: services.length,
                itemBuilder: (ctx, i) {
                  final s = services[i];
                  return ListTile(
                    title: Text(s.name),
                    subtitle: Text(
                      s.price == null
                          ? 'Varies • ${s.time}'
                          : '\$${s.price!.toStringAsFixed(0)} • ${s.time}',
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit),
                          onPressed: () => showDialog(
                            context: context,
                            builder: (_) => EditServiceDialog(service: s),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete),
                          onPressed: () async => await ref
                              .read(servicesListProvider.notifier)
                              .delete(s.id),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CreateServiceDialog extends ConsumerStatefulWidget {
  @override
  ConsumerState<CreateServiceDialog> createState() =>
      _CreateServiceDialogState();
}

class _CreateServiceDialogState extends ConsumerState<CreateServiceDialog> {
  final _id = TextEditingController();
  final _name = TextEditingController();
  final _price = TextEditingController();
  final _time = TextEditingController();
  bool _requiresDeposit = false;
  final _deposit = TextEditingController();

  Future<void> _create() async {
    final data = {
      'id': _id.text.trim(),
      'name': _name.text.trim(),
      'price': _price.text.isEmpty ? null : double.tryParse(_price.text),
      'time': _time.text.trim(),
      'requiresDeposit': _requiresDeposit,
      'depositAmount': _requiresDeposit
          ? double.tryParse(_deposit.text) ?? 0.0
          : null,
    };
    await ref.read(servicesListProvider.notifier).create(data);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Create Service'),
      content: SingleChildScrollView(
        child: Column(
          children: [
            TextField(
              controller: _id,
              decoration: const InputDecoration(labelText: 'ID (unique)'),
            ),
            TextField(
              controller: _name,
              decoration: const InputDecoration(labelText: 'Name'),
            ),
            TextField(
              controller: _price,
              decoration: const InputDecoration(
                labelText: 'Price (blank = varies)',
              ),
            ),
            TextField(
              controller: _time,
              decoration: const InputDecoration(
                labelText: 'Duration (e.g. 1 hr 30 mins)',
              ),
            ),
            Row(
              children: [
                const Text('Requires deposit'),
                Checkbox(
                  value: _requiresDeposit,
                  onChanged: (v) =>
                      setState(() => _requiresDeposit = v ?? false),
                ),
                if (_requiresDeposit)
                  Expanded(
                    child: TextField(
                      controller: _deposit,
                      decoration: const InputDecoration(
                        labelText: 'Deposit amount',
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(onPressed: _create, child: const Text('Create')),
      ],
    );
  }
}

class EditServiceDialog extends ConsumerStatefulWidget {
  final Service service;
  const EditServiceDialog({required this.service});

  @override
  ConsumerState<EditServiceDialog> createState() => _EditServiceDialogState();
}

class _EditServiceDialogState extends ConsumerState<EditServiceDialog> {
  late TextEditingController _name;
  late TextEditingController _price;
  late TextEditingController _time;
  bool _requiresDeposit = false;
  late TextEditingController _deposit;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.service.name);
    _price = TextEditingController(
      text: widget.service.price?.toString() ?? '',
    );
    _time = TextEditingController(text: widget.service.time);
    _requiresDeposit = widget.service.requiresDeposit;
    _deposit = TextEditingController(
      text: widget.service.depositAmount?.toString() ?? '',
    );
  }

  Future<void> _save() async {
    final data = {
      'name': _name.text.trim(),
      'price': _price.text.isEmpty ? null : double.tryParse(_price.text),
      'time': _time.text.trim(),
      'requiresDeposit': _requiresDeposit,
      'depositAmount': _requiresDeposit
          ? double.tryParse(_deposit.text) ?? 0.0
          : null,
    };
    await ref
        .read(servicesListProvider.notifier)
        .update(widget.service.id, data);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Edit Service'),
      content: SingleChildScrollView(
        child: Column(
          children: [
            TextField(controller: _name),
            TextField(controller: _price),
            TextField(controller: _time),
            Row(
              children: [
                const Text('Requires deposit'),
                Checkbox(
                  value: _requiresDeposit,
                  onChanged: (v) =>
                      setState(() => _requiresDeposit = v ?? false),
                ),
                if (_requiresDeposit)
                  Expanded(child: TextField(controller: _deposit)),
              ],
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(onPressed: _save, child: const Text('Save')),
      ],
    );
  }
}
