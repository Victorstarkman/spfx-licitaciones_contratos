import type { IAntecedente } from '../modelos/IAntecedentes';
import type { IContrato, TSituacionContrato } from '../modelos/IContratos';
import type { TCampoFiltro } from './filtrosCruzados';
import { evaluarEstadoProceso, normalizarEstadoProceso } from './efectividadUtilidades';
import { ICompetidor } from '../modelos/ICompetidor';

//===============================================================
/* Determinamos la situacion del contrato si es vigente o vencido */
//===============================================================
export const determinarSituacionContrato = (
    fechaFin: string
): TSituacionContrato => {

    if (!fechaFin) {
        return 'sin_fecha_confirmada';
    }

    const fin = new Date(fechaFin.substring(0, 10) + 'T00:00:00');

    if (Number.isNaN(fin.getTime())) {
        return 'sin_fecha_confirmada';
    }

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    return fin >= hoy
        ? 'vigente'
        : 'vencido';
};
//===============================================
/* la agrupacion es juntar los ids segun los numeros de 
proceso  IAntecedente[]
Adjudicación	2023	Fin: 2024
Prórroga	2024	Fin: 2025
Prórroga	2025	Fin: 2027
agruparContratos()
IContrato
Fecha de inicio       2023
Fecha de fin           2027
Antecedentes              3
Situación             Vigente
*/
//==================================================
export const agruparContratos = (
    licitaciones: IAntecedente[]
): IContrato[] => {

    const grupos = new Map<string, IAntecedente[]>();

    licitaciones.forEach(item => {

        const numeroProceso = normalizarEstadoProceso(
            item.numeroProceso
        );

        const clave = numeroProceso || `hito-${item.id}`;

        const antecedentes = grupos.get(clave) ?? [];

        antecedentes.push(item);

        grupos.set(clave, antecedentes);

    });

    const contratos: IContrato[] = [];

    grupos.forEach((antecedentes, clave) => {

        // Orden cronológico ascendente
        const ordenados = [...antecedentes].sort(
            (a, b) => a.fecha.localeCompare(b.fecha)
        );

        // Buscar una adjudicación documentada
        const original = ordenados.find(item => {

            const estado = Array.isArray(item.resultadoProceso)
                ? item.resultadoProceso.join(', ')
                : item.resultadoProceso;

            return evaluarEstadoProceso(estado) === 'evaluable'
                && item.adjudicatariosIds.length > 0;

        });

        // No incluir procedimientos sin adjudicación
        if (!original) {
            return;
        }

        // Buscar la última fecha de fin documentada
        const ultimoConFecha = [...ordenados]
            .reverse()
            .find(item => Boolean(item.fechaFin));

        const fechaFin = ultimoConFecha?.fechaFin ?? '';

        // Último proveedor documentado
        const ultimoAdjudicatario = [...ordenados]
            .reverse()
            .find(item => item.adjudicatariosIds.length > 0);

        contratos.push({

            clave,

            numeroProceso: original.numeroProceso,

            organismo: original.organismo,

            tipoServicio: original.tipoServicio,

            adjudicatariosIds:
                ultimoAdjudicatario?.adjudicatariosIds
                ?? original.adjudicatariosIds,

            fechaInicio: original.fecha,

            fechaFin,

            situacion: determinarSituacionContrato(fechaFin),

            antecedenteOriginal: original,

            antecedentes: ordenados

        });

    });

    return contratos;
};
export interface ICriteriosContrato {

    busqueda: string;
    empresa: string;
    periodo: string;
    servicio: string;
    organismo: string;

}
//==================================================
/* viene a resolver filtrar contratos reescribiendo
los filtros de las otras vistas  */
//==================================================
export const filtrarContratos = (
    contratos: IContrato[],
    competidores: ICompetidor[],
    criterios: ICriteriosContrato,
    excluir?: TCampoFiltro
): IContrato[] => {

    const empresasPorId = new Map<number, string>(
        competidores.map(item => [
            item.id,
            item.nombre
        ])
    );

    const texto = normalizarEstadoProceso(
        criterios.busqueda
    );

    return contratos.filter(item => {

        const coincideEmpresa =
            excluir === 'empresa' ||
            !criterios.empresa ||
            item.adjudicatariosIds.indexOf(
                Number(criterios.empresa)
            ) !== -1;

        const coincidePeriodo =
            excluir === 'periodo' ||
            !criterios.periodo ||
            item.antecedenteOriginal.anio ===
                Number(criterios.periodo);

        const coincideServicio =
            excluir === 'servicio' ||
            !criterios.servicio ||
            item.tipoServicio.indexOf(
                criterios.servicio
            ) !== -1;

        const coincideOrganismo =
            excluir === 'organismo' ||
            !criterios.organismo ||
            item.organismo === criterios.organismo;

        const nombresEmpresas = item.adjudicatariosIds
            .map(id => empresasPorId.get(id) ?? '')
            .join(' ');

        const contenido = normalizarEstadoProceso([
            item.organismo,
            item.numeroProceso,
            item.antecedenteOriginal.objeto,
            item.antecedenteOriginal.expediente,
            nombresEmpresas
        ].join(' '));

        return coincideEmpresa &&
            coincidePeriodo &&
            coincideServicio &&
            coincideOrganismo &&
            contenido.includes(texto);

    });
};
export interface IOpcionesContratos {

    empresas: Set<number>;
    servicios: Set<string>;
    organismos: Set<string>;
    periodos: Set<number>;

}
//=======================================================
/*  La función devuelve exactamente la misma estructura que actualmente 
utiliza opcionesHabilitadas en LicitacionesContratos.tsx.*/
//=====================================================
export const obtenerOpcionesContratos = (
    contratos: IContrato[],
    competidores: ICompetidor[],
    criterios: ICriteriosContrato
):IOpcionesContratos => {

    const baseEmpresas = filtrarContratos(
        contratos, competidores, criterios, 'empresa'
    );

    const baseServicios = filtrarContratos(
        contratos, competidores, criterios, 'servicio'
    );

    const baseOrganismos = filtrarContratos(
        contratos, competidores, criterios, 'organismo'
    );

    const basePeriodos = filtrarContratos(
        contratos, competidores, criterios, 'periodo'
    );

    return {

        empresas: new Set<number>(
            baseEmpresas.reduce<number[]>((ids, item) => {
                return ids.concat(item.adjudicatariosIds);
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
            basePeriodos.map(item =>
                item.antecedenteOriginal.anio
            )
        )

    };
};