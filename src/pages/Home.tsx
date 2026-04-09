import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Top, TextField, Button, Spacing, Paragraph, Toast } from '@toss/tds-mobile';
import { parseIntegerLike, validateField, calculateRetirement } from '@/lib/calculator';
import { getItem, setItem } from '@/lib/storage';
import { generateHapticFeedback } from '@apps-in-toss/framework';
import type { FieldName, RetirementInput, RouteState } from '@/lib/types';

export default function Home() {
  const navigate = useNavigate();
  const [age, setAge] = useState<string>('');
  const [monthlySaving, setMonthlySaving] = useState<string>('');
  const [currentAsset, setCurrentAsset] = useState<string>('');
  const [monthlySpend, setMonthlySpend] = useState<string>('');
  const [showSaveFailToast, setShowSaveFailToast] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Initialize from lastInput on mount
  useEffect(() => {
    const lastInput = getItem<RetirementInput>('lastInput');
    if (lastInput) {
      setAge(String(lastInput.age));
      setMonthlySaving(String(lastInput.monthlySaving));
      setCurrentAsset(String(lastInput.currentAsset));
      setMonthlySpend(String(lastInput.monthlySpend));
    }
  }, []);

  // Parse and validate a single field
  const handleFieldChange = (fieldName: FieldName, rawValue: string) => {
    const parsed = parseIntegerLike(rawValue);
    const value = parsed === null ? '' : String(parsed);

    switch (fieldName) {
      case 'age':
        setAge(value);
        break;
      case 'monthlySaving':
        setMonthlySaving(value);
        break;
      case 'currentAsset':
        setCurrentAsset(value);
        break;
      case 'monthlySpend':
        setMonthlySpend(value);
        break;
    }
  };

  // Validation for each field
  const getValidationResult = (fieldName: FieldName, value: string) => {
    const parsed = value === '' ? null : parseInt(value, 10);
    return validateField(fieldName, parsed);
  };

  const ageValidation = getValidationResult('age', age);
  const savingValidation = getValidationResult('monthlySaving', monthlySaving);
  const assetValidation = getValidationResult('currentAsset', currentAsset);
  const spendValidation = getValidationResult('monthlySpend', monthlySpend);

  // Button disabled if any field has error
  const isDisabled =
    ageValidation.hasError ||
    savingValidation.hasError ||
    assetValidation.hasError ||
    spendValidation.hasError;

  const handleCalculate = async () => {
    if (isDisabled) return;

    try {
      generateHapticFeedback({ type: 'success' });
    } catch {
      // Haptic feedback might not be available in dev
    }

    const input: RetirementInput = {
      age: parseInt(age, 10),
      monthlySaving: parseInt(monthlySaving, 10),
      currentAsset: parseInt(currentAsset, 10),
      monthlySpend: parseInt(monthlySpend, 10),
    };

    const result = calculateRetirement(input);

    // Try to save lastInput
    try {
      setItem('lastInput', input);
    } catch {
      // Show toast but continue navigation
      setShowSaveFailToast(true);
      setTimeout(() => setShowSaveFailToast(false), 3000);
    }

    // Navigate to result
    const routeState: RouteState = { input, result };
    navigate('/result', { state: routeState });
  };

  return (
    <>
      <Top title={<Top.TitleParagraph>은퇴 계산해요</Top.TitleParagraph>} />
      <div style={{ padding: '16px', paddingBottom: '120px' }}>
        <Spacing size={16} />

        {/* Hero Summary Card */}
        <div
          style={{
            backgroundColor: 'var(--tds-color-grey50)',
            borderRadius: 16,
            padding: 20,
          }}
        >
          <Paragraph.Text typography="st11" color="secondary">
            입력값으로 60세 기준을 계산해요
          </Paragraph.Text>
          <Spacing size={8} />
          <Paragraph.Text typography="st8" color="tertiary">
            나이, 월저축, 현재자산, 월지출을 입력해요
          </Paragraph.Text>
        </div>

        <Spacing size={24} />
        <Paragraph.Text typography="t4">기본 정보</Paragraph.Text>
        <Spacing size={12} />

        <TextField
          ref={firstFieldRef}
          variant="box"
          label="나이"
          value={age}
          onChange={(e) => handleFieldChange('age', e.target.value)}
          hasError={ageValidation.hasError}
          help={ageValidation.hasError ? ageValidation.help : undefined}
          inputMode="numeric"
        />
        <Spacing size={12} />

        <TextField
          variant="box"
          label="월저축(원)"
          value={monthlySaving}
          onChange={(e) => handleFieldChange('monthlySaving', e.target.value)}
          hasError={savingValidation.hasError}
          help={savingValidation.hasError ? savingValidation.help : undefined}
          inputMode="numeric"
        />
        <Spacing size={12} />

        <TextField
          variant="box"
          label="현재자산(원)"
          value={currentAsset}
          onChange={(e) => handleFieldChange('currentAsset', e.target.value)}
          hasError={assetValidation.hasError}
          help={assetValidation.hasError ? assetValidation.help : undefined}
          inputMode="numeric"
        />
        <Spacing size={12} />

        <TextField
          variant="box"
          label="월지출(원)"
          value={monthlySpend}
          onChange={(e) => handleFieldChange('monthlySpend', e.target.value)}
          hasError={spendValidation.hasError}
          help={spendValidation.hasError ? spendValidation.help : undefined}
          inputMode="numeric"
        />

        <Spacing size={24} />
      </div>

      {/* Bottom Fixed CTA */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          backgroundColor: 'var(--tds-color-background)',
        }}
      >
        <Button
          variant="fill"
          size="large"
          disabled={isDisabled}
          onClick={handleCalculate}
        >
          계산하기
        </Button>
      </div>

      {/* Toast for save failure */}
      <Toast
        open={showSaveFailToast}
        position="bottom"
        text="입력값을 저장하지 못했어요"
      />
    </>
  );
}
