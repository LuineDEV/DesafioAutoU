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

    /**
     * Envia o texto do email para o endpoint /processar_email.
     */
    async function sendDataToBackend(text) {
        setLoadingState(true); // <-- Esconde os resultados antigos
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
            displayResults(data.classificacao, data.resposta_sugerida); // <-- Mostra os novos resultados
        } catch (error) {
            console.error('Erro ao processar texto:', error);
            displayError(error.message);
        } finally {
            setLoadingState(false); // <-- Apenas reativa os botões
        }
    }

    /**
     * Envia um arquivo para o endpoint /upload_arquivo.
     */
    async function uploadFileToBackend(file) {
        setLoadingState(true); // <-- Esconde os resultados antigos
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/upload_arquivo', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.error || 'Erro desconhecido no servidor.');
            }
            displayResults(data.classificacao, data.resposta_sugerida); // <-- Mostra os novos resultados
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            displayError(error.message);
        } finally {
            setLoadingState(false); // <-- Apenas reativa os botões
        }
    }


    /**
     * Ativa/desativa o estado de carregamento da UI.
     */
    function setLoadingState(isLoading) {
        processButton.disabled = isLoading;
        processButton.textContent = isLoading ? 'Processando... 🧠' : 'Processar Email';
        fileUploadInput.disabled = isLoading;

        if (isLoading) {
            resultSection.classList.add('hidden');
            errorMessage.classList.add('hidden');
        }
    }
    /**
     * Exibe os resultados da análise na UI.
     */
    function displayResults(classification, suggestion) {
        classificationResult.textContent = classification;
        suggestionResult.textContent = suggestion;
        
        if (classification.toLowerCase() === 'produtivo') {
            classificationResult.style.color = 'var(--success-color)';
        } else {
            classificationResult.style.color = 'var(--error-color)';
        }

        resultSection.classList.remove('hidden'); // <-- Mostra a seção
        
        // Rola a página suavemente para a seção de resultados
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Exibe uma mensagem de erro na UI.
     */
    function displayError(message) {
        errorMessage.textContent = `Erro: ${message}`;
        errorMessage.classList.remove('hidden'); // <-- Mostra a seção de erro
        errorMessage.scrollIntoView({ behavior: 'smooth' }); // Rola para o erro
    }
});