import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';
import { AuthService } from '../../services/authService';
import { getApiErrorMessage, getApiFieldErrors } from '../../utils/apiErrors';
import {
  USERNAME_MAX,
  formatCPF,
  normalizeEmail,
  onlyDigits,
  validateCPF,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../../utils/validators';

export function CandidateRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', cpf: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = name === 'cpf' ? formatCPF(value) : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!formData.cpf) newErrors.cpf = 'O CPF é obrigatório';
    else if (!validateCPF(formData.cpf)) newErrors.cpf = 'Insira um CPF válido';

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirme a senha';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validateForm()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      const email = normalizeEmail(formData.email);

      // 1. Cadastra o candidato
      await AuthService.signUpCandidate({
        username: formData.username.trim(),
        email,
        cpf: onlyDigits(formData.cpf),
        password: formData.password
      });

      // 2. Realiza o login automático
      const token = await AuthService.signIn(email, formData.password);
      localStorage.setItem('token', token);

      // 3. Redireciona para o dashboard
      navigate('/candidate/dashboard');
    } catch (err: unknown) {
      const fieldErrors = getApiFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      } else {
        setServerError(getApiErrorMessage(err, 'Erro ao registrar. Verifique os dados ou tente novamente mais tarde.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {serverError && (
          <div role="alert" className="p-3 mb-2 bg-[#fce8e6] border border-[#fad2cf] text-[#c5221f] text-sm rounded-[4px]">
            {serverError}
          </div>
        )}

        <AuthInput
          label="Nome de Usuário"
          name="username"
          type="text"
          placeholder="johndoe"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          autoComplete="username"
          disabled={isSubmitting}
          required
          maxLength={USERNAME_MAX}
        />

        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="usuario@exemplo.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          disabled={isSubmitting}
          required
          maxLength={254}
        />

        <AuthInput
          label="CPF"
          name="cpf"
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={formData.cpf}
          onChange={handleChange}
          error={errors.cpf}
          autoComplete="off"
          disabled={isSubmitting}
          required
          maxLength={14}
        />

        <AuthInput
          label="Senha"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
          disabled={isSubmitting}
          required
          maxLength={72}
        />

        <AuthInput
          label="Confirmar Senha"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
          disabled={isSubmitting}
          required
          maxLength={72}
        />

        <div className="pt-2">
          <AuthButton type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
            Continuar
          </AuthButton>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm">
        <span className="text-slate-500">Já possui conta?</span>{' '}
        <Link to="/login" className="font-semibold text-[#1a73e8]">
          Fazer login
        </Link>
      </div>
    </div>
  );
}
