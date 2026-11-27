import type { TSituacionContrato } from '../../../../modelos/IContratos';

export type TFiltroSituacion =
    | 'todos'
    | TSituacionContrato;

export interface ISelectorSituacionProps {

    situacionSeleccionada: TFiltroSituacion;

    totalContratos: number;
    totalVigentes: number;
    totalVencidos: number;
    totalSinFecha: number;

    onCambiarSituacion: (
        situacion: TFiltroSituacion
    ) => void;

}