//Descripción: Obtiene un arreglo de errores devueltos por la librería "class-validator" y extrae sólo las restricciones de cada error.
//Parámetros:
//              Arreglo de errores.
//Resultado:
//              Un objeto con el valor de la llave y las restricciones solamente.
export function RemodelErrors(errors: any, schema?: string): any[] {
    let result: any[] = [];
    errors.forEach((error: any) => {
        let constraints: string[] = [];
        for (let property in error.constraints) {
            if (error.constraints.hasOwnProperty(property)) {
                constraints.push(error.constraints[property]);
            }
        }
        let newError: any = {
            property: error.property,
            constraints
        }
        if(schema) newError['schema'] = schema;
        result.push(newError);
    });
    return result;
}

//Descripción: Recibe una variable de tipo string con las cookies y devuelve un arreglo con los datos.
//Parámetros:
//              Cadena de cookies.
//Resultado:
//              Un objeto con llave / valor de todas las cookies.
export function parseCookies(cookies: string | undefined): any | undefined {
    // console.log(`[parseCookies][COOKIES] ${cookies}`);
    if(cookies && cookies != '') {
        let result: any = {};
        cookies.split(';').forEach((cookie: string) => {
            try {
                // console.log(`[parseCookies][COOKIE] ${cookie}`);
                let cookieParts: string[] = cookie.split('=');
                // console.log(`[parseCookies][COOKIE][0] ${cookieParts[0]}`);
                // console.log(`[parseCookies][COOKIE][1] ${cookieParts[1]}`);
                let key = cookieParts[0].trim();
                let value = cookieParts[1].trim();
                result[key] = value;
            } catch(exception) {
                // console.log(`[parseCookies][COOKIE][ERROR] ${exception}`);
            }
        });
        return result;
    } else {
        return undefined;
    }
}
