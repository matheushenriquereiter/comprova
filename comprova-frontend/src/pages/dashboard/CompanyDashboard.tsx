import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Users, Wand2, Briefcase, Calendar, X, Trash2, Edit2, Save } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';
import { JobService, type JobSkillRequirement, type QuestionDTO, type CreateJobPostingDTO, type JobPostingResponseDTO } from '../../services/jobService';



const STATUS_MAP: Record<string, string> = {
  'ACTIVE': 'Ativa',
  'DRAFT': 'Rascunho',
  'CLOSED': 'Encerrada'
};

const WORKPLACE_MAP: Record<string, string> = {
  'REMOTE': 'Remoto',
  'HYBRID': 'Híbrido',
  'TRADITIONAL': 'Presencial'
};

export function CompanyDashboard() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'requirements' | 'ai'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const [jobs, setJobs] = useState<JobPostingResponseDTO[]>([]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const page = await JobService.getCompanyJobPostings(token);
      setJobs(page.content);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, []);


  // Form States
  const [jobFormData, setJobFormData] = useState({
    title: '',
    description: '',
    workplaceType: 'REMOTE',
    employmentType: 'FULL_TIME',
    location: '',
    expiresAt: ''
  });
  const [skills, setSkills] = useState<JobSkillRequirement[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillWeight, setNewSkillWeight] = useState('20');
  
  // AI Questions State
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobFormData(prev => ({ ...prev, [name]: value }));
  };

  const currentWeightSum = skills.reduce((acc, skill) => acc + skill.weight, 0);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const weight = parseInt(newSkillWeight) || 0;
    if (currentWeightSum + weight > 100) {
      setServerError(`O peso total não pode ultrapassar 100. Você tentou adicionar ${weight} a ${currentWeightSum}.`);
      return;
    }
    setServerError('');
    setSkills([...skills, { name: newSkillName.trim(), weight }]);
    setNewSkillName('');
    setNewSkillWeight('20');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleGenerateQuestions = async () => {
    if (!jobFormData.description.trim() || skills.length === 0) {
      setServerError("Preencha a descrição e adicione habilidades antes de gerar perguntas.");
      return;
    }
    if (currentWeightSum !== 100) {
      setServerError("A soma dos pesos das habilidades deve ser 100 antes de gerar as questões.");
      return;
    }
    setServerError('');
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token') || '';
      const generated = await JobService.generateQuestions(token, jobFormData.description, skills);
      setQuestions(generated);
    } catch (err: unknown) {
      setServerError((err as Error).message || "Erro ao gerar questões.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitJob = async () => {
    if (!jobFormData.title || jobFormData.title.length < 5) {
      setServerError("O título da vaga deve ter no mínimo 5 caracteres.");
      setActiveTab('details');
      return;
    }
    if (!jobFormData.location || jobFormData.location.length < 2) {
      setServerError("A localização deve ter no mínimo 2 caracteres.");
      setActiveTab('details');
      return;
    }
    if (!jobFormData.expiresAt) {
      setServerError("A data de expiração é obrigatória.");
      setActiveTab('details');
      return;
    }
    if (!jobFormData.description || jobFormData.description.length < 10) {
      setServerError("A descrição deve ter no mínimo 10 caracteres.");
      setActiveTab('details');
      return;
    }
    if (currentWeightSum !== 100) {
      setServerError(`A soma dos pesos das habilidades deve ser exatamente 100. Atualmente está em ${currentWeightSum}.`);
      setActiveTab('requirements');
      return;
    }
    if (questions.length === 0) {
      setServerError("Gere ou adicione pelo menos uma questão antes de publicar a vaga.");
      setActiveTab('ai');
      return;
    }
    
    setServerError('');
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token') || '';
      const expiresDate = `${jobFormData.expiresAt}T23:59:59`;

      const payload: CreateJobPostingDTO = {
        title: jobFormData.title,
        description: jobFormData.description,
        workplaceType: jobFormData.workplaceType,
        employmentType: jobFormData.employmentType,
        location: jobFormData.location,
        expiresAt: expiresDate,
        skills: skills,
        questions: questions
      };

      await JobService.createJobPosting(token, payload);
      
      // Success
      setIsModalOpen(false);
      // Reset form
      setJobFormData({
        title: '', description: '', workplaceType: 'REMOTE', employmentType: 'FULL_TIME', location: '', expiresAt: ''
      });
      setSkills([]);
      setQuestions([]);
      setActiveTab('details');
      
      fetchJobs();
    } catch (err: unknown) {
      const errorObj = err as { message?: string; errors?: { field: string; message: string }[] };
      if (errorObj.errors && errorObj.errors.length > 0) {
        const errorMessages = errorObj.errors.map(e => e.message).join(' | ');
        setServerError(errorMessages);
      } else {
        setServerError(errorObj?.message || "Erro ao publicar vaga.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[#202124]">Minhas Vagas</h1>
          <p className="text-sm text-[#5f6368] mt-1">Gerencie suas vagas e acompanhe os candidatos.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f6368]" />
            <input 
              type="text" 
              placeholder="Buscar vagas..." 
              className="w-full bg-white border border-[#dadce0] rounded-full pl-10 pr-4 py-2 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1a73e8] text-white px-4 py-2 rounded-[4px] text-sm font-medium hover:bg-[#1b66c9] transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nova Vaga
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#dadce0] rounded-[8px] p-5 flex items-start gap-4">
          <div className="p-3 bg-[#e8f0fe] text-[#1a73e8] rounded-full">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#5f6368]">Vagas Ativas</p>
            <h3 className="text-2xl font-medium text-[#202124] mt-1">1</h3>
          </div>
        </div>
        <div className="bg-white border border-[#dadce0] rounded-[8px] p-5 flex items-start gap-4">
          <div className="p-3 bg-[#e6f4ea] text-[#137333] rounded-full">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#5f6368]">Total de Candidatos</p>
            <h3 className="text-2xl font-medium text-[#202124] mt-1">4</h3>
          </div>
        </div>
        <div className="bg-white border border-[#dadce0] rounded-[8px] p-5 flex items-start gap-4">
          <div className="p-3 bg-[#fce8e6] text-[#c5221f] rounded-full">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#5f6368]">Expirando em breve</p>
            <h3 className="text-2xl font-medium text-[#202124] mt-1">0</h3>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-[#dadce0] rounded-[8px] overflow-hidden">
        {jobs.length === 0 ? (
          <div className="px-6 py-20 text-center bg-white">
            <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
              <div className="w-16 h-16 bg-[#e8f0fe] rounded-full flex items-center justify-center mb-5 shadow-sm">
                <Briefcase className="w-8 h-8 text-[#1a73e8]" />
              </div>
              <h3 className="text-lg font-medium text-[#202124] mb-2">Sua primeira vaga está a um clique</h3>
              <p className="text-sm text-[#5f6368] mb-6 leading-relaxed">
                Descreva a vaga e as habilidades exigidas. A IA da ComProva cuidará de gerar o teste técnico para validar seus candidatos sem gargalos.
              </p>
              <AuthButton 
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Criar Vaga com IA
              </AuthButton>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#dadce0]">
                  <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Vaga</th>
                  <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Candidatos</th>
                  <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Expira em</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dadce0]">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#f8f9fa] transition-colors group cursor-pointer" onClick={() => navigate(`/company/dashboard/postings/${job.id}/candidates`)}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#1a73e8] group-hover:underline">{job.title}</div>
                    <div className="text-xs text-[#5f6368] mt-1 flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3" /> {WORKPLACE_MAP[job.workplaceType] || job.workplaceType}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'ACTIVE' ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#f1f3f4] text-[#5f6368]'
                    }`}>
                      {STATUS_MAP[job.status] || job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-[#202124]">
                      <Users className="w-4 h-4 text-[#5f6368]" />
                      {(job.candidates?.length || 0) > 0 ? (
                        <span className="font-medium">{job.candidates?.length} inscritos</span>
                      ) : (
                        <span className="text-[#5f6368]">Nenhuma inscrição ainda</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5f6368]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(job.expiresAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#5f6368] p-1.5 hover:bg-[#e8eaed] rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={(e) => { e.stopPropagation(); }}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Criar Nova Vaga"
        maxWidth="max-w-3xl"
        footer={
          <>
            <AuthButton variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting || isGenerating}>Cancelar</AuthButton>
            <AuthButton variant="primary" onClick={handleSubmitJob} isLoading={isSubmitting} disabled={isGenerating}>Publicar Vaga</AuthButton>
          </>
        }
      >
        {serverError && (
          <div className="p-3 mb-4 bg-[#fce8e6] border border-[#fad2cf] text-[#c5221f] text-sm rounded-[4px]">
            {serverError}
          </div>
        )}
        <div className="flex border-b border-[#dadce0] mb-6">
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'details' ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-[#5f6368] hover:text-[#202124]'}`}
            onClick={() => setActiveTab('details')}
          >
            Detalhes Básicos
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'requirements' ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-[#5f6368] hover:text-[#202124]'}`}
            onClick={() => setActiveTab('requirements')}
          >
            Requisitos
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${activeTab === 'ai' ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-[#5f6368] hover:text-[#202124]'}`}
            onClick={() => setActiveTab('ai')}
          >
            <Wand2 className="w-4 h-4" /> Avaliação por IA
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <AuthInput label="Título da Vaga" name="title" value={jobFormData.title} onChange={handleFormChange} placeholder="ex. Engenheiro Frontend Sênior" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#5f6368] text-xs font-medium">Modalidade</label>
                <select name="workplaceType" value={jobFormData.workplaceType} onChange={handleFormChange} className="w-full bg-transparent border border-[#dadce0] rounded-[4px] px-3.5 py-3 text-[#202124] text-sm outline-none focus:border-[#1a73e8] cursor-pointer">
                  <option value="REMOTE">Remoto</option>
                  <option value="HYBRID">Híbrido</option>
                  <option value="TRADITIONAL">Presencial</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#5f6368] text-xs font-medium">Tipo de Contrato</label>
                <select name="employmentType" value={jobFormData.employmentType} onChange={handleFormChange} className="w-full bg-transparent border border-[#dadce0] rounded-[4px] px-3.5 py-3 text-[#202124] text-sm outline-none focus:border-[#1a73e8] cursor-pointer">
                  <option value="FULL_TIME">Tempo Integral</option>
                  <option value="PART_TIME">Meio Período</option>
                  <option value="CONTRACT">PJ / Contratado</option>
                  <option value="INTERNSHIP">Estágio</option>
                </select>
              </div>
            </div>
            
            <AuthInput label="Localização" name="location" value={jobFormData.location} onChange={handleFormChange} placeholder="ex. São Paulo, Brasil" />
            <AuthInput label="Data de Expiração" name="expiresAt" value={jobFormData.expiresAt} onChange={handleFormChange} type="date" />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[#5f6368] text-xs font-medium">Descrição da Vaga</label>
              <textarea 
                name="description"
                value={jobFormData.description}
                onChange={handleFormChange}
                className="w-full bg-transparent border border-[#dadce0] rounded-[4px] px-3.5 py-3 text-[#202124] text-sm outline-none focus:border-[#1a73e8] h-32 resize-none"
                placeholder="Descreva a vaga e responsabilidades..."
              ></textarea>
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="space-y-5 animate-in fade-in duration-200 min-h-[300px]">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-sm font-medium text-[#202124]">Habilidades Necessárias</h3>
                <p className="text-sm text-[#5f6368] mt-1">Adicione as habilidades e distribua os pesos. A soma deve ser exatamente 100.</p>
              </div>
              <div className="text-sm font-medium flex items-center gap-2">
                <span className="text-[#5f6368]">Total Distribuído:</span>
                <span className={`px-2.5 py-1 rounded-full ${currentWeightSum === 100 ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'}`}>
                  {currentWeightSum} / 100
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 items-end">
              <div className="flex-1 flex flex-col gap-1.5 font-sans relative">
                <label className="text-[#5f6368] text-xs font-medium">Habilidade</label>
                <input 
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="ex. Java, React, SQL"
                  className="w-full bg-transparent border border-[#dadce0] rounded-[4px] px-3.5 py-3 text-[#202124] text-sm outline-none transition-colors hover:border-[#80868b] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
              </div>
              <div className="w-32">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#5f6368] text-xs font-medium">Peso (%)</label>
                  <input 
                    type="number"
                    min="1"
                    max="100"
                    value={newSkillWeight} 
                    onChange={(e) => setNewSkillWeight(e.target.value)}
                    className="w-full bg-transparent border border-[#dadce0] rounded-[4px] px-3.5 py-3 text-[#202124] text-sm outline-none focus:border-[#1a73e8] transition-colors hover:border-[#80868b] focus:ring-1 focus:ring-[#1a73e8]"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  />
                </div>
              </div>
              <div>
                <AuthButton type="button" variant="secondary" className="h-[46px] px-6" onClick={handleAddSkill}>Adicionar</AuthButton>
              </div>
            </div>
            
            {skills.length === 0 ? (
              <div className="mt-4 border border-[#dadce0] rounded-[4px] p-4 bg-[#f8f9fa] flex items-center justify-center text-sm text-[#5f6368] min-h-[100px]">
                Nenhuma habilidade adicionada.
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-3 py-1.5 rounded-full text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-[10px] uppercase font-bold bg-white text-[#1a73e8] px-1.5 py-0.5 rounded-full">
                      Peso {skill.weight}
                    </span>
                    <button type="button" onClick={() => handleRemoveSkill(idx)} className="text-[#1a73e8] hover:text-[#174ea6] cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-5 animate-in fade-in duration-200 min-h-[300px]">
            <div className="flex items-start gap-4 p-4 bg-[#e8f0fe] rounded-[8px]">
              <div className="p-2 bg-white rounded-full text-[#1a73e8]">
                <Wand2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-[#1a73e8] mb-1">Teste Gerado por IA</h3>
                <p className="text-sm text-[#202124]">
                  A IA criará questões técnicas (discursivas ou de código) baseadas nas habilidades e descrição fornecidas.
                </p>
                <AuthButton 
                  variant="secondary" 
                  className="mt-3 bg-white hover:bg-[#f8f9fa] shadow-sm"
                  onClick={handleGenerateQuestions}
                  isLoading={isGenerating}
                >
                  <Wand2 className="w-4 h-4 mr-2 inline" /> Gerar Perguntas
                </AuthButton>
              </div>
            </div>

            {questions.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-base font-medium text-[#202124] border-b border-[#dadce0] pb-2">Questões ({questions.length})</h3>
                
                {questions.map((q, idx) => (
                  <div key={idx} className="border border-[#dadce0] rounded-[8px] overflow-hidden">
                    {editingQuestionIdx === idx ? (
                      <div className="p-4 bg-[#f8f9fa] space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-[#5f6368]">Enunciado</label>
                          <textarea 
                            value={q.statement}
                            onChange={(e) => {
                              const newQ = [...questions];
                              newQ[idx].statement = e.target.value;
                              setQuestions(newQ);
                            }}
                            className="w-full bg-white border border-[#dadce0] rounded-[4px] px-3 py-2 text-sm outline-none focus:border-[#1a73e8] h-20 resize-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-[#5f6368]">Snippet de Código</label>
                          <textarea 
                            value={q.codeSnippet}
                            onChange={(e) => {
                              const newQ = [...questions];
                              newQ[idx].codeSnippet = e.target.value;
                              setQuestions(newQ);
                            }}
                            className="w-full bg-slate-900 text-green-400 font-mono border border-[#dadce0] rounded-[4px] px-3 py-2 text-sm outline-none focus:border-[#1a73e8] h-24 resize-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-[#5f6368]">Resposta Esperada</label>
                          <textarea 
                            value={q.expectedAnswer}
                            onChange={(e) => {
                              const newQ = [...questions];
                              newQ[idx].expectedAnswer = e.target.value;
                              setQuestions(newQ);
                            }}
                            className="w-full bg-white border border-[#dadce0] rounded-[4px] px-3 py-2 text-sm outline-none focus:border-[#1a73e8] h-20 resize-none"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingQuestionIdx(null)} className="flex items-center gap-1 text-sm font-medium text-[#137333] hover:underline cursor-pointer">
                            <Save className="w-4 h-4" /> Salvar Edição
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-white relative group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full">{q.skillEvaluated} • {q.estimatedTimeMinutes} min</span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button onClick={() => setEditingQuestionIdx(idx)} className="p-1.5 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#e8f0fe] rounded-full cursor-pointer" title="Editar">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] rounded-full cursor-pointer" title="Remover">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-[#202124]">{q.statement}</p>
                        {q.codeSnippet && (
                          <pre className="mt-3 p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-[4px] text-xs font-mono text-[#202124] overflow-x-auto whitespace-pre-wrap">
                            {q.codeSnippet}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
