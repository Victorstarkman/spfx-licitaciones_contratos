import type { IAntecedente } from '../modelos/IAntecedentes';
export type TResultadoEfectividad =
    | 'ganada'
    | 'perdida'
    | 'desestimada'
    | 'otro'
    | 'no_evaluable'
    | 'revisar';

export interface IResultadoEfectividad {
        ganadas: number;
        perdidas: number;
        desestimadas: number;
        otros: number;
        totalEvaluados: number;
        tasaEfectividad: number;
        noEvaluables: number;
        pendientesRevision: number;
    }
export interface IEvidenciaObservacion {
        tipo: 'orden_compra' | 'adjudicacion' |
              'desestimacion' | 'documentacion';
        texto: string;
    }
export type TEvaluacionProceso =
    | 'evaluable'
    | 'sin_adjudicacion'
    | 'continuidad'
    | 'revisar';

export interface IAnalisisEmpresaProceso {
        procesoId:number;
        numeroProceso:string;
        empresaId:number;
        participo:boolean;
        fueAdjudicatario:boolean;
        resultadoProceso:string;
        evaluacionProceso:TEvaluacionProceso;
        evidencias: IEvidenciaObservacion[];
        fuente: string;
        participacionNoRegistrada: boolean;
        participacionConfirmada: boolean;
        hayAdjudicacion: boolean;
    }
export interface IEmpresaDesestimada {
    empresaId: number;
    nombre: string;
    evidencia: string;
}
    //======================================================
/* clasificarResultadoDienst() es una función normalizadora de términos.
Su responsabilidad es tomar los valores originales de SharePoint y convertirlos
 en categorías uniformes que podamos utilizar en los cálculos.*/
