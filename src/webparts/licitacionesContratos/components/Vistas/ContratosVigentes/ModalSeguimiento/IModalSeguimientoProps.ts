import type { IContrato } from '../../../../modelos/IContratos';
import type { ICompetidor } from '../../../../modelos/ICompetidor';
import type { SPHttpClient } from '@microsoft/sp-http';

export interface IModalSeguimientoProps {

    contratos: IContrato[];

    competidores: ICompetidor[];

    onQuitarContrato: (clave: string) => void;

    onCerrar: () => void;

    spHttpClient: SPHttpClient;

}