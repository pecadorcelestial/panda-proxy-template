// Opciones para "pluralizar".
let plural: any = {
    '(quiz)$': "$1zes",
    '^(ox)$': "$1en",
    '([m|l])ouse$': "$1ice",
    '(matr|vert|ind)ix|ex$': "$1ices",
    '(x|ch|ss|sh)$': "$1es",
    '([^aeiouy]|qu)y$': "$1ies",
    '(hive)$': "$1s",
    '(?:([^f])fe|([lr])f)$': "$1$2ves",
    '(shea|lea|loa|thie)f$': "$1ves",
    'sis$': "ses",
    '([ti])um$': "$1a",
    '(tomat|potat|ech|her|vet)o$': "$1oes",
    '(bu)s$': "$1ses",
    '(alias)$': "$1es",
    '(octop)us$': "$1i",
    '(ax|test)is$': "$1es",
    '(us)$': "$1es",
    '([^s]+)$': "$1s"
};

// Reconocimiento de singulares.
let singular: any = {
    '(quiz)zes$': "$1",
    '(matr)ices$': "$1ix",
    '(vert|ind)ices$': "$1ex",
    '^(ox)en$': "$1",
    '(alias)es$': "$1",
    '(octop|vir)i$': "$1us",
    '(cris|ax|test)es$': "$1is",
    '(shoe)s$': "$1",
    '(o)es$': "$1",
    '(bus)es$': "$1",
    '([m|l])ice$': "$1ouse",
    '(x|ch|ss|sh)es$': "$1",
    '(m)ovies$': "$1ovie",
    '(s)eries$': "$1eries",
    '([^aeiouy]|qu)ies$': "$1y",
    '([lr])ves$': "$1f",
    '(tive)s$': "$1",
    '(hive)s$': "$1",
    '(li|wi|kni)ves$': "$1fe",
    '(shea|loa|lea|thie)ves$': "$1f",
    '(^analy)ses$': "$1sis",
    '((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$': "$1$2sis",        
    '([ti])a$': "$1um",
    '(n)ews$': "$1ews",
    '(h|bl)ouses$': "$1ouse",
    '(corpse)s$': "$1",
    '(us)es$': "$1",
    's$': ""
};

// Verbos irregulares.
let irregular: any = {
    'move': 'moves',
    'foot': 'feet',
    'goose': 'geese',
    'sex': 'sexes',
    'child': 'children',
    'man': 'men',
    'tooth': 'teeth',
    'person': 'people'
};

// Sustantivos que NO cuentan con plural.
let uncountable = [
    'sheep', 
    'fish',
    'deer',
    'moose',
    'series',
    'species',
    'money',
    'rice',
    'information',
    'equipment'
];

/**
 * Función que devuelve un texto en plural.
 *
 * @export
 * @param {string} noun Sustantivo / palabra a pluralizar.
 * @returns {string} Texto en plural.
 */
export function pluralize(noun: string): string {
    // 1. Se revisa si posee plural o no.
    if(uncountable.indexOf(noun.toLowerCase()) >= 0) return noun;
    // 2. Se revisa si contiene forma irregular.
    for(let word in irregular){
        let pattern = new RegExp(word + '$', 'i');
        let replace: string = irregular[word];
        if(pattern.test(noun))
            return noun.replace(pattern, replace);
    }
    // 3. Se revisa su forma regular.
    for(let regExp in plural){

        let pattern = new RegExp(regExp, 'i');

        if(pattern.test(noun))
            return noun.replace(pattern, plural[regExp]);
    }
    // 4. Finalmente se devuelve la misma palabra si no se encontro otro resultado.
    return noun;
}

/**
 * Función que convierte en mayúscula la primer letra y el resto a minúsculas.
 *
 * @export
 * @param {string} text Texto a capitalizar.
 * @returns {string} Texto capitalizado.
 */
export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 *  Esta función remueve marcas de puntuación de las vocales.
 *
 * @export
 * @param {string} text Texto a modificar.
 * @returns {string} Texto sin marcas de puntuación.
 */
