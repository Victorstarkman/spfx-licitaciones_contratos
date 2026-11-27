import * as React from 'react';
import type { IContratosVigentesProps } from './IContratosVigentesProps';
import styles from './ContratosVigentes.module.scss';
import {  filtrarContratos } from '../../../utilidades/contratoUtilidades';
import { IContrato } from '../../../modelos/IContratos';
import SelectorSituacion from './SelectorSituacion/SelectorSituacion';
import  TablaContratos from './TablaContratos/TablaContratos';

const ContratosVigentes = (
        props: IContratosVigentesProps
    ): React.ReactElement => {

    //estados
    
    //funciones
    const {
            contratos,
            situacionSeleccionada,
            contratosSeleccionados,
            setContratosSeleccionados
        } = props;
    const contratosBase = React.useMemo(() => {

    return filtrarContratos(
        contratos,
            props.competidores,
            {
                busqueda: props.busqueda,
                empresa: props.empresaSeleccionada,
                periodo: props.periodoSeleccionado,
                servicio: props.servicioSeleccionado,
                organismo: props.organismoSeleccionado
            }
        );

    }, [
        contratos,
        props.competidores,
        props.busqueda,
        props.empresaSeleccionada,
        props.periodoSeleccionado,
        props.servicioSeleccionado,
        props.organismoSeleccionado
    ]);
    const contratosVigentes: IContrato[] = [];
    const contratosVencidos: IContrato[] = [];
    const contratosSinFecha: IContrato[] = [];

    contratosBase.forEach(item => {

        switch (item.situacion) {

            case 'vigente':
                contratosVigentes.push(item);
                break;

            case 'vencido':
                contratosVencidos.push(item);
                break;

            case 'sin_fecha_confirmada':
                contratosSinFecha.push(item);
                break;
        }

});
    let contratosFiltrados: IContrato[];

    switch (situacionSeleccionada) {

        case 'vigente':
            contratosFiltrados = contratosVigentes;
            break;

        case 'vencido':
            contratosFiltrados = contratosVencidos;
            break;

        case 'sin_fecha_confirmada':
            contratosFiltrados = contratosSinFecha;
            break;

        case 'todos':
        default:
            contratosFiltrados = contratosBase;
            break;
    }
    const seleccionarContrato = (clave: string): void => {

    setContratosSeleccionados(anteriores => {

        if (anteriores.indexOf(clave) !== -1) {

            return anteriores.filter(
                item => item !== clave
            );

        }

        return [...anteriores, clave];

        });
    };
//UI 
    return (
     <section className={styles.contenedor}>

       <SelectorSituacion
            situacionSeleccionada={situacionSeleccionada}
            totalContratos={contratosBase.length}
            totalVigentes={contratosVigentes.length}
            totalVencidos={contratosVencidos.length}
            totalSinFecha={contratosSinFecha.length}
            onCambiarSituacion={props.onCambiarSituacion}
        />

        <h2>Contratos y continuidad</h2>

        <p>
            Vigencia contractual, prórrogas,
            ampliaciones y seguimiento de vencimientos.
        </p>

        <p>
            Contratos encontrados: {contratosFiltrados.length}
        </p>
        <TablaContratos
            contratos={contratosFiltrados}
            licitaciones={props.licitaciones}
            competidores={props.competidores}
            contratosSeleccionados={contratosSeleccionados}
            onSeleccionarContrato={seleccionarContrato}
        />
    </section>
 );
};

export default ContratosVigentes;