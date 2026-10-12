import { useState, type SubmitEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';
import { AuthService } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { normalizeEmail, validateEmail } from '../../utils/validators';

export function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError(null);
  };

  const validateForm = () => {
    const newErrors = {
      email: validateEmail(formData.email),
      password: formData.password ? '' : 'A senha é obrigatória',
    };

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (isSubmitting || !validateForm()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const token = await AuthService.signIn(normalizeEmail(formData.email), formData.password);
      localStorage.setItem('token', token);

      const userData = await AuthService.getMe(token);
      if (userData.role === 'ROLE_COMPANY') {
        navigate('/company/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (error: unknown) {
      localStorage.removeItem('token');
      setServerError(getApiErrorMessage(error, 'Ocorreu um erro no servidor. Tente novamente mais tarde.'));
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
          label="Email" 
          name="email" 
          type="email" 
          placeholder="usuario@exemplo.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={isSubmitting}
          autoComplete="email"
          required 
        />
        
        <AuthInput 
          label="Senha" 
          name="password" 
          type="password" 
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          disabled={isSubmitting}
          autoComplete="current-password"
          required 
        />

        <div className="pt-2">
          <AuthButton type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
            Continuar
          </AuthButton>
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-[#5f6368]">
        Não possui conta?{' '}
        <Link to="/candidate/register" className="font-medium text-[#1a73e8] hover:underline">
          Criar Conta
        </Link>
      </div>
    </div>
  );
}
