import { capitalize } from './strings';

export enum EDateType {
    Short = 0,
    Long = 1
}

/**
 * Función que devuelve una fecha con formato de texto.
 *
 * @export
 * @param {Date} date Fecha a convertir.
 * @param {EDateType} [type=EDateType.Long] Tipo de texto a devolver (completo o corto).
 * @returns {string} La fecha en texto.
 */
export function date2String(date: Date, type: EDateType = EDateType.Long): string {
    // if(type === 1) {
    let today: Date = date; // new Date();
    let year: number = today.getFullYear();
    let month: number | string = today.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    let day: number | string = today.getDate();
    day = day < 10 ? `0${day}` : day;
    let hour: number | string = today.getHours();
    hour = hour < 10 ? `0${hour}` : hour;
    let minute: number | string = today.getMinutes();
    minute = minute < 10 ? `0${minute}` : minute;
    let seconds: number | string = today.getSeconds();
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    // YYYY-MM-DDThh:mm:ss
    if(type === EDateType.Long) {
        return `${year}-${month}-${day}T${hour}:${minute}:${seconds}`;
    } else {
        return `${year}-${month}-${day}`;
    }
    // }
}

/**
 * Función que devuelve una fecha con formato de texto dado.
 * Notas:
 * Para las partes de la fecha se utilizan MAYÚSCULAS y para el tiempo minúsculas.
 * Año - YYYY para el año completo ó YY para los últimos 2 dígitos.
 * Mes - MMM para el mes en letra y MM para el mes en número.
 *
 * @export
 * @param {Date} date Fecha a convertir.
 * @param {string} [format='YYYY-MM-DDThh:mm:ss'] Formato a utilizar para la conversión.
 * @returns {string} La fecha en texto
 */
export function date2StringFormat(date: Date, format: string = 'YYYY-MM-DDThh:mm:ss'): string {
    let today: Date = date; // new Date();
    let year: number = today.getFullYear();
    let month: number | string = today.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    let day: number | string = today.getDate();
    day = day < 10 ? `0${day}` : day;
    let hour: number | string = today.getHours();
    hour = hour < 10 ? `0${hour}` : hour;
    let minute: number | string = today.getMinutes();
    minute = minute < 10 ? `0${minute}` : minute;
    let seconds: number | string = today.getSeconds();
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    // Año.
    let result: string = format;
    result = result.replace('YYYY', year.toString());
    result = result.replace('YY', year.toString().slice(2,4));
    // Mes.
    result = result.replace('MMM', number2Month(parseInt(month.toString()), true));
    result = result.replace('MM', month.toString());
    // Día.
    result = result.replace('DD', day.toString());
    // Hora.
    result = result.replace('hh', hour.toString());
    // Minutos.
    result = result.replace('mm', minute.toString());
    // Segundos.
    result = result.replace('ss', seconds.toString());
    // Resultado.
    return result;
}

/**
 * Función que devuelve el nombre del mes correspondiente a un número.
 *
 * @export
 * @param {number} month Número del mes del que se busca el nombre.
 * @param {boolean} [capitalized=true] Bandera que indica si se desea el texto capitalizado.
 * @returns {string} Nombre del mes.
 */
export function number2Month(month: number, capitalized: boolean =  true): string {
    let monthName: string = '';
    switch(month) {
        case 1:
            monthName = 'enero';
            break;
        case 2:
            monthName = 'febrero';
            break;
        case 3:
            monthName = 'marzo';
            break;
        case 4:
            monthName = 'abril';
            break;
        case 5:
            monthName = 'mayo';
            break;
        case 6:
            monthName = 'junio';
            break;
        case 7:
            monthName = 'julio';
            break;
        case 8:
            monthName = 'agosto';
            break;
        case 9:
            monthName = 'septiembre';
            break;
        case 10:
            monthName = 'octubre';
            break;
        case 11:
            monthName = 'noviembre';
            break;
        case 12:
            monthName = 'diciembre';
            break;
    }
    if(capitalized) monthName = capitalize(monthName);
    return monthName;
}