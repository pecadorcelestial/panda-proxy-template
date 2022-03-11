// Módulos.
import axios, { AxiosResponse } from 'axios';
import idx from 'idx';
import { IsString, MaxLength, IsDefined, IsEnum, IsNumber, IsBoolean, validate, IsArray, IsNotEmpty, ValidateIf } from 'class-validator';
// Modelos.
import AddressModel, { Address } from './addresses';
import { ClientUser, ClientUserModel } from './users';
import ClientProcessesModel from './processes/clients';
import ContactModel, { Contact } from './contacts';
import EventModel, { Event } from './events';
import FilesModel from './files';
import { ZipCodeModel } from './locations';
import ZendeskModel from './zendesk';
// Funciones.
import { IsAccountNumber } from '../decorators/accountNumber';
import { isEmpty } from '../scripts/object-prototypes';
import { percentFound } from '../scripts/strings';
import { RemodelErrors } from '../scripts/data-management';
// Decoradores.
import { IsCURP } from '../decorators/curp';
import { IsRFC } from '../decorators/rfc';
// Configuración.
import configuration from '../configuration';
// Constantes.
import { PAYMENT_FORMS, PAYMENT_METHODS, CFDI_USE } from '../constants/constants';
// Clases.
import Google from '../classes/google';
// Interfaces.
import { ILocation } from '../interfaces/location';

class AccountingData {
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    generalAccountNumber: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    advanceAccountNumber: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    discountAccountNumber: string;
}

