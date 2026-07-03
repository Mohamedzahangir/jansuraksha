const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="group relative">
      <div className="p-6 bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 hover:transform hover:-translate-y-2 shadow-lg hover:shadow-2xl motion-reduce:transform-none motion-reduce:hover:transform-none">
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 w-fit mb-4 group-hover:bg-slate-700/50 transition-colors">
          <Icon aria-hidden="true" className="w-8 h-8 text-slate-300 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-lg font-display font-semibold text-white mb-3 tracking-wide">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