export function removeAccentsAndMarks(text: string): string {
    // () {} [] , . \ / ¿? ¡! " # $ % & = '
    text = text.replace(/\(/g, '');
    text = text.replace(/\)/g, '');
    text = text.replace(/\{/g, '');
    text = text.replace(/\}/g, '');
    text = text.replace(/\[/g, '');
    text = text.replace(/\]/g, '');
    text = text.replace(/\,/g, '');
    text = text.replace(/\./g, '');
    text = text.replace(/\\/g, '');
    text = text.replace(/\//g, '');
    text = text.replace(/\¿/g, '');
    text = text.replace(/\?/g, '');
    text = text.replace(/\¡/g, '');
    text = text.replace(/\!/g, '');
    text = text.replace(/\"/g, '');
    text = text.replace(/\'/g, '');
    text = text.replace(/\#/g, '');
    text = text.replace(/\$/g, '');
    text = text.replace(/\%/g, '');
    text = text.replace(/\&/g, '');
    text = text.replace(/\=/g, '');
    // Minúsculas.
    // ´
    text = text.replace(/á/g, 'a');
    text = text.replace(/é/g, 'e');
    text = text.replace(/í/g, 'i');
    text = text.replace(/ó/g, 'o');
    text = text.replace(/ú/g, 'u');
    // `
    text = text.replace(/à/g, 'a');
    text = text.replace(/è/g, 'e');
    text = text.replace(/ì/g, 'i');
    text = text.replace(/ò/g, 'o');
    text = text.replace(/ù/g, 'u');
    // ¨
    text = text.replace(/ä/g, 'a');
    text = text.replace(/ë/g, 'e');
    text = text.replace(/ï/g, 'i');
    text = text.replace(/ö/g, 'o');
    text = text.replace(/ü/g, 'u');
    // ^
    text = text.replace(/â/g, 'a');
    text = text.replace(/ê/g, 'e');
    text = text.replace(/î/g, 'i');
    text = text.replace(/ô/g, 'o');
    text = text.replace(/û/g, 'u');
    // ñ
    text = text.replace(/ñ/g, 'n');
    // Mayúsculas.
    // ´
    text = text.replace(/Á/g, 'A');
    text = text.replace(/É/g, 'E');
    text = text.replace(/Í/g, 'I');
    text = text.replace(/Ó/g, 'O');
    text = text.replace(/Ú/g, 'U');
    // `
    text = text.replace(/À/g, 'A');
    text = text.replace(/È/g, 'E');
    text = text.replace(/Ì/g, 'I');
    text = text.replace(/Ò/g, 'O');
    text = text.replace(/Ù/g, 'U');
    // ¨
    text = text.replace(/Ä/g, 'A');
    text = text.replace(/Ë/g, 'E');
    text = text.replace(/Ï/g, 'I');
    text = text.replace(/Ö/g, 'O');
    text = text.replace(/Ü/g, 'U');
    // ^
    text = text.replace(/Â/g, 'A');
    text = text.replace(/Ê/g, 'E');
    text = text.replace(/Î/g, 'I');
    text = text.replace(/Ô/g, 'O');
    text = text.replace(/Û/g, 'U');
    // Ñ
    text = text.replace(/Ñ/g, 'N');
    // Resultado.
    return text;
}

/**
 * Esta función devuelve el porcentaje de texto encontrado dentro de una oración.
 *
 * @export
 * @param {string} text2SearchIn Texto sobre el cual se realizará la búsqueda.
 * @param {string} text2Find Texto a buscar.
 * @returns {number} Porcentaje / peso que representa la cantidad de texto encontrado.
 */
export function percentFound(text2SearchIn: string, text2Find: string): number {
    let total: number = 0;
    let percent: number = 100;
    // 0. Se convierte todo a minúsculas y se eliminan los acentos y las ñ.
    text2SearchIn = removeAccentsAndMarks(text2SearchIn.toLocaleLowerCase());
    text2Find = removeAccentsAndMarks(text2Find.toLocaleLowerCase());
    // console.log(`[SCRIPTS][TEXTO][percentFound] Texto en el que se va a buscar: ${text2SearchIn}`);
    // console.log(`[SCRIPTS][TEXTO][percentFound] Texto que se va a buscar: ${text2Find}`);
    // 1. Se obtiene el peso a agregar por cada palabra encontrada.
    let text2SearchInWords: string[] = text2SearchIn.split(' ');
    percent = Math.floor(100 / text2SearchInWords.length);
    // console.log(`[SCRIPTS][TEXTO][percentFound] Porcentaje a sumar: ${percent}`);
    // 2. Se busca cada palabra.
    let text2FindWords: string[] = text2Find.split(' ');
    text2FindWords.forEach((word: string) => {
        if(text2SearchIn.indexOf(word) >= 0) total += percent;
    });
    // console.log(`[SCRIPTS][TEXTO][percentFound] Total a devolver: ${total}`);
    return total;
}