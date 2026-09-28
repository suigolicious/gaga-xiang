# GaGa-Xiang app

## Overview
A web + iOS + Android app for my family's food business. Customers order
dishes a day in advance; my family cooks them the next morning in a shared
commercial kitchen and delivers all orders in a single morning run.

This is also a portfolio project, so code quality, structure, and clear
commit history matter.

## How the business works
- Customers place orders the day before delivery with a cutoff time of 2PM New York time all year
- Family cooks in a shared kitchen space every morning (4-hour window)
- All orders are delivered at once in the morning (target: ~7am)
- Kitchen time limits how much can be made each day - 100 dishes cap

## Platforms & distribution
- iOS and Android via the App Store and Google Play
- Web version for customers who don't want to install the app
- Single codebase with Expo (React Native) + Expo Router + TypeScript

## Languages
- The whole app (customer and admin) is available in English and Simplified Chinese
- Defaults to the phone's language: any Chinese setting gets Simplified Chinese, anything else English
- A language toggle (Phone setting / English / 简体中文) on the customer Account screen and the admin home; the choice is remembered
- Menu items (dish names and descriptions) are NOT translated. I enter them myself for accuracy
- Every new piece of UI text needs both an English and a Simplified Chinese string (`src/i18n/locales/`)

## Core features
### Customer
- Account creation and login
- Browse the menu for the next delivery day
- They can only place orders for the next delivery day, as in, they can not place a order for 2 days later or more
- Place and pay for orders before the cutoff
- Order confirmation and delivery notifications

### Admin (family)
- Prep sheet: total quantity of each dish to cook for the next day
- Packing list per customer
- Order management and refunds
- Menu and daily capacity management
- Delivery stop list

## Key business rules (enforce on the server, not just the UI)
- Order cutoff: orders for a given day close at a set time the day before
- Delivery zone: only accept addresses within the service area - TBD
- An order is only confirmed after payment is verified server-side

## Structure (planned)
- `src/app/(customer)/`: customer-facing screens
- `src/app/admin/`: admin screens under `/admin/...`, gated by user role (primarily used on web/tablet). A real URL segment rather than an `(admin)` group, since groups don't add to the URL and admin routes like `orders` would clash with the customer ones.

## Open decisions
- Backend/auth: considering Supabase (Postgres + auth + server functions)
- Payments: considering Stripe (payment sheet with Apple Pay / Google Pay,
  webhooks to confirm payment)
- Login method: email magic link or phone OTP
- Delivery zone boundaries
- Web hosting

## Developer notes
- I know React well but I'm new to React Native; explain RN-specific
  patterns when they differ from web React
