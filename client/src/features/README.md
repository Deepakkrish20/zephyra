# Zephyra Client Feature Modules

To maintain clear ownership boundaries and minimize merge conflicts when developers work simultaneously, all business domain logic should be modularized within the `client/src/features/` directory.

## Recommended Feature Directory Layout

Each feature module under `features/` should follow this structure:

```
features/[feature-name]/
├── components/     # Feature-specific, non-global UI components
├── hooks/          # Custom hooks scoped only to this feature
├── services/       # API interaction layer for this feature
├── index.js        # Public API exposing only necessary modules externally
```

## Features Registry

- **auth/**: Sign in, registration, session management, and JWT state bindings.
- **products/**: Catalogue browsing, inventory grids, and search queries.
- **cart/**: Shopping cart logic, persistent state handlers.
- **orders/**: Order creation, invoicing, status checklists.
- **tracking/**: Live Leaflet map, GPS coordinates parser, agent marker indicators.
- **notifications/**: Live alert sound and toast integrations, notification feed panels.
- **admin/**: Product registration forms, dispatcher override switches, agent control center.
- **delivery/**: Available job boards, active delivery step emulators, signature capture.
