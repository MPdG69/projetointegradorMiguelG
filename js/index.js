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
        nome: 'Ash 2000',
        email: 'Lulatron@email.com',
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
        'item2': { nome: 'Kapinga', peso: 1.0, tipo: 'arma', dano: '1d6+2', teste: '1d20+6', critico: '20/x2', desc: 'Arma tipica africana, mas com detalhes em arco iris' }
    },
    habilidadesPassivas: [
        { nome: 'Tiros inteligentes', categoria: 'Maestria', desc: 'Atira usando intelecto', expandida: false }
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
        desc: 'Uma campanha pública onde Max, por enquanto só, sobrevive aos entremeios da chakal',
        img: '',
        privada: false,
        senha: '',
        link: 'convite-chakal-xyz',
        dono: 'admin',
        participantes: ['normal']
    },
    'c_privada': {
        id: 'c_privada',
        nome: 'Egrégora',
        desc: 'Campanha privada - apenas para demonstração de acesso negado.',
        img: '',
        privada: true,
        senha: '123',
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
    campanhaEditandoId: null
};

// ============================================
// INICIALIZAÇÃO
// ============================================

async function init() {
    carregarDados();

    // Primeiro, verifica se existe uma sessão PHP ativa
    try {
        const resposta = await fetch('api/verificar_sessao.php');
        const dados = await resposta.json();

        if (dados.logado) {
            estado.usuario = dados.usuario;
            entrarNaSessao();
            return;
        }
    } catch (erro) {
        console.error('Erro ao verificar sessão:', erro);
    }

    // Mantém a possibilidade de entrar como anônimo
    const sessao = localStorage.getItem('apoteose_sessao');

    if (sessao) {
        try {
            const dados = JSON.parse(sessao);

            if (dados.usuario && dados.usuario.tipo === 'anonimo') {
                estado.usuario = dados.usuario;
                entrarNaSessao();
                return;
            }
        } catch (e) {
            console.error('Erro ao recuperar sessão anônima:', e);
        }
    }

    // Remove sessões antigas de demonstração
    localStorage.removeItem('apoteose_sessao');

    mostrarTela('tela-login');
}

function carregarDados() {
    // Campanhas agora são carregadas exclusivamente pelo banco de dados.
    estado.campanhas = {};

    const personagensSalvos = localStorage.getItem('apoteose_personagens');

    if (personagensSalvos) {
        try {
            estado.personagens = JSON.parse(personagensSalvos);
        } catch (e) {
            estado.personagens = { 'p_max': { ...PERSONAGEM_MAX } };
        }
    } else {
        estado.personagens = { 'p_max': { ...PERSONAGEM_MAX } };
        salvarPersonagens();
    }

    if (!estado.personagens['p_max']) {
        estado.personagens['p_max'] = { ...PERSONAGEM_MAX };
        salvarPersonagens();
    }

    // Remove a antiga lista de campanhas simuladas.
    localStorage.removeItem('apoteose_campanhas');
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

    if (tab === 'admin' && estado.usuario?.tipo === 'admin') {
        renderizarUsuariosAdmin();
    }
}

// ============================================
// LOGIN
// ============================================

async function handleLogin() {
    const usuario = document.getElementById('login-usuario').value.trim();
    const senha = document.getElementById('login-senha').value;
    const msg = document.getElementById('login-mensagem');

    if (!usuario || !senha) {
        msg.className = 'login-mensagem erro';
        msg.textContent = 'Preencha usuário e senha.';
        return;
    }

    try {
        const resposta = await fetch('api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario: usuario,
                senha: senha
            })
        });

        const dados = await resposta.json();

        if (dados.sucesso) {
            estado.usuario = dados.usuario;
            msg.className = 'login-mensagem sucesso';
            msg.textContent = dados.mensagem;

            entrarNaSessao();
        } else {
            msg.className = 'login-mensagem erro';
            msg.textContent = dados.mensagem;
        }

    } catch (erro) {
        msg.className = 'login-mensagem erro';
        msg.textContent = 'Não foi possível conectar ao servidor.';
        console.error(erro);
    }
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
        document.getElementById('btn-novo-personagem').style.display = 'inline-flex';
        document.getElementById('btn-perfil').style.display = 'inline-flex';
        document.getElementById('nav-personagens-label').textContent = 'Meus Personagens';
        document.getElementById('personagens-titulo').textContent = 'Meus Personagens';

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

    if (user.tipo === 'anonimo') {
        renderizarPersonagens();
    } else {
        carregarPersonagensBanco();
    }

    carregarCampanhasBanco();

    switchMainTab('personagens');
}


