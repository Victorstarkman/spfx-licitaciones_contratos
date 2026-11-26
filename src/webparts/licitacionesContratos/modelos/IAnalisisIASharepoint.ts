export interface IAnalisisIASharePoint {

    // Identificación
    Id: number;
    Title: string;

    // Relaciones
    LicitacionOrigenId?: number;
    CompetidorId?: number;
    NombreEmpresa?: string;

    // Resultado del análisis
    ResultadoIA?: string;
    MotivoIA?: string;

    // Evidencia
    TipoEvidencia?: string;

    // Auditoría del análisis
    EstadoRevision?: string;
    FechaAnalisis?: string;

}