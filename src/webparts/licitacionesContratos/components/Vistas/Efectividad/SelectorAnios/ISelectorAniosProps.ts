export interface ISelectorAniosProps {
    aniosDisponibles: number[];
    aniosSeleccionados: number[];
    onCambiarAnios: (anios: number[]) => void;

}