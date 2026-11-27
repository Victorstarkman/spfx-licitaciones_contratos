import * as React from 'react';

import { createPortal } from 'react-dom';

import type {
    IModalMisSeguimientosProps
} from './IModalMisSeguimientosProps';

import {
    validarEmailCorporativo
} from '../../../../utilidades/seguimientoUtilidades';

import estilosModal
    from '../../../ModalDetalleLicitacion/ModalDetalleLicitacion.module.scss';

import estilosSeguimiento
    from '../ModalSeguimiento/ModalSeguimiento.module.scss';
import type {
    ISeguimiento
} from '../../../../modelos/ISeguimiento';

import {
    consultarSeguimientos,
    desactivarSeguimiento
} from '../../../../servicios/seguimientoServicio';
import {
    formatearFecha
} from '../../../../utilidades/licitacionesUtilidades';

import styles from './ModalMisSeguimientos.module.scss';

const ModalMisSeguimientos = (
    props: IModalMisSeguimientosProps
): React.ReactElement => {
    //estados
    const [email, setEmail] = React.useState<string>('');
    
    const [seguimientos, setSeguimientos] = React.useState<ISeguimiento[]>([]);

    const [consultando, setConsultando] = React.useState<boolean>(false);

    const [consultaRealizada, setConsultaRealizada] = React.useState<boolean>(false);

    const [error, setError] = React.useState<string>('');

    const [desactivandoId, setDesactivandoId] = React.useState<number | undefined>(undefined);

    const [mensaje, setMensaje] = React.useState<string>('');
    
    const [cerrando, setCerrando] = React.useState<boolean>(false);
    //effect

    //funciones 
    const emailValido = validarEmailCorporativo(email);

    const consultar = async (): Promise<void> => {

    if (!emailValido || consultando) {
        return;
    }
            setConsultando(true);
            setError('');
            setMensaje('');
            setConsultaRealizada(false);
            setSeguimientos([]);

            try {

                const registros = await consultarSeguimientos(
                    props.spHttpClient,
                    email
                );

                setSeguimientos(registros);
                setConsultaRealizada(true);

            } catch (error) {

                console.error(error);

                setError(
                    'No se pudieron consultar los seguimientos.'
                );

            } finally {

                setConsultando(false);

            }

        };

        const desactivar = async (
            item: ISeguimiento
        ): Promise<void> => {

            if (desactivandoId !== undefined || consultando) {
                return;
            }

            const confirmado = window.confirm(
                `¿Desea desactivar el seguimiento del proceso ` +
                `${item.NumeroProceso}?`
            );

            if (!confirmado) {
                return;
            }

            setDesactivandoId(item.Id);
            setError('');
            setMensaje('');

            try {

                await desactivarSeguimiento(
                    props.spHttpClient,
                    item.Id
                );

                setSeguimientos(anteriores =>
                    anteriores.filter(
                        registro => registro.Id !== item.Id
                    )
                );

                setMensaje(
                    `Seguimiento ${item.NumeroProceso} ` +
                    `desactivado correctamente.`
                );

            } catch (error) {

                console.error(error);

                setError(
                    'No se pudo desactivar el seguimiento.'
                );

            } finally {

                setDesactivandoId(undefined);

            }

        };
        const cerrarModal = (): void => {

                setCerrando(true);

            };
        const cambiarEmail = (nuevoEmail: string): void => {

                setEmail(nuevoEmail);

                setSeguimientos([]);

                setConsultaRealizada(false);

                setError('');

                setMensaje('');

            };

//JSX
    return createPortal(

       <div className={`${estilosModal.fondoModal} ${cerrando
                ? estilosSeguimiento.fondoCerrando
                : estilosSeguimiento.fondoAnimado
            }`}>

                <div
                    className={`${estilosModal.ventanaModal} ${
                        cerrando
                            ? estilosSeguimiento.ventanaCerrando
                            : estilosSeguimiento.ventanaAnimada
                    }`}
                    onAnimationEnd={(event) => {
                        if (cerrando &&
                            event.target === event.currentTarget) {

                            props.onCerrar();

                        }
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mis seguimientos"
                >

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
                                <rect x="5" y="4" width="14"
                                    height="17" rx="2" />
                                <path d="M9 4V2h6v2" />
                                <path d="m8 10 1 1 2-2" />
                                <path d="M13 10h3" />
                                <path d="m8 16 1 1 2-2" />
                                <path d="M13 16h3" />
                            </svg>

                            <h2>Mis seguimientos</h2>

                        </div>

                        <span>
                            Administración de seguimientos activos
                        </span>

                    </div>

                    <button
                        type="button"
                        onClick={cerrarModal}
                        aria-label="Cerrar mis seguimientos"
                    >
                        X
                    </button>

                </header>

                <section className={estilosSeguimiento.seccion}>

                    <h3>Consultar seguimientos</h3>

                    <div className={
                        estilosSeguimiento.campoFormulario
                    }>

                        <label htmlFor="emailMisSeguimientos">
                            Correo electrónico
                        </label>

                        <input
                            id="emailMisSeguimientos"
                            type="email"
                            placeholder="nombre@dienst.com.ar"
                            value={email}
                            disabled={consultando ||
                                         desactivandoId !== undefined}
                            onChange={event =>
                                    cambiarEmail(event.target.value)
                                }
                        />

                        {email.length > 0 && !emailValido && (

                            <span className={
                                estilosSeguimiento.errorCampo
                            }>
                                Solo se permiten correos
                                del dominio @dienst.com.ar.
                            </span>

                        )}

                    </div>
                    <button
                        type="button"
                        className={estilosSeguimiento.botonGuardar}
                        disabled={
                            !emailValido ||
                            consultando ||
                            desactivandoId !== undefined
                            }
                        onClick={() => {
                            consultar().catch(error => {
                                console.error(error);
                            });
                        }}
                    >
                        {consultando
                            ? 'Consultando...'
                            : 'Consultar seguimientos'}
                    </button>

                </section>
                {error && (
                <div className={`
                    ${estilosSeguimiento.resultadoSeguimiento}
                    ${estilosSeguimiento.resultadoError}
                    ${styles.mensajeResultado}
                `}>
                    {error}
                </div>

            )}
            {mensaje && (
                    <div
                        role="status"
                        className={`
                            ${estilosSeguimiento.resultadoSeguimiento}
                            ${estilosSeguimiento.resultadoExito}
                            ${styles.mensajeResultado}
                        `}
                    >

                        <svg
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
                            <circle cx="12" cy="12" r="9" />
                            <path d="m8 12 3 3 5-6" />
                        </svg>

                        <span>{mensaje}</span>

                    </div>

                )}
            {consultaRealizada && (

                <section className={estilosSeguimiento.seccion}>

                    <h3>
                        Seguimientos activos ({seguimientos.length})
                    </h3>

                    {seguimientos.length === 0 && (

                        <p className={estilosSeguimiento.sinContratos}>
                            No se encontraron seguimientos activos.
                        </p>

                    )}

                    <div className={estilosSeguimiento.listaContratos}>

                        {seguimientos.map(item => (

                            <article
                                key={item.Id}
                                className={estilosSeguimiento.contrato}
                            >

                                <div className={
                                    estilosSeguimiento.datosContrato
                                }>

                                    <strong>{item.Organismo}</strong>

                                    <span>{item.NumeroProceso}</span>

                                    <span>{item.Servicio}</span>

                                    <span>Frecuencia: {item.Frecuencia}</span>

                                </div>
                                <div className={styles.fechasSeguimiento}>

                                    <div className={styles.filaFecha}>
                                        <span>Próximo aviso</span>
                                        <strong>
                                            {item.ProximoAviso
                                                ? formatearFecha(item.ProximoAviso)
                                                : 'No programado'}
                                        </strong>
                                    </div>

                                    <div className={styles.filaFecha}>
                                        <span>Último aviso</span>
                                        <strong>
                                            {item.FechaUltimoAviso
                                                ? formatearFecha(item.FechaUltimoAviso)
                                                : 'Sin avisos enviados'}
                                        </strong>
                                    </div>

                                </div>

                                <div className={estilosModal.fechaVencimiento}>

                                    <span>Finalización</span>

                                    <strong>
                                        {formatearFecha(item.FechaFin)}
                                    </strong>

                                </div>

                                <button
                                    type="button"
                                    className={styles.botonDesactivar}
                                    disabled={consultando || desactivandoId !== undefined}
                                    onClick={() => {
                                        desactivar(item).catch(error => {
                                            console.error(error);
                                        });
                                    }}
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
                                        <path d="M3 3l18 18" />
                                        <path d="M18 8a6 6 0 0 0-9-5" />
                                        <path d="M6 8c0 7-3 7-3 9h14" />
                                        <path d="M10 21h4" />
                                    </svg>
                                    {desactivandoId === item.Id
                                        ? 'Desactivando...'
                                        : 'Desactivar seguimiento'}

                                </button>

                            </article>

                        ))}

                    </div>

                </section>

            )}            
            </div>

        </div>,

        document.body

    );

};

export default ModalMisSeguimientos;