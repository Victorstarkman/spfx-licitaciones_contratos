import type { ICompetidor } from "../../modelos/ICompetidor";

export interface IFiltrosProps {
    // Opciones disponibles
    competidores: ICompetidor[];
    periodosDisponibles: number[];
    serviciosDisponibles: string[];
    organismosDisponibles: string[];

    // Valores seleccionados
    busqueda: string;
    empresaSeleccionada: string;
    periodoSeleccionado: string;
    servicioSeleccionado: string;
    organismoSeleccionado: string;

    // Funciones para actualizar los filtros
    setBusqueda: (valor: string) => void;
    setEmpresaSeleccionada: (valor: string) => void;
    setPeriodoSeleccionado: (valor: string) => void;
    setServicioSeleccionado: (valor: string) => void;
    setOrganismoSeleccionado: (valor: string) => void;

    // Información sobre los filtros activos
    hayFiltrosActivos: boolean;
    descripcionFiltros: string;

    // Opciones compatibles con los filtros seleccionados
    empresasHabilitadas: Set<number>;
    serviciosHabilitados: Set<string>;
    organismosHabilitados: Set<string>;
    periodosHabilitados: Set<number>;

    //aviso de deshabilitacion 
    deshabilitarPeriodo: boolean;
}