/**
 * Función que trunca el número de decimales de un número sin hacer un redondeo.
 *
 * @export
 * @param {number} value Número decimal a "recortar".
 * @param {number} [decimals=2] Número de decimales a "recortar".
 * @returns {number} Número con un número fijo de decimales.
 */
export function cutOutDecimals(value: number, decimals: number = 2): number {
    let numberParts: string[] = value.toString().split('.');
    return parseFloat(`${numberParts[0]}.${numberParts[1] ? numberParts[1].substring(0, decimals) : '0'}`);
}

//N   N U   U M   M EEEEE RRRR   OOO        AAA       L     EEEEE TTTTT RRRR   AAA   SSSS
//NN  N U   U MM MM E     R   R O   O      A   A      L     E       T   R   R A   A S
//N N N U   U M M M EEE   RRRR  O   O      AAAAA      L     EEE     T   RRRR  AAAAA  SSS
//N  NN U   U M   M E     R   R O   O      A   A      L     E       T   R   R A   A     S
//N   N  UUU  M   M EEEEE R   R  OOO       A   A      LLLLL EEEEE   T   R   R A   A SSSS

export function units(number: number): string {
    switch(number) {
        case 1: return 'UN';
        case 2: return 'DOS';
        case 3: return 'TRES';
        case 4: return 'CUATRO';
        case 5: return 'CINCO';
        case 6: return 'SEIS';
        case 7: return 'SIETE';
        case 8: return 'OCHO';
        case 9: return 'NUEVE';
    }
    return '';
}

export function tens(number: number): string {
    let ten = Math.floor(number/10);
    let unit = number - (ten * 10);
    switch(ten) {
        case 1:
            switch(unit) {
                case 0: return 'DIEZ';
                case 1: return 'ONCE';
                case 2: return 'DOCE';
                case 3: return 'TRECE';
                case 4: return 'CATORCE';
                case 5: return 'QUINCE';
                default: return `DIECI${units(unit)}`;
            }
        case 2:
            switch(unit) {
                case 0: return 'VEINTE';
                default: return `VEINTI${units(unit)}`;
            }
        case 3: return tensAnd('TREINTA', unit);
        case 4: return tensAnd('CUARENTA', unit);
        case 5: return tensAnd('CINCUENTA', unit);
        case 6: return tensAnd('SESENTA', unit);
        case 7: return tensAnd('SETENTA', unit);
        case 8: return tensAnd('OCHENTA', unit);
        case 9: return tensAnd('NOVENTA', unit);
        case 0: return units(unit);
    }
    return '';
}

function tensAnd(tensName: string, unit: number): string {
    if (unit > 0) {
        return `${tensName} Y ${units(unit)}`;
    } else {
        return tensName;
    }
}

export function hundreds(number: number): string {
    let hundred = Math.floor(number / 100);
    let ten = number - (hundred * 100);
    switch(hundred) {
        case 1:
            if (ten > 0) return `CIENTO ${tens(ten)}`;
            return 'CIEN';
        case 2: return `DOSCIENTOS ${tens(ten)}`;
        case 3: return `TRESCIENTOS ${tens(ten)}`;
        case 4: return `CUATROCIENTOS ${tens(ten)}`;
        case 5: return `QUINIENTOS ${tens(ten)}`;
        case 6: return `SEISCIENTOS ${tens(ten)}`;
        case 7: return `SETECIENTOS ${tens(ten)}`;
        case 8: return `OCHOCIENTOS ${tens(ten)}`;
        case 9: return `NOVECIENTOS ${tens(ten)}`;
    }
    return tens(ten);
}

function section(number: number, divider: number, singular: string, plural: string): string {
    let hundred = Math.floor(number / divider);
    let rest = number - (hundred * divider);
    let result = '';
    if(hundred > 0) {
        if(hundred > 1) {
            result = `${hundreds(hundred)} ${plural}`;
        } else {
            result = singular;
        }
    }
    if(rest > 0) {
        result += '';
    }
    return result;
}

export function thousands(number: number): string {
    let divider = 1000;
    let hundred = Math.floor(number / divider);
    let rest = number - (hundred * divider);
    let thousandsAsString = section(number, divider, 'UN MIL', 'MIL');
    let hundredsAsString = hundreds(rest);
    if(thousandsAsString === '') return hundredsAsString;
    return `${thousandsAsString} ${hundredsAsString}`;
}

export function millions(number: number): string {
    let divider = 1000000;
    let hundred = Math.floor(number / divider);
    let rest = number - (hundred * divider);
    let millionsAsString = section(number, divider, 'UN MILLON DE', 'MILLONES DE');
    let thousandsAsString = thousands(rest);
    if(millionsAsString === '') return thousandsAsString;
    return `${millionsAsString} ${thousandsAsString}`;
}

interface INumber2Words {
    integers: number;
    cents: number;
    centsAsString: string;
    currencyPlural: string;
    currencySingular: string;
}

/**
 * Función que convierte el texto a letra.
 *
 * @export
 * @param {number} number Número a convertir en letra.
 * @returns {string} Texto con la descripción completa del número.
 */
export function number2Words(number: number, currency?: string): string {
    if(!currency || currency === '') currency = 'MXN';
    let data: INumber2Words = {
        integers: Math.floor(number),
        cents: (Math.round(number * 100)) - (Math.floor(number) * 100),
        centsAsString: '',
        currencyPlural: currencyPlural(currency),
        currencySingular: currencySingular(currency)
    };
    data.centsAsString = `${data.cents}/100`;
    if(data.integers == 0) return `CERO ${data.currencyPlural} ${data.centsAsString} ${currencyFinal(currency)}`;
    else if(data.integers == 1) return `${millions(data.integers)} ${data.currencySingular} ${data.centsAsString} ${currencyFinal(currency)}`;
    else return `${millions(data.integers)} ${data.currencyPlural} ${data.centsAsString} ${currencyFinal(currency)}`;
}

export const currencyFormat = new Intl.NumberFormat('es-MX', {
    style: 'decimal',
    currency: 'MXN',
    minimumFractionDigits: 2
});

function currencySingular(currency: string = 'MXN'): string {
    switch(currency) {
        case 'USD':
            return 'DOLAR';
        case 'MXN':
        default:
            return 'PESO'
    }
}

function currencyPlural(currency: string = 'MXN'): string {
    switch(currency) {
        case 'USD':
            return 'DOLARES';
        case 'MXN':
        default:
            return 'PESOS'
    }
}

function currencyFinal(currency: string = 'MXN'): string {
    switch(currency) {
        case 'USD':
            return 'USD';
        case 'MXN':
        default:
            return 'M.N.'
    }
}
