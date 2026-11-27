import { TFrecuenciaSeguimiento, ISeguimiento,ISeguimientoNuevo } from "../modelos/ISeguimiento";
import { IContrato } from "../modelos/IContratos";

//=====================================================
/* funcion que revisa estado de path email */
//=============================================================
export const validarEmailCorporativo = (
    email: string
): boolean => {

    return /^[a-zA-Z0-9._%+-]+@dienst\.com\.ar$/i
        .test(email.trim());

};
//================================================================
/* resuelve la pregunta que ira en el sharepoint para saber cuando
sera el proximo mail */
//========================================================
export const calcularProximoAviso = (
    frecuencia: TFrecuenciaSeguimiento
): string => {

    const fecha = new Date();

    if (frecuencia === 'Semanal') {

        fecha.setUTCDate(fecha.getUTCDate() + 7);

    } else {

        const dia = fecha.getUTCDate();

        fecha.setUTCDate(1);

        fecha.setUTCMonth(fecha.getUTCMonth() + 1);

        const ultimoDiaMes = new Date(
            Date.UTC(
                fecha.getUTCFullYear(),
                fecha.getUTCMonth() + 1,
                0
            )
        ).getUTCDate();

        fecha.setUTCDate(
            Math.min(dia, ultimoDiaMes)
        );

    }

    return fecha.toISOString();

};
//=============================================================
/* Creacion del objeto de actualizacion para post en la lista */
//===========================================================
export const construirSeguimiento = (
    contrato: IContrato,
    email: string,
    frecuencia: TFrecuenciaSeguimiento
): ISeguimientoNuevo => {

    if (!validarEmailCorporativo(email)) {
        throw new Error('El correo corporativo no es válido.');
    }

    if (!contrato.fechaFin ||
        isNaN(Date.parse(contrato.fechaFin))) {

        throw new Error(
            'El contrato no tiene una fecha de finalización válida.'
        );

    }

    return {

        Title: contrato.numeroProceso,

        NumeroProceso: contrato.numeroProceso,

        Organismo: contrato.organismo,

        Servicio: contrato.tipoServicio.join(' · '),

        FechaFin: new Date(contrato.fechaFin).toISOString(),

        EmailUsuario: email.trim().toLowerCase(),

        Frecuencia: frecuencia,

        ProximoAviso: calcularProximoAviso(frecuencia),

        Activo: true,

        AvisoVencimientoEnviado: false

    };

};
//===========================================================
/* existe el seguimiento a un contrato? */
//===========================================================
export const existeSeguimientoActivo = (
    seguimientos: ISeguimiento[],
    numeroProceso: string
): boolean => {

    return seguimientos.some(item =>
        item.Activo &&
        item.NumeroProceso.trim().toLowerCase() ===
        numeroProceso.trim().toLowerCase()
    );

};