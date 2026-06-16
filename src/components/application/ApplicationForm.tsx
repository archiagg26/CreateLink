import React, { useEffect, useState } from 'react';
import type { Creator, Campaign, Application } from '../../types/index';
import * as applicationService from '../../services/applicationService';
import AIPitchPanel from './AIPitchPanel';

interface ApplicationFormProps {
  creator: Creator;
  campaign: Campaign;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationForm({ creator, campaign, onClose, onSuccess }: ApplicationFormProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [app, setApp] = useState<Application | null>(null);
  const [editedPitch, setEditedPitch] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [existingApp, setExistingApp] = useState<Application | null>(null);

  useEffect(() => {
    const initApplication = async () => {
      setLoading(true);
      setError('');
      try {
        // Try creating a new application
        const newApp = await applicationService.createApplication(creator.id, campaign.id);
        setApp(newApp);
        setEditedPitch(newApp.editedPitch);
        setSelectedItems(newApp.selectedPortfolioItems);
      } catch (err) {
        const errorObject = err as { code?: string; message?: string };
        if (errorObject.code === 'duplicate') {
          // If already exists, fetch the existing application
          const existing = await applicationService.getApplicationByCreatorAndCampaign(creator.id, campaign.id);
          setExistingApp(existing);
        } else {
          setError(errorObject.message || 'Failed to initialize application.');
        }
      } finally {
        setLoading(false);
      }
    };

    initApplication();
  }, [creator.id, campaign.id]);

  const handleTogglePortfolioItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      if (selectedItems.length >= 3) {
        // Limit to 3 items
        return;
      }
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;
    setSubmitting(true);
    setError('');
    try {
      await applicationService.updateApplication(app.id, editedPitch, selectedItems);
      onSuccess();
    } catch (err) {
      setError((err as Error).message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Generating personalized AI Pitch...</p>
      </div>
    );
  }

  if (existingApp) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.08-.77-.75-1.333-1.528-1.333h-.025c-.778 0-1.45.563-1.528 1.333L10.176 12.35c-.04.374.085.746.34 1.02a1.378 1.378 0 0 0 1.01.43h.023c.387 0 .753-.163 1.01-.43.256-.274.38-.646.34-1.02l-.376-4.265ZM12 16.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-2">Already Applied</h3>
        <p className="text-slate-400 text-sm mb-6">
          You have already submitted an application for <span className="font-semibold text-slate-200">"{campaign.title}"</span>.
        </p>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 inline-block">
          <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Status</span>
          <span className={`text-sm font-bold uppercase tracking-wider ${
            existingApp.status === 'approved' ? 'text-emerald-400' :
            existingApp.status === 'declined' ? 'text-rose-400' :
            existingApp.status === 'waitlisted' ? 'text-amber-400' : 'text-indigo-400'
          }`}>
            {existingApp.status}
          </span>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold transition-all duration-200 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Apply for {campaign.title}
        </h3>
        <p className="text-slate-400 text-xs mt-1">Review your AI-generated pitch and attach work samples.</p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* AI Pitch Panel */}
      <AIPitchPanel pitch={editedPitch} onChange={setEditedPitch} />

      {/* Portfolio Selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Select Portfolio Examples (Max 3)
        </label>
        {creator.portfolio.length === 0 ? (
          <div className="text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl p-4 text-center">
            No portfolio items found. You can add items later in the Editor.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 max-h-[180px] overflow-y-auto pr-2">
            {creator.portfolio.map((item) => {
              const selected = selectedItems.includes(item.id);
              const disabled = !selected && selectedItems.length >= 3;
              return (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-all duration-200 ${
                    selected
                      ? 'border-indigo-500/50 bg-indigo-500/5'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={disabled}
                    onChange={() => handleTogglePortfolioItem(item.id)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{item.title}</p>
                    <p className="text-xs text-slate-500 capitalize">{item.category} &bull; {(item.metrics.engagementRate * 100).toFixed(1)}% Engagement</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Buttons */}
      <div className="flex justify-end gap-3 border-t border-slate-800/80 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold transition-all duration-200 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold hover:brightness-110 shadow-lg shadow-indigo-500/15 transition-all duration-200 text-sm disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
}

export default ApplicationForm;
