let currentCharId = null;
let charData = {};

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

function calcularGrandeNivel(nivel) {
    if (nivel <= 0) return 1;
    if (nivel < 20) return 1;
    return Math.floor((nivel - 10) / 10) + 1;
}

function init() {
    const createAttrHTML = (name, type) => `
        <div class="attr-row">
            <span class="attr-name">${name}</span>
            <div class="attr-vals">
                <input type="number" onchange="updateAttr('${name}', '${type}', this.value)" id="attr-${name}" style="font-size: 1.2rem; height: 40px; width: 70px; text-align: center;">
                <div class="big-level" id="gd-${name}">+0</div>
            </div>
        </div>`;
    document.getElementById('main-attrs-container').innerHTML = mainAttrs.map(n => createAttrHTML(n, 'main')).join('');
    document.getElementById('spec-attrs-container').innerHTML = specAttrs.map(n => createAttrHTML(n, 'spec')).join('');

    renderSkillsGrid();
    
    // Inicializa com dados vazios
    charData = loadFromStorage() || getDefaultCharData();
    saveToStorage(charData);
    renderChar();
}

function getDefaultCharData() {
    return {
        nome: 'Novo Personagem',
        nivel: 1,
        gnivel: 1,
        divinity_val: 50,
        lembrancas: 0,
        atributos: {},
        pericias: {},
        inventario: {},
        defesa: {},
        habilidadesPassivas: [],
        habilidadesAtivas: [],
        resistencias: []
    };
}

