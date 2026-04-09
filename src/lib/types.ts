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
