// ============================================
// DADOS INICIAIS (Simulando Banco de Dados)
// ============================================

// Usuários pré-cadastrados
const USUARIOS = {
    admin: {
        id: 'admin',
        nome: 'Administrador',
        email: 'admin@apoteose.com',
        senha: 'admin123',
        tipo: 'admin',
        foto: ''
    },
    normal: {
        id: 'normal',
        nome: 'João Silva',
        email: 'joao@email.com',
        senha: '123456',
        tipo: 'normal',
        foto: ''
    }
};

// Personagem: MAX (apenas 1 personagem)
const PERSONAGEM_MAX = {
    id: 'p_max',
    nome: 'Max',
    classe: 'Especialista',
    nivel: 10,
    gnivel: 1,
    campanha: 'Chakal',
    img: '',
    dono: 'normal',
    pv_atual: 45,
    pv_max: 45,
    ed_atual: 30,
    ed_max: 30,
    eh_atual: 25,
    eh_max: 25,
    vig_atual: 6,
    vig_esquivas: 2,
    pos_grande: 3,
    pos_pequena: 2,
    lembrancas: 12,
    divinity_val: 50,
    carga_max: 20,
    senha: '',
    anotacoes: 'Especialista em conhecimento e magia.',
    atributos: {
        'Força': 2, 'Destreza': 4, 'Compostura': 3, 'Fé': 5,
        'Inteligência': 4, 'Carisma': 2, 'Mente': 4, 'Corpo': 3, 'Alma': 5
    },
    defesa: { esquiva_natural: 2, esquiva_escudo: 0, esquiva_armadura: 2, esquiva_itens: 1, esquiva_tecnicas: 1, esquiva_reflexos: 2 },
    pericias: {},
    inventario: {
        'item1': { nome: 'Poção de Cura', peso: 0.5, tipo: 'item', desc: 'Restaura 2d6+4 PV.' },
        'item2': { nome: 'Cajado Arcano', peso: 1.0, tipo: 'arma', dano: '1d6+2', teste: '1d20+6', critico: '20/x2', desc: 'Cajado mágico com ponta de cristal.' }
    },
    habilidadesPassivas: [
        { nome: 'Conhecimento Arcano', categoria: 'Maestria', desc: '+3 em testes de Conhecimento.', expandida: false }
    ],
    habilidadesAtivas: [
        { nome: 'Bola de Fogo', tipo: 'Magia', ativa: true, arcanos: 'Fogo', forma: 'Projétil', funcao: 'Dano', efeito: 'Explosão', duracao: 'Instantâneo', alvos: 'Área', custo: '5 ED', amplificadores: '+1d6', concedido: '', dados: '4d6', dano: '4d6+3', desc: 'Lança uma bola de fogo.', expandida: false }
    ],
    resistencias: [
        { tipo: 'Fogo', desc: 'Resistência +5' },
        { tipo: 'Veneno', desc: 'Resistência +3' }
    ]
};

// Campanhas
const CAMPANHAS = {
    'c_chakal': {
        id: 'c_chakal',
        nome: 'Chakal',
        desc: 'Uma campanha pública onde Max, o Especialista, explora os mistérios de Chakal.',
        img: '',
        privada: false,
        senha: '',
        link: 'convite-chakal-xyz',
        dono: 'admin',
        participantes: ['normal']
    },
    'c_privada': {
        id: 'c_privada',
        nome: 'Reino Proibido',
        desc: 'Campanha privada - apenas para demonstração de acesso negado.',
        img: '',
        privada: true,
        senha: 'secreto123',
        link: 'convite-reino-abc',
        dono: 'admin',
        participantes: []
    }
};

// ============================================
// ESTADO DA APLICAÇÃO
// ============================================

let estado = {
    usuario: null,
    tentativas: 0,
    campanhas: {},
    personagens: {},
    campanhaSelecionada: null,
    modalCampanhaId: null,
    campanhaEditandoId: null  // Para o modal de edição
};

// ============================================
// INICIALIZAÇÃO
// ============================================

function init() {
    carregarDados();
    
    const sessao = localStorage.getItem('apoteose_sessao');
    if (sessao) {
        try {
            const dados = JSON.parse(sessao);
            if (dados.usuario) {
                estado.usuario = dados.usuario;
                entrarNaSessao();
                return;
            }
        } catch (e) {}
    }
    
    mostrarTela('tela-login');
}

