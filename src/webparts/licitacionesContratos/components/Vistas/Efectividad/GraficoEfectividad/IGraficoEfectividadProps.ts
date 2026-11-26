import type { IAntecedente } from '../../../../modelos/IAntecedentes';

import type {
    IResultadoEfectividad
} from '../../../../utilidades/efectividadUtilidades';
import type {
    IAnalisisIA
} from '../../../../modelos/IAnalisis';
export interface IGraficoEfectividadProps {
    nombreEmpresa: string;
    empresaId: number;
    licitaciones: IAntecedente[];
    resultado: IResultadoEfectividad;
    obtenerAnalisisEmpresa: ( item: IAntecedente) => IAnalisisIA | undefined;
}   