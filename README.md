# 📊 Sistema de Análise de Questionários para TCC

Sistema web desenvolvido para análise automatizada de dados coletados por meio de questionários (ex: Google Forms), com geração de relatórios em PDF contendo gráficos e interpretação dos resultados.

---

## 🎯 Objetivo

Este projeto tem como objetivo auxiliar na análise de dados de pesquisas acadêmicas, automatizando:

* Processamento de respostas
* Geração de gráficos estatísticos
* Produção de relatórios em PDF
* Análise quantitativa e qualitativa

---

## 🚀 Funcionalidades

### 📥 Entrada de Dados

* Upload de arquivos CSV exportados do Google Forms

### 📊 Análise Quantitativa

* Contagem automática de respostas
* Cálculo de frequência
* Identificação de resposta predominante
* Cálculo percentual

### 📈 Visualização

* Gráficos de:

  * Barras
  * Pizza
  * Linha

### 🧠 Análise Qualitativa (IA)

* Extração de palavras-chave
* Identificação de padrões em respostas abertas
* Geração automática de resumo textual

### 📄 Relatório em PDF

* Estrutura estilo acadêmico (inspirado em normas ABNT)
* Seções:

  * Introdução
  * Resultados
  * Análise dos dados
  * Análise qualitativa
  * Conclusão
  * Sumário automático
* Inclusão de gráficos

---

## 🛠️ Tecnologias Utilizadas

### Backend

* Node.js
* Express
* Mongoose
* MongoDB
* PDFKit
* Chart.js (via chartjs-node-canvas)

### Frontend

* HTML5
* CSS3
* JavaScript

### Deploy

* Render (backend)
* GitHub Pages (frontend)
* MongoDB Atlas (banco de dados)

---

## 📁 Estrutura do Projeto

```
analise-tcc/
│
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Instalação e Execução

### 🔧 Pré-requisitos

* Node.js instalado
* Conta no MongoDB Atlas (ou MongoDB local)

---

### 📥 Clonar o repositório

```bash
git clone https://github.com/seu-usuario/analise-tcc.git
cd analise-tcc
```

---

### 📦 Instalar dependências

```bash
cd backend
npm install
```

---

### 🔐 Configurar variáveis de ambiente

Crie um arquivo `.env` dentro da pasta `backend`:

```
MONGO_URI=sua_string_do_mongodb
PORT=3000
```

---

### ▶️ Executar o servidor

```bash
npm start
```

Servidor disponível em:

```
http://localhost:3000
```

---

### 🌐 Executar o frontend

Abra o arquivo:

```
frontend/index.html
```

---

## 📂 Como Usar

1. Acesse o Google Forms
2. Exporte as respostas em CSV
3. No sistema:

   * Clique em **Enviar**
   * Selecione o arquivo CSV
4. Clique em **Gerar PDF**
5. O relatório será baixado automaticamente

---

## 📊 Exemplo de Uso

Entrada:

```
Pergunta: Curso
Respostas: ADS, SI, ADS, ADS
```

Saída:

* ADS: 75%
* SI: 25%

---

## 🧠 Metodologia

O sistema realiza:

1. Leitura e estruturação dos dados (CSV → JSON)
2. Armazenamento em banco NoSQL
3. Processamento estatístico
4. Geração de gráficos
5. Análise textual automatizada
6. Geração de relatório em PDF

---

## 📈 Possíveis Melhorias Futuras

* Dashboard interativo
* Filtros por grupo de respostas
* Autenticação de usuários
* Exportação para Excel
* Integração direta com API do Google Forms
* Uso de IA avançada para análise semântica

---

## ⚠️ Limitações

* CSV simples (não trata vírgulas dentro de respostas)
* Análise textual baseada em frequência (não semântica)
* Layout ABNT simplificado

---

## 👨‍🎓 Aplicação Acadêmica

Este sistema pode ser utilizado em:

* Trabalhos de Conclusão de Curso (TCC)
* Pesquisas acadêmicas
* Levantamento de dados estatísticos
* Análise de opinião

---

## 📄 Licença

Este projeto é de uso acadêmico.

---

## 👤 Autor

Desenvolvido por:

Williams Clauber Marinho Santos

---

## ⭐ Considerações Finais

O sistema demonstra como a tecnologia pode ser aplicada para automatizar processos de análise de dados, contribuindo para maior eficiência e precisão em pesquisas acadêmicas.
