import type { IAntecedente } from '../../../modelos/IAntecedentes';
import type { ICompetidor } from '../../../modelos/ICompetidor';

export interface IEfectividadProps {

    // Licitaciones que cumplen los filtros activos
    licitaciones: IAntecedente[];

    // Catálogo de competidores de SharePoint
    competidores: ICompetidor[];

    // ID de la empresa seleccionada
    empresaSeleccionada: string;
}