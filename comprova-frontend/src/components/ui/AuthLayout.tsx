import { Outlet, Link, useLocation } from 'react-router-dom';

export function AuthLayout() {
  const location = useLocation();
  const isCandidate = location.pathname.includes('candidate');
  
  return (
    <div className="min-h-screen bg-white text-[#202124] font-sans selection:bg-[#e8f0fe] flex">
      
      {/* Left Side: Brand Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#1a73e8] p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle grid pattern for technical feel */}
        <div 
          className="absolute inset-0 opacity-[0.15]" 
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        
        <div className="relative z-10">
          <div className="text-3xl font-medium text-white tracking-tight">ComProva</div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-normal text-white leading-tight mb-6">
            Recrutamento técnico sem gargalos.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Avalie habilidades reais com testes dinâmicos gerados por IA, garantindo a melhor aderência técnica antes da entrevista humana.
          </p>
        </div>
        
        <div className="relative z-10 text-blue-200/50 text-xs font-medium">
          © 2026 ComProva Inc.
        </div>
      </div>

      {/* Right Side: Auth Flow */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center px-6 sm:px-16 md:px-24 relative bg-white">
        
        {/* Mobile Header */}
        <div className="lg:hidden mb-12 mt-8">
          <div className="text-2xl font-medium text-[#1a73e8] tracking-tight">ComProva</div>
        </div>

        <div className="w-full max-w-[420px] mx-auto">
          {/* Dynamic Header */}
          <div className="mb-8">
            <h1 className="text-[32px] font-normal text-[#202124] leading-tight mb-2 tracking-tight">
              {location.pathname.includes('register') ? 'Criar uma conta' : 'Entrar'}
            </h1>
            <p className="text-[#5f6368] text-base">
              {location.pathname.includes('register')
                ? 'Crie sua conta para começar'
                : 'Acesse sua conta para continuar'}
            </p>
          </div>

          <div className="w-full">
            {/* Context Switcher Tabs (Only for Register) */}
            {location.pathname.includes('register') && (
              <div className="flex border-b border-[#dadce0] mb-8">
                <Link 
                  to="/candidate/register"
                  className={`flex-1 py-3 text-center text-sm font-medium transition-colors relative
                    ${isCandidate ? 'text-[#1a73e8]' : 'text-[#5f6368] hover:bg-[#f8f9fa]'}`}
                >
                  Sou Candidato
                  {isCandidate && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a73e8] rounded-t-md" />}
                </Link>
                <Link 
                  to="/company/register"
                  className={`flex-1 py-3 text-center text-sm font-medium transition-colors relative
                    ${!isCandidate ? 'text-[#1a73e8]' : 'text-[#5f6368] hover:bg-[#f8f9fa]'}`}
                >
                  Sou Empresa
                  {!isCandidate && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a73e8] rounded-t-md" />}
                </Link>
              </div>
            )}
            
            {/* Render nested auth pages */}
            <div className="animate-in fade-in duration-500">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
