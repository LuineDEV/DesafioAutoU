import os
import json
import io
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
from groq import Groq
import pdfplumber

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Inicializa a aplicação Flask
app = Flask(__name__, template_folder='templates', static_folder='static')

# --- Configuração do Cliente da API ---
try:
    # Inicializa o cliente Groq com a chave da API vinda do .env
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    if not os.getenv("GROQ_API_KEY"):
        raise ValueError("GROQ_API_KEY não encontrada no arquivo .env")
except Exception as e:
    print(f"Erro fatal ao inicializar o cliente Groq: {e}")
    client = None

# --- Lógica Principal da IA ---

def analisar_email_com_ia(texto_email: str) -> dict:
    """
    Envia o texto do email para a API do Groq para classificação e geração de resposta.

    Utiliza um prompt de sistema para instruir o modelo a classificar o email
    e gerar uma resposta, retornando ambos em um formato JSON estruturado.

    Args:
        texto_email: O conteúdo de texto do email a ser analisado.

    Returns:
        Um dicionário contendo 'classificacao' e 'resposta_sugerida'.

    Raises:
        Exception: Se o cliente da API não foi inicializado.
        Exception: Se a chamada da API falhar.
    """
    if not client:
        raise Exception("Cliente Groq não foi inicializado. Verifique a API Key.")

    # Prompt de sistema para guiar o modelo de IA
    prompt_sistema = """
    Você é um assistente de IA para uma empresa do setor financeiro. 
    Seu trabalho é analisar emails e fazer duas coisas:
    1.  **Classificar** o email em uma de duas categorias:
        * **Produtivo**: Emails que requerem uma ação ou resposta específica (ex: solicitações de suporte, dúvidas sobre o sistema, casos em aberto).
        * **Improdutivo**: Emails que não necessitam de uma ação imediata (ex: mensagens de felicitações, agradecimentos, spam, newsletters).
    2.  **Sugerir** uma resposta automática adequada para o email, baseada na classificação. A resposta deve ser curta, profissional e prestativa.

    Você DEVE retornar sua análise em um formato JSON válido, e nada mais além do JSON.
    O formato JSON deve ser:
    {
      "classificacao": "Produtivo" (ou "Improdutivo"),
      "resposta_sugerida": "Texto da sua resposta sugerida aqui."
    }
    """

    try:
        # Chama a API do Groq com o modelo Llama 3.1
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": prompt_sistema},
                {"role": "user", "content": texto_email}
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"},  # Garante a resposta em JSON
            temperature=0.2,  # Respostas mais determinísticas
        )
        
        resultado_json = chat_completion.choices[0].message.content
        return json.loads(resultado_json)

    except Exception as e:
        print(f"Erro na chamada da API do Groq: {e}")
        # Propaga o erro para ser tratado pela rota
        raise Exception(f"Erro ao processar na IA: {e}")

# --- Rotas da Aplicação ---

@app.route('/')
def index():
    """Renderiza a página principal (index.html)."""
    return render_template('index.html')


@app.route('/processar_email', methods=['POST'])
def processar_email():
    """
    Endpoint da API para processar texto de email enviado via JSON.
    """
    try:
        data = request.json
        email_text = data.get('email_text')
        
        if not email_text:
            return jsonify({"error": "Nenhum texto de email fornecido."}), 400

        # Chama a função principal de análise
        resultado_ia = analisar_email_com_ia(email_text)
        return jsonify(resultado_ia)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/upload_arquivo', methods=['POST'])
def upload_arquivo():
    """
    Endpoint da API para processar arquivos (.txt, .pdf) enviados via FormData.
    """
    try:
        if 'file' not in request.files:
            return jsonify({"error": "Nenhum arquivo enviado."}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "Nenhum arquivo selecionado."}), 400

        texto_extraido = ""
        
        # Processa o arquivo baseado na extensão
        if file.filename.endswith('.txt'):
            texto_extraido = file.read().decode('utf-8')
            
        elif file.filename.endswith('.pdf'):
            # Usa BytesIO para ler o arquivo em memória
            with io.BytesIO(file.read()) as file_in_memory:
                with pdfplumber.open(file_in_memory) as pdf:
                    for page in pdf.pages:
                        texto_extraido += page.extract_text() or ""
        else:
            return jsonify({"error": "Formato de arquivo inválido. Use .txt ou .pdf."}), 400

        if not texto_extraido.strip():
            return jsonify({"error": "Não foi possível extrair texto do arquivo."}), 400

        # Envia o texto extraído para a IA
        resultado_ia = analisar_email_com_ia(texto_extraido)
        return jsonify(resultado_ia)

    except Exception as e:
        return jsonify({"error": f"Erro interno ao processar arquivo: {e}"}), 500


# --- Inicialização do Servidor ---
if __name__ == '__main__':
    # O Gunicorn usará esta aplicação, 'debug=True' é apenas para desenvolvimento local.
    app.run(debug=True, port=5000)