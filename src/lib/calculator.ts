import type { FieldName, RetirementInput, RetirementResult, ValidationResult } from '@/lib/types';

/**
 * 문자열을 비음수 정수로 변환한다.
 * - 소수점 이하 버림 (12.5 → 12)
 * - 절댓값 적용 (-5 → 5)
 * - 천 단위 구분자 제거 (1,000 → 1000)
 * - 숫자가 전혀 없으면 null 반환
 */
export function parseIntegerLike(value: string): number | null {
  const cleaned = value.replace(/,/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return Math.floor(Math.abs(num));
}

/**
 * 필드별 필수·범위 검증. 순수 함수 — UI에서 즉시 반영 가능.
 */
export function validateField(field: FieldName, value: number | null): ValidationResult {
  if (value === null) {
    return { hasError: true, help: '필수 입력값이에요' };
  }

  switch (field) {
    case 'age':
      if (value < 19) return { hasError: true, help: '19세 이상이어야 해요' };
      if (value > 80) return { hasError: true, help: '80세 이하로 입력해요' };
      break;
    case 'monthlySaving':
      if (value < 0) return { hasError: true, help: '0원 이상 입력해요' };
      if (value > 10_000_000) return { hasError: true, help: '1,000만원 이하로 입력해요' };
      break;
    case 'currentAsset':
      if (value < 0) return { hasError: true, help: '0원 이상 입력해요' };
      if (value > 10_000_000_000) return { hasError: true, help: '100억원 이하로 입력해요' };
      break;
    case 'monthlySpend':
      if (value < 1) return { hasError: true, help: '1원 이상 입력해요' };
      if (value > 20_000_000) return { hasError: true, help: '2,000만원 이하로 입력해요' };
      break;
  }

  return { hasError: false, help: '' };
}

/**
 * 은퇴 준비도 계산.
 *
 * 가정:
 * - 연간 수익률 4% (월 복리)
 * - 은퇴 후 월 지출 = input.monthlySpend (실질 유지)
 * - 은퇴 자산 목표 = monthlySpend × 12 × 25 (25년치, 4% 룰)
 * - retirementPossibleAge: 자산이 은퇴 목표에 도달하는 나이 (최대 100세, 도달 불가 시 null)
 * - shortfallAt60: 60세 시점 (자산 목표 - 예상 자산), 음수면 0
 * - additionalMonthlySavingNeeded: shortfallAt60을 60세까지 채우기 위한 월 추가 저축액, 음수면 0
 */
export function calculateRetirement(input: RetirementInput): RetirementResult {
  const ANNUAL_RATE = 0.04;
  const MONTHLY_RATE = ANNUAL_RATE / 12;
  const TARGET_YEARS = 25;

  const retirementTarget = input.monthlySpend * 12 * TARGET_YEARS;

  // 월별 복리로 자산 성장 시뮬레이션
  let asset = input.currentAsset;
  let retirementPossibleAge: number | null = null;

  for (let age = input.age; age <= 100; age++) {
    for (let m = 0; m < 12; m++) {
      asset = asset * (1 + MONTHLY_RATE) + input.monthlySaving;
    }
    if (retirementPossibleAge === null && asset >= retirementTarget) {
      retirementPossibleAge = age + 1;
    }
  }

  // 60세 시점 예상 자산
  const monthsTo60 = Math.max(0, (60 - input.age) * 12);
  let assetAt60 = input.currentAsset;
  for (let m = 0; m < monthsTo60; m++) {
    assetAt60 = assetAt60 * (1 + MONTHLY_RATE) + input.monthlySaving;
  }

  const shortfallAt60 = Math.max(0, retirementTarget - assetAt60);

  // 60세까지 남은 달 수로 필요 월 추가 저축액 계산 (미래가치 공식 역산)
  let additionalMonthlySavingNeeded = 0;
  if (shortfallAt60 > 0 && monthsTo60 > 0) {
    // FV of annuity = PMT × ((1+r)^n - 1) / r
    // PMT = shortfall × r / ((1+r)^n - 1)
    const fvFactor = (Math.pow(1 + MONTHLY_RATE, monthsTo60) - 1) / MONTHLY_RATE;
    additionalMonthlySavingNeeded = Math.ceil(shortfallAt60 / fvFactor);
  }

  return { retirementPossibleAge, shortfallAt60, additionalMonthlySavingNeeded };
}
