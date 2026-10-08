import { useState, useEffect } from 'react';
import { Building, Phone, Lock, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';
import { AuthService } from '../../services/authService';
import type { User } from '../../types/User';

export function CompanyProfile() {
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

  useEffect(() => {
    // Load current user data
    const token = localStorage.getItem('token');
    if (token) {
      AuthService.getMe(token).then((user: User) => {
        setFormData(prev => ({
          ...prev,
          legalName: user.username || 'Empresa Exemplo LTDA', // Fallback se não tiver no backend
          tradeName: user.username || 'Exemplo',
          email: user.email || '',
          cnpj: '00.000.000/0001-00', // Mock data para visualização
          phone: '(11) 99999-9999'
        }));
      }).catch(console.error);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccessMessage('');
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    try {
      // Aqui seria a chamada real para a API:
      // await CompanyService.updateProfile(formData);
      
      // Simulando delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));
      setSuccessMessage('Informações atualizadas com sucesso.');
    } catch {
      setServerError('Falha ao atualizar as informações. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
