import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCreatorStore } from '../stores/creatorStore';
import { useBrandStore } from '../stores/brandStore';
import * as creatorService from '../services/creatorService';
import * as brandService from '../services/brandService';
import VerificationBadge from '../components/shared/VerificationBadge';
import { getStore } from '../services/store';

const SOCIAL_PLATFORMS = ['instagram', 'tiktok', 'youtube', 'twitter', 'linkedin'] as const;

export default function VerificationFlowPage() {
  const { currentUser } = useAuthStore();
  const { creator, loadCreator } = useCreatorStore();
  const { brand, loadBrand } = useBrandStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [docName, setDocName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isCreator = currentUser?.role === 'creator';
  const profileId = currentUser?.id;

  useEffect(() => {
    if (profileId) {
      if (isCreator) {
        loadCreator(profileId);
      } else {
        loadBrand(profileId);
      }
    }
  }, [profileId, isCreator, loadCreator, loadBrand]);

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

  const handleToggleSocial = async (platform: string) => {
    if (!creator) return;
    setLoading(true);
    try {
      const isConnected = creator.socialAccounts.some((s) => s.platform === platform && s.connected);
      const store = getStore();

      if (isConnected) {
        // Disconnect
        await creatorService.disconnectSocialAccount(creator.id, platform);
      } else {
        // Connect (mocked)
        const updatedAccounts = creator.socialAccounts.map((a) =>
          a.platform === platform ? { ...a, connected: true, handle: `@test_${platform}`, followerCount: 15000 } : a
        );
        const hasConnected = updatedAccounts.some((a) => a.connected);
        const verificationStatus = creator.verificationStatus;

        // If identity docs were pending/verified and we connected a social account
        if (hasConnected && verificationStatus === 'unverified') {
          // If already did step 1, could be pending
        }

        store.creators.set(creator.id, { ...creator, socialAccounts: updatedAccounts });
      }
      await loadCreator(creator.id);
    } catch (err) {
      setError((err as Error).message || 'Failed to update social account connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!profileId) return;
    setLoading(true);
    setError('');
    try {
      if (isCreator) {
        await creatorService.submitVerification(profileId);
        await loadCreator(profileId);
      } else {
        await brandService.submitVerification(profileId);
        await loadBrand(profileId);
      }
      setStep(3); // success state
    } catch (err) {
      setError((err as Error).message || 'Verification submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const activeStatus = isCreator ? creator?.verificationStatus : brand?.verificationStatus;

  // Render Already Verified or Pending page directly if completed
  if (activeStatus === 'verified' || activeStatus === 'pending') {
    return (
      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center mx-auto mb-6">
          <VerificationBadge status={activeStatus} size="lg" showLabel={false} />
        </div>

        <h3 className="text-xl font-bold mb-2">
          {activeStatus === 'verified' ? 'Identity Verified' : 'Verification Under Review'}
        </h3>
        <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
          {activeStatus === 'verified'
            ? 'Your profile badge is active. Creators and brands can interact with your verified credentials.'
            : 'We are reviewing your uploaded verification documents. A decision will be made within 5 business days.'}
        </p>

        {isCreator && activeStatus === 'verified' && (
          <div className="bg-slate-955/60 border border-slate-800 rounded-2xl p-5 mb-8 text-left space-y-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Connected Accounts</span>
            {creator?.socialAccounts.filter(s => s.connected).map((soc) => (
              <div key={soc.platform} className="flex justify-between items-center text-sm">
                <span className="capitalize text-slate-400 font-medium">{soc.platform}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-200 font-semibold">{soc.handle}</span>
                  <button
                    onClick={() => handleToggleSocial(soc.platform)}
                    className="text-xs font-bold text-rose-500 hover:text-rose-400"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/feed')}
          className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 font-bold hover:bg-slate-700 transition-all duration-200"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                step === s
                  ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
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

      {/* Content Form */}
      <div className="relative z-10">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs font-semibold mb-6">
            {error}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Verification Documents
            </h2>
            <p className="text-slate-400 text-sm mb-8">
              {isCreator
                ? 'Upload a government issued identity card or passport to verify your credentials.'
                : 'Upload business registration or tax certificate files to verify corporate credentials.'}
            </p>

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

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!docName || loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all duration-200"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              {isCreator ? 'Link Social Accounts' : 'Review & Submit'}
            </h2>
            <p className="text-slate-400 text-sm mb-8">
              {isCreator
                ? 'Connect at least one social media network to complete your profile verification.'
                : 'Review your upload details and submit documents for moderation review.'}
            </p>

            {isCreator ? (
              <div className="space-y-4">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const connected = creator?.socialAccounts.some((s) => s.platform === platform && s.connected);
                  return (
                    <div key={platform} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                      <span className="capitalize text-sm font-bold text-slate-200">{platform}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSocial(platform)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                          connected
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
                        }`}
                      >
                        {connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  );
                })}

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
                    onClick={handleSubmitVerification}
                    disabled={!creator?.socialAccounts.some((s) => s.connected) || loading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold hover:brightness-110 transition-all duration-200 disabled:opacity-50"
                  >
                    Submit Verification
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-955 border border-slate-800 rounded-2xl p-5 text-left space-y-3">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Document Detail</span>
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>Uploaded Document:</span>
                    <span className="font-semibold text-indigo-400">{docName}</span>
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
                    onClick={handleSubmitVerification}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold hover:brightness-110 transition-all duration-200"
                  >
                    Submit Verification
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>

            <h3 className="text-xl font-bold mb-2">Submission Successful</h3>
            <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Your profile verification request has been successfully submitted. We expect to complete the review within 5 business days.
            </p>

            <button
              onClick={() => navigate('/feed')}
              className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 font-bold hover:bg-slate-700 transition-all duration-200"
            >
              Back to Feed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
