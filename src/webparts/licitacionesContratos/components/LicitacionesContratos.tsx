import * as React from 'react';
import type { ILicitacionesContratosProps } from './ILicitacionesContratosProps';
import {consultarLicitaciones, consultarCompetidores } from '../servicios/LicitacionesServicios'
import { IAntecedente } from '../modelos/IAntecedentes';
import { ICompetidor } from '../modelos/ICompetidor';
import TablaLicitaciones from './tablaLicitacion/TablaLicitacion';
import styles from './LicitacionesContratos.module.scss'
import GrillaIndicadores from './Indicadores/GrillaIndicadores/GrillaIndicadores';
import { consultarIPC } from '../servicios/ConsultaIPC';
import type { ISerieIPC } from '../servicios/ConsultaIPC';
import Filtros from './Filtros/Filtros';
import Efectividad from './Vistas/Efectividad/Efectividad';
import {filtrarPorCriterios} from '../utilidades/filtrosCruzados'
//empieza la funcion
const LicitacionesContratos =
(props:ILicitacionesContratosProps): React.ReactElement => {
//estados
const [licitaciones, setLicitaciones] = React.useState <IAntecedente[]>([])
const [competidores, setCompetidores] = React.useState <ICompetidor[]>([]);
const [busqueda, setBusqueda] = React.useState <string>('');
const [empresaSeleccionada,setEmpresaSeleccionada] = React.useState<string>('');
const [periodoSeleccionado,setPeriodoSeleccionado] = React.useState<string>('');
const [servicioSeleccionado, setServicioSeleccionado]= React.useState<string>('');
const [organismoSeleccionado, setOrganismoSeleccionado] = React.useState<string>('');
const [serieIPC, setSerieIPC] = React.useState<ISerieIPC | undefined> (undefined);
const [vistaActiva, setVistaActiva] = React.useState<'explorar' | 'efectividad'>('explorar');
const [aniosSeleccionados, setAniosSeleccionados] = React.useState<number[]>([]);

//uso de servicios
    React.useEffect(()=> {
    const cargarLicitaciones = async():Promise<void> => {
        try {
            const antecedentes = await consultarLicitaciones(
                props.spHttpClient
            );
            const competidores = await consultarCompetidores(
                props.spHttpClient
            )
            setLicitaciones(antecedentes);
            setCompetidores(competidores);
            //vamos a convertir competidores en un diccionario
            //uso del map para consultar adjudicatarios
            
        } catch (error) {
            console.log('Error al consultar alguna tabla', error)            
        }
    }
    cargarLicitaciones().catch((error: unknown) => {
    console.error('Error inesperado al cargar licitaciones:', error);
    });
},[props.spHttpClient]);

    React.useEffect(()=>{
        const probarConsultarIPC = async():Promise<void> => {
            try {
                const respuesta = await consultarIPC(props.spHttpClient);
               /*  console.log('IPC- Cantidad', respuesta.data.length);
                console.log('IPC -Primer Registro', respuesta.data[0]);
                console.log('IPC- ultimo registro', respuesta.data[respuesta.data.length-1]); */
                setSerieIPC(respuesta);
                
            } catch (error) {
                console.log('Error al consultar IPC', error);
            }
        }
       probarConsultarIPC().catch((error) => {
            console.error('Error inesperado al consultar IPC:', error);
        });
    },[props.spHttpClient]);

//filtros
    const organismosDisponibles = licitaciones
        .map(item => item.organismo)
        .filter((organismo, indice, organismos) =>
            Boolean(organismo) &&
            organismos.indexOf(organismo) === indice 
         )
         .sort((a, b)=> a.localeCompare(b,'es'));

    const periodosDisponibles = licitaciones
        .map(item => item.anio)
        .filter((anio, indice, anios) =>
            anio > 0 && anios.indexOf(anio) === indice
        )
        .sort((a, b) => b - a);

    const serviciosDisponibles = licitaciones
        .reduce<string[]>(
            (acumulador, item) => {
                item.tipoServicio.forEach(servicio => {

                    if(servicio && acumulador.indexOf(servicio) === -1)
                    { acumulador.push(servicio)}
                });
                return acumulador
            }
        ,[])
        .sort((a, b)=> a.localeCompare (b,'es'));
// Opciones disponibles para los filtros cruzados
const opcionesHabilitadas = React.useMemo(() => {

    const criterios = {
        empresa: empresaSeleccionada,
        periodo: periodoSeleccionado,
        servicio: servicioSeleccionado,
        organismo: organismoSeleccionado,
        anios: vistaActiva === 'efectividad'
            ? aniosSeleccionados
            : undefined
    };

    // Cada selector ignora su propio filtro
    const baseEmpresas = filtrarPorCriterios(
        licitaciones, criterios, 'empresa'
    );

    const baseServicios = filtrarPorCriterios(
        licitaciones, criterios, 'servicio'
    );

    const baseOrganismos = filtrarPorCriterios(
        licitaciones, criterios, 'organismo'
    );

    const basePeriodos = filtrarPorCriterios(
        licitaciones, criterios, 'periodo'
    );

    return {
        empresas: new Set<number>(
            baseEmpresas.reduce<number[]>((ids, item) => {
                return ids.concat(
                    item.adjudicatariosIds,
                    item.empresasParticipantesIds
                );
            }, [])
        ),

        servicios: new Set<string>(
            baseServicios.reduce<string[]>((servicios, item) => {
                return servicios.concat(item.tipoServicio);
            }, [])
        ),

        organismos: new Set<string>(
            baseOrganismos.map(item => item.organismo)
        ),

        periodos: new Set<number>(
            basePeriodos.map(item => item.anio)
        )
    };

}, [
    licitaciones,
    empresaSeleccionada,
    periodoSeleccionado,
    servicioSeleccionado,
    organismoSeleccionado,
    vistaActiva,
    aniosSeleccionados
]);
console.log('Control de empresas:', {
    vistaActiva,
    empresaSeleccionada,
    aniosSeleccionados,
    empresasHabilitadas: opcionesHabilitadas.empresas.size
});
const licitacionesFiltradas = React.useMemo(() => {

        const texto = busqueda.trim().toLowerCase();

        const empresasPorId = new Map<number, string>(
            competidores.map(empresa => [
                empresa.id,
                empresa.nombre
            ])
        );
      return licitaciones.filter(item => {

    const idsEmpresas = [
            ...item.adjudicatariosIds,
            ...item.empresasParticipantesIds
        ];
    const coincideEmpresa =
            !empresaSeleccionada ||
            idsEmpresas.indexOf(Number(empresaSeleccionada)) !== -1;
        
    const coincidePeriodo =
    vistaActiva === 'efectividad'
        ? (
            aniosSeleccionados.length === 0 ||
            aniosSeleccionados.indexOf(item.anio) !== -1 
        )
        : (
            !periodoSeleccionado ||
            item.anio === Number(periodoSeleccionado)
        );
        
    const coincideTipoServicio = 
            !servicioSeleccionado ||
            item.tipoServicio.indexOf(servicioSeleccionado)!== -1;

    const coincideOrganismo = 
            !organismoSeleccionado ||
            item.organismo.indexOf(organismoSeleccionado) !== -1

    const nombresEmpresas = idsEmpresas
            .map(id => empresasPorId.get(id) ?? '')
            .join(' ');

    const contenido = [
            item.organismo,
            item.numeroProceso,
            item.expediente,
            item.objeto,
            item.titulo,
            nombresEmpresas
        ]
            .join(' ')
            .toLowerCase();

        return contenido.includes(texto) && 
        coincideEmpresa && 
        coincidePeriodo && 
        coincideTipoServicio &&
        coincideOrganismo;

    });

    }, [busqueda, 
        licitaciones, 
        competidores,
        empresaSeleccionada,
        periodoSeleccionado,
        servicioSeleccionado,
        organismoSeleccionado,
        vistaActiva,
        aniosSeleccionados]);
    
    
    const empresaFiltrada = competidores.find ( 
        empresa => empresa.id === Number(empresaSeleccionada)

    );

    const descripcionFiltros = [
        busqueda &&`Busqueda: ${busqueda}`,
        empresaSeleccionada && `Empresa: ${empresaFiltrada?.nombre ?? empresaSeleccionada}`,
        periodoSeleccionado && `Periodo: ${periodoSeleccionado}`,
        servicioSeleccionado && `Servicio: ${servicioSeleccionado}`,
        organismoSeleccionado && `Organismo: ${organismoSeleccionado}`
    ].filter(Boolean).join(' . ') || 'Sin Filtros'
    
    const hayFiltrosActivos = Boolean(
        busqueda.trim() ||
        empresaSeleccionada ||
        periodoSeleccionado ||
        servicioSeleccionado ||
        organismoSeleccionado
    );
    
    return (
        <>
{/* Encabezado */}    
        <header className={styles.encabezado}>

            <div className={styles.marca}>
                <span className={styles.simbolo}>⠿</span>
                <strong>Medicina Laboral</strong>
                <span className={styles.mercado}>Mercado público</span>
            </div>

            <div className={styles.contenidoHeader}>
                <div className={styles.titulos}>
                    <h1>Licitaciones y contratos</h1>
                    <p>
                        Procesos originales, participación competitiva
                        y continuidad documentada.
                    </p>
                </div>

                <span className={styles.actualizacion}>
                    Actualizado con {licitaciones.length} hitos
                    y {competidores.length} empresas
                </span>
            </div>
        </header>
{/* Area de navegacion */}
        <nav
            className={styles.navegacion}
            aria-label="Vistas de licitaciones"
        >
           <button
                type="button"
                className={
                    vistaActiva === 'explorar'
                        ? styles.pestanaActiva
                        : styles.pestana
                }
                onClick={() => setVistaActiva('explorar')}
                aria-current={vistaActiva === 'explorar' ? 'page' : undefined}
            >
                Explorar
            </button>
            <button
                type="button"
                className={
                    vistaActiva === 'efectividad'
                        ? styles.pestanaActiva
                        : styles.pestana
                }
                onClick={() => setVistaActiva('efectividad')}
                aria-current={vistaActiva === 'efectividad' ? 'page' : undefined}
            >
                Efectividad
            </button>

            <button
                type="button"
                className={styles.pestana}
                disabled
                title="Vista pendiente de implementación"
            >
                Contratos vigentes
            </button>
        </nav>
{/* filtros */}
        <Filtros
            competidores={competidores}
            periodosDisponibles={periodosDisponibles}
            serviciosDisponibles={serviciosDisponibles}
            organismosDisponibles={organismosDisponibles}

            busqueda={busqueda}
            empresaSeleccionada={empresaSeleccionada}
            periodoSeleccionado={periodoSeleccionado}
            servicioSeleccionado={servicioSeleccionado}
            organismoSeleccionado={organismoSeleccionado}

            setBusqueda={setBusqueda}
            setEmpresaSeleccionada={setEmpresaSeleccionada}
            setPeriodoSeleccionado={setPeriodoSeleccionado}
            setServicioSeleccionado={setServicioSeleccionado}
            setOrganismoSeleccionado={setOrganismoSeleccionado}

            hayFiltrosActivos={hayFiltrosActivos}
            descripcionFiltros={descripcionFiltros}

            empresasHabilitadas={opcionesHabilitadas.empresas}
            serviciosHabilitados={opcionesHabilitadas.servicios}
            organismosHabilitados={opcionesHabilitadas.organismos}
            periodosHabilitados={opcionesHabilitadas.periodos}
            deshabilitarPeriodo={vistaActiva === 'efectividad'}
        />

{/* Contenido de la vista seleccionada */}
{vistaActiva === 'explorar' ? (
    <>
        {/* Grilla de indicadores */}
        <section>
            <GrillaIndicadores
                licitaciones={licitacionesFiltradas}
                descripcionFiltros={descripcionFiltros}
                serieIPC={serieIPC}
            />
        </section>

        {/* Tabla de licitaciones */}
        <TablaLicitaciones
            key={[
                busqueda,
                empresaSeleccionada,
                periodoSeleccionado,
                servicioSeleccionado,
                organismoSeleccionado
            ].join('|')}
            licitaciones={licitacionesFiltradas}
            competidores={competidores}
        />
    </>
) : (
    <Efectividad
        licitaciones={licitacionesFiltradas}
        competidores={competidores}
        empresaSeleccionada={empresaSeleccionada}
        aniosDisponibles={periodosDisponibles}
        aniosSeleccionados={aniosSeleccionados}
        onCambiarAnios={setAniosSeleccionados}
        />
)}
</>
)};
export default LicitacionesContratos