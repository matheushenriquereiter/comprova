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

  const totalQuestions = questions.length;
  const answeredCount = questions.filter((_, idx) => (answers[idx]?.trim().length || 0) > 0).length;
  const unansweredCount = totalQuestions - answeredCount;
  const hasUnanswered = unansweredCount > 0;

  // Durante a correção ativa pela IA, exibe a tela de carregamento normalmente
  if (submitting) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-white border border-[#dadce0] rounded-[8px] p-8 text-center">
          <div className="w-14 h-14 bg-[#e8f0fe] rounded-full flex items-center justify-center mx-auto mb-5 relative">
            <div className="absolute inset-0 border-3 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
            <Code className="w-6 h-6 text-[#1a73e8]" />
          </div>
          <h1 className="text-xl font-medium text-[#202124]">Avaliando suas respostas</h1>
          <p className="text-sm text-[#5f6368] mt-2 leading-relaxed">
            A Inteligência Artificial da ComProva está corrigindo o seu teste técnico em tempo real. Isso leva de 10 a 20 segundos — não feche esta página.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-white border border-[#dadce0] rounded-[8px] p-8 text-center">
          <div className="w-12 h-12 bg-[#e6f4ea] border border-[#ceead6] text-[#137333] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6" />
          </div>

          <h1 className="text-xl font-medium text-[#202124]">Avaliação enviada com sucesso</h1>
          <p className="text-sm text-[#5f6368] mt-1.5 leading-relaxed">
            Suas respostas foram corrigidas pela IA e encaminhadas para a empresa responsável pela vaga.
          </p>

          {score !== null && (
            <div className="my-6 bg-[#f8f9fa] border border-[#dadce0] rounded-[8px] p-4 text-left divide-y divide-[#dadce0]">
              <div className="pb-3 flex items-center justify-between">
                <span className="text-sm text-[#5f6368]">Nota técnica (IA)</span>
                <span className="text-2xl font-semibold text-[#1a73e8] tabular-nums">{score}%</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-sm text-[#5f6368]">Questões respondidas</span>
                <span className="text-sm font-medium text-[#202124] tabular-nums">
                  {answeredCount} de {totalQuestions}
                </span>
              </div>
              <div className="pt-3 flex items-center justify-between">
                <span className="text-sm text-[#5f6368]">Status da candidatura</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e8f0fe] text-[#1a73e8]">
                  Aguardando decisão
                </span>
              </div>
            </div>
          )}

          <AuthButton
            variant="primary"
            onClick={() => navigate('/candidate/dashboard')}
            className="w-full"
          >
            Voltar para Minhas Vagas
          </AuthButton>
        </div>
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
          
          <div className="bg-[#fef7e0] px-3.5 py-1.5 rounded-[8px] flex items-center gap-2 border border-[#fce8b2] text-[#7a4100] text-xs font-medium">
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
                <span className="w-auto px-3 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-medium text-sm tabular-nums">
                  {currentQuestionIndex + 1} de {questions.length}
                </span>
                <span className="font-medium text-[#202124] flex items-center gap-2">
                  {questions[currentQuestionIndex].type === 'PRACTICAL' ? <Code className="w-4 h-4 text-[#1a73e8]" /> : <FileText className="w-4 h-4 text-[#7a4100]" />}
                  Questão {questions[currentQuestionIndex].type === 'PRACTICAL' ? 'Prática' : 'Teórica'} ({questions[currentQuestionIndex].skillEvaluated})
                </span>
              </div>
              {questions[currentQuestionIndex].estimatedTimeMinutes && (
                <span className="text-xs text-[#5f6368] flex items-center gap-1 tabular-nums">
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
                  <label htmlFor="candidate-answer-input" className="text-sm font-medium text-[#202124]">Sua resposta:</label>
                  <span className="text-xs text-[#5f6368] tabular-nums">
                    {answers[currentQuestionIndex]?.trim().length || 0} caracteres
                  </span>
                </div>
                <textarea
                  id="candidate-answer-input"
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
                className="px-8 py-3 bg-[#1a73e8] hover:bg-[#1b66c9] text-white font-medium rounded-full shadow-md transition-colors disabled:opacity-70 flex items-center gap-2 cursor-pointer"
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
        title="Finalizar e Enviar Avaliação"
        maxWidth="max-w-md"
        footer={
          <>
            <AuthButton
              variant="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={submitting}
            >
              Revisar Respostas
            </AuthButton>
            <AuthButton
              variant="primary"
              onClick={handleConfirmSubmit}
              isLoading={submitting}
            >
              {hasUnanswered ? 'Enviar Mesmo Assim' : 'Confirmar Envio'}
            </AuthButton>
          </>
        }
      >
        <div className="space-y-4">
          {hasUnanswered ? (
            <p className="text-sm text-[#7a4100] bg-[#fef7e0] border border-[#fce8b2] rounded-[4px] px-3.5 py-2.5 leading-relaxed">
              Você ainda tem <strong>{unansweredCount} {unansweredCount === 1 ? 'questão em branco' : 'questões em branco'}</strong> ({answeredCount} de {totalQuestions} respondidas). Questões não respondidas receberão nota zero na avaliação.
            </p>
          ) : (
            <p className="text-sm text-[#202124]">
              Todas as <strong>{totalQuestions} questões</strong> foram respondidas e estão prontas para correção.
            </p>
          )}

          <p className="text-xs text-[#5f6368] leading-relaxed">
            Esta ação é definitiva. Após confirmar o envio, suas respostas não poderão ser editadas e serão corrigidas imediatamente pela IA.
          </p>
        </div>
      </Modal>
    </div>
  );
}
