import { ICompetidor } from "../modelos/ICompetidor"
import { ICompetidordeSharePoint } from '../modelos/ICompetidordeSharepoint'

export const transformarCompetidor = (item:ICompetidordeSharePoint):ICompetidor => {
    return {

        id : item.Id,
        nombre: item.Title
    }

}
