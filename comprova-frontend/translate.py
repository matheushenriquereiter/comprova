import os
import re

replacements = {
    "src/components/ui/AuthLayout.tsx": [
        (r'Candidate', 'Candidato'),
        (r'Company', 'Empresa'),
        (r'Create a ComProva Account', 'Criar uma Conta ComProva'),
        (r'Create account', 'Criar conta'),
        (r'Sign in', 'Entrar'),
        (r'Use your ComProva Account', 'Use sua Conta ComProva'),
    ],
    "src/components/ui/DashboardLayout.tsx": [
        (r'Company', 'Empresa'),
        (r'Job Postings', 'Vagas'),
        (r'Candidates', 'Candidatos'),
    ],
    "src/components/ui/AuthButton.tsx": [
        (r'Loading...', 'Carregando...'),
    ],
    "src/pages/auth/CandidateLogin.tsx": [
        (r'Email Address', 'Email'),
        (r'Password', 'Senha'),
        (r'Forgot password\?', 'Esqueceu a senha?'),
        (r'Next', 'Continuar'),
        (r'New candidate\?', 'Novo candidato?'),
        (r'Create Account', 'Criar Conta'),
    ],
    "src/pages/auth/CompanyLogin.tsx": [
        (r'Email Address', 'Email'),
        (r'Password', 'Senha'),
        (r'Forgot password\?', 'Esqueceu a senha?'),
        (r'Next', 'Continuar'),
        (r'New company\?', 'Nova empresa?'),
        (r'Create Account', 'Criar Conta'),
    ],
    "src/pages/auth/CandidateRegister.tsx": [
        (r'Username', 'Nome de Usuário'),
        (r'Email Address', 'Email'),
        (r'Password', 'Senha'),
        (r'Create account', 'Criar conta'),
        (r'Already registered\?', 'Já possui conta?'),
        (r'Sign in instead', 'Fazer login'),
    ],
    "src/pages/auth/CompanyRegister.tsx": [
        (r'Username', 'Nome de Usuário'),
        (r'Email Address', 'Email'),
        (r'Legal Name', 'Razão Social'),
        (r'Trade Name', 'Nome Fantasia'),
        (r'Phone', 'Telefone'),
        (r'Password', 'Senha'),
        (r'Create account', 'Criar conta'),
        (r'Already registered\?', 'Já possui conta?'),
        (r'Sign in instead', 'Fazer login'),
    ],
    "src/pages/dashboard/CompanyDashboard.tsx": [
        (r'Job Postings', 'Vagas'),
        (r'Search postings...', 'Buscar vagas...'),
        (r'New Posting', 'Nova Vaga'),
        (r'>Title<', '>Título<'),
        (r'>Status<', '>Status<'),
        (r'>Candidates<', '>Candidatos<'),
        (r'>Expires<', '>Expira em<'),
        (r'applied', 'inscritos'),
        (r'No applications yet', 'Nenhuma inscrição ainda'),
        (r'Create New Job Posting', 'Criar Nova Vaga'),
        (r'Cancel', 'Cancelar'),
        (r'Publish Posting', 'Publicar Vaga'),
        (r'Basic Details', 'Detalhes Básicos'),
        (r'>Requirements<', '>Requisitos<'),
        (r'AI Assessment', 'Avaliação por IA'),
        (r'Job Title', 'Título da Vaga'),
        (r'Workplace Type', 'Modalidade'),
        (r'>REMOTE<', '>REMOTO<'),
        (r'>HYBRID<', '>HÍBRIDO<'),
        (r'>ONSITE<', '>PRESENCIAL<'),
        (r'Employment Type', 'Tipo de Contrato'),
        (r'>FULL_TIME<', '>TEMPO INTEGRAL<'),
        (r'>CONTRACTOR<', '>PJ / CONTRATADO<'),
        (r'"Location"', '"Localização"'),
        (r'Expires At', 'Data de Expiração'),
        (r'Job Description', 'Descrição da Vaga'),
        (r'Describe the role and responsibilities...', 'Descreva a vaga e responsabilidades...'),
        (r'Required Skills', 'Habilidades Necessárias'),
        (r'Add the skills required for this role. These will be used to generate the AI assessment.', 'Adicione as habilidades necessárias. Elas serão usadas para gerar o teste técnico por IA.'),
        (r'Skill Name', 'Habilidade'),
        (r'>Level<', '>Nível<'),
        (r'>JUNIOR<', '>JÚNIOR<'),
        (r'>MID<', '>PLENO<'),
        (r'>SENIOR<', '>SÊNIOR<'),
        (r'>Add<', '>Adicionar<'),
        (r'No skills added yet.', 'Nenhuma habilidade adicionada.'),
        (r'AI-Generated Assessment', 'Teste Gerado por IA'),
        (r'ComProva AI will generate targeted technical questions based on the skills and description you provided. Candidates will face these questions during their application process.', 'A IA do ComProva criará questões técnicas baseadas nas habilidades e descrição fornecidas. Os candidatos farão este teste durante a inscrição.'),
        (r'Generate Preview Questions', 'Gerar Perguntas de Teste'),
        (r'Senior Java Backend Engineer', 'Engenheiro Backend Java Sênior'),
        (r'React Frontend Developer', 'Desenvolvedor Frontend React'),
        (r'DevOps Specialist \(AWS\)', 'Especialista DevOps (AWS)'),
        (r'>ACTIVE<', '>ATIVA<'),
        (r'>DRAFT<', '>RASCUNHO<')
    ],
    "src/pages/dashboard/JobPostingCandidates.tsx": [
        (r'Back to Postings', 'Voltar para Vagas'),
        (r'4 candidates applied', '4 candidatos inscritos'),
        (r'>Candidate<', '>Candidato<'),
        (r'Match Score', 'Score de Aderência'),
        (r'Applied Date', 'Data de Inscrição'),
        (r'>Status<', '>Status<'),
        (r'>PASSED<', '>APROVADO<'),
        (r'>FAILED<', '>REPROVADO<'),
        (r'>PENDING_REVIEW<', '>EM ANÁLISE<'),
        (r'Passed<', 'Aprovado<'),
        (r'Failed<', 'Reprovado<'),
        (r'Pending Review', 'Em Análise'),
        (r'View Profile', 'Ver Perfil'),
        (r'ComProva Assistant', 'Assistente ComProva'),
        (r'Hi! I can help you filter and rank these candidates. What are you looking for\?', 'Olá! Posso ajudar a filtrar e classificar esses candidatos. O que você procura?'),
        (r'Ask AI to filter candidates...', 'Peça para a IA filtrar candidatos...'),
        (r"I've filtered the table to show candidates matching", "Filtrei a tabela para mostrar candidatos correspondentes a"),
        (r'Senior Java Backend Engineer', 'Engenheiro Backend Java Sênior')
    ]
}

for filepath, changes in replacements.items():
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        for search, replace in changes:
            content = re.sub(search, replace, content)
            
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        print(f"File not found: {filepath}")
