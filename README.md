# 🚀 Desafio AutoU: Classificador de Emails com IA

Este projeto é uma solução para o desafio de estágio da AutoU. É uma aplicação web simples que utiliza inteligência artificial para classificar emails como "Produtivo" ou "Improdutivo" e sugerir uma resposta automática adequada.

A aplicação é construída em Python com Flask no backend e HTML/CSS/JS puro no frontend. A lógica de IA é fornecida pela API do Groq, utilizando o modelo `llama-3.1-8b-instant`.

**https://desafioautouluine.onrender.com** 

## ✨ Funcionalidades

* **Classificação de IA:** Categoriza emails em **Produtivo** (requer ação) ou **Improdutivo** (não requer ação).
* **Sugestão de Resposta:** Gera uma resposta automática profissional com base na classificação.
* **Dois Modos de Entrada:**
    1.  Inserção direta de texto.
    2.  Upload de arquivos `.txt` ou `.pdf`.

## 🛠️ Tecnologias Utilizadas

* **Backend:** Python 3, Flask, Gunicorn
* **Frontend:** HTML5, CSS3, JavaScript (Fetch API)
* **IA (Inteligência Artificial):** API do Groq (Modelo `llama-3.1-8b-instant`)
* **Processamento de Arquivos:** `pdfplumber`
* **Hospedagem:** Render (ou a plataforma que escolhermos)

## 📦 Como Executar Localmente

Siga estas instruções para rodar o projeto em sua máquina local.

### 1. Pré-requisitos

* Python 3.10 ou superior
* Uma chave de API gratuita do [Groq](https://console.groq.com/keys)

### 2. Clonar o Repositório

```bash
git clone [URL-DO-SEU-REPOSITORIO-GITHUB]
cd [NOME-DA-PASTA-DO-PROJETO]