import type { IAntecedente } from '../../../modelos/IAntecedentes';
import type { ICompetidor } from '../../../modelos/ICompetidor';
import type { IAnalisisIA } from '../../../modelos/IAnalisis'

export interface IEfectividadProps {

    // Licitaciones que cumplen los filtros activos
    licitaciones: IAntecedente[];

    // Catálogo de competidores de SharePoint
    competidores: ICompetidor[];

    // ID de la empresa seleccionada
    empresaSeleccionada: string;
    
    aniosDisponibles: number[];

    aniosSeleccionados: number[];

    onCambiarAnios: (anios: number[]) => void;
    
    indiceAnalisisIA: Map<string, IAnalisisIA>;
}