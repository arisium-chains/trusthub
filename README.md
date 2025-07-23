# Decentralized Community Review Platform (DCRP)

This is a Next.js project for the Decentralized Community Review Platform, a transparent and censorship-resistant alternative to traditional review platforms.

## Features

- Wallet-based authentication
- Business registration and profile management
- Review submission with cryptographic verification
- Business response system
- TRH token rewards system
- World ID verification integration
- Business promotion options

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

### Automatic Deployment with Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Sign in to Vercel
3. Create a new project and import your Git repository
4. Vercel will automatically detect the Next.js framework and configure the build settings
5. Click "Deploy" and your site will be live in minutes

### Manual Deployment

To deploy manually, you can build and export the static files:

```bash
npm run build
# This will create a .next directory with the production build
```

Then deploy the contents of the `.next` directory to your preferred hosting platform.

## Environment Variables

For production deployment, you may need to set the following environment variables:

- `NEXT_PUBLIC_WORLD_ID_APP_ID` - Your World ID app ID
- Any other environment variables required for your specific deployment

## Project Structure

- `/app` - Next.js app router pages
- `/components` - Reusable UI components
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and business logic
- `/store` - Global state management with Zustand