function carregarDados() {
    // Campanhas
    const campanhasSalvas = localStorage.getItem('apoteose_campanhas');
    if (campanhasSalvas) {
        try { estado.campanhas = JSON.parse(campanhasSalvas); }
        catch (e) { estado.campanhas = { ...CAMPANHAS }; }
    } else {
        estado.campanhas = { ...CAMPANHAS };
        salvarCampanhas();
    }
    
    // Personagens - apenas MAX
    const personagensSalvos = localStorage.getItem('apoteose_personagens');
    if (personagensSalvos) {
        try { estado.personagens = JSON.parse(personagensSalvos); }
        catch (e) { estado.personagens = { 'p_max': { ...PERSONAGEM_MAX } }; }
    } else {
        estado.personagens = { 'p_max': { ...PERSONAGEM_MAX } };
        salvarPersonagens();
    }
    
    // Garante que MAX existe
    if (!estado.personagens['p_max']) {
        estado.personagens['p_max'] = { ...PERSONAGEM_MAX };
        salvarPersonagens();
    }
}

function salvarCampanhas() {
    localStorage.setItem('apoteose_campanhas', JSON.stringify(estado.campanhas));
}

function salvarPersonagens() {
    localStorage.setItem('apoteose_personagens', JSON.stringify(estado.personagens));
}

function salvarSessao() {
    localStorage.setItem('apoteose_sessao', JSON.stringify({ usuario: estado.usuario }));
}

// ============================================
// TELAS
// ============================================

