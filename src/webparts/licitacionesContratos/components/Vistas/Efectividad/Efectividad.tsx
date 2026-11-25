
import * as React from 'react';

import styles from './Efectividad.module.scss';

import type { IEfectividadProps } from './IEfectividadProps';

import {
    calcularEfectividad
} from '../../../utilidades/efectividadUtilidades';

import TarjetaBaseCalculo from './TarjetaBaseCalculo/TarjetaBaseCalculo';
import GraficoEfectividad from './GraficoEfectividad/GraficoEfectividad';
import TablaLicitaciones from '../../tablaLicitacion/TablaLicitacion';
import SelectorAnios from './SelectorAnios/SelectorAnios';

const Efectividad = (
    props: IEfectividadProps
): React.ReactElement => {

    const empresaId = Number(props.empresaSeleccionada);

    const empresa = props.competidores.find(
        competidor => competidor.id === empresaId
    );

    const resultado = React.useMemo(() => {

        if (!props.empresaSeleccionada) {
            return undefined;
        }

        return calcularEfectividad(
            props.licitaciones,
            empresaId
        );

    }, [
        props.licitaciones,
        props.empresaSeleccionada,
        empresaId
    ]);

  return (
    <section>
        <SelectorAnios
        aniosDisponibles={props.aniosDisponibles}
        aniosSeleccionados={props.aniosSeleccionados}
        onCambiarAnios={props.onCambiarAnios}
         />
        <h2>Análisis de efectividad competitiva</h2>

        {!resultado ? (

            <p>
                Elija una empresa en el filtro Empresa
                para visualizar los indicadores de efectividad.
            </p>

        ) : (

            <>

                <div className={styles.contenedorEfectividad}>

                    {/* PANEL IZQUIERDO */}
                    <div className={styles.panelGrafico}>

                        <GraficoEfectividad
                            nombreEmpresa={empresa?.nombre ?? ''}
                            empresaId={empresaId}
                            licitaciones={props.licitaciones}
                            resultado={resultado}
                        />

                    </div>

                    {/* PANEL DERECHO */}
                    <div className={styles.panelCalculo}>

                        <TarjetaBaseCalculo
                            nombreEmpresa={empresa?.nombre ?? ''}
                            resultado={resultado}
                        />

                    </div>

                </div>

                {/* TABLA DE LICITACIONES */}
                <TablaLicitaciones
                    licitaciones={props.licitaciones}
                    competidores={props.competidores}
                />

            </>

        )}

    </section>
);
};

export default Efectividad;

         