import { useNavigate } from 'react-router-dom';

export default function RoleSelectPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F2E8] p-6">
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-8 shadow-card text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1F1F1F] flex items-center justify-center text-white font-black text-2xl mx-auto mb-6">CL</div>
          <h2 className="text-xl font-extrabold mb-2">Continue as Creator</h2>
          <p className="text-sm text-[#6E6A65] mb-6">Discover campaigns, manage your portfolio, and apply to opportunities tailored for creators.</p>
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => navigate('/login?role=creator')} className="px-5 py-3 bg-[#1F1F1F] text-white rounded-xl font-bold w-full md:w-auto">Continue as Creator</button>
            <button onClick={() => navigate('/register?role=creator')} className="px-4 py-2 border border-[#E7E1D8] rounded-xl w-full md:w-auto">Sign up (Creator)</button>
          </div>
        </div>

        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-8 shadow-card text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#A8678A] flex items-center justify-center text-white font-black text-2xl mx-auto mb-6">BR</div>
          <h2 className="text-xl font-extrabold mb-2">Continue as Brand</h2>
          <p className="text-sm text-[#6E6A65] mb-6">Find creators, manage campaigns, review applicants, and build partnerships at scale.</p>
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => navigate('/login?role=brand')} className="px-5 py-3 bg-[#1F1F1F] text-white rounded-xl font-bold w-full md:w-auto">Continue as Brand</button>
            <button onClick={() => navigate('/register?role=brand')} className="px-4 py-2 border border-[#E7E1D8] rounded-xl w-full md:w-auto">Sign up (Brand)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
