
import * as React from 'react';

import styles from './Efectividad.module.scss';

import type { IEfectividadProps } from './IEfectividadProps';

import {calcularEfectividad } from '../../../utilidades/efectividadUtilidades';
import TarjetaBaseCalculo from './TarjetaBaseCalculo/TarjetaBaseCalculo';
import GraficoEfectividad from './GraficoEfectividad/GraficoEfectividad';
import TablaLicitaciones from '../../tablaLicitacion/TablaLicitacion';
import SelectorAnios from './SelectorAnios/SelectorAnios';
import type { IAntecedente } from '../../../modelos/IAntecedentes';
import type { IAnalisisIA } from '../../../modelos/IAnalisis';
import { crearClaveAnalisisIA } from '../../../utilidades/analisisIAUtilidades';


    const Efectividad = (
        props: IEfectividadProps
    ): React.ReactElement => {

    const empresaId = Number(props.empresaSeleccionada);
    /* Esta función nos permite recuperar:
        - resultadoIA
        - motivoIA
        - tipoEvidencia
        - estadoRevision
        - fechaAnalisis */
    const obtenerAnalisisEmpresa = React.useCallback((
    item: IAntecedente
        ): IAnalisisIA | undefined => {

            const clave = crearClaveAnalisisIA(
                item.id,
                empresaId
            );

            return props.indiceAnalisisIA.get(clave);

        }, [
            empresaId,
            props.indiceAnalisisIA
        ]);

    const empresa = props.competidores.find(
        competidor => competidor.id === empresaId
    );

    const resultado = React.useMemo(() => {

    if (!props.empresaSeleccionada) {
        return undefined;
    }

    return calcularEfectividad(
        props.licitaciones,
        empresaId,
        obtenerAnalisisEmpresa
    );

    }, [
        props.licitaciones,
        props.empresaSeleccionada,
        empresaId,
        obtenerAnalisisEmpresa
    ]);
    const baseCobertura = resultado
    ? resultado.totalEvaluados +
      resultado.pendientesRevision
    : 0;

const coberturaClasificacion =
    resultado && baseCobertura > 0
        ? (resultado.totalEvaluados / baseCobertura) * 100
        : undefined;
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
                            obtenerAnalisisEmpresa={obtenerAnalisisEmpresa}
                        />

                    </div>

                    {/* PANEL DERECHO */}
                    <div className={styles.panelCalculo}>

                        <TarjetaBaseCalculo
                            nombreEmpresa={empresa?.nombre ?? ''}
                            resultado={resultado}
                            coberturaClasificacion={coberturaClasificacion}
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

         