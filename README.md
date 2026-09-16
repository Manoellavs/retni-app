# RETNI - Controle Financeiro (App Mobile)

Aplicativo mobile do RETNI feito em React Native com Expo. Ele permite acompanhar
entradas e saidas, ver o saldo, filtrar o extrato e anexar comprovantes, com os
dados guardados no Firebase (Auth e Firestore) e no Supabase (Storage).

## O que da pra fazer

- Criar conta e entrar com e-mail e senha
- Ver o saldo atual e um resumo de receitas e despesas
- Cadastrar, editar e excluir transacoes
- Categorizar por tipo (deposito, transferencia, pagamento, saque) e por categoria
- Anexar um comprovante (imagem ou PDF) em cada transacao

## Stack

- React Native + Expo
- Expo Router para navegacao por arquivos
- Context API para o estado (autenticacao e transacoes)
- Firebase Auth e Cloud Firestore
- Supabase Storage para os comprovantes
- TypeScript

## Antes de comecar

Voce precisa ter instalado:

- Node.js 18 ou mais novo
- O app Expo Go no celular, ou um emulador Android/iOS
- Uma conta no Firebase
- Uma conta no Supabase

## Configurando o Firebase

1. Crie um projeto no console do Firebase.
2. Ative o metodo de login **E-mail/senha** em Authentication.
3. Crie um banco no **Cloud Firestore** (modo producao).
4. Em "Configuracoes do projeto", registre um app da Web e copie as chaves.
5. Publique as regras de seguranca que estao neste repositorio:
   - `firestore.rules` no Firestore

   Essas regras garantem que cada usuario so enxerga e altera os proprios dados.

6. Em **Firestore Database > Indices**, crie um indice composto na colecao
   `transactions`:
   - `userId` - Ascendente
   - `date` - Descendente

   As consultas filtram por usuario e ordenam por data ao mesmo tempo, e o
   Firestore exige esse indice para esse tipo de consulta. Sem ele, as
   transacoes sao salvas mas nao aparecem na listagem.

## Configurando o Supabase (armazenamento dos comprovantes)

O Storage do Firebase passou a exigir plano pago (Blaze) para ser ativado, entao
os comprovantes ficam no Supabase Storage no lugar.

1. Crie um projeto em supabase.com.
2. Em **Storage**, crie um bucket chamado `receipts`, marcado como publico.
3. No **SQL Editor**, rode:

```sql
create policy "Permitir upload no bucket receipts"
on storage.objects for insert
to anon
with check (bucket_id = 'receipts');

create policy "Permitir apagar no bucket receipts"
on storage.objects for delete
to anon
using (bucket_id = 'receipts');
```

4. Em **Project Settings > API Keys**, copie a Project URL e a Publishable key.

## Variaveis de ambiente

Copie o arquivo de exemplo e preencha com as chaves do seu projeto:

```bash
cp .env.example .env
```

O `.env` fica assim (os valores vem do Firebase e do Supabase):

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...

EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

O `.env` nao vai para o Git (esta no `.gitignore`).

## Rodando o app

Este app e um projeto Expo independente, entao ele tem o proprio `node_modules`.

```bash
cd apps/mobile
npm install --legacy-peer-deps
npx expo start
```

A flag `--legacy-peer-deps` e necessaria por causa de conflitos de peer
dependencies entre a versao do Expo usada e as bibliotecas do Firebase.

Depois, e so ler o QR Code com o Expo Go ou abrir num emulador.

Para rodar no navegador:

```bash
npx expo install react-dom react-native-web @expo/metro-runtime --legacy-peer-deps
npx expo start -c
```

E apertar `w` no terminal quando o QR Code aparecer.

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
│   ├── config/               # Configuracao do Firebase e do Supabase
│   ├── context/               # AuthContext e TransactionsContext
│   ├── domain/                 # Tipos e categorias das transacoes
│   ├── services/               # Firestore (dados) e Supabase (storage)
│   └── theme/                   # Cores e espacamentos
├── metro.config.js            # Ajuste de resolucao de modulos do Firebase
├── firestore.rules            # Regras do Firestore (escopo por usuario)
├── storage.rules               # Regras de referencia do Storage (Firebase)
└── .env.example                 # Modelo das variaveis
```

## Como os dados ficam guardados

- **Firestore**: colecao `transactions`, com um campo `userId` em cada
  documento. As consultas sempre filtram por esse `userId`, e as regras
  impedem acesso de outros usuarios.
- **Supabase Storage**: comprovantes no bucket `receipts/{userId}/...`,
  liberados por politicas de RLS especificas para esse bucket.

## Observacoes tecnicas

- O `metro.config.js` desativa `unstable_enablePackageExports` porque, sem
  isso, o Metro resolve o pacote `firebase/auth` pela build Web em vez da
  build compativel com React Native, e o app quebra com o erro
  `Component auth has not been registered yet`.
- O upload de comprovante usa `expo-file-system/legacy` (`readAsStringAsync`)
  em vez de `fetch().blob()`, porque essa segunda abordagem trava
  silenciosamente em alguns ambientes React Native/Hermes.


