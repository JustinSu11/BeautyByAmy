import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/providers.dart';
import '../widgets/service_card.dart';

class ServiceListScreen extends ConsumerWidget {
  const ServiceListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final services = ref.watch(servicesListProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Services')),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: GridView.builder(
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.8,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: services.length,
          itemBuilder: (ctx, i) {
            final s = services[i];
            return ServiceCard(
              name: s.name,
              subtitle: s.time,
              description: s.description,
              price: s.price == null
                  ? 'Varies'
                  : '\$${s.price!.toStringAsFixed(0)}',
              depositRequired: s.requiresDeposit,
              onTap: () {
                context.push('/services/${s.id}');
              },
            );
          },
        ),
      ),
    );
  }
}
