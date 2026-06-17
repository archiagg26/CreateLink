import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCreatorStore } from '../stores/creatorStore';
import { getStore } from '../services/store';
import type { Creator, ContentCategory, SocialAccount } from '../types/index';

const CATEGORIES: ContentCategory[] = [
  'beauty', 'fitness', 'tech', 'food', 'travel',
  'gaming', 'lifestyle', 'finance', 'education', 'fashion'
];

export default function CreatorOnboardingPage() {
  const { currentUser } = useAuthStore();
  const { loadCreator } = useCreatorStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<ContentCategory[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { platform: 'instagram', handle: '', followerCount: 0, connected: false },
    { platform: 'tiktok', handle: '', followerCount: 0, connected: false },
    { platform: 'youtube', handle: '', followerCount: 0, connected: false },
  ]);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  const handleToggleCategory = (category: ContentCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSocialChange = (platform: string, field: 'handle' | 'followerCount', value: string) => {
    setSocialAccounts(socialAccounts.map((account) => {
      if (account.platform === platform) {
        if (field === 'handle') {
          return { ...account, handle: value, connected: !!value };
        } else {
          return { ...account, followerCount: parseInt(value) || 0 };
        }
      }
      return account;
    }));
  };

  const handleComplete = async (withTemplates: boolean) => {
    if (!currentUser) return;

    // Create the creator profile
    const creator: Creator = {
      id: currentUser.id,
      userId: currentUser.id,
      displayName: displayName || currentUser.email.split('@')[0],
      bio: bio || 'Authentic content creator passionate about storytelling.',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.id}`,
      contentCategories: selectedCategories,
      socialAccounts: socialAccounts.filter((s) => s.connected),
      trustScore: 80, // initial default trust score
      trustScorePartialData: false,
      portfolio: [],
      collaborationHistory: [],
      insights: {
        audienceDemographics: {
          ageGroups: { '18-24': 0.45, '25-34': 0.35, '35-44': 0.2 },
          topCountries: ['USA', 'UK', 'Canada'],
          genderSplit: { male: 40, female: 55, other: 5 },
        },
        primaryCategories: selectedCategories,
        averageEngagementRate: 0.045,
        collaborationCount: 0,
        successRate: 1.0,
      },
      verificationStatus: 'unverified',
    };

    // Save to the in-memory store
    const store = getStore();
    store.creators.set(currentUser.id, creator);

    // Refresh creator store
    await loadCreator(currentUser.id);

    if (withTemplates) {
      navigate('/creator/me/ai-templates');
    } else {
      navigate('/creator/me/portfolio');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center text-[#1F1F1F] py-12 bg-[#F6F2E8]">
      <div className="max-w-2xl w-full bg-white border border-[#E7E1D8] rounded-[20px] p-8 sm:p-12 shadow-card relative overflow-hidden">
        {/* Glow removed */}

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === s
                    ? 'bg-[#1F1F1F] text-white shadow-soft'
                    : step > s
                    ? 'bg-[#F8EFF3] text-[#A8678A] border border-[#E7E1D8]'
                    : 'bg-white text-[#6E6A65] border border-[#E7E1D8]'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 mx-4 flex-1 transition-all duration-300 ${
                    step > s ? 'bg-[#A8678A]' : 'bg-[#E7E1D8]'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Wizard Steps */}
        <div className="relative z-10">
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-extrabold mb-2 text-[#1F1F1F]">
                Create Your Profile
              </h2>
              <p className="text-[#6E6A65] mb-8">Tell us about yourself and select your niche categories.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#1F1F1F]">Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Creative Nomad"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white border border-[#E7E1D8] rounded-xl px-4 py-3 text-[#1F1F1F] placeholder-[#6E6A65] focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#1F1F1F]">Bio / About</label>
                  <textarea
                    placeholder="Tell brands what makes your content unique..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-[#E7E1D8] rounded-xl px-4 py-3 text-[#1F1F1F] placeholder-[#6E6A65] focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A] resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-[#1F1F1F]">Content Categories</label>
                  <div className="flex flex-wrap gap-2.5">
                    {CATEGORIES.map((cat) => {
                      const selected = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleToggleCategory(cat)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all duration-200 ${
                            selected
                              ? 'bg-[#F8EFF3] border-[#A8678A] text-[#A8678A] shadow-soft'
                              : 'bg-white border-[#E7E1D8] text-[#6E6A65] hover:border-[#A8678A] hover:text-[#1F1F1F]'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!displayName || selectedCategories.length === 0}
                  className="px-6 py-3 rounded-xl bg-[#1F1F1F] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-200"
                >
                  Continue to Socials
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-3xl font-extrabold mb-2 text-[#1F1F1F]">
                Link Social Accounts
              </h2>
              <p className="text-[#6E6A65] mb-8">Enter your social handles and follower counts to link them (mocked).</p>

              <div className="space-y-6">
                {socialAccounts.map((account) => (
                  <div key={account.platform} className="bg-[#F8EFF3] border border-[#E7E1D8] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4">
                    <span className="text-sm font-bold uppercase tracking-wider text-[#A8678A] w-24">
                      {account.platform}
                    </span>
                    <input
                      type="text"
                      placeholder={`@handle`}
                      value={account.handle}
                      onChange={(e) => handleSocialChange(account.platform, 'handle', e.target.value)}
                      className="flex-1 bg-white border border-[#E7E1D8] rounded-xl px-4 py-2 text-[#1F1F1F] placeholder-[#6E6A65] text-sm focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A]"
                    />
                    <input
                      type="number"
                      placeholder="Followers"
                      value={account.followerCount || ''}
                      onChange={(e) => handleSocialChange(account.platform, 'followerCount', e.target.value)}
                      className="w-32 bg-white border border-[#E7E1D8] rounded-xl px-4 py-2 text-[#1F1F1F] placeholder-[#6E6A65] text-sm focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A]"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl bg-white border border-[#E7E1D8] text-[#1F1F1F] font-bold hover:bg-[#F8EFF3] transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-[#1F1F1F] text-white font-bold hover:opacity-90 transition-all duration-200"
                >
                  Continue to Templates
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <h2 className="text-3xl font-extrabold mb-3 text-[#1F1F1F]">
                Setup Portfolio Structure
              </h2>
              <p className="text-[#6E6A65] mb-8 max-w-lg mx-auto">
                Would you like to generate AI portfolio templates based on your content category style? You can choose or customize them later.
              </p>

              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => handleComplete(true)}
                  className="w-full py-4 rounded-xl bg-[#1F1F1F] text-white font-bold shadow-soft hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l8.982-11.795H13.62l1.317-7.705L6 13.205h5.132L9.813 15.904Z" />
                  </svg>
                  Generate AI Templates (Recommended)
                </button>

                <button
                  type="button"
                  onClick={() => handleComplete(false)}
                  className="w-full py-3.5 rounded-xl bg-white border border-[#E7E1D8] text-[#1F1F1F] font-semibold hover:bg-[#F8EFF3] transition-all duration-200"
                >
                  Create Empty Portfolio
                </button>
              </div>

              <div className="mt-8 flex justify-start">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-white border border-[#E7E1D8] text-[#1F1F1F] font-bold hover:bg-[#F8EFF3] transition-all duration-200"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
