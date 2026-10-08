import { useState, useEffect } from 'react';
import { Briefcase, Building, Clock, MapPin, CheckCircle, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JobService } from '../../services/jobService';

const WORKPLACE_MAP: Record<string, string> = {
  'REMOTE': 'Remoto',
  'HYBRID': 'Híbrido',
  'TRADITIONAL': 'Presencial'
};

export function CandidateDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await JobService.getCandidateApplications(token);
      setApplications(res.content);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar candidaturas.');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => 
    app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.companyName && app.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#dadce0] rounded-full pl-10 pr-4 py-2 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-[#dadce0] rounded-[8px] p-5 shadow-sm">
            <h2 className="text-sm font-medium text-[#202124] mb-4">Resumo</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#f1f3f4] pb-3">
                <span className="text-sm text-[#5f6368] flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Candidaturas
                </span>
                <span className="font-medium text-[#202124]">{applications.length}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#f1f3f4] pb-3">
                <span className="text-sm text-[#5f6368] flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Testes Pendentes
                </span>
                <span className="font-medium text-[#d93025]">{applications.filter(a => a.status === 'PENDING_TEST').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#5f6368] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#137333]" /> Testes Concluídos
                </span>
                <span className="font-medium text-[#202124]">{applications.filter(a => a.status !== 'PENDING_TEST' && a.status !== 'CLOSED').length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-medium text-[#202124]">Minhas Candidaturas</h2>
          
          <div className="bg-white border border-[#dadce0] rounded-[8px] shadow-sm overflow-hidden flex flex-col">
            {error ? (
              <div className="p-8 text-center text-[#c5221f] text-sm">{error}</div>
            ) : loading ? (
              <div className="p-8 text-center text-[#5f6368] text-sm">Carregando candidaturas...</div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-[#e8f0fe] rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Briefcase className="w-8 h-8 text-[#1a73e8]" />
                </div>
                <h3 className="text-lg font-medium text-[#202124] mb-2">Você ainda não se candidatou</h3>
                <p className="text-sm text-[#5f6368] mb-6">
                  Explore as oportunidades publicadas e encontre sua próxima vaga.
                </p>
                <Link to="/candidate/jobs" className="inline-flex items-center justify-center px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium rounded-full shadow-sm transition-all cursor-pointer">
                  Procurar Vagas
                </Link>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-8 text-center text-[#5f6368] text-sm">
                Nenhuma candidatura encontrada para "{searchTerm}".
              </div>
            ) : (
              filteredApplications.map((app, index) => {
                const isClosed = app.jobPostingStatus === 'CLOSED' || app.status === 'CLOSED';
                const isPendingTest = app.status === 'PENDING_TEST';
                const isPassed = app.status === 'PASSED';
                const isFailed = app.status === 'FAILED';
                
                let statusColor = 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc]';
                let statusText = 'Em Análise';
                
                if (isClosed) {
                  statusColor = 'bg-[#fce8e6] text-[#c5221f] border-[#fad2cf]';
                  statusText = 'Encerrada';
                } else if (isPendingTest) {
                  statusColor = 'bg-[#fef7e0] text-[#fbbc04] border-[#fce8e6]';
                  statusText = 'Teste Pendente';
                } else if (isPassed) {
                  statusColor = 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]';
                  statusText = 'Aprovado';
                } else if (isFailed) {
                  statusColor = 'bg-[#fce8e6] text-[#c5221f] border-[#fad2cf]';
                  statusText = 'Reprovado';
                }
                
                return (
                  <div key={app.applicationId} className={`p-5 hover:bg-[#f8f9fa] transition-colors group ${index !== filteredApplications.length - 1 ? 'border-b border-[#dadce0]' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-base font-medium text-[#202124] group-hover:text-[#1a73e8] transition-colors">
                          {app.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#5f6368]">
                          <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {app.companyName || 'Empresa Confidencial'}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {WORKPLACE_MAP[app.workplaceType] || app.workplaceType}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-[#5f6368]">Inscrito em: {app.createdAt ? new Date(app.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}</span>
                      {app.score !== null && app.score !== undefined && (
                        <span className="text-xs font-medium bg-[#f3f2ff] text-[#6554c0] px-2 py-1 rounded-full border border-[#e2e0ff]">
                           Score IA: {app.score}%
                        </span>
                      )}
                      {isPendingTest && (
                        <Link to={`/candidate/test/${app.applicationId}`} className="text-sm font-medium text-[#1a73e8] flex items-center gap-1 hover:text-[#1b66c9] cursor-pointer">
                          Fazer Teste <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {applications.length > 0 && (
            <div className="flex justify-center mt-6">
              <Link to="/candidate/jobs" className="text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] px-4 py-2 rounded-full transition-colors cursor-pointer">
                Explorar Novas Vagas
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
