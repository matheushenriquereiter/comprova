import { Briefcase, Building, Clock, MapPin, CheckCircle, Search, ArrowRight } from 'lucide-react';

export function CandidateDashboard() {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[#202124]">Bem-vindo(a) ao seu painel</h1>
          <p className="text-sm text-[#5f6368] mt-1">Acompanhe suas candidaturas e avaliações técnicas.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f6368]" />
          <input 
            type="text" 
            placeholder="Buscar vagas..." 
            className="w-full bg-white border border-[#dadce0] rounded-full pl-10 pr-4 py-2 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Stats & Status */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-[#dadce0] rounded-[8px] p-5 shadow-sm">
            <h2 className="text-sm font-medium text-[#202124] mb-4">Resumo</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#f1f3f4] pb-3">
                <span className="text-sm text-[#5f6368] flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Candidaturas
                </span>
                <span className="font-medium text-[#202124]">3</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#f1f3f4] pb-3">
                <span className="text-sm text-[#5f6368] flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Testes Pendentes
                </span>
                <span className="font-medium text-[#d93025]">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#5f6368] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#137333]" /> Testes Concluídos
                </span>
                <span className="font-medium text-[#202124]">2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Applications */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-medium text-[#202124]">Minhas Candidaturas</h2>
          
          <div className="bg-white border border-[#dadce0] rounded-[8px] shadow-sm overflow-hidden flex flex-col">
            
            {/* Job Card 1 */}
            <div className="p-5 border-b border-[#dadce0] hover:bg-[#f8f9fa] transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-base font-medium text-[#1a73e8] group-hover:underline">Engenheiro de Software Sênior (Java/Spring)</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[#5f6368]">
                    <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> Tech Corp BR</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Remoto</span>
                  </div>
                </div>
                <span className="bg-[#fce8e6] text-[#c5221f] text-xs font-medium px-2 py-1 rounded-full border border-[#fad2cf]">
                  Teste Pendente
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-[#5f6368]">Inscrito em 10 Out, 2023</span>
                <button className="text-sm font-medium text-[#1a73e8] flex items-center gap-1 hover:text-[#1b66c9] cursor-pointer">
                  Fazer Teste <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Job Card 2 */}
            <div className="p-5 border-b border-[#dadce0] hover:bg-[#f8f9fa] transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-base font-medium text-[#202124] group-hover:text-[#1a73e8] transition-colors">Desenvolvedor Frontend (React)</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[#5f6368]">
                    <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> Inova Sistemas</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Híbrido - SP</span>
                  </div>
                </div>
                <span className="bg-[#e6f4ea] text-[#137333] text-xs font-medium px-2 py-1 rounded-full border border-[#ceead6]">
                  Avaliando
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-[#5f6368]">Inscrito em 02 Out, 2023</span>
                <span className="text-xs text-[#137333] flex items-center gap-1 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Teste concluído (85%)
                </span>
              </div>
            </div>

            {/* Job Card 3 */}
            <div className="p-5 hover:bg-[#f8f9fa] transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-base font-medium text-[#202124] group-hover:text-[#1a73e8] transition-colors">Tech Lead</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[#5f6368]">
                    <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> Global Solutions</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Presencial</span>
                  </div>
                </div>
                <span className="bg-[#fce8e6] text-[#c5221f] text-xs font-medium px-2 py-1 rounded-full border border-[#fad2cf]">
                  Encerrada
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-[#5f6368]">Inscrito em 15 Set, 2023</span>
              </div>
            </div>
            
          </div>
          
          <div className="flex justify-center mt-6">
            <button className="text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] px-4 py-2 rounded-full transition-colors cursor-pointer">
              Explorar Novas Vagas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
