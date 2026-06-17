import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCreatorStore } from '../stores/creatorStore';
import { validatePortfolioFile } from '../lib/validation';
import type { PortfolioItem, ContentCategory } from '../types/index';
import UndoToast from '../components/shared/UndoToast';

const CATEGORIES: ContentCategory[] = [
  'beauty', 'fitness', 'tech', 'food', 'travel',
  'gaming', 'lifestyle', 'finance', 'education', 'fashion'
];

export default function PortfolioEditorPage() {
  const { currentUser } = useAuthStore();
  const { creator, loadCreator, updatePortfolio } = useCreatorStore();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ContentCategory>('lifestyle');
  const [mediaUrl, setMediaUrl] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('5'); // in MB
  const [views, setViews] = useState('10000');
  const [likes, setLikes] = useState('500');
  const [comments, setComments] = useState('50');
  const [shares, setShares] = useState('20');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [undoAction, setUndoAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadCreator(currentUser.id);
    }
  }, [currentUser, loadCreator]);

  const handleFileUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeBytes = file.size;
      const validationError = validatePortfolioFile({ name: file.name, size: sizeBytes });
      if (validationError) {
        setError(validationError);
        setMediaUrl('');
      } else {
        setError('');
        setMediaUrl(URL.createObjectURL(file) || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800`);
        setFileSizeStr((sizeBytes / (1024 * 1024)).toFixed(1));
      }
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creator) return;
    setError('');

    const sizeBytes = Math.round(parseFloat(fileSizeStr) * 1024 * 1024);
    const sizeValidationError = validatePortfolioFile({ name: 'attachment', size: sizeBytes });
    if (sizeValidationError) {
      setError(sizeValidationError);
      return;
    }

    const viewsVal = parseInt(views) || 0;
    const likesVal = parseInt(likes) || 0;
    const commentsVal = parseInt(comments) || 0;
    const sharesVal = parseInt(shares) || 0;
    const engRate = viewsVal > 0 ? (likesVal + commentsVal + sharesVal) / viewsVal : 0;

    let updatedPortfolio: PortfolioItem[];

    if (editingId) {
      // Edit existing item
      updatedPortfolio = creator.portfolio.map((item) => {
        if (item.id === editingId) {
          return {
            ...item,
            title,
            description,
            category,
            mediaUrl: mediaUrl || item.mediaUrl,
            fileSizeBytes: sizeBytes,
            metrics: {
              views: viewsVal,
              likes: likesVal,
              comments: commentsVal,
              shares: sharesVal,
              engagementRate: engRate,
            },
          };
        }
        return item;
      });
      setToastMessage('Portfolio item updated.');
    } else {
      // Create new item
      const newItem: PortfolioItem = {
        id: crypto.randomUUID(),
        creatorId: creator.id,
        title,
        description,
        category,
        mediaUrl: mediaUrl || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800`,
        fileSizeBytes: sizeBytes,
        campaignId: null,
        metrics: {
          views: viewsVal,
          likes: likesVal,
          comments: commentsVal,
          shares: sharesVal,
          engagementRate: engRate,
        },
        createdAt: new Date().toISOString(),
      };
      updatedPortfolio = [...creator.portfolio, newItem];
      setToastMessage('Portfolio item created.');
    }

    try {
      await updatePortfolio(updatedPortfolio);
      resetForm();
    } catch (err) {
      setError((err as Error).message || 'Failed to update portfolio.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('lifestyle');
    setMediaUrl('');
    setFileSizeStr('5');
    setViews('10000');
    setLikes('500');
    setComments('50');
    setShares('20');
    setEditingId(null);
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category);
    setMediaUrl(item.mediaUrl);
    setFileSizeStr((item.fileSizeBytes / (1024 * 1024)).toFixed(1));
    setViews(String(item.metrics.views));
    setLikes(String(item.metrics.likes));
    setComments(String(item.metrics.comments));
    setShares(String(item.metrics.shares));
  };

  const handleDelete = async (itemId: string) => {
    if (!creator) return;
    const itemToDelete = creator.portfolio.find((i) => i.id === itemId);
    if (!itemToDelete) return;

    const remaining = creator.portfolio.filter((item) => item.id !== itemId);

    // Save previous state for undo capability
    const previousPortfolio = [...creator.portfolio];

    try {
      await updatePortfolio(remaining);
      setToastMessage('Portfolio item deleted.');
      setUndoAction(() => async () => {
        try {
          await updatePortfolio(previousPortfolio);
          setToastMessage('Deletion undone.');
        } catch (err) {
          console.error(err);
        }
      });
    } catch (err) {
      setError((err as Error).message || 'Failed to delete item.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification with Undo */}
      {toastMessage && (
        <UndoToast
          message={toastMessage}
          onUndo={undoAction || (() => {})}
          onDismiss={() => {
            setToastMessage('');
            setUndoAction(null);
          }}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1F1F1F]">
            Portfolio Editor
          </h2>
          <p className="text-[#6E6A65] text-sm mt-1">Add or edit showcase content for your creator profile.</p>
        </div>
        <button
          onClick={() => navigate(`/creator/${creator?.id}`)}
          className="px-4.5 py-2.5 rounded-xl bg-white border border-[#E7E1D8] text-xs font-bold text-[#1F1F1F] hover:bg-[#F8EFF3] transition-colors"
        >
          View Public Profile
        </button>
      </div>

      {error && (
        <div className="bg-[#F8EFF3] border border-[#A8678A] text-[#A8678A] px-5 py-3 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Form Panel */}
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 sm:p-8 h-fit lg:col-span-1 shadow-card">
          <h3 className="text-lg font-bold mb-6 text-[#1F1F1F]">
            {editingId ? 'Edit Showcase Item' : 'New Showcase Item'}
          </h3>

          <form onSubmit={handleSaveItem} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6A65] mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-[#E7E1D8] rounded-xl px-4 py-2.5 text-[#1F1F1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6A65] mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-white border border-[#E7E1D8] rounded-xl px-4 py-2.5 text-[#1F1F1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A] resize-none"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6A65] mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ContentCategory)}
                  className="w-full bg-white border border-[#E7E1D8] rounded-xl px-4 py-2.5 text-[#1F1F1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6A65] mb-2">Size (MB)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fileSizeStr}
                  onChange={(e) => setFileSizeStr(e.target.value)}
                  className="w-full bg-white border border-[#E7E1D8] rounded-xl px-4 py-2.5 text-[#1F1F1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A]"
                  required
                />
              </div>
            </div>

            {/* Media Upload Dropzone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6A65] mb-2">Media File (Max 50MB)</label>
              <div className="border border-dashed border-[#E7E1D8] rounded-xl p-4 bg-[#F8EFF3] relative">
                <input
                  type="file"
                  onChange={handleFileUploadSimulated}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-center text-xs text-[#6E6A65]">
                  {mediaUrl ? 'File selected' : 'Upload attachment file'}
                </div>
              </div>
            </div>

            {/* Metrics inputs */}
            <div className="space-y-3 pt-3 border-t border-[#E7E1D8]">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#6E6A65]">Metrics</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[#6E6A65] mb-1">Views</label>
                  <input
                    type="number"
                    value={views}
                    onChange={(e) => setViews(e.target.value)}
                    className="w-full bg-white border border-[#E7E1D8] rounded-lg px-3 py-1.5 text-[#1F1F1F] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8678A] focus:border-[#A8678A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#6E6A65] mb-1">Likes</label>
                  <input
                    type="number"
                    value={likes}
                    onChange={(e) => setLikes(e.target.value)}
                    className="w-full bg-white border border-[#E7E1D8] rounded-lg px-3 py-1.5 text-[#1F1F1F] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8678A] focus:border-[#A8678A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#6E6A65] mb-1">Comments</label>
                  <input
                    type="number"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full bg-white border border-[#E7E1D8] rounded-lg px-3 py-1.5 text-[#1F1F1F] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8678A] focus:border-[#A8678A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#6E6A65] mb-1">Shares</label>
                  <input
                    type="number"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="w-full bg-white border border-[#E7E1D8] rounded-lg px-3 py-1.5 text-[#1F1F1F] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8678A] focus:border-[#A8678A]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-[#E7E1D8]">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#1F1F1F] text-white font-bold hover:opacity-90 shadow-soft transition-all text-xs"
              >
                {editingId ? 'Update Item' : 'Add to Portfolio'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#E7E1D8] text-[#1F1F1F] hover:bg-[#F8EFF3] text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Current Showcase Items Panel */}
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 sm:p-8 lg:col-span-2 shadow-card">
          <h3 className="text-lg font-bold mb-6 text-[#1F1F1F]">Your Portfolio Showcase</h3>

          {creator?.portfolio.length === 0 ? (
            <div className="text-center py-16 text-[#6E6A65] text-sm">
              Your portfolio is empty. Use the form on the left to add items.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creator?.portfolio.map((item) => (
                <div key={item.id} className="bg-white border border-[#E7E1D8] p-5 rounded-2xl relative flex flex-col justify-between hover:shadow-soft hover:border-[#A8678A] transition-all group">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-[#1F1F1F] max-w-[180px] truncate">{item.title}</h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-[#F8EFF3] text-[#A8678A]">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[#6E6A65] text-xs line-clamp-2 mb-3">{item.description}</p>
                    <div className="text-[10px] text-[#6E6A65] mb-4">
                      File Size: {(item.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#E7E1D8] pt-3 mt-auto">
                    <span className="text-xs text-[#1F1F1F] font-bold">
                      {(item.metrics.engagementRate * 100).toFixed(1)}% Engagement
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-xs font-semibold text-[#6E6A65] hover:text-[#1F1F1F] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs font-semibold text-[#A8678A] hover:underline transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
