import type { IAntecedente } from "../modelos/IAntecedentes";
import type { IAntecedenteSharePoint } from "../modelos/IAntecedentesSharepoint";

export const transformarAntecedente = (
    item: IAntecedenteSharePoint
): IAntecedente => {

    
    return {
        // Identificación
        id: item.Id,
        titulo: item.Title ?? '',
        claveHito: item.ClaveHito ?? '',
        anio: item.A_x00f1_o ?? 0,

        // Procedimiento
        fecha: item.Fecha ?? '',
        fechaFin: item.FechaFin ?? '',
        organismo: item.Organismo ?? '',
        numeroProceso: item.NumeroProceso ?? '',
        expediente: item.Expediente ?? '',
        objeto: item.Objeto ?? '',
        tipoServicio: item.TipoServicio ?? [],

        // Empresas
        adjudicatariosIds: item.AdjudicatarioId ?? [],
        empresasParticipantesIds: item.EmpresasParticipantesId ?? [],

        // Resultados
        dienstParticipa: item.DienstParticipa ?? false,
        resultadoDienst: item.ResultadoDienst ?? '',
        resultadoProceso: item.ResultadoProceso ?? '',
        montoAdjudicado: item.MontoAdjudicado ?? 0,

        // Evidencia
        impactoCompetitivo: item.ImpactoCompetitivo ?? '',
        nivelEvidencia: item.NivellEvidencia ?? '',
        mostrarEnCronologia: item.MostrarEnCronologia ?? false,
        observaciones: item.Observaciones ?? '',
        fuente: item.Fuente ?? '',

        // Auditoría
        created: item.Created ?? '',
        modified: item.Modified ?? '',
        authorId: item.AuthorId ?? 0,
        editorId: item.EditorId ?? 0
    };

};