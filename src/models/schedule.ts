import axios from 'axios';
import idx from 'idx';
import { IsString, MaxLength, validate, IsEnum, IsArray, IsMongoId, IsDate, IsBoolean } from 'class-validator';
import { RemodelErrors } from '../scripts/data-management';
import configuration from '../configuration';
import UserModel from './users';
import { CATALOGS } from '../constants/constants';

class Schedule {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.'
    })
    _id: string;
    // Identificador del catálogo padre.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.'
    })
    parentId: string;
    // Tipo del catálogo padre.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @IsEnum(CATALOGS, {
        message: 'El valor no es válido.'
    })
    parentType: string;
    // Identificador del usuario(s).
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    users: Array<string>;
    // Descripción corta de la junta.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(255, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    description: string;
    // Fecha de inicio.
    @IsDate({
        message: 'El tipo de dato es incorrecto.'
    })
    startedAt: Date;
    // Fecha de término.
    @IsDate({
        message: 'El tipo de dato es incorrecto.'
    })
    finishedAt: Date;
    // ¿Aceptada por el cliente?
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    accepted: boolean;
    // Identificador del usuario que la creó.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.'
    })
    createdBy: string;
}

export default class ScheduleModule {
    
    //Propiedades.
    private schedule: any;

    // Constructor.
    constructor(schedule?: any) {
        this.schedule = schedule;
    }
    
    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchemas(this.schedule);
    }

    private async validateSchemas(_schedule: any = {}): Promise<any> {
        
        let errors: Array<any> = [];
        
        let schedule = new Schedule();
        schedule.parentId = _schedule.parentId;
        schedule.parentType = _schedule.parentType;
        schedule.users = _schedule.users;
        schedule.description = _schedule.description;
        schedule.startedAt = _schedule.startedAt;
        schedule.finishedAt = _schedule.finishedAt;
        schedule.accepted = _schedule.accepted;
        schedule.createdBy = _schedule.createdBy;
        let scheduleErrors = await validate(schedule, { skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(scheduleErrors, 'schedule'));
        
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getSchedule(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let errors: Array<any> = [];

            // CCCC IIIII TTTTT  AAA
            //C       I     T   A   A
            //C       I     T   AAAAA
            //C       I     T   A   A
            // CCCC IIIII   T   A   A

            let _schedule: any = {};
            let users: Array<string> = [];
            try {
                _schedule = await axios.get(configuration.services.domain.schedule.getSchedule, { params: query });
                users = _schedule.data.users || [];
                if(_schedule.data.createdBy) users.push(_schedule.data.createdBy);
            } catch(error) {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Agenda',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Agenda',
	                    message: 'Ocurrió un error al intentar obtener la información (CLIENTE).',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            }

            //U   U  SSSS U   U  AAA  RRRR  IIIII  OOO   SSSS
            //U   U S     U   U A   A R   R   I   O   O S
            //U   U  SSS  U   U AAAAA RRRR    I   O   O  SSS
            //U   U     S U   U A   A R   R   I   O   O     S
            // UUU  SSSS   UUU  A   A R   R IIIII  OOO  SSSS

            let _users: any = [];
            if(users.length > 0) {
                try {
                    let params = {
                        _id: users
                    };
                    let userModel = new UserModel();
                    _users = await userModel.getUsers(params);
                } catch(error) {
                    errors.push(error);
                }
            }
            
            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            let result: any = _schedule.data;
            result['users'] = _users || [];
            if(errors.length > 0) {
                result['errors'] = errors;
            }
            return resolve(result);
        });
    }
    
    public getSchedules(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.schedule.getSchedules, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Agenda',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Agenda',
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

    public postSchedule(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Agenda',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.schedule.postSchedule, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Agenda',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Agenda',
                            message: 'Ocurrió un error al intentar guardar la información (AGENDA).',
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

    public putSchedule(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Agenda',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.schedule.putSchedule, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Agenda',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Agenda',
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

    public deleteSchedule(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.schedule.deleteSchedule, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Agenda',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Agenda',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

}