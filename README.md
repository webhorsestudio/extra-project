# Real Estate & Property Management Platform

This is a comprehensive, full-stack web application built with Next.js and Supabase designed to serve as a powerful admin dashboard for a real estate or property management business. It provides a complete suite of tools to manage properties, inquiries, users, website content, and system settings.

## Key Features

-   **Dashboard:** An overview of key metrics and activities.
-   **Property Management:** Create, edit, and manage property listings with rich details, including:
    -   BHK Configurations
    -   Image Galleries & File Uploads
    -   Amenities and Categories
    -   Interactive Map for location picking
-   **User Management:** Invite, edit, and manage user roles (admin, agent, customer).
-   **Inquiry Management:** View and track incoming customer inquiries.
-   **Content Management:**
    -   **Pages:** Create and manage static pages for the front-end website.
    -   **Blogs:** A complete blogging system with posts and categories.
-   **Dynamic Settings:** A centralized settings module to control various aspects of the site:
    -   **Website Info:** Manage site name, description, etc.
    -   **Branding:** Upload custom logos.
    -   **Theme:** Customize website colors and appearance.
    -   **Contact Info:** Update contact details.
    -   **SEO & Sitemap:** Manage SEO settings and generate a sitemap.
    -   **API Keys:** Store and manage third-party API credentials.
-   **User Profile:** Users can manage their own profile, including name and avatar.
-   **Responsive Design:** A mobile-friendly layout for management on the go.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Backend & DB:** [Supabase](https://supabase.io/) (PostgreSQL, Auth, Storage)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## Getting Started

### 1. Prerequisites

-   Node.js (v18 or later)
-   npm or yarn
-   A Supabase project.

### 2. Setup

**A. Clone the repository:**

```bash
git clone <your-repo-url>
cd extra-project
```

**B. Install dependencies:**

```bash
npm install
```

**C. Set up environment variables:**

Create a `.env.local` file in the root of the `extra-project` directory. You'll need to get the Project URL and anon key from your Supabase project dashboard (Settings > API).

```.env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

**D. Run Supabase Migrations:**

The easiest way to get your database schema set up is to apply the migrations located in the `supabase/migrations` directory. You can do this using the Supabase CLI or by manually running the SQL from each file in the Supabase SQL Editor in the correct order.

**E. Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admin) with your browser to see the admin panel.

## Directory Structure

Here is an overview of the project's directory structure:

```
extra-project/
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   ├── admin/           # Admin panel routes and pages
│   │   └── api/             # API route handlers
│   ├── components/
│   │   ├── admin/           # Admin-specific components
│   │   ├── layouts/         # Main layout components (e.g., AdminLayout)
│   │   └── ui/              # Reusable UI components (from shadcn/ui)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and library initializations (e.g., Supabase client)
│   └── types/               # TypeScript type definitions
├── supabase/
│   └── migrations/          # Database migration scripts
├── .env.local.example       # Example environment variables
├── next.config.ts           # Next.js configuration
├── package.json
└── tailwind.config.js       # Tailwind CSS configuration
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
