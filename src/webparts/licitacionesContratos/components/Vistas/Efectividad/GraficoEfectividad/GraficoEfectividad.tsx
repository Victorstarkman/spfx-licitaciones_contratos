import * as React from 'react';

import styles from './GraficoEfectividad.module.scss';

import type {
    IGraficoEfectividadProps
} from './IGraficoEfectividadProps';

import {
    calcularEfectividad
} from '../../../../utilidades/efectividadUtilidades';

const GraficoEfectividad = (
    props: IGraficoEfectividadProps
): React.ReactElement => {

    // Obtener los años de las licitaciones filtradas
    const anios = Array.from(
        new Set(
            props.licitaciones
                .map(item => item.anio)
                .filter(anio => anio > 0)
        )
    ).sort((a, b) => b - a);

    return (
        <section className={styles.grafico}>

            <h3>
                Efectividad de {props.nombreEmpresa}
            </h3>

            {/* EFECTIVIDAD GLOBAL */}
            <div className={styles.resumen}>

                <span className={styles.tasaGlobal}>
                    {props.resultado.totalEvaluados > 0
                        ? `${props.resultado.tasaEfectividad.toFixed(1)}%`
                        : '—'}
                </span>

                <span>
                    {props.resultado.ganadas} adjudicaciones
                    {' '}sobre{' '}
                    {props.resultado.totalEvaluados}
                    {' '}procesos evaluados
                </span>

            </div>

            <h4>Evolución anual</h4>
            <div className={styles.leyenda}>
                <span>
                    <i style={{ backgroundColor: '#078c87' }} />
                    Ganadas
                </span>

                <span>
                    <i style={{ backgroundColor: '#b7cce6' }} />
                    Perdidas
                </span>

                <span>
                    <i style={{ backgroundColor: '#c97575' }} />
                    Desestimadas
                </span>

            </div>

            {/* EVOLUCIÓN POR AÑO */}
            {anios.map(anio => {

                const licitacionesAnio =
                    props.licitaciones.filter(
                        item => item.anio === anio
                    );

                const resultadoAnio = calcularEfectividad(
                    licitacionesAnio,
                    props.empresaId,
                     props.obtenerAnalisisEmpresa
                );

                const total = resultadoAnio.totalEvaluados;
                const ganadas = resultadoAnio.ganadas;
                const perdidas = resultadoAnio.perdidas;
                const desestimadas = resultadoAnio.desestimadas;
                // Año sin procesos evaluables
                if (total === 0) {
                    return (
                        <div
                            key={anio}
                            className={styles.filaAnual}
                        >
                            <span className={styles.anio}>
                                {anio}
                            </span>

                            <span className={styles.detalle}>
                                Sin procesos evaluables
                            </span>

                            <span className={styles.porcentaje}>
                                —
                            </span>
                        </div>
                    );
                }

                const porcentaje =
                    resultadoAnio.tasaEfectividad;
                const segmentos = [
                            {
                                nombre: 'Ganadas',
                                cantidad: ganadas,
                                color: '#078c87',
                                colorTexto: '#ffffff'
                            },
                            {
                                nombre: 'Perdidas',
                                cantidad: perdidas,
                                color: '#b7cce6',
                                colorTexto: '#17385d'
                            },
                            {
                                nombre: 'Desestimadas',
                                cantidad: desestimadas,
                                color: '#c97575',
                                colorTexto: '#382020'
                            }
                        ];
                return (
                    <div
                        key={anio}
                        className={styles.filaAnual}
                    >

                        {/* AÑO */}
                        <span className={styles.anio}>
                            {anio}
                        </span>

                       {/* BARRA APILADA */}
                        <div className={styles.barraContenedor}>

                            <div
                                className={styles.barraApilada}
                                role="img"
                                aria-label={
                                    `${anio}: ${ganadas} ganadas, ` +
                                    `${perdidas} perdidas, ` +
                                    `${desestimadas} desestimadas`
                                }
                            >

                                {segmentos
                                    .filter(segmento => segmento.cantidad > 0)
                                    .map(segmento => {

                                        const ancho =
                                            (segmento.cantidad / total) * 100;

                                        return (
                                            <div
                                                key={segmento.nombre}
                                                className={styles.segmentoBarra}
                                                style={{
                                                    width: `${ancho}%`,
                                                    backgroundColor: segmento.color,
                                                    color: segmento.colorTexto
                                                }}
                                                title={
                                                    `${segmento.nombre}: ` +
                                                    `${segmento.cantidad} de ${total} ` +
                                                    `(${ancho.toFixed(1)}%)`
                                                }
                                            >
                                                {segmento.cantidad}
                                            </div>
                                        );
                                    })
                                }

                            </div>

                        </div>

                            

                        {/* PORCENTAJE */}
                        <span className={styles.porcentaje}>
                            {Math.round(porcentaje)}%
                        </span>

                    </div>
                );
            })}

            {anios.length === 0 && (
                <p>No hay antecedentes para graficar.</p>
            )}

        </section>
    );
};

export default GraficoEfectividad;
