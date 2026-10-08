import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isCompany = location.pathname.startsWith('/company');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinks = isCompany 
    ? [
        { path: '/company/dashboard', label: 'Vagas' },
        { path: '#', label: 'Candidatos', disabled: true },
        { path: '/company/profile', label: 'Perfil' }
      ]
    : [
        { path: '/candidate/jobs', label: 'Procurar Vagas' },
        { path: '/candidate/dashboard', label: 'Minhas Vagas' },
        { path: '#', label: 'Testes Pendentes', disabled: true }
      ];

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
        </div>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 mr-4 relative">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <div key={link.label} className="relative flex items-center h-16">
                  {link.disabled ? (
                    <span className="text-sm font-medium text-[#5f6368] cursor-not-allowed px-1">
                      {link.label}
                    </span>
                  ) : (
                    <Link
                      to={link.path}
                      className={`text-sm font-medium px-1 transition-colors ${
                        isActive ? 'text-[#1a73e8]' : 'text-[#5f6368] hover:text-[#202124]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}
                  {isActive && !link.disabled && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a73e8]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 border-l border-[#dadce0] pl-6">
            <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-sm font-medium">
              {isCompany ? 'HR' : 'CD'}
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-[#5f6368] hover:text-[#d93025] transition-colors cursor-pointer"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
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
