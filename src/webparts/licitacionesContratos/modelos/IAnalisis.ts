export type TResultadoIA =
    | 'adjudicada'
    | 'no_adjudicada'
    | 'desestimada'
    | 'indeterminado'
    | 'adjudicada_y_desestimada_parcialmente'
    | 'no_adjudicada_y_desestimada_parcialmente'
    | 'segunda'
    | 'recomendada';

export type TTipoEvidenciaIA =
    | 'directa'
    | 'inferida'
    | 'insuficiente';

export interface IAnalisisIA {

    // Identificación
    id: number;
    titulo: string;

    // Relaciones
    licitacionOrigenId: number;
    competidorId: number;
    nombreEmpresa: string;

    // Resultado
    resultadoIA: TResultadoIA;
    motivoIA: string;

    // Evidencia
    tipoEvidencia: TTipoEvidenciaIA;

    // Control
    estadoRevision: string;
    fechaAnalisis: string;

}