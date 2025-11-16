# App Structure and Navigation Flow

## Screen Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Landing Screen                          │
│  - Welcome message                                           │
│  - Featured services (6 cards with descriptions)            │
│  - "See all services" button                                │
│  - Admin button (⚙️) in app bar                             │
└──────┬──────────────────────────┬────────────────────┬──────┘
       │                          │                     │
       │ Tap service              │ Tap "See all"      │ Tap admin
       │                          │                     │
       ▼                          ▼                     ▼
┌──────────────┐        ┌──────────────────┐    ┌────────────────┐
│   Booking    │        │  Service List    │    │  Admin Login   │
│   Screen     │        │  Screen          │    │  Screen        │
│              │        │                  │    │                │
│ - Service    │◄───────│ - All 31 svcs   │    │ - Email input  │
│   details    │  Tap   │ - Grid layout   │    │ - Password     │
│ - Description│  card  │ - Descriptions  │    │ - Login btn    │
│ - Date/time  │        │                  │    └───────┬────────┘
│ - Contact    │        └──────────────────┘            │
│ - Confirm    │                                         │ Login success
└───────┬──────┘                                         │
        │                                                ▼
        │ Confirm booking                    ┌──────────────────────┐
        │                                    │   Admin Dashboard    │
        ▼                                    │                      │
┌──────────────────┐                        │ - Services list      │
│  Confirmation    │                        │ - Add service btn    │
│  Screen          │                        │ - Edit/Delete btns   │
│                  │                        │ - Logout btn         │
│ - Details shown  │                        └──────────┬───────────┘
│ - Appointment    │                                   │
│   confirmed      │                                   │ Add/Edit
└──────────────────┘                                   │
                                                       ▼
                                            ┌──────────────────────┐
                                            │ Create/Edit Dialog   │
                                            │                      │
                                            │ - ID                 │
                                            │ - Name               │
                                            │ - Description        │
                                            │ - Price              │
                                            │ - Duration           │
                                            │ - Deposit checkbox   │
                                            │ - Deposit amount     │
                                            │ - Save/Cancel btns   │
                                            └──────────────────────┘
```

## Directory Structure

```
mobile_flutter/
├── lib/
│   ├── main.dart                      # Entry point (delegates to main_beauty.dart)
│   ├── main_beauty.dart               # App initialization & routing
│   │
│   ├── models/                        # Data models
│   │   ├── service.dart               # Service model (with description)
│   │   └── appointment.dart           # Appointment model
│   │
│   ├── providers/                     # State management (Riverpod)
│   │   └── providers.dart             # All app providers
│   │
│   ├── services/                      # Business logic
│   │   ├── mock_api.dart              # Mock backend API
│   │   ├── persistence.dart           # Hive storage wrapper
│   │   ├── notification_service.dart  # Mock notifications
│   │   └── payment_service.dart       # Mock payments
│   │
│   ├── ui/
│   │   ├── theme.dart                 # App theme (pink/beauty colors)
│   │   │
│   │   ├── screens/                   # App screens
│   │   │   ├── landing_screen.dart    # Home page
│   │   │   ├── service_list_screen.dart # All services
│   │   │   ├── booking_screen.dart    # Book appointment
│   │   │   ├── confirmation_screen.dart # Booking confirmed
│   │   │   └── admin_screen.dart      # Admin panel
│   │   │
│   │   └── widgets/                   # Reusable components
│   │       └── service_card.dart      # Service display card
│   │
│   ├── data/
│   │   └── seed_services.dart         # Initial 31 services
│   │
│   └── utils/
│       └── validators.dart            # Input validation
│
├── test/                               # Unit tests
├── android/                            # Android native code
├── ios/                                # iOS native code
├── web/                                # Web support
│
├── pubspec.yaml                        # Dependencies
├── analysis_options.yaml               # Dart linting rules
├── .env.example                        # Environment template
├── README.md                           # Technical docs
├── USAGE_GUIDE.md                      # User guide
└── IMPLEMENTATION_SUMMARY.md           # Project overview
```

## Key Components

### Service Card Widget
- Displays service information in a card
- Shows icon, name, description (2 lines), duration, price
- Deposit badge if required
- Tappable to navigate to booking

### Admin CRUD Operations

```dart
// Create Service
AdminScreen → "Add service" → CreateServiceDialog → Save → MockApi.createService()

