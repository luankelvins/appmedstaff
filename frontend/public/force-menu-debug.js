// Script para forçar debug do menu
console.log('🔍 Script de debug do menu carregado');

// Aguardar o React carregar
setTimeout(() => {
    console.log('🔍 Verificando estado do menu...');
    
    // Tentar acessar o estado do React
    const reactRoot = document.querySelector('#root');
    if (reactRoot && reactRoot._reactInternalFiber) {
        console.log('⚛️ React detectado');
    }
    
    // Verificar localStorage
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    console.log('🔑 Token:', !!token);
    console.log('👤 User Data:', !!userData);
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            console.log('👤 Usuário completo:', user);
            console.log('🔑 Permissões do usuário:', user.permissions);
            console.log('👔 Role do usuário:', user.role);
        } catch (e) {
            console.error('❌ Erro ao parsear userData:', e);
        }
    }
    
    // Verificar se o menu está sendo renderizado
    const sidebar = document.querySelector('aside');
    if (sidebar) {
        console.log('📋 Sidebar encontrada');
        const menuItems = sidebar.querySelectorAll('li');
        console.log('📋 Número de itens no menu:', menuItems.length);
        
        menuItems.forEach((item, index) => {
            const link = item.querySelector('a');
            const button = item.querySelector('button');
            if (link) {
                console.log(`📋 Item ${index} (link):`, link.textContent.trim(), 'href:', link.href);
            } else if (button) {
                console.log(`📋 Item ${index} (button):`, button.textContent.trim());
            }
        });
    } else {
        console.log('❌ Sidebar não encontrada');
    }
    
}, 2000);

// Verificar novamente após 5 segundos
setTimeout(() => {
    console.log('🔍 Segunda verificação do menu...');
    
    const sidebar = document.querySelector('aside');
    if (sidebar) {
        const sections = sidebar.querySelectorAll('nav > div');
        console.log('📋 Número de seções no menu:', sections.length);
        
        sections.forEach((section, index) => {
            const title = section.querySelector('h3');
            const items = section.querySelectorAll('li');
            console.log(`📋 Seção ${index}:`, title ? title.textContent.trim() : 'Sem título', 'Items:', items.length);
        });
    }
}, 5000);