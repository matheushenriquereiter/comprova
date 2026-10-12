import { WORKPLACE_MAP, EMPLOYMENT_MAP } from "../../utils/constants";
import type { CandidateApplicationDTO } from "../../services/jobService";
import { useState, useEffect, useCallback } from 'react';
import { 
  Briefcase, 
  Building, 
  Clock, 
  MapPin, 
  Search, 
  Sparkles, 
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { JobService } from '../../services/jobService';

type FilterTab = 'ALL' | 'PENDING' | 'DONE';

export function CandidateDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterTab>('ALL');
  const [applications, setApplications] = useState<CandidateApplicationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await JobService.getCandidateApplications(token, 0, 100);
      setApplications(res.content);
      setError('');
    } catch (err: unknown) {
      if (!silent) {
        setError((err as Error).message || 'Erro ao carregar candidaturas.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications(false);
  }, [fetchApplications]);

  const isLocallySubmitted = useCallback((applicationId: number | string): boolean => {
    const val = localStorage.getItem(`submitted_test_${applicationId}`) ||
                sessionStorage.getItem(`submitted_test_${applicationId}`);
    if (!val) return false;
    const ts = Number(val);
    if (!isNaN(ts) && ts > 0) {
      // Se já passou mais de 15 minutos e continua PENDING_TEST, expira
      if (Date.now() - ts > 15 * 60 * 1000) {
        localStorage.removeItem(`submitted_test_${applicationId}`);
        sessionStorage.removeItem(`submitted_test_${applicationId}`);
        return false;
      }
    }
    return true;
  }, []);

  const getEffectiveStatus = useCallback((app: CandidateApplicationDTO): string => {
    // Se o backend já persistiu um status final
    if (app.status !== 'PENDING_TEST' && app.status !== 'EVALUATING') {
      return app.status;
    }

    // Se o backend marcou como EVALUATING ou se o candidato submeteu nesta máquina
    if (app.status === 'EVALUATING' || isLocallySubmitted(app.applicationId)) {
      return 'EVALUATING';
    }

    return app.status;
  }, [isLocallySubmitted]);

  // Limpa as flags locais de submissão quando a avaliação for finalizada pelo backend
  useEffect(() => {
    applications.forEach(app => {
      if (app.status !== 'PENDING_TEST' && app.status !== 'EVALUATING') {
        localStorage.removeItem(`submitted_test_${app.applicationId}`);
        sessionStorage.removeItem(`submitted_test_${app.applicationId}`);
      }
    });
  }, [applications]);

  // Polling automático caso haja avaliações em andamento por IA
  useEffect(() => {
    const hasEvaluating = applications.some(a => getEffectiveStatus(a) === 'EVALUATING');
    if (!hasEvaluating) return;

    const intervalId = setInterval(() => {
      fetchApplications(true);
    }, 3500);

    return () => clearInterval(intervalId);
  }, [applications, getEffectiveStatus, fetchApplications]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data recente';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'Data recente';
    }
  };

  const getStatusConfig = (app: CandidateApplicationDTO, effectiveStatus: string) => {
    const isClosed = app.jobPostingStatus === 'CLOSED' || effectiveStatus === 'CLOSED';
    const isPendingTest = effectiveStatus === 'PENDING_TEST';

    if (isClosed) {
      return {
        text: 'Encerrada',
        badgeClass: 'bg-[#f1f3f4] text-[#5f6368] border-[#dadce0]',
        dotClass: 'bg-[#80868b]',
      };
    }
    if (effectiveStatus === 'EVALUATING') {
      return {
        text: 'Correção por IA em andamento',
        badgeClass: 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc]',
        dotClass: 'bg-[#1a73e8] animate-pulse',
      };
    }
    if (isPendingTest) {
      return {
        text: 'Teste Pendente',
        badgeClass: 'bg-[#fef7e0] text-[#b06000] border-[#fce8b2]',
        dotClass: 'bg-[#f2994a] animate-pulse',
      };
    }
    if (effectiveStatus === 'PASSED') {
      return {
        text: 'Aprovado',
        badgeClass: 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]',
        dotClass: 'bg-[#137333]',
      };
    }
    if (effectiveStatus === 'FAILED') {
      return {
        text: 'Reprovado',
        badgeClass: 'bg-[#fce8e6] text-[#c5221f] border-[#fad2cf]',
        dotClass: 'bg-[#c5221f]',
      };
    }
    return {
      text: 'Aguardando decisão',
      badgeClass: 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc]',
      dotClass: 'bg-[#1a73e8]',
    };
  };

  // Contagens para os filtros de aba baseadas no status efetivo
  const pendingCount = applications.filter(a => getEffectiveStatus(a) === 'PENDING_TEST').length;
  const doneCount = applications.filter(a => getEffectiveStatus(a) !== 'PENDING_TEST').length;

  // Filtragem por busca e por aba
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.companyName && app.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    const effStatus = getEffectiveStatus(app);
    if (statusFilter === 'PENDING') {
      return effStatus === 'PENDING_TEST';
    }
    if (statusFilter === 'DONE') {
      return effStatus !== 'PENDING_TEST';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[#202124]">Minhas Vagas</h1>
          <p className="text-sm text-[#5f6368] mt-1">
            Gerencie suas candidaturas ativas e acompanhe o resultado das avaliações técnicas.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link 
            to="/candidate/jobs"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-white border border-[#1a73e8] text-[#1a73e8] hover:bg-[#e8f0fe] text-xs font-semibold rounded-full transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            Explorar Novas Vagas
          </Link>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f6368]" />
            <input 
              type="text" 
              placeholder="Buscar por cargo ou empresa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#dadce0] rounded-full pl-10 pr-4 py-2 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Feed: LinkedIn-style Job Cards */}
      <div className="space-y-4">
          
          {/* Quick Filter Chips (LinkedIn style) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-[#1a73e8] text-white shadow-xs'
                  : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] hover:text-[#202124]'
              }`}
            >
              Todas ({applications.length})
            </button>
            
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                statusFilter === 'PENDING'
                  ? 'bg-[#1a73e8] text-white shadow-xs'
                  : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] hover:text-[#202124]'
              }`}
            >
              Testes Pendentes ({pendingCount})
              {pendingCount > 0 && statusFilter !== 'PENDING' && (
                <span className="w-2 h-2 rounded-full bg-[#d93025]" />
              )}
            </button>
            
            <button
              onClick={() => setStatusFilter('DONE')}
              className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                statusFilter === 'DONE'
                  ? 'bg-[#1a73e8] text-white shadow-xs'
                  : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] hover:text-[#202124]'
              }`}
            >
              Testes Concluídos ({doneCount})
            </button>
          </div>

          {/* Cards Content */}
          {error ? (
            <div className="p-6 bg-white border border-[#fad2cf] rounded-[8px] text-center text-[#c5221f] text-sm">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-[#d93025]" />
              {error}
            </div>
          ) : loading ? (
            <div className="p-12 bg-white border border-[#dadce0] rounded-[8px] text-center text-[#5f6368] text-sm flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 animate-spin text-[#1a73e8]" />
              Carregando suas candidaturas...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 bg-white border border-[#dadce0] rounded-[8px] text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-[#e8f0fe] rounded-full flex items-center justify-center mb-4 shadow-xs">
                <Briefcase className="w-8 h-8 text-[#1a73e8]" />
              </div>
              <h3 className="text-lg font-medium text-[#202124] mb-2">Você ainda não se candidatou a nenhuma vaga</h3>
              <p className="text-sm text-[#5f6368] max-w-md mb-6">
                Descubra empresas que avaliam suas habilidades técnicas reais por meio de testes dinâmicos com IA.
              </p>
              <Link 
                to="/candidate/jobs" 
                className="inline-flex items-center justify-center px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium rounded-full shadow-sm transition-all cursor-pointer"
              >
                Procurar Vagas Agora
              </Link>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-10 bg-white border border-[#dadce0] rounded-[8px] text-center">
              <Search className="w-8 h-8 text-[#dadce0] mx-auto mb-2" />
              <h3 className="text-base font-medium text-[#202124]">Nenhuma candidatura encontrada</h3>
              <p className="text-sm text-[#5f6368] mt-1">
                {searchTerm 
                  ? `Nenhum resultado para "${searchTerm}". Tente buscar por outros termos.` 
                  : 'Nenhuma candidatura neste filtro.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredApplications.map((app) => {
                const effectiveStatus = getEffectiveStatus(app);
                const isPendingTest = effectiveStatus === 'PENDING_TEST';
                const isEvaluating = effectiveStatus === 'EVALUATING';
                const statusConfig = getStatusConfig(app, effectiveStatus);
                
                // First initial of the company name for LinkedIn-style avatar
                const companyInitial = app.companyName 
                  ? app.companyName.trim().charAt(0).toUpperCase() 
                  : null;

                return (
                  <div 
                    key={app.applicationId}
                    className="bg-white border border-[#dadce0] rounded-[8px] p-5 hover:border-[#80868b] transition-all shadow-xs hover:shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      
                      {/* LinkedIn-Style Company Avatar Box */}
                      <div className="w-12 h-12 rounded-[6px] bg-[#f8f9fa] border border-[#dadce0] flex items-center justify-center shrink-0 shadow-xs">
                        {companyInitial ? (
                          <span className="text-lg font-bold text-[#1a73e8]">
                            {companyInitial}
                          </span>
                        ) : (
                          <Building className="w-6 h-6 text-[#5f6368]" />
                        )}
                      </div>

                      {/* Main Job & Company Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-[#202124] hover:text-[#1a73e8] transition-colors truncate">
                            {app.title}
                          </h3>
                          
                          {/* Status Badge */}
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusConfig.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
                            {statusConfig.text}
                          </span>
                        </div>

                        {/* Company Name */}
                        <p className="text-sm font-medium text-[#202124] mt-0.5 truncate flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-[#80868b] shrink-0" />
                          <span>{app.companyName || 'Empresa Confidencial'}</span>
                        </p>

                        {/* Metadata Row: Workplace • Employment • Location • Date */}
                        <div className="flex items-center gap-2 mt-2 text-xs text-[#5f6368] flex-wrap">
                          <span>{WORKPLACE_MAP[app.workplaceType] || app.workplaceType}</span>
                          
                          {app.employmentType && (
                            <>
                              <span className="text-[#dadce0]">•</span>
                              <span>{EMPLOYMENT_MAP[app.employmentType] || app.employmentType}</span>
                            </>
                          )}
                          
                          {app.location && (
                            <>
                              <span className="text-[#dadce0]">•</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-[#5f6368]" />
                                {app.location}
                              </span>
                            </>
                          )}

                          <span className="text-[#dadce0]">•</span>
                          <span className="flex items-center gap-1 text-[#80868b]">
                            <Calendar className="w-3 h-3" />
                            Candidatou-se em {formatDate(app.createdAt)}
                          </span>
                        </div>

                        {/* AI Evaluation Score Pill */}
                        {app.score !== null && app.score !== undefined && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#f3f2ff] text-[#6554c0] px-3 py-1 rounded-md border border-[#e2e0ff]">
                              <Sparkles className="w-3.5 h-3.5 text-[#6554c0]" />
                              Avaliação Técnica por IA: <strong>{app.score}%</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right CTA / Action Area (LinkedIn style) */}
                    {isPendingTest ? (
                      <div className="w-full sm:w-auto shrink-0 flex items-center justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-[#f1f3f4]">
                        <Link 
                          to={`/candidate/test/${app.applicationId}`}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-full shadow-xs hover:shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30"
                        >
                          Fazer Teste Técnico
                        </Link>
                      </div>
                    ) : isEvaluating ? (
                      <div className="w-full sm:w-auto shrink-0 flex items-center justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-[#f1f3f4]">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1a73e8]" />
                          Avaliando respostas...
                        </span>
                      </div>
                    ) : null}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    );
  }
