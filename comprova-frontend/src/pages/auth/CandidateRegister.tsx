import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';
import { AuthService } from '../../services/authService';

const validateCPF = (cpf: string) => {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
      
  let add = 0;
  for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;
      
  add = 0;
  for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10))) return false;
      
  return true;
};

const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username) newErrors.username = 'O nome de usuário é obrigatório';
    else if (formData.username.length < 3) newErrors.username = 'Mínimo de 3 caracteres';
    else if (formData.username.length > 20) newErrors.username = 'Máximo de 20 caracteres';

    if (!formData.email) newErrors.email = 'O email é obrigatório';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Insira um email válido';

    if (!formData.cpf) newErrors.cpf = 'O CPF é obrigatório';
    else if (!validateCPF(formData.cpf)) newErrors.cpf = 'Insira um CPF válido';

    if (!formData.password) newErrors.password = 'A senha é obrigatória';
    else if (formData.password.length < 8) newErrors.password = 'Mínimo de 8 caracteres';
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
      // 1. Cadastra o candidato
      await AuthService.signUpCandidate({
        username: formData.username,
        email: formData.email,
        cpf: formData.cpf.replace(/\D/g, ''),
        password: formData.password
      });

      // 2. Realiza o login automático
      const token = await AuthService.signIn(formData.email, formData.password);
      localStorage.setItem('token', token);
      
      // 3. Redireciona para o dashboard correto
      navigate('/candidate/dashboard');

    } catch (err: unknown) {
      const data = err as { message?: string; errors?: Array<{ field: string; message: string }> };
      if (data?.message === "Username is already in use.") {
        setErrors(prev => ({ ...prev, username: 'Este nome de usuário já está em uso.' }));
      } else if (data?.message === "Email address is already in use.") {
        setErrors(prev => ({ ...prev, email: 'Este email já está em uso.' }));
      } else if (data?.errors && data.errors.length > 0) {
        const apiErrors: Record<string, string> = {};
        data.errors.forEach(errorItem => {
          if (errorItem.field) apiErrors[errorItem.field] = errorItem.message || 'Campo inválido';
        });
        setErrors(prev => ({ ...prev, ...apiErrors }));
      } else {
        setServerError(data?.message || 'Erro ao registrar. Verifique os dados ou tente novamente mais tarde.');
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
          placeholder="johndoe"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          autoComplete="username"
          disabled={isSubmitting}
          required 
          maxLength={20}
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
        />
        
        <AuthInput 
          label="CPF" 
          name="cpf" 
          type="text" 
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
