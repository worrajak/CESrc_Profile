'use client';

import dynamic from 'next/dynamic';

const SCurveChart = dynamic(() => import('@/components/SCurveChart'), { ssr: false });

interface Props {
  progressLogs: { log_date: string; planned_pct: number; actual_pct: number }[];
  startDate?: string;
  endDate?: string;
}

export default function GrantTrackingClient({ progressLogs, startDate, endDate }: Props) {
  return (
    <SCurveChart
      dataPoints={progressLogs}
      startDate={startDate}
      endDate={endDate}
      height={320}
    />
  );
}
