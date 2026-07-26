export default function MentorTyping() {
  return (
    <div className="flex justify-start">
      <div className="rounded-3xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-xs font-black text-red-600">Mentor está analizando</p>
        <div className="mt-2 flex gap-1.5">
          {[0, 1, 2].map((item) => (
            <span key={item} className="h-2 w-2 animate-bounce rounded-full bg-blue-700" style={{ animationDelay: `${item * 130}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