async function handleLogout() {
    try {
        await fetch('api/logout.php');
    } catch (erro) {
        console.error('Erro ao encerrar sessão:', erro);
    }

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
// CADASTRO DE USUÁRIO
// ============================================

async function handleCadastro() {
    console.log('[cadastro] botão clicado');
    const nome = document.getElementById('cadastro-nome').value.trim();
    const username = document.getElementById('cadastro-username').value.trim();
    const email = document.getElementById('cadastro-email').value.trim();
    const senha = document.getElementById('cadastro-senha').value;
    const msg = document.getElementById('cadastro-mensagem');
    const btn = document.getElementById('btn-cadastrar');

    const mostrar = (texto, tipo) => {
        msg.className = 'login-mensagem ' + tipo;
        msg.textContent = texto;
    };

    if (!nome || !username || !email || !senha) {
        mostrar('Preencha todos os campos.', 'erro');
        return;
    }
    if (senha.length < 6) {
        mostrar('A senha precisa ter pelo menos 6 caracteres.', 'erro');
        return;
    }

    mostrar('Enviando...', '');
    btn.disabled = true;

    try {
        const resposta = await fetch('api/cadastrar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, username, email, senha })
        });

        const texto = await resposta.text();
        console.log('[cadastro] status:', resposta.status, 'resposta:', texto);

        let dados;
        try {
            dados = JSON.parse(texto);
        } catch (e) {
            mostrar('O servidor não devolveu JSON (status ' + resposta.status + '). Veja o Console (F12).', 'erro');
            return;
        }

        if (dados.sucesso) {
            mostrar(dados.mensagem, 'sucesso');
            ['nome', 'username', 'email', 'senha'].forEach(c => {
                document.getElementById('cadastro-' + c).value = '';
            });
        } else {
            mostrar(dados.mensagem, 'erro');
        }
    } catch (erro) {
        console.error('[cadastro] erro:', erro);
        mostrar('Não foi possível conectar ao servidor.', 'erro');
    } finally {
        btn.disabled = false;
    }
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
        // Navegar para a página da party
        window.location.href = `party.html?id=${campanhaPrivadaId}`;
        mostrarToast('✅ Acesso concedido à campanha ' + camp.nome + '!', 'success');
    } else {
        document.getElementById('modal-senha-erro').style.display = 'block';
    }
}

// ============================================
// PERSONAGENS
// ============================================

async function criarPersonagem() {
    if (estado.usuario.tipo === 'anonimo') {
        mostrarToast('Anônimos não podem criar personagens.', 'error');
        return;
    }

    const nome = prompt('Digite o nome do personagem:');

    if (!nome || !nome.trim()) {
        return;
    }

    const classe = prompt('Digite a classe do personagem:') || '';

    try {
        const resposta = await fetch('api/personagens_criar.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome.trim(),
                classe: classe.trim()
            })
        });

        const dados = await resposta.json();

        if (!dados.sucesso) {
            mostrarToast(dados.mensagem, 'error');
            return;
        }

        mostrarToast('Personagem criado com sucesso!', 'success');
        await carregarPersonagensBanco();

    } catch (erro) {
        mostrarToast('Erro ao criar personagem.', 'error');
        console.error(erro);
    }
}

