import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';
import { AuthService } from '../../services/authService';
import { getApiErrorMessage, getApiFieldErrors } from '../../utils/apiErrors';
import {
  USERNAME_MAX,
  formatCNPJ,
  formatPhone,
  isValidPhone,
  normalizeEmail,
  onlyDigits,
  validateCNPJ,
  validateEmail,
  validatePassword,
  validateRequiredText,
  validateUsername,
} from '../../utils/validators';

export function CompanyRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', email: '', legalName: '', tradeName: '', cnpj: '', phone: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'cnpj') newValue = formatCNPJ(value);
    else if (name === 'phone') newValue = formatPhone(value);

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

    const legalNameError = validateRequiredText(formData.legalName, 'A razão social', 3, 255);
    if (legalNameError) newErrors.legalName = legalNameError;

    const tradeNameError = validateRequiredText(formData.tradeName, 'O nome fantasia', 3, 255);
    if (tradeNameError) newErrors.tradeName = tradeNameError;

    if (!formData.cnpj) newErrors.cnpj = 'O CNPJ é obrigatório';
    else if (!validateCNPJ(formData.cnpj)) newErrors.cnpj = 'Insira um CNPJ válido';

    if (!formData.phone) newErrors.phone = 'O telefone é obrigatório';
    else if (!isValidPhone(formData.phone)) newErrors.phone = 'Insira um telefone válido com DDD';

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

      // 1. Cadastra a empresa
      await AuthService.signUpCompany({
        username: formData.username.trim(),
        email,
        password: formData.password,
        legalName: formData.legalName.trim(),
        tradeName: formData.tradeName.trim(),
        phone: onlyDigits(formData.phone),
        cnpj: onlyDigits(formData.cnpj)
      });

      // 2. Realiza o login automático
      const token = await AuthService.signIn(email, formData.password);
      localStorage.setItem('token', token);

      // 3. Redireciona para o dashboard da empresa
      navigate('/company/dashboard');
    } catch (err: unknown) {
      const fieldErrors = getApiFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      } else {
        setServerError(getApiErrorMessage(err, 'Erro ao registrar empresa. Verifique os dados e tente novamente.'));
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
          placeholder="hr_admin"
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
          placeholder="rh@empresa.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          disabled={isSubmitting}
          required
          maxLength={254}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          <AuthInput
            label="Razão Social"
            name="legalName"
            type="text"
            placeholder="Empresa LTDA"
            value={formData.legalName}
            onChange={handleChange}
            error={errors.legalName}
            autoComplete="organization"
            disabled={isSubmitting}
            required
            maxLength={255}
          />
          <AuthInput
            label="Nome Fantasia"
            name="tradeName"
            type="text"
            placeholder="Company"
            value={formData.tradeName}
            onChange={handleChange}
            error={errors.tradeName}
            autoComplete="organization"
            disabled={isSubmitting}
            required
            maxLength={255}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          <AuthInput
            label="CNPJ"
            name="cnpj"
            type="text"
            inputMode="numeric"
            placeholder="00.000.000/0000-00"
            value={formData.cnpj}
            onChange={handleChange}
            error={errors.cnpj}
            autoComplete="off"
            disabled={isSubmitting}
            required
            maxLength={18}
          />
          <AuthInput
            label="Telefone"
            name="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            autoComplete="tel"
            disabled={isSubmitting}
            required
            maxLength={15}
          />
        </div>

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
