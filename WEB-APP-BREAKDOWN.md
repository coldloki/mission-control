# 🌐 Copyshop Web App - Development Breakdown
**Goal:** Create a web app that feels like the iOS app, integrated with existing backend

---

## 📋 Phase 1: Foundation & Setup (v1.0.0)
**Target Date:** 2026-03-07 (1 week)

### Task 1.1: Project Initialization
**Due:** 2026-03-01
- [ ] Create Next.js project with TypeScript
- [ ] Configure Tailwind CSS for iOS-like design system
- [ ] Set up component library (Shadcn/UI or custom)
- [ ] Configure ESLint, Prettier, Husky
- [ ] Set up Git branch: `feature/web-app-v1`

### Task 1.2: Design System Foundation
**Due:** 2026-03-02
- [ ] Extract iOS app color palette (from Xcode project)
- [ ] Create typography scale matching iOS SF Pro
- [ ] Define spacing system (8pt grid like iOS)
- [ ] Create button components (primary, secondary, danger)
- [ ] Create card components (Apple-style cards from backend)
- [ ] Create input components with iOS-like focus states

### Task 1.3: API Integration Layer
**Due:** 2026-03-03
- [ ] Create API client wrapper (axios/fetch)
- [ ] Configure base URL for `api-cs-smag.harisnikolovski.ch`
- [ ] Implement request/response interceptors
- [ ] Add auth token handling (if needed)
- [ ] Implement error handling with user-friendly messages
- [ ] Add loading states for all API calls
- [ ] Test with existing backend endpoints

### Task 1.4: Navigation & Routing
**Due:** 2026-03-04
- [ ] Set up Next.js app router
- [ ] Create navigation bar (iOS-style bottom tab bar for mobile)
- [ ] Create routes: Home, Orders, Cart, Checkout, Profile
- [ ] Implement deep linking support
- [ ] Add navigation transitions (iOS-style animations)

---

## 📋 Phase 2: Core UI Components (v1.1.0)
**Target Date:** 2026-03-14 (1 week)

### Task 2.1: Home/Order Dashboard
**Due:** 2026-03-07
- [ ] Create order list component (matching iOS design)
- [ ] Implement order status badges (Pending, Paid, Processing, Ready, Completed)
- [ ] Add order search functionality
- [ ] Add order filtering (by status, date)
- [ ] Implement pull-to-refresh
- [ ] Add empty state when no orders

### Task 2.2: Product Selection (iOS-like)
**Due:** 2026-03-08
- [ ] Create product picker with iOS-style cards
- [ ] Implement price display with EN/DE localization
- [ ] Add quantity selectors (iOS-style steppers)
- [ ] Show live price calculation
- [ ] Add add-on selection (paper types, finishing options)
- [ ] Implement validation for product choices

### Task 2.3: Cart System
**Due:** 2026-03-09
- [ ] Create cart component (slide-up drawer like iOS)
- [ ] Implement cart editing (update quantities, remove items)
- [ ] Add cart summary with breakdown (subtotal, taxes, total)
- [ ] Persist cart to localStorage + sync with backend
- [ ] Add cart animation (iOS-style transitions)
- [ ] Implement cart validation before checkout

### Task 2.4: File Upload System
**Due:** 2026-03-10
- [ ] Create file picker (native file input + drag-drop)
- [ ] Implement file preview (PDF, images)
- [ ] Add file validation (size, format)
- [ ] Implement upload progress indicator (iOS-style)
- [ ] Add file management (remove, replace files)
- [ ] Test with backend `/api/orders` endpoint

---

## 📋 Phase 3: Checkout & Payment (v1.2.0)
**Target Date:** 2026-03-21 (1 week)

### Task 3.1: Checkout Form
**Due:** 2026-03-14
- [ ] Create checkout form with iOS-style inputs
- [ ] Implement delivery vs pickup toggle
- [ ] Add address form with autofill support
- [ ] Add contact information (email, phone)
- [ ] Implement form validation with iOS-style errors
- [ ] Add auto-save draft functionality

### Task 3.2: Payment Integration
**Due:** 2026-03-15
- [ ] Create payment method selector (Card, Apple Pay, SumUp)
- [ ] Integrate Stripe PaymentSheet for web
- [ ] Implement SumUp payment flow (web-based)
- [ ] Add payment status tracking
- [ ] Show payment confirmation screen
- [ ] Handle payment failures gracefully

### Task 3.3: Order Submission
**Due:** 2026-03-16
- [ ] Create order submission flow
- [ ] Implement order confirmation screen
- [ ] Show order number + QR code
- [ ] Add email confirmation trigger
- [ ] Implement success/error states
- [ ] Add "View Order" CTA to order details

### Task 3.4: Order Details View
**Due:** 2026-03-17
- [ ] Create order details page
- [ ] Show order status timeline
- [ ] Display order items with images
- [ ] Show invoice/delivery slip download (when available)
- [ ] Add "Contact Support" button
- [ ] Implement back navigation

---

## 📋 Phase 4: User Account & Features (v1.3.0)
**Target Date:** 2026-03-28 (1 week)

### Task 4.1: Guest vs Login Flow
**Due:** 2026-03-21
- [ ] Implement guest checkout (no login required)
- [ ] Add optional account creation
- [ ] Add login/register screens (iOS style)
- [ ] Implement password reset flow
- [ ] Add email verification
- [ ] Store order history for logged-in users

