// Mobile menu functionality
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.querySelector('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');
    
    if (mobileMenu.style.display === 'none' || mobileMenu.style.display === '') {
        mobileMenu.style.display = 'block';
        menuIcon.style.display = 'none';
        closeIcon.style.display = 'block';
    } else {
        mobileMenu.style.display = 'none';
        menuIcon.style.display = 'block';
        closeIcon.style.display = 'none';
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.querySelector('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');
    
    mobileMenu.style.display = 'none';
    menuIcon.style.display = 'block';
    closeIcon.style.display = 'none';
}

// Search functionality
function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) return;
    
    // Redirect to login when trying to search
    alert('Você precisa fazer login para usar a pesquisa. Redirecionando...');
    console.log('Redirecionando para login...', { query });
    handleLogin();
}

// Login functionality
function handleLogin() {
    alert('Sistema de login em desenvolvimento. Conecte ao Supabase para implementar autenticação real.');
    console.log('Login button clicked - redirect to authentication');
}

// Read more functionality
function handleReadMore() {
    alert('Você precisa fazer login para ler artigos completos. Redirecionando...');
    console.log('Read more clicked - redirect to login');
    handleLogin();
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
            // Close mobile menu if open
            closeMobileMenu();
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
        
        if (mobileMenu.style.display === 'block' && 
            !mobileMenu.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Handle form submission
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
    
    // Add keyboard accessibility
    document.addEventListener('keydown', function(e) {
        // Close mobile menu with Escape key
        if (e.key === 'Escape') {
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu.style.display === 'block') {
                closeMobileMenu();
            }
        }
        
        // Submit search with Enter key
        if (e.key === 'Enter' && document.activeElement === document.getElementById('searchInput')) {
            e.preventDefault();
            handleSearch(e);
        }
    });
});