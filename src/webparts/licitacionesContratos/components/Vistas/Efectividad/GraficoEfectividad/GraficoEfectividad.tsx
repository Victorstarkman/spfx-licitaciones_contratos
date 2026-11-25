

import * as React from 'react';

import { ProgressIndicator } from '@fluentui/react';

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

            {/* EVOLUCIÓN POR AÑO */}
            {anios.map(anio => {

                const licitacionesAnio =
                    props.licitaciones.filter(
                        item => item.anio === anio
                    );

                const resultadoAnio = calcularEfectividad(
                    licitacionesAnio,
                    props.empresaId
                );

                const total = resultadoAnio.totalEvaluados;
                const ganadas = resultadoAnio.ganadas;

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

                return (
                    <div
                        key={anio}
                        className={styles.filaAnual}
                    >

                        {/* AÑO */}
                        <span className={styles.anio}>
                            {anio}
                        </span>

                        {/* BARRA */}
                        <div className={styles.barraContenedor}>

                            <ProgressIndicator
                                className={styles.barra}
                                percentComplete={porcentaje / 100}
                                barHeight={22}
                                ariaLabel={
                                    `${anio}: ${ganadas} adjudicaciones ` +
                                    `sobre ${total} procesos evaluados`
                                }
                               styles={{
                                    progressTrack: {
                                        backgroundColor: '#b7cce6',
                                        borderRadius: '6px',
                                        overflow: 'hidden'
                                    },
                                    progressBar: {
                                        backgroundColor: '#078c87',
                                        borderRadius: '6px'
                                    }
                                }}
                            />

                            {/* CANTIDADES DENTRO DE LA BARRA */}
                            <span
                                className={styles.detalle}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    left: 16,
                                    height: 22,
                                    lineHeight: '22px',
                                    pointerEvents: 'none',
                                    color: porcentaje >= 40
                                        ? '#ffffff'
                                        : '#17385d',
                                    fontWeight: 600
                                }}
                                title={
                                    `${ganadas} adjudicaciones ` +
                                    `sobre ${total} evaluados`
                                }
                            >
                                {ganadas} / {total}
                            </span>

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
