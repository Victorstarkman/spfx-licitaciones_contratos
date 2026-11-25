import type { IAntecedente } from "../modelos/IAntecedentes"
//====================================================
/* obtenerNombresEmpresas= entrada id y un diccionario de id y nombres
                            proceso crea un objeto id nombres
                            salida el nuevo objeto
                             */
//======================================================
export const obtenerNombresEmpresas = (
    ids : number[],
    empresaPorId: Map<number,string>
): string[] => {
    return  ids.map(id =>
         empresaPorId.get(id) ?? 'Empresa no identificada')
}
//==============================================================
/* formatearFecha= entrada fecha en formato sharepoint
                proceso crea una nueva fecha con formato de presentacion
                salida nueva fecha en formato dd de mmm de YYYY    */
//===============================================================
export const formatearFecha=  (fecha:string ): string => {

        if(!fecha) return ' - '
        return new Date(fecha).toLocaleDateString('es-AR',{
                                        day: 'numeric',
                                        month: 'short',
                                        year:'numeric',
                                        timeZone:'UTC'}).replace(/^(\d+)\s+(\S+)\s+(\d+)$/, '$1 de $2 de $3');
    
        
                                    
}
//========================================================
/* esContinuidad= entrada un antecedente
                    proceso crea un patron de texto segun
                    antecedente con palabras claves
                    salida booleano si antecedente es continuacion 
                    uso funcion interna*/
//========================================================
export function esContinuidad(item: IAntecedente): boolean 
{
     const texto = [
        item.titulo,
        item.claveHito,
        item.objeto,
        item.observaciones,
        item.resultadoProceso,
        item.impactoCompetitivo
    ].join(' ').toLowerCase();
     const patron =
        /pr[oó]rroga|ampliaci[oó]n|renovaci[oó]n|extensi[oó]n|continuidad|adenda|orden\s+de\s+compra\s+complementaria/;

    return patron.test(texto);
}
//========================================================
/* obtenerContinuidad= entrada un antecedente y un array de antecedentes
                    proceso utitliza el numerode proceso y busca todos los 
                    mismos y pregunta si hay continuidad, y lo ordena creciente
                    salida una funcion que aplica escontinuidad 
                    */
//========================================================

export function obtenerContinuidades(
    licitacion: IAntecedente,
    licitaciones: IAntecedente[]
): IAntecedente[] {

    const numeroProceso = licitacion.numeroProceso
        .trim()
        .toLowerCase();

    if (!numeroProceso) {
        return [];
    }

    return licitaciones
            .filter(item =>
            item.numeroProceso.trim().toLowerCase() === numeroProceso &&
            esContinuidad(item)
        )
        .sort((a, b) =>
            new Date(a.fecha).getTime() -
            new Date(b.fecha).getTime()
        );
}
//========================================================
/* obtenerFechaFinContrato= situacion un numeroProceso varias veces repetido
                    cuando se termina.
                    entrada un antecedente y un array de antecedentes
                    proceso compara si existe un numero de proceso repetiod
                    y busca fechaFin dentro y devuelve la ultima fechaFin
                    salida fecha ultima de fin */
//========================================================
export function obtenerFechaFinContrato(
    antecedente: IAntecedente,
    antecedentes: IAntecedente[]
):string {
    const numeroProceso = antecedente.numeroProceso
        .trim()
        .toLowerCase();
    if(!numeroProceso) return '';
    const fechas = antecedentes 
                    .filter(item => item.numeroProceso.toLowerCase().trim()=== numeroProceso)
                    .map(item => item.fechaFin)
                    .filter(fecha => Boolean(fecha) && 
                    !Number.isNaN(new Date(fecha).getTime()) 
                );
                if (fechas.length=== 0) return ''
    return  fechas.reduce((ultima, actual) =>
        new Date(actual).getTime()> new Date(ultima).getTime()
            ? actual
            : ultima

    )
}