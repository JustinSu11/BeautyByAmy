import 'package:flutter/material.dart';

class ConfirmationScreen extends StatelessWidget {
  final Map<String, dynamic> appointment;
  const ConfirmationScreen({super.key, required this.appointment});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Confirmation')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Booking confirmed',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text('Service: ${appointment['serviceName']}'),
            Text('When: ${appointment['startDateTimeISO']}'),
            Text('Name: ${appointment['clientName']}'),
            Text('Contact: ${appointment['contact']}'),
            const SizedBox(height: 12),
            const Text('A confirmation was sent to you.'),
          ],
        ),
      ),
    );
  }
}
