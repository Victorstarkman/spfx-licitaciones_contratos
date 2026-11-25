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
/* import { analizarEmpresaProceso, 
        clasificarResultadoCompetitivo,
        calcularEfectividad,
        extraerEvidenciasObservaciones } from '../utilidades/efectividadUtilidades';
 */
import { detectarEmpresasDesestimadas, 
    obtenerVariantesNombreEmpresa,
    normalizarNombreEmpresa,
    extraerGruposDesestimados } from '../utilidades/efectividadUtilidades';

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
const empresasPorId = React.useMemo(() => {
    const mapa = new Map<number, string>();
    
    competidores.forEach(empresa => {
        mapa.set(empresa.id, empresa.nombre);
    });

    return mapa;
}, [competidores]);

React.useEffect(() => {
if (licitaciones.length === 0 || empresasPorId.size === 0) {
        return;
    }

    const conteos = new Map<number, number>();

    let procesosDetectados = 0;
    let atribucionesDetectadas = 0;

    licitaciones.forEach(item => {
        const empresas = detectarEmpresasDesestimadas(
            item.observaciones,
            empresasPorId
        );

        if (empresas.length > 0) {
            procesosDetectados++;
        }

        empresas.forEach(empresa => {
            atribucionesDetectadas++;

            conteos.set(
                empresa.empresaId,
                (conteos.get(empresa.empresaId) || 0) + 1
            );
        });
    });

    console.log('RESUMEN DETECTOR DE DESESTIMACIONES', {
        registrosAnalizados: licitaciones.length,
        procesosDetectados,
        atribucionesDetectadas
    });

    console.table(
        Array.from(conteos.entries())
            .map(([empresaId, cantidad]) => ({
                empresaId,
                empresa: empresasPorId.get(empresaId),
                cantidad
            }))
            .sort((a, b) => b.cantidad - a.cantidad)
    );
    console.table(
    Array.from(empresasPorId.entries())
        .map(([id, nombre]) => ({
            id,
            nombre
        }))
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        )
);
const variantesPorNombre = new Map<string, number[]>();

empresasPorId.forEach((nombre, empresaId) => {

    const variantes = obtenerVariantesNombreEmpresa(nombre);

    variantes.forEach(variante => {

        const ids = variantesPorNombre.get(variante) || [];

        ids.push(empresaId);

        variantesPorNombre.set(variante, ids);
    });
});

    const variantesAmbiguas = Array.from(
        variantesPorNombre.entries()
    )
        .filter(([, ids]) => ids.length > 1)
        .map(([variante, ids]) => ({
            variante,
            empresasIds: ids.join(', '),
            cantidad: ids.length
        }));

    console.log('CONTROL DE VARIANTES', {
        competidores: empresasPorId.size,
        variantesGeneradas: variantesPorNombre.size,
        variantesAmbiguas: variantesAmbiguas.length
    });

    console.table(variantesAmbiguas);
    const sinAtribucion = licitaciones.filter(item => {

    const observaciones = item.observaciones || '';

    const hayMencion =
        /\b(?:desestim\w*|rechaz\w*|inadmisib\w*)\b/i
            .test(observaciones);

    if (!hayMencion) {
        return false;
    }

    const empresas = detectarEmpresasDesestimadas(
        observaciones,
        empresasPorId
    );

    return empresas.length === 0;
});

console.log(
    'PROCESOS CON MENCIONES SIN ATRIBUCION:',
    sinAtribucion.length
);

console.table(
    sinAtribucion.map(item => ({
        id: item.id,
        proceso: item.numeroProceso,
        observaciones: item.observaciones
    }))

);

const patronNegacion =
    /\bno\s+(?:se\s+)?(?:visualizan|registraron|identificaron|detectaron|publicaron|infieren|constan)\s+(?:ofertas\s+)?desestimaciones\b|\bno\s+clasificar\s+como\s+desestimad[oa]s?\b/i;

const conNegacion = sinAtribucion.filter(item =>
    patronNegacion.test(item.observaciones || '')
);

const restantes = sinAtribucion.filter(item =>
    !patronNegacion.test(item.observaciones || '')
);

console.log('DIAGNOSTICO DE EXPRESIONES', {
    sinAtribucion: sinAtribucion.length,
    conNegacion: conNegacion.length,
    restantes: restantes.length
});


const diagnosticoNombres = restantes.map(item => {

    const texto = normalizarNombreEmpresa(
        item.observaciones || ''
    );

    const empresasEncontradas: string[] = [];

    empresasPorId.forEach(nombre => {

        const variantes = obtenerVariantesNombreEmpresa(nombre);

        const encontrada = variantes.some(variante => {

            const posicion = texto.indexOf(variante);

            if (posicion === -1) {
                return false;
            }

            const anterior = posicion > 0
                ? texto.charAt(posicion - 1)
                : '';

            const posterior = texto.charAt(
                posicion + variante.length
            );

            return (
                (!anterior || !/[a-z0-9]/i.test(anterior)) &&
                (!posterior || !/[a-z0-9]/i.test(posterior))
            );
        });

        if (encontrada) {
            empresasEncontradas.push(nombre);
        }
    });

    return {
        id: item.id,
        empresasReconocidas: empresasEncontradas.length,
        nombres: empresasEncontradas.join(' | ')
    };
});

console.log('DIAGNOSTICO DE NOMBRES', {
    conEmpresasReconocidas: diagnosticoNombres.filter(
        item => item.empresasReconocidas > 0
    ).length,

    sinEmpresasReconocidas: diagnosticoNombres.filter(
        item => item.empresasReconocidas === 0
    ).length
});
console.table(
    diagnosticoNombres
        .filter(item => item.empresasReconocidas > 0)
        .map(item => {
            const licitacion = restantes.find(
                lic => lic.id === item.id
            );

            return {
                id: item.id,
                empresas: item.nombres,
                observaciones: licitacion?.observaciones || ''
            };
        })
);

diagnosticoNombres
    .filter(item => item.empresasReconocidas > 0)
    .forEach(item => {

        const licitacion = restantes.find(
            lic => lic.id === item.id
        );

        const texto = licitacion?.observaciones || '';

        const patron =
            /\b(?:desestim\w*|rechaz\w*|inadmisib\w*)\b/gi;

        let coincidencia: RegExpExecArray | null;

        while ((coincidencia = patron.exec(texto)) !== null) {

            const inicio = Math.max(
                0,
                coincidencia.index - 180
            );

            const fin = Math.min(
                texto.length,
                coincidencia.index + 180
            );

            console.log(
                `PROCESO ${item.id}:`,
                texto.substring(inicio, fin)
            );
        }
    });

const gruposDetectados = restantes
    .filter(item => {
        const texto = normalizarNombreEmpresa(
            item.observaciones || ''
        );

        return /\bfueron\s+(?:desestimad[oa]s|rechazad[oa]s)\b/i
            .test(texto);
    })
    .map(item => ({
        id: item.id,
        proceso: item.numeroProceso,
        observaciones: item.observaciones
    }));

console.log(
    'CANDIDATOS A DESESTIMACION GRUPAL:',
    gruposDetectados.length
);

gruposDetectados.forEach(item => {
    console.log(
        `GRUPO ${item.id}:`,
        item.observaciones
    );
});


const diagnosticoGrupos = gruposDetectados.map(item => {

    const grupos = extraerGruposDesestimados(
        item.observaciones
    );

    const resultados = grupos.map(grupo => {

        const textoGrupo = normalizarNombreEmpresa(grupo);

        const empresasIdentificadas: string[] = [];

        empresasPorId.forEach(nombre => {

            const variantes = obtenerVariantesNombreEmpresa(nombre);

            const encontrada = variantes.some(variante => {

                const posicion = textoGrupo.indexOf(variante);

                if (posicion === -1) {
                    return false;
                }

                const anterior = posicion > 0
                    ? textoGrupo.charAt(posicion - 1)
                    : '';

                const posterior = textoGrupo.charAt(
                    posicion + variante.length
                );

                return (
                    (!anterior || !/[a-z0-9]/i.test(anterior)) &&
                    (!posterior || !/[a-z0-9]/i.test(posterior))
                );
            });

            if (encontrada) {
                empresasIdentificadas.push(nombre);
            }
        });

        return {
            id: item.id,
            grupo,
            cantidadEmpresas: empresasIdentificadas.length,
            empresas: empresasIdentificadas.join(' | ')
        };
    });

    return resultados;
});

console.table(
    diagnosticoGrupos.reduce(
        (acumulado, grupos) => acumulado.concat(grupos),
        [] as Array<{
            id: number;
            grupo: string;
            cantidadEmpresas: number;
            empresas: string;
        }>
    )
);

const nombresSuperpuestos: Array<{
    variante: string;
    empresaOrigen: string;
    empresaCoincidente: string;
}> = [];

empresasPorId.forEach((nombreOrigen, idOrigen) => {

    const variantesOrigen =
        obtenerVariantesNombreEmpresa(nombreOrigen);

    empresasPorId.forEach((nombreDestino, idDestino) => {

        if (idOrigen === idDestino) {
            return;
        }

        const nombreNormalizado =
            normalizarNombreEmpresa(nombreDestino);

        variantesOrigen.forEach(variante => {

            const texto = ` ${nombreNormalizado} `;

            if (texto.includes(` ${variante} `)) {
                nombresSuperpuestos.push({
                    variante,
                    empresaOrigen: nombreOrigen,
                    empresaCoincidente: nombreDestino
                });
            }
        });
    });
});

console.log(
    'NOMBRES SUPERPUESTOS:',
    nombresSuperpuestos.length
);

console.table(nombresSuperpuestos);

}, [licitaciones,competidores]);

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
            !periodoSeleccionado ||
            item.anio === Number(periodoSeleccionado)
        
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
        organismoSeleccionado]);
    
    
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
                className={styles.pestanaActiva}
                aria-current="page"
            >
                Explorar
            </button>

            <button
                type="button"
                className={styles.pestana}
                disabled
                title="Vista pendiente de implementación"
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
{/* Filtros */}
        <section className={styles.filtros}>
            <div className={styles.campoBusqueda}>
                <label htmlFor="buscarLicitacion">
                    Buscar licitaciones
                </label>

                <input
                    id="buscarLicitacion"
                    type="search"
                    value={busqueda}
                    onChange={(event) =>
                        setBusqueda(event.currentTarget.value)
                    }
                    placeholder="Organismo, empresa o N.º de proceso..."
                />
            </div>
            <div className= {styles.grillaFiltros}>
                <div className={styles.campoBusqueda}>
                    <label htmlFor="filtroEmpresa">
                        Empresa
                    </label>
                    <select 
                    id="filtroEmpresa"
                    value={empresaSeleccionada}
                    onChange={(e)=> setEmpresaSeleccionada(e.currentTarget.value)}>
                        <option value="">Todas las empresas</option>
                        {[...competidores]
                            .sort((a, b)=>   a.nombre.localeCompare(b.nombre, 'es'))
                            .map((competidor)=> (
                            <option key= {competidor.id} value= {competidor.id}>{competidor.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.campoBusqueda}>
                    <label htmlFor="filtroPeriodo">
                        Período
                    </label>

                    <select
                        id="filtroPeriodo"
                        value={periodoSeleccionado}
                        onChange={(event) =>
                            setPeriodoSeleccionado(event.currentTarget.value)
                        }
                    >
                        <option value="">Todos los años</option>
                        {periodosDisponibles.map(anio => (
                            <option key={anio} value={anio}>
                                {anio}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.campoBusqueda}>
                    <label htmlFor="filtroTipoServicio">
                        Tipo de Servicio
                    </label>

                    <select
                        id="filtroTipoServicio"
                        value={servicioSeleccionado}
                        onChange={(event) =>
                            setServicioSeleccionado(event.currentTarget.value)
                        }
                    >
                        <option value="">Todos los servicios</option>
                        {serviciosDisponibles.map(servicio => (
                            <option key={servicio} value={servicio}>
                                {servicio}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.campoBusqueda}>
                    <label htmlFor="filtroOrganismo">
                        Organismo Contratante
                    </label>

                    <select
                        id="filtroOrganismo"
                        value={organismoSeleccionado}
                        onChange={(event) =>
                            setOrganismoSeleccionado(event.currentTarget.value)
                        }
                    >
                        <option value="">Todos los organismos</option>
                        {organismosDisponibles.map(organismo => (
                            <option key={organismo} value={organismo}>
                                {organismo}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {hayFiltrosActivos && (
                <div className={styles.resumenFiltros}>

                    <span className={styles.resumenFiltrosTitulo}>
                        Filtros Aplicados
                    </span>
                    <span className={styles.resumenFiltrosTexto}>
                        {descripcionFiltros}
                    </span>
                </div>
            )}
           <div className={styles.accionesFiltros}>
             <button
                type="button"
                className={styles.botonLimpiar}
                aria-label="Limpiar todos los filtros"
                onClick={() => {
                    setBusqueda('');
                    setEmpresaSeleccionada('');
                    setPeriodoSeleccionado('');
                    setServicioSeleccionado('');
                    setOrganismoSeleccionado('');
                }}
                title="Restablecer todos los filtros"
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
{/* Grilla de tarjetas  */}
        <section>
                <GrillaIndicadores
                    licitaciones={licitacionesFiltradas}
                    descripcionFiltros= {descripcionFiltros}
                    serieIPC={serieIPC}
                />
        </section>

{/* Tabla */}
        <TablaLicitaciones 
            key = {[
                busqueda,
                empresaSeleccionada,
                periodoSeleccionado,
                servicioSeleccionado,
                organismoSeleccionado
            ].join('|')}
            licitaciones={licitacionesFiltradas}
            competidores={competidores} />
        </>
    )
 }

export default LicitacionesContratos