import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthInput } from '../../components/ui/AuthInput';
import { AuthButton } from '../../components/ui/AuthButton';

function validateCPF(cpf: string) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf === '') return false;
  
  if (cpf.length !== 11 ||
      cpf === "00000000000" ||
      cpf === "11111111111" ||
      cpf === "22222222222" ||
      cpf === "33333333333" ||
      cpf === "44444444444" ||
      cpf === "55555555555" ||
      cpf === "66666666666" ||
      cpf === "77777777777" ||
      cpf === "88888888888" ||
      cpf === "99999999999")
      return false;
      
  let add = 0;
  for (let i = 0; i < 9; i++)
      add += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11);
  if (rev === 10 || rev === 11)
      rev = 0;
  if (rev !== parseInt(cpf.charAt(9)))
      return false;
      
  add = 0;
  for (let i = 0; i < 10; i++)
      add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev === 10 || rev === 11)
      rev = 0;
  if (rev !== parseInt(cpf.charAt(10)))
      return false;
      
  return true;
}

export function CandidateRegister() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    cpf: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    cpf: '',
    password: ''
  });

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'cpf') {
      newValue = formatCPF(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = {
      username: '',
      email: '',
      cpf: '',
      password: ''
    };
    let isValid = true;

    if (!formData.username) {
      newErrors.username = 'O nome de usuário é obrigatório';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'O nome de usuário deve ter no mínimo 3 caracteres';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'O email é obrigatório';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Insira um email válido';
      isValid = false;
    }

    if (!formData.cpf) {
      newErrors.cpf = 'O CPF é obrigatório';
      isValid = false;
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'Insira um CPF válido';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'A senha é obrigatória';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'A senha deve ter no mínimo 8 caracteres';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/auth/sign-up/candidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            cpf: formData.cpf.replace(/\D/g, ''),
            password: formData.password
          }),
        });

        if (response.ok) {
          navigate('/login');
        } else {
          // Se houver erro da API (ex: email já existe)
          setErrors(prev => ({ ...prev, email: 'Erro ao registrar. Tente outro email/CPF.' }));
        }
      } catch {
        setErrors(prev => ({ ...prev, email: 'Erro de conexão com o servidor.' }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthInput 
          label="Nome de Usuário" 
          name="username" 
          type="text" 
          placeholder="johndoe"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          required 
          minLength={3}
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