async function carregarPersonagensBanco() {
    try {
        const resposta = await fetch('api/personagens_listar.php');
        const dados = await resposta.json();

        if (!dados.sucesso) {
            mostrarToast(dados.mensagem, 'error');
            return;
        }

        estado.personagens = {};

        dados.personagens.forEach(p => {
            estado.personagens[p.id] = {
                ...p,
                dono: estado.usuario.id,
                campanha: '',
                img: p.img || ''
            };
        });

        renderizarPersonagens();

    } catch (erro) {
        mostrarToast('Erro ao carregar personagens.', 'error');
        console.error(erro);
    }
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

    } else {
        personagens = personagens.filter(p =>
            String(p.dono ?? p.usuario_id) === String(user.id)
        );
    }

    if (personagens.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; color:var(--text-dim); padding:40px;">
                <i class="ph ph-user" style="font-size:3rem; display:block; margin-bottom:10px;"></i>
                <p>${user.tipo === 'anonimo' ? 'Nenhum personagem público disponível.' : 'Nenhum personagem encontrado.'}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = personagens.map(p => `
        <div class="card" onclick="abrirFicha('${p.id}')">
            <img src="${p.img || ''}" onerror="this.src=''">
            <h4>${p.nome}</h4>
            <p>${p.classe || 'Sem classe'} - Nv. ${p.nivel}</p>
            <small style="color:var(--text-dim);">
                ${p.campanha || 'Sem campanha'}
            </small>
            <div class="card-actions">
                <button onclick="event.stopPropagation(); abrirFicha('${p.id}')">
                    <i class="ph ph-eye"></i>
                </button>
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

async function carregarCampanhasBanco() {
    try {
        const resposta = await fetch('api/campanhas_listar.php');
        const dados = await resposta.json();

        if (!dados.sucesso) {
            mostrarToast(dados.mensagem || 'Erro ao carregar campanhas.', 'error');
            return;
        }

        estado.campanhas = {};

        dados.campanhas.forEach(c => {
            estado.campanhas[c.id] = {
                id: c.id,
                nome: c.nome,
                desc: c.descricao || '',
                img: c.img || '',
                privada: Boolean(c.privada),
                link: c.link || '',
                dono: c.criado_por_usuario_id,
                participantes: []
            };
        });

        renderizarCampanhas();
        renderizarFiltros();
        renderizarAdmin();

    } catch (erro) {
        console.error('Erro ao carregar campanhas:', erro);
        mostrarToast('Não foi possível carregar as campanhas.', 'error');
    }
}

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
    if (!camp) {
        mostrarToast('Campanha não encontrada.', 'error');
        return;
    }
    
    // Se for privada e o usuário não for admin, pedir senha
    if (camp.privada && estado.usuario.tipo !== 'admin') {
        abrirModalPrivado(id);
        return;
    }
    
    // Navegar para a página da party
    window.location.href = `party.html?id=${id}`;
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
        document.getElementById('lista-usuarios-admin').innerHTML = '';
        return;
    }
    
    // Renderizar campanhas
    const campanhas = Object.values(estado.campanhas);
    
    if (campanhas.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; color:var(--text-dim); padding:20px;">
                Nenhuma campanha cadastrada.
            </div>
        `;
    } else {
        container.innerHTML = campanhas.map(c => `
            <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:8px; padding:15px 20px; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; transition:0.3s; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; align-items:center; gap:15px; flex-wrap:wrap;">
                    <img src="${c.img || ''}" onerror="this.src=''" style="width:50px; height:50px; border-radius:8px; object-fit:cover;">
                    <div>
                        <div style="font-weight:bold;">${c.nome}</div>
                        <div style="font-size:0.8rem; color:var(--text-dim);">
                            ${c.privada ? '🔒 Privada' : '🌍 Pública'}
                            ${c.participantes ? ' | ' + c.participantes.length + ' participantes' : ''}
                        </div>
                    </div>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button onclick="abrirModalCampanha('${c.id}')" style="background:none; border:none; color:var(--accent-yellow); cursor:pointer; padding:6px 10px; border-radius:4px; transition:0.3s;">
                        <i class="ph ph-pencil"></i> Editar
                    </button>
                    <button onclick="window.location.href='party.html?id=${c.id}'" style="background:none; border:none; color:var(--accent-purple); cursor:pointer; padding:6px 10px; border-radius:4px; transition:0.3s;">
                        <i class="ph ph-eye"></i> Party
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Renderizar usuários
    renderizarUsuariosAdmin();
}

// ============================================
// GERENCIAMENTO DE USUÁRIOS (ADMIN)
// ============================================

async function renderizarUsuariosAdmin() {
    const container = document.getElementById('lista-usuarios-admin');

    if (!container) return;

    if (estado.usuario?.tipo !== 'admin') {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div style="text-align:center; color:var(--text-dim); padding:20px;">
            Carregando usuários...
        </div>
    `;

    try {
        const resposta = await fetch('api/usuarios_listar.php');
        const dados = await resposta.json();

        if (!dados.sucesso) {
            container.textContent = dados.mensagem || 'Não foi possível carregar os usuários.';
            return;
        }

        const usuarios = dados.usuarios || [];

        if (usuarios.length === 0) {
            container.textContent = 'Nenhum usuário cadastrado.';
            return;
        }

        container.innerHTML = '';

        usuarios.forEach(u => {
            const isAdmin = u.tipo === 'admin';
            const isSelf = String(u.id) === String(estado.usuario.id);

            const item = document.createElement('div');
            item.style.cssText = `
                background:var(--bg-card);
                border:1px solid var(--border);
                border-radius:8px;
                padding:12px 20px;
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:8px;
                flex-wrap:wrap;
                gap:10px;
            `;

            const informacoes = document.createElement('div');
            informacoes.style.cssText = `
                display:flex;
                align-items:center;
                gap:10px;
                flex-wrap:wrap;
            `;

            const nome = document.createElement('strong');
            nome.textContent = u.nome;

            const email = document.createElement('span');
            email.style.cssText = 'color:var(--text-dim); font-size:0.8rem;';
            email.textContent = u.email;

            const username = document.createElement('span');
            username.style.cssText = 'color:var(--text-dim); font-size:0.8rem;';
            username.textContent = '@' + u.username;

            const badge = document.createElement('span');
            badge.style.cssText = `
                font-size:0.65rem;
                padding:2px 10px;
                border-radius:12px;
                background:${isAdmin ? 'var(--accent-purple)' : 'var(--accent-green)'};
                color:white;
            `;
            badge.textContent = u.tipo.toUpperCase();

            informacoes.append(nome, username, email, badge);

            const acoes = document.createElement('div');
            acoes.style.cssText = 'display:flex; gap:8px;';

            if (isSelf) {
                const voce = document.createElement('span');
                voce.style.cssText = 'color:var(--text-dim); font-size:0.8rem;';
                voce.textContent = '(Você)';
                acoes.appendChild(voce);
            } else {
                const botao = document.createElement('button');

                if (isAdmin) {
                    botao.className = 'btn-secondary';
                    botao.innerHTML = '<i class="ph ph-user"></i> Remover Admin';
                    botao.addEventListener('click', () => {
                        alterarPermissaoUsuario(u.id, 'normal');
                    });
                } else {
                    botao.className = 'btn-primary';
                    botao.innerHTML = '<i class="ph ph-shield-plus"></i> Tornar Admin';
                    botao.addEventListener('click', () => {
                        alterarPermissaoUsuario(u.id, 'admin');
                    });
                }

                botao.style.cssText = 'padding:4px 12px; font-size:0.8rem;';
                acoes.appendChild(botao);
            }

            item.append(informacoes, acoes);
            container.appendChild(item);
        });

    } catch (erro) {
        console.error('Erro ao carregar usuários:', erro);
        container.textContent = 'Erro de conexão ao carregar os usuários.';
    }
}


async function alterarPermissaoUsuario(userId, novoTipo) {
    const acao = novoTipo === 'admin'
        ? 'promover este usuário a administrador'
        : 'remover a permissão de administrador deste usuário';

    if (!confirm(`Tem certeza que deseja ${acao}?`)) {
        return;
    }

    try {
        const resposta = await fetch('api/usuario_permissao.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: userId,
                tipo: novoTipo
            })
        });

        const dados = await resposta.json();

        if (!dados.sucesso) {
            mostrarToast(dados.mensagem || 'Não foi possível alterar a permissão.', 'error');
            return;
        }

        mostrarToast(dados.mensagem, 'success');

        await renderizarUsuariosAdmin();

    } catch (erro) {
        console.error('Erro ao alterar permissão:', erro);
        mostrarToast('Erro de conexão ao alterar a permissão.', 'error');
    }
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
        if (camp.link) {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('convite', camp.link);

    document.getElementById('campanha-link').value = url.toString();
} else {
    document.getElementById('campanha-link').value = '';
}
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

    const participantesField = document.getElementById('campanha-participantes-field');

