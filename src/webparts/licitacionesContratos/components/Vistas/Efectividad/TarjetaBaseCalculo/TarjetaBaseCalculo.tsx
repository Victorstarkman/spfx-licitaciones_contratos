import * as React from 'react';

import styles from './TarjetaBaseCalculo.module.scss';

import type {
    ITarjetaBaseCalculoProps
} from './ITarjetaBaseCalculoProps';

const TarjetaBaseCalculo = (
    props: ITarjetaBaseCalculoProps
): React.ReactElement => {

    const { nombreEmpresa, resultado } = props;

    return (
        <aside className={styles.tarjeta}>

            <h3 className={styles.titulo}>
                Base de cálculo
            </h3>

            <p className={styles.empresa}>
                {nombreEmpresa}
            </p>

            <dl className={styles.indicadores}>

                <div className={styles.fila}>
                    <dt>Procesos evaluados</dt>
                    <dd>{resultado.totalEvaluados}</dd>
                </div>

                <div className={styles.fila}>
                        <dt className= {`${styles.resultadoEtiqueta} ${styles.ganadas}`}>Ganadas</dt>
                    <dd>{resultado.ganadas}</dd>
                </div>

                <div className={styles.fila}>
                    <dt className={`${styles.resultadoEtiqueta} ${styles.perdidas}`}>Perdidas</dt>
                    <dd>{resultado.perdidas}</dd>
                </div>

                <div className={styles.fila}>
                    <dt className={`${styles.resultadoEtiqueta} ${styles.desestimadas}`}>Desestimadas</dt>
                    <dd>{resultado.desestimadas}</dd>
                </div>

                <div className={styles.fila}>
                    <dt>Sin resolución confirmada</dt>
                    <dd>{resultado.pendientesRevision}</dd>
                </div>

                <div className={styles.fila}>
                    <dt>No evaluables</dt>
                    <dd>{resultado.noEvaluables}</dd>
                </div>
               <div className={styles.coberturaClasificacion}>
                    <div className={styles.coberturaEncabezado}>

                        <span>Cobertura de clasificación</span>

                        <strong>
                            {props.coberturaClasificacion !== undefined
                                ? `${props.coberturaClasificacion.toFixed(1)} %`
                                : '—'}
                        </strong>

                    </div>

                    <div className={styles.coberturaBarra}>
                        <div
                            className={styles.coberturaProgreso}
                            style={{
                                width: `${props.coberturaClasificacion ?? 0}%`
                            }}
                        />
                    </div>

                    <small>
                        Antecedentes con resultado competitivo clasificado.
                    </small>

                </div>

            </dl>

            <p className={styles.nota}>
                Los procesos sin resolución confirmada
                y los no evaluables no intervienen
                en la tasa de efectividad.
            </p>

        </aside>
    );
};

export default TarjetaBaseCalculo;