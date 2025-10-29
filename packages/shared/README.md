# @barbershop/shared

**Shared Package** - Common utilities and types across all layers.

## Purpose

Contains shared utilities, types, and constants that can be used across all layers without violating dependency rules.

## Architecture

```
src/
├── types/        # Shared TypeScript types
├── utils/        # Utility functions
└── constants/    # Application constants
```

## Rules

- ✅ Pure utilities and types only
- ✅ No business logic
- ✅ No external dependencies (when possible)
- ✅ Can be used by any layer

## Usage

```typescript
import { Result } from '@barbershop/shared/types'
import { formatDate } from '@barbershop/shared/utils'
import { APP_CONSTANTS } from '@barbershop/shared/constants'
```
