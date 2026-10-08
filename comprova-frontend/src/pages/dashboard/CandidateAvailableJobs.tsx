import { WORKPLACE_MAP, EMPLOYMENT_MAP } from "../../utils/constants";
import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Search, CheckCircle } from 'lucide-react';
import { JobService, type JobPostingResponseDTO } from '../../services/jobService';
import { Modal } from '../../components/ui/Modal';
import { AuthButton } from '../../components/ui/AuthButton';



export function CandidateAvailableJobs() {
  const [jobs, setJobs] = useState<JobPostingResponseDTO[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);
  const [confirmModalJob, setConfirmModalJob] = useState<JobPostingResponseDTO | null>(null);
  
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const [availableJobsRes, appliedJobsRes] = await Promise.all([
          JobService.getAvailableJobPostings(token),
          JobService.getCandidateApplications(token)
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
    
    setApplyingJobId(confirmModalJob.id);
    try {
      const token = localStorage.getItem('token') || '';
      await JobService.applyToJobPosting(token, confirmModalJob.id);
      setAppliedJobs(prev => new Set(prev).add(confirmModalJob.id));
      
      setConfirmModalJob(null);
      setSuccessMessage(`Sua candidatura para a vaga "${confirmModalJob.title}" foi enviada com sucesso! Fique de olho no seu painel para realizar o teste técnico quando for liberado.`);
      setSuccessModalOpen(true);
    } catch (err: unknown) {
      window.alert((err as Error).message || 'Erro ao se candidatar.');
      setConfirmModalJob(null);
    } finally {
      setApplyingJobId(null);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[#202124]">Vagas Disponíveis</h1>
          <p className="text-sm text-[#5f6368] mt-1">Encontre e aplique para as melhores oportunidades.</p>
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

      {error && (
        <div className="p-4 bg-[#fce8e6] text-[#c5221f] rounded-[8px] text-sm border border-[#fad2cf]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#5f6368]">Carregando vagas...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white border border-[#dadce0] rounded-[8px]">
          <Briefcase className="w-12 h-12 text-[#dadce0] mx-auto mb-3" />
          <h3 className="text-base font-medium text-[#202124]">Nenhuma vaga encontrada</h3>
          <p className="text-sm text-[#5f6368] mt-1">
            {searchTerm ? 'Tente buscar com outros termos.' : 'No momento não há novas vagas disponíveis.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => {
            const hasApplied = appliedJobs.has(job.id);
            const isApplying = applyingJobId === job.id;
            
            return (
              <div key={job.id} className="bg-white border border-[#dadce0] rounded-[8px] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex-1">
                  <h3 className="text-base font-medium text-[#202124] line-clamp-2">{job.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#5f6368] flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> 
                      {WORKPLACE_MAP[job.workplaceType] || job.workplaceType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> 
                      {EMPLOYMENT_MAP[job.employmentType] || job.employmentType}
                    </span>
                  </div>
                  {job.location && (
                    <p className="text-xs text-[#5f6368] mt-1">{job.location}</p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-[#f1f3f4]">
                    <p className="text-sm text-[#5f6368] line-clamp-3">
                      {job.description}
                    </p>
                  </div>
                  
                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.skills.map(skill => (
                        <span key={skill.name} className="px-2 py-0.5 bg-[#f8f9fa] border border-[#dadce0] text-[#5f6368] rounded-full text-[10px] font-medium">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-[#f1f3f4]">
                  {hasApplied ? (
                    <div className="w-full py-2 bg-[#e6f4ea] text-[#137333] text-sm font-medium rounded-[4px] flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Inscrito
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApplyClick(job)}
                      disabled={isApplying}
                      className="w-full py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium rounded-[4px] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isApplying ? 'Inscrevendo...' : 'Candidatar-se'}
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
        title="Confirmar Inscrição"
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
              Confirmar
            </AuthButton>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-[#202124] text-sm">
            Tem certeza que deseja se inscrever para a vaga de <strong>{confirmModalJob?.title}</strong>?
          </p>
          <p className="text-[#5f6368] text-sm">
            Ao confirmar, a empresa terá acesso ao seu perfil e você será notificado quando o teste técnico estiver disponível.
          </p>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Sucesso!"
        maxWidth="max-w-md"
        footer={
          <AuthButton 
            variant="primary" 
            onClick={() => setSuccessModalOpen(false)} 
          >
            Entendi
          </AuthButton>
        }
      >
        <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
          <div className="w-16 h-16 bg-[#e6f4ea] rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="w-8 h-8 text-[#137333]" />
          </div>
          <p className="text-[#202124] text-sm leading-relaxed">
            {successMessage}
          </p>
        </div>
      </Modal>
    </div>
  );
}
