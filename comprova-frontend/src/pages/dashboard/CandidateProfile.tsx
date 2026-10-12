import { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';
import { AuthService } from '../../services/authService';
import { getApiErrorMessage, getApiFieldErrors, translateApiMessage } from '../../utils/apiErrors';
import {
  USERNAME_MAX,
  normalizeEmail,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../../utils/validators';

export function CandidateProfile() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    cpf: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setIsLoading(true);
    AuthService.getCandidateProfile()
      .then((data) => {
        setFormData(prev => ({
          ...prev,
          username: data.username || '',
          email: data.email || '',
          cpf: data.cpf || ''
        }));
        setServerError('');
      })
      .catch((err: unknown) => {
        setServerError(getApiErrorMessage(err, 'Falha ao carregar as informações do seu perfil.'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setSuccessMessage('');
    setServerError('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

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
      const res = await AuthService.updateCandidateProfile({
        username: formData.username.trim(),
        email: normalizeEmail(formData.email),
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined
      });

      setSuccessMessage(translateApiMessage(res.message, 'Seu perfil foi atualizado com sucesso.'));
      setFormData(prev => ({
        ...prev,
        username: res.username || prev.username,
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
        setServerError(getApiErrorMessage(err, 'Falha ao atualizar o perfil. Verifique os dados e tente novamente.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/candidate/dashboard" 
          className="p-2 text-[#5f6368] hover:bg-[#e8eaed] rounded-full transition-colors cursor-pointer"
          title="Voltar ao Painel"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-medium text-[#202124]">Meu Perfil</h1>
          <p className="text-sm text-[#5f6368] mt-1">
            Gerencie suas informações pessoais, email de contato e credenciais de acesso.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-[#e6f4ea] border border-[#ceead6] text-[#137333] text-sm rounded-[8px] flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-[#137333]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {serverError && (
        <div className="p-4 bg-[#fce8e6] border border-[#fad2cf] text-[#c5221f] text-sm rounded-[8px] flex items-center gap-3 shadow-xs">
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
          
          {/* Seção 1: Informações Pessoais */}
          <div className="bg-white border border-[#dadce0] rounded-[8px] overflow-hidden shadow-xs">
            <div className="border-b border-[#dadce0] bg-[#f8f9fa] px-6 py-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1a73e8]" />
              <h2 className="text-base font-medium text-[#202124]">Informações Pessoais</h2>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <AuthInput 
                    label="Nome de Usuário" 
                    name="username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    error={errors.username}
                    disabled={isSubmitting}
                    maxLength={USERNAME_MAX}
                    autoComplete="username"
                    required 
                    placeholder="ex: matheus_reiter"
                  />
                  <p className={`text-xs text-[#5f6368] mt-1.5 ${errors.username ? 'pt-4' : ''}`}>
                    Visível para recrutadores (3 a 20 caracteres).
                  </p>
                </div>

                <div>
                  <AuthInput 
                    label="CPF" 
                    name="cpf" 
                    value={formData.cpf} 
                    onChange={handleChange} 
                    disabled 
                    className="bg-[#f8f9fa] text-[#5f6368] cursor-not-allowed"
                  />
                  <p className="text-xs text-[#5f6368] mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1a73e8]" />
                    Documento único registrado no cadastro (imutável).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Contato */}
          <div className="bg-white border border-[#dadce0] rounded-[8px] overflow-hidden shadow-xs">
            <div className="border-b border-[#dadce0] bg-[#f8f9fa] px-6 py-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#1a73e8]" />
              <h2 className="text-base font-medium text-[#202124]">Contato</h2>
            </div>
            <div className="p-6 space-y-5">
              <AuthInput 
                label="Endereço de Email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                error={errors.email}
                disabled={isSubmitting}
                maxLength={254}
                required 
                placeholder="seu.email@exemplo.com"
              />
              <p className={`text-xs text-[#5f6368] ${errors.email ? 'pt-3' : ''}`}>
                Utilizado para notificações sobre suas candidaturas e login no sistema.
              </p>
            </div>
          </div>

          {/* Seção 3: Segurança e Senha */}
          <div className="bg-white border border-[#dadce0] rounded-[8px] overflow-hidden shadow-xs">
            <div className="border-b border-[#dadce0] bg-[#f8f9fa] px-6 py-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#1a73e8]" />
              <h2 className="text-base font-medium text-[#202124]">Segurança e Senha</h2>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-[#5f6368]">
                Deixe os campos em branco se não quiser alterar sua senha atual.
              </p>
              
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
                placeholder="Digite sua senha atual"
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

          {/* Botões de Ação */}
          <div className="flex justify-end items-center gap-3 pt-2">
            <Link to="/candidate/dashboard">
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