if (participantesField) {
    if (campanhaId) {
        participantesField.style.display = 'block';
        carregarParticipantesCampanha(campanhaId);
    } else {
        participantesField.style.display = 'none';
        document.getElementById('campanha-participantes-lista').innerHTML = '';
        document.getElementById('campanha-personagem-selecionado').innerHTML =
            '<option value="">Selecione um personagem</option>';
    }
}

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
    const id = estado.campanhaEditandoId;
    const camp = estado.campanhas[id];

    if (!camp || !camp.link) {
        mostrarToast('Salve a campanha antes de copiar o link.', 'error');
        return;
    }

    const linkCompleto = `${window.location.origin}/projetointegradorMiguelG-main/convite.html?convite=${camp.link}`;

    document.getElementById('campanha-link').value = linkCompleto;

    navigator.clipboard.writeText(linkCompleto)
        .then(() => {
            mostrarToast('Link de convite copiado!', 'success');
        })
        .catch(() => {
            mostrarToast('Não foi possível copiar automaticamente. Copie o endereço manualmente.', 'error');
        });
}


async function salvarCampanha() {
    const nome = document.getElementById('campanha-nome').value.trim();
    const img = document.getElementById('campanha-img').value.trim();
    const desc = document.getElementById('campanha-desc').value.trim();
    const privada = document.getElementById('campanha-privada').checked;
    const senha = document.getElementById('campanha-senha').value.trim();

    if (!nome) {
        mostrarToast('Por favor, informe o nome da campanha.', 'error');
        return;
    }

    if (privada && !senha) {
        mostrarToast('Campanhas privadas precisam de uma senha.', 'error');
        return;
    }

    if (estado.campanhaEditandoId) {
        mostrarToast('A edição de campanhas será integrada na próxima etapa.', 'error');
        return;
    }

    try {
        const resposta = await fetch('api/campanhas_criar.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                img: img,
                desc: desc,
                privada: privada,
                senha: senha
            })
        });

        const resultado = await resposta.json();

        if (!resultado.sucesso) {
            mostrarToast(resultado.mensagem || 'Erro ao criar campanha.', 'error');
            return;
        }

        const campanha = resultado.campanha;

        estado.campanhas[campanha.id] = {
            ...campanha,
            participantes: []
        };

        fecharModalCampanha();
        renderizarCampanhas();
        renderizarFiltros();
        renderizarAdmin();

        mostrarToast('Campanha criada com sucesso!', 'success');

    } catch (erro) {
        console.error('Erro ao criar campanha:', erro);
        mostrarToast('Não foi possível conectar ao servidor.', 'error');
    }
}



