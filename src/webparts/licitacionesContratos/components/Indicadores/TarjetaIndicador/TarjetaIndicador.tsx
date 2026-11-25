import * as React from 'react';
import type { ITarjetaIndicadorProps } from './ITarjetaIndicadorProps';
import styles from './TarjetaIndicador.module.scss'

const tarjetaIndicador= (props: ITarjetaIndicadorProps): React.ReactElement => {
    return (
        <div className={styles.tarjeta}>
            <span className={styles.titulo}>
                {props.titulo}
            </span>
            <strong className={styles.valor}>
                {props.valor}
            </strong>
            <small className={styles.descripcion}>
                {props.descripcion}
            </small>

        </div>
    )
}
export default tarjetaIndicador