# Medicalink - Assistente Médico Virtual

## 📋 Sobre o Projeto

O **Medicalink** é um sistema médico virtual desenvolvido com inteligência artificial que fornece informações educativas sobre saúde. O sistema utiliza a API da OpenAI (GPT-3.5) para gerar respostas contextualizadas e responsáveis sobre questões médicas básicas.

## 🚀 Funcionalidades

- **Chat Inteligente**: Interface de conversa intuitiva e responsiva
- **IA Avançada**: Integração com OpenAI GPT-3.5 para respostas precisas
- **Histórico de Conversas**: Armazenamento de todas as interações
- **Exportação de Dados**: Download das conversas em JSON ou TXT
- **Interface Responsiva**: Funciona em desktop, tablet e mobile
- **API RESTful**: Backend FastAPI com documentação automática
- **Banco de Dados**: PostgreSQL para persistência de dados

## 🏗️ Arquitetura

```
medicalink/
├── backend/           # API FastAPI
│   ├── main.py       # Aplicação principal
│   ├── api.py        # Rotas da API
│   ├── db.py         # Configuração do banco
│   ├── models.py     # Modelos SQLAlchemy
│   ├── schemas.py    # Schemas Pydantic
│   └── services/     # Serviços externos
├── frontend/         # Interface web
│   ├── index.html    # Página inicial
│   ├── medicalinkai.html # Chat
│   └── static/       # CSS e JavaScript
└── docs/            # Documentação
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **OpenAI API** - Integração com GPT-3.5
- **Pydantic** - Validação de dados
- **Uvicorn** - Servidor ASGI

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna e responsiva
- **JavaScript** - Interatividade e comunicação com API
- **Font Awesome** - Ícones

## 📦 Instalação e Configuração

### Pré-requisitos
- Python 3.10+
- PostgreSQL 12+
- Conta na OpenAI com API Key