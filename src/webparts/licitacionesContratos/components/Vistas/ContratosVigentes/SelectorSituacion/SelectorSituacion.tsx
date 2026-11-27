import * as React from 'react';

import styles from './SelectorSituacion.module.scss';

import type {
    ISelectorSituacionProps,
    TFiltroSituacion
} from './ISelectorSituacionProps';

const SelectorSituacion = (
    props: ISelectorSituacionProps
): React.ReactElement => {

    const opciones: {
        valor: TFiltroSituacion;
        etiqueta: string;
        cantidad: number;
    }[] = [

        {
            valor: 'todos',
            etiqueta: 'Todos',
            cantidad: props.totalContratos
        },
        {
            valor: 'vigente',
            etiqueta: 'Vigentes',
            cantidad: props.totalVigentes
        },
        {
            valor: 'vencido',
            etiqueta: 'Vencidos',
            cantidad: props.totalVencidos
        },
        {
            valor: 'sin_fecha_confirmada',
            etiqueta: 'Sin fecha confirmada',
            cantidad: props.totalSinFecha
        }

    ];

    return (
        <section
            className={styles.contenedor}
            aria-label="Situación contractual"
        >

            <span className={styles.titulo}>
                Situación contractual
            </span>

            <div className={styles.opciones}>

                {opciones.map(opcion => (

                    <button
                        key={opcion.valor}
                        type="button"
                        className={
                            props.situacionSeleccionada === opcion.valor
                                ? styles.opcionActiva
                                : styles.opcion
                        }
                        aria-pressed={
                            props.situacionSeleccionada === opcion.valor
                        }
                        onClick={() =>
                            props.onCambiarSituacion(opcion.valor)
                        }
                    >
                        {opcion.etiqueta} ({opcion.cantidad})
                    </button>

                ))}

            </div>

        </section>
    );
};

export default SelectorSituacion;