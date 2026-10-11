import { JobService } from "../../services/jobService";
import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Code, FileText, CheckCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { type CandidateQuestionDTO } from '../../services/jobService';
import { getErrorMessage } from '../../utils/apiErrors';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function CandidateTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<CandidateQuestionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  
  // Respostas por id da questão: { idDaQuestao: texto }
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const data = await JobService.getCandidateTestQuestions(token, Number(id));
        setQuestions(data);
        setError('');
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Erro ao carregar a prova.'));
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id]);


  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitTest = async () => {
    if (!id) return;
    
    // Check if all questions have answers
    const answeredCount = questions.filter(q => answers[q.id]?.trim()).length;
    if (answeredCount < questions.length) {
      if (!window.confirm("Você deixou algumas questões em branco. Tem certeza que deseja enviar?")) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      // Envia uma resposta para cada questão (em branco se não respondida), pelo id da questão
      const allAnswers: Record<number, string> = {};
      questions.forEach(q => {
        allAnswers[q.id] = answers[q.id] ? answers[q.id].trim() : '';
      });
      const responseData = await JobService.submitCandidateTest(token, Number(id), allAnswers);
      setScore(responseData.score);
      setSuccess(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao enviar a prova.'));
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
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col pt-6 pb-2">
      <div className="mb-4 shrink-0">
        <Link to="/candidate/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-[#5f6368] hover:text-[#202124] mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-[#202124]">Avaliação Técnica</h1>
            <p className="text-[#5f6368] text-sm mt-1">Responda as questões abaixo. Não se preocupe em criar uma solução perfeita se o tempo acabar.</p>
          </div>
          
          <div className="bg-[#fff8e1] px-4 py-2 rounded-[8px] flex items-center gap-2 border border-[#fce8e6] text-[#fbbc04] font-medium">
            <Clock className="w-4 h-4" /> Em andamento
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#fce8e6] text-[#c5221f] rounded-[8px] text-sm border border-[#fad2cf] shrink-0 mb-4">
          {error}
        </div>
      )}

      {questions.length > 0 && (
        <>
          <div className="flex-1 min-h-0 bg-white border border-[#dadce0] rounded-[8px] overflow-hidden flex flex-col">
            <div className="shrink-0 bg-[#f8f9fa] border-b border-[#dadce0] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-auto px-3 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-medium text-sm">
                  {currentQuestionIndex + 1} de {questions.length}
                </span>
                <span className="font-medium text-[#202124] flex items-center gap-2">
                  {questions[currentQuestionIndex].type === 'PRACTICAL' ? <Code className="w-4 h-4 text-[#1a73e8]" /> : <FileText className="w-4 h-4 text-[#fbbc04]" />}
                  Questão {questions[currentQuestionIndex].type === 'PRACTICAL' ? 'Prática' : 'Teórica'} ({questions[currentQuestionIndex].skillEvaluated})
                </span>
              </div>
              {!!questions[currentQuestionIndex].estimatedTimeMinutes && (
                <span className="text-xs text-[#5f6368] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> ~{questions[currentQuestionIndex].estimatedTimeMinutes} min
                </span>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col">
              <div className="prose prose-sm max-w-none text-[#202124] mb-4 shrink-0">
                <p className="whitespace-pre-wrap">{questions[currentQuestionIndex].statement}</p>
              </div>
              
              {questions[currentQuestionIndex].codeSnippet && (
                <div className="mb-4 shrink-0 rounded-[4px] overflow-hidden border border-[#dadce0] text-sm bg-[#1e1e1e]">
                  <SyntaxHighlighter 
                    language="javascript" 
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                  >
                    {questions[currentQuestionIndex].codeSnippet}
                  </SyntaxHighlighter>
                </div>
              )}
              
              <div className="flex-1 flex flex-col min-h-[150px]">
                <label className="block text-sm font-medium text-[#202124] mb-2 shrink-0">Sua resposta:</label>
                <textarea
                  className="w-full flex-1 p-4 bg-white border border-[#dadce0] rounded-[4px] text-sm text-[#202124] font-mono outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] resize-none"
                  placeholder={questions[currentQuestionIndex].type === 'PRACTICAL' ? "Escreva seu código aqui..." : "Escreva sua resposta conceitual aqui..."}
                  value={answers[questions[currentQuestionIndex].id] || ''}
                  onChange={(e) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="shrink-0 flex justify-between pt-4">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2.5 border border-[#dadce0] bg-white hover:bg-[#f8f9fa] text-[#202124] font-medium rounded-full shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              Anterior
            </button>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-6 py-2.5 bg-[#f8f9fa] border border-[#dadce0] hover:bg-[#e8eaed] text-[#202124] font-medium rounded-full shadow-sm transition-colors cursor-pointer"
              >
                Próxima
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                disabled={submitting}
                className="px-8 py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium rounded-full shadow-md transition-colors disabled:opacity-70 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? 'Enviando prova...' : 'Finalizar e Enviar Prova'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
