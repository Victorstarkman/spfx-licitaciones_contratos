
export interface IAntecedente {
    id: number;
    titulo: string;
    claveHito: string;
    anio: number;

    fecha: string;
    fechaFin: string;
    organismo: string;
    numeroProceso: string;
    expediente: string;
    objeto: string;
    tipoServicio: string[];

    adjudicatariosIds: number[];
    empresasParticipantesIds: number[];

    dienstParticipa: boolean;
    resultadoDienst: string;
    resultadoProceso: string;
    montoAdjudicado: number;

    impactoCompetitivo: string;
    nivelEvidencia: string;
    mostrarEnCronologia: boolean;
    observaciones?: string;
    fuente: string;

    created: string;
    modified: string;
    authorId: number;
    editorId: number;
}
