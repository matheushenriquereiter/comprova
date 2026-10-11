// Traduz as mensagens de erro do backend (em inglês) para exibir ao usuário.
const MESSAGES: Record<string, string> = {
  'The test for this application has already been submitted.': 'Esta prova já foi enviada e não pode ser respondida novamente.',
  'This job posting is closed.': 'Esta vaga foi encerrada e não aceita mais candidaturas.',
  'This job posting has expired.': 'O prazo desta vaga já terminou.',
  'Candidate already applied for this application.': 'Você já se candidatou a esta vaga.',
  'Job posting not found.': 'Vaga não encontrada.',
  'Application not found.': 'Candidatura não encontrada.',
};

export function getErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { message?: string } | null)?.message;
  if (!message) return fallback;
  return MESSAGES[message] ?? fallback;
}
