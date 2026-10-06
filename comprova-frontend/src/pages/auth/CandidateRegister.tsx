import { Link } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';

export function CandidateRegister() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement register logic
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">

      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput 
          label="Nome de Usuário" 
          name="username" 
          type="text" 
          placeholder="johndoe"
          required 
          minLength={3}
          maxLength={20}
        />
        
        <AuthInput 
          label="Email" 
          name="email" 
          type="email" 
          placeholder="usuario@exemplo.com"
          required 
        />
        
        <AuthInput 
          label="CPF" 
          name="cpf" 
          type="text" 
          placeholder="000.000.000-00"
          required 
        />

        <AuthInput 
          label="Senha" 
          name="password" 
          type="password" 
          placeholder="••••••••"
          required 
          minLength={8}
          maxLength={128}
        />

        <div className="pt-2">
          <AuthButton type="submit" variant="primary" className="w-full">
            Continuar
          </AuthButton>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm">
        <span className="text-slate-500">Já possui conta?</span>{' '}
        <Link to="/login" className="font-semibold text-[#1a73e8] font-medium">
          Fazer login
        </Link>
      </div>
    </div>
  );
}