class BusinessData {
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(13, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    @IsRFC({
        message: 'El valor no tiene el formato correcto.',
        groups: ['POST', 'PUT']
    })
    rfc: string = "XAXX010101000";                    //Default = "XAXX010101000"
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(120, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    businessName: string;
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(2, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    @IsEnum(PAYMENT_FORMS, {
        message: 'El valor no es válido.',
        groups: ['POST', 'PUT']
    })
    paymentForm: string;
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(3, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    @IsEnum(PAYMENT_METHODS, {
        message: 'El valor no es válido.',
        groups: ['POST', 'PUT']
    })
    paymentMethod: string;
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(3, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    @IsEnum(CFDI_USE, {
        message: 'El valor no es válido.',
        groups: ['POST', 'PUT']
    })
    cfdiUse: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(18, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    @IsAccountNumber('paymentForm', {
        message: 'El valor no tiene el formato correcto.',
        groups: ['POST', 'PUT']
    })
    issuingAccountNumber: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    issuingBankName: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(13, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    @IsRFC({
        message: 'El valor no tiene el formato correcto.',
        groups: ['POST', 'PUT']
    })
    issuingBankRfc: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(100, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    legalRepresentative: string;
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    stakeHolders: Array<string>;
}

export class Client {
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false },{
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    folio: number;
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    firstName: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    secondName: string;
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    firstLastName: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    secondLastName: string;
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
    priorityValue: string;           //Catálogo.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    avoidSuspension: boolean = false;
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
    statusValue: string;             //Catálogo.
    //
    businessData?: BusinessData;
    accountingData?: AccountingData;
    personalData?: PersonalData;
    address?: Address;
    contacts?: Contact[];
    files?: Array<string>;
}

class PersonalData {
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    dateOfBirth: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    nationality: string;
    @ValidateIf(o => typeof o.curp === 'string')
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    @IsCURP({
        message: 'El valor no tiene el formato correcto.',
        groups: ['POST', 'PUT']
    })
    curp: string;
}

export default class ClientModel {

    //Propiedades.
    private client: any;

    //Constructor.
    constructor(client?: any) {
        this.client = client;
    }

    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        let { accountingData, businessData, personalData, ...client } = this.client;
        return this.validateSchemas(accountingData, businessData, personalData, client);
    }

    private async validateSchemas(_accountingData: any = {}, _businessData: any = {}, _personalData: any = {}, _client: any = {}, groups: Array<string> = ['POST']): Promise<any[]> {
        
        let errors: Array<any> = [];
        
        //Datos contables.
        if(!isEmpty(_accountingData)) {
            let accountingData = new AccountingData();
            accountingData.generalAccountNumber = _accountingData.generalAccountNumber;
            accountingData.advanceAccountNumber = _accountingData.advanceAccountNumber;
            accountingData.discountAccountNumber = _accountingData.discountAccountNumber;
            let accountingDataErrors = await validate(accountingData, { groups, skipMissingProperties: true });
            errors = errors.concat(RemodelErrors(accountingDataErrors, 'client.accountingData'));
        }
        //Datos del negocio.
        if(!isEmpty(_businessData)) {
            let businessData = new BusinessData();
            businessData.rfc = _businessData.rfc;
            businessData.businessName = _businessData.businessName;
            businessData.paymentForm = _businessData.paymentForm;
            businessData.paymentMethod = _businessData.paymentMethod;
            businessData.cfdiUse = _businessData.cfdiUse;
            businessData.issuingAccountNumber = _businessData.issuingAccountNumber;
            businessData.issuingBankName = _businessData.issuingBankName;
            businessData.issuingBankRfc = _businessData.issuingBankRfc;
            businessData.legalRepresentative = _businessData.legalRepresentative;
            let businessDataErrors = await validate(businessData, { groups, skipMissingProperties: true });
            errors = errors.concat(RemodelErrors(businessDataErrors, 'client.businessData'));
        }
        //Datos personales.
        if(!isEmpty(_personalData)) {
            let personalData = new PersonalData();
            personalData.dateOfBirth = _personalData.dateOfBirth;
            personalData.nationality = _personalData.nationality;
            personalData.curp = _personalData.curp;
            let personalDataErrors = await validate(personalData, { groups, skipMissingProperties: true });
            errors = errors.concat(RemodelErrors(personalDataErrors, 'client.personalData'));
        }
        //Cliente.
        if(!isEmpty(_client)) {
            let client = new Client();
            client.folio = _client.folio;
            client.firstName = _client.firstName;
            client.secondName = _client.secondName;
            client.firstLastName = _client.firstLastName;
            client.secondLastName = _client.secondLastName;
            client.priorityValue = _client.priorityValue;
            client.avoidSuspension = _client.avoidSuspension;
            client.statusValue = _client.statusValue;
            let clientErrors = await validate(client, { groups, skipMissingProperties: true });
            errors = errors.concat(RemodelErrors(clientErrors, 'client'));
        }
        
        // console.log('[MODELOS][CLIENTES][validateSchemas] Errores: ', errors);
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getClient(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let errors: Array<any> = [];

            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
            
            let clientId: number;
            let _client: any = {};
            try {
                _client = await axios.get(configuration.services.domain.clients.getClient, { params: query });
                clientId = _client.data.folio;
            } catch(error) {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Clientes',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Clientes',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Clientes',
                            message: 'Ocurrió un error al intentar obtener la información (CLIENTE).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
				}
            }
            
            //DDDD  IIIII RRRR  EEEEE  CCCC  CCCC IIIII  OOO  N   N EEEEE  SSSS
            //D   D   I   R   R E     C     C       I   O   O NN  N E     S
            //D   D   I   RRRR  EEE   C     C       I   O   O N N N EEE    SSS
            //D   D   I   R   R E     C     C       I   O   O N  NN E         S
            //DDDD  IIIII R   R EEEEE  CCCC  CCCC IIIII  OOO  N   N EEEEE SSSS
            
            let addresses: Array<Address> = [];
            if(typeof clientId === 'number') {
                try {
                    let params = {
                        full: true,
                        parentId: clientId.toString(),
                        parentType: 'client',
                        all: true
                    };
                    let addressModel = new AddressModel();
                    let getAddresses: { results: Array<Address>, summary: any } = await addressModel.getAddresses(params);
                    addresses = addresses.concat(getAddresses.results);
                } catch(error) {
                    errors.push(error);
                }
            }
            // SUPER PODEROSA NINJA TURBO NEO ULTRA HYPER MEGA MULTI ALPHA META EXTRA UBER PREFIJO NOTA:
            // Como hay un chingo (que en español quiere decir "muchas") referencias hacía la dirección como un sólo objeto, se
            // debe buscar la dirección por 'default' (o al menos la primera) para devolverla como la dirección en singular.
            let defaultAddress: Address = new Address();
            let defaultAddressFound: boolean = false;
            for(const address of addresses) {
                if(address.typeValue === 'default') {
                    defaultAddress = Object.assign({}, address);
                    defaultAddressFound = true;
                    break;
                }
            }
            // Si no se encontró la dirección por defecto, se toma la primera de la lista.
            if(!defaultAddressFound && addresses.length > 0) {
                defaultAddress = addresses[0];
            }
            
            // CCCC  OOO  N   N TTTTT  AAA   CCCC TTTTT  OOO
            //C     O   O NN  N   T   A   A C       T   O   O
            //C     O   O N N N   T   AAAAA C       T   O   O
            //C     O   O N  NN   T   A   A C       T   O   O
            // CCCC  OOO  N   N   T   A   A  CCCC   T    OOO
            
            let _contacts: any = {};
            if(typeof clientId === 'number') {
                try {
                    let params = {
                        all: true,
                        parentId: clientId.toString(),
                        parentType: 'client'
                    };
                    let contactModel = new ContactModel();
                    let contactsResult = await contactModel.getContacts(params);
                    _contacts = contactsResult.results;
                } catch(error) {
                    errors.push(error);
                }
            }
    
            //EEEEE V   V EEEEE N   N TTTTT  OOO   SSSS
            //E     V   V E     NN  N   T   O   O S
            //EEE   V   V EEE   N N N   T   O   O  SSS
            //E      V V  E     N  NN   T   O   O     S
            //EEEEE   V   EEEEE N   N   T    OOO  SSSS

            let _events: any[] = [];
            if(typeof clientId === 'number') {
                try {
                    let params = {
                        parentId: clientId.toString(),
                        parentType: 'client',
                        sort: { "field": "createdAt", "type": "DESC" }
                    };
                    let eventModel = new EventModel();
                    _events = await eventModel.getEvents(params);
                } catch(error) {
                    errors.push(error);
                }
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            let result: any = _client.data;
            result['address'] = defaultAddress;
            result['addresses'] = addresses;
            result['contacts'] = _contacts || [];
            result['events'] = _events || [];
            if(errors.length > 0) {
                result['errors'] = errors;
            }
            return resolve(result);
        });
    }
    
    public getClients(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.clients.getClients, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Clientes',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Clientes',
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

    public postClient(body: any, files?: Express.Multer.File[]): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { accountingData: _accountingData, businessData: _businessData, personalData: _personalData, address, contact, events, ...client }:
                { _accountigData: AccountingData, _businessData: BusinessData, _personalData: PersonalData, address: Address, contact: Contact | Contact[], events: Event[]} & Client = body;

            // AAA  RRRR   CCCC H   H IIIII V   V  OOO   SSSS
            //A   A R   R C     H   H   I   V   V O   O S
            //AAAAA RRRR  C     HHHHH   I   V   V O   O  SSS
            //A   A R   R C     H   H   I    V V  O   O     S
            //A   A R   R  CCCC H   H IIIII   V    OOO  SSSS

            // Variables
            let id = body.folio;
            let category = 'clients';
            let company = configuration.company.name;
            let filesURLs: string[] = [];
            if(files){
                try {
                    let fileModel = new FilesModel();
                    let _files: any = await fileModel.postFiles(files, id, category, company);
                    _files.forEach((file: any) => {
                        filesURLs.push(file.path);
                    });
                } catch(exception) {
                    return reject({
                        status: 417,
                        module: 'Clientes',
                        message: 'Ocurrió un error al intentar guardar los archivos.',
                        error: exception
                    });
                }
            }

            //U   U L     TTTTT IIIII M   M  OOO       FFFFF  OOO  L     IIIII  OOO
            //U   U L       T     I   MM MM O   O      F     O   O L       I   O   O
            //U   U L       T     I   M M M O   O      FFF   O   O L       I   O   O
            //U   U L       T     I   M   M O   O      F     O   O L       I   O   O
            // UUU  LLLLL   T   IIIII M   M  OOO       F      OOO  LLLLL IIIII  OOO
            
            let lastFolio: number = 1;
            if(typeof client.folio === 'number' && client.folio > 0) {
                lastFolio = client.folio;
            } else {
                let query: any = {
                    limit: 1,
                    page: 1,
                    sort: { "field": "folio", "type": "DESC" }                
                };
                try {
                    let _clients = await this.getClients(query);
                    if(Array.isArray(_clients.results) && _clients.results.length > 0) {
                        lastFolio = _clients.results[0].folio + 1;
                    }
                } catch(error) {
                    return reject(error);
                }
            }
            
            // CCCC  OOO  M   M PPPP  L     EEEEE TTTTT  AAA  RRRR       IIIII N   N FFFFF  OOO  RRRR  M   M  AAA   CCCC IIIII  OOO  N   N
            //C     O   O MM MM P   P L     E       T   A   A R   R        I   NN  N F     O   O R   R MM MM A   A C       I   O   O NN  N
            //C     O   O M M M PPPP  L     EEE     T   AAAAA RRRR         I   N N N FFF   O   O RRRR  M M M AAAAA C       I   O   O N N N
            //C     O   O M   M P     L     E       T   A   A R   R        I   N  NN F     O   O R   R M   M A   A C       I   O   O N  NN
            // CCCC  OOO  M   M P     LLLLL EEEEE   T   A   A R   R      IIIII N   N F      OOO  R   R M   M A   A  CCCC IIIII  OOO  N   N

            // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
            // Por nueva disposición, la dirección va a ser opcional.
            // ¯\_ʕ•ᴥ•ʔ_/¯
            if(!isEmpty(address)) {
                if(typeof address.extraDetails !== 'string' || address.extraDetails.length === 0) {
                    if(typeof address.zipCode === 'number' && typeof address.settlement === 'string') {
                        
                        //U   U BBBB  IIIII  CCCC  AAA   CCCC IIIII  OOO  N   N
                        //U   U B   B   I   C     A   A C       I   O   O NN  N
                        //U   U BBBB    I   C     AAAAA C       I   O   O N N N
                        //U   U B   B   I   C     A   A C       I   O   O N  NN
                        // UUU  BBBB  IIIII  CCCC A   A  CCCC IIIII  OOO  N   N
    
                        let zipCodeModel = new ZipCodeModel();
                        let zipCodes: any;
                        let location: any = {};
                        try {
                            zipCodes = await zipCodeModel.getZipCodes({ zipCode: address.zipCode });
                        } catch(error) {
                            // FIX:
                            // No se rechaza por el momento (por cargas masivas).
                            // return reject(error);
                        }
                        // a) Existe más de una ubicación y se deben filtrar.
                        // b) Existe sólo una ubicación y esa se utiliza.
                        if(Array.isArray(zipCodes) && zipCodes.length > 1) {
                            // Existe más de una ubicación y se deben filtrar.
                            let filteredZipCodes: Array<any> = zipCodes.filter((zipCode: any, index: number) => {
                                let weight: number = percentFound(zipCode.name, address.settlement);
                                zipCodes[index].weight = weight;
                                return weight > 0;
                            });
                            filteredZipCodes.sort((a: any, b: any) => {
                                return b.weight - a.weight;
                            });
                            location = filteredZipCodes[0];
                            if(location) {
                                if(filteredZipCodes.length > 0) {
                                    address.settlement = location.name;
                                    address.extraDetails = location._id;
                                }
                            } else {
                                // FIX:
                                // No se rechaza por el momento (por cargas masivas).
                                // return reject({
                                //     status: 404,
                                //     message: 'No se pudo encontrar una ubicación (ubicación vacía).'
                                // });
                            }
                        } else if(Array.isArray(zipCodes) && zipCodes.length === 1) {
                            // Existe sólo una ubicación y esa se utiliza.
                            location = zipCodes[0];
                            address.settlement = location.name;
                            address.extraDetails = location._id;
                        } else {
                            // FIX:
                            // No se rechaza por el momento (por cargas masivas).
                            // return reject({
                            //     status: 404,
                            //     message: 'No se pudo encontrar una ubicación (arreglo vacío).'
                            // });
                        }
    
                        // CCCC  OOO   OOO  RRRR  DDDD  EEEEE N   N  AAA  DDDD   AAA   SSSS
                        //C     O   O O   O R   R D   D E     NN  N A   A D   D A   A S
                        //C     O   O O   O RRRR  D   D EEE   N N N AAAAA D   D AAAAA  SSS
                        //C     O   O O   O R   R D   D E     N  NN A   A D   D A   A     S
                        // CCCC  OOO   OOO  R   R DDDD  EEEEE N   N A   A DDDD  A   A SSSS
                        
                        try {
                            let google = new Google();
                            let coordinates = await google.getCoordinatesFromAddress({
                                street: address.street,
                                outdoorNumber: address.outdoorNumber,
                                interiorNumber: address.interiorNumber,
                                settlement: location.settlement.name,
                                town: location.town.name,
                                state: location.state.name,
                                country: location.country.name,
                                zipCode: address.zipCode.toString()
                            });
                            let geometry = coordinates[0].geometry;
                            let latitude = geometry.location.lat;
                            let longitude = geometry.location.lng;
                            // Latitud.
                            address.latitude = latitude;
                            // Longitud.
                            address.longitude = longitude;
                            // Punto.
                            address['loc'] = { type: 'Point', coordinates: [longitude, latitude] };
                        } catch(error) {
                            // FIX:
                            // No se rechaza por el momento (por cargas masivas).
                            // return reject(error);
                        }
                    } else {
                        // FIX:
                        // No se rechaza por el momento (por cargas masivas).
                        return reject({
                            status: 404,
                            module: 'Clientes',
                            message: 'No se pudo obtener la información de la dirección de la cuenta y ésta está incompleta.'
                        });
                    }
                }
                
                // CCCC  OOO   OOO  RRRR  DDDD  EEEEE N   N  AAA  DDDD   AAA   SSSS
                //C     O   O O   O R   R D   D E     NN  N A   A D   D A   A S
                //C     O   O O   O RRRR  D   D EEE   N N N AAAAA D   D AAAAA  SSS
                //C     O   O O   O R   R D   D E     N  NN A   A D   D A   A     S
                // CCCC  OOO   OOO  R   R DDDD  EEEEE N   N A   A DDDD  A   A SSSS
                
                if(typeof address.latitude !== 'number' || typeof address.longitude !== 'number') {
                    let locations: Array<ILocation> = [];
                    let zipCodeModel = new ZipCodeModel();
                    try {
                        locations = await zipCodeModel.getZipCodes({ _id: address.extraDetails });
                    } catch(error) {}
                    if(locations.length === 1) {
                        try {
                            let google = new Google();
                            let coordinates = await google.getCoordinatesFromAddress({
                                street: address.street,
                                outdoorNumber: address.outdoorNumber,
                                interiorNumber: address.interiorNumber,
                                settlement: locations[0].settlement.name,
                                town: locations[0].town.name,
                                state: locations[0].state.name,
                                country: locations[0].country.name,
                                zipCode: address.zipCode.toString()
                            });
                            let geometry = coordinates[0].geometry;
                            let latitude = geometry.location.lat;
                            let longitude = geometry.location.lng;
                            // Latitud.
                            address.latitude = latitude;
                            // Longitud.
                            address.longitude = longitude;
                            // Punto.
                            address['loc'] = { type: 'Point', coordinates: [longitude, latitude] };
                        } catch(error) {
                            // FIX:
                            // No se rechaza por el momento (por cargas masivas).
                            // return reject(error);
                        }
                    }
                }
            }
            
            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
            
            let errors: Array<any> = [];
            client.folio = lastFolio;
            // CLIENTE.
            let clientErrors: any = await this.validateSchemas(_accountingData, _businessData, _personalData, client);
            errors = errors.concat(clientErrors);
            // DIRECCIÓN.
            // FIX:
            let isAddressOK: boolean = true;
            // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
            // Por nueva disposición, la dirección va a ser opcional.
            // ¯\_ʕ•ᴥ•ʔ_/¯
            if(!isEmpty(address)) {
                // address = address || {};
                address.parentType = 'client';
                address.parentId = client.folio.toString();
                // address.typeValue = 'default';
                // Análisis y modificación de datos.
                try {
                    address.zipCode = parseInt(address.zipCode.toString());
                    address.longitude = parseFloat(address.longitude.toString());
                    address.latitude = parseFloat(address.latitude.toString());
                } catch(error) {}
                let addressModel = new AddressModel(address || {});
                let addressErrors: any = await addressModel.validate();
                // No se rechaza por el momento (por cargas masivas).
                errors = errors.concat(addressErrors);
            }
            // FIX:
            // if(Array.isArray(addressErrors) && addressErrors.length > 0) isAddressOK = false;
            // CONTACTO.
            let goodContacts: Array<Contact> = [];
            let badContacts: Array<any> = [];
            let contactModel = new ContactModel();
            if(Array.isArray(contact) && contact.length > 0) {
                let index: number = 1;
                for(const _contact of contact) {
                    _contact.parentType = 'client';
                    _contact.parentId = client.folio.toString();
                    try {
                        delete _contact._id;
                    } catch(error) {}
                    contactModel.contact = _contact;
                    let contactErrors: any = await contactModel.validate();
                    if(Array.isArray(contactErrors) && contactErrors.length > 0) {
                        badContacts.push({
                            event: index,
                            errors: contactErrors
                        });
                    } else {
                        goodContacts.push(_contact);
                    }
                    index++;
                }
            } else if(!isEmpty(contact)) {
                contact = contact as Contact;
                // contact = contact || new Contact();
                contact.parentType = 'client';
                contact.parentId = client.folio.toString();
                try {
                    delete contact._id;
                } catch(error) {}
                contactModel.contact = contact;
                let contactErrors: any = await contactModel.validate();
                if(Array.isArray(contactErrors) && contactErrors.length > 0) {
                    badContacts.push({
                        event: 1,
                        errors: contactErrors
                    });
                } else {
                    goodContacts.push(contact);
                }
            }
            // EVENTOS.
            // NOTE: Los errores en los eventos no se registran, sólo se guardan los eventos buenos.
            let goodEvents: Array<Event> = [];
            let badEvents: Array<any> = [];
            let eventModel = new EventModel();
            if(Array.isArray(events) && events.length > 0) {
                let index: number = 1;
                for(const event of events) {
                    event['parentType'] = 'account';
                    event['parentId'] = client.folio.toString();
                    eventModel.event = event;
                    let eventErrors = await eventModel.validate();
                    // errors = errors.concat(eventErrors);
                    if(Array.isArray(eventErrors) && eventErrors.length === 0) {
                        goodEvents.push(event);
                    } else if(Array.isArray(eventErrors) && eventErrors.length > 0) {
                        badEvents.push({
                            event: index,
                            errors: eventErrors
                        });
                    }
                    index++;
                }
            }
            // Si ocurrió algún error se termina la función.
            if(errors.length > 0) {
                let response: any = {
                    module: 'Clientes',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            }

            //M   M IIIII  CCCC RRRR   OOO   SSSS EEEEE RRRR  V   V IIIII  CCCC IIIII  OOO   SSSS
            //MM MM   I   C     R   R O   O S     E     R   R V   V   I   C       I   O   O S
            //M M M   I   C     RRRR  O   O  SSS  EEE   RRRR  V   V   I   C       I   O   O  SSS
            //M   M   I   C     R   R O   O     S E     R   R  V V    I   C       I   O   O     S
            //M   M IIIII  CCCC R   R  OOO  SSSS  EEEEE R   R   V   IIIII  CCCC IIIII  OOO  SSSS

            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
    
            let _client: Client = new Client();
            let data: any = client;
            data['accountingData'] = _accountingData;
            data['businessData'] = _businessData;
            data['personalData'] = _personalData;
            data['files'] = filesURLs;
            try {
                let postClient: AxiosResponse<any> = await axios.post(configuration.services.domain.clients.postClient, data);
                _client = postClient.data;
            } catch(error) {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Clientes',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
                        status: 400,
                        module: 'Clientes',
                        message: 'Ocurrió un error al intentar guardar la información (CLIENTE).',
                        error: idx(error, _ => _.response.data) || error
                    });
                }
            }
    
            //DDDD  IIIII RRRR  EEEEE  CCCC  CCCC IIIII  OOO  N   N
            //D   D   I   R   R E     C     C       I   O   O NN  N
            //D   D   I   RRRR  EEE   C     C       I   O   O N N N
            //D   D   I   R   R E     C     C       I   O   O N  NN
            //DDDD  IIIII R   R EEEEE  CCCC  CCCC IIIII  OOO  N   N
    
            let _address: Address = new Address();
            // FIX:
            // No se hace la inserción si la información de la dirección es incorrecta.
            // if(isAddressOK) {
                // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                // Por nueva disposición, la dirección va a ser opcional.
                // ¯\_ʕ•ᴥ•ʔ_/¯
                if(!isEmpty(address)) {
                    try {
                        let addressModel = new AddressModel();
                        _address = await addressModel.postAddress(address);
                    } catch(error) {
                        errors.push(error);
                    }
                }
            // }
    
            // CCCC  OOO  N   N TTTTT  AAA   CCCC TTTTT  OOO   SSSS
            //C     O   O NN  N   T   A   A C       T   O   O S
            //C     O   O N N N   T   AAAAA C       T   O   O  SSS
            //C     O   O N  NN   T   A   A C       T   O   O     S
            // CCCC  OOO  N   N   T   A   A  CCCC   T    OOO  SSSS
    
            let _contacts: { status: number, message: string, data: Array<Contact>, good: any, bad: any } = { status: 200, message: '', data: [], good: {}, bad: {} };
            try {
                _contacts = await contactModel.postContacts({ contacts: goodContacts });
            } catch(error) {
                errors.push(error);
            }
    
            //EEEEE V   V EEEEE N   N TTTTT  OOO   SSSS
            //E     V   V E     NN  N   T   O   O S
            //EEE   V   V EEE   N N N   T   O   O  SSS
            //E      V V  E     N  NN   T   O   O     S
            //EEEEE   V   EEEEE N   N   T    OOO  SSSS

            let _events: { status: number, message: string, data: Array<Contact>, good: any, bad: any } = { status: 200, message: '', data: [], good: {}, bad: {} };
            try {
                _events = await eventModel.postEvents(goodEvents);
            } catch(error) {
                errors.push(error);
            }

            //U   U  SSSS U   U  AAA  RRRR  IIIII  OOO
            //U   U S     U   U A   A R   R   I   O   O
            //U   U  SSS  U   U AAAAA RRRR    I   O   O
            //U   U     S U   U A   A R   R   I   O   O
            // UUU  SSSS   UUU  A   A R   R IIIII  OOO

            let _user: ClientUser = new ClientUser();
            let userCreatedSuccessfully: boolean = false;
            let clientUserModel: ClientUserModel = new ClientUserModel();
            try {
                _user = await clientUserModel.postUser({
                    folio: client.folio,
                    password: Buffer.from(client.folio.toString()).toString('base64'), // btoa(client.folio.toString()),
                    statusValue: 'new'
                });
                userCreatedSuccessfully = true;
            } catch(error) {
                errors.push(error);
            }

            //EEEEE M   M  AAA  IIIII L
            //E     MM MM A   A   I   L
            //EEE   M M M AAAAA   I   L
            //E     M   M A   A   I   L
            //EEEEE M   M A   A IIIII LLLLL

            if(userCreatedSuccessfully) {
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
                } catch(error) {
                    // TODO: Avisar que ocurrió un error al enviar el correo.
                    errors.push(error);
                }
            }

            //ZZZZZ EEEEE N   N DDDD  EEEEE  SSSS K   K
            //   Z  E     NN  N D   D E     S     K  K
            //  Z   EEE   N N N D   D EEE    SSS  KKK
            // Z    E     N  NN D   D E         S K  K
            //ZZZZZ EEEEE N   N DDDD  EEEEE SSSS  K   K

            // NOTE: Zendesk no cuenta con un sandbox de pruebas, por lo que las llamadas son directo a producción.
            let environment: string = process.env.NODE_ENV || 'development';
            if(environment.toLowerCase().trim() === 'production') {
                let zendeskModel: ZendeskModel = new ZendeskModel();
                try {
                    await zendeskModel.postClient({ folio: _client.folio });
                } catch(error) {
                    errors.push(error);
                }
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
    
            let result: any = _client;
            result['address'] = _address || {};
            result['contacts'] = _contacts.data;
            result['events'] = _events.data;
            if(errors.length > 0) {
                result['errors'] = {
                    errors,
                    badEvents
                };
            }
            return resolve(result);
        });
    }

    public postFiles(folio: string, files: Express.Multer.File[]): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            // AAA  RRRR   CCCC H   H IIIII V   V  OOO   SSSS
            //A   A R   R C     H   H   I   V   V O   O S
            //AAAAA RRRR  C     HHHHH   I   V   V O   O  SSS
            //A   A R   R C     H   H   I    V V  O   O     S
            //A   A R   R  CCCC H   H IIIII   V    OOO  SSSS

            // Variables
            let id = folio;
            let category = 'clients';
            let company = configuration.company.name;
            let filesURLs: string[] = [];
            if(files && files.length > 0){
                try {
                    // console.log(`Folio: ${folio}; Cantidad de archivos: ${files.length}.`);
                    let fileModel = new FilesModel();
                    let _files: any = await fileModel.postFiles(files, id, category, company);
                    _files.forEach((file: any) => {
                        filesURLs.push(file.path);
                    });
                } catch(error) {
                    return reject(error);
                }
            } else {
                return reject({
                    status: 404,
                    module: 'Clientes',
                    message: 'No se encontró ningún archivo en la petición.'
                });
            }

            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
    
            let data: any = { folio };
            data['files'] = filesURLs;
            axios.post(configuration.services.domain.clients.files.postFiles, data)
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Clientes',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Clientes',
	                    message: 'Ocurrió un error al intentar actualizar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });    
        });
    }

    public postClients(body: any, file: Express.Multer.File): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { isTest, clients, ...rest }: { isTest: boolean, clients: Array<Client> } & any = body;
            isTest = isTest ? JSON.parse(isTest) : false;

            //JJJJJ  SSSS  OOO  N   N
            //  J   S     O   O NN  N
            //  J    SSS  O   O N N N
            //J J       S O   O N  NN
            // J    SSSS   OOO  N   N

            let items: Array<Client> = [];
            if(file) {
                try {
                    items = JSON.parse(file.buffer.toString('utf8'));
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Clientes',
                        message: 'No se pudo leer la información del archivo.',
                        error
                    });
                }
            } else {
                if(Array.isArray(clients) && clients.length > 0) {
                    items = clients;
                } else {
                    return reject({
                        status: 404,
                        module: 'Clientes',
                        message: 'No se encontró un archivo ni una lista de registros en la petición.'
                    });
                }
            }            
            
            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T
            
            let goodRecords: Array<Client> = [];
            let badRecords: Array<Client> = [];
            let errors: Array<any> = [];
            for(const client of items) {
                // Análisis y transformación de datos.
                try {
                    // Se eliminan todas las llaves cuyo valor sea exactamente "undefined" ó "null".
                    // Cliente.
                    Object.keys(client).forEach((key: string) => (client[key] === undefined || client[key] === null) && delete client[key]);
                    // Datos de cuenta.
                    if(client.accountingData instanceof AccountingData) {
                        // @ts-ignore
                        Object.keys(client.accountingData).forEach((key: string) => (client.accountingData[key] === undefined || client.accountingData[key] === null) && delete client.accountingData[key]);
                    }
                    // Datos de empresa.
                    if(client.businessData instanceof BusinessData) {
                        // @ts-ignore
                        Object.keys(client.businessData).forEach((key: string) => (client.businessData[key] === undefined || client.businessData[key] === null) && delete client.businessData[key]);
                    }
                    // Datos personales.
                    if(client.personalData instanceof PersonalData) {
                        // @ts-ignore
                        Object.keys(client.personalData).forEach((key: string) => (client.personalData[key] === undefined || client.personalData[key] === null) && delete client.personalData[key]);
                    }
                } catch(error) {}
                // Se intenta guardar la información.
                try {
                    await this.postClient(client);
                    goodRecords.push(client);
                } catch(error) {
                    errors.push(error);
                    badRecords.push(client);
                }
            }
            if(goodRecords.length === 0) {
                return reject({
                    status: 400,
                    module: 'Clientes',
                    message: 'Ocurrió un error al intentar guardar la información, no se pudo insertar ningún registro (CLIENTES).',
                    good: {
                        total: goodRecords.length
                    },
                    bad: {
                        total: badRecords.length,
                        records: badRecords
                    },
                    errors
                });
            } else {
                return resolve({
                    status: badRecords.length === 0 ? 200 : 206,
                    message: `Clientes | Información guardada con éxito.\nClientes guardados: ${goodRecords.length - badRecords.length}.\nClientes que no se pudieron guardar: ${badRecords.length}`,
                    good: {
                        total: goodRecords.length
                    },
                    bad: {
                        total: badRecords.length,
                        records: badRecords
                    },
                    errors
                });
            }
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putClient(body: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { id, _id, accountingData: _accountingData, businessData: _businessData, personalData: _personalData, ...client } = body;
            let errors: any = await this.validateSchemas(_accountingData, _businessData, _personalData, client, ['PUT']);
            if(errors.length > 0) {
                let response: any = {
                    module: 'Clientes',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                let data: any = client;
                data._id = _id || id;
                data['accountingData'] = _accountingData;
                data['businessData'] = _businessData;
                data['personalData'] = _personalData;
                axios.put(configuration.services.domain.clients.putClient, data)
                .then( async (response: any) => {
                    try {
                        // Se obtienen la información completa de nuevo.
                        // TODO: Crear filtros con el número de cuenta o con el identificador de la cuenta.
                        let newData = await this.getClient({ folio: idx(response, _ => _.data.folio)});
                        return resolve(newData);
                    } catch(error) {
                        return resolve(idx(response, _ => _.data) || {});
                    }
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Clientes',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Clientes',
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

    public deleteClient(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let errors: Array<any> = [];
            
            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
    
            let clientId: string = '';
            let clientFolio: number = -1;
            let _client: any = {};
            try {
                _client = await axios.get(configuration.services.domain.clients.getClient, { params: query });
                if(_client.data) {
                    clientId = _client.data._id;
                    clientFolio = _client.data.folio;
                    await axios.delete(configuration.services.domain.clients.deleteClient, { params: query });
                }
            } catch(error) {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Clientes',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Clientes',
	                    message: 'Ocurrió un error al intentar borrar la información (CLIENTE).',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            }
            
            //DDDD  IIIII RRRR  EEEEE  CCCC  CCCC IIIII  OOO  N   N
            //D   D   I   R   R E     C     C       I   O   O NN  N
            //D   D   I   RRRR  EEE   C     C       I   O   O N N N
            //D   D   I   R   R E     C     C       I   O   O N  NN
            //DDDD  IIIII R   R EEEEE  CCCC  CCCC IIIII  OOO  N   N
    
            try {
                let params = {
                    parentType: 'client',
                    parentId: clientId
                };
                let addressModel = new AddressModel();
                let deletedAddress = await addressModel.deleteAddress(params);
            } catch(error) {
                errors.push(error);
            }
    
            // CCCC  OOO  N   N TTTTT  AAA   CCCC TTTTT  OOO   SSSS
            //C     O   O NN  N   T   A   A C       T   O   O S
            //C     O   O N N N   T   AAAAA C       T   O   O  SSS
            //C     O   O N  NN   T   A   A C       T   O   O     S
            // CCCC  OOO  N   N   T   A   A  CCCC   T    OOO  SSSS
    
            // TODO: Generar recurso para eliminación masiva de contactos.
            try {
                let params = {
                    parentType: 'client',
                    parentId: clientId
                };
                let contactModel = new ContactModel();
                await contactModel.deleteContact(params);
            } catch(error) {
                errors.push(error);
            }

            // TODO: Agregar eliminación de EVENTOS.
    
            // AAA  RRRR   CCCC H   H IIIII V   V  OOO   SSSS
            //A   A R   R C     H   H   I   V   V O   O S
            //AAAAA RRRR  C     HHHHH   I   V   V O   O  SSS
            //A   A R   R C     H   H   I    V V  O   O     S
            //A   A R   R  CCCC H   H IIIII   V    OOO  SSSS

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
    
            let result: any = {
                folio: clientFolio,
                message: 'Registro eliminado con éxito.'
            }
            if(errors.length > 0) {
                result['errors'] = errors;
            }
            return resolve(result);
        });
    }

    public deleteFiles(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            // AAA  RRRR   CCCC H   H IIIII V   V  OOO   SSSS
            //A   A R   R C     H   H   I   V   V O   O S
            //AAAAA RRRR  C     HHHHH   I   V   V O   O  SSS
            //A   A R   R C     H   H   I    V V  O   O     S
            //A   A R   R  CCCC H   H IIIII   V    OOO  SSSS
            
            let { folio, files } = query;
            // console.log(files);
            // return resolve({
            //     message: 'OK'
            // });
            let filesError: any;
            try {
                let filesModel = new FilesModel();
                await filesModel.deleteFiles(files);
            } catch(error) {
                // console.log(error);
                // return reject(idx(error, _ => _.response.data) || {
                //     status: 417,
                //     message: 'Ocurrió un error al intentar borrar la información (ARCHIVOS).',
                //     error
                // });
                filesError = error;
            }
            
            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
    
            axios.delete(configuration.services.domain.clients.files.deleteFiles, { params: { folio, files } })
            .then((response: any) => {
                let result: any = idx(response, _ => _.data) || {};
                result.errors = filesError;
                return resolve(result);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Clientes',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Clientes',
	                    message: 'Ocurrió un error al intentar borrar la información (CLIENTE).',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    
}