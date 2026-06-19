import { useNavigate } from 'react-router-dom';


export default function RoleSelectPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F6F2E8] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Hero */}
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1F1F1F] leading-tight">
            The Trust Layer for the Creator Economy
          </h1>
          <p className="mt-4 text-lg md:text-xl text-[#6E6A65] max-w-2xl mx-auto">
            Connect creators and brands through meaningful collaborations built on trust, reputation, and proven results.
          </p>
        </header>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <article
            role="button"
            tabIndex={0}
            onClick={() => navigate('/login?role=creator')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/login?role=creator')}
            className="relative bg-white border border-[#E7E1D8] rounded-2xl p-8 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#A8678A]/30"
            aria-label="Continue as Creator"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#1F1F1F] flex items-center justify-center text-white font-black text-2xl">CL</div>
              <div>
                <h3 className="text-2xl font-bold text-[#1F1F1F]">Continue as Creator</h3>
                <p className="mt-2 text-sm text-[#6E6A65] max-w-xl">Discover campaigns, showcase your work, and grow your creator reputation.</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-[#9E9A97]">Creator experience</div>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/login?role=creator'); }}
                className="ml-4 px-5 py-3 bg-[#1F1F1F] text-white rounded-xl font-bold shadow-sm hover:opacity-95 transition"
              >
                Continue
              </button>
            </div>
          </article>

          <article
            role="button"
            tabIndex={0}
            onClick={() => navigate('/login?role=brand')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/login?role=brand')}
            className="relative bg-white border border-[#E7E1D8] rounded-2xl p-8 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#A8678A]/30"
            aria-label="Continue as Brand"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#A8678A] flex items-center justify-center text-white font-black text-2xl">BR</div>
              <div>
                <h3 className="text-2xl font-bold text-[#1F1F1F]">Continue as Brand</h3>
                <p className="mt-2 text-sm text-[#6E6A65] max-w-xl">Find trusted creators, manage campaigns, and build successful partnerships.</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-[#9E9A97]">Brand experience</div>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/login?role=brand'); }}
                className="ml-4 px-5 py-3 bg-[#1F1F1F] text-white rounded-xl font-bold shadow-sm hover:opacity-95 transition"
              >
                Continue
              </button>
            </div>
          </article>
        </div>

        {/* Secondary actions */}
        <div className="mt-8 text-center text-sm text-[#6E6A65]">
          <span>New here? </span>
          <button onClick={() => navigate('/register?role=creator')} className="font-semibold text-[#A8678A] hover:underline">Sign up as Creator</button>
          <span className="mx-2">•</span>
          <button onClick={() => navigate('/register?role=brand')} className="font-semibold text-[#A8678A] hover:underline">Sign up as Brand</button>
        </div>
      </div>
    </div>
  );
}
