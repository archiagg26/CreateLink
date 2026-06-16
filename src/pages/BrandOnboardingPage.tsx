import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useBrandStore } from '../stores/brandStore';
import { getStore } from '../services/store';
import type { Brand } from '../types/index';

export default function BrandOnboardingPage() {
  const { currentUser } = useAuthStore();
  const { loadBrand } = useBrandStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [docName, setDocName] = useState('');
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setUploadError('File exceeds 50 MB limit.');
        setDocName('');
      } else {
        setUploadError('');
        setDocName(file.name);
      }
    }
  };

  const handleComplete = async () => {
    if (!currentUser) return;

    // Create brand profile
    const brand: Brand = {
      id: currentUser.id,
      userId: currentUser.id,
      companyName: companyName || 'Innovative Brand',
      logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${companyName || 'Brand'}`,
      industry: industry || 'Technology',
      description: description || 'Leading brand connecting with modern creators.',
      brandScore: 85, // default brand score
      brandScorePartialData: false,
      isNewToPlatform: true, // fewer than 3 completed collaborations
      completedCollaborations: 0,
      averageCreatorRating: 5.0,
      averageResponseTimeHours: 2.5,
      campaigns: [],
      verificationStatus: docName ? 'pending' : 'unverified',
    };

    // Save brand to memory store
    const store = getStore();
    store.brands.set(currentUser.id, brand);

    // If verification document was uploaded, set user status too
    if (docName) {
      const user = store.users.get(currentUser.id);
      if (user) {
        store.users.set(currentUser.id, { ...user, verificationStatus: 'pending' });
      }
    }

    // Refresh brand store
    await loadBrand(currentUser.id);

    navigate(`/brand/${currentUser.id}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center text-slate-100 py-12">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === s
                    ? 'bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                    : step > s
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
              {s < 2 && (
                <div
                  className={`h-0.5 mx-4 flex-1 transition-all duration-300 ${
                    step > s ? 'bg-emerald-500/30' : 'bg-slate-800'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Brand Details
              </h2>
              <p className="text-slate-400 mb-8">Tell us about your brand and industry sector.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Industry</label>
                  <input
                    type="text"
                    placeholder="e.g. Fashion, Tech, Wellness"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Company Overview</label>
                  <textarea
                    placeholder="Tell creators about your brand's mission and collaboration goals..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!companyName || !industry || !description}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all duration-200"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Verify Your Brand
              </h2>
              <p className="text-slate-400 mb-8">Upload business registration documents to gain the Verified Badge (optional but recommended).</p>

              <div className="border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/40 hover:bg-slate-950/60 hover:border-slate-700 transition-all duration-200 relative mb-6">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-500 mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                  </svg>
                  {docName ? (
                    <span className="text-sm font-semibold text-indigo-400">{docName}</span>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-slate-300">Click to upload document</span>
                      <span className="text-xs text-slate-500 mt-1">PDF, PNG, JPG up to 50 MB</span>
                    </>
                  )}
                  {uploadError && <span className="text-xs text-rose-500 mt-2">{uploadError}</span>}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 font-bold hover:bg-slate-700 transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 font-bold hover:brightness-110 transition-all duration-200"
                >
                  Complete Onboarding
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
