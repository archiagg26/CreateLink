import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useBrandStore } from '../stores/brandStore';
import * as brandService from '../services/brandService';
import type { ContentCategory, CompensationType } from '../types/index';

const CATEGORIES: ContentCategory[] = [
  'beauty', 'fitness', 'tech', 'food', 'travel',
  'gaming', 'lifestyle', 'finance', 'education', 'fashion'
];

export default function CampaignEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuthStore();
  const { brand, loadBrand, publishCampaign } = useBrandStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ContentCategory[]>([]);
  const [compensationType, setCompensationType] = useState<CompensationType>('paid');
  const [compensationAmount, setCompensationAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  const isEdit = !!id;

  useEffect(() => {
    if (currentUser) {
      loadBrand(currentUser.id);
    }
  }, [currentUser, loadBrand]);

  useEffect(() => {
    if (isEdit && id) {
      Promise.resolve().then(() => {
        setLoading(true);
      });
      brandService.getCampaign(id)
        .then((campaign) => {
          if (campaign) {
            setTitle(campaign.title);
            setDescription(campaign.description);
            setRequirements(campaign.requirements);
            setSelectedCategories(campaign.contentCategories);
            setCompensationType(campaign.compensationType);
            setCompensationAmount(campaign.compensationAmount ? String(campaign.compensationAmount) : '');
            setDeadline(campaign.deadline.split('T')[0]);
          }
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load campaign.');
          setLoading(false);
        });
    }
  }, [isEdit, id]);

  const handleToggleCategory = (cat: ContentCategory) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand) return;
    setError('');

    const amount = compensationAmount ? parseFloat(compensationAmount) : null;
    const deadlineISO = new Date(deadline).toISOString();

    const campaignData = {
      title,
      description,
      requirements,
      contentCategories: selectedCategories,
      compensationType,
      compensationAmount: amount,
      deadline: deadlineISO,
    };

    try {
      if (isEdit && id) {
        await brandService.updateCampaign(id, campaignData);
      } else {
        await publishCampaign(brand.id, campaignData as Parameters<typeof publishCampaign>[1]);
      }
      navigate(`/brand/${brand.id}`);
    } catch (err) {
      setError((err as Error).message || 'Failed to save campaign.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#A8678A] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#6E6A65] text-sm">Loading campaign details...</p>
      </div>
    );
  }

  // Check publish restriction
  const isRestricted = brand && brand.brandScore < 40 && !brand.isNewToPlatform;

  return (
    <div className="max-w-3xl mx-auto bg-white border border-[#E7E1D8] rounded-[20px] p-6 sm:p-10 shadow-card relative overflow-hidden">
      {/* Glow removed */}

      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#1F1F1F]">
          {isEdit ? 'Edit Campaign' : 'Create Collaboration Campaign'}
        </h2>
        <p className="text-[#6E6A65] text-sm mt-1">
          Publish campaign requirements and connect with matches in the network.
        </p>
      </div>

      {isRestricted ? (
        <div className="bg-[#F8EFF3] border border-[#A8678A] text-[#A8678A] p-6 rounded-[20px]">
          <h3 className="font-bold text-lg mb-2">Publishing Restricted</h3>
          <p className="text-sm leading-relaxed mb-4">
            Your Brand Score is currently <span className="font-bold">{brand?.brandScore}</span>, which is below the platform minimum of 40. New campaign publishing has been restricted pending moderator review.
          </p>
          <button
            onClick={() => navigate(`/brand/${brand?.id}`)}
            className="px-5 py-2.5 rounded-xl bg-white border border-[#E7E1D8] text-[#1F1F1F] text-xs font-semibold hover:bg-[#F8EFF3] transition-colors"
          >
            Back to Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-[#F8EFF3] border border-[#A8678A] text-[#A8678A] px-5 py-3 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6A65] mb-2">Campaign Title</label>
            <input
              type="text"
              placeholder="e.g. Summer Skincare Content Partnership"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-[#E7E1D8] rounded-xl px-4 py-3 text-[#1F1F1F] placeholder-[#6E6A65] focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6A65] mb-2">Description</label>
            <textarea
              placeholder="Describe the campaign objectives, deliverables, and expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-white border border-[#E7E1D8] rounded-xl px-4 py-3 text-[#1F1F1F] placeholder-[#6E6A65] focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A] resize-none"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6A65] mb-2">Requirements</label>
            <textarea
              placeholder="List specific follower criteria, location requirements, or content guidelines..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              className="w-full bg-white border border-[#E7E1D8] rounded-xl px-4 py-3 text-[#1F1F1F] placeholder-[#6E6A65] focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A] resize-none"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compensation Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6A65] mb-2">Compensation</label>
              <select
                value={compensationType}
                onChange={(e) => setCompensationType(e.target.value as CompensationType)}
                className="w-full bg-white border border-[#E7E1D8] rounded-xl px-4 py-3 text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A]"
              >
                <option value="paid">Paid Collaboration</option>
                <option value="gifted">Gifted / Barter</option>
                <option value="commission">Commission Basis</option>
                <option value="revenue_share">Revenue Share</option>
              </select>
            </div>

            {/* Compensation Amount */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6A65] mb-2">
                Value / Amount ($)
              </label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={compensationAmount}
                onChange={(e) => setCompensationAmount(e.target.value)}
                className="w-full bg-white border border-[#E7E1D8] rounded-xl px-4 py-3 text-[#1F1F1F] placeholder-[#6E6A65] focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A]"
                disabled={compensationType === 'gifted'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deadline */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6A65] mb-2">Application Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-white border border-[#E7E1D8] rounded-xl px-4 py-3 text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A]"
                required
              />
            </div>
          </div>

          {/* Category Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6A65] mb-3">Niche Categories</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const selected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all duration-200 ${
                      selected
                        ? 'bg-[#F8EFF3] border-[#A8678A] text-[#A8678A] shadow-none'
                        : 'bg-white border-[#E7E1D8] text-[#6E6A65] hover:border-[#A8678A] hover:text-[#1F1F1F]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[#E7E1D8]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl bg-white border border-[#E7E1D8] hover:bg-[#F8EFF3] text-[#1F1F1F] font-semibold transition-all duration-200 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1F1F1F] text-white font-bold hover:opacity-90 shadow-soft transition-all duration-200 text-sm"
            >
              {isEdit ? 'Update Campaign' : 'Publish Campaign'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
