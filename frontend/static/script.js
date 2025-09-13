// Configuração da API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Estado global da aplicação
let currentSessionId = null;
let isTyping = false;

// Elementos DOM
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');
const charCount = document.querySelector('.char-count');
const loadingOverlay = document.getElementById('loadingOverlay');

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Verificar se estamos na página de chat
    if (document.body.classList.contains('chat-page')) {
        initializeChatPage();
    } else {
        initializeHomePage();
    }
}

function initializeHomePage() {
    // Smooth scrolling para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Adicionar animações de entrada
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar elementos para animação
    document.querySelectorAll('.feature-card, .about-text, .about-stats').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Atualizar timestamp da mensagem de boas-vindas
    updateWelcomeTime();
}

function initializeChatPage() {
    // Configurar eventos do chat
    setupChatEvents();
    
    // Configurar modais
    setupModals();
    
    // Configurar ações rápidas
    setupQuickActions();
    
    // Atualizar timestamp da mensagem de boas-vindas
    updateWelcomeTime();
    
    // Verificar conexão com a API
    checkApiConnection();
}

function setupChatEvents() {
    // Evento de envio de mensagem
    sendBtn.addEventListener('click', sendMessage);
    
    // Evento de teclado
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Evento de input para habilitar/desabilitar botão
    messageInput.addEventListener('input', function() {
        const message = this.value.trim();
        sendBtn.disabled = message.length === 0;
        
        // Atualizar contador de caracteres
        if (charCount) {
            charCount.textContent = `${this.value.length}/1000`;
        }
        
        // Auto-resize do textarea
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

function setupModals() {
    // Modal de histórico
    const historyModal = document.getElementById('historyModal');
    const historyBtn = document.getElementById('historyBtn');
    const historyClose = historyModal?.querySelector('.modal-close');
    
    if (historyBtn && historyModal) {
        historyBtn.addEventListener('click', () => {
            loadChatHistory();
            historyModal.classList.add('show');
        });
    }
    
    if (historyClose) {
        historyClose.addEventListener('click', () => {
            historyModal.classList.remove('show');
        });
    }
    
    // Modal de exportação
    const exportModal = document.getElementById('exportModal');
    const exportBtn = document.getElementById('exportBtn');
    const exportClose = exportModal?.querySelector('.modal-close');
    
    if (exportBtn && exportModal) {
        exportBtn.addEventListener('click', () => {
            exportModal.classList.add('show');
        });
    }
    
    if (exportClose) {
        exportClose.addEventListener('click', () => {
            exportModal.classList.remove('show');
        });
    }
    
    // Botões de exportação
    const exportJSON = document.getElementById('exportJSON');
    const exportTXT = document.getElementById('exportTXT');
    
    if (exportJSON) {
        exportJSON.addEventListener('click', () => exportChat('json'));
    }
    
    if (exportTXT) {
        exportTXT.addEventListener('click', () => exportChat('txt'));
    }
    
    // Botão de limpar conversa
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearChat);
    }
    
    // Fechar modal clicando fora
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
}

function setupQuickActions() {
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const question = this.getAttribute('data-question');
            if (question) {
                messageInput.value = question;
                messageInput.dispatchEvent(new Event('input'));
                sendMessage();
            }
        });
    });
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isTyping) return;
    
    // Adicionar mensagem do usuário
    addMessage(message, 'user');
    
    // Limpar input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    sendBtn.disabled = true;
    if (charCount) {
        charCount.textContent = '0/1000';
    }
    
    // Mostrar indicador de digitação
    showTypingIndicator();
    
    try {
        // Fazer requisição para a API
        const response = await fetch(`${API_BASE_URL}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                session_id: currentSessionId
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Atualizar session ID
        currentSessionId = data.session_id;
        
        // Ocultar indicador de digitação
        hideTypingIndicator();
        
        // Adicionar resposta do assistente
        addMessage(data.response, 'assistant');
        
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        hideTypingIndicator();
        addMessage('Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.', 'assistant', true);
    }
}

function addMessage(content, role, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    if (role === 'user') {
        avatar.innerHTML = '<i class="fas fa-user"></i>';
    } else {
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
    }
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = content;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageContent.appendChild(messageText);
    messageContent.appendChild(messageTime);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    if (isError) {
        messageContent.style.background = '#ffebee';
        messageContent.style.color = '#c62828';
        messageContent.style.border = '1px solid #ffcdd2';
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    isTyping = true;
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    isTyping = false;
    typingIndicator.style.display = 'none';
}

async function loadChatHistory() {
    if (!currentSessionId) {
        const historyList = document.getElementById('historyList');
        if (historyList) {
            historyList.innerHTML = '<p>Nenhuma conversa encontrada.</p>';
        }
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/history/${currentSessionId}`);
        if (response.ok) {
            const messages = await response.json();
            displayChatHistory(messages);
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

function displayChatHistory(messages) {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    if (messages.length === 0) {
        historyList.innerHTML = '<p>Nenhuma mensagem encontrada.</p>';
        return;
    }
    
    historyList.innerHTML = messages.map(msg => `
        <div class="history-item">
            <h4>${msg.role === 'user' ? 'Você' : 'Medicalink AI'}</h4>
            <p>${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}</p>
            <small>${new Date(msg.timestamp).toLocaleString('pt-BR')}</small>
        </div>
    `).join('');
}

async function exportChat(format) {
    if (!currentSessionId) {
        alert('Nenhuma conversa para exportar.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/export/${currentSessionId}`);
        if (!response.ok) {
            throw new Error('Erro ao exportar conversa');
        }
        
        const data = await response.json();
        
        if (format === 'json') {
            downloadFile(JSON.stringify(data, null, 2), 'conversa.json', 'application/json');
        } else if (format === 'txt') {
            const txtContent = data.messages.map(msg => 
                `${msg.role === 'user' ? 'Você' : 'Medicalink AI'}: ${msg.content}`
            ).join('\n\n');
            downloadFile(txtContent, 'conversa.txt', 'text/plain');
        }
        
        // Mostrar preview
        const exportPreview = document.getElementById('exportPreview');
        const exportContent = document.getElementById('exportContent');
        if (exportPreview && exportContent) {
            exportContent.textContent = format === 'json' 
                ? JSON.stringify(data, null, 2)
                : data.messages.map(msg => 
                    `${msg.role === 'user' ? 'Você' : 'Medicalink AI'}: ${msg.content}`
                ).join('\n\n');
            exportPreview.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Erro ao exportar:', error);
        alert('Erro ao exportar conversa. Tente novamente.');
    }
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearChat() {
    if (confirm('Tem certeza que deseja limpar a conversa atual?')) {
        chatMessages.innerHTML = `
            <div class="message assistant-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">
                        Olá! Sou o Medicalink AI, seu assistente médico virtual. Como posso ajudá-lo hoje? 
                        Lembre-se de que sou apenas para fins educacionais e não substituo a consulta médica profissional.
                    </div>
                    <div class="message-time" id="welcomeTime"></div>
                </div>
            </div>
        `;
        currentSessionId = null;
        updateWelcomeTime();
    }
}

function updateWelcomeTime() {
    const welcomeTime = document.getElementById('welcomeTime');
    if (welcomeTime) {
        welcomeTime.textContent = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

async function checkApiConnection() {
    try {
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
        if (response.ok) {
            console.log('✅ Conexão com API estabelecida');
        } else {
            console.warn('⚠️ API não está respondendo corretamente');
        }
    } catch (error) {
        console.error('❌ Erro ao conectar com API:', error);
        showApiError();
    }
}

function showApiError() {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'message assistant-message';
    errorMessage.style.background = '#ffebee';
    errorMessage.style.border = '1px solid #ffcdd2';
    errorMessage.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="message-content">
            <div class="message-text">
                <strong>Erro de Conexão:</strong> Não foi possível conectar com o servidor. 
                Verifique se o backend está rodando em http://127.0.0.1:8000
            </div>
            <div class="message-time">${new Date().toLocaleTimeString('pt-BR')}</div>
        </div>
    `;
    
    chatMessages.appendChild(errorMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Utilitários
function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Função para scroll suave
function smoothScrollTo(element, offset = 0) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
    });
}

// Função para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Exportar funções para uso global
window.MedicalinkApp = {
    sendMessage,
    addMessage,
    exportChat,
    clearChat,
    showLoading,
    hideLoading
};
