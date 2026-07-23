# Shafsky Aviation — Standalone Frontend Repository (`shafsky-frontend`)

Enterprise React 19 + Vite + TypeScript + Tailwind CSS standalone frontend UI repository.

---

## 🔒 Decoupled Architecture

- **Zero Database Access**: The frontend does NOT use direct `@supabase/supabase-js` database connections.
- **REST API Client**: All data retrieval and operations pass through `ApiClient` (`src/lib/ApiClient.ts`) calling `shafsky-backend` REST microservices.

---

## 📁 Repository Structure

```
shafsky-frontend/
├── src/
│   ├── components/       # Shared UI components & views (BookingUI, AdminUI, CRMUI)
│   ├── hooks/            # Custom React hooks
│   ├── lib/
│   │   └── ApiClient.ts  # Typed REST API Client to shafsky-backend
│   └── styles/           # Global Tailwind CSS styles
├── tsconfig.json         # TypeScript Config
└── package.json          # Frontend Dependencies & Scripts
```

---

## 🚀 Usage & Execution

```bash
# Install dependencies
pnpm install

# Start Local Dev Server
pnpm dev

# Build Production Bundle
pnpm build
```
