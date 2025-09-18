// Estado global da aplicação
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
            // Adicionar efeito visual de clique
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            const question = this.getAttribute('data-question');
            if (question) {
                messageInput.value = question;
                messageInput.dispatchEvent(new Event('input'));
                
                // Adicionar efeito de destaque na mensagem
                setTimeout(() => {
                    sendMessage();
                }, 200);
            }
        });
        
        // Efeito de hover
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isTyping) return;
    
    // Adicionar efeito de loading no botão
    sendBtn.classList.add('loading');
    sendBtn.disabled = true;
    
    // Adicionar mensagem do usuário
    addMessage(message, 'user');
    
    // Limpar input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    if (charCount) {
        charCount.textContent = '0/1000';
    }
    
    // Mostrar indicador de digitação
    showTypingIndicator();
    
    // Simular delay de resposta
    setTimeout(() => {
        hideTypingIndicator();
        
        // Resposta automática para mensagens pré-programadas
        const preprogrammedResponse = "Qual sua função? Minha função como IA é auxiliar nos estudos de profissionais da área da saúde 🩺, tirando dúvidas, resumindo artigos 📚 e descomplicando matérias 💡!";
        addMessage(preprogrammedResponse, 'assistant');
        
        // Mostrar feedback de sucesso
        showFeedback('Mensagem enviada com sucesso!', 'success');
        
        // Remover efeito de loading
        sendBtn.classList.remove('loading');
        sendBtn.disabled = false;
    }, 1500);
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
    
    // Adicionar efeito de destaque para mensagens importantes
    if (content.includes('🩺') || content.includes('📚') || content.includes('💡')) {
        messageContent.classList.add('highlight');
    }
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll suave para a nova mensagem
    setTimeout(() => {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
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
    const historyList = document.getElementById('historyList');
    if (historyList) {
        historyList.innerHTML = '<p>Nenhuma conversa encontrada.</p>';
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
    const messages = Array.from(document.querySelectorAll('.message')).map(msg => {
        const role = msg.classList.contains('user-message') ? 'user' : 'assistant';
        const content = msg.querySelector('.message-text').textContent;
        const timestamp = msg.querySelector('.message-time').textContent;
        return { role, content, timestamp };
    });
    
    if (messages.length === 0) {
        alert('Nenhuma conversa para exportar.');
        return;
    }
    
    if (format === 'json') {
        const data = { messages, exported_at: new Date().toISOString() };
        downloadFile(JSON.stringify(data, null, 2), 'conversa.json', 'application/json');
    } else if (format === 'txt') {
        const txtContent = messages.map(msg => 
            `${msg.role === 'user' ? 'Você' : 'Medicalink AI'}: ${msg.content}`
        ).join('\n\n');
        downloadFile(txtContent, 'conversa.txt', 'text/plain');
    }
    
    // Mostrar preview
    const exportPreview = document.getElementById('exportPreview');
    const exportContent = document.getElementById('exportContent');
    if (exportPreview && exportContent) {
        const data = { messages, exported_at: new Date().toISOString() };
        exportContent.textContent = format === 'json' 
            ? JSON.stringify(data, null, 2)
            : messages.map(msg => 
                `${msg.role === 'user' ? 'Você' : 'Medicalink AI'}: ${msg.content}`
            ).join('\n\n');
        exportPreview.style.display = 'block';
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

// Função para adicionar feedback visual
function showFeedback(message, type = 'success') {
    const feedback = document.createElement('div');
    feedback.className = `feedback feedback-${type}`;
    feedback.textContent = message;
    
    // Estilos para o feedback
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--color-secondary)' : '#ff6b6b'};
        color: white;
        padding: var(--spacing-md) var(--spacing-lg);
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: var(--z-tooltip);
        animation: slideInRight 0.3s ease-out;
        font-weight: var(--font-weight-medium);
    `;
    
    document.body.appendChild(feedback);
    
    // Remover após 3 segundos
    setTimeout(() => {
        feedback.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }, 3000);
}

// Adicionar animações CSS para feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);


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
