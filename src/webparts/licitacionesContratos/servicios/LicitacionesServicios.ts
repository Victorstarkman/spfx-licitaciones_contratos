import { SPHttpClient } from '@microsoft/sp-http';

import type { IAntecedenteSharePoint } from '../modelos/IAntecedentesSharepoint';
import type { IAntecedente } from '../modelos/IAntecedentes';
import type { ICompetidordeSharePoint } from '../modelos/ICompetidordeSharepoint';

import { transformarAntecedente } from './transformarAntecedente';
import { transformarCompetidor } from './transformarCompetidor';
import { ICompetidor } from '../modelos/ICompetidor';

import {IAnalisisIA } from '../modelos/IAnalisis'
import {IAnalisisIASharePoint} from '../modelos/IAnalisisIASharepoint'
import { transformarAnalisisIA } from '../servicios/transformarAnalisisIA'

const sitio = 'https://dienstar.sharepoint.com'
const listas = {
    competidores: '74bfdf59-3ba2-420e-950d-d048a4d4b7a9',
    cronologia: 'b06863ce-2dc8-4388-992a-f9daa27b006e',
    analisisIA: 'ec31aca4-8986-4106-8291-4ace7b3616c7'
};

const consultarListas = async(
    spHttpClient: SPHttpClient,
    listaId :string
): Promise<unknown[]>  => {
    let url : string | undefined = `${sitio}/_api/web/lists(guid'${listaId}')`+
    `/items?$top=100`;
    const resultados:unknown[] = [];
    
    while(url)  
    {  
        const respuesta = await spHttpClient.get(
          url,
          SPHttpClient.configurations.v1
      )
      if(!respuesta.ok){
          throw new Error (`Error al consultar la lista ${listaId} ${respuesta.status}`)
  
      }
      const datos :  {value: unknown[];
            '@odata.nextLink'?: string;} = await respuesta.json(); 
        
            resultados.push(...datos.value);
        
        url = datos['@odata.nextLink'];
    }
    return resultados
    
}

export const consultarLicitaciones = async (
    spHttpClient : SPHttpClient
): Promise<IAntecedente[]> => {
 const datos = await consultarListas(
    spHttpClient,
    listas.cronologia
);

return (datos as IAntecedenteSharePoint[])
    .map(transformarAntecedente);
}
export const consultarCompetidores = async (
    spHttpClient : SPHttpClient
): Promise<ICompetidor[]> => {
 const datos = await consultarListas(
    spHttpClient,
    listas.competidores
);

return (datos as ICompetidordeSharePoint[])
    .map(transformarCompetidor);
}

export const consultarCompetidorPorId =async (
    spHttpClient:SPHttpClient,
    id:number
    ):Promise<ICompetidordeSharePoint> =>{

        const URL = `${sitio}/_api/web/lists(guid'${listas.competidores}')` +
    `/items(${id})`;
        const respuesta = await spHttpClient.get (
            URL,
            SPHttpClient.configurations.v1,
            {headers:{
                Accept : 'application/json;odata=nometadata'
            }}
        )
        if(!respuesta.ok){
            const detalle = await respuesta.text();

            console.error('ID consultado:', id);
            console.error('URL consultada:', URL);
            console.error('Respuesta de SharePoint:', detalle);

            throw new Error(
                `Error en la consulta por ID: ${respuesta.status}`
            );
        }
        const datos = await  respuesta.json();
        return datos;
}
export const consultarAnalisisIA = async (
    spHttpClient: SPHttpClient
): Promise<IAnalisisIA[]> => {

    const datos = await consultarListas(
        spHttpClient,
        listas.analisisIA
    );

   
    const transformados = (datos as IAnalisisIASharePoint[])
        .map(transformarAnalisisIA);


    return transformados;

};



