import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/providers.dart';
import '../widgets/service_card.dart';

class LandingScreen extends ConsumerWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final services = ref.watch(servicesListProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Beauty By Amy')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Welcome',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text('Choose a service and book your appointment.'),
            const SizedBox(height: 16),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () => context.push('/services'),
                child: const Text('See all services'),
              ),
            ),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.8,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: services.length > 6 ? 6 : services.length,
                itemBuilder: (ctx, i) {
                  final s = services[i];
                  return ServiceCard(
                    name: s.name,
                    subtitle: s.time,
                    price: s.price == null
                        ? 'Varies'
                        : '\$${s.price!.toStringAsFixed(0)}',
                    depositRequired: s.requiresDeposit,
                    onTap: () {
                      // Use GoRouter for navigation
                      context.push('/services/${s.id}');
                    },
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
