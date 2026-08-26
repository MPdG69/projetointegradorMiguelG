// js/services/diceService.js
// Serviço de Rolagens - Pronto para migração para API

const DiceService = {
    /**
     * Rola uma fórmula de dado (ex: 2d6+4, 1d20-2, etc)
     * @param {string} formula - Fórmula a ser rolada
     * @returns {Object} Resultado da rolagem
     */
    rolarFormula(formula) {
        if (!formula) return { total: 0, dados: [], modificador: 0, texto: "0" };
        
        // Remove espaços e faz parse
        const cleanFormula = formula.replace(/\s+/g, '');
        const regex = /^(\d+)d(\d+)([+-]\d+)?$/i;
        const match = cleanFormula.match(regex);
        
        if (!match) {
            // Valor fixo
            const fixo = parseInt(formula) || 0;
            return { 
                total: fixo, 
                dados: [], 
                modificador: fixo, 
                texto: String(fixo),
                formula: formula
            };
        }
        
        const qtd = parseInt(match[1]);
        const lados = parseInt(match[2]);
        const mod = match[3] ? parseInt(match[3]) : 0;
        
        const dados = [];
        let soma = 0;
        for (let i = 0; i < qtd; i++) {
            const r = Math.floor(Math.random() * lados) + 1;
            dados.push(r);
            soma += r;
        }
        
        const total = soma + mod;
        const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
        
        return {
            total,
            dados,
            modificador: mod,
            texto: `${qtd}d${lados}${mod !== 0 ? modStr : ''} → [${dados.join(', ')}] ${mod !== 0 ? modStr : ''} = ${total}`,
            formula: cleanFormula,
            qtd,
            lados,
            mod
        };
    },

    /**
     * Rola ataque de arma com diferentes modos
     * @param {Object} arma - Dados da arma
     * @param {string} modo - 'ambos', 'teste', 'dano', 'critico'
     * @returns {Object} Resultado completo do ataque
     */
    rolarAtaqueArma(arma, modo = 'ambos') {
        const resultado = {
            modo,
            arma: arma.nome,
            teste: null,
            dano: null,
            critico: false
        };
        
        if (modo === 'ambos' || modo === 'teste') {
            resultado.teste = this.rolarFormula(arma.teste || '1d20');
        }
        
        if (modo === 'ambos' || modo === 'dano') {
            resultado.dano = this.rolarFormula(arma.dano || '1d6');
        } else if (modo === 'critico') {
            resultado.critico = true;
            const d1 = this.rolarFormula(arma.dano || '1d6');
            const d2 = this.rolarFormula(arma.dano || '1d6');
            resultado.dano = {
                total: d1.total + d2.total,
                dados: [...d1.dados, ...d2.dados],
                modificador: d1.modificador + d2.modificador,
                texto: `CRÍTICO! ${d1.total} + ${d2.total} = ${d1.total + d2.total}`
            };
        }
        
        return resultado;
    },

    /**
     * Registra uma rolagem no log
     */
    registrarLog(personagem, tipo, nome, resultado, critico = false) {
        try {
            const logs = JSON.parse(localStorage.getItem('apoteose_rolagens') || '[]');
            logs.push({
                timestamp: Date.now(),
                personagem: personagem,
                tipo: tipo,
                nome: nome,
                resultado: resultado,
                critico: critico,
                detalhes: resultado.dados || []
            });
            // Mantém apenas os últimos 100 logs
            if (logs.length > 100) logs.splice(0, logs.length - 100);
            localStorage.setItem('apoteose_rolagens', JSON.stringify(logs));
        } catch (e) {
            console.error('Erro ao registrar log:', e);
        }
    }
};

// Exportar para uso
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiceService;
}