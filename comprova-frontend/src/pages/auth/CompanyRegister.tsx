import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';

function validateCNPJ(cnpj: string) {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj === '') return false;
  if (cnpj.length !== 14) return false;
  
  if (cnpj === "00000000000000" || 
      cnpj === "11111111111111" || 
      cnpj === "22222222222222" || 
      cnpj === "33333333333333" || 
      cnpj === "44444444444444" || 
      cnpj === "55555555555555" || 
      cnpj === "66666666666666" || 
      cnpj === "77777777777777" || 
      cnpj === "88888888888888" || 
      cnpj === "99999999999999")
      return false;
      
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
}

export function CompanyRegister() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    legalName: '',
    tradeName: '',
    cnpj: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    legalName: '',
    tradeName: '',
    cnpj: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [serverError, setServerError] = useState('');

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'cnpj') {
      newValue = formatCNPJ(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    const newErrors = {
      username: '',
      email: '',
      legalName: '',
      tradeName: '',
      cnpj: '',
      phone: '',
      password: '',
      confirmPassword: ''
    };
    let isValid = true;

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Mínimo de 3 caracteres';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Insira um email válido';
      isValid = false;
    }

    if (!formData.legalName || formData.legalName.length < 3) {
      newErrors.legalName = 'Mínimo de 3 caracteres';
      isValid = false;
    }

    if (!formData.tradeName || formData.tradeName.length < 3) {
      newErrors.tradeName = 'Mínimo de 3 caracteres';
      isValid = false;
    }

    if (!formData.cnpj || !validateCNPJ(formData.cnpj)) {
      newErrors.cnpj = 'Insira um CNPJ válido';
      isValid = false;
    }

    const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Insira um telefone válido';
      isValid = false;
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Mínimo de 8 caracteres';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/auth/sign-up/company', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            legalName: formData.legalName,
            tradeName: formData.tradeName,
            phone: cleanPhone,
            cnpj: formData.cnpj.replace(/\D/g, '')
          }),
        });

        if (response.ok) {
          navigate('/login');
        } else {
          const data = await response.json().catch(() => null);
          
          if (data) {
            if (data.message === "Username is already in use.") {
              setErrors(prev => ({ ...prev, username: 'Este nome de usuário já está em uso.' }));
            } else if (data.message === "Email address is already in use.") {
              setErrors(prev => ({ ...prev, email: 'Este email já está em uso.' }));
            } else if (data.message === "CNPJ is already in use.") {
              setErrors(prev => ({ ...prev, cnpj: 'Este CNPJ já está cadastrado.' }));
            } else if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
              const apiErrors = { ...newErrors };
              data.errors.forEach((err: { field: string; message: string }) => {
                if (err.field && err.field in apiErrors) {
                   apiErrors[err.field as keyof typeof apiErrors] = err.message || 'Campo inválido';
                }
              });
              setErrors(apiErrors);
            } else {
              setServerError(data.message || 'Erro ao registrar empresa. Verifique os dados e tente novamente.');
            }
          } else {
            setServerError('Erro inesperado. Tente novamente mais tarde.');
          }
        }
      } catch {
        setServerError('Erro de conexão com o servidor. Verifique sua internet.');
      } finally {
        setIsSubmitting(false);
      }
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
            placeholder="+55 11 99999-9999"
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