function loadFromStorage() {
    try {
        const data = localStorage.getItem('ficha_personagem');
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

function saveToStorage(data) {
    try {
        localStorage.setItem('ficha_personagem', JSON.stringify(data));
    } catch (e) {
        console.error('Erro ao salvar:', e);
    }
}

function renderSkillsGrid() {
    const container = document.getElementById('skills-grid-container');
    let html = `
        <div class="skill-grid">
            <div class="skill-header">Perícia</div>
            <div class="skill-header">Atributo</div>
            <div class="skill-header">Bônus Total</div>
            <div class="skill-header">Treino</div>
            <div class="skill-header">Outros</div>
            <div class="skill-header">Rolar</div>`;
    skillsList.forEach(skill => {
        html += `
            <div class="skill-cell pericia">${skill}</div>
            <div class="skill-cell">
                <select id="skill-attr-${skill}" onchange="saveSkillAttr('${skill}', this.value)" style="width: 100%;">
                    <option value="">Selecione</option>
                    ${Object.entries(attrAbbreviations).map(([full, abbr]) => `<option value="${full}">${abbr}</option>`).join('')}
                </select>
            </div>
            <div class="skill-cell"><div id="skill-bonus-${skill}" class="skill-bonus green">0</div></div>
            <div class="skill-cell"><input type="number" id="skill-treino-${skill}" class="skill-input" onchange="updateSkillBonus('${skill}')" value="0" min="0"></div>
            <div class="skill-cell"><input type="number" id="skill-outros-${skill}" class="skill-input" onchange="updateSkillBonus('${skill}')" value="0"></div>
            <div class="skill-cell"><i class="ph ph-dice-six dice-icon" onclick="rollSkill('${skill}')"></i></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function updateSkillBonus(skillName) {
    const treino = parseInt(document.getElementById(`skill-treino-${skillName}`).value) || 0;
    const outros = parseInt(document.getElementById(`skill-outros-${skillName}`).value) || 0;
    const attrName = document.getElementById(`skill-attr-${skillName}`).value;
    
    let attrBonus = 0;
    if (attrName && charData.atributos && charData.atributos[attrName]) {
        attrBonus = Math.floor(charData.atributos[attrName] / 10);
    }
    
    const total = treino + outros + attrBonus;
    const bonusElement = document.getElementById(`skill-bonus-${skillName}`);
    bonusElement.textContent = total >= 0 ? `+${total}` : total;
    
    if (total <= 5) bonusElement.className = 'skill-bonus green';
    else if (total <= 10) bonusElement.className = 'skill-bonus blue';
    else if (total <= 15) bonusElement.className = 'skill-bonus purple';
    else bonusElement.className = 'skill-bonus yellow';
    
    // Salva no charData
    if (!charData.pericias) charData.pericias = {};
    if (!charData.pericias[skillName]) charData.pericias[skillName] = {};
    charData.pericias[skillName].treino = treino;
    charData.pericias[skillName].outros = outros;
    charData.pericias[skillName].atributo = attrName;
    charData.pericias[skillName].total = total;
    saveToStorage(charData);
}

function saveSkillAttr(skillName, attrName) { updateSkillBonus(skillName); }

function updateNivel(value) {
    const nivel = parseInt(value) || 1;
    const gnivel = calcularGrandeNivel(nivel);
    document.getElementById('i-gnivel').value = gnivel;
    charData.nivel = nivel;
    charData.gnivel = gnivel;
    saveToStorage(charData);
}

function saveData(field, value) {
    charData[field] = value;
    saveToStorage(charData);
}

function updateAttr(name, type, val) {
    const num = parseInt(val) || 0;
    if (!charData.atributos) charData.atributos = {};
    charData.atributos[name] = num;
    document.getElementById(`gd-${name}`).innerText = '+' + Math.floor(num / 10);
    saveToStorage(charData);
    if (charData.pericias) {
        Object.keys(charData.pericias).forEach(skill => {
            const skillData = charData.pericias[skill];
            if (skillData && skillData.atributo === name) updateSkillBonus(skill);
        });
    }
}

function updateDivinity(val) {
    const hum = 100 - val;
    document.getElementById('val-hum').innerText = hum + '%';
    document.getElementById('val-div').innerText = val + '%';
    document.getElementById('humanity-bar').style.width = hum + '%';
    document.getElementById('divinity-bar').style.width = val + '%';
}

function calcEsquiva() {
    const fields = ['natural', 'escudo', 'armadura', 'itens', 'tecnicas', 'reflexos'];
    let updates = {};
    let total = 0;
    fields.forEach(f => {
        const val = parseInt(document.getElementById(`esq-${f}`).value) || 0;
        updates[`esquiva_${f}`] = val;
        total += val;
    });
    document.getElementById('total-esquiva').innerText = total;
    if (!charData.defesa) charData.defesa = {};
    Object.assign(charData.defesa, updates);
    saveToStorage(charData);
}

function renderChar() {
    const fields = ['nome', 'classe', 'nivel', 'gnivel', 'dom', 'pv_atual', 'pv_max', 'ed_atual', 'ed_max', 'eh_atual', 'eh_max', 'vig_atual', 'vig_esquivas', 'pos_grande', 'pos_pequena', 'img', 'lembrancas'];
    fields.forEach(id => {
        const el = document.getElementById('i-'+id) || document.getElementById(id.replace('_','-'));
        if(el) el.value = charData[id] || '';
    });
    if (charData.nivel) {
        const nivel = parseInt(charData.nivel) || 1;
        document.getElementById('i-gnivel').value = calcularGrandeNivel(nivel);
    }

    if(charData.img) document.getElementById('preview-img').src = charData.img;
    
    const updateBar = (id, cur, max) => {
        const el = document.getElementById(id);
        if(el) el.style.width = (Math.min(100, (parseFloat(cur) / (parseFloat(max) || 1)) * 100)) + '%';
    };
    updateBar('bar-pv-width', charData.pv_atual, charData.pv_max);
    updateBar('bar-ed-width', charData.ed_atual, charData.ed_max);
    updateBar('bar-eh-width', charData.eh_atual, charData.eh_max);

    if (charData.atributos) {
        for (let [key, val] of Object.entries(charData.atributos)) {
            const el = document.getElementById(`attr-${key}`);
            if (el) { el.value = val; document.getElementById(`gd-${key}`).innerText = '+' + Math.floor(val/10); }
        }
    }

    if (charData.pericias) {
        skillsList.forEach(skill => {
            const skillData = charData.pericias[skill];
            if (skillData) {
                const attrSelect = document.getElementById(`skill-attr-${skill}`);
                const treinoInput = document.getElementById(`skill-treino-${skill}`);
                const outrosInput = document.getElementById(`skill-outros-${skill}`);
                if (attrSelect) attrSelect.value = skillData.atributo || '';
                if (treinoInput) treinoInput.value = skillData.treino || 0;
                if (outrosInput) outrosInput.value = skillData.outros || 0;
                updateSkillBonus(skill);
            }
        });
    }

    const dVal = charData.divinity_val || 50;
    document.getElementById('div-slider').value = dVal;
    updateDivinity(dVal);

    if (charData.defesa) {
        let total = 0;
        ['natural', 'escudo', 'armadura', 'itens', 'tecnicas', 'reflexos'].forEach(f => {
            const val = charData.defesa[`esquiva_${f}`] || 0;
            const el = document.getElementById('esq-'+f);
            if(el) el.value = val;
            total += val;
        });
        document.getElementById('total-esquiva').innerText = total;
    }

    document.getElementById('w-max').value = charData.carga_max || 20;
    document.getElementById('anotacoes').value = charData.anotacoes || '';

    renderInventory();
    renderHabilidadesPassivas();
    renderHabilidadesAtivas();
    renderQuickAccessItems();
    renderResistencias();
}

function renderInventory() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';
    const items = charData.inventario || {};
    let pesoTotal = 0;
    for(let id in items) pesoTotal += parseFloat(items[id].peso) || 0;
    
    const cargaMax = parseFloat(charData.carga_max) || 20;
    const porcentagem = cargaMax > 0 ? Math.round((pesoTotal / cargaMax) * 100) : 0;
    
    const cargaDisplay = document.getElementById('carga-display');
    if (cargaDisplay) {
        cargaDisplay.innerHTML = `
            <label>Carga Atual / Máxima (${porcentagem}%)</label>
            <div style="display: flex; gap: 10px; align-items: center; margin-top: 5px;">
                <span id="w-curr" style="color: ${porcentagem > 100 ? 'var(--accent-red)' : porcentagem > 80 ? 'var(--accent-yellow)' : 'white'}">${pesoTotal}</span>
                / <input type="number" id="w-max" value="${cargaMax}" style="width: 60px;" onchange="saveData('carga_max', this.value); renderInventory()">
            </div>
            <div style="height: 4px; background: #333; border-radius: 2px; margin-top: 8px; overflow: hidden;">
                <div id="carga-bar" style="height: 100%; width: ${Math.min(100, porcentagem)}%; background: ${porcentagem > 100 ? 'var(--accent-red)' : porcentagem > 80 ? 'var(--accent-yellow)' : 'var(--accent-purple)'};"></div>
            </div>`;
    }
    
    for(let id in items) {
        const item = items[id];
        list.innerHTML += `
            <div class="ability-box" style="margin-bottom: 10px;">
                <div class="inv-item" style="padding: 10px; grid-template-columns: 1fr 50px 85px auto 30px 30px;">
                    <input type="text" value="${item.nome}" onchange="updateItem('${id}', 'nome', this.value)" placeholder="Nome do Item">
                    <input type="number" value="${item.peso}" onchange="updateItem('${id}', 'peso', this.value)" placeholder="Peso" step="0.1">
                    <select onchange="updateItem('${id}', 'tipo', this.value)" style="background: var(--bg-input); color: white; border: 1px solid var(--border); padding: 2px; border-radius: 4px;">
                        <option value="item" ${item.tipo === 'item' ? 'selected' : ''}>Item</option>
                        <option value="arma" ${item.tipo === 'arma' ? 'selected' : ''}>Arma</option>
                        <option value="armadura" ${item.tipo === 'armadura' ? 'selected' : ''}>Armad.</option>
                    </select>
                    ${item.tipo === 'arma' ? `
                        <div style="display: flex; align-items: center; gap: 8px; margin-left: auto; margin-right: 8px;">
                            <select id="roll-mode-qa-${id}" onclick="event.stopPropagation()" style="background: var(--bg-card); color: var(--accent-yellow); border: 1px solid var(--accent-yellow); border-radius: 4px; padding: 2px; font-size: 0.75rem; cursor: pointer;">
                                <option value="all" selected>Completo</option>
                                <option value="test">Só Teste</option>
                                <option value="damage">Só Dano</option>
                                <option value="crit">Só Crítico</option>
                            </select>
                            <i class="ph ph-dice-six dice-icon damage" onclick="event.stopPropagation(); rollWeaponAttack('${id}', document.getElementById('roll-mode-qa-${id}').value)" title="Rolar"></i>
                        </div>
                    ` : '<div style="margin-left: auto;"></div>'}
                    <button style="color:var(--accent-purple); border:none; background:none; cursor:pointer;" onclick="this.parentElement.nextElementSibling.classList.toggle('open')"><i class="ph ph-caret-down"></i></button>
                    <button style="color:red; border:none; background:none; cursor:pointer;" onclick="delItem('${id}')"><i class="ph ph-trash"></i></button>
                </div>
                <div class="ability-content">
                    ${item.tipo === 'arma' ? `
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                            <div>
                                <label style="font-size: 0.8rem; color: var(--text-dim);">Dano:</label>
                                <input type="text" value="${item.dano || ''}" onchange="updateItem('${id}', 'dano', this.value)" placeholder="Ex: 1d8+2" style="width: 100%;">
                            </div>
                            <div>
                                <label style="font-size: 0.8rem; color: var(--text-dim);">Teste:</label>
                                <input type="text" value="${item.teste || ''}" onchange="updateItem('${id}', 'teste', this.value)" placeholder="Ex: 2d20+6" style="width: 100%;">
                            </div>
                            <div>
                                <label style="font-size: 0.8rem; color: var(--text-dim);">Crítico:</label>
                                <input type="text" value="${item.critico || ''}" onchange="updateItem('${id}', 'critico', this.value)" placeholder="Ex: 19-20/x3" style="width: 100%;">
                            </div>
                        </div>` : ''}
                    <textarea placeholder="Descrição do item..." onchange="updateItem('${id}', 'desc', this.value)">${item.desc || ''}</textarea>
                </div>
            </div>`;
    }
}

function updateItem(id, f, v) { 
    if (!charData.inventario) charData.inventario = {};
    if (!charData.inventario[id]) charData.inventario[id] = {};
    charData.inventario[id][f] = v;
    saveToStorage(charData);
    setTimeout(() => { renderInventory(); renderQuickAccessItems(); }, 300);
}

function addItem() { 
    if (!charData.inventario) charData.inventario = {};
    const id = Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    charData.inventario[id] = { nome: "Novo Item", peso: 0, tipo: "item" };
    saveToStorage(charData);
    renderInventory();
}

function delItem(id) { 
    if(confirm("Deletar item?")) {
        if (charData.inventario) delete charData.inventario[id];
        saveToStorage(charData);
        setTimeout(() => { renderInventory(); renderQuickAccessItems(); }, 300);
    }
}

function renderQuickAccessItems() {
    const container = document.getElementById('quick-access-items');
    if (!container) return;
    
    container.innerHTML = '';
    const items = charData.inventario || {};
    let hasItems = false;
    for(let id in items) {
        const item = items[id];
        if (item.tipo === 'arma' || item.tipo === 'armadura') {
            hasItems = true;
            container.innerHTML += `
                <div class="ability-box" style="margin: 0;">
                    <div class="ability-header" onclick="this.nextElementSibling.classList.toggle('open')">
                        <span style="font-size: 0.9rem;">${item.nome || 'Item'}</span>
                        <span style="font-size: 0.7rem; color: ${item.tipo === 'arma' ? 'var(--accent-red)' : 'var(--accent-purple)'}; margin-left: 8px;">
                            ${item.tipo === 'arma' ? 'Arma' : 'Armadura'}
                        </span>
                        ${item.tipo === 'arma' ? `
                            <div style="display: flex; align-items: center; gap: 8px; margin-left: auto; margin-right: 8px;">
                                <select id="roll-mode-qa-${id}" onclick="event.stopPropagation()" style="background: var(--bg-card); color: var(--accent-yellow); border: 1px solid var(--accent-yellow); border-radius: 4px; padding: 2px; font-size: 0.75rem; cursor: pointer;">
                                    <option value="all" selected>Completo</option>
                                    <option value="test">Só Teste</option>
                                    <option value="damage">Só Dano</option>
                                    <option value="crit">Só Crítico</option>
                                </select>
                                <i class="ph ph-dice-six dice-icon damage" onclick="event.stopPropagation(); rollWeaponAttack('${id}', document.getElementById('roll-mode-qa-${id}').value)" title="Rolar"></i>
                            </div>
                        ` : '<div style="margin-left: auto;"></div>'}
                        <i class="ph ph-caret-down"></i>
                    </div>
                    <div class="ability-content">
                        ${item.dano ? `
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                                <div style="text-align: center;">
                                    <div style="font-size: 0.7rem; color: var(--text-dim); margin-bottom: 4px;">Dano</div>
                                    <div style="font-size: 1.2rem; font-weight: bold; color: var(--accent-red);">${item.dano || '--'}</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 0.7rem; color: var(--text-dim); margin-bottom: 4px;">Teste</div>
                                    <div style="font-size: 1.2rem; font-weight: bold; color: var(--accent-yellow);">${item.teste || '--'}</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 0.7rem; color: var(--text-dim); margin-bottom: 4px;">Crítico</div>
                                    <div style="font-size: 1.2rem; font-weight: bold; color: var(--accent-purple);">${item.critico || '--'}</div>
                                </div>
                            </div>` : ''}
                        ${item.desc ? `
                            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #333;">
                                <div style="font-size: 0.8rem; color: var(--text-dim);">${item.desc || ''}</div>
                            </div>` : ''}
                    </div>
                </div>`;
        }
    }
    
    if (!hasItems) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-dim); padding: 20px; font-size: 0.9rem;">
                <i class="ph ph-sword" style="font-size: 2rem; opacity: 0.5; display: block; margin-bottom: 10px;"></i>
                Marque itens como "Arma" ou "Armadura" no inventário<br>para aparecerem aqui
            </div>`;
    }
}

function playDiceSound() {
    const diceSound = document.getElementById('dice-sound');
    if (diceSound) {
        diceSound.currentTime = 0;
        diceSound.play().catch(e => console.log("Erro ao tocar som:", e));
    }
}

function rollSkill(skillName) {
    document.getElementById('roll-result').style.display = 'none';
    playDiceSound();
    
    const skillData = charData.pericias && charData.pericias[skillName];
    if (!skillData) {
        showRollResult('Perícia não configurada', 'Configure o atributo desta perícia primeiro', 0);
        return;
    }
    
    const attrName = skillData.atributo;
    const attrValue = charData.atributos && charData.atributos[attrName] || 0;
    const grandeNivel = Math.floor(attrValue / 10);
    const treino = skillData.treino || 0;
    const outros = skillData.outros || 0;
    
    const numDice = 1 + grandeNivel;
    let rolls = [];
    let critRolls = [];
    
    for (let i = 0; i < numDice; i++) {
        const roll = Math.floor(Math.random() * 20) + 1;
        rolls.push(roll);
        if (roll === 20) critRolls.push(roll);
    }
    
    const maxRoll = Math.max(...rolls);
    const total = maxRoll + grandeNivel + treino + outros;
    const isCrit = critRolls.length > 0;
    
    showRollResult(
        `Teste de ${skillName}`,
        `Atributo: ${attrAbbreviations[attrName] || attrName} (Grande Nível +${grandeNivel})<br>` +
        `Rolou ${numDice}d20, usando o maior: ${maxRoll}<br>` +
        `Modificadores: Grande Nível +${grandeNivel} | Treino +${treino} | Outros +${outros}`,
        total,
        rolls,
        isCrit
    );
}

function parseComplexDiceExpr(expr, isCrit, critMultiplier) {
    if (!expr) return { total: 0, rolls: [], details: [], totalModifiers: 0 };
    const cleanExpr = expr.replace(/\s+/g, '');
    const tokenRegex = /([+-]?)(?:(\d+)d(\d+)|(\d+))/g;
    
    let total = 0;
    let rolls = [];
    let details = [];
    let totalModifiers = 0;
    let match;
    let hasMatches = false;
    
    while ((match = tokenRegex.exec(cleanExpr)) !== null) {
        hasMatches = true;
        const sign = match[1] === '-' ? -1 : 1;
        
        if (match[2] && match[3]) {
            const numDiceBase = parseInt(match[2]);
            const sides = parseInt(match[3]);
            const numDice = isCrit ? numDiceBase * critMultiplier : numDiceBase;
            
            let diceTotal = 0;
            let diceRollsPart = [];
            for (let i = 0; i < numDice; i++) {
                const r = Math.floor(Math.random() * sides) + 1;
                diceRollsPart.push(r);
                diceTotal += r;
                rolls.push(r); 
            }
            const subTotal = diceTotal * sign;
            total += subTotal;
            
            const signStr = sign === -1 ? '-' : (details.length > 0 ? '+' : '');
            details.push(`${signStr}${numDice}d${sides}: [${diceRollsPart.join(', ')}] = ${subTotal}`);
            
        } else if (match[4]) {
            const modVal = parseInt(match[4]);
            totalModifiers += modVal * sign;
        }
    }
    
    if (!hasMatches) {
        return { total: 0, rolls: [], details: ["Fórmula inválida"], totalModifiers: 0 };
    }
    
    total += totalModifiers;
    return { total, rolls, details, totalModifiers };
}

function rollWeaponAttack(itemId, mode = 'all') {
    const items = charData.inventario || {};
    const item = items[itemId];
    
    if (!item || item.tipo !== 'arma') {
        showRollResult('Item não encontrado', 'Este não é uma arma válida', 0);
        return;
    }
    
    playDiceSound();
    
    const danoExpr = item.dano || '1d6';
    const testeExpr = item.teste || '1d20';
    const criticoExpr = item.critico || '20/x2';
    
    let critMultiplier = 2;
    let critRange = [20];
    
    const critMatch = criticoExpr.match(/(\d+)(?:-(\d+))?\/[xX]?(\d+)[xX]?/);
    if (critMatch) {
        const start = parseInt(critMatch[1]);
        const end = critMatch[2] ? parseInt(critMatch[2]) : start;
        critRange = [];
        for (let i = start; i <= end; i++) {
            critRange.push(i);
        }
        critMultiplier = parseInt(critMatch[3]);
    }

    let ataqueTotal = 0;
    let ataqueRolls = [];
    let ataqueIsCrit = false;
    let testeDescricao = '';
    
    if (mode === 'all' || mode === 'test') {
        const testeMatch = testeExpr.match(/(\d+)d20([+-]\d+)?/);
        let numDiceAtaque = 1;
        let bonusAtaque = 0;
        
        if (testeMatch) {
            numDiceAtaque = parseInt(testeMatch[1]) || 1;
            bonusAtaque = testeMatch[2] ? parseInt(testeMatch[2]) : 0;
        }
        
        for (let i = 0; i < numDiceAtaque; i++) {
            const roll = Math.floor(Math.random() * 20) + 1;
            ataqueRolls.push(roll);
        }
        const maxAtaqueRoll = Math.max(...ataqueRolls);
        ataqueTotal = maxAtaqueRoll + bonusAtaque;
        ataqueIsCrit = ataqueRolls.some(roll => critRange.includes(roll));
        testeDescricao = `Teste: ${testeExpr} (Rolou ${numDiceAtaque}d20, maior: ${maxAtaqueRoll}${bonusAtaque ? (bonusAtaque > 0 ? ` + ${bonusAtaque}` : ` - ${Math.abs(bonusAtaque)}`) : ''})`;
    }

    let danoTotal = 0;
    let danoRolls = [];
    let danoDescricao = '';
    
    if (mode === 'all' || mode === 'damage' || mode === 'crit') {
        let forceCrit = (mode === 'crit');
        let isCritToUse = (mode === 'all') ? ataqueIsCrit : forceCrit;

        const parsedDano = parseComplexDiceExpr(danoExpr, isCritToUse, critMultiplier);
        danoTotal = parsedDano.total;
        danoRolls = parsedDano.rolls;
        
        danoDescricao = parsedDano.details.join('<br>');
        if (parsedDano.totalModifiers !== 0) {
            danoDescricao += `<br>Modificador: ${parsedDano.totalModifiers > 0 ? '+' : ''}${parsedDano.totalModifiers}`;
        }
        
        if (mode === 'damage' || mode === 'crit') {
            ataqueTotal = 0;
            ataqueRolls = [];
            ataqueIsCrit = isCritToUse;
            testeDescricao = (mode === 'crit') ? 'Rolagem de Apenas Dano Crítico' : 'Rolagem de Apenas Dano';
        }
    }

    if (mode === 'test') {
        showRollResult(
            `Ataque com ${item.nome}`,
            `${testeDescricao}<br>Crítico: ${criticoExpr}${ataqueIsCrit ? ' <span style="color:var(--accent-red)">(ACERTO CRÍTICO!)</span>' : ''}`,
            ataqueTotal,
            ataqueRolls,
            ataqueIsCrit
        );
    } else if (mode === 'damage' || mode === 'crit') {
        showRollResult(
            `Dano com ${item.nome} ${mode === 'crit' ? '(Crítico forçado)' : ''}`,
            `${danoDescricao}<br>Crítico da Arma: ${criticoExpr}`,
            danoTotal,
            danoRolls,
            mode === 'crit'
        );
    } else {
        showWeaponAttackResult(
            item.nome,
            ataqueTotal,
            ataqueRolls,
            ataqueIsCrit,
            danoTotal,
            danoRolls,
            0,
            criticoExpr,
            testeDescricao,
            danoDescricao
        );
    }
}

function rolarDadoCustom(formula, nome) {
    if(!formula) return;
    playDiceSound();
    
    const parsedResult = parseComplexDiceExpr(formula, false, 1);
    
    let description = `Fórmula: ${formula}<br>`;
    if (parsedResult.details.length > 0) {
        description += parsedResult.details.join('<br>');
    }
    if (parsedResult.totalModifiers !== 0) {
        description += `<br>Modificador: ${parsedResult.totalModifiers > 0 ? '+' : ''}${parsedResult.totalModifiers}`;
    }
    
    showRollResult(
        nome,
        description,
        parsedResult.total,
        parsedResult.rolls,
        false
    );
}

function showRollResult(title, description, total, rolls = [], isCrit = false) {
    const resultDiv = document.getElementById('roll-result');
    const rollTotal = document.getElementById('roll-total');
    const rollDesc = document.getElementById('roll-description');
    const rollDetails = document.getElementById('roll-details');
    const diceRolls = document.getElementById('dice-rolls');
    const damageDiv = document.getElementById('damage-result');
    damageDiv.style.display = 'none';
    
    rollDesc.innerHTML = `<strong>${title}</strong>`;
    rollDetails.innerHTML = description;
    rollTotal.textContent = total;
    rollTotal.className = `roll-total${isCrit ? ' crit' : ''}`;
    
    if (rolls.length > 0) {
        diceRolls.innerHTML = rolls.map(roll => `<div class="dice-roll${roll === 20 ? ' crit' : ''}">${roll}</div>`).join('');
        diceRolls.style.display = 'flex';
    } else {
        diceRolls.style.display = 'none';
    }
    
    resultDiv.style.display = 'block';
}

function showWeaponAttackResult(weaponName, ataqueTotal, ataqueRolls, isCrit, danoTotal, danoRolls, bonus, criticoExpr, testeDescricao, danoDescricao = '') {
    const resultDiv = document.getElementById('roll-result');
    const rollTotal = document.getElementById('roll-total');
    const rollDesc = document.getElementById('roll-description');
    const rollDetails = document.getElementById('roll-details');
    const diceRolls = document.getElementById('dice-rolls');
    const damageDiv = document.getElementById('damage-result');
    const damageTotal = document.getElementById('damage-total');
    const damageDetails = document.getElementById('damage-details');
    
    rollDesc.innerHTML = `<strong>Ataque com ${weaponName}</strong>`;
    rollDetails.innerHTML = `${testeDescricao}<br>` + `Crítico: ${criticoExpr || '20/x2'}${isCrit ? ' <span style="color:var(--accent-red)">(ACERTO CRÍTICO!)</span>' : ''}`;
    rollTotal.textContent = ataqueTotal;
    rollTotal.className = `roll-total${isCrit ? ' crit' : ''}`;
    
    if (ataqueRolls.length > 0) {
        diceRolls.innerHTML = ataqueRolls.map(roll => 
            `<div class="dice-roll${roll === 20 || (criticoExpr.includes('-') && criticoExpr.split('/')[0].split('-').map(Number).some(range => roll >= range)) ? ' crit' : ''}">${roll}</div>`
        ).join('');
        diceRolls.style.display = 'flex';
    } else {
        diceRolls.style.display = 'none';
    }
    
    damageTotal.textContent = danoTotal;
    if (danoDescricao) {
        damageDetails.innerHTML = danoDescricao;
    } else {
        damageDetails.innerHTML = `Dano: ${danoRolls.join(' + ')}${bonus ? ` + ${bonus}` : ''}<br>` + `${isCrit ? `<span style="color:var(--accent-red)">Dano Crítico (${criticoExpr})</span>` : ''}`;
    }
    
    damageDiv.style.display = 'block';
    resultDiv.style.display = 'block';
}

function addHabilidadePassiva() {
    if (!charData.habilidadesPassivas) charData.habilidadesPassivas = [];
    charData.habilidadesPassivas.push({ nome: 'Nova Habilidade', categoria: 'Maestria', desc: '', expandida: false });
    saveToStorage(charData);
    renderHabilidadesPassivas();
}

function renderHabilidadesPassivas() {
    const container = document.getElementById('habilidades-passivas-list');
    container.innerHTML = '';
    const habs = charData.habilidadesPassivas || [];
    const ordem = ['Maestria', 'Talento', 'Benção', 'Pecado'];
    habs.sort((a, b) => ordem.indexOf(a.categoria) - ordem.indexOf(b.categoria));

    habs.forEach((h, i) => {
        const categoriaNormalizada = h.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const colorClass = `cat-${categoriaNormalizada}`;
        
        const card = document.createElement('div');
        card.className = `habilidade-card ${colorClass}`;
        card.innerHTML = `
            <div class="habilidade-header" onclick="toggleHabilidadePassiva(${i})">
                <div class="habilidade-header-content">
                    <span class="habilidade-nome">${h.nome || 'Nova Habilidade'}</span>
                    <span class="habilidade-categoria">${h.categoria}</span>
                </div>
                <i class="ph ph-caret-down habilidade-toggle ${h.expandida ? 'expanded' : ''}"></i>
            </div>
            <div class="habilidade-content ${h.expandida ? 'expanded' : ''}">
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <select onchange="updateHabilidadePassiva(${i}, 'categoria', this.value)" style="flex:1">
                        <option value="Maestria" ${h.categoria === 'Maestria' ? 'selected' : ''}>Maestria</option>
                        <option value="Talento" ${h.categoria === 'Talento' ? 'selected' : ''}>Talento</option>
                        <option value="Benção" ${h.categoria === 'Benção' ? 'selected' : ''}>Benção</option>
                        <option value="Pecado" ${h.categoria === 'Pecado' ? 'selected' : ''}>Pecado</option>
                    </select>
                    <input type="text" value="${h.nome}" onchange="updateHabilidadePassiva(${i}, 'nome', this.value)" style="flex:2; font-weight:bold;">
                    <button onclick="removeHabilidadePassiva(${i})" class="btn-danger"><i class="ph ph-trash"></i></button>
                </div>
                <textarea onchange="updateHabilidadePassiva(${i}, 'desc', this.value)" placeholder="Descrição da habilidade..." style="width:100%; height:80px; font-size:1.1rem;">${h.desc || ''}</textarea>
            </div>
        `;
        container.appendChild(card);
    });
}

function toggleHabilidadePassiva(index) {
    const habilidadesPassivas = charData.habilidadesPassivas || [];
    if (habilidadesPassivas[index]) {
        habilidadesPassivas[index].expandida = !habilidadesPassivas[index].expandida;
        saveToStorage(charData);
        renderHabilidadesPassivas();
    }
}

function updateHabilidadePassiva(index, field, value) {
    const habilidadesPassivas = charData.habilidadesPassivas || [];
    if (habilidadesPassivas[index]) {
        habilidadesPassivas[index][field] = value;
        saveToStorage(charData);
        renderHabilidadesPassivas();
    }
}

function removeHabilidadePassiva(index) {
    const habilidadesPassivas = charData.habilidadesPassivas || [];
    habilidadesPassivas.splice(index, 1);
    saveToStorage(charData);
    renderHabilidadesPassivas();
}

function addHabilidadeAtiva() {
    if (!charData.habilidadesAtivas) charData.habilidadesAtivas = [];
    charData.habilidadesAtivas.push({ 
        nome: 'Novo Poder', tipo: 'Magia', ativa: false, arcanos: '', forma: '', funcao: '', efeito: '',
        duracao: '', alvos: '', custo: '', amplificadores: '', concedido: '', dados: '', dano: '', desc: '', expandida: false
    });
    saveToStorage(charData);
    renderHabilidadesAtivas();
}

function renderHabilidadesAtivas() {
    const container = document.getElementById('habilidades-ativas-list');
    container.innerHTML = '';
    const habs = charData.habilidadesAtivas || [];

    habs.forEach((h, i) => {
        const tipoLimpo = h.tipo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const card = document.createElement('div');
        card.className = `habilidade-card cat-${tipoLimpo}`;
        
        let camposEspecificos = '';
        if (h.tipo === 'Magia') {
            camposEspecificos = `
                <div style="display:flex; align-items:center; gap:10px; margin: 10px 0;">
                    <input type="checkbox" class="checkbox-ativa" ${h.ativa ? 'checked' : ''} onchange="updateHabilidadeAtiva(${i}, 'ativa', this.checked)">
                    <span>Magia Ativa</span>
                </div>
                <div class="glifo-grid">
                    <div class="glifo-item"><b>Arcanos:</b> <input class="input-glifo" value="${h.arcanos || ''}" onchange="updateHabilidadeAtiva(${i}, 'arcanos', this.value)"></div>
                    <div class="glifo-item"><b>Forma:</b> <input class="input-glifo" value="${h.forma || ''}" onchange="updateHabilidadeAtiva(${i}, 'forma', this.value)"></div>
                    <div class="glifo-item"><b>Função:</b> <input class="input-glifo" value="${h.funcao || ''}" onchange="updateHabilidadeAtiva(${i}, 'funcao', this.value)"></div>
                    <div class="glifo-item"><b>Efeito:</b> <input class="input-glifo" value="${h.efeito || ''}" onchange="updateHabilidadeAtiva(${i}, 'efeito', this.value)"></div>
                    <div class="glifo-item"><b>Duração:</b> <input class="input-glifo" value="${h.duracao || ''}" onchange="updateHabilidadeAtiva(${i}, 'duracao', this.value)"></div>
                    <div class="glifo-item"><b>Alvos:</b> <input class="input-glifo" value="${h.alvos || ''}" onchange="updateHabilidadeAtiva(${i}, 'alvos', this.value)"></div>
                    <div class="glifo-item"><b>Custo:</b> <input class="input-glifo" value="${h.custo || ''}" onchange="updateHabilidadeAtiva(${i}, 'custo', this.value)"></div>
                    <div class="glifo-item"><b>Amplificadores:</b> <input class="input-glifo" value="${h.amplificadores || ''}" onchange="updateHabilidadeAtiva(${i}, 'amplificadores', this.value)"></div>
                </div>
                <div style="margin: 10px 0; display:flex; gap:10px; align-items:center;">
                    <div style="flex:1;">
                        <label style="font-size:0.8rem; color:var(--text-dim);">Dano:</label>
                        <input type="text" placeholder="Ex: 2d6+3" value="${h.dano || ''}" onchange="updateHabilidadeAtiva(${i}, 'dano', this.value)" style="width:100%;">
                    </div>
                    ${h.dano ? `<button onclick="rolarDadoCustom('${h.dano}', '${h.nome} (Dano)')" style="background:var(--accent-red); color:white; border:none; padding:8px 12px; border-radius:4px; cursor:pointer; margin-top:15px;"><i class="ph ph-dice-six"></i> Rolar Dano</button>` : ''}
                </div>`;
        } else {
            camposEspecificos = `
                <div style="margin: 10px 0; display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div>
                        <label style="font-size:0.8rem; color:var(--text-dim);">Concedido por:</label>
                        <input type="text" placeholder="Concedido por..." value="${h.concedido || ''}" onchange="updateHabilidadeAtiva(${i}, 'concedido', this.value)" style="width:100%;">
                    </div>
                    <div>
                        <label style="font-size:0.8rem; color:var(--text-dim);">Custo:</label>
                        <input type="text" placeholder="Custo..." value="${h.custo || ''}" onchange="updateHabilidadeAtiva(${i}, 'custo', this.value)" style="width:100%;">
                    </div>
                </div>
                <div style="margin: 10px 0; display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div>
                        <label style="font-size:0.8rem; color:var(--text-dim);">Dados:</label>
                        <div style="display:flex; gap:5px;">
                            <input type="text" placeholder="Dados (ex: 2d6)" value="${h.dados || ''}" onchange="updateHabilidadeAtiva(${i}, 'dados', this.value)" style="flex:1;">
                            ${h.dados ? `<button onclick="rolarDadoCustom('${h.dados}', '${h.nome}')" style="background:var(--accent-yellow); color:black; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;"><i class="ph ph-dice-five"></i></button>` : ''}
                        </div>
                    </div>
                    <div>
                        <label style="font-size:0.8rem; color:var(--text-dim);">Dano:</label>
                        <div style="display:flex; gap:5px;">
                            <input type="text" placeholder="Dano (ex: 1d8)" value="${h.dano || ''}" onchange="updateHabilidadeAtiva(${i}, 'dano', this.value)" style="flex:1;">
                            ${h.dano ? `<button onclick="rolarDadoCustom('${h.dano}', '${h.nome} (Dano)')" style="background:var(--accent-red); color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;"><i class="ph ph-dice-six"></i></button>` : ''}
                        </div>
                    </div>
                </div>`;
        }

        card.innerHTML = `
            <div class="habilidade-header" onclick="toggleHabilidadeAtiva(${i})">
                <div class="habilidade-header-content">
                    <span class="habilidade-nome">${h.nome || 'Novo Poder'}</span>
                    <span class="habilidade-categoria">${h.tipo}</span>
                </div>
                <i class="ph ph-caret-down habilidade-toggle ${h.expandida ? 'expanded' : ''}"></i>
            </div>
            <div class="habilidade-content ${h.expandida ? 'expanded' : ''}">
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <select onchange="updateHabilidadeAtiva(${i}, 'tipo', this.value)" style="flex:1">
                        <option value="Magia" ${h.tipo === 'Magia' ? 'selected' : ''}>Magia</option>
                        <option value="Milagre" ${h.tipo === 'Milagre' ? 'selected' : ''}>Milagre</option>
                        <option value="Maldição" ${h.tipo === 'Maldição' ? 'selected' : ''}>Maldição</option>
                    </select>
                    <input type="text" value="${h.nome}" onchange="updateHabilidadeAtiva(${i}, 'nome', this.value)" style="flex:2; font-weight:bold;">
                    <button onclick="removeHabilidadeAtiva(${i})" class="btn-danger"><i class="ph ph-trash"></i></button>
                </div>
                ${camposEspecificos}
                <textarea onchange="updateHabilidadeAtiva(${i}, 'desc', this.value)" placeholder="Descrição detalhada..." style="width:100%; height:60px; margin-top:5px;">${h.desc || ''}</textarea>
            </div>
        `;
        container.appendChild(card);
    });
}

function toggleHabilidadeAtiva(index) {
    const habilidadesAtivas = charData.habilidadesAtivas || [];
    if (habilidadesAtivas[index]) {
        habilidadesAtivas[index].expandida = !habilidadesAtivas[index].expandida;
        saveToStorage(charData);
        renderHabilidadesAtivas();
    }
}

function updateHabilidadeAtiva(index, field, value) {
    const habilidadesAtivas = charData.habilidadesAtivas || [];
    if (habilidadesAtivas[index]) {
        habilidadesAtivas[index][field] = value;
        saveToStorage(charData);
        renderHabilidadesAtivas();
    }
}

function removeHabilidadeAtiva(index) {
    const habilidadesAtivas = charData.habilidadesAtivas || [];
    habilidadesAtivas.splice(index, 1);
    saveToStorage(charData);
    renderHabilidadesAtivas();
}

function renderResistencias() {
    const container = document.getElementById('resistencia-rows');
    if (!container) return;
    container.innerHTML = '';
    const resistencias = charData.resistencias || [];
    if (resistencias.length === 0) {
        for(let i = 0; i < 3; i++) { resistencias.push({ tipo: '', desc: '' }); }
    }
    resistencias.forEach((row, index) => {
        container.innerHTML += `
            <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border); min-height: 40px;">
                <div style="padding: 8px; border-right: 1px solid var(--border);">
                    <input type="text" value="${row.tipo || ''}" onchange="updateResistencia(${index}, 'tipo', this.value)" placeholder="Fogo, Frio, Veneno...">
                </div>
                <div style="padding: 8px; position: relative;">
                    <input type="text" value="${row.desc || ''}" onchange="updateResistencia(${index}, 'desc', this.value)" placeholder="Resistência +5, Vulnerabilidade, Imune...">
                    <button onclick="removeResistenciaRow(${index})" style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--accent-red); cursor: pointer; padding: 4px;">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </div>`;
    });
}

function addResistenciaRow() {
    if (!charData.resistencias) charData.resistencias = [];
    charData.resistencias.push({ tipo: '', desc: '' });
    saveToStorage(charData);
    renderResistencias();
}

function updateResistencia(index, field, value) {
    const resistencias = charData.resistencias || [];
    if (resistencias[index]) {
        resistencias[index][field] = value;
        saveToStorage(charData);
        renderResistencias();
    }
}

function removeResistenciaRow(index) {
    const resistencias = charData.resistencias || [];
    resistencias.splice(index, 1);
    saveToStorage(charData);
    renderResistencias();
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function updateSenha(novaSenha) {
    charData.senha = novaSenha;
    saveToStorage(charData);
}

init();