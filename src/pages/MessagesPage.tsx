import { useEffect, useMemo, useState, useRef } from 'react';
import { getStore } from '../services/store';

type Participant = {
  id: string;
  type: 'creator' | 'brand';
  name: string;
  avatar?: string;
  score?: number;
  niche?: string;
  audience?: string;
  engagement?: string;
  industry?: string;
  responseRate?: string;
  paymentReliability?: string;
};

type MessageItem = {
  id: string;
  fromId: string;
  toId: string;
  text?: string;
  imageUrl?: string;
  time: string; // ISO
  read?: boolean;
};

type Conversation = {
  id: string;
  participant: Participant;
  lastMessage?: MessageItem;
  unreadCount?: number;
  messages: MessageItem[];
  type?: 'direct' | 'campaign';
  campaignId?: string | null;
};

export default function MessagesPage() {
  const store = getStore();
  const [filter, setFilter] = useState<'all' | 'brands' | 'creators' | 'active' | 'archived'>('all');
  const [query, setQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);

  const composerRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Build mock conversations from store data (non-destructive)
    const creators = Array.from(store.creators.values()).slice(0, 6);
    const brands = Array.from(store.brands.values()).slice(0, 6);

    const fakerTime = (minsAgo: number) => new Date(Date.now() - minsAgo * 60 * 1000).toISOString();

    const convs: Conversation[] = [];

    brands.forEach((b, i) => {
      const id = `brand-${b.id}`;
      convs.push({
        id,
        participant: {
          id: b.id,
          type: 'brand',
          name: b.companyName,
          avatar: b.logoUrl,
          industry: b.industry,
          responseRate: `${Math.round((b.averageResponseTimeHours ?? 24) > 0 ? Math.max(50, 100 - (b.averageResponseTimeHours ?? 24)) : 80)}%`,
          paymentReliability: b.brandScore > 70 ? 'High' : 'Medium',
          score: b.brandScore ?? Math.floor(Math.random() * 100),
        },
        messages: [
          { id: id + '-m1', fromId: b.id, toId: 'me', text: `Hi — we're interested in collaborating on ${b.companyName}'s next campaign.`, time: fakerTime(120), read: false },
          { id: id + '-m2', fromId: 'me', toId: b.id, text: `Thanks — tell me more about the brief and target KPIs.`, time: fakerTime(110), read: true },
        ],
        lastMessage: { id: id + '-m1', fromId: b.id, toId: 'me', text: `Hi — we're interested in collaborating on ${b.companyName}'s next campaign.`, time: fakerTime(120), read: false },
        unreadCount: i % 3 === 0 ? 2 : 0,
        type: i % 4 === 0 ? 'campaign' : 'direct',
        campaignId: i % 4 === 0 ? `camp-${i}` : null,
      });
    });

    creators.forEach((c, i) => {
      const id = `creator-${c.id}`;
      convs.push({
        id,
        participant: {
          id: c.id,
          type: 'creator',
          name: c.displayName || 'Creator',
          avatar: c.avatarUrl,
          niche: c.contentCategories?.[0] ?? 'Lifestyle',
          audience: `${Math.floor(1000 + Math.random() * 100000)}`,
          engagement: `${(c.insights?.averageEngagementRate ?? 2.3).toFixed(1)}%`,
          score: c.trustScore ?? Math.floor(Math.random() * 100),
        },
        messages: [
          { id: id + '-m1', fromId: c.id, toId: 'me', text: `Love your work — interested in a partnership.`, time: fakerTime(60), read: false },
          { id: id + '-m2', fromId: 'me', toId: c.id, text: `Thanks — can you share recent metrics?`, time: fakerTime(50), read: true },
        ],
        lastMessage: { id: id + '-m1', fromId: c.id, toId: 'me', text: `Love your work — interested in a partnership.`, time: fakerTime(60), read: false },
        unreadCount: i % 2 === 0 ? 1 : 0,
        type: 'direct',
        campaignId: null,
      });
    });

    setConversations(convs);
    setActiveConvId(convs.length ? convs[0].id : null);
  }, [store]);

  const filtered = useMemo(() => conversations.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'brands') return c.participant.type === 'brand';
    if (filter === 'creators') return c.participant.type === 'creator';
    if (filter === 'active') return c.type === 'campaign';
    if (filter === 'archived') return false;
    return true;
  }).filter((c) => c.participant.name.toLowerCase().includes(query.toLowerCase()) || (c.lastMessage?.text || '').toLowerCase().includes(query.toLowerCase())), [conversations, filter, query]);

  const activeConv = useMemo(() => conversations.find((c) => c.id === activeConvId) ?? filtered[0] ?? null, [conversations, activeConvId, filtered]);

  useEffect(() => {
    // scroll to bottom on active conversation change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId]);

  const sendMessage = (text: string, imageUrl?: string) => {
    if (!activeConv) return;
    const msg: MessageItem = {
      id: `${activeConv.id}-m${Date.now()}`,
      fromId: 'me',
      toId: activeConv.participant.id,
      text,
      imageUrl,
      time: new Date().toISOString(),
      read: false,
    };
    setConversations((prev) => prev.map((c) => c.id === activeConv.id ? { ...c, messages: [...c.messages, msg], lastMessage: msg } : c));
    setTimeout(() => setTyping(true), 300);
    setTimeout(() => setTyping(false), 2000);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    // mark read
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, unreadCount: 0, lastMessage: { ...c.lastMessage!, read: true } } : c));
  };

  return (
    <div className="min-h-[70vh]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left */}
        <aside className="lg:col-span-3 bg-white border border-[#E7E1D8] rounded-[16px] p-4 shadow-card h-[70vh] flex flex-col">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="relative">
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations..." className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#E7E1D8] text-sm placeholder-[#6E6A65] focus:outline-none focus:ring-2 focus:ring-[#A8678A]" />
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A65]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197M10.5 5.25a5.25 5.25 0 1 1-0 10.5 5.25 5.25 0 0 1 0-10.5z" /></svg>
              </div>
            </div>
            <div>
              <button className="p-2 rounded-lg bg-[#F8EFF3] text-[#1F1F1F]">New</button>
            </div>
          </div>

          <div className="mt-4 flex gap-2 text-xs text-[#6E6A65]">
            {(['all','brands','creators','active','archived'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-2 py-1 rounded-lg ${filter === f ? 'bg-[#F8EFF3] text-[#A8678A] font-bold' : 'bg-transparent hover:bg-[#F8EFF3]'}`}
              >
                {f === 'all' ? 'All' : f === 'active' ? 'Active Campaigns' : f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-y-auto">
            <ul className="space-y-2">
              {filtered.map((c) => (
                <li key={c.id}>
                  <button onClick={() => handleSelectConversation(c.id)} className={`w-full text-left flex items-center gap-3 p-3 rounded-lg ${activeConv?.id === c.id ? 'bg-[#F8EFF3] text-[#A8678A]' : 'hover:bg-[#F8EFF3]'}`}>
                    <img src={c.participant.avatar || '/favicon.svg'} alt={c.participant.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-bold truncate">{c.participant.name}</div>
                        <div className="text-[11px] text-[#6E6A65]">{new Date(c.lastMessage?.time || '').toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}</div>
                      </div>
                      <div className="text-[12px] truncate text-[#6E6A65]">{c.lastMessage?.text}</div>
                    </div>
                    {c.unreadCount ? <div className="ml-2 w-6 h-6 rounded-full bg-[#A8678A] text-white text-[10px] font-black flex items-center justify-center">{c.unreadCount}</div> : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Center */}
        <section className="lg:col-span-6 bg-white border border-[#E7E1D8] rounded-[16px] p-4 shadow-card h-[70vh] flex flex-col">
          <div className="flex items-center gap-3 border-b border-[#E7E1D8] pb-3">
            <div className="w-10 h-10 rounded-full bg-[#F3F1EF] flex items-center justify-center text-sm font-black">{activeConv?.participant.name?.[0] ?? 'U'}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{activeConv?.participant.name}</div>
              <div className="text-[12px] text-[#6E6A65] truncate">{activeConv?.participant.type === 'brand' ? 'Brand' : activeConv?.participant.niche}</div>
            </div>
            <div className="text-[12px] text-[#6E6A65]">{activeConv?.type === 'campaign' ? 'Campaign' : ''}</div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-4" id="messages-list">
            {(activeConv?.messages || []).map((m) => (
              <div key={m.id} className={`flex ${m.fromId === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.fromId === 'me' ? 'bg-[#1F1F1F] text-white' : 'bg-[#F3F1EF] text-[#1F1F1F]'} max-w-[70%] rounded-2xl px-4 py-2 text-sm`}> 
                  {m.text && <div className="whitespace-pre-wrap">{m.text}</div>}
                  {m.imageUrl && <img src={m.imageUrl} alt="attachment" className="mt-2 rounded-md max-h-48 object-cover" />}
                  <div className="text-[10px] text-white/70 mt-2 text-right">{new Date(m.time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-[#F3F1EF] rounded-2xl px-4 py-2 text-sm text-[#1F1F1F]">Typing<span className="ml-2">• • •</span></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="pt-3 border-t border-[#E7E1D8] mt-3">
            <div className="flex items-center gap-2">
              <input ref={composerRef} placeholder="Write a message..." className="flex-1 rounded-2xl border border-[#E7E1D8] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8678A]" />
              <button className="px-3 py-2 rounded-lg bg-[#1F1F1F] text-white" onClick={() => { if (composerRef.current) { sendMessage(composerRef.current.value); composerRef.current.value = ''; } }}>Send</button>
            </div>
          </div>
        </section>

        {/* Right */}
        <aside className="lg:col-span-3 bg-white border border-[#E7E1D8] rounded-[16px] p-4 shadow-card h-[70vh] overflow-auto">
          {activeConv ? (
            <div>
              <h4 className="font-bold text-sm mb-3">Collaboration Details</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6E6A65]">Verification</span>
                  <span className="text-xs font-bold">Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6E6A65]">Score</span>
                  <span className="text-xs font-bold">{activeConv.participant.score ?? '—'}</span>
                </div>
                {activeConv.participant.type === 'creator' && (
                  <>
                    <div className="flex items-center justify-between text-xs text-[#6E6A65]">
                      <span>Niche</span>
                      <span className="font-bold">{activeConv.participant.niche}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#6E6A65]">
                      <span>Audience</span>
                      <span className="font-bold">{activeConv.participant.audience}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#6E6A65]">
                      <span>Engagement</span>
                      <span className="font-bold">{activeConv.participant.engagement}</span>
                    </div>
                    <div className="text-xs mt-3">
                      <a className="text-[#A8678A] font-bold text-xs">View Portfolio →</a>
                    </div>
                  </>
                )}

                {activeConv.participant.type === 'brand' && (
                  <>
                    <div className="flex items-center justify-between text-xs text-[#6E6A65]">
                      <span>Industry</span>
                      <span className="font-bold">{activeConv.participant.industry}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#6E6A65]">
                      <span>Response Rate</span>
                      <span className="font-bold">{activeConv.participant.responseRate}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#6E6A65]">
                      <span>Payment</span>
                      <span className="font-bold">{activeConv.participant.paymentReliability}</span>
                    </div>
                  </>
                )}

                {activeConv.type === 'campaign' && (
                  <div className="mt-3 p-3 bg-[#F8EFF3] rounded-lg border border-[#E7E1D8] text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Campaign</span>
                      <span className="text-[11px] text-[#6E6A65]">Status: Live</span>
                    </div>
                    <div className="text-xs mt-2">Budget: $5,000</div>
                    <div className="text-xs">Deliverables: 3x IG posts</div>
                    <div className="text-xs">Deadline: 2026-07-01</div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-[#6E6A65]">Select a conversation to view details</div>
          )}
        </aside>
      </div>
    </div>
  );
}
