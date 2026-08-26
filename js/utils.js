// js/utils.js
// Utilitários para detecção de ambiente e geração de links

const Utils = {
    /**
     * Detecta se está em ambiente local (file://)
     */
    isLocalEnvironment() {
        return window.location.protocol === 'file:';
    },

    /**
     * Obtém o caminho base do projeto
     */
    getBasePath() {
        const isLocal = this.isLocalEnvironment();
        
        if (isLocal) {
            // Ambiente local: obtém o caminho da pasta atual
            const currentPath = window.location.pathname;
            return currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        } else {
            // Ambiente servidor: usa a raiz
            return window.location.origin + '/';
        }
    },

    /**
     * Gera link para OBS Portrait do personagem
     */
    gerarLinkPortrait(charId) {
        const base = this.getBasePath();
        // Remove a barra duplicada se necessário
        const baseClean = base.endsWith('/') ? base : base + '/';
        return baseClean + 'obs/portrait.html?id=' + charId;
    },

    /**
     * Gera link para OBS Party
     */
    gerarLinkParty(campId) {
        const base = this.getBasePath();
        const baseClean = base.endsWith('/') ? base : base + '/';
        return baseClean + 'obs/party-obs.html?id=' + campId;
    },

    /**
     * Copia texto para o clipboard com fallback
     */
    copiarTexto(texto, callback) {
        navigator.clipboard.writeText(texto).then(() => {
            if (callback) callback(true);
        }).catch(() => {
            // Fallback para navegadores sem suporte
            const input = document.createElement('input');
            input.value = texto;
            document.body.appendChild(input);
            input.select();
            try {
                document.execCommand('copy');
                if (callback) callback(true);
            } catch (e) {
                if (callback) callback(false);
            }
            document.body.removeChild(input);
        });
    }
};

// Exportar para uso
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}