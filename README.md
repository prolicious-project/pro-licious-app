# MeatInMinutes Mobile App

> A full-featured React Native (Expo) mobile app — a 100% functional equivalent of the MeatInMinutes web platform for ordering fresh meat, poultry, and seafood directly from local vendors.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Navigation & Screens](#navigation--screens)
- [Role-Based Access Control](#role-based-access-control)
- [State Management](#state-management)
- [API Layer](#api-layer)
- [Getting Started](#getting-started)
- [Running the App](#running-the-app)
- [Building for Production (EAS)](#building-for-production-eas)
- [Known Limitations](#known-limitations--differences-from-web)
- [Troubleshooting](#troubleshooting)

## Overview

MeatInMinutes Mobile is a React Native Expo app that mirrors the full MeatInMinutes web application. It supports four user roles - **Customer**, **Vendor**, **Rider**, and **Admin** - each with their own dedicated navigation stack and set of screens.

**Backend:** Shared with the web app - https://pro-licious-be.vercel.app

## Architecture

`
App.tsx (Entry Point)
  └── Provider (Redux Store)
        └── RootNavigator
              ├── AuthStack: Login, Signup
              ├── CustomerTabNavigator (role: CUSTOMER / default)
              │     ├── HomeTab - HomeStack (Home, VendorMenu, Checkout, OrderDetail)
              │     ├── CartTab - CartScreen
              │     ├── OrdersTab - OrdersScreen
              │     └── ProfileTab - ProfileScreen
              ├── VendorStackNavigator (role: VENDOR)
              │     ├── Dashboard, Orders, Menu, Payouts, Profile
              ├── RiderStackNavigator (role: RIDER)
              │     ├── Orders (Dashboard), Earnings, History, Profile
              └── AdminStackNavigator (role: ADMIN / SUPER_ADMIN)
                    ├── Dashboard, Vendors, Riders, Tickets, Audit Logs
`

## Tech Stack

| Dependency | Purpose |
|---|---|
| Expo SDK ~51 | Managed workflow |
| React Native 0.74 | Core mobile framework |
| @react-navigation/native | Navigation container |
| @react-navigation/native-stack | Stack navigation |
| @react-navigation/bottom-tabs | Tab bar navigation |
| @reduxjs/toolkit | State management |
| react-redux | Redux React bindings |
| axios | HTTP requests to backend |
| socket.io-client | Real-time order tracking |
| @react-native-async-storage/async-storage | Token persistence |
| @expo/vector-icons (Ionicons) | Icon set |
| @expo-google-fonts/inter | Inter font family |

## Project Structure

`
meatinminutes-app/
├── App.tsx                     # Root entry: Redux Provider + Fonts + RootNavigator
├── app.json                    # Expo config (name, icons, splash, bundle IDs)
├── babel.config.js             # Babel with babel-preset-expo
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── assets/                     # icon.png, splash.png, adaptive-icon.png, favicon.png
└── src/
    ├── constants/theme.ts      # Design tokens (Colors, Fonts, Spacing, Radius, Shadow)
    ├── lib/
    │   ├── axios.ts            # Axios instance with auth token interceptors
    │   └── socket.ts           # Socket.io client for real-time order tracking
    ├── services/api.ts         # All API endpoint functions (mirrors web app exactly)
    ├── store/
    │   ├── store.ts            # Redux store configuration
    │   └── slices/
    │       ├── authSlice.ts    # Auth state (user, token, isAuthenticated)
    │       └── cartSlice.ts    # Cart state (items, vendorId)
    ├── navigation/
    │   ├── RootNavigator.tsx           # Root gating: auth vs role-based routing
    │   ├── CustomerTabNavigator.tsx    # Customer bottom tabs + home stack
    │   ├── VendorStackNavigator.tsx    # Vendor bottom tabs (5 sections)
    │   ├── RiderStackNavigator.tsx     # Rider bottom tabs (4 sections)
    │   └── AdminStackNavigator.tsx     # Admin bottom tabs (5 sections)
    ├── components/
    │   ├── LoadingSpinner.tsx          # Full-screen and inline loading indicator
    │   └── OrderStatusBadge.tsx        # Color-coded order status pill
    └── screens/
        ├── LoginScreen.tsx             # Email/pass + OTP login + inline signup
        ├── SignupScreen.tsx            # New user registration
        ├── HomeScreen.tsx              # Vendor listing, search, categories
        ├── VendorMenuScreen.tsx        # Vendor menu + add to cart
        ├── CartScreen.tsx              # Cart management
        ├── CheckoutScreen.tsx          # Address selection + simulated payment
        ├── OrdersScreen.tsx            # Customer order history
        ├── OrderDetailScreen.tsx       # Live order tracking + status timeline
        ├── ProfileScreen.tsx           # Customer profile + address management
        ├── vendor/
        │   ├── VendorDashboardScreen.tsx    # Revenue stats + recent orders
        │   ├── VendorOrdersScreen.tsx       # All orders + status actions
        │   ├── VendorMenuScreen.tsx         # Menu item management
        │   ├── VendorProfileScreen.tsx      # Vendor profile & settings
        │   └── VendorSettlementsScreen.tsx  # Payout history
        ├── rider/
        │   ├── RiderDashboardScreen.tsx     # Active deliveries + OTP confirmation
        │   ├── RiderEarningsScreen.tsx      # Today/week/month earnings
        │   ├── RiderHistoryScreen.tsx       # Completed deliveries
        │   └── RiderProfileScreen.tsx       # Rider profile
        └── admin/
            ├── AdminDashboardScreen.tsx     # Live stats (orders, vendors, riders)
            ├── AdminVendorsScreen.tsx       # Vendor list + approve/suspend
            ├── AdminRidersScreen.tsx        # Rider list + approve/suspend
            ├── AdminTicketsScreen.tsx       # Support tickets + reply/close
            └── AdminAuditLogsScreen.tsx     # Full system audit log
`

## Navigation & Screens

### Authentication

| Screen | Route | Description |
|---|---|---|
| Login | Login | Email/password + OTP phone login |
| Signup | Signup | New user registration |

Login supports: (1) Email + Password, (2) Phone + OTP verification

### Customer Flow (default / CUSTOMER role)

| Tab | Screen | Description |
|---|---|---|
| Home | HomeMain | Vendor cards, search, category filters |
| Home - | VendorMenu | Menu items, add to cart |
| Home - | Checkout | Address + simulated payment |
| Home - | OrderDetail | Live order tracking |
| Cart | CartTab | View/edit cart |
| Orders | OrdersTab | Order history |
| Profile | ProfileTab | Profile + saved addresses |

### Vendor Flow (VENDOR role)

| Tab | Screen | Description |
|---|---|---|
| Dashboard | VendorDashboard | Revenue stats + recent orders |
| Orders | VendorOrders | All orders - accept/reject/prepare/ready |
| Menu | VendorMenu | Menu items (add/toggle availability) |
| Payouts | VendorSettlements | Settlement history |
| Profile | VendorProfile | Profile management |

### Rider Flow (RIDER role)

| Tab | Screen | Description |
|---|---|---|
| Orders | RiderDashboard | Active deliveries + online/offline toggle |
| Earnings | RiderEarnings | Today/week/month earnings |
| History | RiderHistory | Past completed deliveries |
| Profile | RiderProfile | Rider profile |

### Admin Flow (ADMIN / SUPER_ADMIN role)

| Tab | Screen | Description |
|---|---|---|
| Dashboard | AdminDashboard | Live system stats |
| Vendors | AdminVendors | Vendor management (approve/suspend) |
| Riders | AdminRiders | Rider management |
| Tickets | AdminTickets | Support ticket management |
| Audit | AdminAuditLogs | Full audit trail |

## Role-Based Access Control

On app launch, RootNavigator does:

1. Read 	oken from AsyncStorage
2. Call GET /api/auth/me to validate session
3. Dispatch setCredentials(user, token) to Redux
4. Navigate based on role:

`
SUPER_ADMIN | ADMIN  →  AdminStack
VENDOR               →  VendorStack
RIDER                →  RiderStack
default              →  CustomerTabs
`

Logging out dispatches logout(), clears AsyncStorage, and resets to Login.

## State Management

`	ypescript
store = {
  auth: { user, token, isAuthenticated },
  cart: { items: CartItem[], vendorId }
}
`

| Action | Effect |
|---|---|
| setCredentials({ user, token }) | Log in + save token to AsyncStorage |
| logout() | Log out + clear token |
| addItem(cartItem) | Add to cart (single-vendor enforced) |
| removeItem(id) | Remove from cart |
| updateQuantity({ id, quantity }) | Update cart quantity |
| clearCart() | Empty cart |
| setCart({ items, vendorId }) | Hydrate cart from server |

## API Layer

Base URL: https://pro-licious-be.vercel.app

The axios instance in src/lib/axios.ts auto-attaches Authorization: Bearer <token> to every request via an async interceptor (token read from AsyncStorage).

| Group | Export | Coverage |
|---|---|---|
| Authentication | authApi | login, register, sendOtp, verifyOtp, getMe, logout |
| Customer | customerApi | vendors, menu, cart, orders, addresses, search |
| Vendor | api | analytics, orders, menu items, profile |
| Rider | api | orders, availability, earnings |
| Admin | api | dashboard, vendors, riders, tickets, audit logs |

## Getting Started

### Prerequisites

- Node.js >= 18
- Expo CLI: 
pm install -g expo-cli
- Expo Go app on your phone OR Android/iOS simulator

### Installation

`ash
cd C:\Users\ADMIN\pro-licious-app
npm install --legacy-peer-deps
`

**Windows MAX_PATH workaround** (if you see ENOENT tar errors):
`ash
# Run once in an admin terminal:
cmd /c "mklink /J C:\pla C:\Users\ADMIN\meatinminutes-app"
cd C:\pla
npm install --legacy-peer-deps
`

**Permanent fix** (requires Admin):
`
reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f
`
Then restart your terminal.

## Running the App

`ash
# Start Metro bundler
npx expo start

# Target specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
`

Scan the QR code with Expo Go on your phone.

## Building for Production (EAS)

`ash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android   # or ios
`

Bundle IDs (from app.json):
- iOS: com.meatinminutes.app
- Android: com.meatinminutes.app

## Known Limitations & Differences from Web

| Feature | Web App | Mobile App | Notes |
|---|---|---|---|
| Payment Gateway | Razorpay SDK | Simulated Modal | Razorpay has no Expo managed-workflow SDK |
| Token Storage | localStorage | AsyncStorage | Functionally identical |
| Real-time tracking | Socket.io | Socket.io | Identical - src/lib/socket.ts |
| Image Uploads | Web File API | Not implemented | Requires expo-image-picker (v2 plan) |
| Maps / Location | Google Maps | Not implemented | Requires expo-location + react-native-maps (v2 plan) |
| Push Notifications | Web Push | Not implemented | Requires expo-notifications + backend (v2 plan) |

## Troubleshooting

### Cannot find module 'metro-transform-plugins'
npm install failed mid-way due to Windows path limits. Fix:
`ash
cmd /c "mklink /J C:\pla C:\Users\ADMIN\meatinminutes-app"
cd C:\pla
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
`

### Error: Cannot find module 'expo-router/entry'
Ensure package.json has "main": "./App.tsx" (not "expo-router/entry").

### App stuck on loading spinner
The app calls GET /api/auth/me on startup. If backend is unreachable it times out and shows Login. Check internet connection.

### Cart items from multiple vendors
Cart enforces single-vendor ordering (matches web behaviour). Adding items from a different vendor triggers a clear-cart prompt.

### EPERM errors on Windows build
Run terminal as Administrator, or enable Windows Developer Mode.

---

- Built by the MeatInMinutes team.



Use EAS Build to generate an installable Android APK.

**1. Install and log in**

```powershell
npm install -g eas-cli
eas login
```

**2. Configure EAS**

```powershell
eas build:configure
```

When prompted, choose **Android**.

**3. Add an APK build profile**

Create or update `eas.json` in the project root:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

**4. Build the APK**

```powershell
eas build --platform android --profile preview
```

EAS will upload the project, build the APK in the cloud, and provide a download URL when finished.

To build the production Android format:

```powershell
eas build --platform android --profile production
```

That produces an `.aab`, intended for Google Play rather than direct installation.

For a local release build, if Android Studio and the Android SDK are installed:

```powershell
npx expo run:android --variant release
```

The EAS `preview` profile is the recommended option for a directly installable APK.