### Task 4.2: User Profile
**Due:** 2026-03-22
- [ ] Create profile screen
- [ ] Add address management
- [ ] Add contact info editing
- [ ] Add notification preferences
- [ ] Add order history in profile
- [ ] Implement iOS-style settings layout

### Task 4.3: Notifications
**Due:** 2026-03-23
- [ ] Implement in-app notifications (iOS-style banners)
- [ ] Add email notification preferences
- [ ] Show order status updates
- [ ] Add push notification support (PWA)
- [ ] Implement notification center

### Task 4.4: Support & Help
**Due:** 2026-03-24
- [ ] Create help/support screen
- [ ] Add FAQ section
- [ ] Add contact form
- [ ] Add support phone number (click-to-call)
- [ ] Add FAQ accordion component

---

## 📋 Phase 5: Polish & Testing (v1.4.0)
**Target Date:** 2026-03-31 (1 week)

### Task 5.1: iOS-like Animations
**Due:** 2026-03-28
- [ ] Add page transition animations
- [ ] Add button press feedback (haptic visual)
- [ ] Add loading skeletons (iOS style)
- [ ] Add pull-to-refresh animations
- [ ] Add modal animations
- [ ] Ensure 60fps performance

### Task 5.2: Responsive Design
**Due:** 2026-03-29
- [ ] Test on iPhone Safari (iOS 15+)
- [ ] Test on iPad Safari
- [ ] Test on Android Chrome
- [ ] Test on desktop browsers
- [ ] Fix all responsive breakpoints
- [ ] Ensure consistent experience across devices

### Task 5.3: Accessibility
**Due:** 2026-03-30
- [ ] Add aria-labels to all interactive elements
- [ ] Implement keyboard navigation
- [ ] Add screen reader testing
- [ ] Ensure color contrast compliance
- [ ] Add focus indicators
- [ ] Test with VoiceOver/TalkBack

### Task 5.4: Performance Optimization
**Due:** 2026-03-31
- [ ] Implement code splitting
- [ ] Optimize image loading (lazy load)
- [ ] Add service worker for PWA
- [ ] Implement caching strategy
- [ ] Reduce bundle size
- [ ] Achieve 90+ Lighthouse score

---

## 📋 Phase 6: Deployment & Launch (v1.5.0)
**Target Date:** 2026-04-07 (1 week)

### Task 6.1: Staging Deployment
**Due:** 2026-04-01
- [ ] Deploy to staging server
- [ ] Configure environment variables
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS for API
- [ ] Test all flows on staging
- [ ] Create staging test account

### Task 6.2: UAT Testing
**Due:** 2026-04-02
- [ ] Create UAT testing plan
- [ ] Test all user flows end-to-end
- [ ] Test payment flows (test mode)
- [ ] Test order submission
- [ ] Test file uploads
- [ ] Document any bugs

### Task 6.3: Bug Fixes & Polish
**Due:** 2026-04-03
- [ ] Fix all critical bugs from UAT
- [ ] Fix all high-priority bugs
- [ ] Polish UI based on testing feedback
- [ ] Final performance review
- [ ] Final accessibility review

### Task 6.4: Production Launch
**Due:** 2026-04-04
- [ ] Deploy to production server
- [ ] Configure production environment
- [ ] Set up monitoring (error tracking, analytics)
- [ ] Create launch checklist
- [ ] Announce launch to team
- [ ] Monitor first 24 hours closely

---

## 📊 Dependencies & Prerequisites

### Backend Requirements:
- [ ] `/api/orders` endpoint working (POST, GET)
- [ ] `/api/prices` endpoint working (GET)
- [ ] `/api/create-payment-intent` endpoint working (POST)
- [ ] `/admin` endpoints restricted to local network
- [ ] File upload storage configured on NAS
- [ ] Invoice/delivery slip generation working

### Infrastructure:
- [ ] Microsoft Server 2025 ready for web app hosting
- [ ] NAS storage accessible from server
- [ ] SSL certificates configured
- [ ] DNS configured for `Copyshop.staffelmedien.ch`
- [ ] Backup strategy in place

### Design Assets:
- [ ] iOS app color palette extracted
- [ ] iOS app typography documented
- [ ] iOS app component library available
- [ ] Logo and brand assets ready

---

## 🚦 Risk Mitigation

### High Risk Items:
1. **Payment Integration** - Stripe SumUp web integration can be tricky
   - **Mitigation:** Test early, have fallback payment method

2. **File Upload Performance** - Large files may timeout
   - **Mitigation:** Implement chunked uploads, progress tracking

3. **iOS-like Feel on Web** - Hard to replicate native animations
   - **Mitigation:** Use Framer Motion, test on actual devices

4. **Backend API Changes** - Backend may need updates for web
   - **Mitigation:** Weekly sync with backend dev, maintain API docs

---

## 📝 Notes

- **Total Timeline:** 6 weeks (March 1 - April 7, 2026)
- **Phases:** 6 phases, 24 tasks
- **Versioning:** Follows semantic versioning (v1.0.0 → v1.5.0)
- **Target:** Launch ready for TestFlight web app integration

**Next Steps:**
1. Approve this breakdown
2. Start Phase 1 Task 1.1
3. Update Mission Control with these tasks
4. Begin daily/weekly progress tracking

---

*Created: 2026-02-28*
*Last Updated: 2026-02-28 23:48 GMT+1*