        // ============================================
        // CONFIGURAÇÕES
        // ============================================
        const mainAttrs = ['Força', 'Destreza', 'Compostura', 'Fé', 'Inteligência', 'Carisma'];
        const specAttrs = ['Mente', 'Corpo', 'Alma'];
        const attrAbbreviations = {
            'Força': 'For', 'Destreza': 'Des', 'Compostura': 'Com', 'Fé': 'Fé',
            'Inteligência': 'Int', 'Carisma': 'Car', 'Mente': 'Men', 'Corpo': 'Cor', 'Alma': 'Alm'
        };
        const skillsList = [
            "Acrobacia", "Artes", "Atletismo", "Conhecimento", "Determinação",
            "Diplomacia", "Direção", "Divindade", "Domesticar", "Enganação",
            "Fortitude", "Furtividade", "Humanidade", "Intimidação", "Intuição",
            "Investigação", "Luta", "Medicina", "Ofício", "Percepção",
            "Pontaria", "Prestigitação", "Reflexos", "Religião", "Sobrevivência",
            "Tecnologia", "Sorte", "Magia", "Iniciativa"
        ];

        let personagemId = null;
        let dadosPersonagem = null;

        // ============================================
        // INICIALIZAÇÃO
        // ============================================
        function init() {
            const params = new URLSearchParams(window.location.search);
            personagemId = params.get('id');

            if (!personagemId) {
                // Sem ID na URL: usa sempre o mesmo personagem de demonstração,
                // assim os dados preenchidos (perícias, itens, etc.) não se perdem
                // a cada vez que a página é recarregada.
                personagemId = 'demo_ficha';
                if (!localStorage.getItem('ficha_' + personagemId)) {
                    criarPersonagemDemonstracao();
                }
            }

            renderizarAtributos();
            renderizarPericias();
            carregarPersonagem();
            renderizarInventario();
            renderizarPassivas();
            renderizarAtivas();
            renderizarResistencias();
            renderizarAcessoRapido();
        }

        function criarPersonagemDemonstracao() {
            const dados = {
                id: personagemId,
                nome: 'Max',
                classe: 'Especialista',
                nivel: 10,
                gnivel: 1,
                dom: 'Conhecimento',
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
                img: '',
                senha: '',
                anotacoes: 'Personagem de demonstração - Especialista em conhecimento e magia.',
                atributos: {},
                defesa: { esquiva_natural: 2, esquiva_escudo: 0, esquiva_armadura: 2, esquiva_itens: 1, esquiva_tecnicas: 1, esquiva_reflexos: 2 },
                pericias: {},
                inventario: {},
                habilidadesPassivas: [],
                habilidadesAtivas: [],
                resistencias: []
            };

            // Atributos aleatórios (0-5)
            [...mainAttrs, ...specAttrs].forEach(attr => {
                dados.atributos[attr] = Math.floor(Math.random() * 6);
            });

            // Perícias com valores aleatórios
            skillsList.forEach(skill => {
                const attr = mainAttrs[Math.floor(Math.random() * mainAttrs.length)];
                dados.pericias[skill] = {
                    atributo: attr,
                    treino: Math.floor(Math.random() * 5),
                    outros: Math.floor(Math.random() * 3),
                    total: 0
                };
            });

            // Habilidades Passivas
            dados.habilidadesPassivas = [
                { nome: 'Conhecimento Arcano', categoria: 'Maestria', desc: '+3 em testes de Conhecimento sobre magia.', expandida: false },
                { nome: 'Observação Aguçada', categoria: 'Talento', desc: '+2 em testes de Percepção.', expandida: false },
                { nome: 'Pergaminho Sagrado', categoria: 'Benção', desc: 'Pode usar pergaminhos mágicos sem restrições.', expandida: false }
            ];

            // Habilidades Ativas
            dados.habilidadesAtivas = [
                { 
                    nome: 'Bola de Fogo', 
                    tipo: 'Magia', 
                    ativa: true,
                    arcanos: 'Fogo',
                    forma: 'Projétil',
                    funcao: 'Dano',
                    efeito: 'Explosão',
                    duracao: 'Instantâneo',
                    alvos: 'Área',
                    custo: '5 ED',
                    amplificadores: '+1d6 por nível',
                    concedido: '',
                    dados: '4d6',
                    dano: '4d6+3',
                    desc: 'Lança uma bola de fogo que explode em uma área de 3m.',
                    expandida: false 
                },
                { 
                    nome: 'Escudo Mágico', 
                    tipo: 'Milagre', 
                    ativa: false,
                    arcanos: 'Proteção',
                    forma: 'Defesa',
                    funcao: 'Proteção',
                    efeito: 'Absorção',
                    duracao: '1 minuto',
                    alvos: 'Pessoal',
                    custo: '3 ED',
                    amplificadores: '+1 de defesa por nível',
                    concedido: '',
                    dados: '',
                    dano: '',
                    desc: 'Cria um escudo mágico que absorve dano.',
                    expandida: false 
                }
            ];

            // Resistências
            dados.resistencias = [
                { tipo: 'Fogo', desc: 'Resistência +5' },
                { tipo: 'Veneno', desc: 'Resistência +3' },
                { tipo: 'Medo', desc: 'Imune' }
            ];

            // Inventário
            dados.inventario = {
                'item1': { nome: 'Poção de Cura', peso: 0.5, tipo: 'item', desc: 'Restaura 2d6+4 PV.' },
                'item2': { nome: 'Pergaminho de Fogo', peso: 0.2, tipo: 'item', desc: 'Libera uma bola de fogo.' },
                'item3': { nome: 'Cajado Arcano', peso: 1.0, tipo: 'arma', dano: '1d6+2', teste: '1d20+6', critico: '20/x2', desc: 'Cajado mágico com ponta de cristal.' },
                'item4': { nome: 'Manto do Sábio', peso: 0.8, tipo: 'armadura', desc: 'Manto que concede +2 de defesa mágica.' }
            };

            salvarNoStorage(dados);
        }

        // ============================================
        // STORAGE
        // ============================================
        function salvarNoStorage(dados) {
            try {
                // Salva personagem individual
                localStorage.setItem('ficha_' + personagemId, JSON.stringify(dados));
                
                // Atualiza lista de personagens no portal
                const todos = JSON.parse(localStorage.getItem('apoteose_personagens') || '{}');
                if (!todos[personagemId]) {
                    todos[personagemId] = {
                        id: personagemId,
                        nome: dados.nome,
                        classe: dados.classe,
                        nivel: dados.nivel,
                        campanha: dados.dom || 'Demonstração',
                        img: dados.img || '',
                        dono: 'demo',
                        pv_atual: dados.pv_atual,
                        pv_max: dados.pv_max,
                        ed_atual: dados.ed_atual,
                        ed_max: dados.ed_max,
                        eh_atual: dados.eh_atual,
                        eh_max: dados.eh_max,
                        senha: dados.senha || ''
                    };
                    localStorage.setItem('apoteose_personagens', JSON.stringify(todos));
                }
            } catch (e) {
                console.error('Erro ao salvar:', e);
            }
        }

        function carregarDoStorage() {
            try {
                const dados = localStorage.getItem('ficha_' + personagemId);
                if (dados) {
                    return JSON.parse(dados);
                }
                return null;
            } catch (e) {
                return null;
            }
        }

        // ============================================
        // CARREGAR PERSONAGEM
        // ============================================
        function carregarPersonagem() {
            dadosPersonagem = carregarDoStorage();
            if (!dadosPersonagem) {
                criarPersonagemDemonstracao();
                dadosPersonagem = carregarDoStorage();
            }

            // Preenche campos básicos
            document.getElementById('i-nome').value = dadosPersonagem.nome || '';
            document.getElementById('i-classe').value = dadosPersonagem.classe || '';
            document.getElementById('i-nivel').value = dadosPersonagem.nivel || 1;
            document.getElementById('i-gnivel').value = dadosPersonagem.gnivel || 1;
            document.getElementById('i-dom').value = dadosPersonagem.dom || '';
            document.getElementById('i-img').value = dadosPersonagem.img || '';
            document.getElementById('input-senha').value = dadosPersonagem.senha || '';

            // Barras vitais
            document.getElementById('pv-atual').value = dadosPersonagem.pv_atual || 0;
            document.getElementById('pv-max').value = dadosPersonagem.pv_max || 0;
            document.getElementById('ed-atual').value = dadosPersonagem.ed_atual || 0;
            document.getElementById('ed-max').value = dadosPersonagem.ed_max || 0;
            document.getElementById('eh-atual').value = dadosPersonagem.eh_atual || 0;
            document.getElementById('eh-max').value = dadosPersonagem.eh_max || 0;

            // Defesa
            document.getElementById('vig-atual').value = dadosPersonagem.vig_atual || 0;
            document.getElementById('vig-esquivas').value = dadosPersonagem.vig_esquivas || 0;
            document.getElementById('pos-grande').value = dadosPersonagem.pos_grande || 0;
            document.getElementById('pos-pequena').value = dadosPersonagem.pos_pequena || 0;

            // Lembranças
            document.getElementById('lembrancas').value = dadosPersonagem.lembrancas || 0;

            // Divindade
            document.getElementById('div-slider').value = dadosPersonagem.divinity_val || 50;
            atualizarDivindade(dadosPersonagem.divinity_val || 50);

            // Anotações
            document.getElementById('anotacoes').value = dadosPersonagem.anotacoes || '';

            // Atributos
            if (dadosPersonagem.atributos) {
                [...mainAttrs, ...specAttrs].forEach(attr => {
                    const el = document.getElementById('attr-' + attr);
                    if (el) {
                        el.value = dadosPersonagem.atributos[attr] || 0;
                        atualizarGrandeNivel(attr);
                    }
                });
            }

            // Defesa esquiva
            if (dadosPersonagem.defesa) {
                const fields = ['natural', 'escudo', 'armadura', 'itens', 'tecnicas', 'reflexos'];
                fields.forEach(f => {
                    const el = document.getElementById('esq-' + f);
                    if (el) {
                        el.value = dadosPersonagem.defesa['esquiva_' + f] || 0;
                    }
                });
                calcularEsquiva();
            }

            // Perícias
            if (dadosPersonagem.pericias) {
                skillsList.forEach(skill => {
                    const skillData = dadosPersonagem.pericias[skill];
                    if (skillData) {
                        const attrSelect = document.getElementById('skill-attr-' + skill);
                        const treinoInput = document.getElementById('skill-treino-' + skill);
                        const outrosInput = document.getElementById('skill-outros-' + skill);
                        if (attrSelect) attrSelect.value = skillData.atributo || '';
                        if (treinoInput) treinoInput.value = skillData.treino || 0;
                        if (outrosInput) outrosInput.value = skillData.outros || 0;
                        atualizarBonusPericia(skill);
                    }
                });
            }

            // Imagem
            if (dadosPersonagem.img) {
                document.getElementById('preview-img').src = dadosPersonagem.img;
            }

            // Carga
            document.getElementById('w-max').value = dadosPersonagem.carga_max || 20;

            // Atualiza renderizações
            renderizarInventario();
            renderizarPassivas();
            renderizarAtivas();
            renderizarResistencias();
            renderizarAcessoRapido();
            atualizarBarras();
            mostrarToast('Ficha carregada!', 'success');
        }

        // ============================================
        // SALVAR FICHA
        // ============================================
        function salvarFicha() {
            if (!dadosPersonagem) return;

            // Campos básicos
            dadosPersonagem.nome = document.getElementById('i-nome').value;
            dadosPersonagem.classe = document.getElementById('i-classe').value;
            dadosPersonagem.nivel = parseInt(document.getElementById('i-nivel').value) || 1;
            dadosPersonagem.gnivel = parseInt(document.getElementById('i-gnivel').value) || 1;
            dadosPersonagem.dom = document.getElementById('i-dom').value;
            dadosPersonagem.img = document.getElementById('i-img').value;
            dadosPersonagem.senha = document.getElementById('input-senha').value;

            // Barras vitais
            dadosPersonagem.pv_atual = parseInt(document.getElementById('pv-atual').value) || 0;
            dadosPersonagem.pv_max = parseInt(document.getElementById('pv-max').value) || 0;
            dadosPersonagem.ed_atual = parseInt(document.getElementById('ed-atual').value) || 0;
            dadosPersonagem.ed_max = parseInt(document.getElementById('ed-max').value) || 0;
            dadosPersonagem.eh_atual = parseInt(document.getElementById('eh-atual').value) || 0;
            dadosPersonagem.eh_max = parseInt(document.getElementById('eh-max').value) || 0;

            // Defesa
            dadosPersonagem.vig_atual = parseInt(document.getElementById('vig-atual').value) || 0;
            dadosPersonagem.vig_esquivas = parseInt(document.getElementById('vig-esquivas').value) || 0;
            dadosPersonagem.pos_grande = parseInt(document.getElementById('pos-grande').value) || 0;
            dadosPersonagem.pos_pequena = parseInt(document.getElementById('pos-pequena').value) || 0;

            // Lembranças
            dadosPersonagem.lembrancas = parseInt(document.getElementById('lembrancas').value) || 0;

            // Divindade
            dadosPersonagem.divinity_val = parseInt(document.getElementById('div-slider').value) || 50;

            // Anotações
            dadosPersonagem.anotacoes = document.getElementById('anotacoes').value;

            // Carga
            dadosPersonagem.carga_max = parseInt(document.getElementById('w-max').value) || 20;

            // Atributos
            if (!dadosPersonagem.atributos) dadosPersonagem.atributos = {};
            [...mainAttrs, ...specAttrs].forEach(attr => {
                const el = document.getElementById('attr-' + attr);
                if (el) {
                    dadosPersonagem.atributos[attr] = parseInt(el.value) || 0;
                }
            });

            // Defesa
            if (!dadosPersonagem.defesa) dadosPersonagem.defesa = {};
            const fields = ['natural', 'escudo', 'armadura', 'itens', 'tecnicas', 'reflexos'];
            fields.forEach(f => {
                const el = document.getElementById('esq-' + f);
                if (el) {
                    dadosPersonagem.defesa['esquiva_' + f] = parseInt(el.value) || 0;
                }
            });

            // Perícias
            if (!dadosPersonagem.pericias) dadosPersonagem.pericias = {};
            skillsList.forEach(skill => {
                const attrSelect = document.getElementById('skill-attr-' + skill);
                const treinoInput = document.getElementById('skill-treino-' + skill);
                const outrosInput = document.getElementById('skill-outros-' + skill);
                if (attrSelect && treinoInput && outrosInput) {
                    if (!dadosPersonagem.pericias[skill]) dadosPersonagem.pericias[skill] = {};
                    dadosPersonagem.pericias[skill].atributo = attrSelect.value;
                    dadosPersonagem.pericias[skill].treino = parseInt(treinoInput.value) || 0;
                    dadosPersonagem.pericias[skill].outros = parseInt(outrosInput.value) || 0;
                }
            });

            salvarNoStorage(dadosPersonagem);
            atualizarBarras();
            mostrarToast('Ficha salva!', 'success');
        }

        // ============================================
        // ATRIBUTOS
        // ============================================
        function renderizarAtributos() {
            const container = document.getElementById('main-attrs-container');
            container.innerHTML = mainAttrs.map(attr => `
                <div class="attr-row">
                    <span class="attr-name">${attr}</span>
                    <div class="attr-vals">
                        <input type="number" id="attr-${attr}" onchange="atualizarGrandeNivel('${attr}'); salvarFicha();" style="font-size: 1.2rem; height: 40px; width: 70px; text-align: center;">
                        <div class="big-level" id="gd-${attr}">+0</div>
                    </div>
                </div>
            `).join('');

            const container2 = document.getElementById('spec-attrs-container');
            container2.innerHTML = specAttrs.map(attr => `
                <div class="attr-row">
                    <span class="attr-name">${attr}</span>
                    <div class="attr-vals">
                        <input type="number" id="attr-${attr}" onchange="atualizarGrandeNivel('${attr}'); salvarFicha();" style="font-size: 1.2rem; height: 40px; width: 70px; text-align: center;">
                        <div class="big-level" id="gd-${attr}">+0</div>
                    </div>
                </div>
            `).join('');
        }

        function atualizarGrandeNivel(attr) {
            const el = document.getElementById('attr-' + attr);
            if (!el) return;
            const val = parseInt(el.value) || 0;
            const gd = document.getElementById('gd-' + attr);
            if (gd) gd.innerText = '+' + Math.floor(val / 10);
        }

        function atualizarNivel() {
            const nivel = parseInt(document.getElementById('i-nivel').value) || 1;
            let gnivel = 1;
            if (nivel >= 20) gnivel = Math.floor((nivel - 10) / 10) + 1;
            document.getElementById('i-gnivel').value = gnivel;
            salvarFicha();
        }

        // ============================================
        // DIVINDADE
        // ============================================
        function atualizarDivindade(val) {
            const hum = 100 - parseInt(val);
            document.getElementById('val-hum').innerText = hum + '%';
            document.getElementById('val-div').innerText = val + '%';
            document.getElementById('humanity-bar').style.width = hum + '%';
            document.getElementById('divinity-bar').style.width = val + '%';
        }

        // ============================================
        // DEFESA / ESQUIVA
        // ============================================
        function calcularEsquiva() {
            const fields = ['natural', 'escudo', 'armadura', 'itens', 'tecnicas', 'reflexos'];
            let total = 0;
            fields.forEach(f => {
                const el = document.getElementById('esq-' + f);
                if (el) total += parseInt(el.value) || 0;
            });
            document.getElementById('total-esquiva').innerText = total;
            salvarFicha();
        }

        // ============================================
        // BARRAS VITAIS
        // ============================================
        function atualizarBarras() {
            const pvAtual = parseInt(document.getElementById('pv-atual').value) || 0;
            const pvMax = parseInt(document.getElementById('pv-max').value) || 1;
            const edAtual = parseInt(document.getElementById('ed-atual').value) || 0;
            const edMax = parseInt(document.getElementById('ed-max').value) || 1;
            const ehAtual = parseInt(document.getElementById('eh-atual').value) || 0;
            const ehMax = parseInt(document.getElementById('eh-max').value) || 1;

            document.getElementById('bar-pv-width').style.width = Math.min(100, (pvAtual / pvMax) * 100) + '%';
            document.getElementById('bar-ed-width').style.width = Math.min(100, (edAtual / edMax) * 100) + '%';
            document.getElementById('bar-eh-width').style.width = Math.min(100, (ehAtual / ehMax) * 100) + '%';
        }

        // ============================================
        // PERÍCIAS
        // ============================================
        function renderizarPericias() {
            const container = document.getElementById('skills-grid-container');
            let html = `
                <div class="skill-grid">
                    <div class="skill-header">Perícia</div>
                    <div class="skill-header">Atributo</div>
                    <div class="skill-header">Bônus Total</div>
                    <div class="skill-header">Treino</div>
                    <div class="skill-header">Outros</div>
                    <div class="skill-header">Rolar</div>
            `;
            skillsList.forEach(skill => {
                html += `
                    <div class="skill-cell pericia">${skill}</div>
                    <div class="skill-cell">
                        <select id="skill-attr-${skill}" onchange="atualizarBonusPericia('${skill}'); salvarFicha();">
                            <option value="">Selecione</option>
                            ${Object.entries(attrAbbreviations).map(([full, abbr]) => `<option value="${full}">${abbr}</option>`).join('')}
                        </select>
                    </div>
                    <div class="skill-cell"><div id="skill-bonus-${skill}" class="skill-bonus green">0</div></div>
                    <div class="skill-cell"><input type="number" id="skill-treino-${skill}" onchange="atualizarBonusPericia('${skill}'); salvarFicha();" value="0" min="0"></div>
                    <div class="skill-cell"><input type="number" id="skill-outros-${skill}" onchange="atualizarBonusPericia('${skill}'); salvarFicha();" value="0"></div>
                    <div class="skill-cell"><i class="ph ph-dice-six dice-icon" onclick="rolarPericia('${skill}')"></i></div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }

        function atualizarBonusPericia(skill) {
            const treino = parseInt(document.getElementById('skill-treino-' + skill).value) || 0;
            const outros = parseInt(document.getElementById('skill-outros-' + skill).value) || 0;
            const attrName = document.getElementById('skill-attr-' + skill).value;

            let attrBonus = 0;
            if (attrName && dadosPersonagem && dadosPersonagem.atributos) {
                attrBonus = Math.floor((dadosPersonagem.atributos[attrName] || 0) / 10);
            }

            const total = treino + outros + attrBonus;
            const bonusElement = document.getElementById('skill-bonus-' + skill);
            bonusElement.textContent = total >= 0 ? `+${total}` : total;

            if (total <= 5) bonusElement.className = 'skill-bonus green';
            else if (total <= 10) bonusElement.className = 'skill-bonus blue';
            else if (total <= 15) bonusElement.className = 'skill-bonus purple';
            else bonusElement.className = 'skill-bonus yellow';
        }

        // ============================================
        // ROLAGEM DE PERÍCIA
        // ============================================
        function rolarPericia(skill) {
            const treino = parseInt(document.getElementById('skill-treino-' + skill).value) || 0;
            const outros = parseInt(document.getElementById('skill-outros-' + skill).value) || 0;
            const attrName = document.getElementById('skill-attr-' + skill).value;

            let attrBonus = 0;
            let attrValue = 0;
            if (attrName && dadosPersonagem && dadosPersonagem.atributos) {
                attrValue = dadosPersonagem.atributos[attrName] || 0;
                attrBonus = Math.floor(attrValue / 10);
            }

            const numDice = 1 + attrBonus;
            let rolls = [];
            for (let i = 0; i < numDice; i++) {
                rolls.push(Math.floor(Math.random() * 20) + 1);
            }
            const maxRoll = Math.max(...rolls);
            const total = maxRoll + attrBonus + treino + outros;
            const isCrit = rolls.some(r => r === 20);

            mostrarResultado(
                `Teste de ${skill}`,
                `Atributo: ${attrAbbreviations[attrName] || attrName || 'Nenhum'} (${attrValue})<br>Rolou ${numDice}d20, maior: ${maxRoll}<br>Modificadores: ${attrBonus > 0 ? '+' + attrBonus : ''} ${treino > 0 ? '+ Treino ' + treino : ''} ${outros > 0 ? '+ Outros ' + outros : ''}`,
                total,
                rolls,
                isCrit
            );
        }

        // ============================================
        // RESULTADO DA ROLAGEM
        // ============================================
        function mostrarResultado(titulo, descricao, total, rolls, isCrit) {
            const resultDiv = document.getElementById('roll-result');
            document.getElementById('roll-description').innerHTML = `<strong>${titulo}</strong>`;
            document.getElementById('roll-details').innerHTML = descricao;
            document.getElementById('roll-total').textContent = total;
            document.getElementById('roll-total').className = `roll-total${isCrit ? ' crit' : ''}`;

            const diceRolls = document.getElementById('dice-rolls');
            diceRolls.innerHTML = rolls.map(r => `<div class="dice-roll${r === 20 ? ' crit' : ''}">${r}</div>`).join('');
            diceRolls.style.display = 'flex';

            resultDiv.style.display = 'block';
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
        // TABS
        // ============================================
        function showTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            event.currentTarget.classList.add('active');
        }

        // ============================================
        // INVENTÁRIO
        // ============================================
        function renderizarInventario() {
            const container = document.getElementById('inventory-list');
            container.innerHTML = '';
            const items = dadosPersonagem?.inventario || {};
            let pesoTotal = 0;

            for (let id in items) {
                pesoTotal += parseFloat(items[id].peso) || 0;
            }

            const cargaMax = parseFloat(document.getElementById('w-max').value) || 20;
            const porcentagem = cargaMax > 0 ? Math.round((pesoTotal / cargaMax) * 100) : 0;

            document.getElementById('w-curr').textContent = pesoTotal;
            document.getElementById('carga-bar').style.width = Math.min(100, porcentagem) + '%';
            document.getElementById('carga-bar').style.background = porcentagem > 100 ? 'var(--accent-red)' : porcentagem > 80 ? 'var(--accent-yellow)' : 'var(--accent-purple)';

            for (let id in items) {
                const item = items[id];
                container.innerHTML += `
                    <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:6px; padding:10px; margin-bottom:8px;">
                        <div style="display:grid; grid-template-columns:1fr 50px 80px auto; gap:8px; align-items:center;">
                            <input type="text" value="${item.nome || ''}" onchange="atualizarItem('${id}','nome',this.value)" placeholder="Nome">
                            <input type="number" value="${item.peso || 0}" onchange="atualizarItem('${id}','peso',this.value)" placeholder="Peso" step="0.1">
                            <select onchange="atualizarItem('${id}','tipo',this.value)" style="background:var(--bg-input); color:white; border:1px solid var(--border); padding:4px; border-radius:4px;">
                                <option value="item" ${item.tipo === 'item' ? 'selected' : ''}>Item</option>
                                <option value="arma" ${item.tipo === 'arma' ? 'selected' : ''}>Arma</option>
                                <option value="armadura" ${item.tipo === 'armadura' ? 'selected' : ''}>Armad.</option>
                            </select>
                            <button onclick="removerItem('${id}')" style="background:none; border:none; color:var(--accent-red); cursor:pointer;"><i class="ph ph-trash"></i></button>
                        </div>
                        <textarea onchange="atualizarItem('${id}','desc',this.value)" placeholder="Descrição..." style="width:100%; margin-top:5px; background:var(--bg-input); border:1px solid var(--border); color:white; padding:4px; border-radius:4px;">${item.desc || ''}</textarea>
                        ${item.tipo === 'arma' ? `
                            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:5px;">
                                <input type="text" value="${item.dano || ''}" onchange="atualizarItem('${id}','dano',this.value)" placeholder="Dano (ex: 1d6+2)">
                                <input type="text" value="${item.teste || ''}" onchange="atualizarItem('${id}','teste',this.value)" placeholder="Teste (ex: 1d20+6)">
                                <input type="text" value="${item.critico || ''}" onchange="atualizarItem('${id}','critico',this.value)" placeholder="Crítico (ex: 20/x2)">
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        }

        function adicionarItem() {
            if (!dadosPersonagem.inventario) dadosPersonagem.inventario = {};
            const id = 'item_' + Date.now();
            dadosPersonagem.inventario[id] = { nome: 'Novo Item', peso: 0, tipo: 'item', desc: '' };
            salvarNoStorage(dadosPersonagem);
            renderizarInventario();
            renderizarAcessoRapido();
        }

        function removerItem(id) {
            if (!confirm('Remover este item?')) return;
            delete dadosPersonagem.inventario[id];
            salvarNoStorage(dadosPersonagem);
            renderizarInventario();
            renderizarAcessoRapido();
        }

        function atualizarItem(id, campo, valor) {
            if (!dadosPersonagem.inventario[id]) return;
            dadosPersonagem.inventario[id][campo] = valor;
            salvarNoStorage(dadosPersonagem);
            renderizarInventario();
            renderizarAcessoRapido();
        }

        // ============================================
        // ACESSO RÁPIDO
        // ============================================
        function renderizarAcessoRapido() {
            const container = document.getElementById('quick-access-items');
            container.innerHTML = '';
            const items = dadosPersonagem?.inventario || {};
            let temItem = false;

            for (let id in items) {
                const item = items[id];
                if (item.tipo === 'arma' || item.tipo === 'armadura') {
                    temItem = true;
                    container.innerHTML += `
                        <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:6px; padding:12px; text-align:center;">
                            <div style="font-weight:bold; font-size:0.9rem;">${item.nome || 'Item'}</div>
                            <div style="font-size:0.7rem; color:${item.tipo === 'arma' ? 'var(--accent-red)' : 'var(--accent-purple)'};">
                                ${item.tipo === 'arma' ? '⚔️ Arma' : '🛡️ Armadura'}
                            </div>
                            ${item.dano ? `<div style="font-size:0.8rem; margin-top:5px;">Dano: ${item.dano}</div>` : ''}
                            <button onclick="mostrarToast('Item selecionado: ${item.nome}', 'info')" style="margin-top:8px; background:var(--accent-purple); color:white; border:none; padding:4px 12px; border-radius:4px; cursor:pointer; font-size:0.8rem;">
                                <i class="ph ph-dice-six"></i> Usar
                            </button>
                        </div>
                    `;
                }
            }

            if (!temItem) {
                container.innerHTML = `
                    <div style="grid-column:1/-1; text-align:center; color:var(--text-dim); padding:20px; font-size:0.9rem;">
                        <i class="ph ph-sword" style="font-size:2rem; opacity:0.5; display:block; margin-bottom:10px;"></i>
                        Marque itens como "Arma" ou "Armadura" no inventário
                    </div>
                `;
            }
        }

        // ============================================
        // RESISTÊNCIAS
        // ============================================
        function renderizarResistencias() {
            const container = document.getElementById('resistencia-rows');
            container.innerHTML = '';
            const resistencias = dadosPersonagem?.resistencias || [];

            if (resistencias.length === 0) {
                resistencias.push({ tipo: '', desc: '' });
            }

            resistencias.forEach((row, index) => {
                container.innerHTML += `
                    <div style="display:grid; grid-template-columns:1fr 1fr; border-bottom:1px solid var(--border);">
                        <div style="padding:8px; border-right:1px solid var(--border);">
                            <input type="text" value="${row.tipo || ''}" onchange="atualizarResistencia(${index},'tipo',this.value)" placeholder="Fogo, Frio, Veneno..." style="background:transparent; border:none; color:white; width:100%; padding:4px;">
                        </div>
                        <div style="padding:8px; display:flex; justify-content:space-between; align-items:center;">
                            <input type="text" value="${row.desc || ''}" onchange="atualizarResistencia(${index},'desc',this.value)" placeholder="Resistência +5, Imune..." style="background:transparent; border:none; color:white; width:100%; padding:4px;">
                            <button onclick="removerResistencia(${index})" style="background:none; border:none; color:var(--accent-red); cursor:pointer; padding:4px;"><i class="ph ph-trash"></i></button>
                        </div>
                    </div>
                `;
            });
        }

        function adicionarResistencia() {
            if (!dadosPersonagem.resistencias) dadosPersonagem.resistencias = [];
            dadosPersonagem.resistencias.push({ tipo: '', desc: '' });
            salvarNoStorage(dadosPersonagem);
            renderizarResistencias();
        }

        function removerResistencia(index) {
            if (!dadosPersonagem.resistencias) return;
            dadosPersonagem.resistencias.splice(index, 1);
            salvarNoStorage(dadosPersonagem);
            renderizarResistencias();
        }

        function atualizarResistencia(index, campo, valor) {
            if (!dadosPersonagem.resistencias) return;
            dadosPersonagem.resistencias[index][campo] = valor;
            salvarNoStorage(dadosPersonagem);
        }

        // ============================================
        // HABILIDADES PASSIVAS
        // ============================================
        function renderizarPassivas() {
            const container = document.getElementById('habilidades-passivas-list');
            container.innerHTML = '';
            const habs = dadosPersonagem?.habilidadesPassivas || [];

            habs.forEach((h, i) => {
                const catClass = h.categoria ? 'cat-' + h.categoria.toLowerCase() : '';
                container.innerHTML += `
                    <div class="habilidade-card ${catClass}">
                        <div class="habilidade-header" onclick="togglePassiva(${i})">
                            <div class="habilidade-header-content">
                                <span class="habilidade-nome">${h.nome || 'Nova Habilidade'}</span>
                                <span class="habilidade-categoria">${h.categoria || 'Geral'}</span>
                            </div>
                            <i class="ph ph-caret-down habilidade-toggle ${h.expandida ? 'expanded' : ''}"></i>
                        </div>
                        <div class="habilidade-content ${h.expandida ? 'expanded' : ''}">
                            <div style="display:flex; gap:10px; margin-bottom:10px;">
                                <select onchange="atualizarPassiva(${i},'categoria',this.value)" style="flex:1; background:var(--bg-input); border:1px solid var(--border); color:white; padding:6px; border-radius:4px;">
                                    <option value="Maestria" ${h.categoria === 'Maestria' ? 'selected' : ''}>Maestria</option>
                                    <option value="Talento" ${h.categoria === 'Talento' ? 'selected' : ''}>Talento</option>
                                    <option value="Benção" ${h.categoria === 'Benção' ? 'selected' : ''}>Benção</option>
                                    <option value="Pecado" ${h.categoria === 'Pecado' ? 'selected' : ''}>Pecado</option>
                                </select>
                                <input type="text" value="${h.nome || ''}" onchange="atualizarPassiva(${i},'nome',this.value)" style="flex:2; background:var(--bg-input); border:1px solid var(--border); color:white; padding:6px; border-radius:4px; font-weight:bold;">
                                <button onclick="removerPassiva(${i})" class="btn-danger"><i class="ph ph-trash"></i></button>
                            </div>
                            <textarea onchange="atualizarPassiva(${i},'desc',this.value)" placeholder="Descrição..." style="width:100%; height:60px; background:var(--bg-input); border:1px solid var(--border); color:white; padding:6px; border-radius:4px;">${h.desc || ''}</textarea>
                        </div>
                    </div>
                `;
            });
        }

        function adicionarPassiva() {
            if (!dadosPersonagem.habilidadesPassivas) dadosPersonagem.habilidadesPassivas = [];
            dadosPersonagem.habilidadesPassivas.push({ nome: 'Nova Habilidade', categoria: 'Maestria', desc: '', expandida: false });
            salvarNoStorage(dadosPersonagem);
            renderizarPassivas();
        }

        function togglePassiva(index) {
            if (!dadosPersonagem.habilidadesPassivas) return;
            dadosPersonagem.habilidadesPassivas[index].expandida = !dadosPersonagem.habilidadesPassivas[index].expandida;
            salvarNoStorage(dadosPersonagem);
            renderizarPassivas();
        }

        function atualizarPassiva(index, campo, valor) {
            if (!dadosPersonagem.habilidadesPassivas) return;
            dadosPersonagem.habilidadesPassivas[index][campo] = valor;
            salvarNoStorage(dadosPersonagem);
            renderizarPassivas();
        }

        function removerPassiva(index) {
            if (!confirm('Remover esta habilidade?')) return;
            dadosPersonagem.habilidadesPassivas.splice(index, 1);
            salvarNoStorage(dadosPersonagem);
            renderizarPassivas();
        }

        // ============================================
        // HABILIDADES ATIVAS
        // ============================================
        function renderizarAtivas() {
            const container = document.getElementById('habilidades-ativas-list');
            container.innerHTML = '';
            const habs = dadosPersonagem?.habilidadesAtivas || [];

            habs.forEach((h, i) => {
                const catClass = h.tipo ? 'cat-' + h.tipo.toLowerCase() : '';
                container.innerHTML += `
                    <div class="habilidade-card ${catClass}">
                        <div class="habilidade-header" onclick="toggleAtiva(${i})">
                            <div class="habilidade-header-content">
                                <span class="habilidade-nome">${h.nome || 'Novo Poder'}</span>
                                <span class="habilidade-categoria">${h.tipo || 'Geral'}</span>
                            </div>
                            <i class="ph ph-caret-down habilidade-toggle ${h.expandida ? 'expanded' : ''}"></i>
                        </div>
                        <div class="habilidade-content ${h.expandida ? 'expanded' : ''}">
                            <div style="display:flex; gap:10px; margin-bottom:10px;">
                                <select onchange="atualizarAtiva(${i},'tipo',this.value)" style="flex:1; background:var(--bg-input); border:1px solid var(--border); color:white; padding:6px; border-radius:4px;">
                                    <option value="Magia" ${h.tipo === 'Magia' ? 'selected' : ''}>Magia</option>
                                    <option value="Milagre" ${h.tipo === 'Milagre' ? 'selected' : ''}>Milagre</option>
                                    <option value="Maldição" ${h.tipo === 'Maldição' ? 'selected' : ''}>Maldição</option>
                                </select>
                                <input type="text" value="${h.nome || ''}" onchange="atualizarAtiva(${i},'nome',this.value)" style="flex:2; background:var(--bg-input); border:1px solid var(--border); color:white; padding:6px; border-radius:4px; font-weight:bold;">
                                <button onclick="removerAtiva(${i})" class="btn-danger"><i class="ph ph-trash"></i></button>
                            </div>
                            ${h.tipo === 'Magia' ? `
                                <div style="display:flex; align-items:center; gap:10px; margin:10px 0;">
                                    <input type="checkbox" class="checkbox-ativa" ${h.ativa ? 'checked' : ''} onchange="atualizarAtiva(${i},'ativa',this.checked)">
                                    <span>Magia Ativa</span>
                                </div>
                                <div class="glifo-grid">
                                    <div class="glifo-item"><b>Arcanos:</b> <input class="input-glifo" value="${h.arcanos || ''}" onchange="atualizarAtiva(${i},'arcanos',this.value)"></div>
                                    <div class="glifo-item"><b>Forma:</b> <input class="input-glifo" value="${h.forma || ''}" onchange="atualizarAtiva(${i},'forma',this.value)"></div>
                                    <div class="glifo-item"><b>Função:</b> <input class="input-glifo" value="${h.funcao || ''}" onchange="atualizarAtiva(${i},'funcao',this.value)"></div>
                                    <div class="glifo-item"><b>Efeito:</b> <input class="input-glifo" value="${h.efeito || ''}" onchange="atualizarAtiva(${i},'efeito',this.value)"></div>
                                    <div class="glifo-item"><b>Duração:</b> <input class="input-glifo" value="${h.duracao || ''}" onchange="atualizarAtiva(${i},'duracao',this.value)"></div>
                                    <div class="glifo-item"><b>Alvos:</b> <input class="input-glifo" value="${h.alvos || ''}" onchange="atualizarAtiva(${i},'alvos',this.value)"></div>
                                    <div class="glifo-item"><b>Custo:</b> <input class="input-glifo" value="${h.custo || ''}" onchange="atualizarAtiva(${i},'custo',this.value)"></div>
                                    <div class="glifo-item"><b>Amplificadores:</b> <input class="input-glifo" value="${h.amplificadores || ''}" onchange="atualizarAtiva(${i},'amplificadores',this.value)"></div>
                                </div>
                            ` : `
                                <div style="margin:10px 0; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                                    <div>
                                        <label style="font-size:0.8rem; color:var(--text-dim);">Concedido por:</label>
                                        <input type="text" value="${h.concedido || ''}" onchange="atualizarAtiva(${i},'concedido',this.value)" style="width:100%; background:var(--bg-input); border:1px solid var(--border); color:white; padding:6px; border-radius:4px;">
                                    </div>
                                    <div>
                                        <label style="font-size:0.8rem; color:var(--text-dim);">Custo:</label>
                                        <input type="text" value="${h.custo || ''}" onchange="atualizarAtiva(${i},'custo',this.value)" style="width:100%; background:var(--bg-input); border:1px solid var(--border); color:white; padding:6px; border-radius:4px;">
                                    </div>
                                </div>
                            `}
                            <div style="margin:10px 0; display:flex; gap:10px; align-items:center;">
                                <div style="flex:1;">
                                    <label style="font-size:0.8rem; color:var(--text-dim);">Dano:</label>
                                    <input type="text" placeholder="Ex: 2d6+3" value="${h.dano || ''}" onchange="atualizarAtiva(${i},'dano',this.value)" style="width:100%; background:var(--bg-input); border:1px solid var(--border); color:white; padding:6px; border-radius:4px;">
                                </div>
                                ${h.dano ? `<button onclick="rolarDano('${h.dano}', '${h.nome}')" style="background:var(--accent-red); color:white; border:none; padding:8px 12px; border-radius:4px; cursor:pointer;"><i class="ph ph-dice-six"></i> Rolar</button>` : ''}
                            </div>
                            <textarea onchange="atualizarAtiva(${i},'desc',this.value)" placeholder="Descrição..." style="width:100%; height:50px; background:var(--bg-input); border:1px solid var(--border); color:white; padding:6px; border-radius:4px;">${h.desc || ''}</textarea>
                        </div>
                    </div>
                `;
            });
        }

        function adicionarAtiva() {
            if (!dadosPersonagem.habilidadesAtivas) dadosPersonagem.habilidadesAtivas = [];
            dadosPersonagem.habilidadesAtivas.push({
                nome: 'Novo Poder',
                tipo: 'Magia',
                ativa: false,
                arcanos: '',
                forma: '',
                funcao: '',
                efeito: '',
                duracao: '',
                alvos: '',
                custo: '',
                amplificadores: '',
                concedido: '',
                dados: '',
                dano: '',
                desc: '',
                expandida: false
            });
            salvarNoStorage(dadosPersonagem);
            renderizarAtivas();
        }

        function toggleAtiva(index) {
            if (!dadosPersonagem.habilidadesAtivas) return;
            dadosPersonagem.habilidadesAtivas[index].expandida = !dadosPersonagem.habilidadesAtivas[index].expandida;
            salvarNoStorage(dadosPersonagem);
            renderizarAtivas();
        }

        function atualizarAtiva(index, campo, valor) {
            if (!dadosPersonagem.habilidadesAtivas) return;
            dadosPersonagem.habilidadesAtivas[index][campo] = valor;
            salvarNoStorage(dadosPersonagem);
            renderizarAtivas();
        }

        function removerAtiva(index) {
            if (!confirm('Remover este poder?')) return;
            dadosPersonagem.habilidadesAtivas.splice(index, 1);
            salvarNoStorage(dadosPersonagem);
            renderizarAtivas();
        }

        function rolarDano(formula, nome) {
            const match = formula.match(/(\d+)d(\d+)([+-]\d+)?/);
            if (!match) {
                mostrarToast('Fórmula inválida. Use ex: 2d6+3', 'error');
                return;
            }

            const numDice = parseInt(match[1]) || 1;
            const sides = parseInt(match[2]) || 6;
            const mod = parseInt(match[3]) || 0;

            let rolls = [];
            let total = 0;
            for (let i = 0; i < numDice; i++) {
                const r = Math.floor(Math.random() * sides) + 1;
                rolls.push(r);
                total += r;
            }
            total += mod;

            mostrarResultado(
                `Dano: ${nome}`,
                `${numDice}d${sides}${mod > 0 ? '+' + mod : mod < 0 ? mod : ''}<br> Rolagens: ${rolls.join(', ')}${mod !== 0 ? ' | Modificador: ' + (mod > 0 ? '+' : '') + mod : ''}`,
                total,
                rolls,
                false
            );
        }

        // ============================================
        // INICIALIZAR
        // ============================================
        document.addEventListener('DOMContentLoaded', init);
