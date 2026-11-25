import type { IAntecedente } from '../../../../modelos/IAntecedentes';

import type {
    IResultadoEfectividad
} from '../../../../utilidades/efectividadUtilidades';

export interface IGraficoEfectividadProps {
    nombreEmpresa: string;
    empresaId: number;
    licitaciones: IAntecedente[];
    resultado: IResultadoEfectividad;
}