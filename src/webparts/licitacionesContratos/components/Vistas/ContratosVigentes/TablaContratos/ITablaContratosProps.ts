import type { IContrato } from '../../../../modelos/IContratos';
import type { ICompetidor } from '../../../../modelos/ICompetidor';
import type { IAntecedente } from '../../../../modelos/IAntecedentes';
export interface ITablaContratosProps {

    contratos: IContrato[];

    competidores: ICompetidor[];

    contratosSeleccionados: string[];

    onSeleccionarContrato: (clave: string) => void;

    licitaciones : IAntecedente[];

}