//=======================================================
export const clasificarResultadoDienst = (
    item: IAntecedente
): TResultadoEfectividad => {

    const resultado = String(
        item.resultadoDienst || ''
    ).trim().toLowerCase();

    if (resultado === 'ganó') {
        return 'ganada';
    }

    if (resultado === 'perdió') {
        return 'perdida';
    }

    if (resultado === 'desestimada') {
        return 'desestimada';
    }

    return 'otro';
};
//=======================================
/* nomalizamos los estados */
//=====================================
export const normalizarEstadoProceso = (
    estado: string | undefined
): string => {

    return (estado || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};

//================================================
/* funcion evaluarEstadoProceso  entrada estado y la 
salida es una evaluacionProceso se ve que paso con la
licitacion y se la categoriza normalizada 
Valor de SharePoint	Devuelve
Adjudicado	        evaluable
Fracasado	        sin_adjudicacion
Ampliacion	        continuidad
Proroga	            revisar*/
//===============================================


export const evaluarEstadoProceso = (
    estado: string | undefined
): TEvaluacionProceso => {

    const valor = (estado ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    switch (valor) {

        case 'adjudicado':
        case 'orden de compra':
            return 'evaluable';

        case 'fracasado':
        case 'desierto':
        case 'cancelado':
            return 'sin_adjudicacion';

        case 'ampliacion':
        case 'continuidad contractual':
        case 'readecuacion':
        case 'recomposicion':
            return 'continuidad';

        case 'proroga':
        case 'prorroga':
        case 'renovacion':
            return 'revisar';

        default:
            return 'revisar';
    }
};
//================================================
/* Analisis y uso del campo observaciones */
//===============================================

export const extraerEvidenciasObservaciones = (
    observaciones: string | undefined
): IEvidenciaObservacion[] => {

    if (!observaciones) {
        return [];
    }

    const evidencias: IEvidenciaObservacion[] = [];

    const patrones = [
      {
            tipo: 'orden_compra',
            regex: /\borden de compra\b|órdenes de compra\b|\bOC\b/gi
        },
        {
            tipo: 'adjudicacion',
            regex: /\b(?:adjudicad[oa]s?|adjudicatari[oa]s?|adjudicaci[oó]n(?:es)?)\b/gi
        },
           
        {
            tipo: 'desestimacion',
            regex: /\b(?:desestimad[oa]s?|desestimaci[oó]n(?:es)?|rechazad[oa]s?|rechazaron|rechazo|inadmisib(?:le|les|ilidad)|excluid[oa]s?)\b/gi
        },

        {
            tipo: 'documentacion',
            regex: /\b(?:dictamen(?:es)?|resoluci[oó]n(?:es)?)\b/gi
        }
    ] as const;

    patrones.forEach((patron) => {

        const regex = patron.regex;

        regex.lastIndex = 0;

        let coincidencia: RegExpExecArray | null;

        while (
            (coincidencia = regex.exec(observaciones)) !== null
        ) {

            const posicion = coincidencia.index;

            const inicio = Math.max(
                0,
                posicion - 80
            );

            const fin = Math.min(
                observaciones.length,
                posicion + coincidencia[0].length + 100
            );

            evidencias.push({
                tipo: patron.tipo,
                texto: observaciones
                    .substring(inicio, fin)
                    .trim()
            });
        }
    });

    return evidencias;
};
//======================================================
/* funcion analizarEmpresaProceso la entrada es un elemento
de la matriz de antecedentes y el id de la empresa a analizar
la salida va a ser el analisisEmpresaProceso extraemos las evidencias
cuando se evaluo el estadodelProceso  */
//======================================================
export const analizarEmpresaProceso = (
    item: IAntecedente,
    empresaId: number
): IAnalisisEmpresaProceso => {

    const participo =
        item.empresasParticipantesIds.indexOf(empresaId) !== -1;

    const fueAdjudicatario =
        item.adjudicatariosIds.indexOf(empresaId) !== -1;
        const participacionNoRegistrada =
        !participo && !fueAdjudicatario &&
        item.dienstParticipa === true &&
        empresaId === 25;
    const hayAdjudicacion =
        item.adjudicatariosIds.length > 0;
    // SharePoint puede devolver un arreglo de opciones.
    const valorResultado: unknown = item.resultadoProceso;

    const resultadoProceso = Array.isArray(valorResultado)
        ? valorResultado.join(', ')
        : String(valorResultado || '');

    const evaluacionProceso =
        evaluarEstadoProceso(resultadoProceso);

    const evidencias = extraerEvidenciasObservaciones(
        item.observaciones);
    
    const participacionConfirmada =
        participo ||
        fueAdjudicatario ||
        participacionNoRegistrada;
    

    return {
        procesoId: item.id,
        numeroProceso: item.numeroProceso,
        empresaId,
        participo,
        fueAdjudicatario,
        resultadoProceso,
        evaluacionProceso,
        evidencias,
        fuente: item.fuente,
        participacionNoRegistrada,
        participacionConfirmada,
        hayAdjudicacion,
    };
};
export const clasificarResultadoCompetitivo = (
    analisis: IAnalisisEmpresaProceso,
    resultadoEmpresa?: string
): TResultadoEfectividad => {

    // Primero verificamos el tipo de procedimiento.
    if (
        analisis.evaluacionProceso === 'continuidad' ||
        analisis.evaluacionProceso === 'sin_adjudicacion'
    ) {
        return 'no_evaluable';
    }

    if (analisis.evaluacionProceso === 'revisar') {
        return 'revisar';
    }

    // Normalizamos el resultado particular, si existe.
    const resultado = (resultadoEmpresa || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    // Una desestimación específica tiene prioridad.
    if (
        resultado === 'desestimada' ||
        resultado === 'desestimado'
    ) {
        return 'desestimada';
    }

    if (!analisis.participacionConfirmada) {
        return 'revisar';
    }

    if (analisis.fueAdjudicatario) {
        return 'ganada';
    }

    // Una pérdida requiere una adjudicación confirmada
    // a otra empresa.
    if (
        analisis.evaluacionProceso === 'evaluable' &&
        analisis.participacionConfirmada &&
        !analisis.fueAdjudicatario &&
        analisis.hayAdjudicacion
    ) {
        return 'perdida';
    }

    return 'revisar';
};
//===============================================
/* Categoría	Significado
Ganadas	DIENST obtuvo la adjudicación
Perdidas	DIENST participó, pero no ganó
Desestimadas	La oferta de DIENST fue desestimada
Otros	Resultados todavía no clasificados

Para comenzar, la tasa será:
\[
\text{Efectividad} =
\frac{\text{Ganadas}}{\text{Ganadas + Perdidas + Desestimadas}}\times100
\]*/ 
//==================================================

export const calcularEfectividad = (
    licitaciones: IAntecedente[],
    empresaId: number,
    obtenerResultadoEmpresa?: (item: IAntecedente) => string | undefined
): IResultadoEfectividad => {

    let ganadas = 0;
    let perdidas = 0;
    let desestimadas = 0;
    let otros = 0;
    let noEvaluables = 0;
    let pendientesRevision = 0;

    licitaciones.forEach((item) => {

        const analisis = analizarEmpresaProceso(
            item,
            empresaId
        );

        if (!analisis.participacionConfirmada) {
            return;
        }

        const resultadoEmpresa = obtenerResultadoEmpresa
            ? obtenerResultadoEmpresa(item)
            : undefined;

        const resultado = clasificarResultadoCompetitivo(
            analisis,
            resultadoEmpresa
        );

        switch (resultado) {

            case 'ganada':
                ganadas++;
                break;

            case 'perdida':
                perdidas++;
                break;

            case 'desestimada':
                desestimadas++;
                break;

           case 'no_evaluable':
                noEvaluables++;
                otros++;
                break;

            case 'revisar':
            case 'otro':
                pendientesRevision++;
                otros++;
                break;
                    }
    });

    const totalEvaluados =
        ganadas + perdidas + desestimadas;

    const tasaEfectividad = totalEvaluados > 0
        ? (ganadas / totalEvaluados) * 100
        : 0;

            return {
                ganadas,
                perdidas,
                desestimadas,
                otros,
                noEvaluables,
                pendientesRevision,
                totalEvaluados,
                tasaEfectividad
    };
};
//======================================================
/* Normalizar Nombres de empresa: Nos permite comparar nombres escritos de distintas maneras:
Nombre original	Normalizado
DIENST CONSULTING S.A.	dienst consulting s a
Dienst Consulting SA	dienst consulting sa
CITY MEDICAL SERVICE	city medical service
Río Varadero	rio varadero*/
//=========================================================
export const normalizarNombreEmpresa = (
    nombre: string
): string => {
    return nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[.,]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};
//===========================================================
/* en las observaciones debemos extraer el nombre societario que
no siempre aparece igual */
//=========================================================

export const obtenerVariantesNombreEmpresa = (
    nombre: string
): string[] => {

    const variantes = new Set<string>();

    // Separar denominaciones alternativas del catálogo.
    const partes = nombre.split(/\s+[-–—]\s+|\s*\/\s*/);

    partes.forEach(parte => {

        const normalizado = normalizarNombreEmpresa(parte);

        if (!normalizado) {
            return;
        }

        // Conservar denominación normalizada.
        variantes.add(normalizado);

        // Quitar solamente formas societarias al final.
        const sinRazonSocial = normalizado
            .replace(
                /\s+(?:s a u|s a s|s r l|s a|srl|sa|sau|sas)$/,
                ''
            )
            .trim();

        if (sinRazonSocial.length >= 5) {
            variantes.add(sinRazonSocial);
        }
    });

    return Array.from(variantes);
};
//======================================================
/* Problema de obtener variantes cuando en observaciones se desestima
grupalmente Busca las expresiones grupales y extrae el texto anterior al resultado, respetando los límites de la oración.*/
//======================================================

export const extraerGruposDesestimados = (
    observaciones: string | undefined
): string[] => {

    if (!observaciones) {
        return [];
    }

    const grupos: string[] = [];

    const patron =
        /(?:^|[.;!?])\s*([^.;!?]{1,220}?)\s+fueron\s+(?:desestimad[oa]s|rechazad[oa]s)\b/gi;

    let coincidencia: RegExpExecArray | null;

    while (
        (coincidencia = patron.exec(observaciones)) !== null
    ) {
        const grupo = coincidencia[1].trim();

        if (grupo) {
            grupos.push(grupo);
        }
    }

    return grupos;
};

//=======================================
/* Problema relacion de desestimacion de otras empresas
usando las observaciones es decir entrada nombre de la empresa y
observaciones */
//================================================
export const detectarEmpresasDesestimadas = (
    observaciones: string | undefined,
    empresasPorId: Map<number, string>
): IEmpresaDesestimada[] => {

    if (!observaciones) {
        return [];
    }

    const texto = normalizarNombreEmpresa(observaciones);

    const resultados: IEmpresaDesestimada[] = [];

    
        empresasPorId.forEach((nombre, empresaId) => {

            const variantes = obtenerVariantesNombreEmpresa(nombre);

           
           
            const patronResultado =
                /^\s*(?:(?:fue|resulto|quedo)\s+(?:declarad[oa]\s+)?|:\s*|(?:oferto|cotizo)\b[^.;]{0,65}?\b(?:y|pero)\s+fue\s+|participo\b[^.;]{0,65}?\bpero\s+su\s+oferta\s+fue\s+|su\s+oferta\s+fue\s+)?(?:desestimad[oa]s?|rechazad[oa]s?|inadmisib(?:le|les))\b/i;

            let evidenciaEncontrada = '';

            variantes.forEach(variante => {

                if (evidenciaEncontrada) {
                    return;
                }

                let posicion = texto.indexOf(variante);

                while (posicion !== -1) {

                    const anterior = posicion > 0
                        ? texto.charAt(posicion - 1)
                        : '';

                    const posterior = texto.charAt(
                        posicion + variante.length
                    );

                    // Evitar coincidencias dentro de otras palabras.
                    const limiteInicial =
                        !anterior || !/[a-z0-9]/i.test(anterior);

                    const limiteFinal =
                        !posterior || !/[a-z0-9]/i.test(posterior);

                    if (limiteInicial && limiteFinal) {

                        const textoPosterior = texto.substring(
                            posicion + variante.length,
                            posicion + variante.length + 80
                        );

                        const coincidencia =
                            patronResultado.exec(textoPosterior);

                        if (coincidencia) {
                            evidenciaEncontrada =
                                variante + coincidencia[0];
                            break;
                        }
                    }

                    posicion = texto.indexOf(
                        variante,
                        posicion + variante.length
                    );
                }
            });

            if (evidenciaEncontrada) {
                resultados.push({
                    empresaId,
                    nombre,
                    evidencia: evidenciaEncontrada
                });
            }
        });


            return resultados;
    };