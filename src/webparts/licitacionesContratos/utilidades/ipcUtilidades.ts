
import type { ISerieIPC} from '../servicios/ConsultaIPC';

export const calcularFactorIPC = (
    fechaApertura: string,
    serie: ISerieIPC
): number | undefined => {

    // Obtener año y mes de apertura
    const mesApertura = fechaApertura.substring(0, 7);
    //console.log('Desde la utilidad',serie )
    // Buscar el IPC correspondiente
    const registroOrigen = serie.data.find(
        registro => registro[0].substring(0, 7) === mesApertura
    );

    // Último IPC disponible
    const registroActual = serie.data[serie.data.length - 1];

    // Verificar que ambos registros existan
    if (!registroOrigen || !registroActual) {
        return undefined;
    }

    const ipcOrigen = registroOrigen[1];
    const ipcActual = registroActual[1];

    // Evitar índices inválidos
    if (ipcOrigen <= 0 || ipcActual <= 0) {
        return undefined;
    }

    // Si es el mismo mes, el factor es 1
    if (registroOrigen[0] === registroActual[0]) {
        return 1;
    }

    // Factor sin redondear
    return ipcActual / ipcOrigen;
};

export const actualizarMontoIPC = (
    montoOriginal: number,
    fechaApertura: string,
    serie: ISerieIPC
):number | undefined => {

    //validamos el monto
    if(!Number.isFinite(montoOriginal) || montoOriginal < 0){
        return undefined
    }
    //obtenemos el factor 
    const factor = calcularFactorIPC(
       fechaApertura,
       serie
    );
    if (factor === undefined) return undefined;
    //actualizar el monto
    return montoOriginal * factor;

}
