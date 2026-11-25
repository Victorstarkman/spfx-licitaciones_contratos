import * as React from 'react';
import type { ITablaLicitacionesProps } from "./ITablaLicitacionProps";
import styles from './TablaLicitacion.module.scss'
import {formatearFecha} from '../../utilidades/licitacionesUtilidades'
import { obtenerNombresEmpresas } from '../../utilidades/licitacionesUtilidades';
import { IAntecedente } from '../../modelos/IAntecedentes';
import ModalDetalleLicitacion from '../ModalDetalleLicitacion/ModalDetalleLicitacion';

const TablaLicitaciones = (props:ITablaLicitacionesProps ):React.ReactElement =>{
    //estados
    const [paginaActual, setPaginaActual] = React.useState<number>(1);
    const [licitacionSeleccionada,setLicitacionSeleccionada] = React.useState<IAntecedente | null>(null);

    //funciones
    const empresasPorId = new Map<number,string>(
        props.competidores.map(empresa => [
            empresa.id,
            empresa.nombre
        ])
    )
    const licitacionesOrdenadas = [...props.licitaciones].sort(
        (a, b) => {
            const fechaA = a.fecha ? new Date(a.fecha).getTime():0;
            const fechaB = b.fecha ? new Date(b.fecha).getTime():0;
            return fechaB -fechaA
        }
    );
    const registrosPorPagina =15;
    const totalPaginas = Math.ceil (props.licitaciones.length / registrosPorPagina);
    const inicio = (paginaActual -1) * registrosPorPagina
    const fin = inicio + registrosPorPagina
    // consultas disparadas por cambios de estado
    React.useEffect(()=>{
        if(licitacionSeleccionada){
            console.log('Licitacion Seleccionada', licitacionSeleccionada)
        };

    },[licitacionSeleccionada])
    
    return (
        <section>
            <h2>Procesos y continuidad</h2>
            <p>
              <p className={styles.subtitulo}>
                    Muestra procesos originales, prórrogas y ampliaciones.
                    Los indicadores y el gráfico sólo cuentan procesos
                    competitivos originales.
                </p>
            </p>
            <div className={styles.contenedorTabla}>
                <table className= {styles.tabla}>
                    <thead>
                        <tr>
                            <th>fecha</th>
                            <th>Organismo</th>
                            <th>Proceso</th>
                            <th>Participantes</th>
                            <th>Adjudicatarios</th>
                            <th>Resultado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {licitacionesOrdenadas.slice(inicio,fin).map(item => (
                            <tr 
                                key= {item.id}
                                onClick ={()=> setLicitacionSeleccionada(item)}> 
                                    <td>{formatearFecha(item.fecha)}</td>
                                    <td>{item.organismo}</td>
                                    <td>{item.numeroProceso}</td>
                                    <td>{obtenerNombresEmpresas(item.empresasParticipantesIds, empresasPorId).join(' . ') || '-'}</td>
                                    <td>{obtenerNombresEmpresas(item.adjudicatariosIds,empresasPorId).join(' . ') || '-'}</td>
                                    <td>{item.resultadoProceso}</td>
                            </tr>
                            
                            ))}
                            
                    </tbody>
                </table>
            </div>
{/* //================================Paginacion============================================ */}
            <div className= {styles.paginacion}>
                   <span>
                        Mostrando {inicio + 1}–
                        {Math.min(fin, licitacionesOrdenadas.length)}
                        {' '}de {licitacionesOrdenadas.length} registros
                    </span>
                <div className= {styles.controlesPagina}>
                    <button
                        type="button"
                        className={styles.botonPagina}
                        title="Primera página"
                        aria-label="Primera página"
                        disabled={paginaActual === 1}
                        onClick={() => setPaginaActual(1)}
                    >
                        «
                    </button>

                    <button
                        type="button"
                        className={styles.botonPagina}
                        title="Página anterior"
                        aria-label="Página anterior"
                        disabled={paginaActual === 1}
                        onClick={() => setPaginaActual(paginaActual - 1)}
                    >
                        ‹
                    </button>

                    <span className={styles.numeroPagina}>
                        {paginaActual} / {totalPaginas}
                    </span>

                    <button
                        type="button"
                        className={styles.botonPagina}
                        title="Página siguiente"
                        aria-label="Página siguiente"
                        disabled={paginaActual >= totalPaginas}
                        onClick={() => setPaginaActual(paginaActual + 1)}
                    >
                        ›
                    </button>

                    <button
                        type="button"
                        className={styles.botonPagina}
                        title="Última página"
                        aria-label="Última página"
                        disabled={paginaActual >= totalPaginas}
                        onClick={() => setPaginaActual(totalPaginas)}
                    >
                        »
                    </button>
                </div>
            </div>
{/* //=======================================Modal================================= */}
            {licitacionSeleccionada !== null && (
                <ModalDetalleLicitacion 
                    licitacion={licitacionSeleccionada}
                    licitaciones ={props.licitaciones}
                    competidores= {props.competidores}
                    onCerrar={()=> setLicitacionSeleccionada(null)}
                />
            )}
        </section>
    );

}

export default TablaLicitaciones