import { useState, type SubmitEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';
import { AuthService } from '../../services/authService';

export function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setServerError(null);
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError(null);

    try {
      const token = await AuthService.signIn(formData.email, formData.password);
      localStorage.setItem('token', token);
      
      const userData = await AuthService.getMe(token);
      if (userData.role === 'ROLE_COMPANY') {
        navigate('/company/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Ocorreu um erro no servidor. Tente novamente mais tarde.';
      setServerError(msg);
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
          disabled={isSubmitting}
          autoComplete="email"
          required 
        />
        
        <div className="space-y-1">
          <AuthInput 
            label="Senha" 
            name="password" 
            type="password" 
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            autoComplete="current-password"
            required 
          />
          <div className="flex justify-end pt-1">
            <a href="#" className="text-sm font-medium text-[#1a73e8] hover:bg-[#f8f9fa] px-2 py-1 rounded transition-colors">
              Esqueceu a senha?
            </a>
          </div>
        </div>

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
