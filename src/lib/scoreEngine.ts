import type { CreatorScoreInputs, BrandScoreInputs, MatchScoreInputs } from '../types/index';

// ─── Creator Trust Score ───────────────────────────────────────────────────

const CREATOR_SCORE_WEIGHTS: Record<keyof CreatorScoreInputs, number> = {
  audienceAuthenticity: 0.30,
  commentQualityScore: 0.20,
  followerGrowthPattern: 0.15,
  engagementConsistency: 0.20,
  brandCollaborationSuccessRate: 0.15,
};

export function computeCreatorTrustScore(
  inputs: Partial<CreatorScoreInputs>
): { score: number; partialData: boolean } {
  const keys = Object.keys(CREATOR_SCORE_WEIGHTS) as (keyof CreatorScoreInputs)[];
  const available = keys.filter((k) => inputs[k] !== undefined);

  if (available.length === 0) return { score: 0, partialData: true };

  const totalWeight = available.reduce((sum, k) => sum + CREATOR_SCORE_WEIGHTS[k], 0);
  const weightedSum = available.reduce(
    (sum, k) => sum + (inputs[k] as number) * CREATOR_SCORE_WEIGHTS[k],
    0
  );

  const normalised = weightedSum / totalWeight;
  const score = Math.round(Math.min(100, Math.max(0, normalised * 100)));
  return { score, partialData: available.length < keys.length };
}

// ─── Brand Score ──────────────────────────────────────────────────────────

const BRAND_SCORE_WEIGHTS: Record<keyof BrandScoreInputs, number> = {
  paymentReliability: 0.35,
  creatorReviewScore: 0.25,
  campaignSuccessRate: 0.20,
  communicationQualityScore: 0.10,
  averageResponseSpeed: 0.10,
};

export function computeBrandScore(
  inputs: Partial<BrandScoreInputs>
): { score: number; partialData: boolean } {
  const keys = Object.keys(BRAND_SCORE_WEIGHTS) as (keyof BrandScoreInputs)[];
  const available = keys.filter((k) => inputs[k] !== undefined);

  if (available.length === 0) return { score: 0, partialData: true };

  const totalWeight = available.reduce((sum, k) => sum + BRAND_SCORE_WEIGHTS[k], 0);
  const weightedSum = available.reduce(
    (sum, k) => sum + (inputs[k] as number) * BRAND_SCORE_WEIGHTS[k],
    0
  );

  const normalised = weightedSum / totalWeight;
  const score = Math.round(Math.min(100, Math.max(0, normalised * 100)));
  return { score, partialData: available.length < keys.length };
}

// ─── Collaboration Match Score ────────────────────────────────────────────

export function computeCollaborationMatchScore(inputs: MatchScoreInputs): number {
  // Category overlap (weight 0.40)
  const overlap = inputs.creatorCategories.filter((c) =>
    inputs.campaignCategories.includes(c)
  ).length;
  const categoryScore =
    inputs.campaignCategories.length > 0
      ? overlap / inputs.campaignCategories.length
      : 0;

  // Trust score proximity (weight 0.35)
  const trustDelta = inputs.creatorTrustScore - inputs.campaignMinTrustScore;
  const trustScore =
    trustDelta >= 0
      ? Math.min(1, 1 + trustDelta / 100)
      : Math.max(0, 1 + trustDelta / 50);

  // Audience alignment (weight 0.25)
  const targetGroups = inputs.campaignTargetAgeGroups;
  const audienceScore =
    targetGroups.length > 0
      ? targetGroups.reduce(
          (sum, g) => sum + (inputs.audienceAgeGroups[g] ?? 0),
          0
        )
      : 0.5;

  const raw = categoryScore * 0.4 + trustScore * 0.35 + audienceScore * 0.25;
  return Math.round(Math.min(100, Math.max(0, raw * 100)));
}
