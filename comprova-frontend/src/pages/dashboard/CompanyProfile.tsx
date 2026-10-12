import { useState, useEffect } from 'react';
import { Building, Phone, Lock, Save, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';
import { AuthService } from '../../services/authService';
import { getApiErrorMessage, getApiFieldErrors, translateApiMessage } from '../../utils/apiErrors';
import {
  formatCNPJ,
  formatPhone,
  isValidPhone,
  normalizeEmail,
  onlyDigits,
  validateEmail,
  validatePassword,
  validateRequiredText,
} from '../../utils/validators';

export function CompanyProfile() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    legalName: '',
    tradeName: '',
    cnpj: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    AuthService.getCompanyProfile()
      .then((data) => {
        setFormData(prev => ({
          ...prev,
          legalName: data.legalName || '',
          tradeName: data.tradeName || '',
          email: data.email || '',
          cnpj: formatCNPJ(data.cnpj || ''),
          phone: formatPhone(data.phone || '')
        }));
      })
      .catch((err: unknown) => {
        setServerError(getApiErrorMessage(err, 'Erro ao carregar dados do perfil.'));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = name === 'phone' ? formatPhone(value) : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setSuccessMessage('');
    setServerError('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const legalNameError = validateRequiredText(formData.legalName, 'A razão social', 3, 255);
    if (legalNameError) newErrors.legalName = legalNameError;

    const tradeNameError = validateRequiredText(formData.tradeName, 'O nome fantasia', 3, 255);
    if (tradeNameError) newErrors.tradeName = tradeNameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!formData.phone) newErrors.phone = 'O telefone é obrigatório';
    else if (!isValidPhone(formData.phone)) newErrors.phone = 'Insira um telefone válido com DDD';

    const wantsPasswordChange = Boolean(formData.newPassword || formData.currentPassword || formData.confirmPassword);
    if (wantsPasswordChange) {
      if (!formData.currentPassword) newErrors.currentPassword = 'Informe sua senha atual';

      const newPasswordError = validatePassword(formData.newPassword, 'A nova senha');
      if (newPasswordError) newErrors.newPassword = newPasswordError;
      else if (formData.newPassword === formData.currentPassword) newErrors.newPassword = 'A nova senha deve ser diferente da atual';

      if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirme a nova senha';
      else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setServerError('');
    setSuccessMessage('');
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const res = await AuthService.updateCompanyProfile({
        legalName: formData.legalName.trim(),
        tradeName: formData.tradeName.trim(),
        email: normalizeEmail(formData.email),
        phone: onlyDigits(formData.phone),
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined
      });
      setSuccessMessage(translateApiMessage(res.message, 'Informações atualizadas com sucesso.'));
      setFormData(prev => ({
        ...prev,
        email: res.email || prev.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err: unknown) {
      const fieldErrors = getApiFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      } else if ((err as { message?: string })?.message === 'Current password is incorrect.') {
        setErrors(prev => ({ ...prev, currentPassword: 'A senha atual está incorreta' }));
      } else {
        setServerError(getApiErrorMessage(err, 'Falha ao atualizar as informações. Verifique os dados e tente novamente.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <Link to="/company/dashboard" className="p-2 text-[#5f6368] hover:bg-[#e8eaed] rounded-full transition-colors" title="Voltar ao Painel">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-medium text-[#202124]">Perfil da Empresa</h1>
          <p className="text-sm text-[#5f6368] mt-1">Gerencie suas informações cadastrais e credenciais.</p>
        </div>
      </div>

      {successMessage && (
        <div role="status" className="p-4 bg-[#e6f4ea] border border-[#ceead6] text-[#137333] text-sm rounded-[8px] flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {serverError && (
        <div role="alert" className="p-4 bg-[#fce8e6] border border-[#fad2cf] text-[#c5221f] text-sm rounded-[8px] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#d93025]" />
          <span>{serverError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 bg-white border border-[#dadce0] rounded-[8px] text-center text-[#5f6368] text-sm flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
          <span>Carregando dados do perfil...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* Seção 1: Informações Básicas */}
          <div className="bg-white border border-[#dadce0] rounded-[8px] overflow-hidden">
            <div className="border-b border-[#dadce0] bg-[#f8f9fa] px-6 py-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-[#1a73e8]" />
              <h2 className="text-base font-medium text-[#202124]">Informações Básicas</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <AuthInput
                  label="Razão Social"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleChange}
                  error={errors.legalName}
                  disabled={isSubmitting}
                  maxLength={255}
                  required
                />
                <AuthInput
                  label="Nome Fantasia"
                  name="tradeName"
                  value={formData.tradeName}
                  onChange={handleChange}
                  error={errors.tradeName}
                  disabled={isSubmitting}
                  maxLength={255}
                  required
                />
              </div>
              <AuthInput
                label="CNPJ"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                disabled // O CNPJ identifica a empresa e não pode ser alterado
                className="bg-[#f8f9fa] text-[#5f6368]"
              />
            </div>
          </div>

          {/* Seção 2: Contato */}
          <div className="bg-white border border-[#dadce0] rounded-[8px] overflow-hidden">
            <div className="border-b border-[#dadce0] bg-[#f8f9fa] px-6 py-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#1a73e8]" />
              <h2 className="text-base font-medium text-[#202124]">Contato</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <AuthInput
                  label="Email Comercial"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  disabled={isSubmitting}
                  maxLength={254}
                  required
                />
                <AuthInput
                  label="Telefone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  disabled={isSubmitting}
                  maxLength={15}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Segurança */}
          <div className="bg-white border border-[#dadce0] rounded-[8px] overflow-hidden">
            <div className="border-b border-[#dadce0] bg-[#f8f9fa] px-6 py-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#1a73e8]" />
              <h2 className="text-base font-medium text-[#202124]">Segurança</h2>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-[#5f6368]">Preencha apenas se desejar alterar sua senha atual.</p>
              <AuthInput
                label="Senha Atual"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                error={errors.currentPassword}
                disabled={isSubmitting}
                maxLength={72}
                autoComplete="current-password"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <AuthInput
                  label="Nova Senha"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={errors.newPassword}
                  disabled={isSubmitting}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="Mínimo de 8 caracteres"
                />
                <AuthInput
                  label="Confirmar Nova Senha"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  disabled={isSubmitting}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="Repita a nova senha"
                />
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-2">
            <Link to="/company/dashboard">
              <AuthButton type="button" variant="secondary" disabled={isSubmitting}>
                Cancelar
              </AuthButton>
            </Link>
            <AuthButton type="submit" isLoading={isSubmitting}>
              <Save className="w-4 h-4" /> Salvar Alterações
            </AuthButton>
          </div>
        </form>
      )}
    </div>
  );
}
