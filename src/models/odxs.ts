// Módulos
import axios from 'axios';
import idx from 'idx';
import { validate, IsDefined, IsArray, IsMongoId, IsDateString, IsString, MaxLength, IsEnum, IsNumber, Min } from 'class-validator';
import { PDFFormat } from 'puppeteer';
// Modelos.
import AccountModel, { Account } from './accounts';
import AccountProcessesModel from './processes/accounts';
import { Client } from './clients';
import EventModel, { Event } from './events';
import FilesModel from './files';
import { Product, ProductModel } from './products';
import ReceiptModel, { Receipt, Item } from './receipts';
import UserModel from '../models/users';
import ZendeskModel, { IClient, Ticket } from './zendesk';
// Funciones.
import { currencyFormat, number2Words } from '../scripts/numbers';
import { date2StringFormat, number2Month, date2String } from '../scripts/dates';
import { isEmpty } from '../scripts/object-prototypes';
import { pdf2Base64 } from '../classes/pdf';
import { RemodelErrors } from '../scripts/data-management';
// Configuración.
import configuration from '../configuration';

//EEEEE V   V IIIII DDDD  EEEEE N   N  CCCC IIIII  AAA
//E     V   V   I   D   D E     NN  N C       I   A   A
//EEE   V   V   I   D   D EEE   N N N C       I   AAAAA
//E      V V    I   D   D E     N  NN C       I   A   A
//EEEEE   V   IIIII DDDD  EEEEE N   N  CCCC IIIII A   A

const EvidenceType: Array<string> = ['INST','DOCU','TEST','SIGN'];

class Evidence {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['PUT']
    })
    _id: string;
    // Tipo.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsEnum(EvidenceType, {
        message: 'El valor asignado no se encuentra dentro del listado válido.',
        groups: ['POST', 'PUT']
    })
    type: string;
    // URL.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    url: string
}

// CCCC  AAA  RRRR   GGGG  OOO   SSSS
//C     A   A R   R G     O   O S
//C     AAAAA RRRR  G  GG O   O  SSS
//C     A   A R   R G   G O   O     S
// CCCC A   A R   R  GGGG  OOO  SSSS

class ChargeDetail {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    _id: string;
    // Cantidad.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    amount: number;
    // Tipo de cargo.
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
    chargeTypeValue: string;
}

class ChargeType {
    // Cantidad.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    amount: number;
    // Nombre / descripción del cargo.
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
    name: string;
    // Valor (id).
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
    value: string;
}

// OOO  DDDD  X   X
//O   O D   D  X X
//O   O D   D   X
//O   O D   D  X X
// OOO  DDDD  X   X

export class ODX {
    // Folio.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    folio: number;
    // Fecha y hora de inicio.
    @IsDateString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    startedAt: string;
    // Fecha y hora de término.
    @IsDateString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    finishedAt: string;
    // Estatus.
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
    statusValue: string;
    // Tipo.
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
    typeValue: string;
    // Evidencia.
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    evidence: Array<Evidence>;
    // Técnico asignado.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    technicalUser: string;
    // Usuario de soporte asignado.
    // @IsDefined({
    //     message: 'El campo es requerido.',
    //     groups: ['POST']
    // })
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    supportUser: string;
    // Identificador de la cuenta.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    account: string | Account;
    // Arreglo de eventos.
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    events: Array<Event>;
    // Detalle de los cargos.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    chargeDetails: Array<ChargeDetail>;
    // Equipo(s) instalado(s).
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    installedEquipment: Array<string>;
    // Comentarios.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(200, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    comments: string;
}

interface IReceiptWithOptions extends Receipt {
    isFromInstallation?: boolean;
}

export default class ODXModel {

    //Propiedades.
    private odx: any;

