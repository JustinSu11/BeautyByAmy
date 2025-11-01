import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'ui/theme.dart';
import 'ui/screens/landing_screen.dart';
import 'ui/screens/service_list_screen.dart';
import 'ui/screens/booking_screen.dart';
import 'ui/screens/confirmation_screen.dart';
import 'ui/screens/admin_screen.dart';
import 'services/persistence.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Add basic logging to help diagnose a hang during startup.
  print('[main] starting app initialization');

  try {
    print('[main] loading .env');
    await dotenv.load();
    print('[main] .env loaded');
  } catch (e, st) {
    // Continue — .env may be missing in dev; log error
    print('[main] dotenv.load() failed: $e\n$st');
  }

  var persistenceOk = false;
  try {
    print('[main] initializing Persistence (Hive) with 10s timeout');
    // Use a timeout so we don't block forever if filesystem/device has issues
    await Persistence.init().timeout(const Duration(seconds: 10));
    persistenceOk = true;
    print('[main] Persistence initialized successfully');
  } on TimeoutException catch (e) {
    print('[main] Persistence.init() timed out: $e');
  } catch (e, st) {
    print('[main] Persistence.init() failed: $e\n$st');
  }

  // Run the app regardless; the UI will show an error if persistence failed.
  runApp(ProviderScope(child: BeautyApp(persistenceOk: persistenceOk)));
}

class BeautyApp extends StatelessWidget {
  final bool persistenceOk;

  const BeautyApp({super.key, this.persistenceOk = true});

  @override
  Widget build(BuildContext context) {
    final router = GoRouter(
      routes: [
        GoRoute(path: '/', builder: (ctx, state) => const LandingScreen()),
        GoRoute(
          path: '/services',
          builder: (ctx, state) => const ServiceListScreen(),
        ),
        GoRoute(
          path: '/services/:id',
          builder: (ctx, state) =>
              BookingScreen(serviceId: state.pathParameters['id']!),
        ),
        GoRoute(
          path: '/confirmation',
          builder: (ctx, state) => ConfirmationScreen(
            appointment: state.extra as Map<String, dynamic>,
          ),
        ),
        GoRoute(path: '/admin', builder: (ctx, state) => const AdminScreen()),
      ],
    );

    return MaterialApp.router(
      title: 'BeautyByAmy',
      theme: BeautyTheme,
      routerConfig: router,
      builder: (context, child) {
        // If persistence failed, show a diagnostic page instead of the app router.
        if (!persistenceOk) {
          return Scaffold(
            appBar: AppBar(title: const Text('Initialization error')),
            body: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('The app failed to initialize local storage (Hive).'),
                  SizedBox(height: 8),
                  Text(
                    'Check device storage permissions and logs in the terminal.',
                  ),
                ],
              ),
            ),
          );
        }
        return child!;
      },
    );
  }
}
