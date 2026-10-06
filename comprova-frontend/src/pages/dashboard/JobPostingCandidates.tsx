import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, X, Send, Bot, User, CheckCircle2, XCircle } from 'lucide-react';

const MOCK_CANDIDATES = [
  { id: 1, name: 'Alice Johnson', score: 92, appliedAt: '2026-10-01', status: 'PASSED' },
  { id: 2, name: 'Bob Smith', score: 88, appliedAt: '2026-10-02', status: 'PASSED' },
  { id: 3, name: 'Charlie Davis', score: 45, appliedAt: '2026-10-03', status: 'FAILED' },
  { id: 4, name: 'Diana Prince', score: 95, appliedAt: '2026-10-04', status: 'PENDING_REVIEW' },
];

export function JobPostingCandidates() {
  const { id } = useParams();
  console.log("Viewing candidates for job ID:", id);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Olá! Posso ajudar a filtrar e classificar esses candidatos. O que você procura?' }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    setMessages([...messages, { role: 'user', content: chatMessage }]);
    setChatMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `Filtrei a tabela para mostrar candidatos correspondentes a "${chatMessage}".` 
      }]);
    }, 1000);
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6">
        <Link to="/company/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-[#5f6368] hover:text-[#202124] mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar para Vagas
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-normal text-[#202124]">Engenheiro Backend Java Sênior</h1>
            <p className="text-[#5f6368] text-sm mt-1">4 candidatos inscritos</p>
          </div>
        </div>
      </div>

      {/* Candidates Data Table */}
      <div className="bg-white border border-[#dadce0] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-[#dadce0]">
                <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Candidato</th>
                <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Score de Aderência</th>
                <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Data de Inscrição</th>
                <th className="px-6 py-3 text-xs font-medium text-[#5f6368] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dadce0]">
              {MOCK_CANDIDATES.map(candidate => (
                <tr key={candidate.id} className="hover:bg-[#f8f9fa] transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-[#202124]">{candidate.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-[#f1f3f4] rounded-full h-1.5 max-w-[100px]">
                        <div 
                          className={`h-1.5 rounded-full ${candidate.score >= 80 ? 'bg-[#1a73e8]' : candidate.score >= 50 ? 'bg-[#fbbc04]' : 'bg-[#d93025]'}`}
                          style={{ width: `${candidate.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-[#202124]">{candidate.score}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5f6368]">
                    {candidate.appliedAt}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                      {candidate.status === 'PASSED' && <><CheckCircle2 className="w-4 h-4 text-[#137333]" /> <span className="text-[#137333]">Aprovado</span></>}
                      {candidate.status === 'FAILED' && <><XCircle className="w-4 h-4 text-[#d93025]" /> <span className="text-[#d93025]">Reprovado</span></>}
                      {candidate.status === 'PENDING_REVIEW' && <><span className="w-2 h-2 rounded-full bg-[#fbbc04]" /> <span className="text-[#fbbc04]">Em Análise</span></>}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#1a73e8] text-sm font-medium hover:underline">Ver Perfil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              <button onClick={() => setIsChatOpen(false)} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
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
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-[#1a73e8] hover:bg-[#e8f0fe] disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
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
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
            isChatOpen ? 'bg-[#d93025]' : 'bg-[#1a73e8]'
          }`}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
