export default function StudioCard({ icon, title, text, children }) {
  return (
    <div className="bg-white rounded-[2rem] shadow p-6 border border-slate-100">
      <div className="text-4xl mb-3">{icon}</div>

      <h3 className="text-xl font-black text-slate-900">
        {title}
      </h3>

      {text && (
        <p className="text-slate-500 mt-2">
          {text}
        </p>
      )}

      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}