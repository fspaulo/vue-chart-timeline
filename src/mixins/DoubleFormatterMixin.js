export default {
    methods: {
        /* ----FORMATAR PARA SISTEMA DECIMAL PT-BR---- */
        /* ------FORMAT TO DECIMAL SYSTEM PT-BR------- */
        doubleMaskFormatter(value) {
            const numberObject = new Number(value);
            return numberObject.toLocaleString('de-DE', {style: 'decimal', maximumFractionDigits: 3})
        },

        stringToNumber(value) {
            return parseFloat(value)
        }
    }
}
