import * as React from 'react';

import type {
    ITablaContratosProps
} from './ITablaContratosProps';

import type {
    IAntecedente
} from '../../../../modelos/IAntecedentes';

import {
    formatearFecha,
    obtenerNombresEmpresas
} from '../../../../utilidades/licitacionesUtilidades';

import ModalDetalleLicitacion
    from '../../../ModalDetalleLicitacion/ModalDetalleLicitacion';

import styles from './TablaContratos.module.scss';

const TablaContratos = (
    props: ITablaContratosProps
): React.ReactElement => {

    // Estados
    const [paginaActual, setPaginaActual] =
        React.useState<number>(1);

    const [licitacionSeleccionada, setLicitacionSeleccionada] =
        React.useState<IAntecedente | undefined>(undefined);

    // Diccionario de empresas
    const empresasPorId = React.useMemo(() => {

        return new Map<number, string>(
            props.competidores.map(empresa => [
                empresa.id,
                empresa.nombre
            ])
        );

    }, [props.competidores]);

    // Orden por fecha de finalización
    const contratosOrdenados = React.useMemo(() => {

        return [...props.contratos].sort((a, b) => {

            const fechaA = Date.parse(a.fechaFin);
            const fechaB = Date.parse(b.fechaFin);

            const valorA = Number.isNaN(fechaA)
                ? Infinity
                : fechaA;

            const valorB = Number.isNaN(fechaB)
                ? Infinity
                : fechaB;

            return valorA === valorB
                ? 0
                : valorA - valorB;

        });

    }, [props.contratos]);

    // Paginación
    const registrosPorPagina = 10;

    const totalPaginas = Math.max(
        1,
        Math.ceil(
            contratosOrdenados.length / registrosPorPagina
        )
    );

    const paginaVisible = Math.min(
        paginaActual,
        totalPaginas
    );

    const inicio =
        (paginaVisible - 1) * registrosPorPagina;

    const fin = inicio + registrosPorPagina;

    // Reiniciar página al cambiar los contratos
    React.useEffect(() => {

        setPaginaActual(1);

    }, [props.contratos]);

    // Renderizado
    return (

        <section className={styles.contenedor}>

            <div className={styles.contenedorTabla}>

                <table className={styles.tabla}>

                    <thead>
                        <tr>
                            <th>Seguir</th>
                            <th>Organismo / Proceso</th>
                            <th>Proveedor</th>
                            <th>Servicio</th>
                            <th>Fin actual</th>
                            <th>Situación</th>
                        </tr>
                    </thead>

                    <tbody>

                        {contratosOrdenados
                            .slice(inicio, fin)
                            .map(contrato => (

                            <tr
                                key={contrato.clave}
                                onClick={() =>
                                    setLicitacionSeleccionada(
                                        contrato.antecedenteOriginal
                                    )
                                }
                            >

                                {/* Seguimiento */}
                                <td
                                    onClick={event =>
                                        event.stopPropagation()
                                    }
                                >
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        aria-label={
                                            `Seguir ${contrato.numeroProceso}`
                                        }
                                        disabled={
                                            contrato.situacion ===
                                            'sin_fecha_confirmada'
                                        }
                                        checked={
                                            props.contratosSeleccionados
                                                .indexOf(contrato.clave) !== -1
                                        }
                                        onChange={() =>
                                            props.onSeleccionarContrato(
                                                contrato.clave
                                            )
                                        }
                                    />
                                </td>

                                {/* Organismo y proceso */}
                                <td>
                                    <strong>
                                        {contrato.organismo}
                                    </strong>

                                    <button
                                        type="button"
                                        className={styles.numeroProceso}
                                        onClick={event => {
                                            event.stopPropagation();

                                            setLicitacionSeleccionada(
                                                contrato.antecedenteOriginal
                                            );
                                        }}
                                    >
                                        {contrato.numeroProceso ||
                                            'Ver detalle'}
                                    </button>
                                </td>

                                {/* Proveedor */}
                                <td>
                                    {obtenerNombresEmpresas(
                                        contrato.adjudicatariosIds,
                                        empresasPorId
                                    ).join(' · ') || '—'}
                                </td>

                                {/* Servicio */}
                                <td>
                                    {contrato.tipoServicio.join(', ')
                                        || 'No informado'}
                                </td>

                                {/* Fecha de finalización */}
                                <td className={styles.fecha}>
                                    {contrato.fechaFin
                                        ? formatearFecha(contrato.fechaFin)
                                        : 'Por verificar'}
                                </td>

                                {/* Situación contractual */}
                                <td>
                                    <span
                                        className={
                                            contrato.situacion === 'vigente'
                                                ? styles.vigente
                                                : contrato.situacion === 'vencido'
                                                    ? styles.vencido
                                                    : styles.sinFecha
                                        }
                                    >
                                        {contrato.situacion === 'vigente'
                                            ? 'Vigente'
                                            : contrato.situacion === 'vencido'
                                                ? 'Fin vencido'
                                                : 'Sin fecha confirmada'}
                                    </span>
                                </td>

                            </tr>

                        ))}

                        {contratosOrdenados.length === 0 && (

                            <tr>
                                <td
                                    colSpan={6}
                                    className={styles.sinResultados}
                                >
                                    No hay contratos para los
                                    filtros seleccionados.
                                </td>
                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

            {/* Paginación */}

            <div className={styles.paginacion}>

                <span>
                    Mostrando {
                        contratosOrdenados.length > 0
                            ? inicio + 1
                            : 0
                    }–
                    {Math.min(fin, contratosOrdenados.length)}
                    {' '}de {contratosOrdenados.length} contratos
                </span>

                <div className={styles.controlesPagina}>

                    <button
                        type="button"
                        className={styles.botonPagina}
                        aria-label="Primera página"
                        disabled={paginaVisible === 1}
                        onClick={() => setPaginaActual(1)}
                    >
                        «
                    </button>

                    <button
                        type="button"
                        className={styles.botonPagina}
                        aria-label="Página anterior"
                        disabled={paginaVisible === 1}
                        onClick={() =>
                            setPaginaActual(paginaVisible - 1)
                        }
                    >
                        ‹
                    </button>

                    <span className={styles.numeroPagina}>
                        {paginaVisible} / {totalPaginas}
                    </span>

                    <button
                        type="button"
                        className={styles.botonPagina}
                        aria-label="Página siguiente"
                        disabled={paginaVisible >= totalPaginas}
                        onClick={() =>
                            setPaginaActual(paginaVisible + 1)
                        }
                    >
                        ›
                    </button>

                    <button
                        type="button"
                        className={styles.botonPagina}
                        aria-label="Última página"
                        disabled={paginaVisible >= totalPaginas}
                        onClick={() =>
                            setPaginaActual(totalPaginas)
                        }
                    >
                        »
                    </button>

                </div>

            </div>

            {/* Modal existente */}

            {licitacionSeleccionada && (

                <ModalDetalleLicitacion
                    licitacion={licitacionSeleccionada}
                    licitaciones={props.licitaciones}
                    competidores={props.competidores}
                    onCerrar={() =>
                        setLicitacionSeleccionada(undefined)
                    }
                />

            )}

        </section>

    );

};

export default TablaContratos;