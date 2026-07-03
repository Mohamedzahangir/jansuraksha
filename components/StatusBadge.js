import { Shield, AlertTriangle, CheckCircle, Eye } from 'lucide-react';

export const getStatusColor = (status) => {
  switch (status) {
    case 'safe':
      return 'border-emerald-200/50 bg-emerald-950/20';
    case 'suspicious':
      return 'border-amber-200/50 bg-amber-950/20';
    case 'dangerous':
      return 'border-red-200/50 bg-red-950/20';
    default:
      return 'border-slate-700 bg-slate-800/20';
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case 'safe':
      return 'Safe';
    case 'suspicious':
      return 'Suspicious';
    case 'dangerous':
      return 'Dangerous';
    default:
      return 'Unknown';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'safe':
      return <CheckCircle aria-hidden="true" className="w-6 h-6 text-emerald-500" />;
    case 'suspicious':
      return <AlertTriangle aria-hidden="true" className="w-6 h-6 text-amber-500" />;
    case 'dangerous':
      return <Shield aria-hidden="true" className="w-6 h-6 text-red-500" />;
    default:
      return <Eye aria-hidden="true" className="w-6 h-6 text-slate-400" />;
  }
};

const getConfidenceBarColor = (status) => {
  if (status === 'safe') return 'bg-emerald-500';
  if (status === 'suspicious') return 'bg-amber-500';
  if (status === 'dangerous') return 'bg-red-500';
  return 'bg-slate-500';
};

const StatusBadge = ({ status, confidence, subtitle = 'Security Analysis Complete' }) => {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          {getStatusIcon(status)}
        </div>
        <div>
          <h3 className="text-2xl font-display font-bold text-white tracking-tight">
            {getStatusText(status)}
          </h3>
          <p className="text-text-secondary text-sm">{subtitle}</p>
        </div>
      </div>

      <div className="text-left sm:text-right">
        <div className="text-2xl font-bold text-white mb-1">
          {confidence}%
        </div>
        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getConfidenceBarColor(status)} transition-all duration-1000`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">Confidence</p>
      </div>
    </div>
  );
};

export default StatusBadge;
