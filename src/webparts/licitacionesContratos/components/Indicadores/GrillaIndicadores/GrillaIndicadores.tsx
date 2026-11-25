
import * as React from 'react';
import type { IGrillaIndicadoresProps } from './IGrillaIndicadoresProps';
import TarjetaIndicador from '../TarjetaIndicador/TarjetaIndicador';
import styles from './GrillaIndicadores.modules.scss';
import {calcularIndicadores} from '../../../utilidades/calculoIndicadores'

const GrillaIndicadores = (
    props: IGrillaIndicadoresProps
): React.ReactElement => {
    const resultados = calcularIndicadores(props.licitaciones,props.serieIPC);

    
    const ultimoRegistroIPC = props.serieIPC?.data[
        props.serieIPC.data.length - 1
    ];

    const periodoIPC = ultimoRegistroIPC
        ? new Date(ultimoRegistroIPC[0] + 'T12:00:00')
            .toLocaleDateString('es-AR', {
                month: 'short',
                year: 'numeric'
            })
        : undefined;

    const montoActualizado = resultados.montoActualizadoTotal;

    const montoFormateado = montoActualizado === undefined
        ? '—'
        : `$ ${Math.round(montoActualizado / 1000000)
            .toLocaleString('es-AR')} M`;
    
            const formatoMillones = (valor: number): string =>
    `$ ${(valor / 1000000).toLocaleString('es-AR', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    })} M`;

    const montoOriginal = resultados.montosActualizados > 0
        ? formatoMillones(resultados.montoOriginalTotal)
        : '—';

    const factorEquivalente = resultados.factorEquivalenteIPC === undefined
        ? '—'
        : `× ${resultados.factorEquivalenteIPC.toLocaleString('es-AR', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        })}`;

    const montoCorregido = resultados.montosActualizados > 0 &&
        resultados.montoActualizadoTotal !== undefined
        ? formatoMillones(resultados.montoActualizadoTotal)
        : '—';

    const indicadores = [
        {
            titulo: 'Procesos originales',
            valor: resultados.procesosOriginales,
            descripcion: 'Excluye prórrogas y ampliaciones'
        },
        {
            titulo: 'Empresas involucradas',
            valor: resultados.empresasInvolucradas,
            descripcion: 'Participantes o adjudicatarias únicas'
        },
        {
            titulo: 'Procesos adjudicado',
            valor: resultados.adjudicacionesConfirmadas,
            descripcion: 'Licitaciones con al menos una empresa ganadora'
        },
        {
            titulo: 'Monto actualizado IPC',
            valor: montoFormateado,
            descripcion:  periodoIPC
                ? `Pesos de ${periodoIPC} · ${resultados.montosActualizados} importes`
                : 'Esperando datos del IPC'
        }
    ];

    return (
        <section className= {styles.grilla}>
            {indicadores.map(indicador => (
                <TarjetaIndicador
                    key={indicador.titulo}
                    titulo={indicador.titulo}
                    valor={indicador.valor}
                    descripcion={indicador.descripcion}
                />
            ))}

        <div className={styles.detalleMonetario}>
            <div className={styles.detalleTitulo}>
                Detalle de actualización monetaria
            </div>

            <div className={styles.detalleValores}>
                <div className={styles.detalleDato}>
                    <span>Monto original</span>
                    <strong>{montoOriginal}</strong>
                </div>

                <div className={styles.detalleDato}>
                    <span>Factor IPC equivalente</span>
                    <strong>{factorEquivalente}</strong>
                </div>

                <div className={styles.detalleDato}>
                    <span>Monto actualizado</span>
                    <strong>{montoCorregido}</strong>
                </div>
            </div>

            <div className={styles.detallePie}>
                {resultados.montosActualizados} importes ·
                {` Pesos de ${periodoIPC || 'referencia pendiente'}`}
                {resultados.montosSinActualizar > 0 &&
                    ` · ${resultados.montosSinActualizar} sin actualizar`}
            </div>
        </div>
        </section>
    );
};

export default GrillaIndicadores;
