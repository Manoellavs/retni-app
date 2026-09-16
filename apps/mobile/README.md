# RETNI - Controle Financeiro (App Mobile)

Aplicativo mobile do RETNI feito em React Native com Expo. Ele permite acompanhar
entradas e saidas, ver o saldo, filtrar o extrato e anexar comprovantes, tudo com
os dados guardados no Firebase (Auth, Firestore e Storage).

## O que da pra fazer

- Criar conta e entrar com e-mail e senha
- Ver o saldo atual e um resumo de receitas e despesas
- Acompanhar graficos por categoria e por periodo
- Cadastrar, editar e excluir transacoes
- Buscar e filtrar por tipo, categoria e data
- Anexar um comprovante (imagem ou PDF) em cada transacao

## Stack

- React Native + Expo
- Expo Router para navegacao por arquivos
- Context API para o estado (autenticacao e transacoes)
- Firebase Auth, Cloud Firestore e Firebase Storage
- react-native-gifted-charts para os graficos

## Antes de comecar

Voce precisa ter instalado:

- Node.js 18 ou mais novo
- O app Expo Go no celular, ou um emulador Android/iOS
- Uma conta no Firebase

## Configurando o Firebase

1. Crie um projeto no console do Firebase.
2. Ative o metodo de login **E-mail/senha** em Authentication.
3. Crie um banco no **Cloud Firestore**.
4. Ative o **Storage**.
5. Em "Configuracoes do projeto", registre um app da Web e copie as chaves.
6. Publique as regras de seguranca que estao neste repositorio:
   - `firestore.rules` no Firestore
   - `storage.rules` no Storage

   Essas regras garantem que cada usuario so enxerga e altera os proprios dados.

## Variaveis de ambiente

Copie o arquivo de exemplo e preencha com as chaves do seu projeto:

```bash
cp .env.example .env
```

O `.env` fica assim (os valores vem do console do Firebase):

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

O `.env` nao vai para o Git (esta no `.gitignore`).

## Rodando o app

Este app e um projeto Expo independente, entao ele tem o proprio `node_modules`
(nao faz parte do workspace do site).

```bash
cd apps/mobile
npm install
npx expo start
```

Depois, e so ler o QR Code com o Expo Go ou abrir num emulador.

## Estrutura de pastas

```
apps/mobile
├── app/                      # Rotas (Expo Router)
│   ├── (auth)/               # Login e cadastro
│   ├── (app)/                # Area logada (abas)
│   │   ├── index.tsx         # Dashboard
│   │   └── transactions/     # Lista, novo e edicao
│   ├── _layout.tsx           # Providers e guard de sessao
│   └── index.tsx             # Redirecionamento inicial
├── src/
│   ├── components/           # UI, formulario e telas compartilhadas
│   ├── config/               # Configuracao do Firebase
│   ├── context/              # AuthContext e TransactionsContext
│   ├── domain/               # Tipos e categorias das transacoes
│   ├── services/             # Firestore e Storage
│   └── theme/                # Cores e espacamentos
├── firestore.rules           # Regras do Firestore (escopo por usuario)
├── storage.rules             # Regras do Storage (escopo por usuario)
└── .env.example              # Modelo das variaveis
```

## Como os dados ficam guardados

- **Firestore**: colecao `transactions`, com um campo `userId` em cada documento.
  As consultas sempre filtram por esse `userId`, e as regras impedem acesso de
  outros usuarios.
- **Storage**: comprovantes em `receipts/{userId}/...`, tambem protegidos por usuario.
