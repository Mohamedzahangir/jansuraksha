import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const STATUS_STYLES = {
  safe: {
    border: 'border-safe/20',
    bg: 'bg-safe/10',
    icon: <CheckCircle aria-hidden="true" className="w-5 h-5 text-safe" />,
    bar: 'bg-safe',
    label: 'Safe',
  },
  suspicious: {
    border: 'border-amber/20',
    bg: 'bg-amber/10',
    icon: <AlertTriangle aria-hidden="true" className="w-5 h-5 text-amber" />,
    bar: 'bg-amber',
    label: 'Suspicious',
  },
  dangerous: {
    border: 'border-danger/20',
    bg: 'bg-danger/10',
    icon: <Shield aria-hidden="true" className="w-5 h-5 text-danger" />,
    bar: 'bg-danger',
    label: 'Dangerous',
  },
};

export const getStatusColor = (status) => {
  const style = STATUS_STYLES[status];
  return style ? `${style.border} ${style.bg}` : 'border-white/10 bg-surface';
};

export const getStatusText = (status) => {
  const style = STATUS_STYLES[status];
  return style ? style.label : 'Unknown';
};

const StatusBadge = ({ status, confidence }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.safe;

  return (
    <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-surface-raised rounded-lg border border-white/5">
          {style.icon}
        </div>
        <div>
          <h3 className="text-xl font-display font-bold text-white tracking-tight">
            {style.label}
          </h3>
          <p className="text-text-secondary text-xs">Security verdict</p>
        </div>
      </div>

      <div className="text-right">
        <div className="text-xl font-display font-bold text-white tracking-tight">
          {confidence}<span className="text-text-secondary text-sm font-sans font-normal">%</span>
        </div>
        <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
          <div
            className={`h-full ${style.bar} transition-all duration-1000 rounded-full`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatusBadge;
