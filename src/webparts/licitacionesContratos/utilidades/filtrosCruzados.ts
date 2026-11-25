
import type { IAntecedente } from '../modelos/IAntecedentes';

export interface ICriteriosFiltros {
    empresa: string;
    periodo: string;
    servicio: string;
    organismo: string;
}

export type TCampoFiltro =
    | 'empresa'
    | 'periodo'
    | 'servicio'
    | 'organismo';

export const filtrarPorCriterios = (
    licitaciones: IAntecedente[],
    criterios: ICriteriosFiltros,
    excluir?: TCampoFiltro
): IAntecedente[] => {

    return licitaciones.filter(item => {

        const idsEmpresas = [
            ...item.adjudicatariosIds,
            ...item.empresasParticipantesIds
        ];

        const coincideEmpresa =
            excluir === 'empresa' ||
            !criterios.empresa ||
            idsEmpresas.indexOf(Number(criterios.empresa)) !== -1;

        const coincidePeriodo =
            excluir === 'periodo' ||
            !criterios.periodo ||
            item.anio === Number(criterios.periodo);

        const coincideServicio =
            excluir === 'servicio' ||
            !criterios.servicio ||
            item.tipoServicio.indexOf(criterios.servicio)  !== -1;

        const coincideOrganismo =
            excluir === 'organismo' ||
            !criterios.organismo ||
            item.organismo === criterios.organismo;

        return (
            coincideEmpresa &&
            coincidePeriodo &&
            coincideServicio &&
            coincideOrganismo
        );
    });
};
