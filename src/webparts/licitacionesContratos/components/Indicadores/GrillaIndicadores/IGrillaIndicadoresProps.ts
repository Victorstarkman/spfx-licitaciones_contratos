import type { IAntecedente } from "../../../modelos/IAntecedentes";
import type {ISerieIPC} from "../../../servicios/ConsultaIPC";

export interface IGrillaIndicadoresProps {
    licitaciones:IAntecedente[];
    descripcionFiltros: string;
    serieIPC : ISerieIPC | undefined

}