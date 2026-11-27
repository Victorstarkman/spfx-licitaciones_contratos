export type TFrecuenciaSeguimiento =
    'Mensual' | 'Semanal';

export interface ISeguimientoNuevo {

    Title: string;

    NumeroProceso: string;

    Organismo: string;

    Servicio: string;

    FechaFin: string;

    EmailUsuario: string;

    Frecuencia: TFrecuenciaSeguimiento;

    ProximoAviso: string;

    Activo: boolean;

    AvisoVencimientoEnviado: boolean;

}

export interface ISeguimiento extends ISeguimientoNuevo {

    Id: number;
// SharePoint REST puede devolver null en fechas vacías.

// eslint-disable-next-line @rushstack/no-new-null
FechaAvisoVencimiento?: string | null;

// eslint-disable-next-line @rushstack/no-new-null
FechaUltimoAviso?: string | null;

}