import { Link } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';

export function Login() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <form className="space-y-6">
        <AuthInput 
          label="Email" 
          name="email" 
          type="email" 
          placeholder="usuario@exemplo.com"
          required 
        />
        
        <div className="space-y-1">
          <AuthInput 
            label="Senha" 
            name="password" 
            type="password" 
            placeholder="••••••••"
            required 
          />
          <div className="flex justify-end">
            <a href="#" className="text-sm font-medium text-[#1a73e8] hover:bg-[#f8f9fa] px-2 py-1 rounded transition-colors">
              Esqueceu a senha?
            </a>
          </div>
        </div>

        <div className="pt-2">
          <AuthButton type="submit" variant="primary" className="w-full">
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
