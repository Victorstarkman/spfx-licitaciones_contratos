
import * as React from 'react';
import type { IFiltrosProps } from './IFiltrosProps';

// Temporalmente reutilizamos los estilos existentes.
// Más adelante los trasladaremos a Filtros.module.scss.
import styles from './Filtros.module.scss'
const Filtros = (props: IFiltrosProps): React.ReactElement => {

    const limpiarFiltros = (): void => {

        props.setBusqueda('');
        props.setEmpresaSeleccionada('');
        props.setServicioSeleccionado('');
        props.setOrganismoSeleccionado('');

        if (props.deshabilitarPeriodo) {
            props.onLimpiarAnios();
        } else {
            props.setPeriodoSeleccionado('');
        }

    };

    return (
        <section className={styles.filtros}>

            {/* Buscador */}
            <div className={styles.campoBusqueda}>
                <label htmlFor="buscarLicitacion">
                    Buscar licitaciones
                </label>

                <input
                    id="buscarLicitacion"
                    type="search"
                    value={props.busqueda}
                    onChange={(event) =>
                        props.setBusqueda(event.currentTarget.value)
                    }
                    placeholder="Organismo, empresa o N.º de proceso..."
                />
            </div>

            {/* Selectores */}
            <div className={styles.grillaFiltros}>

                {/* Empresa */}
                <div className={styles.campoBusqueda}>
                    <label htmlFor="filtroEmpresa">
                        Empresa
                    </label>

                    <select
                        id="filtroEmpresa"
                        value={props.empresaSeleccionada}
                        onChange={(event) =>
                            props.setEmpresaSeleccionada(
                                event.currentTarget.value
                            )
                        }
                    >
                        <option value="">Todas las empresas</option>

                        {[...props.competidores]
                            .sort((a, b) =>
                                a.nombre.localeCompare(b.nombre, 'es')
                            )
                            .map(competidor => (
                            <option
                                key={competidor.id}
                                value={competidor.id}
                                disabled={
                                    !props.empresasHabilitadas.has(competidor.id) &&
                                    props.empresaSeleccionada !== String(competidor.id)
                                }
                            >
                                {competidor.nombre}
                            </option>
                        ))
                    }
                    </select>
                </div>

                {/* Período */}
                <div className={styles.campoBusqueda}>
                    <label htmlFor="filtroPeriodo">
                        Período
                    </label>

                    <select
                        id="filtroPeriodo"
                        disabled={props.deshabilitarPeriodo}
                        value={
                            props.deshabilitarPeriodo
                                ? ''
                                : props.periodoSeleccionado
                        }
                        onChange={(event) =>
                            props.setPeriodoSeleccionado(
                                event.currentTarget.value
                            )
                        }
                    >
                        <option value="">Todos los años</option>

                        {props.periodosDisponibles.map(anio => (
                            <option 
                                key={anio} 
                                value={anio}
                                disabled={
                                    !props.periodosHabilitados.has(anio) &&
                                    props.periodoSeleccionado !== String(anio)
                                }
                                >
                                {anio}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tipo de servicio */}
                <div className={styles.campoBusqueda}>
                    <label htmlFor="filtroTipoServicio">
                        Tipo de Servicio
                    </label>

                    <select
                        id="filtroTipoServicio"
                        value={props.servicioSeleccionado}
                        onChange={(event) =>
                            props.setServicioSeleccionado(
                                event.currentTarget.value
                            )
                        }
                    >
                        <option value="">Todos los servicios</option>

                        {props.serviciosDisponibles.map(servicio => (
                            <option 
                                key={servicio} 
                                value={servicio}
                                disabled={
                                        !props.serviciosHabilitados.has(servicio) &&
                                        props.servicioSeleccionado !== servicio
                                    }
                                >
                                {servicio}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Organismo */}
                <div className={styles.campoBusqueda}>
                    <label htmlFor="filtroOrganismo">
                        Organismo Contratante
                    </label>

                    <select
                        id="filtroOrganismo"
                        value={props.organismoSeleccionado}
                        onChange={(event) =>
                            props.setOrganismoSeleccionado(
                                event.currentTarget.value
                            )
                        }
                    >
                        <option value="">Todos los organismos</option>

                        {props.organismosDisponibles.map(organismo => (
                            <option 
                                key={organismo} 
                                value={organismo}
                                 disabled={
                                        !props.organismosHabilitados.has(organismo) &&
                                        props.organismoSeleccionado !== organismo
                                    }
                                >
                                {organismo}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Descripción de filtros aplicados */}
            {props.hayFiltrosActivos && (
                <div className={styles.resumenFiltros}>
                    <span className={styles.resumenFiltrosTitulo}>
                        Filtros Aplicados
                    </span>

                    <span className={styles.resumenFiltrosTexto}>
                        {props.descripcionFiltros}
                    </span>
                </div>
            )}

            {/* Limpiar filtros */}
            <div className={styles.accionesFiltros}>
                <button
                    type="button"
                    className={styles.botonLimpiar}
                    aria-label="Limpiar todos los filtros"
                    title="Restablecer todos los filtros"
                    onClick={limpiarFiltros}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M3 12a9 9 0 1 0 3-6.7" />
                        <path d="M3 3v6h6" />
                    </svg>
                </button>
            </div>
        </section>
    );
};

export default Filtros;
