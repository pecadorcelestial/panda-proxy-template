import axios from 'axios';
import idx from 'idx';
import { IsArray, IsString, IsEmail, MaxLength, IsBoolean, validate, IsMongoId, IsDefined, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { RemodelErrors } from '../scripts/data-management';
import configuration from '../configuration';
import { userPermissions } from '../scripts/users';
import ClientModel, { Client } from './clients';
import ClientProcessesModel from './processes/clients';

class Permissions {
    // Identificador del ROL.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.',
        groups: ['POST', 'PUT']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    roleValue: string;
    // Identificador del MÓDULO.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.',
        groups: ['POST', 'PUT']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    moduleValue: string;
}

export class User {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    _id: string;
    // Correo electrónico.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(100, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    @IsEmail(undefined, {
        message: 'El campo $property no tiene el formato correcto.',
        groups: ['POST', 'PUT']
    })
    email: string;
    // Nombre(s).
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    firstName: string;
    // Appellido(s).
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    lastName: string;
    // ¿Está activo?
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    isActive: boolean;
    // Contraseña.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    password: string;
    // Identificador como usario de Google.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(200, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    googleId: string;
    // Arreglo de departamentos.
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    departmentValues: Array<string>;
    // Arreglo de permisos.
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    permissions: Array<Permissions>;
}

export default class UserModel {

    // Propiedades.
    private user: any;

    // Constructor.
    constructor(user?: any) {
        this.user = user;
    }
    
    // Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchemas(this.user);
    }

    private async validateSchemas(_user: any = {}, groups: Array<string> = ['POST']): Promise<any> {
        
        let errors: Array<any> = [];
        // Usuario.
        let user = new User();
        user.email = _user.email;
        user.firstName = _user.firstName;
        user.lastName = _user.lastName;
        user.isActive = _user.isActive;
        user.password = _user.password;
        user.googleId = _user.googleId;
        user.departmentValues = _user.departmentValues;
        user.permissions = _user.permissions;
        let userErrors = await validate(user, { groups, skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(userErrors, 'user'));
        // Permisos.
        if(Array.isArray(_user.permissions) && _user.permissions.length > 0) {
            let index: number = 0;
            for(const _permission of _user.permissions) {
                let permission = new Permissions();
                permission.moduleValue = _permission.moduleValue;
                permission.roleValue = _permission.roleValue;
                let permissionErrors = await validate(permission, { groups, skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(permissionErrors, `user.permission[${index}]`))
                index++;
            }
        }
        
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getUser(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.users.getUser, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Usuarios',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Usuarios',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    
    public getUsers(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.users.getUsers, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Usuarios',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Usuarios',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public getUserPermissions(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { email }: { email: string } = query;
            let _user: User = new User();
            try {
                _user = await this.getUser({ email });
            } catch(error) {
                return reject(error);
            }
            if(_user) {
                // NOTE: Obtener los permisos por módulos y cifrarlos de alguna manera en el token...
                let permissions = userPermissions(_user);
                return resolve({
                    email,
                    permissions,
                    user: _user
                });
            } else {
                return reject({
                    status: 404,
                    module: 'Usuarios',
                    message: 'No se pudo verificar la información del usuario de manera local.'
                });
            }
        });
    }

    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postUser(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Usuarios',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.users.postUser, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Usuarios',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Usuarios',
                            message: 'Ocurrió un error al intentar guardar la información (USUARIO).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putUser(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            let errors: Array<any> = [];
            this.validateSchemas(body, ['PUT'])
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Usuarios',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.users.putUser, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Usuarios',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Usuarios',
                            message: 'Ocurrió un error al intentar actualizar la información.',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    //DDDD  EEEEE L     EEEEE TTTTT EEEEE
    //D   D E     L     E       T   E
    //D   D EEE   L     EEE     T   EEE
    //D   D E     L     E       T   E
    //DDDD  EEEEE LLLLL EEEEE   T   EEEEE

    public deleteUser(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.users.deleteUser, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Usuarios',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Usuarios',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

}

// CCCC L     IIIII EEEEE N   N TTTTT EEEEE  SSSS
//C     L       I   E     NN  N   T   E     S
//C     L       I   EEE   N N N   T   EEE    SSS
//C     L       I   E     N  NN   T   E         S
// CCCC LLLLL IIIII EEEEE N   N   T   EEEEE SSSS

export class ClientUser {
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false },{
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    folio: number;
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.',
        groups: ['POST', 'PUT']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    password: string;
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.',
        groups: ['POST', 'PUT']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    statusValue: string;
}

export class ClientUserModel {
    
    // Propiedades.
    private user: ClientUser;

    // Constructor.
    constructor(user?: ClientUser) {
        this.user = user || new ClientUser();
    }
    
    // Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchemas(this.user);
    }

    private async validateSchemas(_user: any = {}, groups: Array<string> = ['POST']): Promise<any> {
        // Arreglo de errores.
        let errors: Array<any> = [];
        // Usuario.
        let user = new ClientUser();
        user.folio = _user.folio;
        user.password = _user.password;
        user.statusValue = _user.statusValue;
        let userErrors = await validate(user, { groups, skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(userErrors, 'user'));
        // Resultado.
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getUser(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.users.clients.getUser, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Usuarios | Clientes',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Usuarios | Clientes',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    
    public getUsers(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.users.clients.getUsers, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Usuarios | Clientes',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Usuarios | Clientes',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postUser(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Usuarios | Clientes',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.users.clients.postUser, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Usuarios | Clientes',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Usuarios | Clientes',
                            message: 'Ocurrió un error al intentar guardar la información (USUARIO).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    public postUsers(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Se buscan todos los clientes activos.
            let clients: Array<Client> = [];
            let clientModel: ClientModel = new ClientModel();
            try {
                let params = {
                    all: true,
                    // page: 1,
                    // limit: 1,
                    statusValue: 'active',
                };
                let getClients: { results: Array<Client>, summary: any } = await clientModel.getClients(params);
                clients = getClients.results;
            } catch(error) {
                return reject(error);
            }
            // Si existen clientes, se recorren todos y se crean usuarios.
            let clientUsers: Array<ClientUser> = [];
            if(clients.length > 0) {
                let errors: Array<any> = [];
                let usersInserted: number = 0;
                for(const client of clients) {
                    // Se agrega el usuario al arreglo para inserción masiva.
                    /*
                    clientUsers.push({
                        folio: client.folio,
                        password: Buffer.from(client.folio.toString()).toString('base64'), // btoa(client.folio.toString()),
                        statusValue: 'new'
                    });
                    */
                    // Se hace la inserción uno a uno.
                    try {
                        await this.postUser({
                            folio: client.folio,
                            password: Buffer.from(client.folio.toString()).toString('base64'), // btoa(client.folio.toString()),
                            statusValue: 'new'
                        });
                        usersInserted++;
                    } catch(error) {
                        errors.push(error);
                    }
                }
                // Resultado.
                return resolve({
                    status: errors.length > 0 ? 206 : 200,
                    message: `Proceso terminado. Usuarios insertados: ${usersInserted}.`,
                    errors
                })
            } else {
                return reject({
                    status: 400,
                    module: 'Usuarios | Clientes',
                    message: 'No se encontró ningún cliente para crear usuario.'
                });
            }
            // Se hace la llamada a guardar muchos.
            /*
            if(clientUsers.length > 0) {
                axios.post(configuration.services.domain.users.clients.postUsers, clientUsers)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            message: 'Ocurrió un error al intentar guardar la información (USUARIO).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            } else {
                return reject({
                    status: 400,
                    message: 'No se encontró ningún cliente para crear usuario.'
                })
            }
            */
        });
    }

    public validatePassword(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Usuarios | Clientes',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.users.clients.validatePassword, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Usuarios | Clientes',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Usuarios | Clientes',
                            message: 'Ocurrió un error al intentar guardar la información (USUARIO).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putUser(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            let errors: Array<any> = [];
            this.validateSchemas(body, ['PUT'])
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Usuarios | Clientes',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.users.clients.putUser, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Usuarios | Clientes',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Usuarios | Clientes',
                            message: 'Ocurrió un error al intentar actualizar la información.',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    //DDDD  EEEEE L     EEEEE TTTTT EEEEE
    //D   D E     L     E       T   E
    //D   D EEE   L     EEE     T   EEE
    //D   D E     L     E       T   E
    //DDDD  EEEEE LLLLL EEEEE   T   EEEEE

    public deleteUser(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.users.clients.deleteUser, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Usuarios | Clientes',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Usuarios | Clientes',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    //EEEEE M   M  AAA  IIIII L
    //E     MM MM A   A   I   L
    //EEE   M M M AAAAA   I   L
    //E     M   M A   A   I   L
    //EEEEE M   M A   A IIIII LLLLL

    public sendUserCredentials(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Se buscan todos los clientes activos.
            let clients: Array<ClientUser> = [];
            let clientUserModel: ClientUserModel = new ClientUserModel();
            try {
                let params = {
                    all: true,
                    statusValue: 'new',
                };
                let getClients: { results: Array<ClientUser>, summary: any } = await clientUserModel.getUsers(params);
                clients = getClients.results;
            } catch(error) {
                return reject(error);
            }
            // Si existen clientes, se recorren todos y se crean usuarios.
            if(clients.length > 0) {
                let errors: Array<any> = [];
                let notificationsSent: number = 0;
                for(const client of clients) {
                    // Se envía el correo.
                    let data: any = {
                        folio: client.folio,
                        // attachments,
                        template: 'new_portal_password',
                        content: [
                            {
                                name: 'portal_user',
                                content: client.folio
                            },
                            {
                                name: 'portal_password',
                                content: Buffer.from(client.folio.toString()).toString('base64')
                            },
                        ],
                        subject: 'Domain Portal de Clientes'
                    };
                    let clientProcessesModel: ClientProcessesModel = new ClientProcessesModel();
                    try {
                        await clientProcessesModel.sendEmail(data);
                        notificationsSent++;
                    } catch(error) {
                        // TODO: Avisar que ocurrió un error al enviar el correo.
                        errors.push(error);
                    }
                }
                // Resultado.
                return resolve({
                    status: errors.length > 0 ? 206 : 200,
                    message: `Proceso terminado. Notificaciones enviadas: ${notificationsSent}.`,
                    errors
                })
            } else {
                return reject({
                    status: 400,
                    module: 'Usuarios | Clientes',
                    message: 'No se encontró ningún cliente para enviar la información.'
                });
            }
        });
    }
}