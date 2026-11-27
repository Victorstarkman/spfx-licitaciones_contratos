import type * as React from 'react';

import type { IAntecedente } from '../../../modelos/IAntecedentes';
import type { ICompetidor } from '../../../modelos/ICompetidor';
import type { IContrato } from '../../../modelos/IContratos';

import type {
    TFiltroSituacion
} from './SelectorSituacion/ISelectorSituacionProps';

export interface IContratosVigentesProps {

    // Datos
    licitaciones: IAntecedente[];
    competidores: ICompetidor[];
    contratos: IContrato[];

    // Filtros generales
    busqueda: string;
    empresaSeleccionada: string;
    periodoSeleccionado: string;
    servicioSeleccionado: string;
    organismoSeleccionado: string;

    // Situación contractual
    situacionSeleccionada: TFiltroSituacion;

    onCambiarSituacion: (
        situacion: TFiltroSituacion
    ) => void;

    // Seguimiento
    contratosSeleccionados: string[];

    setContratosSeleccionados:
        React.Dispatch<React.SetStateAction<string[]>>;

}