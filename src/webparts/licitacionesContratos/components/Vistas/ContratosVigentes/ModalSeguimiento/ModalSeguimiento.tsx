import * as React from 'react';

import { createPortal } from 'react-dom';

import type {
    IModalSeguimientoProps
} from './IModalSeguimientoProps';

import {
    formatearFecha,
    obtenerNombresEmpresas
} from '../../../../utilidades/licitacionesUtilidades';

import estilosModal
    from '../../../ModalDetalleLicitacion/ModalDetalleLicitacion.module.scss';

import styles from './ModalSeguimiento.module.scss';

import type {
    TFrecuenciaSeguimiento
} from '../../../../modelos/ISeguimiento';

import {
    validarEmailCorporativo,
    construirSeguimiento,
    existeSeguimientoActivo
} from '../../../../utilidades/seguimientoUtilidades';

import {
    consultarSeguimientos,
    crearSeguimiento
} from '../../../../servicios/seguimientoServicio';

const ModalSeguimiento = (
    props: IModalSeguimientoProps
): React.ReactElement => {
    //estados
    const [cerrando, setCerrando] = React.useState(false);
    const [email, setEmail] = React.useState<string>('');
    const [frecuencia, setFrecuencia] =React.useState<TFrecuenciaSeguimiento>('Mensual');
    const [resultado, setResultado] = React.useState<{tipo:'procesando' | 'exito' | 'error', mensaje:string} | undefined>(undefined);

    //efectos
    React.useEffect(() => {

        if (props.contratos.length === 0) {
            setCerrando(true);
        }

    }, [props.contratos.length]);

    //funciones
const emailValido = validarEmailCorporativo(email)
    

const puedeGuardar =
    emailValido &&
    props.contratos.length > 0 &&
    !cerrando;
const cerrarModal = (): void => {

    setCerrando(true);

};
    const empresasPorId = React.useMemo(() => {

        return new Map<number, string>(
            props.competidores.map(empresa => [
                empresa.id,
                empresa.nombre
            ])
        );

    }, [props.competidores]);
    //========================================================
    const guardarSeguimiento = async (): Promise<void> => {

    if (!puedeGuardar) {
        return;
    }

    setResultado({
        tipo: 'procesando',
        mensaje: 'Registrando seguimientos en SharePoint...'
    });

    let registrados = 0;
    let duplicados = 0;

    try {

        const seguimientosExistentes =
            await consultarSeguimientos(
                props.spHttpClient,
                email
            );

        for (const contrato of props.contratos) {

            if (existeSeguimientoActivo(
                seguimientosExistentes,
                contrato.numeroProceso
            )) {

                duplicados++;
                continue;

            }

            const nuevoSeguimiento =
                construirSeguimiento(
                    contrato,
                    email,
                    frecuencia
                );

            const seguimientoCreado =
                await crearSeguimiento(
                    props.spHttpClient,
                    nuevoSeguimiento
                );

            seguimientosExistentes.push(seguimientoCreado);

            registrados++;

        }

        setResultado({
            tipo: 'exito',
            mensaje:
                `Seguimientos registrados: ${registrados}. ` +
                `Seguimientos ya existentes: ${duplicados}.`
        });

    } catch (error) {

        console.error(error);

        setResultado({
            tipo: 'error',
            mensaje:
                `Error al registrar los seguimientos. ` +
                `Registros guardados: ${registrados}.`
        });

    }

};
//JSX
    return createPortal(

        <div className={`${estilosModal.fondoModal} ${
                cerrando
                    ? styles.fondoCerrando
                    : styles.fondoAnimado
            }`}>

            <div
                className={`${estilosModal.ventanaModal} ${
                    cerrando
                        ? styles.ventanaCerrando
                        : styles.ventanaAnimada
                }`}
                onAnimationEnd={(event) => {
                    if (cerrando && event.target === event.currentTarget) {
                        props.onCerrar();
                    }
                }}
                role="dialog"
                aria-modal="true"
                aria-label="Seguimiento de contratos"
            >

                {/* Encabezado */}

                <header className={estilosModal.encabezado}>

                    <div className={estilosModal.tituloLicitacion}>

                        <div className={estilosModal.tituloConIcono}>

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
                                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                                <path d="M10 21h4" />
                            </svg>

                            <h2>Seguimiento de contratos</h2>

                        </div>

                        <span>
                            Administración de avisos de vencimiento
                        </span>

                    </div>

                    <button
                        type="button"
                        onClick={cerrarModal}
                        aria-label="Cerrar seguimiento"
                        title="Cerrar seguimiento"
                    >
                        X
                    </button>

                </header>

                {/* Contratos seleccionados */}

                <section className={styles.seccion}>

                    <h3>
                        Contratos seleccionados ({props.contratos.length})
                    </h3>

                    {props.contratos.length === 0 && (

                        <p className={styles.sinContratos}>
                            No hay contratos seleccionados.
                            Marque los contratos que desea seguir
                            desde la tabla.
                        </p>

                    )}

                    <div className={styles.listaContratos}>

                        {props.contratos.map(contrato => (

                            <article
                                key={contrato.clave}
                                className={styles.contrato}
                            >

                                <div className={styles.filaContrato}>

                                    <div className={styles.datosContrato}>

                                        <strong>
                                            {contrato.organismo}
                                        </strong>

                                        <span>
                                            {contrato.numeroProceso}
                                        </span>

                                        <span>
                                            {obtenerNombresEmpresas(
                                                contrato.adjudicatariosIds,
                                                empresasPorId
                                            ).join(' · ') || 'No informado'}
                                        </span>

                                        <span>
                                            {contrato.tipoServicio.join(' · ')}
                                        </span>

                                    </div>

                                    <button
                                        type="button"
                                        className={styles.botonQuitar}
                                        aria-label={
                                            `Quitar ${contrato.numeroProceso}`
                                        }
                                        title="Quitar del seguimiento"
                                        onClick={() =>
                                            props.onQuitarContrato(
                                                contrato.clave
                                            )
                                        }
                                    >

                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <path d="M3 6h18" />
                                            <path d="M8 6V4h8v2" />
                                            <path d="M5 6l1 14h12l1-14" />
                                            <path d="M10 10v6" />
                                            <path d="M14 10v6" />
                                        </svg>

                                    </button>

                                </div>

                                <div className={estilosModal.fechaVencimiento}>

                                    <span>Finalización</span>

                                    <strong>
                                        {formatearFecha(contrato.fechaFin)}
                                    </strong>

                                </div>

                            </article>

                        ))}

                    </div>

                </section>
                <section className={styles.seccion}>
                    <h3>Configuración del seguimiento</h3>

                    <div className={styles.campoFormulario}>

                        <label htmlFor="emailSeguimiento">
                            Correo electrónico destinatario
                        </label>

                        <input
                            id="emailSeguimiento"
                            type="email"
                            placeholder="nombre@dienst.com.ar"
                            value={email}
                            onChange={event =>
                                setEmail(event.target.value)
                            }
                        />

                        {email.length > 0 && !emailValido && (

                            <span className={styles.errorCampo}>
                                 Solo se permiten correos corporativos del dominio @dienst.com.ar.
                            </span>

                        )}

                    </div>

                    <div className={styles.campoFormulario}>

                        <label htmlFor="frecuenciaSeguimiento">
                            Frecuencia de notificación
                        </label>

                        <select
                            id="frecuenciaSeguimiento"
                            value={frecuencia}
                            onChange={event =>
                                setFrecuencia(
                                    event.target.value as TFrecuenciaSeguimiento
                                )
                            }
                        >
                            <option value="Mensual">Mensual</option>

                            <option value="Semanal">Semanal</option>


                        </select>

                    </div>

                    <div className={styles.avisoSeguimiento}>

                        La configuración contempla un aviso periódico
                        y un único aviso al vencimiento del contrato.

                    </div>

                    <button
                        type="button"
                        className={styles.botonGuardar}
                        disabled={!puedeGuardar ||resultado?.tipo === 'procesando'}
                        onClick={() => { guardarSeguimiento().catch(error => {
                                                console.error(error);
                                                        });
                                        }}
                    >
                        Guardar seguimiento
                    </button>
                    {resultado && (
                        <div
                            role="status"
                            aria-live="polite"
                            className={`${styles.resultadoSeguimiento} ${
                                resultado.tipo === 'exito'
                                    ? styles.resultadoExito
                                    : resultado.tipo === 'error'
                                        ? styles.resultadoError
                                        : styles.resultadoProcesando
                            }`}
                        >

                           <svg
                            className={styles.iconoResultado}
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
            {resultado.tipo === 'exito' ? (

                <>
                    <circle cx="12" cy="12" r="9" />
                    <path d="m8 12 3 3 5-6" />
                </>

            ) : resultado.tipo === 'error' ? (

                <>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v6" />
                    <path d="M12 16h.01" />
                </>

            ) : (

                <path d="M21 12a9 9 0 1 1-9-9" />

            )}

        </svg>

        <span>{resultado.mensaje}</span>

                                </div>

                            )}
                        </section>

                    </div>

                </div>,

                document.body

            );

        };

export default ModalSeguimiento;

