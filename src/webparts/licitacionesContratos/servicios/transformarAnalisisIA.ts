import type {
    IAnalisisIA,
    TResultadoIA,
    TTipoEvidenciaIA
} from '../modelos/IAnalisis';

import type {
    IAnalisisIASharePoint
} from '../modelos/IAnalisisIASharepoint';

// ==========================================
// Normalizar el resultado IA
/* Resultados competitivos evaluados

    Ganadas

        Adjudicación total

        Adjudicación parcial

        Adjudicación con desestimación parcial

    Perdidas

        No adjudicada

        Segunda

        Desestimación parcial sin adjudicación

    Desestimadas

        Desestimación total de la oferta */
// ==========================================

const normalizarResultadoIA = (
    valor: string |  undefined
): TResultadoIA => {

    const resultado = (valor ?? '')
        .trim()
        .toLowerCase();

    switch (resultado) {

        case 'adjudicada':
        case 'no_adjudicada':
        case 'desestimada':
        case 'indeterminado':
        case 'adjudicada_y_desestimada_parcialmente':
        case 'no_adjudicada_y_desestimada_parcialmente':
        case 'segunda':
        case 'recomendada':

            return resultado;

        default:
            return 'indeterminado';
    }
};

// ==========================================
// Normalizar el tipo de evidencia
// ==========================================

const normalizarTipoEvidencia = (
    valor: string |  undefined
): TTipoEvidenciaIA => {

    const evidencia = (valor ?? '')
        .trim()
        .toLowerCase();

    switch (evidencia) {

        case 'directa':
        case 'inferida':
        case 'insuficiente':

            return evidencia;

        default:
            return 'insuficiente';
    }
};

// ==========================================
// Transformador principal
// ==========================================

export const transformarAnalisisIA = (
    item: IAnalisisIASharePoint
): IAnalisisIA => {

    return {

        // Identificación
        id: item.Id,
        titulo: item.Title ?? '',

        // Relaciones
        licitacionOrigenId: item.LicitacionOrigenId ?? 0,
        competidorId: item.CompetidorId ?? 0,
        nombreEmpresa: item.NombreEmpresa ?? '',

        // Resultado
        resultadoIA: normalizarResultadoIA(
            item.ResultadoIA
        ),

        motivoIA: item.MotivoIA ?? '',

        // Evidencia
        tipoEvidencia: normalizarTipoEvidencia(
            item.TipoEvidencia
        ),

        // Control
        estadoRevision: item.EstadoRevision ?? '',
        fechaAnalisis: item.FechaAnalisis ?? ''

    };
};