# Dentalize - Sistema de Gestão para Consultórios Odontológicos

Sistema web de gerenciamento de tarefas desenvolvido especificamente para pequenos consultórios odontológicos, com interface completa em português brasileiro.

## 🎯 Funcionalidades

- **Autenticação de Usuários**: Sistema seguro de login e cadastro
- **Calendário Semanal**: Visualização de 7 dias com horários de 7h às 19h
- **Gestão de Tarefas**: Criação, edição e exclusão de compromissos
- **Gestão de Clientes**: Cadastro completo de pacientes com CPF, telefone e observações
- **Gestão de Serviços**: Cadastro de procedimentos com duração, preço e cor personalizada
- **Integração Completa**: Vincule serviços e clientes às tarefas

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure o banco de dados:
```bash
export $(cat .env.local | xargs) && npx prisma migrate dev
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse http://localhost:3000

### Primeiro Acesso

1. Clique em "Cadastre-se" na página de login
2. Preencha seus dados (nome, email e senha)
3. Faça login com as credenciais criadas
4. Você será redirecionado para o dashboard

## 📋 Fluxo de Uso

### 1. Cadastrar Serviços
1. Acesse "Serviços" no menu lateral
2. Clique em "Novo Serviço"
3. Preencha: nome, descrição, duração (minutos), preço e escolha uma cor
4. A cor será usada para identificar o serviço no calendário

### 2. Cadastrar Clientes
1. Acesse "Clientes" no menu lateral
2. Clique em "Novo Cliente"
3. Preencha os dados do paciente (nome é obrigatório)

### 3. Criar Tarefas no Calendário
1. Na tela "Agenda", clique em um horário vazio ou em "Nova Tarefa"
2. Preencha:
   - Título (obrigatório)
   - Descrição
   - Data e hora de início
   - Duração
   - Cliente (opcional)
   - Serviço (opcional - preenche automaticamente a duração)
   - Status
3. A tarefa aparecerá no calendário com a cor do serviço selecionado

### 4. Gerenciar Tarefas
- **Editar**: Clique na tarefa no calendário para abrir o formulário de edição
- **Excluir**: No formulário de edição, clique em "Excluir"
- **Mudar Status**: Edite a tarefa e altere o status (Agendado, Em andamento, Concluído, Cancelado)

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev           # Inicia servidor de desenvolvimento

# Produção
npm run build         # Cria build de produção
npm start             # Inicia servidor de produção

# Database
export $(cat .env.local | xargs) && npx prisma studio    # Abrir interface visual do BD
export $(cat .env.local | xargs) && npx prisma migrate dev # Criar nova migração
export $(cat .env.local | xargs) && npx prisma generate   # Gerar Prisma Client
```

## 🏗️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Backend**: Next.js Server Actions
- **Banco de Dados**: SQLite com Prisma ORM
- **Autenticação**: NextAuth.js v5
- **Validação**: Zod
- **Datas**: date-fns com localização pt-BR

## 📱 Layout

- **Desktop**: Visualização completa do calendário semanal com navegação lateral
- **Responsivo**: Interface adaptável para tablets e dispositivos móveis

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Sessões JWT seguras com NextAuth
- Middleware para proteção de rotas
- Validação de dados com Zod

## 📝 Estrutura do Projeto

```
dentalize/
├── app/                    # Páginas e rotas
│   ├── (auth)/            # Páginas de autenticação
│   ├── dashboard/         # Área protegida
│   └── api/               # API routes
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── calendar/         # Componentes do calendário
│   └── tasks/            # Formulário de tarefas
├── actions/              # Server Actions
├── lib/                  # Bibliotecas e configurações
├── prisma/               # Schema e migrações do BD
└── types/                # Tipos TypeScript
```

## 🔄 Migração para PostgreSQL

Para migrar do SQLite para PostgreSQL:

1. Atualize `.env.local`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/dentalize"
```

2. Atualize `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Execute a migração:
```bash
export $(cat .env.local | xargs) && npx prisma migrate dev
```

## 📄 Licença

Este projeto foi desenvolvido como uma solução personalizada para gestão de consultórios odontológicos.

## 🤝 Suporte

Para questões sobre o código, consulte o arquivo [CLAUDE.md](./CLAUDE.md) que contém documentação técnica detalhada.
# dentalize
