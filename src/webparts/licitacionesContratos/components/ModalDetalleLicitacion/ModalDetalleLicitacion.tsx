import * as React from 'react';
import style from './ModalDetalleLicitacion.module.scss'
import type {IModalDetalleLicitacionProps} from './IModalDetalleLicitacionProps'
import { createPortal } from 'react-dom';
import { formatearFecha, obtenerNombresEmpresas, obtenerContinuidades, obtenerFechaFinContrato} from '../../utilidades/licitacionesUtilidades';

const ModalDetalleLicitacion= (props: IModalDetalleLicitacionProps):React.ReactElement =>{
    const empresasPorId = new Map<number, string>(
    props.competidores.map(empresa => [
        empresa.id,
        empresa.nombre
        ]) 
    );
    const continuidades = obtenerContinuidades(
        props.licitacion,
        props.licitaciones
    );
    const fechaFinContrato = obtenerFechaFinContrato (
        props.licitacion,
        props.licitaciones
    ) 
    return createPortal(
    <div className={style.fondoModal}>

        <div className={style.ventanaModal}>

            <header className={style.encabezado}>
                <div className={style.tituloLicitacion}>
                    <div className={style.tituloConIcono}>
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6" />
                            <path d="M8 13h8" />
                            <path d="M8 17h8" />
                        </svg>

                        <h2>{props.licitacion.numeroProceso}</h2>
                    </div>
                <span>{props.licitacion.organismo}</span>
            </div>
                <button
                    type="button"
                    onClick={props.onCerrar}
                    aria-label="Cerrar detalle"
                    title="Cerrar detalle"
                >
                    X
                </button>
            </header>    
            <div className={style.filaDetalle}>
                <h3>Fecha</h3>
                <div className={style.valorDetalle}>
                    {formatearFecha(props.licitacion.fecha)}
                </div>
            </div>

            <div className={style.filaDetalle}>
                <h3>Expediente</h3>
                <div className={style.valorDetalle}>
                    {props.licitacion.expediente || 'No informado'}
                </div>
            </div>

            <div className={style.filaDetalle}>
                <h3>Objeto</h3>
                <div className={style.valorDetalle}>
                    {props.licitacion.objeto || 'No informado'}
                </div>
            </div>

            <div className={style.filaDetalle}>
                <h3>Tipo de servicio</h3>
                <div className={style.valorDetalle}>
                    {props.licitacion.tipoServicio.join(' · ') || 'No informado'}
                </div>
            </div>

            <div className={style.filaDetalle}>
                <h3>Fecha de fin</h3>
                <div className={style.valorDetalle}>
                    {formatearFecha(props.licitacion.fechaFin)}
                </div>
            </div>
            <div className={style.filaDetalle}>
                <h3>Resultado del proceso</h3>
                <div className={style.valorDetalle}>
                    {props.licitacion.resultadoProceso || 'No informado'}
                </div>
            </div>

            <div className={style.filaDetalle}>
                <h3>Dienst participa</h3>
                <div className={style.valorDetalle}>
                    {props.licitacion.dienstParticipa ? 'Sí' : 'No'}
                </div>
            </div>

            <div className={style.filaDetalle}>
                <h3>Resultado Dienst</h3>
                <div className={style.valorDetalle}>
                    {props.licitacion.resultadoDienst || 'No informado'}
                </div>
            </div>

            <div className={style.filaDetalle}>
                <h3>Monto adjudicado</h3>
                <div className={style.valorDetalle}>
                    {props.licitacion.montoAdjudicado
                        ? new Intl.NumberFormat('es-AR', {
                            style: 'currency',
                            currency: 'ARS'
                        }).format(props.licitacion.montoAdjudicado)
                        : 'No informado'}
                </div>
            </div>
            <div className={style.filaDetalle}>
                <h3>Adjudicatarios</h3>
                <div className={style.valorDetalle}>
                    {obtenerNombresEmpresas(
                        props.licitacion.adjudicatariosIds,
                        empresasPorId
                    ).join(' · ') || 'No documentados'}
                </div>
            </div>

            <div className={style.filaDetalle}>
                <h3>Participantes</h3>
                <div className={style.valorDetalle}>
                    {obtenerNombresEmpresas(
                        props.licitacion.empresasParticipantesIds,
                        empresasPorId
                    ).join(' · ') || 'No documentados'}
                </div>
            </div>
            <div className={style.filaDetalle}>
                <h3>Impacto competitivo</h3>
                <div className={style.valorDetalle}>
                    {props.licitacion.impactoCompetitivo || 'No informado'}
                </div>
            </div>

            <div className={style.filaDetalle}>
                <h3>Nivel de evidencia</h3>
                <div className={style.valorDetalle}>
                    {props.licitacion.nivelEvidencia || 'No informado'}
                </div>
            </div>

            <div className={style.filaDetalle}>
                <h3>Observaciones</h3>
                <div className={style.valorDetalle}>
                    {props.licitacion.observaciones || 'Sin observaciones'}
                </div>
            </div>

            <div className={style.filaDetalle}>
                <h3>Fuente</h3>
                <div className={style.valorDetalle}>
                    {props.licitacion.fuente || 'No informada'}
                </div>
            </div>   
            
            
            <div className={style.filaDetalle}>
                <h3>Continuidad</h3>

                <div className={style.valorDetalle}>
                    {continuidades.length > 0 ? (
                        <div className={style.historial}>
                            {continuidades.map(item => (
                                <div
                                    key={item.id}
                                    className={style.evento}
                                >
                                    <strong className={style.fechaEvento}>
                                        {formatearFecha(item.fecha)}
                                    </strong>

                                    <div className={style.contenidoEvento}>
                                        <strong>
                                            {item.objeto || item.titulo}
                                        </strong>

                                        {item.fechaFin && (
                                            <div className={style.fechaVencimiento}>
                                                <span>Finalización</span>
                                                <strong>
                                                    {formatearFecha(item.fechaFin)}
                                                </strong>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        'Sin continuidad documentada'
                    )}
                </div>
            </div>
            <div className={style.filaDetalle}>
                <h3>Finalización contractual</h3>

                <div className={style.valorDetalle}>
                    <div className={style.fechaVencimiento}>
                        {fechaFinContrato ? (
                            <strong>
                                {formatearFecha(fechaFinContrato)}
                            </strong>
                        ) : (
                            <span>
                                Finalización no documentada
                            </span>
                        )}
                    </div>
                </div>
            </div>



            </div>

    </div>,
    document.body
    );

}

export default ModalDetalleLicitacion