async function salvarCampanha() {
    const nome = document.getElementById('campanha-nome').value.trim();
    const img = document.getElementById('campanha-img').value.trim();
    const descricao = document.getElementById('campanha-desc').value.trim();
    const privada = document.getElementById('campanha-privada').checked;
    const senha = document.getElementById('campanha-senha').value.trim();
    const link = document.getElementById('campanha-link').value.trim();

    if (!nome) {
        mostrarToast('Informe o nome da campanha.', 'error');
        return;
    }

    if (privada && !senha && !estado.campanhaEditandoId) {
        mostrarToast('Informe uma senha para a campanha privada.', 'error');
        return;
    }

    const dados = {
        nome,
        img,
        descricao,
        privada,
        senha,
        link
    };

    try {
        let resposta;

        if (estado.campanhaEditandoId) {
            dados.id = estado.campanhaEditandoId;

            resposta = await fetch('api/campanhas_editar.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            });
        } else {
            resposta = await fetch('api/campanhas_criar.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            });
        }

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            mostrarToast(resultado.mensagem || 'Não foi possível salvar a campanha.', 'error');
            return;
        }

        mostrarToast(
            estado.campanhaEditandoId
                ? 'Campanha atualizada com sucesso!'
                : 'Campanha criada com sucesso!',
            'success'
        );

        fecharModalCampanha();

        if (typeof carregarCampanhasBanco === 'function') {
            await carregarCampanhasBanco();
        } else if (typeof carregarCampanhas === 'function') {
            await carregarCampanhas();
        }

    } catch (erro) {
        console.error('Erro ao salvar campanha:', erro);
        mostrarToast('Erro de comunicação com o servidor.', 'error');
    }
}


// ============================================
// PARTICIPANTES DA CAMPANHA (ADMIN)
// ============================================

async function carregarParticipantesCampanha(campanhaId) {
    const lista = document.getElementById('campanha-participantes-lista');
    const select = document.getElementById('campanha-personagem-selecionado');

    lista.innerHTML = '<p style="color:var(--text-dim);">Carregando personagens...</p>';
    select.innerHTML = '<option value="">Selecione um personagem</option>';

    try {
        const resposta = await fetch(
            `api/campanha_personagens.php?campanha_id=${encodeURIComponent(campanhaId)}`
        );

        const dados = await resposta.json();

        if (!dados.sucesso) {
            lista.textContent = dados.mensagem || 'Erro ao carregar participantes.';
            return;
        }

        // Renderiza os participantes atuais.
        if (dados.participantes.length === 0) {
            lista.innerHTML = `
                <p style="color:var(--text-dim); font-size:0.85rem;">
                    Nenhum personagem nesta campanha.
                </p>
            `;
        } else {
            lista.innerHTML = '';

            dados.participantes.forEach(personagem => {
                const item = document.createElement('div');

                item.style.cssText = `
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:10px;
                    padding:10px;
                    margin-bottom:8px;
                    background:var(--bg-card);
                    border:1px solid var(--border);
                    border-radius:6px;
                `;

                const informacoes = document.createElement('div');

                const nome = document.createElement('strong');
                nome.textContent = personagem.nome;

                const detalhes = document.createElement('div');
                detalhes.style.cssText = 'font-size:0.8rem; color:var(--text-dim);';
                detalhes.textContent =
                    `${personagem.classe || 'Sem classe'} | Nível ${personagem.nivel} | Dono: ${personagem.dono || 'Desconhecido'}`;

                informacoes.append(nome, detalhes);

                const botao = document.createElement('button');
                botao.type = 'button';
                botao.textContent = 'Remover';
                botao.style.cssText = `
                    background:none;
                    border:1px solid #c44;
                    color:#e66;
                    padding:6px 10px;
                    border-radius:4px;
                    cursor:pointer;
                `;

                botao.addEventListener('click', () => {
                    removerPersonagemCampanha(personagem.id);
                });

                item.append(informacoes, botao);
                lista.appendChild(item);
            });
        }

        // Preenche o seletor apenas com personagens sem campanha.
        dados.personagens
            .filter(p => !p.campanha_id)
            .forEach(personagem => {
                const opcao = document.createElement('option');
                opcao.value = personagem.id;
                opcao.textContent =
                    `${personagem.nome} — ${personagem.dono || 'Dono desconhecido'} (Nível ${personagem.nivel})`;

                select.appendChild(opcao);
            });

        if (select.options.length === 1) {
            const opcao = document.createElement('option');
            opcao.disabled = true;
            opcao.textContent = 'Nenhum personagem disponível';
            select.appendChild(opcao);
        }

    } catch (erro) {
        console.error('Erro ao carregar participantes:', erro);
        lista.textContent = 'Não foi possível carregar os participantes.';
    }
}


async function adicionarPersonagemCampanha() {
    const campanhaId = estado.campanhaEditandoId;
    const personagemId = document.getElementById('campanha-personagem-selecionado').value;

    if (!campanhaId || !personagemId) {
        mostrarToast('Selecione um personagem.', 'error');
        return;
    }

    await alterarPersonagemCampanha('adicionar', campanhaId, personagemId);
}


async function removerPersonagemCampanha(personagemId) {
    const campanhaId = estado.campanhaEditandoId;

    if (!campanhaId) return;

    if (!confirm('Tem certeza que deseja remover este personagem da campanha?')) {
        return;
    }

    await alterarPersonagemCampanha('remover', campanhaId, personagemId);
}


async function alterarPersonagemCampanha(acao, campanhaId, personagemId) {
    try {
        const resposta = await fetch('api/campanha_personagens.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                acao,
                campanha_id: campanhaId,
                personagem_id: personagemId
            })
        });

        const dados = await resposta.json();

        if (!dados.sucesso) {
            mostrarToast(dados.mensagem || 'Não foi possível realizar a operação.', 'error');
            return;
        }

        mostrarToast(dados.mensagem, 'success');

        await carregarParticipantesCampanha(campanhaId);

        // Atualiza também a contagem de participantes no painel.
        if (estado.campanhas[campanhaId]) {
            estado.campanhas[campanhaId].participantes =
                Array.from(document.querySelectorAll('#campanha-participantes-lista > div'));
        }

        renderizarAdmin();

    } catch (erro) {
        console.error('Erro ao alterar participante:', erro);
        mostrarToast('Erro de conexão com o servidor.', 'error');
    }
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
    if (e.key === 'apoteose_personagens' || e.key === 'apoteose_rolagens') {
        carregarDados();

        if (estado.usuario) {
            renderizarPersonagens();
        }
    }
});

// ============================================
// INICIALIZAÇÃO COM VÍNCULO SEGURO DE EVENTOS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    init();

    // Adiciona o evento de clique no botão de cadastro de forma segura
    const btnCadastrar = document.getElementById('btn-cadastrar');
    if (btnCadastrar) {
        btnCadastrar.addEventListener('click', handleCadastro);
    }
});