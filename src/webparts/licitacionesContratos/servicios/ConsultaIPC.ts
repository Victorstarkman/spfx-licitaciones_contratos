import {SPHttpClient,SPHttpClientResponse} from '@microsoft/sp-http';

export interface ISerieIPC {
    data: [string, number][];
    count: number;
}

export const consultarIPC = async(
    spHttpClient: SPHttpClient,
): Promise<ISerieIPC> => {
    
    const URL = "https://dienstar.sharepoint.com/" +
    "Shared%20Documents/Assets%20Competencia/" +
    "IpcJson/data-2026112210486.json";
    const respuesta:SPHttpClientResponse = await spHttpClient.get(
        URL,
        SPHttpClient.configurations.v1

    )
    if(!respuesta.ok){
        throw new Error (
            `Error al consultar IPC: ${respuesta.status}`
        )
    }
    return  await respuesta.json() as ISerieIPC
    
};
