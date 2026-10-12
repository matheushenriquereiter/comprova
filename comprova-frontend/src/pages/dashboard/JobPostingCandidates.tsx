import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Bot, 
  X, 
  MessageSquare, 
  Send, 
  Check, 
  Clock, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { JobService, type JobPostingResponseDTO } from '../../services/jobService';

type CandidateFilter = 'ALL' | 'WAITING_DECISION' | 'PASSED' | 'FAILED' | 'PENDING_TEST';

export function JobPostingCandidates() {
  const { id } = useParams<{ id: string }>();
  const [jobPosting, setJobPosting] = useState<JobPostingResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'error' } | null>(null);
  const [activeFilter, setActiveFilter] = useState<CandidateFilter>('ALL');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Olá! Posso ajudar a filtrar e classificar esses candidatos. O que você procura?' }
  ]);

  useEffect(() => {
    const fetchJobPosting = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const data = await JobService.getCompanyJobPostingById(token, Number(id));
        setJobPosting(data);
        setError('');
      } catch (err: unknown) {
        setError((err as Error).message || 'Erro ao carregar candidatos da vaga.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobPosting();
  }, [id]);

  // Limpa o toast de erro após 5 segundos
  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const handleSetStatus = async (applicationId: number, status: 'PASSED' | 'FAILED') => {
    if (!applicationId) {
      setStatusMessage({
        text: 'ID da candidatura não encontrado. Por favor, reinicie a aplicação backend no IntelliJ e recarregue a página.',
        type: 'error'
      });
      return;
    }

    setActionLoading(applicationId);
    setStatusMessage(null);
    try {
      const token = localStorage.getItem('token') || '';
      await JobService.updateApplicationStatus(token, applicationId, status, id ? Number(id) : undefined);
      
      setJobPosting(prev => {
        if (!prev) return null;
        return {
          ...prev,
          candidates: prev.candidates.map(c => 
            c.applicationId === applicationId ? { ...c, status } : c
          )
        };
      });

      // Sem mensagem exibida quando mudar o status, conforme solicitado
    } catch (err: unknown) {
      const msg = (err as Error).message || '';
      const displayMsg = msg.includes('Resource not found')
        ? 'Rota não encontrada no servidor (404). Por favor, reinicie a aplicação backend no IntelliJ para registrar os novos endpoints.'
        : msg || 'Erro ao atualizar status do candidato.';
      setStatusMessage({
        text: displayMsg,
        type: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const userText = chatMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setChatMessage('');
    
    setTimeout(() => {
      const lower = userText.toLowerCase();
      const cList = jobPosting?.candidates || [];
      let reply = '';

      if (lower.includes('aprovad') || lower.includes('pass')) {
        const passed = cList.filter(c => c.status === 'PASSED');
        if (passed.length === 0) {
          reply = 'Nenhum candidato foi aprovado nesta vaga até o momento.';
        } else {
          reply = `Temos ${passed.length} candidato(s) aprovado(s): ${passed.map(c => `${c.username} (${c.score ?? 0}%)`).join(', ')}.`;
        }
      } else if (lower.includes('reprovad') || lower.includes('recusad') || lower.includes('fail')) {
        const failed = cList.filter(c => c.status === 'FAILED');
        if (failed.length === 0) {
          reply = 'Nenhum candidato foi reprovado até o momento.';
        } else {
          reply = `Temos ${failed.length} candidato(s) reprovado(s): ${failed.map(c => `${c.username} (${c.score ?? 0}%)`).join(', ')}.`;
        }
      } else if (lower.includes('aguardando') || lower.includes('pendente decisao') || lower.includes('complet')) {
        const waiting = cList.filter(c => c.status === 'TEST_COMPLETED');
        if (waiting.length === 0) {
          reply = 'Não há candidatos aguardando sua decisão no momento.';
        } else {
          reply = `Há ${waiting.length} candidato(s) que concluíram o teste e aguardam sua decisão: ${waiting.map(c => `${c.username} (${c.score ?? 0}%)`).join(', ')}.`;
        }
      } else if (lower.includes('melhor') || lower.includes('maior nota') || lower.includes('top')) {
        const scored = cList.filter(c => c.score !== undefined && c.score !== null);
        if (scored.length === 0) {
          reply = 'Ainda não há testes técnicos avaliados para esta vaga.';
        } else {
          const top = scored.reduce((max, c) => ((c.score ?? 0) > (max.score ?? 0) ? c : max), scored[0]);
          reply = `A maior pontuação registrada é de ${top.username} com ${top.score}% na avaliação técnica por IA.`;
        }
      } else if (lower.includes('quantos') || lower.includes('total') || lower.includes('inscrito')) {
        reply = `Esta vaga possui atualmente ${cList.length} candidato(s) inscrito(s).`;
      } else {
        reply = `Analisei os ${cList.length} candidato(s) da vaga "${jobPosting?.title}". Você pode me perguntar sobre os melhores desempenhos, quem foi aprovado, reprovado ou estatísticas das notas.`;
      }

      setMessages(prev => [...prev, { role: 'ai', content: reply }]);
    }, 400);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-[#5f6368]">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#1a73e8]" />
        Carregando candidatos...
      </div>
    );
  }

  if (error || !jobPosting) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="p-4 bg-[#fce8e6] text-[#c5221f] rounded-[8px] text-sm border border-[#fad2cf] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error || 'Vaga não encontrada.'}
        </div>
      </div>
    );
  }

  const candidates = jobPosting.candidates || [];

  const waitingCount = candidates.filter(c => c.status === 'TEST_COMPLETED').length;
  const passedCount = candidates.filter(c => c.status === 'PASSED').length;
  const failedCount = candidates.filter(c => c.status === 'FAILED').length;
  const pendingTestCount = candidates.filter(c => c.status === 'PENDING_TEST' || c.status === 'EVALUATING').length;

  const filteredCandidates = candidates.filter(c => {
    if (activeFilter === 'WAITING_DECISION') return c.status === 'TEST_COMPLETED';
    if (activeFilter === 'PASSED') return c.status === 'PASSED';
    if (activeFilter === 'FAILED') return c.status === 'FAILED';
    if (activeFilter === 'PENDING_TEST') return c.status === 'PENDING_TEST' || c.status === 'EVALUATING';
    return true;
  });

  return (
    <div className="relative min-h-[calc(100vh-8rem)] pb-12">
      {/* Header */}
      <div className="mb-6">
        <Link to="/company/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-[#5f6368] hover:text-[#202124] mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar para Vagas
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-normal text-[#202124]">{jobPosting.title}</h1>
            <p className="text-[#5f6368] text-sm mt-1">{candidates.length} candidato(s) inscrito(s)</p>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {statusMessage && (
        <div className="mb-4 p-3.5 rounded-[8px] text-sm flex items-center gap-2.5 transition-all shadow-xs bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#c5221f]" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Filter Tabs / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeFilter === 'ALL'
              ? 'bg-[#1a73e8] text-white shadow-xs'
              : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] hover:text-[#202124]'
          }`}
        >
          Todos ({candidates.length})
        </button>

        <button
          onClick={() => setActiveFilter('WAITING_DECISION')}
          className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeFilter === 'WAITING_DECISION'
              ? 'bg-[#1a73e8] text-white shadow-xs'
              : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] hover:text-[#202124]'
          }`}
        >
          Aguardando decisão ({waitingCount})
          {waitingCount > 0 && activeFilter !== 'WAITING_DECISION' && (
            <span className="w-2 h-2 rounded-full bg-[#f2994a]" />
          )}
        </button>

        <button
          onClick={() => setActiveFilter('PASSED')}
          className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeFilter === 'PASSED'
              ? 'bg-[#137333] text-white shadow-xs'
              : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] hover:text-[#202124]'
          }`}
        >
          Aprovados ({passedCount})
        </button>

        <button
          onClick={() => setActiveFilter('FAILED')}
          className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeFilter === 'FAILED'
              ? 'bg-[#c5221f] text-white shadow-xs'
              : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] hover:text-[#202124]'
          }`}
        >
          Reprovados ({failedCount})
        </button>

        <button
          onClick={() => setActiveFilter('PENDING_TEST')}
          className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeFilter === 'PENDING_TEST'
              ? 'bg-[#5f6368] text-white shadow-xs'
              : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] hover:text-[#202124]'
          }`}
        >
          Teste Pendente ({pendingTestCount})
        </button>
      </div>

      {/* Candidates Data Table */}
      <div className="bg-white border border-[#dadce0] rounded-[8px] overflow-hidden shadow-xs">
        {candidates.length === 0 ? (
          <div className="px-6 py-20 text-center bg-white">
            <h3 className="text-lg font-medium text-[#202124] mb-2">Nenhum candidato ainda</h3>
            <p className="text-sm text-[#5f6368]">Assim que candidatos se inscreverem, eles aparecerão aqui.</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="px-6 py-16 text-center bg-white">
            <h3 className="text-base font-medium text-[#202124] mb-1">Nenhum candidato encontrado neste filtro</h3>
            <p className="text-xs text-[#5f6368]">Selecione outro filtro para visualizar os candidatos da vaga.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#dadce0]">
                  <th className="px-6 py-3.5 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Candidato</th>
                  <th className="px-6 py-3.5 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Score IA</th>
                  <th className="px-6 py-3.5 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Status Atual</th>
                  <th className="px-6 py-3.5 text-right text-xs font-medium text-[#5f6368] uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dadce0]">
                {filteredCandidates.map((candidate, idx) => {
                  const hasCompletedTest = 
                    candidate.status === 'TEST_COMPLETED' || 
                    candidate.status === 'PASSED' || 
                    candidate.status === 'FAILED';
                  const isOperating = actionLoading === candidate.applicationId;

                  return (
                    <tr key={candidate.applicationId ?? idx} className="hover:bg-[#f8f9fa] transition-colors">
                      {/* Candidate info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold text-xs shrink-0">
                            {candidate.username ? candidate.username.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-[#202124] truncate">{candidate.username}</span>
                            <span className="text-xs text-[#5f6368] truncate">{candidate.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* AI Score */}
                      <td className="px-6 py-4">
                        {candidate.score !== undefined && candidate.score !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-[#f1f3f4] rounded-full h-1.5 max-w-[100px]">
                              <div 
                                className={`h-1.5 rounded-full ${candidate.score >= 60 ? 'bg-[#137333]' : 'bg-[#c5221f]'}`}
                                style={{ width: `${candidate.score}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-[#202124]">{candidate.score}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#5f6368] italic">Não avaliado</span>
                        )}
                      </td>

                      {/* Status badge: Aprovado, Reprovado ou Aguardando decisão */}
                      <td className="px-6 py-4">
                        {candidate.status === 'PASSED' && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#e6f4ea] text-[#137333] px-2.5 py-1 rounded-full border border-[#ceead6]">
                            <Check className="w-3.5 h-3.5" /> Aprovado
                          </span>
                        )}
                        {candidate.status === 'FAILED' && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#fce8e6] text-[#c5221f] px-2.5 py-1 rounded-full border border-[#fad2cf]">
                            <X className="w-3.5 h-3.5" /> Reprovado
                          </span>
                        )}
                        {candidate.status === 'TEST_COMPLETED' && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#fef7e0] text-[#b06000] px-2.5 py-1 rounded-full border border-[#fce8b2]">
                            <Clock className="w-3.5 h-3.5" /> Aguardando decisão
                          </span>
                        )}
                        {candidate.status === 'EVALUATING' && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#e8f0fe] text-[#1a73e8] px-2.5 py-1 rounded-full border border-[#d2e3fc]">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Em Avaliação IA
                          </span>
                        )}
                        {candidate.status === 'PENDING_TEST' && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#f1f3f4] text-[#5f6368] px-2.5 py-1 rounded-full border border-[#dadce0]">
                            Teste Pendente
                          </span>
                        )}
                        {!candidate.status && (
                          <span className="text-xs text-[#5f6368]">Inscrito</span>
                        )}
                      </td>

                      {/* Actions: Approve / Reject */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          {hasCompletedTest ? (
                            <div className="flex items-center gap-1.5">
                              {/* Aprovar Button */}
                              <button
                                type="button"
                                onClick={() => handleSetStatus(candidate.applicationId, 'PASSED')}
                                disabled={isOperating || candidate.status === 'PASSED'}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                                  candidate.status === 'PASSED'
                                    ? 'bg-[#137333] text-white shadow-xs cursor-default'
                                    : 'bg-white hover:bg-[#e6f4ea] text-[#137333] border border-[#ceead6] hover:border-[#137333]'
                                } disabled:opacity-70`}
                                title={candidate.status === 'PASSED' ? 'Candidato já está aprovado' : 'Aprovar candidato no processo'}
                              >
                                {isOperating && candidate.status !== 'PASSED' ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                Aprovar
                              </button>

                              {/* Reprovar Button */}
                              <button
                                type="button"
                                onClick={() => handleSetStatus(candidate.applicationId, 'FAILED')}
                                disabled={isOperating || candidate.status === 'FAILED'}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                                  candidate.status === 'FAILED'
                                    ? 'bg-[#c5221f] text-white shadow-xs cursor-default'
                                    : 'bg-white hover:bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] hover:border-[#c5221f]'
                                } disabled:opacity-70`}
                                title={candidate.status === 'FAILED' ? 'Candidato já está reprovado' : 'Reprovar candidato no processo'}
                              >
                                {isOperating && candidate.status !== 'FAILED' ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <X className="w-3.5 h-3.5" />
                                )}
                                Reprovar
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-[#80868b] italic">
                              Aguardando teste
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating AI Chat Assistant */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Chat Window */}
        {isChatOpen && (
          <div className="bg-white border border-[#dadce0] rounded-[8px] shadow-lg w-[360px] h-[480px] mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
            {/* Header */}
            <div className="bg-[#1a73e8] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-medium text-sm">Assistente ComProva</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-[#f8f9fa] flex flex-col gap-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#1a73e8] text-white rounded-br-sm' 
                      : 'bg-white border border-[#dadce0] text-[#202124] rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Input Area */}
            <div className="border-t border-[#dadce0] p-3 bg-white">
              <form onSubmit={handleSendMessage} className="relative">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ex: quem foi aprovado? quem tirou a maior nota?" 
                  className="w-full bg-[#f1f3f4] border border-transparent rounded-full pl-4 pr-10 py-2.5 text-sm text-[#202124] outline-none focus:bg-white focus:border-[#1a73e8]"
                />
                <button 
                  type="submit"
                  disabled={!chatMessage.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-[#1a73e8] hover:bg-[#e8f0fe] disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
        
        {/* FAB */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
            isChatOpen ? 'bg-[#d93025]' : 'bg-[#1a73e8]'
          }`}
          title="Assistente de Triagem com IA"
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
