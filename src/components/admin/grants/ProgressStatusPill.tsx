'use client';

/**
 * ProgressStatusPill — small chip showing the current progress status of
 * one workplan entity (daily task, milestone, WP month cell, disbursement,
 * etc.). Clicking the chip opens ReportProgressModal so the team can
 * submit a status update (with reason iff status is not-ok).
 */

import { useState } from 'react';
import { STATUS_META, type EntityType, type ProgressStatus } from '@/lib/progressStatus';
import ReportProgressModal from './ReportProgressModal';

export default function ProgressStatusPill({
  grantId,
  entityType,
  entityId,
  status,
  note,
  reportedAt,
  compact,
  onReported,
}: {
  grantId: string;
  entityType: EntityType;
  entityId: string;
  status: ProgressStatus | null | undefined;
  note?: string | null;
  reportedAt?: string | null;
  compact?: boolean;
  onReported: () => void;
}) {
  const [open, setOpen] = useState(false);
  const s = (status || 'not_started') as ProgressStatus;
  const meta = STATUS_META[s];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 ${compact ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5'} rounded-full border font-medium hover:opacity-80 transition ${meta.chip}`}
        title={
          (note ? `${meta.label} · ${note}` : meta.label) +
          (reportedAt ? ` · อัปเดต ${new Date(reportedAt).toLocaleDateString('th-TH')}` : '')
        }
      >
        <span>{meta.icon}</span>
        {!compact && <span>{meta.label}</span>}
      </button>

      {open && (
        <ReportProgressModal
          grantId={grantId}
          entityType={entityType}
          entityId={entityId}
          currentStatus={s}
          onClose={() => setOpen(false)}
          onReported={() => {
            setOpen(false);
            onReported();
          }}
        />
      )}
    </>
  );
}
