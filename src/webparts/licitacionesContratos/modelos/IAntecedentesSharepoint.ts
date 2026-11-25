
export interface IAntecedenteSharePoint {

    // Identificación
    Id: number;
    Title: string;
    ClaveHito?: string;
    A_x00f1_o?: number;

    // Datos del procedimiento
    Fecha?: string;
    FechaFin?: string;
    Organismo?: string;
    NumeroProceso?: string;
    Expediente?: string;
    Objeto?: string;
    TipoServicio?: string[];

    // Empresas relacionadas
    AdjudicatarioId?: number[];
    EmpresasParticipantesId?: number[];

    // Resultados
    DienstParticipa?: boolean;
    ResultadoDienst?: string;
    ResultadoProceso?: string;
    MontoAdjudicado?: number;

    // Evidencia y observaciones
    ImpactoCompetitivo?: string;
    NivellEvidencia?: string;
    MostrarEnCronologia?: boolean;
    Observaciones?: string;
    Fuente?: string;

    // Auditoría SharePoint
    Created?: string;
    Modified?: string;
    AuthorId?: number;
    EditorId?: number;
}
