import { SPHttpClient } from '@microsoft/sp-http';

import type { ISeguimiento, ISeguimientoNuevo } from '../modelos/ISeguimiento';

import {
    validarEmailCorporativo
} from '../utilidades/seguimientoUtilidades';

const URL_SITIO = 'https://dienstar.sharepoint.com';

const ID_LISTA_SEGUIMIENTO =
    '058ae867-a268-4cd3-9e9e-e5a1d63f0fd6';

const URL_SEGUIMIENTOS =
    `${URL_SITIO}/_api/web/lists(guid'${ID_LISTA_SEGUIMIENTO}')/items`;


export const consultarSeguimientos = async (
    spHttpClient: SPHttpClient,
    email: string
): Promise<ISeguimiento[]> => {

    const emailNormalizado = email.trim().toLowerCase();

    if (!validarEmailCorporativo(emailNormalizado)) {

        throw new Error('El correo corporativo no es válido.');

    }

    const filtro = encodeURIComponent(
        `EmailUsuario eq '${emailNormalizado}' and Activo eq 1`
    );

    const url =
        `${URL_SEGUIMIENTOS}?$filter=${filtro}&$top=5000`;

    const respuesta = await spHttpClient.get(
        url,
        SPHttpClient.configurations.v1
    );

    if (!respuesta.ok) {

        throw new Error(
            `Error al consultar seguimientos: ${respuesta.status}`
        );

    }

    const datos = await respuesta.json();

    return datos.value as ISeguimiento[];

};
export const crearSeguimiento = async (
    spHttpClient: SPHttpClient,
    seguimiento: ISeguimientoNuevo
): Promise<ISeguimiento> => {

    const emailNormalizado =
        seguimiento.EmailUsuario.trim().toLowerCase();

    if (!validarEmailCorporativo(emailNormalizado)) {

        throw new Error(
            'El correo corporativo no es válido.'
        );

    }

    const datos: ISeguimientoNuevo = {
        ...seguimiento,
        EmailUsuario: emailNormalizado
    };

    const respuesta = await spHttpClient.post(
        URL_SEGUIMIENTOS,
        SPHttpClient.configurations.v1,
        {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-Type': 'application/json;odata=nometadata',
                'odata-version': ''
            },
            body: JSON.stringify(datos)
        }
    );

    if (!respuesta.ok) {

        const detalle = await respuesta.text();

        throw new Error(
            `Error al crear seguimiento: ${respuesta.status}. ${detalle}`
        );

    }

    return await respuesta.json() as ISeguimiento;

};
export const desactivarSeguimiento = async (
    spHttpClient: SPHttpClient,
    id: number
): Promise<void> => {

    const url = `${URL_SEGUIMIENTOS}(${id})`;

    const respuesta = await spHttpClient.post(
        url,
        SPHttpClient.configurations.v1,
        {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-Type': 'application/json;odata=nometadata',
                'odata-version': '',
                'IF-MATCH': '*',
                'X-HTTP-Method': 'MERGE'
            },
            body: JSON.stringify({
                Activo: false
            })
        }
    );

    if (!respuesta.ok) {

        const detalle = await respuesta.text();

        throw new Error(
            `Error al desactivar seguimiento: ${respuesta.status}. ${detalle}`
        );

    }

};