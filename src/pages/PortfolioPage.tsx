export default function PortfolioPage() {
  const portfolios = [
    {
      title: 'Beauty Campaigns',
      category: 'Beauty',
      campaigns: 8,
      brands: 5,
      engagement: '9.4%',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800'
    },
    {
      title: 'Lifestyle Content',
      category: 'Lifestyle',
      campaigns: 12,
      brands: 7,
      engagement: '8.8%',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'
    },
    {
      title: 'Tech Reviews',
      category: 'Tech',
      campaigns: 6,
      brands: 3,
      engagement: '7.1%',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
    }
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1F1F1F]">
            My Portfolios
          </h1>
          <p className="text-[#6E6A65] mt-2">
            Showcase your best work and brand collaborations.
          </p>
        </div>

        <button className="bg-[#1F1F1F] text-white px-5 py-3 rounded-xl font-medium">
          + Create Portfolio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Portfolios" value="3" />
        <StatCard title="Campaigns" value="26" />
        <StatCard title="Brands Worked" value="15" />
        <StatCard title="Avg Engagement" value="8.4%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <div
            key={portfolio.title}
            className="bg-white rounded-3xl border border-[#E7E1D8] overflow-hidden shadow-sm"
          >
            <img
              src={portfolio.image}
              alt={portfolio.title}
              className="w-full h-48 object-cover"
            />

            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-[#1F1F1F]">
                  {portfolio.title}
                </h2>

                <span className="bg-[#F8EFF3] text-[#A8678A] text-xs px-3 py-1 rounded-full">
                  {portfolio.category}
                </span>
              </div>

              <div className="space-y-2 text-sm text-[#6E6A65]">
                <p>{portfolio.campaigns} Campaigns</p>
                <p>{portfolio.brands} Brand Collaborations</p>
                <p>{portfolio.engagement} Avg Engagement</p>
              </div>

              <button className="mt-5 w-full border border-[#A8678A] text-[#A8678A] py-2 rounded-xl font-medium">
                View Portfolio
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-[#E7E1D8] rounded-2xl p-5">
      <p className="text-sm text-[#6E6A65]">{title}</p>
      <p className="text-2xl font-bold text-[#1F1F1F] mt-1">{value}</p>
    </div>
  );
}