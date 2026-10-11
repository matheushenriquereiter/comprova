import { useState, useEffect } from 'react';
import { Building, Phone, Lock, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';
import { CompanyService, type CompanyProfile as CompanyProfileData } from '../../services/companyService';

const formatCNPJ = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
};

const ERROR_MESSAGES: Record<string, string> = {
  'Email address is already in use.': 'Este e-mail já está em uso por outra conta.',
  'Current password is incorrect.': 'A senha atual está incorreta.',
  'Password must be between 8 and 128 characters.': 'A nova senha deve ter entre 8 e 128 caracteres.',
  'Phone must be a valid number with 10 to 15 digits.': 'Insira um telefone válido com DDD.',
};

export function CompanyProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');

  const [formData, setFormData] = useState({
    legalName: '',
    tradeName: '',
    cnpj: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: ''
  });

  const fillForm = (profile: CompanyProfileData) => {
    setFormData(prev => ({
      ...prev,
      legalName: profile.legalName,
      tradeName: profile.tradeName,
      cnpj: formatCNPJ(profile.cnpj),
      email: profile.email,
      phone: formatPhone(profile.phone),
      currentPassword: '',
      newPassword: ''
    }));
  };

  useEffect(() => {
    // Carrega os dados reais da empresa logada
    CompanyService.getProfile()
      .then(fillForm)
      .catch(() => setServerError('Não foi possível carregar os dados da empresa.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'phone' ? formatPhone(value) : value }));
    setSuccessMessage('');
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (formData.newPassword && !formData.currentPassword) {
      setServerError('Informe a senha atual para definir uma nova senha.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await CompanyService.updateProfile({
        legalName: formData.legalName,
        tradeName: formData.tradeName,
        email: formData.email,
        phone: formData.phone.replace(/[^\d+]/g, ''),
        // Só envia os campos de senha quando o usuário quer trocá-la
        currentPassword: formData.newPassword ? formData.currentPassword : undefined,
        newPassword: formData.newPassword || undefined
      });
      fillForm(updated);
      setSuccessMessage('Informações atualizadas com sucesso.');
    } catch (err: unknown) {
      const data = err as { message?: string; errors?: Array<{ message: string }> };
      const message = data?.errors?.[0]?.message || data?.message || '';
      setServerError(ERROR_MESSAGES[message] || 'Falha ao atualizar as informações. Verifique os campos e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-[#5f6368]">
        Carregando perfil...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <Link to="/company/dashboard" className="p-2 text-[#5f6368] hover:bg-[#e8eaed] rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-medium text-[#202124]">Perfil da Empresa</h1>
          <p className="text-sm text-[#5f6368] mt-1">Gerencie suas informações cadastrais e credenciais.</p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-[#e6f4ea] border border-[#ceead6] text-[#137333] text-sm rounded-[8px] flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      {serverError && (
        <div className="p-4 bg-[#fce8e6] border border-[#fad2cf] text-[#c5221f] text-sm rounded-[8px]">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
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
                required 
              />
              <AuthInput 
                label="Nome Fantasia" 
                name="tradeName" 
                value={formData.tradeName} 
                onChange={handleChange} 
                required 
              />
            </div>
            <AuthInput 
              label="CNPJ" 
              name="cnpj" 
              value={formData.cnpj} 
              onChange={handleChange} 
              disabled // Geralmente CNPJ não é alterável
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
                required 
              />
              <AuthInput 
                label="Telefone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
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
            <p className="text-sm text-[#5f6368] mb-2">Preencha apenas se desejar alterar sua senha atual.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <AuthInput 
                label="Senha Atual" 
                name="currentPassword" 
                type="password" 
                value={formData.currentPassword} 
                onChange={handleChange} 
                autoComplete="current-password"
              />
              <AuthInput 
                label="Nova Senha" 
                name="newPassword" 
                type="password" 
                value={formData.newPassword} 
                onChange={handleChange} 
                autoComplete="new-password"
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
    </div>
  );
}
