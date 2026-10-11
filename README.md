# 🛒 বাজার দর (BazarDor)

বাজার দর is a Bangla daily market-price tracker. It shows today's prices of rice, pulses, oil, vegetables, fish, meat, eggs and spices, how much each price changed since yesterday, and a market-by-market price table for every product.

**Live site:** _add your Vercel link here_

## Technologies Used

- Next.js (App Router) and TypeScript
- Tailwind CSS
- Better Auth (email/password, Google and GitHub login)
- MongoDB (Atlas)
- react-hot-toast
- Programming Hero BazarDor API

## Key Features

1. **Live price ticker:** an infinite scrolling strip with emoji, name, price per unit and ▲/▼ percentage change.
2. **Price movers:** home page sections for the top 6 price risers and top 6 fallers, plus a full "সব পণ্য" grid.
3. **Category pages:** browse products by category, sort by price (low to high or high to low), with skeleton loading and an empty state.
4. **Product details (protected):** min, max and average price plus a market-wise price table for each product, for logged-in users only.
5. **Authentication:** sign up, sign in, Google and GitHub login, hover user menu, profile page and sign out, with toast notifications.
6. **Update profile:** change your name from a dedicated update page.
7. **Custom 404 page** and a fully responsive design for mobile, tablet and desktop.

## Getting Started

```bash
git clone https://github.com/tasnia-mahek/BazarDor
cd bazardor
npm install
npm run dev
```

Create a `.env.local` file in the project root:

```env
MONGODB_URI=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

Open [http://localhost:3000](http://localhost:3000).