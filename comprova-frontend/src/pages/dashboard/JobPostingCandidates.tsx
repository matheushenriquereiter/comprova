import { useState, useEffect } from 'react';
import { ArrowLeft, Bot, X, MessageSquare, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { JobService, type JobPostingResponseDTO } from '../../services/jobService';

export function JobPostingCandidates() {
  const { id } = useParams<{ id: string }>();
  const [jobPosting, setJobPosting] = useState<JobPostingResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError((err as Error).message || 'Erro ao carregar candidatos.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobPosting();
  }, [id]);


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    setMessages([...messages, { role: 'user', content: chatMessage }]);
    setChatMessage('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `Ainda não tenho acesso real ao backend de IA para filtrar candidatos, mas logo serei integrado!` 
      }]);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-[#5f6368]">
        Carregando candidatos...
      </div>
    );
  }

  if (error || !jobPosting) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="p-4 bg-[#fce8e6] text-[#c5221f] rounded-[8px] text-sm border border-[#fad2cf]">
          {error || 'Vaga não encontrada.'}
        </div>
      </div>
    );
  }

  const candidates = jobPosting.candidates || [];

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6">
        <Link to="/company/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-[#5f6368] hover:text-[#202124] mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar para Vagas
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-normal text-[#202124]">{jobPosting.title}</h1>
            <p className="text-[#5f6368] text-sm mt-1">{candidates.length} candidato(s) inscrito(s)</p>
          </div>
        </div>
      </div>

      {/* Candidates Data Table */}
      <div className="bg-white border border-[#dadce0] rounded-[8px] overflow-hidden">
        {candidates.length === 0 ? (
          <div className="px-6 py-20 text-center bg-white">
            <h3 className="text-lg font-medium text-[#202124] mb-2">Nenhum candidato ainda</h3>
            <p className="text-sm text-[#5f6368]">Assim que candidatos se inscreverem, eles aparecerão aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#dadce0]">
                  <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Candidato</th>
                  <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Score IA</th>
                  <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dadce0]">
                {candidates.map((candidate, idx) => (
                  <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold">
                          {candidate.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[#202124]">{candidate.username}</span>
                          <span className="text-xs text-[#5f6368]">{candidate.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {candidate.score !== undefined && candidate.score !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-[#f1f3f4] rounded-full h-1.5 max-w-[100px]">
                            <div 
                              className={`h-1.5 rounded-full ${candidate.score >= 80 ? 'bg-[#1a73e8]' : candidate.score >= 50 ? 'bg-[#fbbc04]' : 'bg-[#d93025]'}`}
                              style={{ width: `${candidate.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-[#202124]">{candidate.score}%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-[#5f6368]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {candidate.status === 'PASSED' && <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#137333]"><span className="w-2 h-2 rounded-full bg-[#137333]" /> Aprovado</span>}
                      {candidate.status === 'FAILED' && <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#c5221f]"><span className="w-2 h-2 rounded-full bg-[#c5221f]" /> Reprovado</span>}
                      {candidate.status === 'EVALUATING' && <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#e8f0fe] text-[#1a73e8] px-2 py-1 rounded-full border border-[#d2e3fc]">Avaliação Concluída</span>}
                      {candidate.status === 'PENDING_TEST' && <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#fbbc04] bg-opacity-20 text-[#d28a02] px-2 py-1 rounded-full border border-[#fbbc04]">Aguardando Teste</span>}
                      {!candidate.status && <span className="text-xs text-[#5f6368]">Inscrito</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#1a73e8] text-sm font-medium hover:underline cursor-pointer">Ver Perfil</button>
                    </td>
                  </tr>
                ))}
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
                  placeholder="Peça para a IA filtrar candidatos..." 
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
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
