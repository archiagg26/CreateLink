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
  const CATEGORY_AFFINITIES: Record<string, string[]> = {
    beauty: ['fashion', 'lifestyle'],
    fashion: ['beauty', 'lifestyle'],
    lifestyle: ['beauty', 'fashion', 'travel', 'food'],
    travel: ['lifestyle', 'food'],
    food: ['lifestyle', 'travel'],
    tech: ['gaming', 'education'],
    gaming: ['tech'],
    fitness: ['lifestyle', 'travel'],
    finance: ['education'],
    education: ['finance', 'tech'],
  };

  // Niche Alignment Score (weight 0.40)
  let totalNicheScore = 0;
  if (inputs.campaignCategories.length > 0) {
    inputs.campaignCategories.forEach((campCat) => {
      if (inputs.creatorCategories.includes(campCat)) {
        totalNicheScore += 1.0;
      } else {
        const affinities = CATEGORY_AFFINITIES[campCat] || [];
        const hasAffinity = inputs.creatorCategories.some((creatorCat) =>
          affinities.includes(creatorCat)
        );
        if (hasAffinity) {
          totalNicheScore += 0.5;
        }
      }
    });
  }
  const categoryScore = inputs.campaignCategories.length > 0
    ? totalNicheScore / inputs.campaignCategories.length
    : 0.5; // fallback

  // Trust score proximity (weight 0.20)
  const trustDelta = inputs.creatorTrustScore - inputs.campaignMinTrustScore;
  const trustScoreVal =
    trustDelta >= 0
      ? Math.min(1, 1 + trustDelta / 100)
      : Math.max(0, 1 + trustDelta / 50);

  // Content Quality proximity (weight 0.15)
  const minQuality = inputs.campaignMinContentQuality ?? 85;
  const creatorQuality = inputs.creatorContentQuality ?? Math.round(inputs.creatorTrustScore * 0.95 + 4);
  const qualityDelta = creatorQuality - minQuality;
  const qualityScoreVal =
    qualityDelta >= 0
      ? Math.min(1, 1 + qualityDelta / 100)
      : Math.max(0, 1 + qualityDelta / 50);

  // Audience alignment (weight 0.25)
  const targetGroups = inputs.campaignTargetAgeGroups;
  const audienceScore =
    targetGroups && targetGroups.length > 0
      ? targetGroups.reduce(
          (sum, g) => sum + (inputs.audienceAgeGroups[g] ?? 0),
          0
        )
      : 0.5;

  const raw = categoryScore * 0.4 + trustScoreVal * 0.2 + qualityScoreVal * 0.15 + audienceScore * 0.25;
  return Math.round(Math.min(100, Math.max(0, raw * 100)));
}
