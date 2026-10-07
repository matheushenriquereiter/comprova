import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isCompany = location.pathname.startsWith('/company');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124] font-sans selection:bg-[#e8f0fe]">
      {/* Top Navigation */}
      <header className="bg-white border-b border-[#dadce0] h-16 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <Link to={isCompany ? "/company/dashboard" : "/candidate/dashboard"} className="text-xl font-medium text-[#202124] flex items-center gap-2">
            <span className="text-[#1a73e8]">ComProva</span>
            <span className="text-[10px] uppercase font-bold text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full tracking-wider ml-1">
              {isCompany ? 'Empresa' : 'Candidato'}
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {isCompany ? (
              <>
                <Link to="/company/dashboard" className={`text-sm font-medium h-16 flex items-center border-b-2 ${location.pathname === '/company/dashboard' ? 'text-[#1a73e8] border-[#1a73e8]' : 'text-[#5f6368] border-transparent hover:text-[#202124]'}`}>
                  Vagas
                </Link>
                <span className="text-sm font-medium text-[#5f6368] h-16 flex items-center cursor-not-allowed">
                  Candidatos
                </span>
              </>
            ) : (
              <>
                <Link to="/candidate/dashboard" className={`text-sm font-medium h-16 flex items-center border-b-2 ${location.pathname === '/candidate/dashboard' ? 'text-[#1a73e8] border-[#1a73e8]' : 'text-[#5f6368] border-transparent hover:text-[#202124]'}`}>
                  Minhas Vagas
                </Link>
                <span className="text-sm font-medium text-[#5f6368] h-16 flex items-center cursor-not-allowed">
                  Testes Pendentes
                </span>
              </>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-sm font-medium">
            {isCompany ? 'HR' : 'CD'}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-[#5f6368] hover:text-[#d93025] transition-colors ml-2 cursor-pointer"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
