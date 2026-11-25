import type { IAntecedente } from "../../modelos/IAntecedentes";
import type { ICompetidor } from "../../modelos/ICompetidor";

export interface ITablaLicitacionesProps {
    licitaciones: IAntecedente[];
    competidores : ICompetidor[];
}