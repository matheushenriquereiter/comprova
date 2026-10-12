import { JobService } from "../../services/jobService";
import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Code, FileText, CheckCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { type CandidateQuestionDTO } from '../../services/jobService';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Modal } from '../../components/ui/Modal';
import { AuthButton } from '../../components/ui/AuthButton';

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
  
  const storageKey = id ? `test_progress_${id}` : '';

  const [testSignature, setTestSignature] = useState<string>('');
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    if (!id) return {};
    try {
      const saved = sessionStorage.getItem(`test_progress_${id}`) || localStorage.getItem(`test_progress_${id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.answers === 'object' && parsed.answers !== null) {
          return parsed.answers;
        }
      }
    } catch {
      // ignore corrupted storage
    }
    return {};
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(() => {
    if (!id) return 0;
    try {
      const saved = sessionStorage.getItem(`test_progress_${id}`) || localStorage.getItem(`test_progress_${id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.currentQuestionIndex === 'number' && parsed.currentQuestionIndex >= 0) {
          return parsed.currentQuestionIndex;
        }
      }
    } catch {
      // ignore corrupted storage
    }
    return 0;
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!id) {
        navigate('/candidate/dashboard', { replace: true });
        return;
      }

      localStorage.removeItem(`submitted_test_${id}`);
      sessionStorage.removeItem(`submitted_test_${id}`);

      setLoading(true);
      try {
        const token = localStorage.getItem('token') || '';

        // 1. Valida o status real da candidatura do candidato antes de carregar a prova
        const appsRes = await JobService.getCandidateApplications(token, 0, 100);
        const myApp = appsRes.content?.find(a => a.applicationId === Number(id));
        if (myApp && myApp.status !== 'PENDING_TEST') {
          sessionStorage.removeItem(`test_progress_${id}`);
          localStorage.removeItem(`test_progress_${id}`);
          navigate('/candidate/dashboard', { replace: true });
          return;
        }

        // 2. Busca as questões da prova (que também é bloqueada pelo backend caso não seja PENDING_TEST)
        const data = await JobService.getCandidateTestQuestions(token, Number(id));
        const signature = `${myApp?.createdAt ?? ''}:${data.map(q => q.id ?? q.statement).join('|')}`;

        try {
          const saved = sessionStorage.getItem(`test_progress_${id}`) || localStorage.getItem(`test_progress_${id}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed?.signature && parsed.signature !== signature) {
              // Nova candidatura/prova reutilizando o mesmo ID após reset do banco
              setCurrentQuestionIndex(0);
              setAnswers({});
            } else if (typeof parsed?.currentQuestionIndex === 'number') {
              setCurrentQuestionIndex(Math.min(Math.max(0, parsed.currentQuestionIndex), Math.max(0, data.length - 1)));
            }
          }
        } catch {
          // ignore
        }

        setTestSignature(signature);
        setQuestions(data);
        setError('');
      } catch {
        navigate('/candidate/dashboard', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id, navigate]);

  useEffect(() => {
    if (!storageKey || !testSignature || success) return;
    const payload = JSON.stringify({
      signature: testSignature,
      currentQuestionIndex,
      answers,
    });
    sessionStorage.setItem(storageKey, payload);
    localStorage.setItem(storageKey, payload);
  }, [storageKey, testSignature, currentQuestionIndex, answers, success]);

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
    setError('');
    try {
      const token = localStorage.getItem('token') || '';
      const allAnswers: Record<number, string> = {};
      questions.forEach((_, idx) => {
        allAnswers[idx] = answers[idx] ? answers[idx].trim() : '';
      });
      const responseData = await JobService.submitCandidateTest(token, Number(id), allAnswers);
      sessionStorage.removeItem(`test_progress_${id}`);
      localStorage.removeItem(`test_progress_${id}`);
      setScore(responseData.score);
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao enviar a avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

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
        onClose={() => !submitting && setIsConfirmModalOpen(false)}
        title="Confirmar Envio da Avaliação"
        maxWidth="max-w-md"
        footer={
          <>
            <AuthButton
              variant="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </AuthButton>
            <AuthButton
              variant="primary"
              onClick={handleConfirmSubmit}
              isLoading={submitting}
            >
              Confirmar e Enviar
            </AuthButton>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[#202124]">
            Tem certeza que deseja finalizar e enviar sua avaliação?
          </p>

          {hasUnanswered && (
            <p className="text-sm text-[#202124] bg-[#fef7e0] border border-[#fce8b2] rounded-[4px] px-3 py-2">
              Você respondeu <strong>{answeredCount} de {totalQuestions}</strong> questões.{' '}
              {unansweredCount === 1
                ? 'A questão em branco receberá nota zero.'
                : `As ${unansweredCount} questões em branco receberão nota zero.`}
            </p>
          )}

          <p className="text-sm text-[#5f6368]">
            Esta ação não pode ser desfeita e suas respostas serão avaliadas imediatamente pela IA.
          </p>
        </div>
      </Modal>
    </div>
  );
}
