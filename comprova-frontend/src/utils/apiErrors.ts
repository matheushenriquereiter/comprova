// Tradução das mensagens de erro retornadas pela API (em inglês) para exibição ao usuário.

interface ApiError {
  message?: string;
  errors?: Array<{ field?: string; message?: string }>;
}

const MESSAGES: Record<string, string> = {
  'Username is already in use.': 'Este nome de usuário já está em uso.',
  'Email address is already in use.': 'Este email já está em uso.',
  'CPF is already in use.': 'Este CPF já está cadastrado.',
  'CNPJ is already in use.': 'Este CNPJ já está cadastrado.',
  'Invalid email or password.': 'Email ou senha inválidos.',
  'Current password is required to change the password.': 'Informe sua senha atual para definir uma nova senha.',
  'Current password is incorrect.': 'A senha atual está incorreta.',
  'New password must be different from the current password.': 'A nova senha deve ser diferente da atual.',
  'Profile updated successfully.': 'Perfil atualizado com sucesso.',
  'Username may only contain letters, numbers, dots, hyphens and underscores.': 'Use apenas letras, números, ponto, hífen e sublinhado.',
  'Username must be between 3 and 20 characters.': 'O nome de usuário deve ter entre 3 e 20 caracteres.',
  'Password must be between 8 and 72 characters.': 'A senha deve ter entre 8 e 72 caracteres.',
  'Password is too long.': 'A senha é muito longa.',
  'Invalid email format.': 'Insira um email válido.',
  'Invalid CPF number.': 'Insira um CPF válido.',
  'Invalid CNPJ format.': 'Insira um CNPJ válido.',
  'Phone must be a valid number with 10 to 15 digits.': 'Insira um telefone válido com DDD.',
  'Job posting not found.': 'Vaga não encontrada.',
  'Job posting has expired.': 'Esta vaga já expirou.',
  'Job posting is closed.': 'Esta vaga está encerrada.',
  'Job posting is not open for applications.': 'Esta vaga não está aberta para candidaturas.',
  'Candidate already applied for this application.': 'Você já se candidatou a esta vaga.',
  'Test has already been submitted.': 'Esta avaliação já foi enviada.',
  'An expired job posting cannot be published again.': 'Uma vaga expirada não pode ser publicada novamente.',
  'Skills must not contain duplicated names.': 'Não repita habilidades na mesma vaga.',
  'Validation failed for one or more fields.': 'Verifique os campos informados.',
  'Required request body is missing or malformed.': 'Dados inválidos. Verifique as informações enviadas.',
  'Data integrity violation or record already exists.': 'Os dados informados conflitam com um registro existente.',
  'Access denied.': 'Você não tem permissão para realizar esta ação.',
  'Resource not found.': 'Recurso não encontrado.',
  'An unexpected error occurred.': 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
};

export function translateApiMessage(message: string | undefined, fallback: string): string {
  if (!message) return fallback;
  if (MESSAGES[message]) return MESSAGES[message];

  const weightMatch = message.match(/^The sum of skill weights must be exactly 100, but was (\d+)\.$/);
  if (weightMatch) return `A soma dos pesos das habilidades deve ser exatamente 100 (atualmente ${weightMatch[1]}).`;

  // Mensagens ainda não traduzidas não são exibidas ao usuário.
  return fallback;
}

/** Mensagem única e amigável para exibir em um alerta geral. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const error = err as ApiError | undefined;
  const fieldMessage = error?.errors?.find(e => e.message)?.message;
  return translateApiMessage(fieldMessage ?? error?.message, fallback);
}

/** Erros por campo (validação de DTO) e/ou conflitos conhecidos, para exibir sob cada input. */
export function getApiFieldErrors(err: unknown): Record<string, string> {
  const error = err as ApiError | undefined;
  const result: Record<string, string> = {};

  error?.errors?.forEach(item => {
    if (item.field) result[item.field] = translateApiMessage(item.message, 'Campo inválido');
  });

  const conflictField: Record<string, string> = {
    'Username is already in use.': 'username',
    'Email address is already in use.': 'email',
    'CPF is already in use.': 'cpf',
    'CNPJ is already in use.': 'cnpj',
  };
  const field = error?.message ? conflictField[error.message] : undefined;
  if (field) result[field] = translateApiMessage(error?.message, 'Campo inválido');

  return result;
}
