import { JobService } from "../../services/jobService";
import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Code, FileText, CheckCircle, AlertTriangle, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import { type CandidateQuestionDTO } from '../../services/jobService';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Modal } from '../../components/ui/Modal';

export function CandidateTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<CandidateQuestionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  // Minimal state to hold answers per question index
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Detecta apenas na inicialização (montagem/reload) se esta prova já foi submetida antes
  const [wasAlreadySubmittedOnMount] = useState(() => {
    if (!id) return false;
    const val = localStorage.getItem(`submitted_test_${id}`) || sessionStorage.getItem(`submitted_test_${id}`);
    if (!val) return false;
    const ts = Number(val);
    if (!isNaN(ts) && ts > 0) {
      if (Date.now() - ts > 15 * 60 * 1000) {
        localStorage.removeItem(`submitted_test_${id}`);
        sessionStorage.removeItem(`submitted_test_${id}`);
        return false;
      }
    }
    return true;
  });

  useEffect(() => {
    if (wasAlreadySubmittedOnMount) {
      navigate('/candidate/dashboard', { replace: true });
      return;
    }

    const fetchQuestions = async () => {
      if (!id) {
        navigate('/candidate/dashboard', { replace: true });
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token') || '';

        // 1. Valida o status real da candidatura do candidato antes de carregar a prova
        const appsRes = await JobService.getCandidateApplications(token, 0, 100);
        const myApp = appsRes.content?.find(a => a.applicationId === Number(id));
        if (myApp && myApp.status !== 'PENDING_TEST') {
          const nowStr = Date.now().toString();
          localStorage.setItem(`submitted_test_${id}`, nowStr);
          sessionStorage.setItem(`submitted_test_${id}`, nowStr);
          navigate('/candidate/dashboard', { replace: true });
          return;
        }

        // 2. Busca as questões da prova (que também é bloqueada pelo backend caso não seja PENDING_TEST)
        const data = await JobService.getCandidateTestQuestions(token, Number(id));
        setQuestions(data);
        setError('');
      } catch {
        // Se a prova já foi enviada, está em correção ou não pode ser acessada, marca e redireciona ao painel
        if (id) {
          const nowStr = Date.now().toString();
          localStorage.setItem(`submitted_test_${id}`, nowStr);
          sessionStorage.setItem(`submitted_test_${id}`, nowStr);
        }
        navigate('/candidate/dashboard', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id, navigate, wasAlreadySubmittedOnMount]);

  const handleAnswerChange = (idx: number, value: string) => {
    setAnswers(prev => ({ ...prev, [idx]: value }));
  };

  const handleOpenConfirmModal = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!id) return;
    setIsConfirmModalOpen(false);
    setSubmitting(true);
    // Grava as flags locais para que qualquer recarregamento futuro leve ao dashboard
    const nowStr = Date.now().toString();
    localStorage.setItem(`submitted_test_${id}`, nowStr);
    sessionStorage.setItem(`submitted_test_${id}`, nowStr);
    try {
      const token = localStorage.getItem('token') || '';
      const allAnswers: Record<number, string> = {};
      questions.forEach((_, idx) => {
        allAnswers[idx] = answers[idx] ? answers[idx].trim() : '';
      });
      const responseData = await JobService.submitCandidateTest(token, Number(id), allAnswers);
      setScore(responseData.score);
      setSuccess(true);
    } catch {
      // Se a requisição for abortada (por exemplo ao recarregar a página),
      // as flags já estão salvas e o recarregamento levará para o dashboard
    } finally {
      setSubmitting(false);
    }
  };

  // Se a página for carregada ou recarregada e já tiver sido enviada previamente, vai pro dashboard
  if (wasAlreadySubmittedOnMount) {
    return <Navigate to="/candidate/dashboard" replace />;
  }

  // Durante a correção ativa pela IA, exibe a tela de carregamento normalmente
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
        <div className="w-16 h-16 bg-[#e8f0fe] text-[#1a73e8] rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-medium text-[#202124] mb-2">Prova enviada com sucesso!</h2>
        
        {score !== null && (
          <div className="my-6 p-6 bg-[#f8f9fa] border border-[#dadce0] rounded-xl w-full">
            <h3 className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider mb-2">Nota Técnica Consolidada por IA</h3>
            <div className="text-5xl font-bold text-[#1a73e8]">{score}%</div>
            <div className="mt-3 text-xs font-medium">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8]">
                Aguardando decisão
              </span>
            </div>
          </div>
        )}

        <p className="text-[#5f6368] text-sm mb-8 leading-relaxed">
          Suas respostas foram avaliadas de forma imparcial por IA e encaminhadas para a análise do recrutador.
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-[#5f6368]">
        Carregando prova...
      </div>
    );
  }

  const totalQuestions = questions.length;
  const answeredCount = questions.filter((_, idx) => (answers[idx]?.trim().length || 0) > 0).length;
  const unansweredCount = totalQuestions - answeredCount;
  const hasUnanswered = unansweredCount > 0;

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
              {questions[currentQuestionIndex].estimatedTimeMinutes && (
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
              
              
              <div className="flex-1 flex flex-col min-h-[160px]">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <label className="text-sm font-medium text-[#202124]">Sua resposta:</label>
                  <span className="text-xs text-[#80868b]">
                    {answers[currentQuestionIndex]?.trim().length || 0} caracteres
                  </span>
                </div>
                <textarea
                  className="w-full flex-1 p-4 bg-white border border-[#dadce0] rounded-[6px] text-sm text-[#202124] font-mono outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] resize-none"
                  placeholder={questions[currentQuestionIndex].type === 'PRACTICAL' ? "Escreva seu código aqui. Trate casos de borda e mantenha boa estrutura..." : "Escreva sua resposta conceitual aqui. Seja claro, objetivo e cite exemplos se aplicável..."}
                  value={answers[currentQuestionIndex] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
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
                onClick={handleOpenConfirmModal}
                disabled={submitting}
                className="px-8 py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium rounded-full shadow-md transition-colors disabled:opacity-70 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? 'Enviando prova...' : 'Finalizar e Enviar Prova'}
              </button>
            )}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirmar Envio da Avaliação"
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-5 py-2 text-sm font-medium text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition-colors cursor-pointer"
            >
              Voltar e revisar
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-full shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {hasUnanswered ? 'Enviar mesmo assim' : 'Confirmar e Enviar'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Status Alert Banner */}
          {hasUnanswered ? (
            <div className="p-4 bg-[#fef7e0] border border-[#fce8b2] rounded-[8px] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#b06000] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#202124]">
                  {unansweredCount} {unansweredCount === 1 ? 'questão não foi respondida' : 'questões não foram respondidas'}
                </h4>
                <p className="text-xs text-[#5f6368] mt-1 leading-relaxed">
                  Você respondeu {answeredCount} de {totalQuestions} questões. Respostas deixadas em branco receberão nota zero na correção automatizada por IA.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#e6f4ea] border border-[#ceead6] rounded-[8px] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#137333] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#202124]">
                  Todas as {totalQuestions} questões foram respondidas!
                </h4>
                <p className="text-xs text-[#5f6368] mt-1 leading-relaxed">
                  Excelente! Todas as questões têm respostas preenchidas e estão prontas para a avaliação da IA.
                </p>
              </div>
            </div>
          )}

          {/* Questions Quick Review */}
          <div>
            <div className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider mb-2">
              Resumo das questões
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const charCount = answers[idx]?.trim().length || 0;
                const isAnswered = charCount > 0;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setIsConfirmModalOpen(false);
                    }}
                    className="p-2.5 rounded-[6px] border border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#f8f9fa] flex items-center justify-between cursor-pointer transition-all group"
                    title="Clique para ir até esta questão"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                        isAnswered ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fef7e0] text-[#b06000]'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#202124] truncate flex items-center gap-1.5">
                          <span>Questão {idx + 1} • {q.skillEvaluated}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f1f3f4] text-[#5f6368]">
                            {q.type === 'PRACTICAL' ? 'Prática' : 'Teórica'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#5f6368]">
                          {isAnswered ? `${charCount} caracteres digitados` : 'Não respondida'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                        isAnswered ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fef7e0] text-[#b06000]'
                      }`}>
                        {isAnswered ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Preenchida
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            Em branco
                          </>
                        )}
                      </span>
                      <span className="text-xs text-[#1a73e8] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Ir &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Notice */}
          <div className="p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-[6px] text-xs text-[#5f6368] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#1a73e8] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#202124]">Importante:</strong> Esta ação é definitiva e não poderá ser desfeita. Ao enviar, a Inteligência Artificial iniciará a correção imparcial das suas respostas.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
