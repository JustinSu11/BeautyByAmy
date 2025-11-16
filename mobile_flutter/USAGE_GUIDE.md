# Beauty By Amy Mobile App - Usage Guide

Welcome to the Beauty By Amy mobile app! This guide will help you understand how to use the app, both as a customer booking services and as an admin managing the service catalog.

## Table of Contents
- [For Customers](#for-customers)
- [For Admins](#for-admins)
- [Technical Information](#technical-information)

---

## For Customers

### Browsing Services

When you open the app, you'll see the landing page with featured services. Each service card shows:
- **Service name** (e.g., "Volume Set", "Microblading")
- **Brief description** of what the service includes
- **Duration** (e.g., "2 hrs 30 mins")
- **Price** (or "Varies" if pricing is customized)
- **Deposit badge** if a deposit is required

#### Navigation
- Tap **"See all services"** to view the complete service catalog
- Tap any service card to see details and book an appointment

### Booking an Appointment

1. **Select a service** from the landing page or service list
2. You'll see detailed information including:
   - Full service description
   - Duration and pricing
   - Deposit requirements (if any)
3. **Choose a date and time**:
   - Tap the "Choose" button
   - Select your preferred date
   - Select your preferred time slot
4. **Enter your information**:
   - Your name
   - Contact information (email or phone)
   - Notification preference (SMS or Email)
5. **Confirm your booking**
6. You'll receive a confirmation screen with your appointment details

### Service Categories

The app includes various services:
- **Lash Extensions**: Classic, Volume, and Hybrid sets with various fill schedules
- **Permanent Makeup (PMU)**: Microblading, Microshading, Ombré brows, Lip blush
- **Brow Services**: Tinting, waxing, color refresh treatments
- **Additional Services**: Consultations, patch tests, corrections, and more

---

## For Admins

### Accessing the Admin Panel

There are two ways to access the admin panel:

1. **From the landing screen**: Tap the admin icon (⚙️) in the top-right corner of the app bar
2. **Direct navigation**: Navigate to `/admin` route

### Logging In

You have two login options:

#### Option 1: Owner Email (Magic Link)
- Enter the owner email configured in your `.env` file
- Default: `admin@beautybyamy.com`
- Leave password blank
- Tap "Send magic link / Login"
- This simulates a magic link authentication (no actual email sent in prototype)

#### Option 2: Admin Password
- Enter any email address
- Enter password: `adminpass`
- Tap "Send magic link / Login"

### Managing Services

Once logged in, you'll see the admin dashboard with all your services.

#### Adding a New Service

1. Tap the **"Add service"** button
2. Fill in the service details:
   - **ID**: A unique identifier (e.g., `service32`, `custom1`)
   - **Name**: Service name (e.g., "Mega Volume Set")
   - **Description**: Detailed description of what the service includes (optional, supports multiple lines)
   - **Price**: Enter the price or leave blank for "Varies"
   - **Duration**: How long the service takes (e.g., "2 hrs", "45 mins")
   - **Requires deposit**: Check if a deposit is needed
   - **Deposit amount**: If deposit is required, enter the amount
3. Tap **"Create"** to add the service

#### Editing an Existing Service

1. Find the service you want to edit in the list
2. Tap the **edit icon** (pencil) next to the service
3. Modify any fields (except ID, which cannot be changed)
4. Tap **"Save"** to update the service

#### Deleting a Service

1. Find the service you want to remove
2. Tap the **delete icon** (trash can) next to the service
3. Confirm the deletion in the popup dialog
4. The service will be removed from the catalog

**Note**: Deleted services cannot be recovered in this prototype version.

#### Service Display

Each service in the admin list shows:
- Service name
- Brief description (first 2 lines)
- Price and duration
- Deposit information (if applicable)
- Edit and delete buttons

### Logging Out

When you're done managing services:
- Tap the **logout icon** in the top-right corner of the admin screen
- You'll be returned to the login screen

---

## Technical Information

### Data Persistence

- All service and appointment data is stored locally on the device using Hive (Flutter local storage)
- Data persists across app restarts
- Initial services are seeded from `lib/data/seed_services.dart` on first launch
- Admin authentication tokens are stored securely using Flutter Secure Storage

### Mock Backend

This is a **frontend prototype** with a mock backend:
- No real server connection is made
- All operations happen locally on the device
- No actual notifications are sent
- Payment processing is simulated (no real charges)

### Future Backend Integration

When connecting to a real backend:
1. Update `API_BASE_URL` in the `.env` file
2. Replace mock services in `lib/providers/providers.dart` with real API implementations
3. Implement real authentication, notifications, and payment processing
4. Integrate with Google Calendar API for automatic appointment syncing

### Google Calendar Integration

The admin mentioned interest in Google Calendar integration. This would require:
- Backend implementation of Google Calendar API
- OAuth2 authentication flow
- Automatic appointment creation when bookings are confirmed
- Two-way sync for availability checking

This feature is **not implemented** in the current frontend prototype but can be added when the backend is developed.

---

## Tips for Best Experience

### For Customers
- Browse the complete service catalog to find what you need
- Check service descriptions for details about what's included
- Note deposit requirements before booking
- Keep your confirmation details for your appointment

### For Admins
- Use clear, descriptive service names
- Add detailed descriptions to help customers understand services
- Set accurate durations to help with scheduling
- Specify deposit requirements clearly
- Use consistent pricing format
- Create unique service IDs (cannot be changed later)
- Review service details before saving
- Test the booking flow from a customer perspective

---

## Troubleshooting

### Can't log in to admin panel
- Verify your `.env` file has correct `OWNER_EMAIL` configured
- Try using `admin@beautybyamy.com` with password `adminpass`
- Make sure you're tapping "Send magic link / Login" button

### Services not showing up
- Check if services were successfully created (look for them in admin panel)
- Try restarting the app
- Verify the persistence service initialized correctly (check console logs)

### Changes not saving
- Ensure all required fields are filled
- Check that service ID is unique when creating new services
- Look for error messages in the admin dialogs

---

## Support

This is a prototype application. For technical issues or questions:
- Check the main README.md for technical documentation
- Review the code in `lib/` directory
- Check console logs for error messages

---

## Appendix: Service ID Convention

When creating services, use IDs that follow this pattern:
- Format: `serviceX` where X is a number (e.g., `service32`, `service33`)
- Or use descriptive IDs: `custom1`, `promo_summer2024`, etc.
- IDs must be unique across all services
- IDs cannot contain spaces or special characters (use underscores or hyphens)

