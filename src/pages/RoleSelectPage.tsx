import { useNavigate } from 'react-router-dom';
import CreatorSparkGrowthIcon from '../components/icons/CreatorSparkGrowthIcon';
import BrandTrustedNetworkIcon from '../components/icons/BrandTrustedNetworkIcon';

export default function RoleSelectPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F6F2E8] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Hero */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1F1F1F] leading-tight">
            The Trust Layer for the Creator Economy
          </h1>
          <p className="mt-4 text-lg md:text-xl text-[#6E6A65] max-w-2xl mx-auto">
            Connect creators and brands through meaningful collaborations built on trust, reputation, and proven results.
          </p>
        </header>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <div className="bg-white border border-[#E7E1D8] rounded-2xl px-6 py-4 shadow-sm hover:shadow-md transition-all">
            <div className="text-2xl font-extrabold text-[#1F1F1F]">50K+</div>
            <div className="text-xs uppercase tracking-wider text-[#6E6A65] mt-1">
              Creators
            </div>
          </div>

          <div className="bg-white border border-[#E7E1D8] rounded-2xl px-6 py-4 shadow-sm hover:shadow-md transition-all">
            <div className="text-2xl font-extrabold text-[#A8678A]">8K+</div>
            <div className="text-xs uppercase tracking-wider text-[#6E6A65] mt-1">
              Brands
            </div>
          </div>

          <div className="bg-white border border-[#E7E1D8] rounded-2xl px-6 py-4 shadow-sm hover:shadow-md transition-all">
            <div className="text-2xl font-extrabold text-[#1F1F1F]">200K+</div>
            <div className="text-xs uppercase tracking-wider text-[#6E6A65] mt-1">
              Collaborations
            </div>
          </div>
        </div>
        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <article
            role="button"
            tabIndex={0}
            onClick={() => navigate('/login?role=creator')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/login?role=creator')}
            className="
  relative
  overflow-hidden
  group
  bg-white
  border border-[#E7E1D8]
  rounded-2xl
  p-10 min-h-[320px]
  shadow-md
  hover:shadow-xl
  hover:-translate-y-1
  hover:bg-[#F8EFF3]
  hover:border-[#A8678A]
  transition-all
  duration-300
  cursor-pointer
  focus:outline-none
  focus:ring-2
  focus:ring-[#A8678A]/30
"
            aria-label="Continue as Creator"
          >
            <span
              className="
    absolute
    inset-0
    -translate-x-full
    bg-gradient-to-r
    from-transparent
    via-white/50
    to-transparent
    group-hover:translate-x-[200%]
    transition-transform
    duration-1000
    pointer-events-none
  "
            />
            <div>
              <div
                className="
      w-16 h-16
      rounded-2xl
      bg-[#F8EFF3]
      border border-[#E7E1D8]
      flex items-center justify-center
      mb-6
      transition-all duration-300
      group-hover:scale-110
      group-hover:bg-white
    "
              >
                <CreatorSparkGrowthIcon />
              </div>

              <h3 className="text-2xl font-bold text-[#1F1F1F]">
                Continue as Creator
              </h3>

              <p className="mt-2 text-sm text-[#6E6A65] max-w-xl">
                Discover campaigns, showcase your work, and grow your creator reputation.
              </p>

              <ul className="mt-5 space-y-2 text-sm text-[#6E6A65]">
                <li>✨ Discover paid campaigns</li>
                <li>🎯 Build AI-powered portfolios</li>
                <li>📈 Grow your creator reputation</li>
              </ul>
            </div>

            <div className="mt-auto flex items-center justify-between">
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
            className="
  relative
  overflow-hidden
  group
  bg-white
  border border-[#E7E1D8]
  rounded-2xl
  p-8
  shadow-md
  hover:shadow-xl
  hover:-translate-y-1
  hover:bg-[#F8EFF3]
  hover:border-[#A8678A]
  transition-all
  duration-300
  cursor-pointer
  focus:outline-none
  focus:ring-2
  focus:ring-[#A8678A]/30
"
            aria-label="Continue as Brand"
          >
            <span
              className="
    absolute
    inset-0
    -translate-x-full
    bg-gradient-to-r
    from-transparent
    via-white/50
    to-transparent
    group-hover:translate-x-[200%]
    transition-transform
    duration-1000
    pointer-events-none
  "
            />
            <div>
              <div
                className="
      w-16 h-16
      rounded-2xl
      bg-[#F8EFF3]
      border border-[#E7E1D8]
      flex items-center justify-center
      mb-6
      transition-all duration-300
      group-hover:scale-110
      group-hover:bg-white
    "
              >
                <BrandTrustedNetworkIcon />
              </div>

              <h3 className="text-2xl font-bold text-[#1F1F1F]">
                Continue as Brand
              </h3>

              <p className="mt-2 text-sm text-[#6E6A65] max-w-xl">
                Find trusted creators, manage campaigns, and build successful partnerships.
              </p>

              <ul className="mt-5 space-y-2 text-sm text-[#6E6A65]">
                <li>🔍 Find trusted creators</li>
                <li>🚀 Launch campaigns faster</li>
                <li>🤝 Manage collaborations at scale</li>
              </ul>
            </div>

            <div className="mt-auto flex items-center justify-between">
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