// Read Services
AdminScreen → Load → ServiceListNotifier → MockApi.getServices()

// Update Service
AdminScreen → Edit icon → EditServiceDialog → Save → MockApi.updateService()

// Delete Service
AdminScreen → Delete icon → Confirmation → MockApi.deleteService()
```

### Data Flow

```
User Action → Screen → Provider (Riverpod) → MockApi → Persistence (Hive) → State Update
```

### State Management

```dart
// Services List
servicesListProvider (StateNotifier)
  └── ServiceListNotifier
      └── MockApi
          └── Persistence.servicesBox (Hive)

// Admin Authentication
adminAuthProvider (StateNotifier)
  └── AdminAuthNotifier
      └── Persistence (flutter_secure_storage)

// Appointments
appointmentsProvider (StateNotifier)
  └── _AppointmentListNotifier
      └── MockApi
          └── Persistence.appointmentsBox (Hive)
```

## Navigation Routes

```dart
/                    → LandingScreen
/services            → ServiceListScreen  
/services/:id        → BookingScreen (with service ID)
/confirmation        → ConfirmationScreen (with appointment data)
/admin               → AdminScreen (requires authentication)
```

## Service Categories

### Lash Extensions (11)
- Touch Up
- Classic Set (+ 7-14, 15-21, 22-28 day fills)
- Volume Set (+ 7-14, 15-21, 22-28 day fills)
- Hybrid Set (+ 7-14, 15-21, 22-28 day fills)
- Lash Removal
- Color Splash-Ins

### Permanent Makeup (10)
- Microblading
- Microshading
- Ombré (+ Cover-Up)
- Microshading Cover-Up
- Lip Blush
- Cover-Up with Correction
- Brow Color Refresh (8 weeks-6 months, 6-12 months, 12-20 months)
- Additional Correction/Touch Up
- PMU Consultation
- Patch Test

### Brow Services (3)
- Brow Tint
- Brow Wax
- Chin Wax

## Color Scheme

```dart
Primary Color: Colors.pink.shade300
Seed Color: Colors.pink.shade200
Background: #FDF8F6 (off-white/cream)
App Bar: White with black text
Deposit Badge: Orange.shade100
```

## Admin Authentication Flow

```
1. Navigate to /admin
2. If not authenticated → Show login screen
3. Enter credentials:
   - Option A: Owner email (from .env) → Simulated magic link
   - Option B: Any email + "adminpass" → Password auth
4. AdminAuthNotifier.login() → Save token to secure storage
5. State updates → Show admin dashboard
6. Logout → Delete token → Return to login
```

## Booking Flow Details

```
1. User taps service card
2. Navigate to BookingScreen with service ID
3. Show service details from servicesListProvider
4. User selects date → showDatePicker()
5. User selects time → showTimePicker()
6. User enters name, contact, notification preference
7. User taps "Confirm booking"
8. Create appointment draft
9. appointmentsProvider.notifier.add(draft)
10. MockApi.createAppointment() → Save to Hive
11. Navigate to ConfirmationScreen with appointment data
```

## Data Persistence

### Hive Boxes
- `services` - All available services
- `appointments` - Booked appointments
- `notifications` - Queued notifications
- `meta` - App metadata

### Secure Storage
- `admin_token` - Admin authentication token

### Seeding
On first launch, if services box is empty:
- Load SERVICES from seed_services.dart
- Insert all 31 services into Hive
- Services persist across app restarts

## Mock Services

### MockApi
- Simulates network delays (100-200ms)
- CRUD operations for services
- Appointment creation and listing
- Returns Future<T> for async operations

### MockNotificationService
- Simulates sending notifications
- Logs to console
- Can be replaced with real Firebase/email service

### MockPaymentService
- Simulates payment processing
- Would integrate with Stripe in production
- Returns success for all deposits

## Error Handling

- Form validation before submission
- Null safety throughout codebase
- Try-catch for async operations
- User-friendly error messages via SnackBars
- Confirmation dialogs for destructive actions

## Responsive Design

- Grid layout adapts to screen size
- Cards scale with device width
- Touch targets sized for mobile
- Scrollable content in all screens
- Dialogs fit on mobile screens

---

This frontend prototype provides a complete, polished user experience ready for demonstration and user testing!
