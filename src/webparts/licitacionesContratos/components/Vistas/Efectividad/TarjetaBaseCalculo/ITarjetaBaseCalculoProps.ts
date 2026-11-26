import type { IResultadoEfectividad } from "../../../../utilidades/efectividadUtilidades";
export interface ITarjetaBaseCalculoProps {
    
    nombreEmpresa: string;
    resultado: IResultadoEfectividad
    coberturaClasificacion: number | undefined
    
}