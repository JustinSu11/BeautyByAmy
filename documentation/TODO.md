# BeautyByAmy — Actionable Tasks

## Blocked / Awaiting Client
- [ ] Get client response on waiver format (HTML checkbox, digital signature canvas, PDF, or DocuSign?)
- [ ] Get client response on waiver types (same for all services, per category, or per service?)
- [ ] Confirm cloud storage provider for signed waivers (AWS S3, Cloudinary, etc.)
- [ ] Decide card authorization hold amount (flat fee, percentage, service-dependent?)
- [ ] Decide hold capture/release timing and no-show policy

## Immediate (This Week)
- [ ] Research Stripe card authorization holds implementation
- [ ] Implement payment checkout route (currently empty)
- [ ] Fix booking summary to use actual form values (not hardcoded)

## Short-Term (Next 2 Weeks)
- [ ] Implement Stripe card authorization hold (amount, timing, capture/release logic)
- [ ] Design waiver system based on client response
- [ ] Implement waiver signing flow (before checkout step)
- [ ] Set up cloud storage for signed waivers
- [ ] Implement booking confirmation page
- [ ] Add email notification system (SendGrid or Resend)
- [ ] Test complete booking flow end-to-end (service → date/time → waiver → payment hold → confirmation)
- [ ] Add error boundaries for payment failures

## Medium-Term (Next Month)
- [ ] Add unit tests for booking logic (Jest + React Testing Library — first time)
- [ ] Deploy to Netlify staging environment
- [ ] Conduct cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Test responsive design on real mobile devices
- [ ] Optimize mobile touch interactions

## Before Launch
- [ ] Comprehensive testing (booking, payment, edge cases)
- [ ] Production deployment to Netlify
- [ ] Domain configuration and SSL setup
- [ ] Configure production environment variables
- [ ] Accessibility audit (WCAG 2.1 AA target)
- [ ] Performance testing (< 3s on mobile networks)
- [ ] Write API documentation
- [ ] Create deployment runbook
- [ ] Monitor first real bookings closely
