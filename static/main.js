/**
 * Aguarda o carregamento completo do DOM antes de anexar os event listeners.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Seleção de Elementos DOM ---
    const emailTextInput = document.getElementById('email-text');
    const processButton = document.getElementById('process-button');
    const fileUploadInput = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name');
    const resultSection = document.getElementById('result-section');
    const classificationResult = document.getElementById('classification-result');
    const suggestionResult = document.getElementById('suggestion-result');
    const errorMessage = document.getElementById('error-message');

    // --- 2. Event Listeners ---

    /**
     * Manipula o clique no botão "Processar Email".
     * Envia o conteúdo do textarea para o backend.
     */
    processButton.addEventListener('click', () => {
        const emailText = emailTextInput.value;

        if (!emailText.trim()) {
            alert('Por favor, cole um email na área de texto.');
            return;
        }
        
        // Limpa a seleção de arquivo se estiver processando texto manual
        fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
        fileUploadInput.value = null;

        sendDataToBackend(emailText);
    });

    /**
     * Manipula a seleção de um arquivo.
     * Envia o arquivo para o backend para processamento.
     */
    fileUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        
        if (file) {
            fileNameDisplay.textContent = file.name;
            emailTextInput.value = ''; // Limpa o textarea
            uploadFileToBackend(file);
        }
    });

    // --- 3. Funções de API ---

    /**
     * Envia o texto do email para o endpoint /processar_email.
     * @param {string} text - O texto do email a ser analisado.
     */
    async function sendDataToBackend(text) {
        setLoadingState(true);

        try {
            const response = await fetch('/processar_email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email_text: text }),
            });

            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.error || 'Erro desconhecido no servidor.');
            }
            
            displayResults(data.classificacao, data.resposta_sugerida);

        } catch (error) {
            console.error('Erro ao processar texto:', error);
            displayError(error.message);
        } finally {
            setLoadingState(false);
        }
    }

    /**
     * Envia um arquivo para o endpoint /upload_arquivo.
     * @param {File} file - O arquivo (.txt ou .pdf) a ser enviado.
     */
    async function uploadFileToBackend(file) {
        setLoadingState(true);
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload_arquivo', {
                method: 'POST',
                body: formData, // O browser define o Content-Type como multipart/form-data
            });

            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.error || 'Erro desconhecido no servidor.');
            }

            displayResults(data.classificacao, data.resposta_sugerida);

        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            displayError(error.message);
        } finally {
            setLoadingState(false);
        }
    }

    // --- 4. Funções Auxiliares da UI ---

    /**
     * Ativa/desativa o estado de carregamento da UI.
     * @param {boolean} isLoading - Define se o estado de carregamento deve ser ativado.
     */
    function setLoadingState(isLoading) {
        processButton.disabled = isLoading;
        processButton.textContent = isLoading ? 'Processando... 🧠' : 'Processar Email';
        fileUploadInput.disabled = isLoading;

        // Esconde resultados e erros ao iniciar um novo processamento
        resultSection.classList.add('hidden');
        errorMessage.classList.add('hidden');
    }

    /**
     * Exibe os resultados da análise na UI.
     * @param {string} classification - A classificação ("Produtivo" ou "Improdutivo").
     * @param {string} suggestion - O texto da resposta sugerida.
     */
    function displayResults(classification, suggestion) {
        classificationResult.textContent = classification;
        suggestionResult.textContent = suggestion;
        
        // Define a cor com base na classificação
        if (classification.toLowerCase() === 'produtivo') {
            classificationResult.style.color = 'var(--success-color)';
        } else {
            classificationResult.style.color = 'var(--error-color)';
        }

        resultSection.classList.remove('hidden');
    }

    /**
     * Exibe uma mensagem de erro na UI.
     * @param {string} message - A mensagem de erro a ser exibida.
     */
    function displayError(message) {
        errorMessage.textContent = `Erro: ${message}`;
        errorMessage.classList.remove('hidden');
    }
});