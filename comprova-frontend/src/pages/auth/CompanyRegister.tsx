import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';
import { AuthService } from '../../services/authService';

const validateCNPJ = (cnpj: string) => {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
};

const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,4})/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username || formData.username.length < 3) newErrors.username = 'Mínimo de 3 caracteres';
    else if (formData.username.length > 20) newErrors.username = 'Máximo de 20 caracteres';
    
    if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = 'Insira um email válido';
    
    if (!formData.legalName || formData.legalName.length < 3) newErrors.legalName = 'Mínimo de 3 caracteres';
    else if (formData.legalName.length > 255) newErrors.legalName = 'Máximo de 255 caracteres';
    
    if (!formData.tradeName || formData.tradeName.length < 3) newErrors.tradeName = 'Mínimo de 3 caracteres';
    else if (formData.tradeName.length > 255) newErrors.tradeName = 'Máximo de 255 caracteres';
    
    if (!formData.cnpj || !validateCNPJ(formData.cnpj)) newErrors.cnpj = 'Insira um CNPJ válido';
    
    const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) newErrors.phone = 'Insira um telefone válido';
    
    if (!formData.password || formData.password.length < 8) newErrors.password = 'Mínimo de 8 caracteres';
    else if (formData.password.length > 128) newErrors.password = 'Máximo de 128 caracteres';
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setServerError('');

    try {
      // 1. Cadastra a empresa
      await AuthService.signUpCompany({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        legalName: formData.legalName,
        tradeName: formData.tradeName,
        phone: formData.phone.replace(/[^\d+]/g, ''),
        cnpj: formData.cnpj.replace(/\D/g, '')
      });

      // 2. Realiza o login automático
      const token = await AuthService.signIn(formData.email, formData.password);
      localStorage.setItem('token', token);
      
      // 3. Redireciona para o dashboard da empresa
      navigate('/company/dashboard');

    } catch (err: unknown) {
      const data = err as { message?: string; errors?: Array<{ field: string; message: string }> };
      if (data?.message === "Username is already in use.") {
        setErrors(prev => ({ ...prev, username: 'Este nome de usuário já está em uso.' }));
      } else if (data?.message === "Email address is already in use.") {
        setErrors(prev => ({ ...prev, email: 'Este email já está em uso.' }));
      } else if (data?.message === "CNPJ is already in use.") {
        setErrors(prev => ({ ...prev, cnpj: 'Este CNPJ já está cadastrado.' }));
      } else if (data?.errors && data.errors.length > 0) {
        const apiErrors: Record<string, string> = {};
        data.errors.forEach(errorItem => {
          if (errorItem.field) apiErrors[errorItem.field] = errorItem.message || 'Campo inválido';
        });
        setErrors(prev => ({ ...prev, ...apiErrors }));
      } else {
        setServerError(data?.message || 'Erro ao registrar empresa. Verifique os dados e tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {serverError && (
          <div className="p-3 mb-2 bg-[#fce8e6] border border-[#fad2cf] text-[#c5221f] text-sm rounded-[4px]">
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
          minLength={3}
          maxLength={20}
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
            minLength={3}
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
            minLength={3}
            maxLength={255}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          <AuthInput 
            label="CNPJ" 
            name="cnpj" 
            type="text" 
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
          minLength={8}
          maxLength={128}
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
          minLength={8}
          maxLength={128}
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
