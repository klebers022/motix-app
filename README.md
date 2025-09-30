# 🚦 MOTIX — Gerenciador de Motos em Pátios

MOTIX é uma aplicação mobile desenvolvida com **React Native (Expo)** para organizar e controlar motocicletas em pátios logísticos da Mottu. O app permite o cadastro de motos com localização por vaga, visualização em painel de controle (dashboard), geração de relatórios e exportação em PDF ou CSV.

---

## 📱 Funcionalidades

- ✅ Login com FireBase 
- ✅ Cadastro de motos com vaga, placa e data/hora
- ✅ Validação de vaga disponível
- ✅ Dashboard com visualização em matriz (Setor A)
- ✅ Exportação de relatórios filtrados por data, placa e setor
- ✅ Geração de PDF e CSV dos registros
- ✅ Persistência no banco de dados

---

## 👥 Participantes

| Nome               | RM      |
|--------------------|---------|
| Kleber da Silva    | 557887  |
| Nicolas Barutti    | 554944  |
| Lucas Rainha       | 558471  |

---

## 🛠️ Tecnologias Utilizadas

- React Native + Expo
- React Navigation (Drawer)
- AsyncStorage
- Expo Print & Sharing
- Picker (React Native Picker)


---

## 🧪 Pré-requisitos

- Node.js e npm instalados
- Expo CLI instalado:
```bash
npm install -g expo-cli
```

---

## ▶️ Como Rodar o Projeto

```bash
# 1. Clone o repositório
git clone https://github.com/klebers022/motix-app.git

# 2. Acesse a pasta do projeto
cd projeto-motix

# 3. Instale as dependências
npm install

# 4. Inicie o projeto
npx expo start
```

> Escaneie o QR code com o aplicativo **Expo Go** no seu celular para testar a aplicação.

---



## 📂 Estrutura de Pastas

```
motix-app/
├── assets/
├── components/
    ├── CustomDrawerContent.js
├── contexts/
    ├── ThemeContext.js/
├── screens/
│   ├── LoginScreen.js
│   ├── DashboardScreen.js
│   ├── CadastroMotoScreen.js
    ├── RegisterScreen.js
│   ├── RelatorioScreen.js
├── services/
    └── api/
        └── client.js
        └── motorcycles.js
        └── movements.js
        └── sectors.js
        └── validators.js
│   └── firebaseConfig.js
├── App.js
├── App.jason
├── index.js
└── README.md
```

---

## 📌 Observações

- Este projeto foi desenvolvido como parte do **Challenge FIAP 2025 - 2º Semestre**.
- Futuramente, o app será integrado à visão computacional com Roboflow para leitura automática de placas e ocupação de vagas.

---

## 📸 Layouts

Veja os protótipos do aplicativo no diretório `https://www.figma.com/design/zptG61AfTIbSgTyU5iikMC/Motix?t=Ti5OWWc5xpS5SH17-0` ou na apresentação oficial do projeto.

---

