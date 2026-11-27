import type { IAntecedente } from './IAntecedentes';

export type TSituacionContrato =
    | 'vigente'
    | 'vencido'
    | 'sin_fecha_confirmada';

export interface IContrato {

    clave: string;
    numeroProceso: string;

    organismo: string;
    tipoServicio: string[];

    adjudicatariosIds: number[];

    fechaInicio: string;
    fechaFin: string;

    situacion: TSituacionContrato;

    antecedenteOriginal: IAntecedente;
    antecedentes: IAntecedente[];

}