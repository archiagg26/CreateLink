import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCreatorStore } from '../stores/creatorStore';
import { generatePortfolioTemplates } from '../lib/aiMock';
import type { PortfolioTemplate, PortfolioItem } from '../types/index';

export default function AITemplateGeneratorPage() {
  const { currentUser } = useAuthStore();
  const { creator, loadCreator, updatePortfolio } = useCreatorStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<PortfolioTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadCreator(currentUser.id);
    }
  }, [currentUser, loadCreator]);

  const handleGenerate = async () => {
    if (!creator) return;
    setLoading(true);
    setError('');
    try {
      const generated = await generatePortfolioTemplates(creator);
      setTemplates(generated);
    } catch (err) {
      setError((err as Error).message || 'Failed to generate templates.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTemplate = async (template: PortfolioTemplate) => {
    if (!creator) return;
    setError('');

    // Map template sections to portfolio items
    const portfolioItems: PortfolioItem[] = template.sections.map((section) => ({
      id: crypto.randomUUID(),
      creatorId: creator.id,
      title: section.heading,
      description: section.placeholder,
      category: template.suggestedCategories[0] || 'lifestyle',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      fileSizeBytes: 1024 * 1024, // 1MB default
      campaignId: null,
      metrics: {
        views: 2000,
        likes: 100,
        comments: 10,
        shares: 5,
        engagementRate: 0.0575, // (100 + 10 + 5)/2000
      },
      createdAt: new Date().toISOString(),
    }));

    try {
      await updatePortfolio(portfolioItems);
      navigate(`/creator/${creator.id}`);
    } catch (err) {
      setError((err as Error).message || 'Failed to update portfolio.');
    }
  };

  const handleDiscard = () => {
    setTemplates([]);
    setSelectedTemplateId(null);
  };

  const isGeneric = templates.length > 0 && templates[0].isGeneric;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          AI Portfolio Template Generator
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Generate structured showcase portfolios based on your content category style.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-3 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Info Banner when generic */}
      {templates.length > 0 && isGeneric && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <span>
            Generated using content categories only — connect a social account for personalised templates.
          </span>
        </div>
      )}

      {/* Main trigger view */}
      {templates.length === 0 && !loading && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l8.982-11.795H13.62l1.317-7.705L6 13.205h5.132L9.813 15.904Z" />
            </svg>
          </div>

          <h3 className="text-xl font-bold mb-3">Generate Showcase Templates</h3>
          <p className="text-slate-400 text-sm mb-8">
            Our AI engine will analyze your creator categories and connected social analytics to produce three distinct showcase portfolios.
          </p>

          <button
            onClick={handleGenerate}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold hover:brightness-110 shadow-lg shadow-indigo-500/20 transition-all duration-200"
          >
            Generate Templates
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 text-sm">AI engine is processing profile analytics...</p>
        </div>
      )}

      {/* Template results grid */}
      {templates.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((tpl) => {
              const selected = selectedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`bg-slate-900 border rounded-3xl p-6 cursor-pointer flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
                    selected
                      ? 'border-indigo-500 shadow-xl shadow-indigo-500/5 bg-indigo-950/10'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Variant {tpl.variantIndex}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-indigo-400 font-bold uppercase">
                        {tpl.variantIndex === 1 ? 'Minimal' : tpl.variantIndex === 2 ? 'Story' : 'Data'}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-200 mb-6">{tpl.title}</h4>

                    <div className="space-y-4">
                      <span className="block text-[10px] uppercase font-bold text-slate-500">Suggested Sections</span>
                      {tpl.sections.map((sect, sIdx) => (
                        <div key={sIdx} className="bg-slate-950/60 border border-slate-800/40 p-3.5 rounded-xl">
                          <span className="block text-xs font-bold text-slate-300">{sect.heading}</span>
                          <span className="block text-[10px] text-slate-500 mt-1 italic leading-relaxed">
                            {sect.placeholder}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-805/40">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmTemplate(tpl);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-xs font-bold hover:brightness-110 transition-all duration-200"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
            <button
              onClick={handleDiscard}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all duration-200"
            >
              Discard and Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
