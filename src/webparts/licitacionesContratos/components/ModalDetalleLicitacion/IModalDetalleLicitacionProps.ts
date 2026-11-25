import { IAntecedente } from "../../modelos/IAntecedentes";
import { ICompetidor } from "../../modelos/ICompetidor";
export interface IModalDetalleLicitacionProps{
    licitacion: IAntecedente;
    licitaciones : IAntecedente[];
    competidores: ICompetidor[];
    onCerrar :()=> void
} 