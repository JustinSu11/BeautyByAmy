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
  bool _isLoading = false;

  Future<void> _loginAsOwner() async {
    if (_isLoading) {
      print('[AdminScreen] Login already in progress, ignoring');
      return;
    }
    
    print('[AdminScreen] ===== LOGIN STARTED =====');
    setState(() => _isLoading = true);
    
    try {
      final owner = dotenv.env['OWNER_EMAIL'] ?? 'admin@beautybyamy.com';
      final email = _emailCtrl.text.trim();
      final password = _passwordCtrl.text;
      
      print('[AdminScreen] Login attempt:');
      print('  - Email entered: "$email"');
      print('  - Owner email: "$owner"');
      print('  - Password empty: ${password.isEmpty}');
      print('  - Password value: "${password.isEmpty ? "(empty)" : "(has value)"}"');
      print('  - Email matches owner: ${email == owner}');
      
      // Add a small delay to ensure UI updates
      await Future.delayed(const Duration(milliseconds: 100));
      
      // Mock: magic link or password. On success, persist a fake token via AdminAuthNotifier
      if (email.isNotEmpty && (email == owner && password.isEmpty)) {
        // simulate magic link accepted (owner email without password)
        print('[AdminScreen] ✅ Owner login successful (email match, no password)');
        
        await ref
            .read(adminAuthProvider.notifier)
            .login('tok_owner_${DateTime.now().millisecondsSinceEpoch}');
        
        print('[AdminScreen] Token saved, showing success message');
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Login successful! Loading dashboard...'),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 2),
            ),
          );
        }
      } else if (email.isNotEmpty && password == 'adminpass') {
        // password-based login (any email with correct password)
        print('[AdminScreen] ✅ Admin password login successful');
        
        await ref
            .read(adminAuthProvider.notifier)
            .login('tok_admin_${DateTime.now().millisecondsSinceEpoch}');
        
        print('[AdminScreen] Token saved, showing success message');
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Login successful! Loading dashboard...'),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 2),
            ),
          );
        }
      } else {
        print('[AdminScreen] ❌ Login failed - invalid credentials');
        print('  - Reason: ${email.isEmpty ? "Email is empty" : "Credentials do not match"}');
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                email.isEmpty 
                  ? 'Please enter an email address'
                  : 'Invalid credentials. Please check your email and password.'
              ),
              backgroundColor: Colors.red,
              duration: const Duration(seconds: 4),
            ),
          );
        }
      }
    } catch (e, stackTrace) {
      print('[AdminScreen] ❌ ERROR during login: $e');
      print('[AdminScreen] Stack trace: $stackTrace');
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Login error: $e'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    } finally {
      print('[AdminScreen] ===== LOGIN ENDED =====');
      if (mounted) {
        setState(() => _isLoading = false);
      }
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
        appBar: AppBar(title: const Text('Admin Login')),
        body: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(
                  Icons.admin_panel_settings,
                  size: 80,
                  color: Colors.pink,
                ),
                const SizedBox(height: 24),
                const Text(
                  'Administrator Access',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                TextField(
                  controller: _emailCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.email),
                  ),
                  keyboardType: TextInputType.emailAddress,
                  enabled: !_isLoading,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _passwordCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.lock),
                  ),
                  obscureText: true,
                  enabled: !_isLoading,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _loginAsOwner,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isLoading
                      ? const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            ),
                            SizedBox(width: 12),
                            Text('Logging in...'),
                          ],
                        )
                      : const Text(
                          'Login',
                          style: TextStyle(fontSize: 16),
                        ),
                ),
                if (_isLoading) ...[
                  const SizedBox(height: 16),
                  const Text(
                    'Authenticating...',
                    style: TextStyle(color: Colors.grey),
                    textAlign: TextAlign.center,
                  ),
                ],
              ],
            ),
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
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      title: Text(s.name),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (s.description != null && s.description!.isNotEmpty)
                            Text(
                              s.description!,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 12),
                            ),
                          const SizedBox(height: 4),
                          Text(
                            s.price == null
                                ? 'Varies • ${s.time}'
                                : '\$${s.price!.toStringAsFixed(0)} • ${s.time}',
                            style: const TextStyle(fontWeight: FontWeight.w500),
                          ),
                          if (s.requiresDeposit)
                            Text(
                              'Deposit: \$${s.depositAmount?.toStringAsFixed(0) ?? '0'}',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.orange.shade700,
                              ),
                            ),
                        ],
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
                            onPressed: () async {
                              final confirmed = await showDialog<bool>(
                                context: context,
                                builder: (ctx) => AlertDialog(
                                  title: const Text('Delete Service'),
                                  content: Text('Delete "${s.name}"?'),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(ctx, false),
                                      child: const Text('Cancel'),
                                    ),
                                    ElevatedButton(
                                      onPressed: () => Navigator.pop(ctx, true),
                                      child: const Text('Delete'),
                                    ),
                                  ],
                                ),
                              );
                              if (confirmed == true) {
                                await ref
                                    .read(servicesListProvider.notifier)
                                    .delete(s.id);
                              }
                            },
                          ),
                        ],
                      ),
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
  final _description = TextEditingController();
  final _price = TextEditingController();
  final _time = TextEditingController();
  bool _requiresDeposit = false;
  final _deposit = TextEditingController();

  Future<void> _create() async {
    final data = {
      'id': _id.text.trim(),
      'name': _name.text.trim(),
      'description': _description.text.trim().isEmpty ? null : _description.text.trim(),
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
              controller: _description,
              decoration: const InputDecoration(labelText: 'Description (optional)'),
              maxLines: 3,
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
  late TextEditingController _description;
  late TextEditingController _price;
  late TextEditingController _time;
  bool _requiresDeposit = false;
  late TextEditingController _deposit;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.service.name);
    _description = TextEditingController(text: widget.service.description ?? '');
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
      'description': _description.text.trim().isEmpty ? null : _description.text.trim(),
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
            TextField(
              controller: _description,
              decoration: const InputDecoration(labelText: 'Description'),
              maxLines: 3,
            ),
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
