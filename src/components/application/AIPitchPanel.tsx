
interface AIPitchPanelProps {
  pitch: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}

export function AIPitchPanel({ pitch, onChange, readOnly = false }: AIPitchPanelProps) {
  return (
    <div className="flex flex-col gap-2 bg-slate-950 border border-slate-800 rounded-xl p-4 relative">
      <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
        <span>AI Generated Cover Pitch</span>
        <span className="text-indigo-400">Personalized</span>
      </div>

      <textarea
        value={pitch}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        rows={6}
        className="w-full bg-slate-950 text-slate-100 text-sm leading-relaxed placeholder-slate-600 focus:outline-none resize-none border-0 p-0"
        placeholder="AI Pitch is generating..."
      ></textarea>

      <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-900 pt-2.5 mt-2">
        <span>{readOnly ? 'Read-only view' : 'You can edit this pitch before submitting'}</span>
        <span>{pitch.length} characters</span>
      </div>
    </div>
  );
}

export default AIPitchPanel;
