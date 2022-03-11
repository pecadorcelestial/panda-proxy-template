import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

//Se pueden recibir "constrains" como parámetros iniciales.
export function IsAccountNumber(property: string, validationOptions?: ValidationOptions) {
   return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isAccountNumber',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName];
                    // console.log('[DECORADORES][CLIENTE][IsAccountNumber] Nombre de la propiedad relacionada: ', relatedPropertyName);
                    // console.log('[DECORADORES][CLIENTE][IsAccountNumber] Valor de la propiedad relacionada: ', relatedValue);
                    // console.log('[DECORADORES][CLIENTE][IsAccountNumber] Valor de la propiedad original: ', value);
                    let regExp: RegExp = /^.*/;
                    switch(relatedValue) {
                        case '02':
                            regExp = /^([0-9]{11}|[0-9]{18})$/;
                            break;
                        case '03':
                            regExp = /^([0-9]{10}|[0-9]{16}|[0-9]{18})$/;
                            break;
                        case '04':
                        case '28':
                            regExp = /^[0-9]{16}$/;
                            break;
                    }
                    // console.log('[DECORADORES][CLIENTE][IsAccountNumber] Expresión regular: ', regExp);
                    // console.log('[DECORADORES][CLIENTE][IsAccountNumber] ¿El valor es válido? R =', typeof value === "string" && regExp.test(value));
                    return typeof value === "string" && regExp.test(value);
                }
            }
        });
   };
}