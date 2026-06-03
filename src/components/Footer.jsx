export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-500">
          © {new Date().getFullYear()} Tus Comercios. Todos los derechos reservados.
        </div>

        <div className="flex items-center gap-4 text-sm">
          <a href="#buscador" className="text-slate-600 hover:text-blue-600 transition">
            Buscar
          </a>
          <a href="#destacados" className="text-slate-600 hover:text-blue-600 transition">
            Destacados
          </a>
          <a href="#contacto" className="text-slate-600 hover:text-blue-600 transition">
            Publicar negocio
          </a>
        </div>
      </div>
    </footer>
  );
}