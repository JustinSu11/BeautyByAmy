# mobile_flutter (BeautyByAmy)

This folder contains the Flutter mobile app for BeautyByAmy. The repository
includes a mock/local-only implementation so you can develop UI and booking
flows without a backend.

Quick start (dev)

1. Copy `.env.example` to `.env` and fill placeholders.

2. Run the app (uses `lib/main_beauty.dart` entrypoint):

```bash
flutter pub get
flutter run -t lib/main_beauty.dart
```

Notes

- The app includes a mock API (`lib/services/mock_api.dart`) and mock
  notification/payment services. Replace providers in `lib/providers/providers.dart`
  to wire a real backend.
- To run unit tests:

```bash
flutter test
```

Env keys used (load via `flutter_dotenv`):

- `STRIPE_PUBLISHABLE_KEY`
- `API_BASE_URL`
- `OWNER_EMAIL`
- `OWNER_PHONE`
- `DEFAULT_OWNER_NOTIFY`

To run the app against a real backend later, implement the backend endpoints
described in `backend_specs/` and swap the `MockApi`/`MockNotificationService`
providers with real implementations.

# mobile_flutter

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
