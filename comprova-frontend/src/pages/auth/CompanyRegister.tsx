import { Link } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';

export function CompanyRegister() {
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
          placeholder="hr_admin"
          required 
          minLength={3}
          maxLength={20}
        />
        
        <AuthInput 
          label="Email" 
          name="email" 
          type="email" 
          placeholder="rh@empresa.com"
          required 
        />

        <div className="grid grid-cols-2 gap-4">
          <AuthInput 
            label="Razão Social" 
            name="legalName" 
            type="text" 
            placeholder="Empresa LTDA"
            required 
            minLength={3}
            maxLength={255}
          />
          <AuthInput 
            label="Nome Fantasia" 
            name="tradeName" 
            type="text" 
            placeholder="Company"
            required 
            minLength={3}
            maxLength={255}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AuthInput 
            label="CNPJ" 
            name="cnpj" 
            type="text" 
            placeholder="00.000.000/0000-00"
            required 
          />
          <AuthInput 
            label="Telefone" 
            name="phone" 
            type="tel" 
            placeholder="+55 11 99999-9999"
            required 
          />
        </div>

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
