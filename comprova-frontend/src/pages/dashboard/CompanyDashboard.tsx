import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { Plus, Search, MoreVertical, Users, Wand2, Briefcase, Calendar } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';

// Mock Data
const MOCK_POSTINGS = [
  { id: 1, title: 'Engenheiro Backend Java Sênior', status: 'ACTIVE', expiresAt: '2026-11-01', candidates: 42, workplace: 'REMOTE' },
  { id: 2, title: 'Desenvolvedor Frontend React', status: 'ACTIVE', expiresAt: '2026-10-15', candidates: 18, workplace: 'HYBRID' },
  { id: 3, title: 'Especialista DevOps (AWS)', status: 'DRAFT', expiresAt: '-', candidates: 0, workplace: 'ONSITE' },
];

const STATUS_MAP: Record<string, string> = { ACTIVE: 'Ativa', DRAFT: 'Rascunho', CLOSED: 'Encerrada' };
const WORKPLACE_MAP: Record<string, string> = { REMOTE: 'Remoto', HYBRID: 'Híbrido', ONSITE: 'Presencial' };

export function CompanyDashboard() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'requirements' | 'ai'>('details');

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-normal text-[#202124]">Vagas</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368] w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar vagas..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#dadce0] rounded-[4px] text-sm focus:border-[#1a73e8] outline-none"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1a73e8] text-white px-4 py-2 rounded-[4px] text-sm font-medium hover:bg-[#1b66c9] transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Vaga
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-[#dadce0] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-[#dadce0]">
                <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Candidatos</th>
                <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Expira em</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dadce0]">
              {MOCK_POSTINGS.map(job => (
                <tr key={job.id} onClick={() => navigate(`/company/dashboard/postings/${job.id}/candidates`)} className="hover:bg-[#f8f9fa] transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[#202124]">{job.title}</div>
                    <div className="text-xs text-[#5f6368] flex items-center gap-1 mt-1">
                      <Briefcase className="w-3 h-3" /> {WORKPLACE_MAP[job.workplace] || job.workplace}
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
                      {job.candidates > 0 ? (
                        <span className="font-medium">{job.candidates} inscritos</span>
                      ) : (
                        <span className="text-[#5f6368]">Nenhuma inscrição ainda</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5f6368]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {job.expiresAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#5f6368] p-1.5 hover:bg-[#e8eaed] rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Criar Nova Vaga"
        maxWidth="max-w-3xl"
        footer={
          <>
            <AuthButton variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</AuthButton>
            <AuthButton variant="primary">Publicar Vaga</AuthButton>
          </>
        }
      >
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
            <AuthInput label="Título da Vaga" name="title" placeholder="ex. Engenheiro Frontend Sênior" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#5f6368] text-xs font-medium">Modalidade</label>
                <select className="w-full bg-transparent border border-[#dadce0] rounded-[4px] px-3.5 py-3 text-[#202124] text-sm outline-none focus:border-[#1a73e8] cursor-pointer">
                  <option value="REMOTE">Remoto</option>
                  <option value="HYBRID">Híbrido</option>
                  <option value="ONSITE">Presencial</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#5f6368] text-xs font-medium">Tipo de Contrato</label>
                <select className="w-full bg-transparent border border-[#dadce0] rounded-[4px] px-3.5 py-3 text-[#202124] text-sm outline-none focus:border-[#1a73e8] cursor-pointer">
                  <option value="FULL_TIME">Tempo Integral</option>
                  <option value="CONTRACTOR">PJ / Contratado</option>
                </select>
              </div>
            </div>
            
            <AuthInput label="Localização" name="location" placeholder="ex. São Paulo, Brasil" />
            <AuthInput label="Data de Expiração" name="expiresAt" type="date" />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[#5f6368] text-xs font-medium">Descrição da Vaga</label>
              <textarea 
                className="w-full bg-transparent border border-[#dadce0] rounded-[4px] px-3.5 py-3 text-[#202124] text-sm outline-none focus:border-[#1a73e8] h-32 resize-none"
                placeholder="Descreva a vaga e responsabilidades..."
              ></textarea>
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="space-y-5 animate-in fade-in duration-200 min-h-[300px]">
            <h3 className="text-sm font-medium text-[#202124]">Habilidades Necessárias</h3>
            <p className="text-sm text-[#5f6368]">Adicione as habilidades necessárias. Elas serão usadas para gerar o teste técnico por IA.</p>
            
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <AuthInput label="Habilidade" name="skillName" placeholder="ex. Java, React, SQL" />
              </div>
              <div className="w-32">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#5f6368] text-xs font-medium">Nível</label>
                  <select className="w-full bg-transparent border border-[#dadce0] rounded-[4px] px-3.5 py-3 text-[#202124] text-sm outline-none focus:border-[#1a73e8] cursor-pointer">
                    <option value="JUNIOR">Júnior</option>
                    <option value="MID_LEVEL">Pleno</option>
                    <option value="SENIOR">Sênior</option>
                  </select>
                </div>
              </div>
              <div>
                <AuthButton variant="secondary" className="h-[46px] px-6">Adicionar</AuthButton>
              </div>
            </div>
            
            <div className="mt-4 border border-[#dadce0] rounded-[4px] p-4 bg-[#f8f9fa] flex items-center justify-center text-sm text-[#5f6368] min-h-[100px]">
              Nenhuma habilidade adicionada.
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-5 animate-in fade-in duration-200 min-h-[300px]">
            <div className="flex items-start gap-4 p-4 bg-[#e8f0fe] rounded-[8px]">
              <div className="p-2 bg-white rounded-full text-[#1a73e8]">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#1a73e8] mb-1">Teste Gerado por IA</h3>
                <p className="text-sm text-[#202124]">
                  A IA do ComProva criará questões técnicas baseadas nas habilidades e descrição fornecidas. Os candidatos farão este teste durante a inscrição.
                </p>
                <button className="mt-3 text-sm font-medium text-[#1a73e8] hover:underline cursor-pointer">
                  Gerar Perguntas de Teste
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
