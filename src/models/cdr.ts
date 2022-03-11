// Módulos.
import axios from 'axios';
import idx from 'idx';
import { IsString, validate, IsMongoId, IsDefined, IsNumber } from 'class-validator';
// Funciones.
import { RemodelErrors } from '../scripts/data-management';
// Configuración.
import configuration from '../configuration';

export class CDR {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    _id: string;
    // Número que realiza la llamada.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    calling: string;
    // Duración de la llamada.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    duration_signal: number;
    // Causa del término de la llamada.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    disc_cause: string;
    // Estatus de la llamada.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    sess_disp: string;
    // Dirección IP de quien recibió la llamada.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    called_host: string;
    // Dato para la validación del servicio.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    import_error: string;
    // Número al que se llamó.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    called: string;
    // No sabemos qué es pero no es importante.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    disc_init: string;
    // Dirección IP de quien realizó la llamada.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    calling_host: string;
    // Identificador de la llamada.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    acct_id: string;
    // Duración completa de la llamada.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    duration: number;
    // Nombre del cliente llamado.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    called_realm: string;
    // Fecha de la operación.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    signal_time: number;
    // Estatus SIP de la llamada.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    sip_status: number;
    // Nombre del ciente que realizó la llamda.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    calling_realm: string;
    // Duración de la conexión de la llamda.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    duration_connect: number;
    // Número marcado (el importante).
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    billing: number;
}

export default class CDRModel {

    //Propiedades.
    private _cdr: CDR;

    // Constructor.
    constructor(cdr?: CDR) {
        this._cdr = cdr ? cdr : new CDR();
    }
    
    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchemas(this._cdr);
    }

    private async validateSchemas(_cdr: any = {}): Promise<any> {
        
        let errors: Array<any> = [];
        
        let cdr = new CDR();
        cdr._id = _cdr._id;
        cdr.calling = _cdr.calling;
        cdr.duration_signal = _cdr.duration_signal;
        cdr.disc_cause = _cdr.disc_cause;
        cdr.sess_disp = _cdr.sess_disp;
        cdr.called_host = _cdr.called_host;
        cdr.import_error = _cdr.import_error;
        cdr.called = _cdr.called;
        cdr.disc_init = _cdr.disc_init;
        cdr.calling_host = _cdr.calling_host;
        cdr.acct_id = _cdr.acct_id;
        cdr.duration = _cdr.duration;
        cdr.called_realm = _cdr.called_realm;
        cdr.signal_time = _cdr.signal_time;
        cdr.sip_status = _cdr.sip_status;
        cdr.calling_realm = _cdr.calling_realm;
        cdr.duration_connect = _cdr.duration_connect;
        cdr.billing = _cdr.billing;
        
        let cdrErrors = await validate(cdr, { skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(cdrErrors, 'cdr'));
        
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getCDR(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.cdr.getCDR, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'CDRos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'CDRos',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    
    public getCDRs(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.cdr.getCDRs, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'CDRos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'CDRos',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

}