    // Constructor.
    constructor(odx?: any) {
        this.odx = odx;
    }

    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchemas(this.odx);
    }

    private async validateSchemas(_odx: any = {}, groups: Array<string> = ['POST']): Promise<any> {
        let errors: Array<any> = [];
        // ODX.
        let odx = new ODX();
        odx.folio = _odx.folio;
        odx.startedAt = _odx.startedAt;
        odx.finishedAt = _odx.finishedAt;
        odx.statusValue = _odx.statusValue;
        odx.evidence = _odx.evidence;
        odx.technicalUser = _odx.technicalUser;
        odx.supportUser = _odx.supportUser;
        odx.account = _odx.account;
        odx.events = _odx.events;
        odx.typeValue = _odx.typeValue;
        odx.chargeDetails = _odx.chargeDetails;
        odx.installedEquipment = _odx.installedEquipment;
        odx.comments = _odx.comments;
        let odxErrors = await validate(odx, { groups, skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(odxErrors, 'odx'));
        // EVIDENCIAS.
        if(Array.isArray(odx.evidence) && odx.evidence.length > 0) {
            let index: number = 0;
            for(const _evidence of odx.evidence) {
                let evidence = new Evidence();
                evidence.type = _evidence.type;
                evidence.url = _evidence.url;
                let evidenceErrors = await validate(evidence, { groups, skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(evidenceErrors, `odx.evidence[${index}]`));
                index++;
            }
        }
        // CARGOS.
        if(Array.isArray(odx.chargeDetails) && odx.chargeDetails.length > 0) {
            let index: number = 0;
            for(const _chargeDetail of odx.chargeDetails) {
                let chargeDetail = new ChargeDetail();
                chargeDetail.amount = _chargeDetail.amount;
                chargeDetail.chargeTypeValue = _chargeDetail.chargeTypeValue;
                let chargeDetailErrors = await validate(chargeDetail, { groups, skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(chargeDetailErrors, `odx.chargeDetails[${index}]`));
                index++;
            }
        }
        // Resultado.
        return errors;
    }

    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getODXS(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.odx.getODXS, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'ODX',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'ODX',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public getODX(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let errors: Array<any> = [];

            // OOO  DDDD  X   X
            //O   O D   D  X X
            //O   O D   D   X
            //O   O D   D  X X
            // OOO  DDDD  X   X

            let _odx: ODX = new ODX();
            let technicalUser: string = '';
            let supportUser: string = '';
            let accountNumber: string = '';
            try {
                let _odxResult = await axios.get(configuration.services.domain.odx.getODX, { params: query });
                _odx = _odxResult.data;
                technicalUser = _odx.technicalUser;
                supportUser = _odx.supportUser;
                accountNumber = _odx.account as string;
            } catch(error) {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'ODX',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
                        status: 400,
                        module: 'ODX',
                        message: 'Ocurrió un error al intentar obtener la información.',
                        error: idx(error, _ => _.response.data) || error
                    });
                }
            }

            //TTTTT EEEEE  CCCC N   N IIIII  CCCC  OOO
            //  T   E     C     NN  N   I   C     O   O
            //  T   EEE   C     N N N   I   C     O   O
            //  T   E     C     N  NN   I   C     O   O
            //  T   EEEEE  CCCC N   N IIIII  CCCC  OOO

            let userModel = new UserModel();
            let _technicalUser: any = {};
            if(typeof technicalUser === 'string' && technicalUser.length > 0) {
                try {
                    _technicalUser = await userModel.getUser({ _id: technicalUser });
                } catch(error) {
                    errors.push(error);
                }
            }

            // SSSS  OOO  PPPP   OOO  RRRR  TTTTT EEEEE
            //S     O   O P   P O   O R   R   T   E
            // SSS  O   O PPPP  O   O RRRR    T   EEE
            //    S O   O P     O   O R   R   T   E
            //SSSS   OOO  P      OOO  R   R   T   EEEEE

            let _supportUser: any = {};
            if(typeof supportUser === 'string' && supportUser.length > 0) {
                try {
                    _supportUser = await userModel.getUser({ _id: supportUser });
                } catch(error) {
                    errors.push(error);
                }
            }

            //PPPP  RRRR   OOO  DDDD  U   U  CCCC TTTTT  OOO   SSSS
            //P   P R   R O   O D   D U   U C       T   O   O S
            //PPPP  RRRR  O   O D   D U   U C       T   O   O  SSS
            //P     R   R O   O D   D U   U C       T   O   O     S
            //P     R   R  OOO  DDDD   UUU   CCCC   T    OOO  SSSS

            // TODO: Por ahora no se tiene conexión con los productos, se devuelven los equipos instalados como van.
            // let _installedEquipment: Array<any> = [];
            // let productModel: ProductModel = new ProductModel();
            // if(Array.isArray(_odx.installedEquipment) && _odx.installedEquipment.length > 0) {
            //     for(const _equipmentId of _odx.installedEquipment) {
            //         try {
            //             let equipment = await productModel.getProduct({ _id: _equipmentId });
            //             _installedEquipment.push(equipment);
            //         } catch(error) {
            //             errors.push(error);
            //         }
            //     }
            // }

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let account: Account = new Account();
            let accountModel: AccountModel = new AccountModel();
            try {
                account = await accountModel.getAccount({ accountNumber });
            } catch(error) {

            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            let result: any = _odx;
            // TODO: Por ahora no se tiene conexión con los productos, se devuelven los equipos instalados como van.
            // result['installedEquipment'] = _installedEquipment;
            result['technicalUser'] = _technicalUser;
            result['supportUser'] = _supportUser;
            result['account'] = account;
            if (errors.length > 0){
                result['errors'] = errors;
            }
            return resolve(result);
        });
    }

    public getEvidence(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.odx.evidence.getEvidence, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'ODX | Evidencia',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'ODX | Evidencia',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public getChargeDetails(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.odx.chargeDetails.getChargeDetails, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'ODX | Cargos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'ODX | Cargos',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public getPDFromODX(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { _id, id, folio, ...rest } = query;

            // OOO  DDDD  X   X
            //O   O D   D  X X
            //O   O D   D   X
            //O   O D   D  X X
            // OOO  DDDD  X   X

            let odx: ODX = new ODX();
            try {
                odx = await this.getODX({ _id, folio });
            } catch(error) {
                return reject(error);
            }

            // CCCC U   U EEEEE N   N TTTTT  AAA       Y   Y       CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     U   U E     NN  N   T   A   A       Y Y       C     L       I   E     NN  N   T   E
            //C     U   U EEE   N N N   T   AAAAA        Y        C     L       I   EEE   N N N   T   EEE
            //C     U   U E     N  NN   T   A   A        Y        C     L       I   E     N  NN   T   E
            // CCCC  UUU  EEEEE N   N   T   A   A       YYY        CCCC LLLLL IIIII EEEEE N   N   T   EEEEE

            let account: Account = new Account();
            let client: Client = new Client();
            account = odx.account as Account;
            client = account.client || new Client();
            /*
            try {
                let accountModel = new AccountModel();
                account = await accountModel.getAccount({ accountNumber: odx.account });
                client = account.client || new Client();
            } catch(error) {
                return reject(error);
            }
            */

            //TTTTT IIIII PPPP   OOO       DDDD  EEEEE       OOO  DDDD  X   X
            //  T     I   P   P O   O      D   D E          O   O D   D  X X
            //  T     I   PPPP  O   O      D   D EEE        O   O D   D   X
            //  T     I   P     O   O      D   D E          O   O D   D  X X
            //  T   IIIII P      OOO       DDDD  EEEEE       OOO  DDDD  X   X

            let orderType: 'installation' | 'service' | 'work' | 'addressUpdate' | 'equipmentCollection' = 'work';
            let templateURL: string = '../templates/type_wo.ejs';
            let paperSize: PDFFormat = 'Letter';
            // TODO: Agregar tipos de ODX en el catálogo de tipos.
            // ODT === Trabajo / Instalación
            // ODS === Servicio
            // ODR === Recolección
            // ODC === Cambio de domicilio
            switch(odx.typeValue.trim().toUpperCase()) {
                case 'ODS':
                    // Servicio técnico.
                    orderType = 'service';
                    templateURL = '../templates/wo.service.ejs';
                    paperSize = 'Letter';
                    break;
                case 'ODR':
                    // Recolección de equipo.
                    orderType = 'equipmentCollection';
                    templateURL = '../templates/wo.equipment.pickup.ejs';
                    paperSize = 'Letter';
                    break;
                case 'ODC':
                    // Cambio de domicilio.
                    orderType = 'addressUpdate';
                    templateURL = '../templates/wo.address.update.ejs';
                    paperSize = 'Letter';
                    break;
                case 'ODT':
                default:
                    // Instalación.
                    orderType = 'installation';
                    templateURL = '../templates/type_wo.ejs';
                    paperSize = 'Legal';
                    break;
            }

            //PPPP  DDDD  FFFFF
            //P   P D   D F
            //PPPP  D   D FFF
            //P     D   D F
            //P     DDDD  F

            let pdfToBase64: string ='';
            try {

                //IIIII N   N FFFFF  OOO  RRRR  M   M  AAA   CCCC IIIII  OOO  N   N       GGGG EEEEE N   N EEEEE RRRR   AAA  L
                //  I   NN  N F     O   O R   R MM MM A   A C       I   O   O NN  N      G     E     NN  N E     R   R A   A L
                //  I   N N N FFF   O   O RRRR  M M M AAAAA C       I   O   O N N N      G  GG EEE   N N N EEE   RRRR  AAAAA L
                //  I   N  NN F     O   O R   R M   M A   A C       I   O   O N  NN      G   G E     N  NN E     R   R A   A L
                //IIIII N   N F      OOO  R   R M   M A   A  CCCC IIIII  OOO  N   N       GGGG EEEEE N   N EEEEE R   R A   A LLLLL

                // Dirección.
                let address: any = account.address;
                let location: any = address.extraDetails;
                let address1: string = `${address.street || ''}, ${address.outdoorNumber || 'S/N'}, ${idx(location, _ => _.name) || ''}`;
                let address2: string = `C.P.: ${address.zipCode}, ${idx(location, _ => _.town.name) || ''}, ${idx(location, _ => _.state.name) || ''}`;
                // Referencias de pago.
                let paymentReferences: string[] = [];
                if(Array.isArray(account.paymentReferences) && account.paymentReferences.length > 0) {
                    for(const reference of account.paymentReferences) {
                        switch(reference.referenceName) {
                            case 'BBVA Bancomer':
                                paymentReferences[1] = reference.reference;
                                break;
                            case 'Banco del Bajío':
                                paymentReferences[0] = reference.reference;
                                break;
                        }
                    }
                }
                // Contactos.
                let clientEmail: string = '';
                let contacts: Array<{ contactMeanName: string, phone: string }> = [];
                if(Array.isArray(account.contacts) && account.contacts.length > 0) {
                    for(const contact of account.contacts.results) {
                        if(Array.isArray(contact.contactMeans) && contact.contactMeans.length > 0) {
                            for(const contactMean of contact.contactMeans) {
                                if(contactMean.notify === true && ['fixedPhone', 'mobilePhone'].indexOf(contactMean.contactMeanName) >= 0) {
                                    contacts.push({
                                        contactMeanName: contactMean.contactMeanName,
                                        phone: contactMean.value
                                    });
                                }
                                if(contactMean.notify === true && contactMean.contactMeanName === 'email') clientEmail = contactMean.value;
                            }
                        }
                    }
                } else {
                    // Se agrega un contacto vacío.
                    contacts.push({
                        contactMeanName: '',
                        phone: ''
                    });
                }
                // Especificaciones del producto.
                let productSpecifications: { speedDown: string, speedUp: string} = {
                    speedDown: '',
                    speedUp: ''
                };
                let accountProduct: Product = new Product();
                if(account.product) accountProduct = account.product;
                if(Array.isArray(accountProduct.specifications) && accountProduct.specifications.length > 0) {
                    for(const specification of accountProduct.specifications) {
                        if(specification.value.toLowerCase() === 'speeddown') productSpecifications.speedDown = specification.value;
                        if(specification.value.toLowerCase() === 'speedup') productSpecifications.speedUp = specification.value;
                    }
                }
                // Costo de instalación.
                let installationCost: { cost: number, costInText: string} = {
                    cost: 0,
                    costInText: ''
                };
                // Costo total.
                let odxTotal: number = 0;
                if(Array.isArray(odx.chargeDetails) && odx.chargeDetails.length > 0) {
                    for(const chargeDetail of odx.chargeDetails) {
                        odxTotal += chargeDetail.amount || 0;
                        if(chargeDetail.chargeTypeValue === 'installation') {
                            installationCost = {
                                cost: chargeDetail.amount ? parseFloat(chargeDetail.amount.toFixed(2)) : 0,
                                costInText: number2Words(chargeDetail.amount ? parseFloat(chargeDetail.amount.toFixed(2)) : 0)
                            };
                        }
                    }
                }
                odxTotal = parseFloat(odxTotal.toFixed(2));

                //EEEEE JJJJJ  SSSS
                //E       J   S
                //EEE     J    SSS
                //E     J J       S
                //EEEEE  J    SSSS

                // Datos completos.
                let ejsData: any = {
                    account: {
                        accountNumber: account.accountNumber,
                        total: account.total,
                        productName: account.productName,
                        contacts,
                        // @ts-ignore
                        type: account.type,
                        product: account.product,
                        productSpecifications,
                        paymentReferences,
                        equipment: account.equipment || '',
                        address,
                        address1,
                        address2,
                        zipCode: address.zipCode,
                        isForcedTerm: account.isForcedTerm,
                        forcedTermValue: account.forcedTermValue
                    },
                    client: {
                        firstName: `${client.firstName}${(typeof client.secondName === 'string' && client.secondName.length > 0) ? ` ${client.secondName}`: ''}`,
                        lastName: `${client.firstLastName}${(typeof client.secondLastName === 'string' && client.secondLastName.length > 0) ? ` ${client.secondLastName}` : ''}`,
                        businessData: client.businessData,
                        // businessData.businessName
                        // businessData.paymentForm
                        // businessData.issuingBankName
                        // businessData.issuingAccountNumber
                        rfc: idx(client, _ => _.businessData.rfc) || '',
                        email: clientEmail
                    },
                    document: {
                        page: 1,
                        totalPages: 1
                    },
                    odx: {
                        folio: odx.folio,
                        installation: {
                            cost: `$${currencyFormat.format(installationCost.cost)}`,
                            costInText: installationCost.costInText,
                            difference: `$${currencyFormat.format(10000 - installationCost.cost)}`
                        },
                        installedEquipment: odx.installedEquipment || [],
                        technicalUser: {
                            // @ts-ignore
                            name: `${odx.technicalUser.firstName || ''} ${odx.technicalUser.lastName || ''}`
                        },
                        // WARNING: Dato faltante:
                        createdBy: '',
                        startedAtDate: odx.startedAt ? date2StringFormat(new Date(odx.startedAt), 'DD-MM-YYYY') : '',
                        startedAtTime: odx.startedAt ? date2StringFormat(new Date(odx.startedAt), 'hh:mm:ss') : '',
                        finishedAt: odx.finishedAt ? date2StringFormat(new Date(odx.finishedAt), 'DD-MM-YYYY') : '',
                        // @ts-ignore
                        createdAt: date2StringFormat(new Date(odx.createdAt), 'DD-MM-YYYY'),
                        total: `$${currencyFormat.format(odxTotal)}`,
                        subTotal: `$${currencyFormat.format(odxTotal * 1.16)}`,
                        statusValue: odx.statusValue,
                        comments: odx.comments || ''
                    }
                };

                //EEEEE  SSSS PPPP  EEEEE  CCCC IIIII FFFFF IIIII  CCCC  AAA
                //E     S     P   P E     C       I   F       I   C     A   A
                //EEE    SSS  PPPP  EEE   C       I   FFF     I   C     AAAAA
                //E         S P     E     C       I   F       I   C     A   A
                //EEEEE SSSS  P     EEEEE  CCCC IIIII F     IIIII  CCCC A   A

                // Notas del producto.
                // WARNING: Datos faltantes.
                // Producto.
                ejsData.account.product.amount = 1;
                ejsData.account.product.notes = '';
                // WARNING: Datos faltantes.
                // ODX.
                ejsData.odx.changeType = { name: '' };
                ejsData.odx.relocationType = { name: '' };
                ejsData.odx.deliveryType = { name: '' };
                ejsData.odx.cablingType = { name: '' };
                ejsData.odx.antennaMovement = '';
                ejsData.odx.other = '';

                //PPPP  DDDD  FFFFF
                //P   P D   D F
                //PPPP  D   D FFF
                //P     D   D F
                //P     DDDD  F

                let pdfToBase64Result = await pdf2Base64(templateURL, ejsData, paperSize);
                pdfToBase64 = pdfToBase64Result.data;
                return resolve({
                    pdf: pdfToBase64
                });
            } catch(error) {
                return reject(error);
            }
        });
    }

    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postODX(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { ...odx }: ODX = body;
            
            //U   U L     TTTTT IIIII M   M  OOO       N   N U   U M   M EEEEE RRRR   OOO
            //U   U L       T     I   MM MM O   O      NN  N U   U MM MM E     R   R O   O
            //U   U L       T     I   M M M O   O      N N N U   U M M M EEE   RRRR  O   O
            //U   U L       T     I   M   M O   O      N  NN U   U M   M E     R   R O   O
            // UUU  LLLLL   T   IIIII M   M  OOO       N   N  UUU  M   M EEEEE R   R  OOO
            
            let folio: number = 1;
            let query: any = {
                limit: 1,
                page: 1,
                sort: { "field": "folio", "type": "DESC" }
            };
            try {
                let _odxs = await this.getODXS(query);
                if(Array.isArray(_odxs.results) && _odxs.results.length > 0) {
                    folio = parseInt(_odxs.results[0].folio) + 1;
                } else {
                    folio = 1;
                }
            } catch(error) {
                return reject(error);
            }

            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
    
            let errors: Array<any> = [];
            // ODX.
            odx.folio = folio;
            let odxErrors: any = await this.validateSchemas(odx);
            errors = errors.concat(odxErrors);
            // Si ocurrió algún error se termina la función.
            if(errors.length > 0) {
                let response: any = {
                    module: 'ODX',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            }

            // OOO  DDDD  X   X
            //O   O D   D  X X
            //O   O D   D   X
            //O   O D   D  X X
            // OOO  DDDD  X   X

            odx.evidence = [];
            axios.post(configuration.services.domain.odx.postODX, odx)
            .then( async (response: any) => {

                let newODX: ODX = response.data as ODX;

                //EEEEE M   M  AAA  IIIII L          Y   Y      TTTTT IIIII  CCCC K   K EEEEE TTTTT
                //E     MM MM A   A   I   L           Y Y         T     I   C     K  K  E       T
                //EEE   M M M AAAAA   I   L            Y          T     I   C     KKK   EEE     T
                //E     M   M A   A   I   L            Y          T     I   C     K  K  E       T
                //EEEEE M   M A   A IIIII LLLLL       YYY         T   IIIII  CCCC K   K EEEEE   T

                let errors: Array<any> = [];
                if(newODX.typeValue === 'ODT') {
                    
                    //EEEEE M   M  AAA  IIIII L
                    //E     MM MM A   A   I   L
                    //EEE   M M M AAAAA   I   L
                    //E     M   M A   A   I   L
                    //EEEEE M   M A   A IIIII LLLLL

                    let data: any = {
                        accountNumber: newODX.account,
                        // attachments,
                        template: 'client_odt',
                        content: [
                            {
                                name: 'folio',
                                content: newODX.folio
                            },
                            {
                                name: 'accountNumber',
                                content: newODX.account
                            },
                        ],
                        subject: 'Domain Telecomunicaciones, le da la ¡bienvenida!'
                    };
                    let accountProcessesModel: AccountProcessesModel = new AccountProcessesModel();
                    try {
                        await accountProcessesModel.sendEmail(data);
                    } catch(error) {
                        // TODO: Avisar que ocurrió un error al enviar el correo.
                        errors.push(error);
                    }
                    
                    //TTTTT IIIII  CCCC K   K EEEEE TTTTT
                    //  T     I   C     K  K  E       T
                    //  T     I   C     KKK   EEE     T
                    //  T     I   C     K  K  E       T
                    //  T   IIIII  CCCC K   K EEEEE   T

                    //TTTTT IIIII PPPP   OOO
                    //  T     I   P   P O   O
                    //  T     I   PPPP  O   O
                    //  T     I   P     O   O
                    //  T   IIIII P      OOO

                    // NOTE: Ahora quieren que sólo cuando sea una orden de instalación se genere un ticket, ¿por qué? sólo ellos lo saben.
                    // NOTE: El nombre del producto a agregar en el recibo depende del tipo de orden.
                    let type: string = 'instalación';
                    // ODT === Trabajo / Instalación
                    // ODS === Servicio
                    // ODR === Recolección
                    // ODC === Cambio de domicilio
                    /*
                    switch(odx.typeValue) {
                        case 'ODT':
                            type = 'instalación';
                            break;
                        case 'ODS':
                            type = 'servicio';
                            break;
                        case 'ODR':
                            type = 'recolección';
                            break;
                        case 'ODC':
                            type = 'cambio de domicilio';
                            break;
                    }
                    */

                    //ZZZZZ EEEEE N   N DDDD  EEEEE  SSSS K   K
                    //   Z  E     NN  N D   D E     S     K  K
                    //  Z   EEE   N N N D   D EEE    SSS  KKK
                    // Z    E     N  NN D   D E         S K  K
                    //ZZZZZ EEEEE N   N DDDD  EEEEE SSSS  K   K

                    // NOTE: Zendesk no cuenta con un sandbox de pruebas, por lo que las llamadas son directo a producción.
                    let environment: string = process.env.NODE_ENV || 'development';
                    if(environment.toLowerCase().trim() === 'production') {

                        // CCCC U   U EEEEE N   N TTTTT  AAA
                        //C     U   U E     NN  N   T   A   A
                        //C     U   U EEE   N N N   T   AAAAA
                        //C     U   U E     N  NN   T   A   A
                        // CCCC  UUU  EEEEE N   N   T   A   A

                        let account: Account = new Account();
                        let client: Client = new Client();
                        let accountModel: AccountModel = new AccountModel();
                        try {
                            account = await accountModel.getAccount({ accountNumber: newODX.account });
                            client = account.client || new Client();
                            // console.log(client.folio);
                        } catch(error) {}

                        //TTTTT IIIII  CCCC K   K EEEEE TTTTT
                        //  T     I   C     K  K  E       T
                        //  T     I   C     KKK   EEE     T
                        //  T     I   C     K  K  E       T
                        //  T   IIIII  CCCC K   K EEEEE   T

                        let zendeskModel: ZendeskModel = new ZendeskModel();
                        // TODO: Obtener el identificador ante Zendesk del cliente.
                        if(client.folio) {
                            let clientId: number = 0;
                            try {
                                let clientZ: { results: Array<IClient>, facets: any, next_page: any, previous_page: any, count: any } = await zendeskModel.getClient({ external_id: client.folio });
                                if(clientZ.results.length > 0) clientId = clientZ.results[0].id || 0;
                                // console.log(clientId);
                            } catch(error) {
                                errors.push(error);
                            }
                            try {
                                let ticket: Ticket = {
                                    external_id: newODX.folio.toString(),
                                    subject: `Se creó una orden de ${type} para la cuenta ${newODX.account}.`,
                                    type: 'task',
                                    priority: 'normal',
                                    status: 'new',
                                    submitter_id: 402536272273,
                                    // assignee_id: 402536272273,
                                    group_id: 360008440134
                                };
                                if(clientId > 0) ticket.requester_id = clientId;
                                // console.log(ticket);
                                await zendeskModel.postTicket(ticket);
                            } catch(error) {
                                errors.push(error);
                            }
                        }
                    }

                }

                //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                //R   R E     S     U   U L       T   A   A D   D O   O
                //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                //R   R E         S U   U L       T   A   A D   D O   O
                //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
        
                let result: any = newODX;
                if(errors.length > 0) result.errors = errors;
                return resolve(result);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'ODX',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
                        status: 400,
                        module: 'ODX',
                        message: 'Ocurrió un error al intentar guardar la (ODX).',
                        error: idx(error, _ => _.response.data) || error
                    });
                }
            });
        });
    }

    public postODXs(body: any, file: Express.Multer.File): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //JJJJJ  SSSS  OOO  N   N
            //  J   S     O   O NN  N
            //  J    SSS  O   O N N N
            //J J       S O   O N  NN
            // J    SSSS   OOO  N   N

            let items: Array<ODX> = [];
            if(file) {
                try {
                    items = JSON.parse(file.buffer.toString('utf8'));
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'ODX',
                        message: 'No se pudo leer la información del archivo.',
                        error
                    });
                }
            } else {
                return reject({
                    status: 404,
                    module: 'ODX',
                    message: 'No se encontró un archivo en la petición.'
                });
            }
            
            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T
        
            // ESPARTANO.
            // Se insertan uno a uno.
            let goodRecords: Array<ODX> = [];
            let badRecords: Array<ODX> = [];
            let errors: Array<any> = [];
            for(const odx of items) {
                
                // CCCC U   U EEEEE N   N TTTTT  AAA
                //C     U   U E     NN  N   T   A   A
                //C     U   U EEE   N N N   T   AAAAA
                //C     U   U E     N  NN   T   A   A
                // CCCC  UUU  EEEEE N   N   T   A   A

                if((typeof odx.account === 'string' && odx.account.match(/^[0-9]+$/g) !== null) || typeof odx.account === 'number') {
                    // La cuenta para el movimiento es de tipo LEGACY y se debe obtener el número nuevo.
                    try {
                        let accountModel: AccountModel = new AccountModel();
                        let _account: Account = await accountModel.getAccount({ legacyId: odx.account });
                        odx.account = _account.accountNumber;
                    } catch(error) {
                        badRecords.push(odx);
                        continue;
                    }
                }
                // Se guarda la información.
                try {
                    await this.postODX(odx);
                    goodRecords.push(odx);
                } catch(error) {
                    errors.push(error);
                    badRecords.push(odx);
                }
            }
            if(goodRecords.length === 0) {
                return reject({
                    status: 400,
                    module: 'ODX',
                    message: 'Ocurrió un error al intentar guardar la información, no se pudo insertar ningún registro (CUENTAS).',
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
                    message: `Información guardada con éxito.\nCuentas guardadas: ${goodRecords.length - badRecords.length}.\nCuentas que no se pudieron guardar: ${badRecords.length}`,
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

    public postODXApproval(body: any, user?: string): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { folio, ...rest } = body;

            // OOO  DDDD  X   X
            //O   O D   D  X X
            //O   O D   D   X
            //O   O D   D  X X
            // OOO  DDDD  X   X

            let odx: ODX = new ODX();
            let accountNumber: string = '';
            try {
                odx = await this.getODX({ folio });
                accountNumber = (odx.account as Account).accountNumber;
            } catch(error) {
                return reject(error);
            }
            // Validaciones.
            // a) Que tenga fecha de inicio y de fin.
            let validationErrors: Array<any> = [];
            if(typeof odx.startedAt != 'string' || odx.startedAt.length === 0) {
                validationErrors.push({
                    property: 'startedAt',
                    message: 'El campo es obligatorio.'
                });
            }
            if(typeof odx.finishedAt != 'string' || odx.finishedAt.length === 0) {
                validationErrors.push({
                    property: 'finishedAt',
                    message: 'El campo es obligatorio.'
                });
            }
            // b) Que la fecha de inicio sea menor a la fecha de fin.
            let startedAt: Date = new Date(odx.startedAt);
            let finishedAt: Date = new Date(odx.finishedAt);
            if(startedAt > finishedAt) {
                validationErrors.push({
                    property: 'startedAt|finishedAt',
                    message: 'La fecha de inicio no puede ser menor a la fecha de término.'
                });
            }
            // c) Que tenga un técnico asignado.
            // @ts-ignore
            if(typeof odx.technicalUser !== 'object' || !odx.technicalUser.hasOwnProperty('_id')) {
                validationErrors.push({
                    property: 'technicalUser',
                    message: 'El campo es obligatorio.'
                });
            }
            // ¿Existen errores?
            if(validationErrors.length > 0) {
                console.log(validationErrors);
                return reject({
                    status: 400,
                    error: validationErrors
                });
            }
            if(typeof accountNumber === 'string' && accountNumber.length > 0) {
                // 1. Se actualiza el estatus de la ODX.
                try {
                    await this.putODX({ folio, statusValue: 'approved' });
                } catch(error) {
                    return reject(error);
                }
                // 2. Se actualiza la cuenta a la que está asociada.
                let isInstallation: boolean = false;
                let installationCharge: number = 0;
                if(Array.isArray(odx.chargeDetails) && odx.chargeDetails.length > 0) {
                    for(const chargeDetail of odx.chargeDetails) {
                        if(chargeDetail.chargeTypeValue === 'installation' || chargeDetail.chargeTypeValue === 'express_installation') {
                            isInstallation = true;
                            installationCharge = chargeDetail.amount;
                            break;
                        }
                    }
                    // Si la ODX fue de instalación se debe actualizar la cuenta.
                    if(isInstallation) {

                        let activatedAt: string = date2StringFormat(finishedAt);
                        let errors: Array<any> = [];

                        // CCCC U   U EEEEE N   N TTTTT  AAA
                        //C     U   U E     NN  N   T   A   A
                        //C     U   U EEE   N N N   T   AAAAA
                        //C     U   U E     N  NN   T   A   A
                        // CCCC  UUU  EEEEE N   N   T   A   A

                        let account: Account = new Account();
                        let accountModel: AccountModel = new AccountModel();
                        try {
                            account = await accountModel.getAccount({ accountNumber });
                        } catch(error) {
                            return reject(error);
                        }
                        if(account.statusValue != 'active') {
                            // let activatedAt: string = date2StringFormat(new Date());
                            let params: any = {
                                accountNumber,
                                activatedAt,
                                statusValue: 'active'
                            };
                            try {
                                account = await accountModel.putAccount(params);
                            } catch(error) {
                                return reject(error);
                            }
                        } else {
                            let result: any = Object.assign({}, odx);
                            // console.log('Resuelto (SIN GARGOS NI ACTIVACIÓN).');
                            return resolve(result);
                        }
                        
                        // CCCC U   U EEEEE N   N TTTTT  AAA       M   M  AAA  EEEEE  SSSS TTTTT RRRR   AAA
                        //C     U   U E     NN  N   T   A   A      MM MM A   A E     S       T   R   R A   A
                        //C     U   U EEE   N N N   T   AAAAA      M M M AAAAA EEE    SSS    T   RRRR  AAAAA
                        //C     U   U E     N  NN   T   A   A      M   M A   A E         S   T   R   R A   A
                        // CCCC  UUU  EEEEE N   N   T   A   A      M   M A   A EEEEE SSSS    T   R   R A   A

                        let masterAccount: Account = new Account();
                        if(account.masterReference && typeof account.masterReference === 'string' && account.masterReference.length > 0) {
                            try {
                                masterAccount = await accountModel.getAccount({ accountNumber: account.masterReference });
                            } catch(error) {
                                return reject(error);
                            }
                        } else {
                            masterAccount = account;
                        }

                        //RRRR  EEEEE  CCCC IIIII BBBB   OOO
                        //R   R E     C       I   B   B O   O
                        //RRRR  EEE   C       I   BBBB  O   O
                        //R   R E     C       I   B   B O   O
                        //R   R EEEEE  CCCC IIIII BBBB   OOO

                        // 1. Se revisa que no exista ya un recibo pendiente de instalación.
                        let receiptModel: ReceiptModel = new ReceiptModel();
                        // NOTE: El cargo por instalación puede ir en un recibo del tipo mensual o de tipo manual.
                        // a) Manual.
                        try {
                            let params = { 
                                parentId: masterAccount.accountNumber,
                                // statusValue: 'pending',
                                typeValue: 'manual',
                                operationType: 'installation',
                                operationId: odx.folio
                            };
                            let getReceipt: { results: Array<Receipt>, summary: any } = await receiptModel.getReceipts(params);
                            if(getReceipt.results.length > 0) {
                                // NOTE: No se debe rechazar toda la operación, simplemente no se debe agregar el cargo y ya.
                                // return reject({
                                //     status: 400,
                                //     message: `Ya existe un recibo de instalación pendiente para la cuenta ${masterAccount.accountNumber}.`
                                // });
                                installationCharge = 0;
                            }
                        } catch(error) {
                            return reject(error);
                        }
                        // b) Mensual.
                        if(installationCharge === 0) {
                            try {
                                let params = { 
                                    parentId: masterAccount.accountNumber,
                                    // statusValue: 'pending',
                                    typeValue: 'monthly',
                                    operationType: 'installation',
                                    operationId: odx.folio
                                };
                                let getReceipt: { results: Array<Receipt>, summary: any } = await receiptModel.getReceipts(params);
                                if(getReceipt.results.length > 0) {
                                    // NOTE: No se debe rechazar toda la operación, simplemente no se debe agregar el cargo y ya.
                                    // return reject({
                                    //     status: 400,
                                    //     message: `Ya existe un recibo de instalación pendiente para la cuenta ${masterAccount.accountNumber}.`
                                    // });
                                    installationCharge = 0;
                                }
                            } catch(error) {
                                return reject(error);
                            }
                        }
                        
                        // No crear recibo si es después del 15 de mes.
                        // Generar evento, describiendo que se cobrará el proporcional si es después del 15.
                        let dayOfMonth: number = finishedAt.getDate();
                        // console.log(`Día del mes: ${dayOfMonth}`);
                        // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                        // Se obtienen el mes y el año de término de instalación, para calcular el adeudo total.
                        // "¿Por qué?" preguntas, "por que aprueban las órdenes meses después de que se instaló"...
                        // "¿Por qué?" preguntas de nuevo, y con justa razón, "por que pues $#&%@ tu madre, por eso".
                        let month: number = finishedAt.getMonth();
                        let year: number = finishedAt.getFullYear();
                        // console.log(`Mes: ${month}`);
                        // console.log(`Año: ${year}`);
                        // Fecha actual.
                        let today = new Date();
                        // CASO (A)
                        // Se instaló el mismo mes.
                        if(month === today.getMonth() && year === today.getFullYear()) {

                            // console.log('Se terminó este mes (Y).');

                            // Si se activó después del día 15, se debe generar el recibo.
                            if(dayOfMonth < 15) {
                                let getReceipt: { receipt: Receipt, slaveAccounts: Array<Account> };
                                let receipt: IReceiptWithOptions = new Receipt();
                                try {
                                    getReceipt = await accountModel.getAccountReceipt({ accountNumber: masterAccount.accountNumber });
                                    receipt = getReceipt.receipt;
                                } catch(error) {
                                    return reject(error);
                                }

                                //IIIII N   N  SSSS TTTTT  AAA  L      AAA   CCCC IIIII  OOO  N   N
                                //  I   NN  N S       T   A   A L     A   A C       I   O   O NN  N
                                //  I   N N N  SSS    T   AAAAA L     AAAAA C       I   O   O N N N
                                //  I   N  NN     S   T   A   A L     A   A C       I   O   O N  NN
                                //IIIII N   N SSSS    T   A   A LLLLL A   A  CCCC IIIII  OOO  N   N

                                // Se revisa si se debe agregar algún cargo por instalación.
                                if(installationCharge > 0) {
                                    // 1. Se agrega el nuevo item a los existentes.
                                    let unitCost: number = parseFloat((installationCharge / 1.16).toFixed(2));
                                    let installationItem: Item = {
                                        productName: `Instalación.`,
                                        quantity: 1,
                                        discount: 0,
                                        unitCost,
                                        total: unitCost
                                    };
                                    receipt.items.push(installationItem);
                                    // 2. Se modifican los totales del recibo.
                                    let subTotal: number = receipt.subTotal;
                                    subTotal += unitCost;
                                    let taxes: number = parseFloat((subTotal * 0.16).toFixed(2));
                                    let total: number = parseFloat((subTotal + taxes).toFixed(2));
                                    receipt.subTotal = subTotal;
                                    receipt.taxes = taxes;
                                    receipt.total = total;
                                    // 3. Se modifican también el estatus y la información de la operación.
                                    // receipt.typeValue = 'manual';
                                    receipt.operationType = 'installation';
                                    receipt.operationId = odx.folio.toString();
                                }

                                // Se guarda el recibo.
                                // TODO: Debe ser proporcional.
                                let receiptModel: ReceiptModel = new ReceiptModel();
                                try {
                                    receipt.isFromInstallation = true;
                                    await receiptModel.postReceipt(receipt);
                                } catch(error) {
                                    errors.push(error);
                                }
                            } else {
                                // Si es después, se debe agregar un evento informativo.

                                // NOTE: Aunque también se debe revisar si se va a crear al menos el cargo de instalacción:
                                
                                //IIIII N   N  SSSS TTTTT  AAA  L      AAA   CCCC IIIII  OOO  N   N
                                //  I   NN  N S       T   A   A L     A   A C       I   O   O NN  N
                                //  I   N N N  SSS    T   AAAAA L     AAAAA C       I   O   O N N N
                                //  I   N  NN     S   T   A   A L     A   A C       I   O   O N  NN
                                //IIIII N   N SSSS    T   A   A LLLLL A   A  CCCC IIIII  OOO  N   N

                                // Se revisa si se debe agregar algún cargo por instalación.
                                let installationEvent: string = ``;
                                if(installationCharge > 0) {
                                    installationEvent = ` Se generó solamente un cargo por instalación.`;
                                    // 1. Se crea el arreglo de conceptos.
                                    let unitCost: number = parseFloat((installationCharge / 1.16).toFixed(2));
                                    let items: Array<Item> = [{
                                        productName: `Instalación.`,
                                        quantity: 1,
                                        discount: 0,
                                        unitCost,
                                        total: unitCost
                                    }];
                                    // 2. Se modifican los totales del recibo.
                                    let subTotal: number = unitCost;
                                    let taxes: number = parseFloat((subTotal * 0.16).toFixed(2));
                                    let total: number = parseFloat((subTotal + taxes).toFixed(2));
                                    // 3. Se crea el Recibo.
                                    // @ts-ignore
                                    let receipt: IReceiptWithOptions = {
                                        parentId: masterAccount.accountNumber,
                                        parentType: 'account',
                                        // folio                        // El campo se agrega en la operación del POST.
                                        // movementDate                 // El campo se agrega en la operación del POST.
                                        items,
                                        total,
                                        subTotal,
                                        taxes,
                                        discount: 0,
                                        exchangeRate: 1,
                                        statusValue: 'pending',
                                        typeValue: 'manual',
                                        // receiptFile                  // El campo se agrega en la operación del POST.
                                        // invoice                      // El campo se agrega en la operación del POST.
                                        // previousBalance              // El campo se agrega en la operación del POST.
                                        operationType: 'installation',
                                        operationId: odx.folio.toString()
                                    };
                                    try {
                                        receipt.isFromInstallation = true;
                                        await receiptModel.postReceipt(receipt);
                                    } catch(error) {
                                        // return reject(error);
                                        installationEvent = ` Se debía generar un cargo por instalación solamente, pero ocurrió un error al hacerlo. Por favor genere el cargo por instalación de manera manual. Gracias :)`;
                                    }
                                }

                                // Se calcula entonces el proporcional:
                                // proporcional = (total / todos los días del mes) * total de días transcurridos.
                                let daysInMonth: number = new Date(finishedAt.getFullYear(), finishedAt.getMonth() + 1, 0).getDate();
                                let proportionalCharge: number = (account.subTotal / daysInMonth) * (daysInMonth - finishedAt.getDate());
                                proportionalCharge = proportionalCharge < 0 ? (proportionalCharge * -1) : proportionalCharge;

                                //EEEEE V   V EEEEE N   N TTTTT  OOO
                                //E     V   V E     NN  N   T   O   O
                                //EEE   V   V EEE   N N N   T   O   O
                                //E      V V  E     N  NN   T   O   O
                                //EEEEE   V   EEEEE N   N   T    OOO
                                
                                let eventModel: EventModel = new EventModel();
                                let event: Event = {
                                    parentId: (odx.account as Account).accountNumber,
                                    parentType: 'account',
                                    user: !user ? 'Olimpo' : user,
                                    description: 'Generación de cargo proporcional.',
                                    comment: `La cuenta se activó el día ${dayOfMonth}, por lo que se generará un cobro por el pago proporcional el siguiente mes por un monto de $${currencyFormat.format(proportionalCharge)}.${installationEvent}`,
                                    typeValue: 'information'
                                };
                                try {
                                    await eventModel.postEvent(event);
                                } catch(error) {
                                    errors.push(error);
                                }
                            }
                        } else {

                            // console.log('Se terminó hace más de un mes ¯\_(ツ)_/¯.');

                            // Totales generales.
                            let subTotal: number = 0;
                            let taxes: number = 0;
                            let discount: number = 0;
                            let total: number = 0;
                            // CASO (B)
                            // Se instaló antes, y hay que recorrer mes a mes hacía atrás.
                            let currentMonth: number = today.getMonth();
                            let currentYear: number = today.getFullYear();
                            // console.log(`Mes (hoy): ${currentMonth}`);
                            // console.log(`Año (hoy): ${currentYear}`);
                            // CASO (C)
                            // El mes no concuerda, por lo que se debe cobrar completo (por cada mes).
                            let items: Array<Item> = [];
                            // console.log('No se terminó en el mes en curso.');
                            // console.log(`¿Es el mismo mes? R=${currentMonth === month}`);
                            // console.log(`¿Es el mismo año? R=${currentYear === year}`);
                            // console.log(`Condición completa R=${(currentMonth !== month && currentYear !== year)}`);
                            while(currentMonth !== month || currentYear !== year) {
                                // console.log('WHILE!');
                                // Se cobra completo.
                                // Totales.
                                let itemSubTotal: number = account.subTotal ? parseFloat(account.subTotal.toFixed(2)) : 0;
                                let itemTaxes: number = account.taxes ? parseFloat(account.taxes.toFixed(2)) : 0;
                                let itemDiscount: number = account.discount ? parseFloat(account.discount.toFixed(2)) : 0;
                                // let itemTotal: number = parseFloat(((subTotal + taxes) - discount).toFixed(2));
                                // Se suman los totales del elemento a los generales.
                                subTotal = parseFloat((subTotal + itemSubTotal).toFixed(2));
                                taxes = parseFloat((taxes + itemTaxes).toFixed(2));
                                discount = parseFloat((discount + itemDiscount).toFixed(2));
                                // total = parseFloat((total + itemTotal).toFixed(2));
                                // NOTE: El nombre del producto tiene una longitud de 200.
                                let today: Date = new Date();
                                let monthName: string = number2Month((currentMonth + 1), true);
                                let proportionalMessage: string = ` (cobro del mes de ${monthName})`;
                                let newProductName: string = '';
                                if((account.productName.length + proportionalMessage.length) > 200) {
                                    let excesiveCharacters: number = ((account.productName.length + proportionalMessage.length) - 200) + 4;
                                    newProductName = account.productName;
                                    newProductName = newProductName.substr(0, (newProductName.length - excesiveCharacters));
                                    newProductName = `${newProductName}... ${proportionalMessage}`
                                } else {
                                    newProductName = `${account.productName}${proportionalMessage}`;
                                }
                                // Item.
                                // console.log({
                                //     productId: account.productId,
                                //     productName: newProductName,
                                //     quantity: 1,
                                //     unitCost: itemSubTotal,
                                //     discount,
                                //     total: itemSubTotal
                                // });
                                items.push({
                                    productId: account.productId,
                                    productName: newProductName,
                                    quantity: 1,
                                    unitCost: itemSubTotal,
                                    discount,
                                    total: itemSubTotal
                                });
                                // Al final se resta uno al mes / año.
                                currentMonth--;
                                // Se revisa que no se cambie de enero a diciembre del año anterior.
                                if(currentMonth < 0) {
                                    currentMonth = 11;
                                    currentYear--;
                                }
                            }
                            // CASO (D)
                            // Al final del ciclo, quedaremos en el mes de instalación.
                            // Si se instaló en marzo, y hoy es agosto (exagerado pero no hay que subestimar al usuario),
                            // el ciclo iría:
                            //   agosto   -->    julio   -->    junio   -->    mayo   -->    abril   -->   marzo
                            // (completo)     (completo)     (completo)     (completo)    (completo)     (termina)
                            // Por lo que estando en el mes de instalación, se debe revisar si se cobra completo o sólo el 
                            // proporcional.
                            if(currentMonth === month && currentYear === year) {
                                if(dayOfMonth < 15) {
                                    // Totales.
                                    let itemSubTotal: number = account.subTotal ? parseFloat(account.subTotal.toFixed(2)) : 0;
                                    let itemTaxes: number = account.taxes ? parseFloat(account.taxes.toFixed(2)) : 0;
                                    let itemDiscount: number = account.discount ? parseFloat(account.discount.toFixed(2)) : 0;
                                    // let itemTotal: number = parseFloat(((subTotal + taxes) - discount).toFixed(2));
                                    // Se suman los totales del elemento a los generales.
                                    subTotal = parseFloat((subTotal + itemSubTotal).toFixed(2));
                                    taxes = parseFloat((taxes + itemTaxes).toFixed(2));
                                    discount = parseFloat((discount + itemDiscount).toFixed(2));
                                    // total = parseFloat((total + itemTotal).toFixed(2));
                                    // NOTE: El nombre del producto tiene una longitud de 200.
                                    let today: Date = new Date();
                                    let monthName: string = number2Month((month + 1), true);
                                    let proportionalMessage: string = ` (cobro del mes de ${monthName})`;
                                    let newProductName: string = '';
                                    if((account.productName.length + proportionalMessage.length) > 200) {
                                        let excesiveCharacters: number = ((account.productName.length + proportionalMessage.length) - 200) + 4;
                                        newProductName = account.productName;
                                        newProductName = newProductName.substr(0, (newProductName.length - excesiveCharacters));
                                        newProductName = `${newProductName}... ${proportionalMessage}`
                                    } else {
                                        newProductName = `${account.productName}${proportionalMessage}`;
                                    }
                                    // Item.
                                    // console.log({
                                    //     productId: account.productId,
                                    //     productName: newProductName,
                                    //     quantity: 1,
                                    //     unitCost: itemSubTotal,
                                    //     discount,
                                    //     total: itemSubTotal
                                    // });
                                    items.push({
                                        productId: account.productId,
                                        productName: newProductName,
                                        quantity: 1,
                                        unitCost: itemSubTotal,
                                        discount,
                                        total: itemSubTotal
                                    });
                                } else {
                                    // Se calcula entonces el proporcional:
                                    // proporcional = (total / todos los días del mes) * total de días transcurridos.
                                    let daysInMonth: number = new Date(finishedAt.getFullYear(), finishedAt.getMonth() + 1, 0).getDate();
                                    let proportionalCharge: number = (account.subTotal / daysInMonth) * (daysInMonth - finishedAt.getDate());
                                    proportionalCharge = proportionalCharge < 0 ? (proportionalCharge * -1) : proportionalCharge;
                                    // Totales.
                                    let itemSubTotal: number = parseFloat(proportionalCharge.toFixed(2));
                                    let itemTaxes: number = parseFloat((subTotal * 0.16).toFixed(2));
                                    let itemDiscount: number = 0;                                    
                                    // let itemTotal: number = parseFloat(((subTotal + taxes) - discount).toFixed(2));
                                    // Se suman los totales del elemento a los generales.
                                    subTotal = parseFloat((subTotal + itemSubTotal).toFixed(2));
                                    taxes = parseFloat((taxes + itemTaxes).toFixed(2));
                                    discount = parseFloat((discount + itemDiscount).toFixed(2));
                                    // total = parseFloat((total + itemTotal).toFixed(2));
                                    // NOTE: El nombre del producto tiene una longitud de 200.
                                    let today: Date = new Date();
                                    let monthName: string = number2Month((month + 1), true);
                                    let proportionalMessage: string = ` (proporcional del mes de ${monthName})`;
                                    let newProductName: string = '';
                                    if((account.productName.length + proportionalMessage.length) > 200) {
                                        let excesiveCharacters: number = ((account.productName.length + proportionalMessage.length) - 200) + 4;
                                        newProductName = account.productName;
                                        newProductName = newProductName.substr(0, (newProductName.length - excesiveCharacters));
                                        newProductName = `${newProductName}... ${proportionalMessage}`
                                    } else {
                                        newProductName = `${account.productName}${proportionalMessage}`;
                                    }
                                    // Item.
                                    items.push({
                                        productId: account.productId,
                                        productName: newProductName,
                                        quantity: 1,
                                        discount: 0,
                                        unitCost: itemSubTotal,
                                        total: itemSubTotal
                                    });
                                }
                            }
                            
                            //RRRR  EEEEE  CCCC IIIII BBBB   OOO
                            //R   R E     C       I   B   B O   O
                            //RRRR  EEE   C       I   BBBB  O   O
                            //R   R E     C       I   B   B O   O
                            //R   R EEEEE  CCCC IIIII BBBB   OOO
                            
                            let movementDate: string = date2String(new Date());
                            total = parseFloat(((subTotal + taxes) - discount).toFixed(2));
                            let receipt: IReceiptWithOptions = {
                                parentId: masterAccount.accountNumber,
                                parentType: 'account',
                                // @ts-ignore
                                folio: null,
                                movementDate,
                                items,
                                total,
                                subTotal,
                                taxes,
                                discount,
                                exchangeRate: 1,
                                currencyValue: 'MXN',
                                statusValue: 'pending',
                                typeValue: 'monthly'
                            };
                            
                            //IIIII N   N  SSSS TTTTT  AAA  L      AAA   CCCC IIIII  OOO  N   N
                            //  I   NN  N S       T   A   A L     A   A C       I   O   O NN  N
                            //  I   N N N  SSS    T   AAAAA L     AAAAA C       I   O   O N N N
                            //  I   N  NN     S   T   A   A L     A   A C       I   O   O N  NN
                            //IIIII N   N SSSS    T   A   A LLLLL A   A  CCCC IIIII  OOO  N   N

                            // Se revisa si se debe agregar algún cargo por instalación.
                            if(installationCharge > 0) {
                                // 1. Se agrega el nuevo item a los existentes.
                                let unitCost: number = parseFloat((installationCharge / 1.16).toFixed(2));
                                let installationItem: Item = {
                                    productName: `Instalación.`,
                                    quantity: 1,
                                    discount: 0,
                                    unitCost,
                                    total: unitCost
                                };
                                receipt.items.push(installationItem);
                                // 2. Se modifican los totales del recibo.
                                let subTotal: number = receipt.subTotal;
                                subTotal += unitCost;
                                let taxes: number = parseFloat((subTotal * 0.16).toFixed(2));
                                let total: number = parseFloat((subTotal + taxes).toFixed(2));
                                receipt.subTotal = subTotal;
                                receipt.taxes = taxes;
                                receipt.total = total;
                                // 3. Se modifican también el estatus y la información de la operación.
                                // receipt.typeValue = 'manual';
                                receipt.operationType = 'installation';
                                receipt.operationId = odx.folio.toString();
                            }

                            // Se guarda el recibo.
                            let receiptModel: ReceiptModel = new ReceiptModel();
                            try {
                                receipt.isFromInstallation = true;
                                await receiptModel.postReceipt(receipt);
                            } catch(error) {
                                errors.push(error);
                            }
                            
                            //EEEEE V   V EEEEE N   N TTTTT  OOO
                            //E     V   V E     NN  N   T   O   O
                            //EEE   V   V EEE   N N N   T   O   O
                            //E      V V  E     N  NN   T   O   O
                            //EEEEE   V   EEEEE N   N   T    OOO
                            
                            // Días de diferencia.
                            const timeDifference = Math.abs(today.getTime() - finishedAt.getTime());
                            const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
                            let eventModel: EventModel = new EventModel();
                            let event: Event = {
                                parentId: (odx.account as Account).accountNumber,
                                parentType: 'account',
                                user: !user ? 'Olimpo' : user,
                                description: 'Generación de cargo pendiente.',
                                comment: `La cuenta se activó ${daysDifference} días después de haber sido instalada, por lo que se generó un cobro por $${currencyFormat.format(total)}.`,
                                typeValue: 'information'
                            };
                            try {
                                await eventModel.postEvent(event);
                            } catch(error) {
                                errors.push(error);
                            }
                        }

                        // CCCC  OOO  N   N TTTTT RRRR   AAA  TTTTT  OOO
                        //C     O   O NN  N   T   R   R A   A   T   O   O
                        //C     O   O N N N   T   RRRR  AAAAA   T   O   O
                        //C     O   O N  NN   T   R   R A   A   T   O   O
                        // CCCC  OOO  N   N   T   R   R A   A   T    OOO

                        try {
                            await accountModel.postContract({ accountNumber, send: true });
                        } catch(error) {
                            // TODO: Generar un evento taggeando a implementaciones: imp@domain.com

                            //EEEEE V   V EEEEE N   N TTTTT  OOO
                            //E     V   V E     NN  N   T   O   O
                            //EEE   V   V EEE   N N N   T   O   O
                            //E      V V  E     N  NN   T   O   O
                            //EEEEE   V   EEEEE N   N   T    OOO
                            
                            let eventModel: EventModel = new EventModel();
                            let event: Event = {
                                parentId: (odx.account as Account).accountNumber,
                                parentType: 'account',
                                user: !user ? 'Olimpo' : user,
                                description: 'Error al generar el contrato.',
                                comment: `Ocurrió un error al intentar generar el contrato de la cuenta. Detalles: ${JSON.stringify(error)}`,
                                typeValue: 'information'
                            };
                            try {
                                await eventModel.postEvent(event);
                            } catch(error) {
                                errors.push(error);
                            }
                        }

                        //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                        //R   R E     S     U   U L       T   A   A D   D O   O
                        //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                        //R   R E         S U   U L       T   A   A D   D O   O
                        //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
                
                        // Finalmente se devuelve la ODX actualizada.
                        let result: any = Object.assign({}, odx);
                        if(errors.length > 0) result.errors = errors;
                        // console.log('Resuelto (CON INSTALACIÓN).');
                        return resolve(result);
                    } else {
                        let result: any = Object.assign({}, odx);
                        // console.log('Resuelto (CON GARGOS).');
                        return resolve(result);
                    }
                } else {
                    let result: any = Object.assign({}, odx);
                    // console.log('Resuelto (SIN CARGOS).');
                    return resolve(result);
                }
            } else {
                return reject({
                    status: 400,
                    messate: 'ODX | La orden parece no estar asociada a ninguna cuenta.'
                })
            }
        });
    }

    public postODXReceipt(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { folio, ...rest } = body;

            // OOO  DDDD  X   X
            //O   O D   D  X X
            //O   O D   D   X
            //O   O D   D  X X
            // OOO  DDDD  X   X

            let odx: ODX = new ODX();
            let accountNumber: string = '';
            try {
                odx = await this.getODX({ folio });
                accountNumber = (odx.account as Account).accountNumber;
            } catch(error) {
                return reject(error);
            }

            // CCCC U   U EEEEE N   N TTTTT  AAA       M   M  AAA  EEEEE  SSSS TTTTT RRRR   AAA
            //C     U   U E     NN  N   T   A   A      MM MM A   A E     S       T   R   R A   A
            //C     U   U EEE   N N N   T   AAAAA      M M M AAAAA EEE    SSS    T   RRRR  AAAAA
            //C     U   U E     N  NN   T   A   A      M   M A   A E         S   T   R   R A   A
            // CCCC  UUU  EEEEE N   N   T   A   A      M   M A   A EEEEE SSSS    T   R   R A   A

            let masterAccountNumber: string = accountNumber;
            try {
                let accountModel: AccountModel = new AccountModel();
                let masterAccount: Account = await accountModel.getAccount({ accountNumber });
                if(!masterAccount.isMaster && (typeof masterAccount.masterReference === 'string' && masterAccount.masterReference.length > 0)) {
                    masterAccountNumber = masterAccount.masterReference;
                }
            } catch(error) {
                return reject(error);
            }

            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N EEEEE  SSSS
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N E     S
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N EEE    SSS
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN E         S
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N EEEEE SSSS

            // a) Tenga cargo de instalación y que este sea mayor a 0.
            // let isInstallation: boolean = false;
            // let installationCharge: ChargeDetail = new ChargeDetail();
            if(Array.isArray(odx.chargeDetails) && odx.chargeDetails.length > 0) {

                //TTTTT IIIII PPPP   OOO
                //  T     I   P   P O   O
                //  T     I   PPPP  O   O
                //  T     I   P     O   O
                //  T   IIIII P      OOO

                // NOTE: El nombre del producto a agregar en el recibo depende del tipo de orden.
                let productName: string = 'Instalación.';
                let operationType: string = 'installation';
                // ODT === Trabajo / Instalación
                // ODS === Servicio
                // ODR === Recolección
                // ODC === Cambio de domicilio
                switch(odx.typeValue) {
                    case 'ODT':
                        productName = 'Instalación';
                        operationType = 'installation';
                        break;
                    case 'ODS':
                        productName = 'Servicio';
                        operationType = 'service';
                        break;
                    case 'ODR':
                        productName = 'Recolección';
                        operationType = 'collection';
                        break;
                    case 'ODC':
                        productName = 'Cambio de domicilio';
                        operationType = 'addressChange';
                        break;
                }

                // CCCC  OOO   SSSS TTTTT  OOO
                //C     O   O S       T   O   O
                //C     O   O  SSS    T   O   O
                //C     O   O     S   T   O   O
                // CCCC  OOO  SSSS    T    OOO

                let total: number = 0;
                for(const chargeDetail of odx.chargeDetails) {
                    if(chargeDetail.chargeTypeValue === 'installation' || chargeDetail.chargeTypeValue === 'express_installation') {
                        // installationCharge = chargeDetail;
                        // if(chargeDetail.amount > 0) {
                        //     isInstallation = true;
                        // }
                        total += (typeof chargeDetail.amount === 'number' && chargeDetail.amount > 0) ? parseInt(chargeDetail.amount.toFixed(2)) : 0;
                        break;
                    }
                }
                // Si la ODX fue de instalación se debe generar el recibo.
                if(total > 0) {
                    // 1. Se revisa que no exista ya un recibo pendiente de instalación.
                    let receiptModel: ReceiptModel = new ReceiptModel();
                    try {
                        let params = { 
                            parentId: masterAccountNumber,
                            // statusValue: 'pending',
                            typeValue: 'manual',
                            operationType,
                            operationId: odx.folio
                        };
                        let getReceipt: { results: Array<Receipt>, summary: any } = await receiptModel.getReceipts(params);
                        if(getReceipt.results.length > 0) {
                            return reject({
                                status: 400,
                                message: `Ya existe un recibo de ${productName.toLowerCase()} pendiente para la cuenta ${getReceipt.results[0].parentId}.`
                            });
                        }
                    } catch(error) {
                        return reject(error);
                    }
                    // 2. Si no existe, se crea.
                    let receipt: IReceiptWithOptions = new Receipt();
                    let items: Array<Item> = [];
                    // let total: number = parseFloat(installationCharge.amount.toFixed(2));
                    let subTotal: number = parseFloat((total / 1.16).toFixed(2));
                    let taxes: number = parseFloat((total - subTotal).toFixed(2));
                    // Items.
                    items.push({
                        // productId: ,
                        productName: `${productName}.`,
                        quantity: 1,
                        discount: 0,
                        unitCost: subTotal,
                        total: subTotal
                    });
                    // Recibo.
                    // @ts-ignore
                    receipt = {
                        parentId: masterAccountNumber,
                        parentType: 'account',
                        // folio
                        // movementDate
                        items,
                        total,
                        subTotal,
                        taxes,
                        discount: 0,
                        exchangeRate: 1,
                        statusValue: 'pending',
                        typeValue: 'manual',
                        // receiptFile
                        // invoice
                        // previousBalance
                        operationType,
                        operationId: odx.folio.toString()
                    };
                    try {
                        receipt.isFromInstallation = true;
                        let insertedReceipt: Receipt = await receiptModel.postReceipt(receipt);
                        return resolve({
                            status: 200,
                            data: insertedReceipt
                        });
                    } catch(error) {
                        return reject(error);
                    }
                } else {
                    return reject({
                        status: 400,
                        module: 'ODX',
                        message: 'La ODX no contiene ningún cargo o el cargo total es 0.'
                    });
                }
            } else {
                return reject({
                    status: 400,
                    module: 'ODX',
                    message: 'La ODX no contiene ningún cargo.'
                });
            }
        });
    }

    public postEvidence(body: any, file: Express.Multer.File | undefined): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { folio, ...rest } = body;

            // AAA  RRRR   CCCC H   H IIIII V   V  OOO
            //A   A R   R C     H   H   I   V   V O   O
            //AAAAA RRRR  C     HHHHH   I   V   V O   O
            //A   A R   R C     H   H   I    V V  O   O
            //A   A R   R  CCCC H   H IIIII   V    OOO

            // Variables
            let id = folio;
            let category = 'evidence';
            let company = configuration.company.name;
            let fileURL: string = '';
            if(file){
                try {
                    let fileModel = new FilesModel();
                    let _file: any = await fileModel.postFile(file, id, category, company);
                    fileURL = _file.path;
                    console.log('URL: ', fileURL);
                } catch(exception) {
                    return reject({
                        status: 417,
                        module: 'ODX | Evidencia',
                        message: 'Ocurrió un error al intentar guardar el archivo.',
                        error: exception
                    });
                }
            } else {
                return reject({
                    status: 400,
                    module: 'ODX | Evidencia',
                    message: 'No se envío ningún archivo con la petición (ODX - EVIDENCIA).'
                });
            }

            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N
    
            let evidence = new Evidence();
            evidence.type = rest.type;
            evidence.url = fileURL;
            validate(evidence, { skipMissingProperties: true })
            .then((errors: any) => {
                if (errors.length > 0) {
                    let errorsWithConstraints: any[] = RemodelErrors(errors);
                    let response: any = {
                        module: 'ODX | Evidencia',
                        message: 'La información no es válida.',
                        errors: errorsWithConstraints
                    };
                    return reject(response);
                }
            });
    
            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T
    
            //Parámetros.
            let data = {
                folio,
                evidence
            }
            //Petición.
            axios.post(configuration.services.domain.odx.evidence.postEvidence, data)
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'ODX | Evidencia',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'ODX | Evidencia',
	                    message: 'Ocurrió un error al intentar guardar la información (ODX - EVIDENCIA).',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public postChargeDetail(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N
    
            let chargeDetail = new ChargeDetail();
            chargeDetail.amount = body.amount;
            chargeDetail.chargeTypeValue = body.chargeTypeValue;
            validate(chargeDetail, { skipMissingProperties: true })
            .then((errors: any) => {
                if (errors.length > 0) {
                    let errorsWithConstraints: any[] = RemodelErrors(errors);
                    let response: any = {
                        module: 'ODX | Cargos',
                        message: 'La información no es válida.',
                        errors: errorsWithConstraints
                    };
                    return reject(response);
                }
            });
    
            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T
    
            //Parámetros.
            let data = {
                folio: body.folio,
                chargeDetail
            }
            //Petición.
            axios.post(configuration.services.domain.odx.chargeDetails.postChargeDetail, data)
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'ODX | Cargos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'ODX | Cargos',
	                    message: 'Ocurrió un error al intentar guardar la información (ODX - CARGO).',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putODX(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { events, chargeDetails, evidence, ...odx }: {events: Event[], chargeDetails: ChargeDetail[], evidence: Evidence[]} & ODX = body;
            
            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
    
            let errors: Array<any> = [];
            let accountErrors: any = await this.validateSchemas(odx, ['PUT']);
            errors = errors.concat(accountErrors);
            // Si ocurrió algún error se termina la función.
            if(errors.length > 0) {
                let response: any = {
                    module: 'ODX',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            }

            //EEEEE  QQQ  U   U IIIII PPPP   OOO       IIIII N   N  SSSS TTTTT  AAA  L      AAA  DDDD   OOO
            //E     Q   Q U   U   I   P   P O   O        I   NN  N S       T   A   A L     A   A D   D O   O
            //EEE   Q Q Q U   U   I   PPPP  O   O        I   N N N  SSS    T   AAAAA L     AAAAA D   D O   O
            //E     Q  QQ U   U   I   P     O   O        I   N  NN     S   T   A   A L     A   A D   D O   O
            //EEEEE  QQQQ  UUU  IIIII P      OOO       IIIII N   N SSSS    T   A   A LLLLL A   A DDDD   OOO

            // TODO: Asegurar que los equipos instalados se concatenen:
            // Paso 1) Revisar si en la información enviada están los equipos instalados.
            let installedEquipment: Array<string> | undefined = odx.installedEquipment || [];
            // Paso 2) De ser así, se debe pedir la información de la ODX.
            if(Array.isArray(installedEquipment) && installedEquipment.length > 0) {
                let folio: number = odx.folio;
                let _odx: ODX = new ODX();
                try {
                    _odx = await this.getODX({ folio });
                    let _installedEquipment: Array<string> | undefined = _odx.installedEquipment;
                    // Paso 3) Concatenar los equipos existentes con los nuevos, revisando que no se repitan.
                    if(Array.isArray(_installedEquipment) && _installedEquipment.length > 0) {
                        installedEquipment = installedEquipment.concat(_installedEquipment);
                        let uniqueEquipment = [...Array.from(new Set(installedEquipment))];
                        odx.installedEquipment = uniqueEquipment || [];
                    }
                } catch(error) {}
            }
    
            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T
    
            // @ts-ignore
            if(Array.isArray(chargeDetails) && chargeDetails.length > 0) odx.chargeDetails = chargeDetails;
            axios.put(configuration.services.domain.odx.putODX, odx)
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                console.log('Error: ', error);
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'ODX',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'ODX',
	                    message: 'Ocurrió un error al intentar actualizar la ODX.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public putEvidence(body: any, file: Express.Multer.File | undefined): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            return resolve({ message: 'Recurso no disponible por el momento.' })
        });
    }

    public putChargeDetail(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N
    
            let chargeDetail = new ChargeDetail();
            chargeDetail._id = body.chargeDetailId;
            chargeDetail.amount = body.amount;
            chargeDetail.chargeTypeValue = body.chargeTypeValue;
            validate(chargeDetail, { groups: ['PUT'], skipMissingProperties: true })
            .then((errors: any) => {
                if (errors.length > 0) {
                    let errorsWithConstraints: any[] = RemodelErrors(errors);
                    let response: any = {
                        module: 'ODX | Cargos',
                        message: 'La información no es válida.',
                        errors: errorsWithConstraints
                    };
                    return reject(response);
                }
            });
    
            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T
    
            let params = {
                folio: body.folio,
                chargeDetailId: body.chargeDetailId,
                chargeDetail
            };
            axios.put(configuration.services.domain.odx.chargeDetails.putChargeDetail, params)
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'ODX | Cargos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'ODX | Cargos',
	                    message: 'Ocurrió un error al intentar actualizar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    //DDDD  EEEEE L     EEEEE TTTTT EEEEE
    //D   D E     L     E       T   E
    //D   D EEE   L     EEE     T   EEE
    //D   D E     L     E       T   E
    //DDDD  EEEEE LLLLL EEEEE   T   EEEEE

    public deleteODX(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            // OOO  DDDD  X   X
            //O   O D   D  X X
            //O   O D   D   X
            //O   O D   D  X X
            // OOO  DDDD  X   X

            // Primero se busca el registro.
            let odx: any = {};
            let odxFolio: number = -1;
            try {
                odx = await this.getODX(query);
                odxFolio = odx.folio;
                if(isEmpty(odx)) {
                    return reject({
                        status: 404,
                        module: 'ODX',
                        message: 'No se pudo encontrar ningún registro con la información proporcionada.'
                    });
                }
            } catch(error) {
                return reject({
                    status: 400,
                    module: 'ODX',
                    message: 'Ocurrió un error al intentar encontrar la información.',
                    error: idx(error, _ => _.response.data) || error
                });
            }
            // Después se intenta eliminar.
            try {
                await axios.delete(configuration.services.domain.odx.deleteODX, { params: query })
            } catch(error) {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'ODX',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'ODX',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            }
            
            //EEEEE V   V EEEEE N   N TTTTT  OOO   SSSS
            //E     V   V E     NN  N   T   O   O S
            //EEE   V   V EEE   N N N   T   O   O  SSS
            //E      V V  E     N  NN   T   O   O     S
            //EEEEE   V   EEEEE N   N   T    OOO  SSSS

            let errors: Array<any> = [];
            try {
                let params = {
                    parentType: 'odx',
                    parentId: odx.folio
                };
                let eventsModel = new EventModel();
                await eventsModel.deleteEvent(params);
            } catch(error) {
                // Ocurrió un error pero no se debe detener la ejecución.
                errors.push(error);
            }
    
            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
    
            let result: any = {
                folio: odxFolio,
                message: 'Registro eliminado con éxito.'
            }
            if(errors.length > 0) {
                result['errors'] = errors;
            }
            return resolve(result);
        });
    }

    public deleteEvidence(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.odx.evidence.deleteEvidence, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'ODX | Evidence',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'ODX | Evidence',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public deleteChargeDetail(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.odx.chargeDetails.deleteChargeDetail, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'ODX | Cargos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'ODX | Cargos',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
}
