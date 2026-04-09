import { describe, it, expect } from 'vitest';
import { parseIntegerLike, validateField } from '@/lib/calculator';

describe('parseIntegerLike', () => {
  it('AC1: 12.5 → 12 (소수점 이하 버림)', () => {
    expect(parseIntegerLike('12.5')).toBe(12);
  });

  it('AC2: -5 → 5 (절댓값)', () => {
    expect(parseIntegerLike('-5')).toBe(5);
  });

  it('AC3: 1,000 → 1000 (구분자 제거)', () => {
    expect(parseIntegerLike('1,000')).toBe(1000);
  });

  it('AC4: abc → null (숫자 전무)', () => {
    expect(parseIntegerLike('abc')).toBeNull();
  });
});

describe('validateField', () => {
  it('AC5: null → 필수 입력값이에요', () => {
    expect(validateField('age', null)).toEqual({ hasError: true, help: '필수 입력값이에요' });
  });

  it('AC6: age=18 → 19세 이상이어야 해요', () => {
    expect(validateField('age', 18)).toEqual({ hasError: true, help: '19세 이상이어야 해요' });
  });

  it('AC7: age=81 → 80세 이하로 입력해요', () => {
    expect(validateField('age', 81)).toEqual({ hasError: true, help: '80세 이하로 입력해요' });
  });

  it('AC8: monthlySaving=-1 → 0원 이상 입력해요', () => {
    expect(validateField('monthlySaving', -1)).toEqual({ hasError: true, help: '0원 이상 입력해요' });
  });

  it('AC9: monthlySaving=10000001 → 1,000만원 이하로 입력해요', () => {
    expect(validateField('monthlySaving', 10000001)).toEqual({ hasError: true, help: '1,000만원 이하로 입력해요' });
  });

  it('AC10: currentAsset=10000000001 → 100억원 이하로 입력해요', () => {
    expect(validateField('currentAsset', 10000000001)).toEqual({ hasError: true, help: '100억원 이하로 입력해요' });
  });

  it('AC11: monthlySpend=0 → 1원 이상 입력해요', () => {
    expect(validateField('monthlySpend', 0)).toEqual({ hasError: true, help: '1원 이상 입력해요' });
  });

  it('AC12: monthlySpend=20000001 → 2,000만원 이하로 입력해요', () => {
    expect(validateField('monthlySpend', 20000001)).toEqual({ hasError: true, help: '2,000만원 이하로 입력해요' });
  });

  it('valid age → no error', () => {
    expect(validateField('age', 30)).toEqual({ hasError: false, help: '' });
  });

  it('valid monthlySaving boundary → no error', () => {
    expect(validateField('monthlySaving', 0)).toEqual({ hasError: false, help: '' });
    expect(validateField('monthlySaving', 10_000_000)).toEqual({ hasError: false, help: '' });
  });
});
