// Validações e máscaras compartilhadas entre os formulários.
// As regras espelham as do backend (DTOs com Bean Validation).

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const PASSWORD_MIN = 8;
// O BCrypt aceita no máximo 72 bytes.
export const PASSWORD_MAX_BYTES = 72;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[A-Za-z0-9._-]+$/;

export const onlyDigits = (value: string) => value.replace(/\D/g, '');

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export function validateEmail(value: string): string {
  const email = value.trim();
  if (!email) return 'O email é obrigatório';
  if (email.length > 254) return 'Máximo de 254 caracteres';
  if (!EMAIL_REGEX.test(email)) return 'Insira um email válido';
  return '';
}

export function validateUsername(value: string): string {
  const username = value.trim();
  if (!username) return 'O nome de usuário é obrigatório';
  if (username.length < USERNAME_MIN) return `Mínimo de ${USERNAME_MIN} caracteres`;
  if (username.length > USERNAME_MAX) return `Máximo de ${USERNAME_MAX} caracteres`;
  if (!USERNAME_REGEX.test(username)) return 'Use apenas letras, números, ponto, hífen e sublinhado';
  return '';
}

export function validatePassword(value: string, label = 'A senha'): string {
  if (!value) return `${label} é obrigatória`;
  if (value.length < PASSWORD_MIN) return `Mínimo de ${PASSWORD_MIN} caracteres`;
  if (new TextEncoder().encode(value).length > PASSWORD_MAX_BYTES) return 'Senha muito longa (máximo de 72 bytes)';
  return '';
}

export function validateRequiredText(value: string, label: string, min: number, max: number): string {
  const text = value.trim();
  if (!text) return `${label} é obrigatório`;
  if (text.length < min) return `Mínimo de ${min} caracteres`;
  if (text.length > max) return `Máximo de ${max} caracteres`;
  return '';
}

export function validateCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (check !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  return check === parseInt(cpf.charAt(10));
}

export function validateCNPJ(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const calcDigit = (base: string) => {
    let weight = base.length - 7;
    let sum = 0;
    for (let i = base.length; i >= 1; i--) {
      sum += parseInt(base.charAt(base.length - i)) * weight--;
      if (weight < 2) weight = 9;
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const first = calcDigit(cnpj.substring(0, 12));
  if (first !== parseInt(cnpj.charAt(12))) return false;
  return calcDigit(cnpj.substring(0, 13)) === parseInt(cnpj.charAt(13));
}

export function isValidPhone(value: string): boolean {
  return /^[0-9]{10,15}$/.test(onlyDigits(value));
}

export const formatCPF = (value: string) =>
  onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

export const formatCNPJ = (value: string) =>
  onlyDigits(value)
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');

export const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d+)/, '($1) $2');
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};
