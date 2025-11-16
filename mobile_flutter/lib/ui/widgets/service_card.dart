import 'package:flutter/material.dart';

class ServiceCard extends StatelessWidget {
  final String name;
  final String subtitle;
  final String price;
  final String? description;
  final VoidCallback? onTap;
  final bool depositRequired;

  const ServiceCard({
    super.key,
    required this.name,
    required this.subtitle,
    required this.price,
    this.description,
    this.onTap,
    this.depositRequired = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    color: Colors.pink.shade50,
                  ),
                  child: Center(
                    child: Icon(
                      Icons.spa,
                      size: 48,
                      color: Colors.pink.shade200,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(name, style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 4),
              if (description != null && description!.isNotEmpty) ...[
                Text(
                  description!,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 11, color: Colors.black54),
                ),
                const SizedBox(height: 4),
              ],
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(subtitle, style: const TextStyle(color: Colors.black54)),
                  Row(
                    children: [
                      if (depositRequired)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.orange.shade100,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'Deposit',
                            style: TextStyle(fontSize: 12),
                          ),
                        ),
                      const SizedBox(width: 8),
                      Text(
                        price,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
