import type { SPHttpClient } from '@microsoft/sp-http';

export interface IModalMisSeguimientosProps {

    spHttpClient: SPHttpClient;

    onCerrar: () => void;

}