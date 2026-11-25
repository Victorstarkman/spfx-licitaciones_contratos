import * as React from 'react';
import styles from './SelectorAnios.module.scss';
import type {
    ISelectorAniosProps
} from './ISelectorAniosProps';

const SelectorAnios = (
    props: ISelectorAniosProps
): React.ReactElement => {

    const {
        aniosDisponibles,
        aniosSeleccionados,
        onCambiarAnios
    } = props;

    const seleccionarAnio = (anio: number): void => {

        const seleccionado =
            aniosSeleccionados.indexOf(anio) !==-1;

        const nuevaSeleccion = seleccionado
            ? aniosSeleccionados.filter(item => item !== anio)
            : [...aniosSeleccionados, anio];

        onCambiarAnios(nuevaSeleccion);
    };

   return (
    <section
        className={styles.selector}
        aria-label="Períodos de análisis"
    >

        <h4 className={styles.titulo}>
            Períodos de análisis
        </h4>

        <div className={styles.botones}>

            <button
                type="button"
                className={styles.botonAnio}
                aria-pressed={aniosSeleccionados.length === 0}
                onClick={() => onCambiarAnios([])}
            >
                Todos
            </button>

            {aniosDisponibles.map(anio => (

                <button
                    key={anio}
                    type="button"
                    className={styles.botonAnio}
                    aria-pressed={
                        aniosSeleccionados.indexOf(anio) !==-1
                    }
                    onClick={() => seleccionarAnio(anio)}
                >
                    {anio}
                </button>

            ))}

        </div>

    </section>
);
};

export default SelectorAnios;