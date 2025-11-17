# mobile_flutter (BeautyByAmy)

This folder contains the Flutter mobile app for BeautyByAmy - a booking system for brow and lash services. This is a fully functional frontend prototype with a mock backend, perfect for demonstrating UI/UX without requiring a real backend server.

## Features

### Customer Side
- Browse available services with descriptions, prices, and durations
- Book appointments with date/time picker
- View service details including deposit requirements
- Receive booking confirmations

### Admin Side
- Secure admin login (mock authentication)
- Add new services with:
  - Name and description
  - Price (or "Varies")
  - Duration
  - Deposit requirements and amounts
- Edit existing services
- Delete services with confirmation
- View all services with full details

## Quick Start (Development)

1. Copy `.env.example` to `.env` and fill placeholders:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Run the app (uses `lib/main_beauty.dart` entrypoint):
   ```bash
   flutter run -t lib/main_beauty.dart
   # or simply
   flutter run
   ```

## Admin Access

To access the admin panel:

1. Navigate to the admin screen:
   - Tap the admin icon (⚙️) in the top-right of the landing page
   - Or navigate directly to `/admin` route

2. Login with one of these methods:
   - **Owner Email (No Password)**: 
     - Email: `admin@beautybyamy.com`
     - Password: leave blank/empty
     - Works without `.env` file (default email)
   - **Admin Password**: 
     - Email: any email address
     - Password: `adminpass`

3. Once logged in, you can:
   - View all services
   - Add new services (click "Add service" button)
   - Edit existing services (click edit icon)
   - Delete services (click delete icon with confirmation)
   - Logout (click logout icon in app bar)

## Architecture

### Mock Backend
- The app includes a mock API (`lib/services/mock_api.dart`) and mock notification/payment services
- Data is persisted locally using Hive (flutter local storage)
- Services are seeded from `lib/data/seed_services.dart` on first run
- Replace providers in `lib/providers/providers.dart` to wire a real backend

### Data Storage
- **Hive** for local data persistence (services, appointments)
- **flutter_secure_storage** for admin authentication token
- Data persists across app restarts

## Testing

To run unit tests:
```bash
flutter test
```

## Environment Variables

Env keys used (loaded via `flutter_dotenv`):

- `STRIPE_PUBLISHABLE_KEY` - Stripe key for payment processing (optional)
- `API_BASE_URL` - Backend API URL (optional, using mock API)
- `OWNER_EMAIL` - Admin email for login (default: admin@beautybyamy.com)
- `OWNER_PHONE` - Owner phone number
- `DEFAULT_OWNER_NOTIFY` - Default notification preference

## Future Backend Integration

To connect to a real backend:
1. Implement the backend endpoints described in `backend_specs/`
2. Replace `MockApi` with real API implementation in `lib/providers/providers.dart`
3. Replace `MockNotificationService` and `MockPaymentService` with real implementations
4. Update `API_BASE_URL` in .env to point to your backend

## Google Calendar Integration Note

The admin mentioned interest in Google Calendar integration for automatic appointment syncing. This can be implemented in the future by:
- Adding Google Calendar API integration to the backend
- Syncing appointments to the owner's calendar when bookings are confirmed
- This requires OAuth setup and backend support (not included in this frontend prototype)

## Notes

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
