import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

//Se pueden recibir "constrains" como parámetros iniciales.
export function IsRFC(validationOptions?: ValidationOptions) {
   return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isRFC',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    //const [relatedPropertyName] = args.constraints;
                    //const relatedValue = (args.object as any)[relatedPropertyName];
                    // let matchFound = String(value).match(/([A-Z]){3,4}(\d){6}([A-Z0-9]){3}/g) || [];
                    let matchFound = String(value).match(/^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/g) || [];
                    return typeof value === "string" && matchFound.length > 0;
                }
            }
        });
   };
}