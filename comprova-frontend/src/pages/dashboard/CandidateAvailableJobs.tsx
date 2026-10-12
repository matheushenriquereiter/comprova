import { WORKPLACE_MAP, EMPLOYMENT_MAP } from "../../utils/constants";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Search, 
  Check, 
  Building, 
  ArrowRight,
  Calendar
} from 'lucide-react';
import { JobService, type JobPostingResponseDTO } from '../../services/jobService';
import { Modal } from '../../components/ui/Modal';
import { AuthButton } from '../../components/ui/AuthButton';

type WorkplaceFilter = 'ALL' | 'REMOTE' | 'HYBRID' | 'TRADITIONAL' | 'NOT_APPLIED';

export function CandidateAvailableJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPostingResponseDTO[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [workplaceFilter, setWorkplaceFilter] = useState<WorkplaceFilter>('ALL');
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);
  const [confirmModalJob, setConfirmModalJob] = useState<JobPostingResponseDTO | null>(null);
  
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const [availableJobsRes, appliedJobsRes] = await Promise.all([
          JobService.getAvailableJobPostings(token, 0, 100),
          JobService.getCandidateApplications(token, 0, 100)
        ]);
        setJobs(availableJobsRes.content);
        setAppliedJobs(new Set(appliedJobsRes.content.map((j) => j.jobPostingId)));
        setError('');
      } catch (err: unknown) {
        setError((err as Error).message || 'Erro ao carregar vagas.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApplyClick = (job: JobPostingResponseDTO) => {
    setConfirmModalJob(job);
  };

  const handleConfirmApply = async () => {
    if (!confirmModalJob) return;
    const targetJob = confirmModalJob;
    
    setApplyingJobId(targetJob.id);
    try {
      const token = localStorage.getItem('token') || '';
      await JobService.applyToJobPosting(token, targetJob.id);
      setAppliedJobs(prev => new Set([...prev, targetJob.id]));
      setConfirmModalJob(null);
      setSuccessModalOpen(true);
    } catch (err: unknown) {
      window.alert((err as Error).message || 'Erro ao se candidatar.');
      setConfirmModalJob(null);
    } finally {
      setApplyingJobId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return null;
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (job.companyName && job.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.skills && job.skills.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())));

    if (!matchesSearch) return false;

    if (workplaceFilter === 'REMOTE') {
      return job.workplaceType === 'REMOTE';
    }
    if (workplaceFilter === 'HYBRID') {
      return job.workplaceType === 'HYBRID';
    }
    if (workplaceFilter === 'TRADITIONAL') {
      return job.workplaceType === 'TRADITIONAL';
    }
    if (workplaceFilter === 'NOT_APPLIED') {
      return !appliedJobs.has(job.id);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[#202124]">Vagas Disponíveis</h1>
          <p className="text-sm text-[#5f6368] mt-1">
            Encontre oportunidades abertas com avaliação técnica transparente e dinâmica por IA.
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f6368]" />
          <input 
            type="text" 
            placeholder="Buscar por cargo, empresa ou skill..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#dadce0] rounded-full pl-10 pr-4 py-2 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-all"
          />
        </div>
      </div>

      {/* Quick Filter Chips (LinkedIn style) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setWorkplaceFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            workplaceFilter === 'ALL'
              ? 'bg-[#1a73e8] text-white shadow-xs'
              : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] hover:text-[#202124]'
          }`}
        >
          Todas ({jobs.length})
        </button>

        <button
          onClick={() => setWorkplaceFilter('REMOTE')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            workplaceFilter === 'REMOTE'
              ? 'bg-[#1a73e8] text-white shadow-xs'
              : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] hover:text-[#202124]'
          }`}
        >
          Remoto ({jobs.filter(j => j.workplaceType === 'REMOTE').length})
        </button>

        <button
          onClick={() => setWorkplaceFilter('HYBRID')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            workplaceFilter === 'HYBRID'
              ? 'bg-[#1a73e8] text-white shadow-xs'
              : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] hover:text-[#202124]'
          }`}
        >
          Híbrido ({jobs.filter(j => j.workplaceType === 'HYBRID').length})
        </button>

        <button
          onClick={() => setWorkplaceFilter('TRADITIONAL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            workplaceFilter === 'TRADITIONAL'
              ? 'bg-[#1a73e8] text-white shadow-xs'
              : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] hover:text-[#202124]'
          }`}
        >
          Presencial ({jobs.filter(j => j.workplaceType === 'TRADITIONAL').length})
        </button>

        <button
          onClick={() => setWorkplaceFilter('NOT_APPLIED')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            workplaceFilter === 'NOT_APPLIED'
              ? 'bg-[#1a73e8] text-white shadow-xs'
              : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] hover:text-[#202124]'
          }`}
        >
          Não Inscrito ({jobs.filter(j => !appliedJobs.has(j.id)).length})
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[#fce8e6] text-[#c5221f] rounded-[8px] text-sm border border-[#fad2cf]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-[#5f6368] flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
          Carregando vagas disponíveis...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#dadce0] rounded-[8px]">
          <Briefcase className="w-12 h-12 text-[#dadce0] mx-auto mb-3" />
          <h3 className="text-base font-medium text-[#202124]">Nenhuma vaga encontrada</h3>
          <p className="text-sm text-[#5f6368] mt-1">
            {searchTerm ? 'Tente buscar com outros termos ou filtros.' : 'No momento não há novas vagas disponíveis para esta categoria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredJobs.map(job => {
            const hasApplied = appliedJobs.has(job.id);
            const isApplying = applyingJobId === job.id;
            const companyInitial = job.companyName ? job.companyName.trim().charAt(0).toUpperCase() : null;
            const expirationFormatted = formatDate(job.expiresAt);

            return (
              <div 
                key={job.id} 
                className="bg-white border border-[#dadce0] rounded-[8px] p-5 hover:border-[#80868b] transition-all shadow-xs hover:shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* LinkedIn-Style Company Avatar */}
                  <div className="w-12 h-12 rounded-[6px] bg-[#f8f9fa] border border-[#dadce0] flex items-center justify-center shrink-0 shadow-xs">
                    {companyInitial ? (
                      <span className="text-lg font-bold text-[#1a73e8]">
                        {companyInitial}
                      </span>
                    ) : (
                      <Building className="w-6 h-6 text-[#5f6368]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-[#202124] group-hover:text-[#1a73e8] transition-colors truncate">
                      {job.title}
                    </h3>

                    <p className="text-sm font-medium text-[#202124] mt-0.5 truncate flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#80868b] shrink-0" />
                      <span>{job.companyName || 'Empresa Confidencial'}</span>
                    </p>

                    {/* Metadata Row (Workplace · Employment · Location · Expiration) */}
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#5f6368] flex-wrap">
                      <span>{WORKPLACE_MAP[job.workplaceType] || job.workplaceType}</span>
                      
                      {job.employmentType && (
                        <>
                          <span className="text-[#dadce0]">•</span>
                          <span>{EMPLOYMENT_MAP[job.employmentType] || job.employmentType}</span>
                        </>
                      )}
                      
                      {job.location && (
                        <>
                          <span className="text-[#dadce0]">•</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-[#5f6368]" />
                            {job.location}
                          </span>
                        </>
                      )}

                      {expirationFormatted && (
                        <>
                          <span className="text-[#dadce0]">•</span>
                          <span className="flex items-center gap-1 text-[#80868b]">
                            <Calendar className="w-3 h-3" />
                            Até {expirationFormatted}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Description Preview */}
                    {job.description && (
                      <p className="text-xs text-[#5f6368] mt-2.5 line-clamp-2 leading-relaxed max-w-3xl">
                        {job.description}
                      </p>
                    )}

                    {/* Required Skills Badges */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 5).map(skill => (
                          <span 
                            key={skill.name} 
                            className="px-2.5 py-0.5 bg-[#f1f3f4] border border-[#dadce0]/60 text-[#202124] rounded-md text-[11px] font-medium"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="px-2 py-0.5 bg-[#f8f9fa] text-[#5f6368] rounded-md text-[11px] font-medium">
                            +{job.skills.length - 5} mais
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action / CTA Area */}
                <div className="w-full sm:w-auto shrink-0 flex items-center justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-[#f1f3f4]">
                  {hasApplied ? (
                    <span className="w-full sm:w-auto px-5 py-2 bg-[#e6f4ea] text-[#137333] border border-[#ceead6] text-xs font-semibold rounded-full flex items-center justify-center shadow-xs">
                      Inscrito
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApplyClick(job)}
                      disabled={isApplying}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-full transition-all shadow-xs hover:shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isApplying ? (
                        <>Inscrevendo...</>
                      ) : (
                        <>
                          Candidatar-se
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalJob !== null}
        onClose={() => !applyingJobId && setConfirmModalJob(null)}
        title="Confirmar Candidatura"
        maxWidth="max-w-md"
        footer={
          <>
            <AuthButton 
              variant="secondary" 
              onClick={() => setConfirmModalJob(null)} 
              disabled={applyingJobId !== null}
            >
              Cancelar
            </AuthButton>
            <AuthButton 
              variant="primary" 
              onClick={handleConfirmApply} 
              isLoading={applyingJobId !== null}
            >
              Confirmar Inscrição
            </AuthButton>
          </>
        }
      >
        <div className="space-y-4">
          {confirmModalJob && (
            <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-[8px] p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-[6px] bg-white border border-[#dadce0] flex items-center justify-center shrink-0 font-bold text-[#1a73e8] text-base shadow-xs">
                {confirmModalJob.companyName ? confirmModalJob.companyName.trim().charAt(0).toUpperCase() : 'E'}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-[#202124] truncate">{confirmModalJob.title}</h4>
                <p className="text-xs text-[#5f6368] mt-0.5">{confirmModalJob.companyName || 'Empresa Confidencial'}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[#80868b]">
                  <span>{WORKPLACE_MAP[confirmModalJob.workplaceType] || confirmModalJob.workplaceType}</span>
                  <span>•</span>
                  <span>{EMPLOYMENT_MAP[confirmModalJob.employmentType] || confirmModalJob.employmentType}</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-[#5f6368]">
            <p>
              Ao confirmar sua inscrição, a empresa receberá seus dados de contato e seu perfil profissional.
            </p>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Candidatura Enviada"
        maxWidth="max-w-md"
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 w-full">
            <button 
              type="button"
              onClick={() => setSuccessModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2 border border-[#dadce0] bg-white hover:bg-[#f8f9fa] text-[#5f6368] hover:text-[#202124] text-xs font-semibold rounded-full transition-colors cursor-pointer"
            >
              Continuar Explorando
            </button>
            <button 
              type="button"
              onClick={() => {
                setSuccessModalOpen(false);
                navigate('/candidate/dashboard');
              }}
              className="w-full sm:w-auto px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-full transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Ir para Minhas Vagas
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      >
        <div className="py-2 text-center">
          {/* Centered Minimalist Success Icon Badge */}
          <div className="w-12 h-12 bg-[#e6f4ea] border border-[#ceead6] rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Check className="w-6 h-6 text-[#137333]" strokeWidth={2.5} />
          </div>

          <h3 className="text-base font-semibold text-[#202124]">
            Inscrição realizada com sucesso!
          </h3>
          <p className="text-xs text-[#5f6368] mt-1.5 max-w-sm mx-auto leading-relaxed">
            Sua candidatura foi registrada. Agora você já pode realizar o teste técnico de avaliação no seu painel.
          </p>
        </div>
      </Modal>
    </div>
  );
}
