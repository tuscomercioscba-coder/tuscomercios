export default function Toolbar({
  zoom,
  hasSelection,
  isEditingImage,
  canUndo,
  canRedo,
  onZoomIn,
  onZoomOut,
  onFit,
  onUndo,
  onRedo,
  onDuplicate,
  onDelete,
  onEditImage,
  onFinishImageEdit,
  onLayerUp,
  onLayerDown,
  onAlignHorizontal,
  onAlignVertical,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
      <Button label="−" onClick={onZoomOut} />
      <span className="min-w-16 text-center text-sm font-black text-slate-700">
        {Math.round(zoom * 100)}%
      </span>
      <Button label="+" onClick={onZoomIn} />
      <Button label="Ajustar" onClick={onFit} />

      <Divider />

      <Button label="Deshacer" onClick={onUndo} disabled={!canUndo} />
      <Button label="Rehacer" onClick={onRedo} disabled={!canRedo} />

      <Divider />

      {isEditingImage ? (
        <Button label="Terminar edición" onClick={onFinishImageEdit} accent />
      ) : (
        <Button label="Editar imagen" onClick={onEditImage} disabled={!hasSelection} />
      )}

      <Button label="Centrar H" onClick={onAlignHorizontal} disabled={!hasSelection} />
      <Button label="Centrar V" onClick={onAlignVertical} disabled={!hasSelection} />
      <Button label="Duplicar" onClick={onDuplicate} disabled={!hasSelection} />
      <Button label="Adelante" onClick={onLayerUp} disabled={!hasSelection} />
      <Button label="Atrás" onClick={onLayerDown} disabled={!hasSelection} />
      <Button label="Eliminar" onClick={onDelete} disabled={!hasSelection} danger />
    </div>
  );
}

function Button({ label, onClick, disabled, danger, accent }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-10 rounded-xl px-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : accent
          ? "bg-emerald-500 text-white hover:bg-emerald-600"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-8 w-px bg-slate-200" />;
}
