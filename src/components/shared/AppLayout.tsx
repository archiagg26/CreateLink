import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';

export function AppLayout() {
  const { currentUser, logout } = useAuthStore();
  const { unreadCount, loadNotifications } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (currentUser) loadNotifications(currentUser.id);
  }, [currentUser, loadNotifications]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const getProfilePath = () =>
    !currentUser ? '/login'
    : currentUser.role === 'creator' ? `/creator/${currentUser.id}`
    : `/brand/${currentUser.id}`;

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    { to: '/feed',          icon: <DiscoverIcon />, label: 'Discover' },
    { to: '/creators',      icon: <PeopleIcon />,   label: 'Creators' },
    { to: '/campaigns',     icon: <CampaignIcon />, label: 'Campaigns' },
    { to: '/messages',      icon: <MessageIcon />,  label: 'Messages', badge: unreadCount },
    { to: '/bookmarks',     icon: <BookmarkIcon />, label: 'Bookmarks' },
    { to: '/analytics',     icon: <AnalyticsIcon />,label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-[#F6F2E8] flex font-sans">

      {/* ─── Sidebar ─── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-52 bg-white border-r border-[#E7E1D8] flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#E7E1D8]">
          <div className="w-9 h-9 rounded-xl bg-[#1F1F1F] flex items-center justify-center font-black text-white text-base shrink-0">
            CL
          </div>
          <span className="text-base font-extrabold">
            <span className="text-[#A8678A]">Creator</span>
            <span className="text-[#1F1F1F]">Link</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon, label, badge }) => (
            <Link key={to} to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive(to)
                  ? 'bg-[#F8EFF3] text-[#A8678A]'
                  : 'text-[#6E6A65] hover:bg-[#F8EFF3] hover:text-[#A8678A]'
              }`}>
              <span className="w-5 h-5 shrink-0">{icon}</span>
              <span className="flex-1">{label}</span>
              {badge != null && badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#A8678A] text-white text-[10px] font-black flex items-center justify-center">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Find creator CTA */}
        <div className="mx-3 mb-4 bg-[#F8EFF3] border border-[#E7E1D8] rounded-2xl p-4">
          <p className="text-xs font-bold text-[#1F1F1F] leading-snug mb-3">
            Find the perfect creator for your next campaign
          </p>
          <Link to="/campaigns"
            className="block text-center w-full py-2 bg-[#1F1F1F] text-white text-xs font-black rounded-xl hover:opacity-90 transition-opacity">
            Create Campaign
          </Link>
          {/* Mini illustration */}
          <div className="flex justify-center mt-3 opacity-60 text-3xl">🤝</div>
        </div>

        {/* Switch role + current user */}
        <div className="border-t border-[#E7E1D8] px-3 py-3 space-y-1">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#6E6A65] hover:bg-[#F8EFF3] hover:text-[#A8678A] transition-colors"
            onClick={() => alert('Role switching coming soon!')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            Switch to {currentUser?.role === 'creator' ? 'Brand' : 'Creator'}
          </button>
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-[#A8678A] text-white flex items-center justify-center text-[11px] font-black shrink-0">
              {currentUser?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#1F1F1F] truncate">
                {currentUser?.email?.split('@')[0] ?? 'User'}
              </p>
              <p className="text-[10px] text-[#6E6A65] capitalize">{currentUser?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-[#6E6A65] hover:text-[#A8678A] transition-colors" title="Sign out">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Right side: topbar + content ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E7E1D8]">
          <div className="flex items-center gap-3 px-4 sm:px-6 h-14">
            {/* Mobile hamburger */}
            <button className="lg:hidden p-1.5 rounded-xl text-[#6E6A65] hover:bg-[#F8EFF3]"
              onClick={() => setSidebarOpen(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Search bar */}
            <div className="flex-1 max-w-md relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A65]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Search creators, niches or keywords..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E7E1D8] rounded-2xl text-sm text-[#1F1F1F] placeholder-[#6E6A65] focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A] transition-all"
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Notification bell */}
              <Link to="/notifications" className="relative p-2 rounded-xl hover:bg-[#F8EFF3] transition-colors text-[#6E6A65] hover:text-[#A8678A]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#A8678A] text-white text-[8px] font-black flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Messages */}
              <button className="p-2 rounded-xl hover:bg-[#F8EFF3] transition-colors text-[#6E6A65] hover:text-[#A8678A]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </button>

              {/* Avatar */}
              <div className="relative group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#A8678A] text-white flex items-center justify-center text-xs font-black ring-2 ring-white">
                  {currentUser?.email?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <svg className="absolute -right-1 -bottom-1 w-3.5 h-3.5 text-[#6E6A65] bg-white rounded-full" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
                {/* dropdown */}
                <div className="absolute top-10 right-0 w-48 bg-white border border-[#E7E1D8] rounded-[20px] shadow-card py-2 hidden group-hover:block z-50">
                  <div className="px-4 py-2 border-b border-[#E7E1D8]">
                    <p className="text-xs font-bold text-[#1F1F1F] truncate">{currentUser?.email}</p>
                    <p className="text-[10px] text-[#6E6A65] capitalize">{currentUser?.role}</p>
                  </div>
                  <Link to={getProfilePath()}
                    className="block px-4 py-2.5 text-xs font-semibold text-[#1F1F1F] hover:bg-[#F8EFF3] hover:text-[#A8678A]">
                    View Profile
                  </Link>
                  <button onClick={handleLogout}
                    className="block w-full text-left px-4 py-2.5 text-xs font-semibold text-[#A8678A] hover:bg-[#F8EFF3] border-t border-[#E7E1D8]">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

// ─── Icon Components ─────────────────────────────────────────────────────────
function DiscoverIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}
function CampaignIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 1 8.835-2.535m0 0A23.74 23.74 0 0 1 18.795 3c1.167 0 2.292.15 3.35.43.877.235 1.328 1.168 1.018 2.033l-.026.079A18.03 18.03 0 0 1 21 9.75c0 1.586-.205 3.124-.59 4.59" />
    </svg>
  );
}
function MessageIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  );
}
function BookmarkIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
    </svg>
  );
}
function AnalyticsIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}
