const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="p-5 bg-surface border border-white/5 rounded-lg">
      <div className="p-2 bg-surface-raised rounded-lg border border-white/5 w-fit mb-4">
        <Icon aria-hidden="true" className="w-5 h-5 text-text-secondary" />
      </div>
      <h3 className="text-sm font-display font-semibold text-white tracking-wide mb-2">{title}</h3>
      <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
