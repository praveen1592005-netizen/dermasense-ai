# Web Design and Feature Reference

## 1. Web Pages
- **Public**: Landing Page
- **Auth**: Sign In, Sign Up, Forgot Password, Onboarding
- **Dashboard Core**: Dashboard Home, Profile, Settings
- **Analysis**: Skincare Analysis, Skincare Results, Skin Disease Analysis
- **Tracking**: Skin Progress, Reports, Report Detail
- **Communication**: AI Chat
- **Other**: Admin Dashboard, Not Found, Maintenance

## 2. Web Navigation
- Public Layout / Dashboard Layout / Auth Layout.
- Routing is defined via React Router (`AppRouter.tsx`).
- Protected Routes ensure session checks.

## 3. Web Features
- Authentication (Email, Google Auth)
- Skin Care Analysis
- Skin Disease Analysis
- Progress Tracking
- Generated Reports
- User Profile Management
- AI Chatbot Interaction
- Onboarding Flow

## 4. Web Components
- Reusable layouts (`PublicLayout`, `AuthLayout`, `DashboardLayout`)
- Feature-specific pages mapping to components.
- Role-based guards.
- Glassmorphism UI components (`.glass-panel`, `.glass-panel-subtle`).

## 5. Web Colors (from Tailwind Config)
- **Brand**: Blue palette (50-950), Teal palette, Indigo palette. Primary accent usually around 500/600.
- **Dark Backgrounds**: Deep navy/slate tones (950: `#070B14`, 900: `#0B1120`, 850: `#0F172A`).
- **Surface**: White (`#FFFFFF` in light mode) or dark (`#0F172A` in dark mode).

## 6. Web Typography
- Font Family: `'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'`
- Tailwind base hierarchy.

## 7. Web Spacing
- Tailwind default spacing scale.

## 8. Web Buttons
- Styled using Tailwind utility classes (primary, secondary, outline variations).

## 9. Web Cards
- Often utilize the `glass-card` or `glass-card-dark` shadow effects.
- Glassmorphism panels for card bodies.

## 10. Web Forms
- Standard input fields with border coloring and focus states (Tailwind).

## 11. Web Icons
- To be mapped to React Native vector icons (e.g., Lucide Icons, or Expo icons).

## 12. Web Images
- Background mesh gradients: `.mesh-gradient-light`, `.mesh-gradient-dark`
- Scanner grid animation (`.scanner-grid`).

## 13. Web Loading States
- Tailwind animations like `pulse-slow`, `spin-slow`.

## 14. Web Error States
- Configuration/Offline notices present. Form validation styling.

## 15. Web AI Result Screens
- Skincare Results Page and Skin Disease Analysis Page.

## 16. Web Product Screens
- Not fully distinct as standalone pages in router but likely integrated into results or store sections (Store parity required as per requirements).

## 17. Web Chatbot
- Dedicated `AIChatPage`.

## 18. Web Profile
- Dedicated `ProfilePage`.

## 19. Web Reports
- `ReportsPage` and `ReportDetailPage`.

## 20. Web Hospital Locator
- Part of features listed (needs verification if dedicated page or modal, but required).

## 21. Web Language Selector
- I18n Context present, so language selection exists in the UI (likely navbar/settings).
