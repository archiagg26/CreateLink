import { getStore } from '../services/store';
import { generateId, nowISO } from '../services/mockUtils';

export function recordScoreAudit(
  subjectId: string,
  subjectType: 'creator' | 'brand',
  inputs: Record<string, number>,
  weights: Record<string, number>,
  resultingScore: number
): void {
  const store = getStore();
  store.scoreAuditLogs.push({
    id: generateId(),
    subjectId,
    subjectType,
    timestamp: nowISO(),
    inputs: { ...inputs },
    weights: { ...weights },
    resultingScore,
  });
}
