import type { Creator, Campaign, Application, ContentCategory, PortfolioTemplate, PortfolioTemplateSection } from '../types/index';
import { simulateLatency, generateId } from '../services/mockUtils';

// ─── AI Pitch Generation ──────────────────────────────────────────────────

export async function generateAIPitch(
  creator: Creator,
  campaign: Campaign
): Promise<string> {
  await simulateLatency(800, 3000);

  const categoryOverlap = creator.contentCategories.filter((c) =>
    campaign.contentCategories.includes(c)
  );

  const topPortfolioItem = creator.portfolio
    .slice()
    .sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate)[0];

  const categoryStr =
    categoryOverlap.length > 0 ? categoryOverlap.join(' & ') : creator.contentCategories[0] ?? 'content';

  return `Hi ${campaign.title} team,

I'm ${creator.displayName}, a ${categoryStr} creator with a Creator Trust Score of ${creator.trustScore}/100.${
    topPortfolioItem
      ? ` My recent work on "${topPortfolioItem.title}" achieved a ${(topPortfolioItem.metrics.engagementRate * 100).toFixed(1)}% engagement rate, demonstrating my audience's strong connection with ${topPortfolioItem.category} content.`
      : ' I am passionate about creating authentic content that resonates with engaged communities.'
  }

Your campaign aligns perfectly with my content strategy and audience demographics. I would love to collaborate and deliver content that meets your goals around: ${campaign.requirements}

Looking forward to the possibility of working together.

${creator.displayName}`;
}

// ─── Portfolio Template Generation ───────────────────────────────────────

const TEMPLATE_STYLES = ['Minimalist', 'Story-driven', 'Data-first'] as const;

function buildSections(
  variantIndex: number,
  categories: ContentCategory[]
): PortfolioTemplateSection[] {
  const primary = categories[0] ?? 'content';
  const base: PortfolioTemplateSection[] = [
    { heading: 'About Me', placeholder: `Introduce yourself and your ${primary} niche`, required: true },
    { heading: 'Featured Work', placeholder: 'Showcase your top 3 pieces of content with metrics', required: true },
    { heading: 'Audience Insights', placeholder: 'Demographics, engagement rates, and top platforms', required: true },
  ];

  if (variantIndex === 1) {
    // Minimalist — lean and focused
    return [...base, { heading: 'Contact', placeholder: 'Preferred contact method for brand inquiries', required: true }];
  } else if (variantIndex === 2) {
    // Story-driven — narrative arc
    return [
      ...base,
      { heading: 'My Story', placeholder: 'Why you started creating in the ${primary} space', required: false },
      { heading: 'Brand Values', placeholder: 'Types of brands you align with and why', required: false },
    ];
  } else {
    // Data-first — numbers-led
    return [
      ...base,
      { heading: 'Campaign Results', placeholder: 'Past campaign performance: reach, engagement, conversions', required: false },
      { heading: 'Rate Card', placeholder: 'Collaboration packages and pricing tiers', required: false },
    ];
  }
}

export async function generatePortfolioTemplates(
  creator: Partial<Creator>
): Promise<PortfolioTemplate[]> {
  await simulateLatency(2000, 5000);

  const isGeneric = !creator.socialAccounts?.some((s) => s.connected);
  const categories: ContentCategory[] = creator.contentCategories ?? ['lifestyle'];

  return TEMPLATE_STYLES.map((style, i) => ({
    id: generateId(),
    variantIndex: i + 1,
    title: `${style} ${categories[0]} Portfolio`,
    suggestedCategories: categories,
    sections: buildSections(i + 1, categories),
    isGeneric,
  }));
}

// ─── Application Ranking ──────────────────────────────────────────────────

export function rankApplications(applications: Application[]): Application[] {
  return [...applications].sort(
    (a, b) => b.collaborationMatchScore - a.collaborationMatchScore
  );
}
