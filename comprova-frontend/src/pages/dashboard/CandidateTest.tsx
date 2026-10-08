import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Code, FileText, CheckCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { type QuestionDTO } from '../../services/jobService';

export function CandidateTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  
  // Minimal state to hold answers per question index
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const fetchQuestions = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`/api/candidate/applications/${id}/test`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao carregar as questões da prova');
      }
      const data = await response.json();
      setQuestions(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar prova.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (idx: number, value: string) => {
    setAnswers(prev => ({ ...prev, [idx]: value }));
  };

  const handleSubmitTest = async () => {
    if (!id) return;
    
    // Check if all questions have answers
    if (Object.keys(answers).length < questions.length) {
      if (!window.confirm("Você deixou algumas questões em branco. Tem certeza que deseja enviar?")) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`/api/candidate/applications/${id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers }) // sending dummy structure, backend just updates status
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar a prova');
      }
      
      const responseData = await response.json();
      setScore(responseData.score);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar a prova.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-[#5f6368]">
        Carregando prova...
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-[#e8f0fe] rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin"></div>
          <Code className="w-6 h-6 text-[#1a73e8]" />
        </div>
        <h2 className="text-2xl font-medium text-[#202124] mb-2">Avaliando suas respostas...</h2>
        <p className="text-[#5f6368] mb-8">
          A Inteligência Artificial da ComProva está corrigindo o seu teste em tempo real de forma imparcial. Isso pode levar de 10 a 20 segundos. Não feche a página.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-[#e6f4ea] rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-[#137333]" />
        </div>
        <h2 className="text-2xl font-medium text-[#202124] mb-2">Prova enviada e avaliada!</h2>
        
        {score !== null && (
          <div className="my-6 p-6 bg-[#f8f9fa] border border-[#dadce0] rounded-xl w-full">
            <h3 className="text-sm font-medium text-[#5f6368] uppercase tracking-wider mb-2">Seu Score da Inteligência Artificial</h3>
            <div className="text-5xl font-bold text-[#1a73e8]">{score}%</div>
          </div>
        )}

        <p className="text-[#5f6368] mb-8">
          A inteligência artificial da ComProva analisou suas respostas em tempo real. O RH da empresa já foi notificado.
        </p>
        <button
          onClick={() => navigate('/candidate/dashboard')}
          className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium rounded-full transition-colors cursor-pointer"
        >
          Voltar ao Painel
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-8rem)] space-y-6">
      <div className="mb-6">
        <Link to="/candidate/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-[#5f6368] hover:text-[#202124] mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-[#202124]">Avaliação Técnica</h1>
            <p className="text-[#5f6368] text-sm mt-1">Responda as questões abaixo. Não se preocupe em criar uma solução perfeita se o tempo acabar.</p>
          </div>
          
          {/* Global timer pseudo-component */}
          <div className="bg-[#fff8e1] px-4 py-2 rounded-[8px] flex items-center gap-2 border border-[#fce8e6] text-[#fbbc04] font-medium">
            <Clock className="w-4 h-4" /> Em andamento
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#fce8e6] text-[#c5221f] rounded-[8px] text-sm border border-[#fad2cf]">
          {error}
        </div>
      )}

      {questions.map((q, idx) => (
        <div key={idx} className="bg-white border border-[#dadce0] rounded-[8px] overflow-hidden">
          <div className="bg-[#f8f9fa] border-b border-[#dadce0] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-medium text-sm">
                {idx + 1}
              </span>
              <span className="font-medium text-[#202124] flex items-center gap-2">
                {q.type === 'PRACTICAL' ? <Code className="w-4 h-4 text-[#1a73e8]" /> : <FileText className="w-4 h-4 text-[#fbbc04]" />}
                Questão {q.type === 'PRACTICAL' ? 'Prática' : 'Teórica'} ({q.skillEvaluated})
              </span>
            </div>
            {q.estimatedTimeMinutes && (
              <span className="text-xs text-[#5f6368] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ~{q.estimatedTimeMinutes} min
              </span>
            )}
          </div>
          <div className="p-6">
            <div className="prose prose-sm max-w-none text-[#202124] mb-6">
              <p className="whitespace-pre-wrap">{q.statement}</p>
            </div>
            
            {q.codeSnippet && (
              <div className="mb-6 bg-[#202124] text-[#f8f9fa] p-4 rounded-[4px] font-mono text-sm overflow-x-auto">
                <pre>{q.codeSnippet}</pre>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">Sua resposta:</label>
              <textarea
                className="w-full h-40 p-4 bg-white border border-[#dadce0] rounded-[4px] text-sm text-[#202124] font-mono outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] resize-y"
                placeholder={q.type === 'PRACTICAL' ? "Escreva seu código aqui..." : "Escreva sua resposta conceitual aqui..."}
                value={answers[idx] || ''}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
      
      <div className="flex justify-end pt-4 pb-12">
        <button
          onClick={handleSubmitTest}
          disabled={submitting}
          className="px-8 py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium rounded-full shadow-md transition-colors disabled:opacity-70 flex items-center gap-2 cursor-pointer"
        >
          {submitting ? 'Enviando prova...' : 'Finalizar e Enviar Prova'}
        </button>
      </div>
    </div>
  );
}
