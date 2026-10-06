import { Outlet, Link } from 'react-router-dom';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124] font-sans selection:bg-[#e8f0fe]">
      {/* Top Navigation */}
      <header className="bg-white border-b border-[#dadce0] h-16 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <Link to="/company/dashboard" className="text-xl font-medium text-[#202124] flex items-center gap-2">
            <span className="text-[#1a73e8]">ComProva</span>
            <span className="text-[10px] uppercase font-bold text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full tracking-wider ml-1">
              Empresa
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link to="/company/dashboard" className="text-sm font-medium text-[#1a73e8] border-b-2 border-[#1a73e8] h-16 flex items-center">
              Vagas
            </Link>
            <span className="text-sm font-medium text-[#5f6368] h-16 flex items-center cursor-not-allowed">
              Candidatos
            </span>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-sm font-medium">
            HR
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
