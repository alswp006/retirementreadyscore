# Shared Context (auto-generated — do NOT modify)


## Shared Types Contract (IMPORT these, do NOT redefine)
```typescript
// Domain types — add your app-specific types here

export type FieldName = 'age' | 'monthlySaving' | 'currentAsset' | 'monthlySpend';

export interface RetirementInput {
  age: number;
  monthlySaving: number;
  currentAsset: number;
  monthlySpend: number;
}

export interface RetirementResult {
  /** 은퇴 가능 나이 — null이면 현재 저축으로 계산 불가 */
  retirementPossibleAge: number | null;
  /** 60세 기준 부족 자산 */
  shortfallAt60: number;
  /** 60세까지 월 추가 저축 필요액 */
  additionalMonthlySavingNeeded: number;
}

export interface RouteState {
  input: RetirementInput;
  result: RetirementResult;
}

export interface ValidationResult {
  hasError: boolean;
  help: string;
}

```

## Existing Codebase (import and use these — do NOT recreate)
### File Tree (src/)
  App.tsx
  components/
    AdSlot.tsx
    TossRewardAd.tsx
  hooks/
    useTossAd.ts
    useTossLogin.ts
    useTossPayment.ts
    useTossPromotion.ts
  lib/
    calculator.ts
    storage.ts
    types.ts
    utils.ts
  main.tsx
  pages/
    Home.tsx
  styles/
    globals.css
    reward-ad.css
  types/
    apps-in-toss.d.ts

### Exports (src/lib/)
- calculator.ts: export function parseIntegerLike(value: string): number | null; export function validateField(field: FieldName, value: number | null): ValidationResult; export function calculateRetirement(input: RetirementInput): RetirementResult
- storage.ts: export function getItem<T>(key: string): T | null; export function setItem<T>(key: string, value: T): void; export function removeItem(key: string): void
- types.ts: export type FieldName = 'age' | 'monthlySaving' | 'currentAsset' | 'monthlySpend'; export interface RetirementInput; export interface RetirementResult; export interface RouteState; export interface ValidationResult
- utils.ts: export function cn(...classes: (string | boolean | undefined | null)[]): string; export function formatNumber(n: number): string; export function formatCurrency(n: number, currency = 'KRW'): string

### Components (src/components/)
- AdSlot.tsx: AdSlot
- TossRewardAd.tsx: TossRewardAd

### Module Dependencies (import graph)
  lib/calculator.ts → imports: lib/types
CRITICAL: Before creating any new function, type, or component, check the list above. If something similar exists, import and use it.

## Already Implemented (do NOT duplicate or overwrite)
- 0001: Types & Logic (files: src/lib/types.ts, src/lib/calculator.ts)