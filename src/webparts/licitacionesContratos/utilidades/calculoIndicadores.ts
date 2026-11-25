import { IAntecedente } from "../modelos/IAntecedentes";
import {esContinuidad} from "./licitacionesUtilidades"
import type {ISerieIPC} from "../servicios/ConsultaIPC";
import { actualizarMontoIPC } from "./ipcUtilidades";

export const calcularIndicadores =(
    licitaciones: IAntecedente[],
    serieIPC? : ISerieIPC
):{procesosOriginales: number;
    empresasInvolucradas: number;
    adjudicacionesConfirmadas: number;
    montoActualizadoTotal: number | undefined,
    montosActualizados: number;
    montosSinActualizar: number;
    montoOriginalTotal: number;
    factorEquivalenteIPC: number | undefined
} => {
    //excluye prorrogas u otras 
    const originales = licitaciones.filter(
        item => !esContinuidad(item)
    );
    //almacenar id de empresas sin repetir
    const empresas = new Set<number>();
    
    originales.forEach(item => {
        
        item.empresasParticipantesIds.forEach( id => {
            empresas.add(id)
        });
        item.adjudicatariosIds.forEach( id => {
            empresas.add(id);
        });
    });
    const adjudicacionesConfirmadas = originales.filter(
        item => item.adjudicatariosIds.length > 0
    ).length;
    // definicion y calculo de montos
    let montoActualizadoTotal= 0;
    let montosActualizados= 0;
    let montosSinActualizar = 0;
    let montoOriginalTotal = 0;

    //recorremos todas las licitaciones incluso prorrogas y amplicacione
    licitaciones.forEach(item => {
        const monto = item.montoAdjudicado;

        //solo procesamos importes positivos
        if(!Number.isFinite(monto) || monto <=0)return ;
        
        if(!serieIPC) {
            montosSinActualizar++;
            return;
        }
        const actualizado = actualizarMontoIPC(
          monto,
          item.fecha,
          serieIPC  
        );
        if(actualizado === undefined){
            montosSinActualizar++;
            return;
        }
        montoOriginalTotal+=monto
        montoActualizadoTotal += actualizado;
        montosActualizados++
        /* console.log('AUDITORIA IPC', {
            id: item.id,
            fecha: item.fecha,
            montoOriginal: monto,
            factorAplicado: actualizado / monto,
            montoActualizado: actualizado
        }); */
    });
 /*    console.log('RESUMEN IPC', {
    licitaciones: licitaciones.length,
    montosActualizados,
    montosSinActualizar,
    montoActualizadoTotal
    }); */
    return {
         procesosOriginales: originales.length,
        empresasInvolucradas: empresas.size,
        adjudicacionesConfirmadas,
        montoActualizadoTotal: serieIPC
            ? montoActualizadoTotal
            : undefined,
        montosActualizados,
        montosSinActualizar,
        montoOriginalTotal,
        factorEquivalenteIPC:
            montoOriginalTotal > 0
                ? montoActualizadoTotal/montoOriginalTotal
                : undefined
     
    }
}