function mostrarTela(id) {
    document.querySelectorAll('.tela').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function switchMainTab(tab) {
    document.querySelectorAll('.main-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.main-nav .nav-btn').forEach(el => el.classList.remove('active'));
    
    const tabMap = {
        'personagens': 'tab-personagens',
        'campanhas': 'tab-campanhas',
        'party': 'tab-party',
        'admin': 'tab-admin'
    };
    
    const target = document.getElementById(tabMap[tab]);
    if (target) target.classList.add('active');
    
    document.querySelectorAll('.main-nav .nav-btn').forEach(btn => {
        if (btn.id === 'nav-' + tab) btn.classList.add('active');
    });
}

// ============================================
// LOGIN
// ============================================

function handleLogin() {
    const tipo = document.getElementById('login-tipo').value;
    const usuario = document.getElementById('login-usuario').value.trim();
    const senha = document.getElementById('login-senha').value.trim();
    const msg = document.getElementById('login-mensagem');
    
    if (estado.tentativas === 0) {
        estado.tentativas++;
        msg.className = 'login-mensagem erro';
        msg.innerHTML = '❌ Falha na autenticação. Tente novamente. (Erro forçado para demonstração)';
        return;
    }
    
    estado.tentativas = 0;
    
    if (tipo === 'anonimo') {
        entrarComoAnonimo();
        return;
    }
    
    const userData = USUARIOS[tipo];
    if (!userData) {
        msg.className = 'login-mensagem erro';
        msg.innerHTML = '❌ Tipo de usuário inválido.';
        return;
    }
    
    if (usuario !== userData.id && usuario !== userData.nome) {
        msg.className = 'login-mensagem erro';
        msg.innerHTML = '❌ Usuário incorreto.';
        return;
    }
    
    if (senha !== userData.senha) {
        msg.className = 'login-mensagem erro';
        msg.innerHTML = '❌ Senha incorreta.';
        return;
    }
    
    msg.className = 'login-mensagem sucesso';
    msg.innerHTML = '✅ Login realizado com sucesso!';
    
    estado.usuario = {
        id: userData.id,
        nome: userData.nome,
        tipo: userData.tipo,
        email: userData.email,
        foto: userData.foto
    };
    
    salvarSessao();
    entrarNaSessao();
}

function entrarComoAnonimo() {
    estado.usuario = {
        id: 'anonimo',
        nome: 'Anônimo',
        tipo: 'anonimo',
        email: '',
        foto: ''
    };
    salvarSessao();
    entrarNaSessao();
}

function entrarNaSessao() {
    const user = estado.usuario;
    
    document.getElementById('usuario-nome').textContent = user.nome;
    const badge = document.getElementById('usuario-tipo-badge');
    
    if (user.tipo === 'admin') {
        badge.textContent = 'Admin';
        badge.className = 'badge-admin';
        document.getElementById('nav-admin').style.display = 'flex';
        document.getElementById('btn-novo-personagem').style.display = 'none';
        document.getElementById('btn-perfil').style.display = 'inline-flex';
        document.getElementById('nav-personagens-label').textContent = 'Personagens';
        document.getElementById('personagens-titulo').textContent = 'Personagens';
    } else if (user.tipo === 'anonimo') {
        badge.textContent = 'Anônimo';
        badge.className = 'badge-anonimo';
        document.getElementById('nav-admin').style.display = 'none';
        document.getElementById('btn-novo-personagem').style.display = 'none';
        document.getElementById('btn-perfil').style.display = 'none';
        document.getElementById('nav-personagens-label').textContent = 'Personagens Públicos';
        document.getElementById('personagens-titulo').textContent = 'Personagens Públicos';
    } else {
        badge.textContent = 'Normal';
        badge.className = 'badge-normal';
        document.getElementById('nav-admin').style.display = 'none';
        document.getElementById('btn-novo-personagem').style.display = 'inline-flex';
        document.getElementById('btn-perfil').style.display = 'inline-flex';
        document.getElementById('nav-personagens-label').textContent = 'Meus Personagens';
        document.getElementById('personagens-titulo').textContent = 'Meus Personagens';
    }
    
    document.getElementById('perfil-usuario').value = user.nome || '';
    document.getElementById('perfil-email').value = user.email || '';
    document.getElementById('perfil-avatar-img').src = user.foto || '';
    document.getElementById('perfil-foto').value = user.foto || '';
    
    mostrarTela('tela-principal');
    renderizarFiltros();
    renderizarPersonagens();
    renderizarCampanhas();
    renderizarParty();
    renderizarAdmin();
    switchMainTab('personagens');
}

function handleLogout() {
    estado.usuario = null;
    estado.campanhaSelecionada = null;
    localStorage.removeItem('apoteose_sessao');
    document.getElementById('login-usuario').value = '';
    document.getElementById('login-senha').value = '';
    document.getElementById('login-mensagem').innerHTML = '';
    document.getElementById('login-mensagem').className = 'login-mensagem';
    estado.tentativas = 0;
    mostrarTela('tela-login');
}

// ============================================
// RECUPERAÇÃO DE SENHA
// ============================================

function handleRecuperarSenha() {
    const email = document.getElementById('recuperar-email').value.trim();
    if (!email) {
        mostrarToast('Por favor, informe um e-mail.', 'error');
        return;
    }
    mostrarToast('📧 E-mail de recuperação enviado para ' + email + ' com sucesso!', 'success');
    setTimeout(() => mostrarTela('tela-login'), 2000);
}

// ============================================
// PERFIL
// ============================================

function atualizarPerfil() {
    if (!estado.usuario) return;
    const nome = document.getElementById('perfil-usuario').value.trim();
    const email = document.getElementById('perfil-email').value.trim();
    const foto = document.getElementById('perfil-foto').value.trim();
    
    estado.usuario.nome = nome || estado.usuario.nome;
    estado.usuario.email = email || estado.usuario.email;
    estado.usuario.foto = foto || estado.usuario.foto;
    
    document.getElementById('usuario-nome').textContent = estado.usuario.nome;
    document.getElementById('perfil-avatar-img').src = estado.usuario.foto;
    
    if (USUARIOS[estado.usuario.id]) {
        USUARIOS[estado.usuario.id].nome = estado.usuario.nome;
        USUARIOS[estado.usuario.id].email = estado.usuario.email;
        USUARIOS[estado.usuario.id].foto = estado.usuario.foto;
    }
    
    salvarSessao();
    mostrarToast('Perfil atualizado!', 'success');
}

function alterarSenha() {
    const atual = document.getElementById('perfil-senha-atual').value.trim();
    const nova = document.getElementById('perfil-senha-nova').value.trim();
    const confirm = document.getElementById('perfil-senha-confirm').value.trim();
    
    if (!atual || !nova || !confirm) {
        mostrarToast('Preencha todos os campos de senha.', 'error');
        return;
    }
    
    if (USUARIOS[estado.usuario.id] && USUARIOS[estado.usuario.id].senha !== atual) {
        mostrarToast('Senha atual incorreta.', 'error');
        return;
    }
    
    if (nova !== confirm) {
        mostrarToast('As novas senhas não coincidem.', 'error');
        return;
    }
    
    if (nova.length < 4) {
        mostrarToast('A nova senha deve ter pelo menos 4 caracteres.', 'error');
        return;
    }
    
    if (USUARIOS[estado.usuario.id]) {
        USUARIOS[estado.usuario.id].senha = nova;
    }
    
    document.getElementById('perfil-senha-atual').value = '';
    document.getElementById('perfil-senha-nova').value = '';
    document.getElementById('perfil-senha-confirm').value = '';
    
    mostrarToast('Senha alterada com sucesso!', 'success');
}

// ============================================
// FILTROS
// ============================================

function renderizarFiltros() {
    const container = document.getElementById('campaign-filters');
    if (!container) return;
    
    const user = estado.usuario;
    let campanhas = [];
    
    if (user.tipo === 'anonimo') {
        campanhas = Object.values(estado.campanhas)
            .filter(c => !c.privada)
            .map(c => c.nome);
    } else {
        campanhas = Object.values(estado.campanhas)
            .map(c => c.nome);
    }
    
    campanhas = [...new Set(campanhas)].sort();
    
    container.innerHTML = campanhas.map(camp => {
        const campData = Object.values(estado.campanhas).find(c => c.nome === camp);
        const isPrivada = campData?.privada || false;
        return `
            <button class="filter-btn ${estado.campanhaSelecionada === camp ? 'active' : ''} ${isPrivada ? 'privada' : ''}" 
                    onclick="selecionarCampanha('${camp}')">
                ${camp} ${isPrivada ? '🔒' : ''}
            </button>
        `;
    }).join('');
    
    if (campanhas.length === 0) {
        container.innerHTML = '<span style="color:var(--text-dim); font-size:0.85rem;">Nenhuma campanha disponível</span>';
    }
}

function selecionarCampanha(nome) {
    const camp = Object.values(estado.campanhas).find(c => c.nome === nome);
    if (!camp) return;
    
    if (camp.privada && estado.usuario.tipo !== 'admin') {
        abrirModalPrivado(camp.id);
        return;
    }
    
    estado.campanhaSelecionada = nome;
    renderizarFiltros();
    renderizarParty();
    switchMainTab('party');
}

// ============================================
// MODAL PRIVADO
// ============================================

let campanhaPrivadaId = null;

function abrirModalPrivado(campId) {
    campanhaPrivadaId = campId;
    document.getElementById('modal-senha-campanha').value = '';
    document.getElementById('modal-senha-erro').style.display = 'none';
    document.getElementById('modal-privado').classList.add('active');
}

function fecharModalPrivado() {
    document.getElementById('modal-privado').classList.remove('active');
    campanhaPrivadaId = null;
}

function confirmarSenhaPrivada() {
    const senha = document.getElementById('modal-senha-campanha').value.trim();
    const camp = estado.campanhas[campanhaPrivadaId];
    
    if (!camp) {
        mostrarToast('Campanha não encontrada.', 'error');
        fecharModalPrivado();
        return;
    }
    
    if (senha === camp.senha) {
        fecharModalPrivado();
        estado.campanhaSelecionada = camp.nome;
        renderizarFiltros();
        renderizarParty();
        switchMainTab('party');
        mostrarToast('✅ Acesso concedido à campanha ' + camp.nome + '!', 'success');
    } else {
        document.getElementById('modal-senha-erro').style.display = 'block';
    }
}

// ============================================
// PERSONAGENS
// ============================================

function criarPersonagem() {
    if (estado.usuario.tipo === 'anonimo') {
        mostrarToast('Anônimos não podem criar personagens.', 'error');
        return;
    }
    mostrarToast('Criação de personagens desativada para demonstração.', 'info');
}

function renderizarPersonagens() {
    const container = document.getElementById('lista-personagens');
    const user = estado.usuario;
    
    let personagens = Object.values(estado.personagens);
    
    if (user.tipo === 'anonimo') {
        const campPublicas = Object.values(estado.campanhas)
            .filter(c => !c.privada)
            .map(c => c.nome);
        personagens = personagens.filter(p => campPublicas.includes(p.campanha));
    } else if (user.tipo === 'admin') {
        personagens = [];
    } else {
        personagens = personagens.filter(p => p.dono === user.id);
    }
    
    if (personagens.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; color:var(--text-dim); padding:40px;">
                <i class="ph ph-user" style="font-size:3rem; display:block; margin-bottom:10px;"></i>
                <p>${user.tipo === 'anonimo' ? 'Nenhum personagem público disponível.' : 'Nenhum personagem encontrado.'}</p>
                ${user.tipo === 'normal' ? '<p style="font-size:0.85rem;">Você tem o personagem Max na campanha Chakal.</p>' : ''}
            </div>
        `;
        return;
    }
    
    container.innerHTML = personagens.map(p => `
        <div class="card" onclick="abrirFicha('${p.id}')">
            <img src="${p.img || ''}" onerror="this.src=''">
            <h4>${p.nome}</h4>
            <p>${p.classe} - Nv. ${p.nivel}</p>
            <small style="color:var(--text-dim);">${p.campanha || 'Sem campanha'}</small>
            <div class="card-actions">
                ${p.dono === user.id || user.tipo === 'admin' ? `
                    <button onclick="event.stopPropagation(); abrirFicha('${p.id}')">
                        <i class="ph ph-eye"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function abrirFicha(id) {
    const p = estado.personagens[id];
    if (!p) {
        mostrarToast('Personagem não encontrado.', 'error');
        return;
    }
    
    if (estado.usuario.tipo === 'admin') {
        window.location.href = `ficha.html?id=${id}`;
        return;
    }
    
    if (estado.usuario.tipo === 'anonimo') {
        mostrarToast('Anônimos não podem acessar fichas de personagem.', 'error');
        return;
    }
    
    if (p.dono === estado.usuario.id) {
        window.location.href = `ficha.html?id=${id}`;
    } else {
        mostrarToast('Você não tem permissão para acessar esta ficha.', 'error');
    }
}

// ============================================
// CAMPANHAS
// ============================================

function renderizarCampanhas() {
    const container = document.getElementById('lista-campanhas');
    const user = estado.usuario;
    
    let campanhas = [];
    
    if (user.tipo === 'anonimo') {
        campanhas = Object.values(estado.campanhas).filter(c => !c.privada);
    } else {
        campanhas = Object.values(estado.campanhas);
    }
    
    if (campanhas.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; color:var(--text-dim); padding:40px;">
                <i class="ph ph-flag" style="font-size:3rem; display:block; margin-bottom:10px;"></i>
                <p>${user.tipo === 'anonimo' ? 'Nenhuma campanha pública disponível.' : 'Nenhuma campanha disponível.'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = campanhas.map(c => {
        const podeAbrir = !c.privada || user.tipo === 'admin';
        return `
            <div class="card" onclick="${podeAbrir ? `acessarCampanha('${c.id}')` : `abrirModalPrivado('${c.id}')`}" 
                 style="${c.privada && user.tipo !== 'admin' ? 'opacity:0.7;' : ''}">
                <img src="${c.img || ''}" onerror="this.src=''">
                <h4>${c.nome}</h4>
                <p style="font-size:0.8rem; color:var(--text-dim);">${c.desc || ''}</p>
                <span class="card-badge ${c.privada ? 'privada' : 'publica'}">
                    ${c.privada ? '🔒 Privada' : '🌍 Pública'}
                </span>
                ${c.privada ? '<small style="display:block; margin-top:5px; color:var(--accent-red);">Requer senha</small>' : ''}
                <div class="card-actions">
                    <button onclick="event.stopPropagation(); ${podeAbrir ? `acessarCampanha('${c.id}')` : `abrirModalPrivado('${c.id}')`}">
                        <i class="ph ph-eye"></i> Ver Party
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function acessarCampanha(id) {
    const camp = estado.campanhas[id];
    if (!camp) return;
    
    estado.campanhaSelecionada = camp.nome;
    renderizarFiltros();
    renderizarParty();
    switchMainTab('party');
    mostrarToast(`📜 Visualizando campanha: ${camp.nome}`, 'info');
}

// ============================================
// PARTY
// ============================================

function atualizarVisibilidadeNavParty() {
    const navParty = document.getElementById('nav-party');
    if (!navParty) return;
    navParty.style.display = estado.campanhaSelecionada ? 'flex' : 'none';
}

function renderizarParty() {
    atualizarVisibilidadeNavParty();

    const container = document.getElementById('gm-body');
    const nomeDisplay = document.getElementById('party-campanha-nome');
    
    if (!estado.campanhaSelecionada) {
        nomeDisplay.textContent = 'Nenhuma campanha selecionada';
        container.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-dim); padding:20px;">Selecione uma campanha para ver a party.</td></tr>';
        // Se a aba Party estava aberta e a campanha foi desselecionada, volta para Personagens
        const tabPartyAtiva = document.getElementById('tab-party')?.classList.contains('active');
        if (tabPartyAtiva) switchMainTab('personagens');
        return;
    }
    
    const camp = Object.values(estado.campanhas).find(c => c.nome === estado.campanhaSelecionada);
    if (!camp) {
        nomeDisplay.textContent = 'Campanha não encontrada';
        container.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-dim); padding:20px;">Campanha não encontrada.</td></tr>';
        return;
    }
    
    if (camp.privada && estado.usuario.tipo !== 'admin') {
        const user = estado.usuario;
        if (user.tipo !== 'normal' || !camp.participantes || !camp.participantes.includes(user.id)) {
            abrirModalPrivado(camp.id);
            return;
        }
    }
    
    nomeDisplay.textContent = camp.nome + (camp.privada ? ' 🔒' : '');
    
    let personagens = Object.values(estado.personagens)
        .filter(p => p.campanha === camp.nome);
    
    personagens = personagens.filter(p => p.id === 'p_max');
    
    if (personagens.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-dim); padding:20px;">Nenhum personagem nesta campanha.</td></tr>';
        return;
    }
    
    const podeAbrirFicha = estado.usuario.tipo === 'admin' || estado.usuario.tipo === 'normal';
    
    container.innerHTML = personagens.map(p => {
        const pvAtual = parseInt(p.pv_atual) || 0;
        const pvMax = parseInt(p.pv_max) || 1;
        const edAtual = parseInt(p.ed_atual) || 0;
        const edMax = parseInt(p.ed_max) || 1;
        const ehAtual = parseInt(p.eh_atual) || 0;
        const ehMax = parseInt(p.eh_max) || 1;
        
        return `
            <tr>
                <td style="text-align:left;">
                    <strong>${p.nome}</strong>
                    <br><small style="color:var(--text-dim);">${p.classe} - Nv.${p.nivel}</small>
                </td>
                <td>
                    ${pvAtual}/${pvMax}
                    <div class="stat-bar"><div class="bar-fill" style="width:${Math.min(100, (pvAtual/pvMax)*100)}%; background:var(--accent-red);"></div></div>
                </td>
                <td>
                    ${edAtual}/${edMax}
                    <div class="stat-bar"><div class="bar-fill" style="width:${Math.min(100, (edAtual/edMax)*100)}%; background:var(--accent-yellow);"></div></div>
                </td>
                <td>
                    ${ehAtual}/${ehMax}
                    <div class="stat-bar"><div class="bar-fill" style="width:${Math.min(100, (ehAtual/ehMax)*100)}%; background:var(--accent-purple);"></div></div>
                </td>
                <td>
                    ${podeAbrirFicha ? `
                        <button onclick="abrirFicha('${p.id}')" style="background:var(--accent-purple); color:white; border:none; padding:4px 12px; border-radius:4px; cursor:pointer; font-size:0.8rem;">
                            <i class="ph ph-eye"></i> Ficha
                        </button>
                    ` : `
                        <span style="color:var(--text-dim); font-size:0.8rem;">🔒</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
    
    renderizarLogs();
}

function renderizarLogs() {
    const container = document.getElementById('roll-log');
    const logs = carregarLogs();
    
    if (logs.length === 0) {
        container.innerHTML = '<p style="color: #666; font-size: 0.8rem;">Aguardando dados...</p>';
        return;
    }
    
    container.innerHTML = '';
    const logsToShow = logs.slice(-20).reverse();
    
    logsToShow.forEach(log => {
        const rollItem = document.createElement('div');
        rollItem.className = 'roll-item';
        
        const nomePersonagem = log.personagem || "Personagem";
        const tipoRolagem = log.tipo || "Rolagem";
        const nomeRolagem = log.nome || tipoRolagem;
        const resultado = log.resultado || log.valor || "0";
        
        let displayTipo = nomeRolagem;
        let displayResultado = resultado;
        
        if (tipoRolagem === 'ataque_arma') {
            displayResultado = `ATQ: ${log.ataque || resultado} | DANO: ${log.dano || '0'}`;
        } else if (tipoRolagem === 'pericia' && log.detalhes) {
            displayResultado = `${resultado} (${log.detalhes.join(', ')})`;
        }
        
        let corBorda = '#9d4edd';
        if (tipoRolagem === 'ataque_arma') corBorda = '#ff4d4d';
        else if (tipoRolagem === 'pericia') corBorda = '#4dff88';
        else if (tipoRolagem?.toLowerCase().includes('teste')) corBorda = '#ffcc00';
        
        rollItem.style.borderLeft = `4px solid ${corBorda}`;
        
        rollItem.innerHTML = `
            <div style="display:flex; flex-direction:column; width:100%;">
                <div style="font-size:0.75rem; color:#ffcc00; font-weight:bold; text-transform:uppercase; margin-bottom:2px;">
                    ${nomePersonagem}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.8rem; color:#aaa;">${displayTipo}</span>
                    <span style="font-size:1rem; font-weight:bold; color:#fff;">${displayResultado}</span>
                </div>
                ${log.critico ? '<div style="font-size:0.7rem; background:rgba(255,77,77,0.2); color:#ff4d4d; font-weight:bold; padding:2px 6px; border-radius:3px; text-align:center; margin-top:2px;">CRÍTICO!</div>' : ''}
            </div>
        `;
        container.appendChild(rollItem);
    });
}

function carregarLogs() {
    try {
        const data = localStorage.getItem('apoteose_rolagens');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

// ============================================
// ADMIN
// ============================================

function renderizarAdmin() {
    const container = document.getElementById('lista-campanhas-admin');
    const user = estado.usuario;
    
    if (user.tipo !== 'admin') {
        container.innerHTML = `
            <div style="text-align:center; color:var(--text-dim); padding:40px;">
                <i class="ph ph-shield" style="font-size:3rem; display:block; margin-bottom:10px;"></i>
                <p>Apenas administradores podem acessar esta área.</p>
            </div>
        `;
        return;
    }
    
    const campanhas = Object.values(estado.campanhas);
    
    if (campanhas.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; color:var(--text-dim); padding:40px;">
                <p>Nenhuma campanha cadastrada.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = campanhas.map(c => `
        <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:8px; padding:15px 20px; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; transition:0.3s;">
            <div style="display:flex; align-items:center; gap:15px; flex-wrap:wrap;">
                <img src="${c.img || ''}" onerror="this.src=''" style="width:50px; height:50px; border-radius:8px; object-fit:cover;">
                <div>
                    <div style="font-weight:bold;">${c.nome}</div>
                    <div style="font-size:0.8rem; color:var(--text-dim);">
                        ${c.privada ? '🔒 Privada' : '🌍 Pública'}
                        ${c.senha ? ' | Senha: ' + c.senha : ''}
                        ${c.participantes ? ' | ' + c.participantes.length + ' participantes' : ''}
                    </div>
                </div>
            </div>
            <div style="display:flex; gap:8px;">
                <button onclick="abrirModalCampanha('${c.id}')" style="background:none; border:none; color:var(--accent-yellow); cursor:pointer; padding:6px 10px; border-radius:4px; transition:0.3s;">
                    <i class="ph ph-pencil"></i> Editar
                </button>
                <button onclick="estado.campanhaSelecionada='${c.nome}'; renderizarFiltros(); renderizarParty(); switchMainTab('party');" style="background:none; border:none; color:var(--accent-purple); cursor:pointer; padding:6px 10px; border-radius:4px; transition:0.3s;">
                    <i class="ph ph-eye"></i> Party
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// MODAL DE CAMPANHA (ADMIN)
// ============================================

function abrirModalCampanha(campanhaId = null) {
    estado.campanhaEditandoId = campanhaId;
    
    if (campanhaId) {
        const camp = estado.campanhas[campanhaId];
        if (!camp) {
            mostrarToast('Campanha não encontrada.', 'error');
            return;
        }
        
        document.getElementById('modal-campanha-titulo').textContent = 'Configurar Campanha';
        document.getElementById('campanha-nome').value = camp.nome || '';
        document.getElementById('campanha-img').value = camp.img || '';
        document.getElementById('campanha-desc').value = camp.desc || '';
        document.getElementById('campanha-privada').checked = camp.privada || false;
        document.getElementById('campanha-senha').value = camp.senha || '';
        document.getElementById('campanha-link').value = camp.link || '';
        document.getElementById('campanha-senha-field').style.display = camp.privada ? 'block' : 'none';
        document.getElementById('btn-apagar-campanha').style.display = 'inline-flex';
    } else {
        document.getElementById('modal-campanha-titulo').textContent = 'Nova Campanha';
        document.getElementById('campanha-nome').value = '';
        document.getElementById('campanha-img').value = '';
        document.getElementById('campanha-desc').value = '';
        document.getElementById('campanha-privada').checked = false;
        document.getElementById('campanha-senha').value = '';
        document.getElementById('campanha-link').value = '';
        document.getElementById('campanha-senha-field').style.display = 'none';
        document.getElementById('btn-apagar-campanha').style.display = 'none';
    }
    
    document.getElementById('modal-campanha').classList.add('active');
}

function fecharModalCampanha() {
    document.getElementById('modal-campanha').classList.remove('active');
    estado.campanhaEditandoId = null;
}

function toggleCampanhaSenha() {
    const privada = document.getElementById('campanha-privada').checked;
    document.getElementById('campanha-senha-field').style.display = privada ? 'block' : 'none';
}

function gerarLinkCampanha() {
    const id = estado.campanhaEditandoId || 'c' + Date.now();
    const link = 'convite-' + id + '-' + Math.random().toString(36).substr(2, 6);
    document.getElementById('campanha-link').value = link;
    mostrarToast('🔗 Link de convite gerado!', 'success');
}

function salvarCampanha() {
    const nome = document.getElementById('campanha-nome').value.trim();
    const img = document.getElementById('campanha-img').value.trim();
    const desc = document.getElementById('campanha-desc').value.trim();
    const privada = document.getElementById('campanha-privada').checked;
    const senha = document.getElementById('campanha-senha').value.trim();
    const link = document.getElementById('campanha-link').value.trim() || 'convite-' + Date.now().toString(36);
    
    if (!nome) {
        mostrarToast('Por favor, informe o nome da campanha.', 'error');
        return;
    }
    
    if (privada && !senha) {
        mostrarToast('Campanhas privadas precisam de uma senha.', 'error');
        return;
    }
    
    const id = estado.campanhaEditandoId || 'c' + Date.now();
    
    estado.campanhas[id] = {
        id: id,
        nome: nome,
        img: img,
        desc: desc,
        privada: privada,
        senha: privada ? senha : '',
        link: link,
        dono: estado.usuario.id,
        participantes: estado.campanhas[id]?.participantes || []
    };
    
    salvarCampanhas();
    fecharModalCampanha();
    renderizarCampanhas();
    renderizarFiltros();
    renderizarAdmin();
    renderizarParty();
    mostrarToast('✅ Campanha salva com sucesso!', 'success');
}

function apagarCampanha() {
    if (!estado.campanhaEditandoId) {
        mostrarToast('Nenhuma campanha selecionada.', 'error');
        return;
    }
    
    if (!confirm('Tem certeza que deseja apagar esta campanha?')) return;
    
    delete estado.campanhas[estado.campanhaEditandoId];
    salvarCampanhas();
    fecharModalCampanha();
    renderizarCampanhas();
    renderizarFiltros();
    renderizarAdmin();
    renderizarParty();
    mostrarToast('🗑️ Campanha apagada.', 'info');
}

// ============================================
// TOAST
// ============================================

function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.getElementById('toast');
    document.getElementById('toast-mensagem').textContent = mensagem;
    toast.className = 'toast ' + tipo;
    toast.style.display = 'block';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// ============================================
// SINCRONIZAÇÃO ENTRE ABAS
// ============================================

window.addEventListener('storage', function(e) {
    if (e.key === 'apoteose_campanhas' || e.key === 'apoteose_personagens' || e.key === 'apoteose_rolagens') {
        carregarDados();
        if (estado.usuario) {
            renderizarPersonagens();
            renderizarCampanhas();
            renderizarFiltros();
            renderizarParty();
            renderizarAdmin();
        }
    }
});

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', init);
