import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Top,
  Paragraph,
  Button,
  Spacing,
  ListRow,
} from '@toss/tds-mobile';
import { useTossAd } from '@/hooks/useTossAd';
import { generateHapticFeedback } from '@apps-in-toss/framework';
import { formatCurrency } from '@/lib/utils';
import type { RouteState } from '@/lib/types';

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adRetryKey, setAdRetryKey] = useState(0);

  const routeState = location.state as RouteState | null;
  const hasValidState = routeState?.input && routeState?.result;

  if (!hasValidState) {
    return (
      <>
        <Top title={<Top.TitleParagraph>계산 결과예요</Top.TitleParagraph>} />
        <div style={{ padding: '16px', paddingBottom: '100px' }}>
          <Spacing size={16} />
          <Paragraph.Text typography="st6">
            계산 데이터를 찾을 수 없어요
          </Paragraph.Text>
          <Spacing size={8} />
          <Paragraph.Text typography="st6" color="tertiary">
            홈에서 다시 계산해 주세요
          </Paragraph.Text>
          <Spacing size={16} />
          <Button
            variant="fill"
            size="large"
            aria-label="홈으로"
            onClick={() => navigate('/')}
          >
            홈으로
          </Button>
        </div>
      </>
    );
  }

  const { result } = routeState;
  const {
    retirementPossibleAge,
    shortfallAt60,
    additionalMonthlySavingNeeded,
  } = result;

  return (
    <>
      <Top title={<Top.TitleParagraph>계산 결과예요</Top.TitleParagraph>} />
      <div style={{ padding: '16px', paddingBottom: '100px' }}>
        <Spacing size={16} />

        <RewardAdGate
          key={adRetryKey}
          retirementPossibleAge={retirementPossibleAge}
          shortfallAt60={shortfallAt60}
          additionalMonthlySavingNeeded={additionalMonthlySavingNeeded}
          onRetry={() => setAdRetryKey((prev) => prev + 1)}
        />
      </div>

      {/* Bottom CTA */}
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
          variant="weak"
          size="large"
          onClick={() => {
            try {
              generateHapticFeedback({ type: 'tickWeak' });
            } catch {
              // Haptic feedback might not be available
            }
            navigate('/');
          }}
        >
          홈으로
        </Button>
      </div>
    </>
  );
}

/**
 * RewardAdGate: 광고 게이팅 컴포넌트
 * - 로딩 중: "광고를 불러오고 있어요" 표시, 상세 숫자 미노출
 * - 광고 성공: 결과 표시
 * - 광고 실패: 에러 UI + 재시도/홈으로 버튼, 상세 숫자 미노출
 */
interface RewardAdGateProps {
  retirementPossibleAge: number | null;
  shortfallAt60: number;
  additionalMonthlySavingNeeded: number;
  onRetry: () => void;
}

function RewardAdGate({
  retirementPossibleAge,
  shortfallAt60,
  additionalMonthlySavingNeeded,
  onRetry,
}: RewardAdGateProps) {
  const navigate = useNavigate();
  const { reward, show } = useTossAd({ slotId: 'result-unlock' });
  const [unlocked, setUnlocked] = useState(false);
  const [adFailed, setAdFailed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const TIMEOUT_MS = 15000;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Auto-start ad loading when component mounts or after retry
  useEffect(() => {
    if (unlocked || reward || adFailed) return; // Already resolved

    const loadAd = async () => {
      timeoutRef.current = setTimeout(() => {
        setAdFailed(true);
      }, TIMEOUT_MS);

      try {
        await show();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setUnlocked(true);
      } catch {
        // Ad load/play failed
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setAdFailed(true);
      }
    };

    loadAd();
  }, []); // Only on mount

  // If unlocked or reward received, show content
  if (unlocked || reward) {
    return <ResultContent
      retirementPossibleAge={retirementPossibleAge}
      shortfallAt60={shortfallAt60}
      additionalMonthlySavingNeeded={additionalMonthlySavingNeeded}
    />;
  }

  // If ad failed, show error UI
  if (adFailed) {
    return (
      <>
        <Paragraph.Text typography="st6">
          광고를 불러올 수 없어요
        </Paragraph.Text>
        <Spacing size={12} />
        <Button variant="fill" size="large" onClick={onRetry}>
          다시 시도
        </Button>
        <Spacing size={8} />
        <Button variant="weak" size="large" onClick={() => navigate('/')}>
          홈으로
        </Button>
      </>
    );
  }

  // Loading state
  return (
    <Paragraph.Text typography="st6" color="tertiary">
      광고를 불러오고 있어요
    </Paragraph.Text>
  );
}

/**
 * ResultContent: 광고 게이팅 통과 후 표시할 결과 컴포넌트
 */
interface ResultContentProps {
  retirementPossibleAge: number | null;
  shortfallAt60: number;
  additionalMonthlySavingNeeded: number;
}

function ResultContent({
  retirementPossibleAge,
  shortfallAt60,
  additionalMonthlySavingNeeded,
}: ResultContentProps) {
  const navigate = useNavigate();

  const retirementAgeText =
    retirementPossibleAge === null
      ? '현재 저축으로는 계산할 수 없어요'
      : `${retirementPossibleAge}세`;

  const shortfallText = formatCurrency(shortfallAt60);
  const additionalSavingText = formatCurrency(additionalMonthlySavingNeeded);

  return (
    <>
      {/* Hero Summary Card */}
      <div
        style={{
          backgroundColor: 'var(--tds-color-grey50)',
          borderRadius: 16,
          padding: 20,
        }}
      >
        <Paragraph.Text typography="st11" color="secondary">
          핵심 요약
        </Paragraph.Text>
        <Spacing size={8} />
        <Paragraph.Text typography="t4">은퇴 가능 나이</Paragraph.Text>
        <Spacing size={8} />
        <Paragraph.Text typography="t1">
          {retirementAgeText}
        </Paragraph.Text>
      </div>

      <Spacing size={24} />
      <Paragraph.Text typography="t4">60세 기준</Paragraph.Text>
      <Spacing size={12} />

      <ListRow
        contents={
          <ListRow.Texts
            type="2RowTypeA"
            top="부족 자산"
            bottom={shortfallText}
          />
        }
      />
      <ListRow
        contents={
          <ListRow.Texts
            type="2RowTypeA"
            top="월 추가 저축 필요액"
            bottom={additionalSavingText}
          />
        }
      />

      <Spacing size={24} />
      <Button
        variant="weak"
        size="large"
        onClick={() => {
          try {
            generateHapticFeedback({ type: 'success' });
          } catch {
            // Haptic feedback might not be available
          }
          navigate('/');
        }}
      >
        다시 계산하기
      </Button>
    </>
  );
}
