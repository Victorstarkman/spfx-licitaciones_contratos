import type { IAnalisisIA } from '../modelos/IAnalisis';
import type { IAntecedente } from '../modelos/IAntecedentes';
import type { ICompetidor } from '../modelos/ICompetidor';

// Resultado de la validación
export interface IValidacionAnalisisIA {

    indice: Map<string, IAnalisisIA>;

    noCatalogados: IAnalisisIA[];

    relacionesInvalidas: IAnalisisIA[];

    duplicados: Map<string, IAnalisisIA[]>;

}

// Clave de relación licitación - competidor
export const crearClaveAnalisisIA = (
    licitacionId: number,
    competidorId: number
): string => {

    return `${licitacionId}-${competidorId}`;

};

// Validación e indexación
export const validarAnalisisIA = (
    analisis: IAnalisisIA[],
    licitaciones: IAntecedente[],
    competidores: ICompetidor[]
): IValidacionAnalisisIA => {

    const idsLicitaciones = new Set(
        licitaciones.map(item => item.id)
    );

    const idsCompetidores = new Set(
        competidores.map(item => item.id)
    );

    const grupos = new Map<string, IAnalisisIA[]>();

    const indice = new Map<string, IAnalisisIA>();

    const noCatalogados: IAnalisisIA[] = [];

    const relacionesInvalidas: IAnalisisIA[] = [];

    const duplicados = new Map<string, IAnalisisIA[]>();

    analisis.forEach(item => {

        // Verificar la existencia de la licitación
        if (!idsLicitaciones.has(item.licitacionOrigenId)) {

            relacionesInvalidas.push(item);
            return;

        }

        // Participantes sin vinculación al catálogo
        if (item.competidorId === 0) {

            noCatalogados.push(item);
            return;

        }

        // Verificar la existencia del competidor
        if (!idsCompetidores.has(item.competidorId)) {

            relacionesInvalidas.push(item);
            return;

        }

        const clave = crearClaveAnalisisIA(
            item.licitacionOrigenId,
            item.competidorId
        );

        const grupo = grupos.get(clave) ?? [];

        grupo.push(item);

        grupos.set(clave, grupo);

    });

    // Separar registros únicos y duplicados
    grupos.forEach((registros, clave) => {

        if (registros.length === 1) {

            indice.set(clave, registros[0]);

        } else {

            duplicados.set(clave, registros);

        }

    });

    return {
        indice,
        noCatalogados,
        relacionesInvalidas,
        duplicados
    };

};