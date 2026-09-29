# GaGa-Xiang app

## Overview
A web + iOS + Android app for my family's food business. Every day there is one
set lunchbox (usually two dishes with rice) that changes daily. Customers order
lunchboxes a day in advance and don't choose the dishes; my family cooks them the
next morning in a shared commercial kitchen and delivers them at lunchtime to a
few fixed pickup locations, where customers collect them from the car.

This is also a portfolio project, so code quality, structure, and clear
commit history matter.

## How the business works
- One lunchbox per day, the same for every customer. Its dishes change daily; usually 2 dishes plus rice, but the number varies
- Price: $12 per lunchbox, the same every day
- Customers can order more than one lunchbox (e.g. for coworkers)
- Customers place orders the day before delivery with a cutoff time of 2PM New York time all year
- After the cutoff, ordering is closed until midnight; customers can't order for two days out instead
- Delivery happens every day, including weekends (TBD: the pickup locations may be closed on weekends)
- Family cooks in a shared kitchen space every morning (4-hour window)
- Lunchboxes are delivered at lunchtime; customers see "between 12 and 1pm". Both locations are served in the same run
- Kitchen time limits how much can be made each day: 100 lunchboxes total per day, across all locations

## Pickup locations
- Customers pick one of a fixed set of pickup locations for each order (no home delivery, no typed addresses)
- The family member delivering stays in the car; customers come out to it when they get the "arrived" text
- Each location has a bilingual name, an address, and a pickup note saying where the car parks. Locations are managed from admin and can be turned off
- Current locations (addresses and pickup notes are placeholders):
  - WFIRM: 123 Placeholder Ave, Winston-Salem, NC. Pickup note: "Silver minivan in the visitor lot by the main entrance"
  - Courthouse: 456 Placeholder St, Winston-Salem, NC. Pickup note: "Silver minivan at the side-street loading zone"

## Platforms & distribution
- iOS and Android via the App Store and Google Play
- Web version for customers who don't want to install the app
- Single codebase with Expo (React Native) + Expo Router + TypeScript

## Languages
- The whole app (customer and admin) is available in English and Simplified Chinese
- Defaults to the phone's language: any Chinese setting gets Simplified Chinese, anything else English
- A language toggle between English and 简体中文 on the customer Account screen and the admin home. The phone's language is selected until the user picks one; the choice is remembered
- Dishes and locations are entered by me, not translated by the app. Each dish has one name field holding both names (e.g. "回锅肉 Twice-cooked pork"), shown the same in both languages; the description is written in both English and Chinese and follows the language setting
- Every new piece of UI text needs both an English and a Simplified Chinese string (`src/i18n/locales/`)

## Core features
### Customer
- Account creation and login with a phone number and a texted code. The phone number is also where arrival texts go
- Lunchbox screen for the next delivery day: a display of the dishes in the box, each with its photo and name, plus what comes with it (e.g. "with steamed rice"). Tapping a dish shows a larger photo and its description. If the next lunchbox hasn't been posted yet, say so
- On the same screen: pickup location (radio buttons, the last choice remembered), number of lunchboxes, totals, and checkout. There is no separate cart tab
- They can only place orders for the next delivery day, as in, they can not place a order for 2 days later or more
- Place and pay for orders before the cutoff
- The chosen location and quantity are saved for as long as the customer stays logged in (cleared on sign-out). After the cutoff, customers can still change them, but checkout is grayed out with a message saying why
- Order confirmation, and a live order status on the Orders screen (e.g. "Arrived at WFIRM, look for the silver minivan...")
- Arrival text message when their lunchbox reaches their pickup location

### Admin (family)
- Dish library: each dish is entered once (name, photo, descriptions) and reused on any day
- Daily lunchbox editor: pick the date and the dishes from the library, plus what comes with it (e.g. rice). Price and cap are set once, not per day
- Prep sheet: number of lunchboxes to make for the next day, and that day's dishes
- Packing list per location: customer names and quantities, with a way to check people off at pickup
- Delivery run (used on a phone in the car): an "Arrived" button per location that texts every customer with an order for that location that day, including the location's pickup note
- Order management and refunds
- Pickup location management

## Key business rules (enforce on the server, not just the UI)
- Order cutoff: orders for a given day close at a set time the day before
- Daily cap: no more than 100 lunchboxes across all orders for a day
- Orders must use an active pickup location
- An order is only confirmed after payment is verified server-side
- Sales tax: 7% (NC 4.75% + Forsyth County 2.25%, for Clemmons, NC), on the order subtotal. No delivery fee and no minimum order for now

## Text messages
- Text messages only; no push notifications (customers can't be counted on to allow them)
- Texts are only about orders (no promotions). Customers agree to them at signup, and replying STOP opts out
- Every text starts with the business name, e.g. "嘎嘎香 GaGa-Xiang: Your lunchbox is here..."
- US carriers require business texting registration (A2P 10DLC) before texts are delivered. It takes days to weeks, so start it before the arrival texts are built

## Structure (planned)
- `src/app/(customer)/`: customer-facing screens
- `src/app/admin/`: admin screens under `/admin/...`, gated by user role (mostly used on web/tablet; the delivery run screen is used on a phone). A real URL segment rather than an `(admin)` group, since groups don't add to the URL and admin routes like `orders` would clash with the customer ones.

## Open decisions
- Backend/auth: considering Supabase (Postgres + auth + server functions)
- Payments: considering Stripe (payment sheet with Apple Pay / Google Pay,
  webhooks to confirm payment)
- Text message provider: considering Twilio
- Real addresses and pickup notes for the locations
- Whether delivery runs on weekends
- Web hosting

## Developer notes
- I know React well but I'm new to React Native; explain RN-specific
  patterns when they differ from web React
