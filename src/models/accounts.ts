// Módulos.
import axios from 'axios';
import idx from 'idx';
import { IsArray, IsBoolean, IsDefined, IsString, validate, MaxLength, IsMongoId, IsNumber, Min, ValidateIf, IsNotEmpty, IsDateString, IsEnum } from 'class-validator';
// Modelos.
import AccountPaymentReferenceModel, { AccountPaymentReference } from './catalogs/accountPaymentReferences';
import AccountProcessesModel from './processes/accounts';
import AddressModel, { Address } from './addresses';
import AltanAPIsModel from './altan/apis';
import ClientModel, { Client } from './clients';
import ContactModel, { Contact } from './contacts';
import { Discount, Charge } from './catalogs/promos';
import EventModel from './events';
import { FileStructure } from './notifications';
import FilesModel from './files';
import ODXModel from './odxs';
import { ProductModel, Product, AltanProduct, AltanProductModel } from './products';
import ReceiptModel, { Receipt, Item } from './receipts';
import { ZipCodeModel } from './locations';
// Funciones.
import { date2String, number2Month } from '../scripts/dates';
import { isEmpty } from '../scripts/object-prototypes';
import { RemodelErrors } from '../scripts/data-management';
import { pdf2Base64 } from '../classes/pdf';
import { PDFFormat } from 'puppeteer';
import { percentFound } from '../scripts/strings';
// Constantes.
import { ACCOUNT_TYPE_PREFIXES } from '../constants/constants';
// Configuración.
import configuration from '../configuration';
// Clases.
import Google from '../classes/google';

export class PaymentReference {
    // Nombre del banco.
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
    referenceName: string;
    // Referencia.
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
    reference: string;
}

export class ExternalIds {
    // Identificador del servicio externo.
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
    serviceId: string;
    // Nombre del servicio externo.
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
    serviceName: string;
}

export class Account {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    _id: string;
    // Número de cuenta.
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
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    accountNumber: string;
    // Idioma.
    // @IsDefined({
    //     message: 'El campo es requerido.',
    //     groups: ['POST']
    // })
    // @IsNotEmpty({
    //     message: 'El campo no puede estar vacío.',
    //     groups: ['POST', 'PUT']
    // })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    languageValue: string;
    // Estatus.
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
    // Tipo de servicio.
    @ValidateIf(o => o.isMaster === false)
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
    typeValue: string;
    // Cantidad
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(1, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    quantity?: number = 1;
    // Identificador del producto contratado.
    // TODO: Descomentar al teminar las cargas masivas.
    // @IsDefined({
    //     message: 'El campo es requerido.',
    //     groups: ['POST']
    // })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    productId: string;
    // Nombre del producto contratado.
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
    @MaxLength(500, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    productName: string;
    // Teléfono (si aplica).
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(15, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    phone: string;
    // Número de serie del equipo.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    equipment: string;
    // ¿Es comodato?
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    isItLoan: boolean;
    // Comentarios.
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    events: Array<any>;
    // Identificador/folio del cliente.
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
    clientId: string;
    // ¿Requiere factura?
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    invoiceRequired: boolean = true;
    // Tipo de desglose.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsEnum(['A', 'B', 'C'], {
        message: 'El valor no es válido.',
        groups: ['POST', 'PUT']
    })
    breakdownType: string = 'B';
    // Estatus del servicios (Online/Offline).
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsEnum(['online', 'offline', 'online_process', 'offline_process'], {
        message: 'El valor no es válido.',
        groups: ['POST', 'PUT']
    })
    serviceStatus: string = 'online';
    // Precio unitario.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    unitCost: number;
    // Total.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    total: number;
    // Subtotal.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    subTotal: number;
    // Impuestos.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    taxes: number;
    // Descuentos.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    discount: number;
    // Referencia de pago.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    paymentReferences: Array<any>;
    // ¿Es cuenta concentradora?
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    isMaster: boolean = false;
    // Referencia de la cuenta concentradora.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    masterReference: string;
    // Clave del producto para SAT.
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
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    satProductCode: string = '81161700';
    // ¿Es POST pago? (Si no es pre pago... obvio).
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    isForcedTerm: boolean = true;
    // Plazo forzoso.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    forcedTermValue: string;
    // Plazo pendiente.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    pendingTerms: number;
    // Fecha de activación.
    @IsDateString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    activatedAt: string;
    // Identificador legacy.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    legacyId: number;
    // Comentarios adicionales por que sí ALV.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(250, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    comments?: string;
    // Identificadores de servicios externos.
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    externalIds: Array<ExternalIds>;
    // EXTRAS.
    address?: Address;
    contacts?: { results: Contact[], summary: any };
    client?: Client;
    product?: Product;
    // PROMOCIONES.
    // Arreglo de descuentos.
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    discounts?: Array<Discount> = [];
    // Arreglo de cargos.
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    charges?: Array<Charge> = [];
}

interface IReference {
    clientId: string;
    bbva: string;
    bajio: string;
}

interface IComplexAccount extends Account {
    slaveAccounts: Array<Account>
}

export default class AccountModel {

    //Propiedades.
    private account: any;

    //Constructor.
    constructor(account?: any) {
        this.account = account;
    }

    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchema(this.account);
    }

    private async validateSchema(_account: any = {}, groups: Array<string> = ['POST']): Promise<any> {
        // Arreglo de errores.
        let errors: Array<any> = [];
        // Cuenta.
        let account = new Account();
        account.accountNumber = _account.accountNumber;
        account.languageValue = _account.languageValue;
        account.statusValue = _account.statusValue;
        account.typeValue = _account.typeValue;
        account.quantity = _account.quantity;
        account.productId = _account.productId;
        account.productName = _account.productName;
        account.phone = _account.phone;
        account.equipment = _account.equipment;
        account.isItLoan = _account.isItLoan;
        // account.events = _account.events;
        account.clientId = _account.clientId;
        account.invoiceRequired = _account.invoiceRequired;
        account.breakdownType = _account.breakdownType;
        account.serviceStatus = _account.serviceStatus;
        account.unitCost = _account.unitCost;
        account.total = _account.total;
        account.subTotal = _account.subTotal;
        account.taxes = _account.taxes;
        account.discount = _account.discount;
        account.paymentReferences = _account.paymentReferences;
        account.isMaster = _account.isMaster;
        account.masterReference = _account.masterReference;
        account.satProductCode = _account.satProductCode;
        account.isForcedTerm = _account.isForcedTerm;
        account.forcedTermValue = _account.forcedTermValue;
        account.pendingTerms = _account.pendingTerms;
        account.activatedAt = _account.activatedAt;
        account.legacyId = _account.legacyId;
        account.comments = _account.comments;
        account.externalIds = _account.externalIds;
        let accountErrors = await validate(account, { groups, skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(accountErrors, 'account'));
        // Descuentos.
        if(account.discounts && Array.isArray(account.discounts)) {
            let index: number = 0;
            for(const _discount of account.discounts) {
                let discount = new Discount();
                discount.name = _discount.name;
                discount.value = _discount.value;
                discount.applicationDate = _discount.applicationDate;
                discount.status = _discount.status;
                discount.type = _discount.type;
                discount.amount = _discount.amount;
                let discountErrors = await validate(discount, { groups, skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(discountErrors, `account.discount[${index}]`));
                index++;
            }
        }
        // Cargos.
        if(account.charges && Array.isArray(account.charges)) {
            let index: number = 0;
            for(const _charge of account.charges) {
                let charge = new Discount();
                charge.name = _charge.name;
                charge.value = _charge.value;
                charge.applicationDate = _charge.applicationDate;
                charge.status = _charge.status;
                charge.amount = _charge.amount;
                let chargeErrors = await validate(charge, { groups, skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(chargeErrors, `account.charge[${index}]`));
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

    public getAccount(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let errors: Array<any> = [];

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let accountNumber: string = '';
            let clientId: string = '';
            let _account: any = {};
            try {
                _account = await axios.get(configuration.services.domain.accounts.getAccount, { params: query });
                accountNumber = _account.data.accountNumber;
                clientId = _account.data.clientId;
            } catch(error) {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                    });
                } else {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'Ocurrió un error al intentar obtener la información.',
                        error: idx(error, _ => _.response.data) || error
                    });
                }
            }

            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE

            let _client: any = {};
            try {
                let params = {
                    folio: clientId
                };
                let clientModel = new ClientModel();
                _client = await clientModel.getClient(params);
            } catch(error) {
                // Ocurrió un error pero no se debe detener la ejecución.
                errors.push(error);
            }

            //DDDD  IIIII RRRR  EEEEE  CCCC  CCCC IIIII  OOO  N   N EEEEE  SSSS
            //D   D   I   R   R E     C     C       I   O   O NN  N E     S
            //D   D   I   RRRR  EEE   C     C       I   O   O N N N EEE    SSS
            //D   D   I   R   R E     C     C       I   O   O N  NN E         S
            //DDDD  IIIII R   R EEEEE  CCCC  CCCC IIIII  OOO  N   N EEEEE SSSS

            let addresses: Array<Address> = [];
            if(typeof accountNumber === 'string' && accountNumber != '') {
                try {
                    let params = {
                        full: true,
                        parentId: accountNumber,
                        parentType: 'account',
                        all: true
                    };
                    let addressModel = new AddressModel();
                    let getAddresses: { results: Array<Address>, summary: any } = await addressModel.getAddresses(params);
                    addresses = addresses.concat(getAddresses.results);
                } catch(error) {
                    // Ocurrió un error pero no se debe detener la ejecución.
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

            // CCCC  OOO  N   N TTTTT  AAA   CCCC TTTTT  OOO   SSSS
            //C     O   O NN  N   T   A   A C       T   O   O S
            //C     O   O N N N   T   AAAAA C       T   O   O  SSS
            //C     O   O N  NN   T   A   A C       T   O   O     S
            // CCCC  OOO  N   N   T   A   A  CCCC   T    OOO  SSSS

            let _contacts: any = {};
            if(typeof accountNumber === 'string' && accountNumber != '') {
                try {
                    let params = {
                        all: true,
                        parentId: accountNumber,
                        parentType: 'account'
                    };
                    let contactModel = new ContactModel();
                    _contacts = await contactModel.getContacts(params);
                } catch(error) {
                    // Ocurrió un error pero no se debe detener la ejecución.
                    errors.push(error);
                }
            }

            //EEEEE V   V EEEEE N   N TTTTT  OOO   SSSS
            //E     V   V E     NN  N   T   O   O S
            //EEE   V   V EEE   N N N   T   O   O  SSS
            //E      V V  E     N  NN   T   O   O     S
            //EEEEE   V   EEEEE N   N   T    OOO  SSSS

            let _events: any[] = [];
            if(typeof accountNumber === 'string' && accountNumber != '') {
                try {
                    let params = {
                        parentId: accountNumber,
                        parentType: 'account',
                        sort: { "field": "createdAt", "type": "DESC" }
                    };
                    let eventModel = new EventModel();
                    _events = await eventModel.getEvents(params);
                } catch(error) {
                    // Ocurrió un error pero no se debe detener la ejecución.
                    errors.push(error);
                }
            }

            //PPPP  RRRR   OOO  DDDD  U   U  CCCC TTTTT  OOO
            //P   P R   R O   O D   D U   U C       T   O   O
            //PPPP  RRRR  O   O D   D U   U C       T   O   O
            //P     R   R O   O D   D U   U C       T   O   O
            //P     R   R  OOO  DDDD   UUU   CCCC   T    OOO

            let _product: any = {};
            if(typeof accountNumber === 'string' && accountNumber != '') {
                try {
                    let productModel = new ProductModel();
                    _product = await productModel.getProduct({ _id: _account.data.productId });
                } catch(error) {
                    errors.push(error);
                }
            }

            // OOO  DDDD  X   X
            //O   O D   D  X X
            //O   O D   D   X
            //O   O D   D  X X
            // OOO  DDDD  X   X

            let _odxs: Array<any> = [];
            if(typeof accountNumber === 'string' && accountNumber != '') {
                try {
                    let params = {
                        all: true,
                        account: accountNumber
                    };
                    let odxModel = new ODXModel();
                    _odxs = await odxModel.getODXS(params);
                } catch(error) {
                    // Ocurrió un error pero no se debe detener la ejecución.
                    errors.push(error);
                }
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

            let result: any = _account.data;
            result['client'] = _client || {};
            result['address'] = defaultAddress;
            result['addresses'] = addresses;
            result['contacts'] = _contacts || [];
            result['events'] = _events || [];
            result['product'] = _product || {};
            result['odxs'] = _odxs || [];
            if(errors.length > 0) {
                result['errors'] = errors;
            }
            return resolve(result);
        });
    }

    public getAccountSimple(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.accounts.getAccount, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                    });
                } else {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'Ocurrió un error al intentar obtener la información.',
                        error: idx(error, _ => _.response.data) || error
                    });
                }
            });
        });
    }

    public getAccounts(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Parámetros.
            let { limit, page, all, ...filters } = query;
            let params: any = {
                all,
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.accounts.getAccounts, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                    });
                } else {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'Ocurrió un error al intentar obtener la información.',
                        error: idx(error, _ => _.response.data) || error
                    });
                }
            });
        });
    }

    public getAccountProportionalCharge(account: Account): number {
        // 1. Se revisa si el servicio se activó en el mes actual y no lo cubre por completo.
        let today = new Date();
        let proportionalCharge: number = 0;
        if(typeof account.activatedAt === 'string' && account.statusValue === 'active') {
            let activatedAt: Date = new Date(account.activatedAt);
            if(activatedAt.getMonth() === today.getMonth() && activatedAt.getFullYear() === today.getFullYear()) {
                // NOTE: El proporcional es igual independientemente del día de activación.
                // ACTIVO EN EL MES ACTUAL.
                // A PARTIR DEL DÍA 15.
                // NOTE: Sólo genera proporcional si es después del día 15, antes de eso se cobra completo.
                // if(activatedAt.getDate() >= 15) {
                    // 2. Se calcula entonces el proporcional:
                    // proporcional = (total / todos los días del mes) * total de días transcurridos.
                    let daysInMonth: number = new Date(activatedAt.getFullYear(), activatedAt.getMonth() + 1, 0).getDate();
                    // NOTE: Se usa el subtotal y después se calcula el impuesto.
                    proportionalCharge = (account.subTotal / daysInMonth) * (daysInMonth - activatedAt.getDate());
                // }
            } else if(activatedAt.getMonth() === today.getMonth() - 1 && activatedAt.getFullYear() === today.getFullYear()) {
                // NOTE: El proporcional es igual independientemente del día de activación.
                // ACTIVO EN EL MES ANTERIOR.
                // ANTES DEL DÍA 15.
                /*
                if(activatedAt.getDate() < 15) {
                    // No hay proporcional como tal, se debe cobrar el mes completo.
                    proportionalCharge = account.subTotal > 0 ? account.subTotal * -1 : account.subTotal;
                }
                */
                // A PARTIR DEL DÍA 15.
                if(activatedAt.getDate() >= 15) {
                    // 2. Se calcula entonces el proporcional:
                    // proporcional = (total / todos los días del mes) * total de días transcurridos.
                    let daysInMonth: number = new Date(activatedAt.getFullYear(), activatedAt.getMonth() + 1, 0).getDate();
                    proportionalCharge = (account.subTotal / daysInMonth) * (daysInMonth - activatedAt.getDate());
                    proportionalCharge = proportionalCharge > 0 ? (proportionalCharge * -1) : proportionalCharge;
                }
            }
        }
        // NOTE: Si el resultado es positivo, el proporcional es del mes actual. Si es negativo es del mes anterior.
        return proportionalCharge;
    }

    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postAccount(body: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { address, contact, events, ...account }: {address: Address, contact: Contact | Contact[], events: Event[]} & Partial<Account> = body;

            //TTTTT EEEEE L     EEEEE FFFFF  OOO  N   N  OOO
            //  T   E     L     E     F     O   O NN  N O   O
            //  T   EEE   L     EEE   FFF   O   O N N N O   O
            //  T   E     L     E     F     O   O N  NN O   O
            //  T   EEEEE LLLLL EEEEE F      OOO  N   N  OOO

            if(account.phone && account.phone !== '0000000000') {
                let existingAccounts: { results: Array<Account>, summary: any } = { results: [], summary: {} };
                try {
                    existingAccounts = await this.getAccounts({ phone: account.phone });
                    if(existingAccounts.results.length > 0) {
                        return reject({
                            status: 400,
                            module: 'Cuentas',
                            message: 'El número telefónico ya fue asignado a otra cuenta.'
                        });
                    }
                } catch(error) {}
            }

            //PPPP  RRRR  EEEEE FFFFF IIIII JJJJJ  OOO
            //P   P R   R E     F       I     J   O   O
            //PPPP  RRRR  EEE   FFF     I     J   O   O
            //P     R   R E     F       I   J J   O   O
            //P     R   R EEEEE R     IIIII  J     OOO

            let prefix: string = '';
            try {
                let productModel: ProductModel = new ProductModel();
                let product: Product = await productModel.getProduct({ _id: account.productId });
                prefix = product.prefix;
            } catch(error) {
                return reject(error);
            }
            if(typeof prefix != 'string' || prefix.length === 0) {
                return reject({
                    status: 404,
                    module: 'Cuentas',
                    message: 'No se pudo obtener la información del producto (prefijo) asociado a la cuenta.'
                });
            }

            //U   U L     TTTTT IIIII M   M  OOO       N   N U   U M   M EEEEE RRRR   OOO
            //U   U L       T     I   MM MM O   O      NN  N U   U MM MM E     R   R O   O
            //U   U L       T     I   M M M O   O      N N N U   U M M M EEE   RRRR  O   O
            //U   U L       T     I   M   M O   O      N  NN U   U M   M E     R   R O   O
            // UUU  LLLLL   T   IIIII M   M  OOO       N   N  UUU  M   M EEEEE R   R  OOO

            let isMaster: boolean = account.isMaster ? account.isMaster : false;
            // let accountType: string = account.typeValue ? ACCOUNT_TYPE_PREFIXES[account.typeValue] : '999';
            let accountNumber: string = isMaster ? 'M-000-' : `${prefix}-`;
            let query: any = {
                limit: 1,
                page: 1,
                accountNumber,
                sort: { "field": "accountNumber", "type": "DESC" }
            };
            let lastAccountNumber: string = '';
            let getAccounts: { results: Array<Account>, summary: any } = { results: [], summary: {} };
            try {
                getAccounts = await this.getAccounts(query);
            } catch(error) {
                return reject(error);
            }
            if(Array.isArray(getAccounts.results) && getAccounts.results.length > 0) {
                lastAccountNumber = getAccounts.results[0].accountNumber;
                let lastAccountNumberParts: string[] = lastAccountNumber.split('-');
                let lastFolio: number = parseInt(lastAccountNumberParts[(isMaster ? 2 : 1)] || '1') + 1;
                // Se revisa cuántos ceros se deben agregar.
                let newFolio: string = lastFolio.toString();
                while(newFolio.toString().length < 7) {
                    newFolio = `0${newFolio}`;
                }
                accountNumber = `${accountNumber}${newFolio}`;
            } else {
                // Va a ser el primer folio.
                accountNumber = `${accountNumber}0000001`;
            }

            // CCCC  OOO  M   M PPPP  L     EEEEE TTTTT  AAA  RRRR       IIIII N   N FFFFF  OOO  RRRR  M   M  AAA   CCCC IIIII  OOO  N   N
            //C     O   O MM MM P   P L     E       T   A   A R   R        I   NN  N F     O   O R   R MM MM A   A C       I   O   O NN  N
            //C     O   O M M M PPPP  L     EEE     T   AAAAA RRRR         I   N N N FFF   O   O RRRR  M M M AAAAA C       I   O   O N N N
            //C     O   O M   M P     L     E       T   A   A R   R        I   N  NN F     O   O R   R M   M A   A C       I   O   O N  NN
            // CCCC  OOO  M   M P     LLLLL EEEEE   T   A   A R   R      IIIII N   N F      OOO  R   R M   M A   A  CCCC IIIII  OOO  N   N

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
                        module: 'Cuentas',
                        message: 'No se pudo obtener la información de la dirección de la cuenta y ésta está incompleta.'
                    });
                }
            }
            // Cantidad, precio unitario y tipo de desglose.
            account.quantity = typeof account.quantity === 'number' ? account.quantity : 1;
            account.breakdownType = (typeof account.breakdownType === 'string' && ['A', 'B', 'C'].indexOf(account.breakdownType) >= 0) ? account.breakdownType : 'B';
            account.unitCost = typeof account.unitCost === 'number' ? account.unitCost : account.subTotal;

            // CCCC U   U EEEEE N   N TTTTT  AAA       M   M  AAA  EEEEE  SSSS TTTTT RRRR   AAA
            //C     U   U E     NN  N   T   A   A      MM MM A   A E     S       T   R   R A   A
            //C     U   U EEE   N N N   T   AAAAA      M M M AAAAA EEE    SSS    T   RRRR  AAAAA
            //C     U   U E     N  NN   T   A   A      M   M A   A E         S   T   R   R A   A
            // CCCC  UUU  EEEEE N   N   T   A   A      M   M A   A EEEEE SSSS    T   R   R A   A

            if(typeof account.masterReference === 'string' && account.masterReference.length > 0) {
                if(account.masterReference.match(/^[0-9]+$/g) !== null) {
                    // La cuenta para el movimiento es de tipo LEGACY y se debe obtener el número nuevo.
                    try {
                        let masterAccount: Account = await this.getAccount({ legacyId: account.masterReference });
                        account.masterReference = masterAccount.accountNumber;
                    } catch(error) {
                        return reject(error);
                    }
                }
            }

            //RRRR  EEEEE FFFFF EEEEE RRRR  EEEEE N   N  CCCC IIIII  AAA   SSSS      DDDD  EEEEE      PPPP   AAA   GGGG  OOO
            //R   R E     F     E     R   R E     NN  N C       I   A   A S          D   D E          P   P A   A G     O   O
            //RRRR  EEE   FFF   EEE   RRRR  EEE   N N N C       I   AAAAA  SSS       D   D EEE        PPPP  AAAAA G  GG O   O
            //R   R E     F     E     R   R E     N  NN C       I   A   A     S      D   D E          P     A   A G   G O   O
            //R   R EEEEE R     EEEEE R   R EEEEE N   N  CCCC IIIII A   A SSSS       DDDD  EEEEE      P     A   A  GGGG  OOO

            // a) Referencia interna.
            let paymentReferences: Array<{ referenceName: string, reference: string }> = [];
            paymentReferences.push({ referenceName: configuration.company.name, reference: accountNumber });
            // b) Referencias bancarias.
            let accountPaymentReferencesModel: AccountPaymentReferenceModel = new AccountPaymentReferenceModel();
            let getPaymentReferences: { results: Array<AccountPaymentReference>, summary: any } = { results: [], summary: {} };
            try {
                getPaymentReferences = await accountPaymentReferencesModel.getAccountPaymentReferencees({ taken: false });
            } catch(error) {
                return reject(error);
            }
            let referencesId: string = '';
            if(getPaymentReferences.results.length > 0) {
                referencesId = getPaymentReferences.results[0]._id;
                paymentReferences = paymentReferences.concat(getPaymentReferences.results[0].references);
            }
            // c) Todas las referencias.
            account.paymentReferences = paymentReferences;

            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS

            let errors: Array<any> = [];
            // CUENTA.
            account.accountNumber = accountNumber;
            let accountErrors: any = await this.validateSchema(account || {});
            errors = errors.concat(accountErrors);
            // DIRECCIÓN.
            // FIX:
            let isAddressOK: boolean = true;
            address = address || {};
            address.parentType = 'account';
            address.parentId = accountNumber;
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
            // FIX:
            // if(Array.isArray(addressErrors) && addressErrors.length > 0) isAddressOK = false;
            // CONTACTO.
            let goodContacts: Array<Contact> = [];
            let badContacts: Array<any> = [];
            let contactModel = new ContactModel();
            if(Array.isArray(contact) && contact.length > 0) {
                let index: number = 1;
                for(const _contact of contact) {
                    _contact.parentType = 'account';
                    _contact.parentId = accountNumber;
                    contactModel.contact = _contact;
                    try {
                        delete _contact._id;
                    } catch(error) {}
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
            } else if(!isEmpty(contact)) { // if(contact instanceof Contact) {
                contact = contact as Contact;
                // contact = contact || new Contact();
                contact.parentType = 'account';
                contact.parentId = accountNumber;
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
                    event['parentId'] = accountNumber;
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
                    module: 'Cuentas',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            }

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let _account: any = {};
            try {
                let _accountResult = await axios.post(configuration.services.domain.accounts.postAccount, account);
                _account = _accountResult.data;
            } catch(error) {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                    });
                } else {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'Ocurrió un error al intentar guardar la información (SERVICIO).',
                        error: idx(error, _ => _.response.data) || error
                    });
                }
            }

            // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
            //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
            //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
            //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
            //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

            // Se debe actualizar la referencia asignada.
            try {
                await accountPaymentReferencesModel.putAccountPaymentReference({ _id: referencesId, taken: true });
            } catch(error) {
                errors.push(error)
            }

            //DDDD  IIIII RRRR  EEEEE  CCCC  CCCC IIIII  OOO  N   N
            //D   D   I   R   R E     C     C       I   O   O NN  N
            //D   D   I   RRRR  EEE   C     C       I   O   O N N N
            //D   D   I   R   R E     C     C       I   O   O N  NN
            //DDDD  IIIII R   R EEEEE  CCCC  CCCC IIIII  OOO  N   N

            let _address: any = {};
            // FIX:
            // No se hace la inserción si la información de la dirección es incorrecta.
            // if(isAddressOK) {
                try {
                    _address = await addressModel.postAddress(address);
                } catch(error) {
                    // Ocurrió un error pero no se debe detener la ejecución.
                    errors.push(error);
                }
            // }

            // CCCC  OOO  N   N TTTTT  AAA   CCCC TTTTT  OOO   SSSS
            //C     O   O NN  N   T   A   A C       T   O   O S
            //C     O   O N N N   T   AAAAA C       T   O   O  SSS
            //C     O   O N  NN   T   A   A C       T   O   O     S
            // CCCC  OOO  N   N   T   A   A  CCCC   T    OOO  SSSS

            let _contacts: any = {};
            try {
                _contacts = await contactModel.postContacts({ contacts: goodContacts });
            } catch(error) {
                // Ocurrió un error pero no se debe detener la ejecución.
                errors.push(error);
            }

            //EEEEE V   V EEEEE N   N TTTTT  OOO   SSSS
            //E     V   V E     NN  N   T   O   O S
            //EEE   V   V EEE   N N N   T   O   O  SSS
            //E      V V  E     N  NN   T   O   O     S
            //EEEEE   V   EEEEE N   N   T    OOO  SSSS

            let _events: any = { data: [] };
            try {
                _events = await eventModel.postEvents(goodEvents);
            } catch(error) {
                // Ocurrió un error pero no se debe detener la ejecución.
                errors.push(error);
            }

            // CCCC U   U EEEEE N   N TTTTT  AAA   SSSS       AAA   SSSS  OOO   CCCC IIIII  AAA  DDDD   AAA   SSSS
            //C     U   U E     NN  N   T   A   A S          A   A S     O   O C       I   A   A D   D A   A S
            //C     U   U EEE   N N N   T   AAAAA  SSS       AAAAA  SSS  O   O C       I   AAAAA D   D AAAAA  SSS
            //C     U   U E     N  NN   T   A   A     S      A   A     S O   O C       I   A   A D   D A   A     S
            // CCCC  UUU  EEEEE N   N   T   A   A SSSS       A   A SSSS   OOO   CCCC IIIII A   A DDDD  A   A SSSS

            // let _slaveAccounts: Array<any> = [];
            if(_account.isMaster) {
                try {
                    let filters: any = {
                        masterReference: accountNumber
                    }
                    let _slaveAccountsResult = await this.getAccounts(filters);
                    _account['slaveAccounts'] = _slaveAccountsResult.results;
                } catch(error) {
                    errors.push(error);
                }
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

            let result: any = _account;
            // result['slaveAccounts'] = (Array.isArray(_slaveAccounts) && _slaveAccounts.length > 0) ? _slaveAccounts : [];
            result['address'] = _address || {};
            result['contacts'] = idx(_contacts, _ => _.data) || [];
            result['events'] = idx(_events, _ => _.data) || [];
            if(errors.length > 0) {
                result['errors'] = {
                    errors,
                    badEvents
                };
            }
            return resolve(result);
        });
    }

    public postAccounts(body: any, file: Express.Multer.File): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //JJJJJ  SSSS  OOO  N   N
            //  J   S     O   O NN  N
            //  J    SSS  O   O N N N
            //J J       S O   O N  NN
            // J    SSSS   OOO  N   N

            let items: Array<Account> = [];
            if(file) {
                try {
                    items = JSON.parse(file.buffer.toString('utf8'));
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'No se pudo leer la información del archivo.',
                        error
                    });
                }
            } else {
                return reject({
                    status: 404,
                    module: 'Cuentas',
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
            let goodRecords: Array<Account> = [];
            let badRecords: Array<Account> = [];
            let errors: Array<any> = [];
            for(const account of items) {
                // Análisis y transformación de datos.
                try {
                    account.subTotal = parseFloat(account.subTotal.toString());
                    account.taxes = parseFloat(account.taxes.toString());
                    account.total = parseFloat(account.total.toString());
                    account.satProductCode = account.satProductCode || '81161700';
                    if(Array.isArray(account.events) && account.events.length > 0){
                        account.events.forEach((event: any) => {
                            event.user = event.user.toString();
                            event.description = event.description.slice(0, 1024);
                        });
                    }
                } catch(error) {}
                // Se intenta guardar la información.
                try {
                    await this.postAccount(account);
                    goodRecords.push(account);
                } catch(error) {
                    errors.push(error);
                    badRecords.push(account);
                }
            }
            if(goodRecords.length === 0) {
                return reject({
                    status: 400,
                    module: 'Cuentas',
                    message: 'Ocurrió un error al intentar guardar la información, no se pudo insertar ningún registro.',
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
                    message: `Cuentas | Información guardada con éxito.\nCuentas guardadas: ${goodRecords.length - badRecords.length}.\nCuentas que no se pudieron guardar: ${badRecords.length}`,
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

    public postContract(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { accountNumber, send, ...rest }: { accountNumber: string, send: boolean } & any = body;
            send = typeof send === 'boolean' ? send : false;

            // CCCC U   U EEEEE N   N TTTTT  AAA       Y   Y       CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     U   U E     NN  N   T   A   A       Y Y       C     L       I   E     NN  N   T   E
            //C     U   U EEE   N N N   T   AAAAA        Y        C     L       I   EEE   N N N   T   EEE
            //C     U   U E     N  NN   T   A   A        Y        C     L       I   E     N  NN   T   E
            // CCCC  UUU  EEEEE N   N   T   A   A       YYY        CCCC LLLLL IIIII EEEEE N   N   T   EEEEE

            let account: Account = new Account();
            let client: Client = new Client();
            try {
                let accountModel = new AccountModel();
                account = await accountModel.getAccount({ accountNumber });
                client = account.client || new Client();
            } catch(error) {
                return reject(error);
            }

            // TODO: Buscar si ya existe el archivo.

            //PPPP  DDDD  FFFFF
            //P   P D   D F
            //PPPP  D   D FFF
            //P     D   D F
            //P     DDDD  F

            let productCategory: string = (idx(account, _ => _.product.categoryValue) || '');
            let contract: { pdf: string} = { pdf: '' };
            let contractType: string = '';
            switch(productCategory) {
                case 'MV104':
                    // Movilidad.
                    try {
                        contract = await this.createAccountContract({ accountNumber, templateURL: '../templates/aContractMovil.ejs' });
                        contractType = 'Movilidad';
                    } catch(error) {
                        return reject(error);
                    }
                    break;
                case 'SC103':
                    // Sin Cables.
                    try {
                        contract = await this.createAccountContract({ accountNumber, templateURL: '../templates/aContractSinCables.ejs' });
                        contractType = 'SinCables';
                    } catch(error) {
                        return reject(error);
                    }
                    break;
                case 'MO100':
                case 'FO101':
                case 'TL102':
                    // Triple Play (estandar).
                    try {
                        contract = await this.createAccountContract({ accountNumber, templateURL: '../templates/aContractTriplePlay.ejs' });
                        contractType = 'TriplePlay';
                    } catch(error) {
                        return reject(error);
                    }
                    break;
                case 'TV105':
                case 'RD106':
                case 'AC107':
                case 'CL107':
                case 'PK100':
                case 'installation':
                default:
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'El producto dado de alta no cuenta con un contrato especificado para su generación.'
                    });
            }

            // AAA  RRRR   CCCC H   H IIIII V   V  OOO
            //A   A R   R C     H   H   I   V   V O   O
            //AAAAA RRRR  C     HHHHH   I   V   V O   O
            //A   A R   R C     H   H   I    V V  O   O
            //A   A R   R  CCCC H   H IIIII   V    OOO

            // Se crea un "archivo virtual" del tipo PDF.
            // pdf = new Blob([pdfText], { type : 'application/pdf' });
            let fileModel = new FilesModel();
            let pdfBuffer: Buffer | undefined;
            let pdfURL: string = '';
            pdfBuffer = Buffer.from(contract.pdf, 'base64');
            let id = client.folio.toString();
            let category = 'clients';
            let company = configuration.company.name;
            if(pdfBuffer){
                try {
                    let file: any = await fileModel.postFileFromBuffer(pdfBuffer, 'application/pdf', `Contrato${contractType}${accountNumber}.pdf`, id, category, company);
                    pdfURL = file.path;
                } catch(error) {
                    return reject(error);
                }
            }

            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE

            let data: any = { folio: client.folio };
            data['files'] = [pdfURL];
            axios.post(configuration.services.domain.clients.files.postFiles, data)
            .then( async (response: any) => {

                //EEEEE M   M  AAA  IIIII L
                //E     MM MM A   A   I   L
                //EEE   M M M AAAAA   I   L
                //E     M   M A   A   I   L
                //EEEEE M   M A   A IIIII LLLLL

                if(send) {
                    let accountProcessesModel: AccountProcessesModel = new AccountProcessesModel();
                    let mailingErrors: Array<any> = [];
                    let attachments: Array<FileStructure> = [];
                    attachments.push({
                        type: 'application/pdf',
                        name: `Contrato${contractType}${accountNumber}.pdf`,
                        content: contract.pdf
                    });
                    if(attachments.length > 0) {
                        let data: any = {
                            accountNumber: accountNumber,
                            attachments,
                            template: 'client_notification',
                            content: [
                                {
                                    name: 'message',
                                    content: `Por medio del presente correo le hacemos llegar su contrato de ${contractType}.`
                                }
                            ],
                            subject: `Domain Contrato de ${contractType} para la cuenta ${accountNumber}.`
                        };
                        try {
                            await accountProcessesModel.sendEmail(data);
                        } catch(error) {
                            mailingErrors.push(error);
                        }
                    }
                }

                //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                //R   R E     S     U   U L       T   A   A D   D O   O
                //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                //R   R E         S U   U L       T   A   A D   D O   O
                //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

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

    public createAccountContract(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { accountNumber, templateURL, ...rest }: { accountNumber: string, templateURL: string } & any = body;

            // CCCC U   U EEEEE N   N TTTTT  AAA       Y   Y       CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     U   U E     NN  N   T   A   A       Y Y       C     L       I   E     NN  N   T   E
            //C     U   U EEE   N N N   T   AAAAA        Y        C     L       I   EEE   N N N   T   EEE
            //C     U   U E     N  NN   T   A   A        Y        C     L       I   E     N  NN   T   E
            // CCCC  UUU  EEEEE N   N   T   A   A       YYY        CCCC LLLLL IIIII EEEEE N   N   T   EEEEE

            let account: Account = new Account();
            let client: Client = new Client();
            try {
                let accountModel = new AccountModel();
                account = await accountModel.getAccount({ accountNumber });
                client = account.client || new Client();
            } catch(error) {
                return reject(error);
            }

            // NOTE: Por alguna razón que ya olvidamos, sólo se creaba el contrato para movilidad.
            let productCategory: string = (idx(account, _ => _.product.categoryValue) || '');
            if(productCategory !== 'MV104') {
                return reject({
                    status: 400,
                    module: 'Cuentas',
                    message: 'El producto dado de alta en la cuenta no es de movilidad.'
                });
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
                let productSpecifications: { minutes: string, sms: string, data: string } = {
                    minutes: '',
                    sms: '',
                    data: ''
                };
                let accountProduct: Product = new Product();
                if(account.product) accountProduct = account.product;
                if(Array.isArray(accountProduct.specifications) && accountProduct.specifications.length > 0) {
                    for(const specification of accountProduct.specifications) {
                        if(specification.name.toLowerCase() === 'minutes') productSpecifications.minutes = specification.value;
                        if(specification.name.toLowerCase() === 'sms') productSpecifications.sms = specification.value;
                        if(specification.name.toLowerCase() === 'data') {
                            let data: number = parseInt(specification.value);
                            data = data >= 1000 ? data / 1000 : data;
                            productSpecifications.data = `${data}`;
                        }
                    }
                }
                // @ts-ignore
                account.product.specifications = productSpecifications;
                let product: any = account.product;
                if(!product.folioIFT) product.folioIFT = '---';
                // Fecha actual.
                let today: Date = new Date();
                let day: number | string = today.getDate();
                day = day < 10 ? `0${day}` : day;
                let month: number | string = today.getMonth();
                month = number2Month(month + 1, false);
                let year: number = today.getFullYear();
                // Archivos / Evidencia.
                let files: Array<string> = client.files || [];
                let signature: string = '';
                if(files.length > 0) {
                    for(const file of files) {
                        if(file.toLowerCase().trim().indexOf('/signature.png') >= 0) {
                            signature = `${configuration.proxy.url}${file}`;
                            break;
                        }
                    }
                }
                // @ts-ignore
                client.evidence = {};
                // @ts-ignore
                if(signature) client.evidence.signature = signature;

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
                        // productSpecifications,
                        paymentReferences,
                        equipment: account.equipment || '',
                        address,
                        address1,
                        address2,
                        zipCode: address.zipCode,
                        isForcedTerm: account.isForcedTerm,
                        forcedTermValue: account.forcedTermValue
                    },
                    client,
                    document: {
                        page: 1,
                        totalPages: 1,
                        date: {
                            day,
                            month,
                            year
                        }
                    },
                    product
                };

                //PPPP  DDDD  FFFFF
                //P   P D   D F
                //PPPP  D   D FFF
                //P     D   D F
                //P     DDDD  F

                let paperSize: PDFFormat = 'Legal';
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

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putAccount(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS

            let errors: Array<any> = [];
            let accountErrors: any = await this.validateSchema(body || {}, ['PUT']);
            errors = errors.concat(accountErrors);
            // Si ocurrió algún error se termina la función.
            if(errors.length > 0) {
                let response: any = {
                    module: 'Cuentas',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            }

            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T

            axios.put(configuration.services.domain.accounts.putAccount, body)
            .then( async (response: any) => {
                try {
                    // Se obtienen la información completa de nuevo.
                    // TODO: Crear filtros con el folio o con el identificador de la cuenta.
                    let newData = await this.getAccount({ accountNumber: idx(response, _ => _.data.accountNumber)});
                    return resolve(newData);
                } catch(error) {
                    return resolve(idx(response, _ => _.data) || {});
                }
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                    });
                } else {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'Ocurrió un error al intentar actualizar la información.',
                        error: idx(error, _ => _.response.data) || error
                    });
                }
            });
        });
    }

    public putAccountReferencesAutomatically(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { accountNumber, ...rest}: { accountNumber: string } & any = body;

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let account: Account = new Account();
            try {
                account = await this.getAccount({ accountNumber });
            } catch(error) {
                return reject(error);
            }

            //RRRR  EEEEE FFFFF EEEEE RRRR  EEEEE N   N  CCCC IIIII  AAA       DDDD  EEEEE      PPPP   AAA   GGGG  OOO
            //R   R E     F     E     R   R E     NN  N C       I   A   A      D   D E          P   P A   A G     O   O
            //RRRR  EEE   FFF   EEE   RRRR  EEE   N N N C       I   AAAAA      D   D EEE        PPPP  AAAAA G  GG O   O
            //R   R E     F     E     R   R E     N  NN C       I   A   A      D   D E          P     A   A G   G O   O
            //R   R EEEEE R     EEEEE R   R EEEEE N   N  CCCC IIIII A   A      DDDD  EEEEE      P     A   A  GGGG  OOO

            let accountPaymentReferencesModel: AccountPaymentReferenceModel = new AccountPaymentReferenceModel();
            let getPaymentReferences: { results: Array<AccountPaymentReference>, summary: any } = { results: [], summary: {} };
            try {
                getPaymentReferences = await accountPaymentReferencesModel.getAccountPaymentReferencees({ taken: false });
            } catch(error) {
                return reject(error);
            }
            if(getPaymentReferences.results.length > 0) {
                // Referencias actuales.
                let currentReferences: Array<PaymentReference> = account.paymentReferences.slice(0);
                // Referencias nuevas.
                let newReferences: Array<PaymentReference> = getPaymentReferences.results[0].references;
                // Asignación de nuevas referencias.
                let referencesAssigned: number = 0;
                let referenceAlreadyExists: boolean = false;
                // a) Se comparan contra cada una de las referencias nuevas.
                for(const newReference of newReferences) {
                    referenceAlreadyExists = false;
                    // b) Se deben recorrer todas las referencias de la cuenta.
                    for(const currentReference of account.paymentReferences) {
                        // c) Se revisa si la referencia (por nombre) ya existe.
                        if(currentReference.referenceName === newReference.referenceName) {
                            referenceAlreadyExists = true;
                            break;
                        }
                    }
                    // d) Si no existe se agrega a las referencias existentes.
                    if(!referenceAlreadyExists) {
                        currentReferences.push(newReference);
                        referencesAssigned++;
                    }
                }
                // e) Si se agregó al menos una nueva referencia, se acutaliza la cuenta y la referencia.
                if(referencesAssigned > 0) {
                    // Primero la cuenta.
                    let updatedAccount: Account = new Account();
                    try {
                        updatedAccount = await this.putAccount({ accountNumber: account.accountNumber, paymentReferences: currentReferences });
                    } catch(error) {
                        return reject(error);
                    }
                    // Después la referencia.
                    try {
                        await accountPaymentReferencesModel.putAccountPaymentReference({ _id: getPaymentReferences.results[0]._id, taken: true });
                    } catch(error) {
                        return reject(error);
                    }

                    //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                    //R   R E     S     U   U L       T   A   A D   D O   O
                    //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                    //R   R E         S U   U L       T   A   A D   D O   O
                    //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

                    return resolve(updatedAccount);
                } else {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'La cuenta ya tiene asignadas referencias para todos esos bancos.'
                    })
                }
            } else {
                return reject({
                    status: 404,
                    module: 'Cuentas',
                    message: 'No existen referencias disponibles para asignar.'
                });
            }
        });
    }

    // DELETE: Eliminar.
    public putAccountReferencesBatch(body: any, file: Express.Multer.File): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { references, ...rest } = body;

            //JJJJJ  SSSS  OOO  N   N
            //  J   S     O   O NN  N
            //  J    SSS  O   O N N N
            //J J       S O   O N  NN
            // J    SSSS   OOO  N   N

            let items: Array<IReference> = [];
            if(file) {
                try {
                    items = JSON.parse(file.buffer.toString('utf8'));
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'No se pudo leer la información del archivo.',
                        error
                    });
                }
            } else {
                if(Array.isArray(references) && references.length > 0) {
                    items = references;
                } else {
                    return reject({
                        status: 404,
                        module: 'Cuentas',
                        message: 'No se encontró un archivo ni una lista de registros en la petición.'
                    });
                }
            }

            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS

            /*
            for(const reference of references) {
                // Análisis y transformación de datos.
                try {
                    reference.clientId = reference.clientId.slice(0, 70);
                    reference.referenceName = reference.referenceName.slice(0, 70);
                    reference.reference = reference.reference.slice(0, 70);
                } catch(error) {}
                let referenceErrors = await validate(reference, { groups: ['PUT'], skipMissingProperties: true });
                if(referenceErrors.length > 0) {
                    badRecords.push(reference);
                } else {
                    goodRecords.push(reference);
                }
            }
            */

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let badRecords: Array<IReference> = [];
            let errors: Array<any> = [];
            let index: number = 0;
            for(const reference of items) {
                let accountModel = new AccountModel();
                let accountNumber: string = '';
                let getAccounts: { results: Array<Account>, summary: any } = { results: [], summary: {} };
                // 1. Se revisa si la cuenta es maestra.
                try {
                    getAccounts = await accountModel.getAccounts({ isMaster: true, clientId: reference.clientId });
                } catch(error) {
                    badRecords.push(reference);
                }
                // 2. Si no, se revisa que la cuenta sea individual.
                if(getAccounts.results.length === 0) {
                    try {
                        getAccounts = await accountModel.getAccounts({ isMaster: false, masterReference: null, clientId: reference.clientId });
                    } catch(error) {
                        badRecords.push(reference);
                    }
                }
                // 3. Si se encontró algún resultado, se actualia la información.
                if(getAccounts.results.length > 0) {
                    // Se obtiene el número de cuenta.
                    accountNumber = getAccounts.results[0].accountNumber;
                    // Referencias existentes.
                    let newReferences: any = getAccounts.results[0].paymentReferences.slice(0);
                    // Se modifican las eferencias existentes.
                    // BBVA Bancomer
                    let bbvaFound: boolean = false;
                    for(const newReference of newReferences) {
                        if(newReference.referenceName === 'BBVA Bancomer') {
                            bbvaFound = true;
                            switch(reference.bbva.length) {
                                case 5:
                                    newReference.reference = `00${reference.bbva}`;
                                    break;
                                case 6:
                                    newReference.reference = `0${reference.bbva}`;
                                    break;
                            }
                            break;
                        }
                    }
                    if(!bbvaFound) newReferences.push({ referenceName: 'BBVA Bancomer', reference: reference.bbva });
                    // Banco del Bajío
                    let bajioFound: boolean = false;
                    for(const newReference of newReferences) {
                        if(newReference.referenceName === 'Banco del Bajío') {
                            bajioFound = true;
                            newReference.reference = reference.bajio;
                            break;
                        }
                    }
                    if(!bajioFound) newReferences.push({ referenceName: 'Banco del Bajío', reference: reference.bajio });
                    // Se actualiza la cuenta.
                    try {
                        await accountModel.putAccount({ accountNumber, paymentReferences: newReferences });
                    } catch(error) {
                        badRecords.push(reference);
                        errors.push(error);
                    }
                } else {
                    badRecords.push(reference);
                }
                index++;
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

            return resolve({
                status: errors.length > 0 ? 206 : 200,
                message: 'Proceso terminado.',
                badRecords: badRecords.length,
                errors
            });
        });
    }

    // DELETE: Eliminar.
    public putAccountFixReferences(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let getAccounts: { results: Array<Account>, summary: any } = { results: [], summary: {} };
            try {
                getAccounts = await this.getAccounts({ 'paymentReferences.referenceName': 'BBVA Bancomer', all: true });
            } catch(error) {
                return reject(error);
            }
            if(getAccounts.results.length > 0) {
                let errors: Array<any> = [];
                let update: boolean = false;
                let updatedAccounts: number = 0;
                let index: number = 0;
                for(const account of getAccounts.results) {
                    // Se modifican las referencias existentes.
                    let newReferences: any = account.paymentReferences.slice(0);
                    for(const reference of newReferences) {
                        update = false;
                        if(reference.referenceName === 'BBVA Bancomer') {
                            // console.log(reference.reference);
                            switch(reference.reference.length) {
                                case 5:
                                    // console.log(reference.reference.length);
                                    reference.reference = `00${reference.reference}`;
                                    update = true;
                                    break;
                                case 6:
                                    // console.log(reference.reference.length);
                                    reference.reference = `0${reference.reference}`;
                                    update = true;
                                    break;
                            }
                            break;
                        }
                    }
                    // Se actualiza la información de la cuenta.
                    if(update) {
                        try {
                            await this.putAccount({ accountNumber: account.accountNumber, paymentReferences: newReferences });
                            updatedAccounts++;
                        } catch(error) {
                            errors.push(error);
                        }
                    }
                    index++;
                }
                return resolve({
                    status: errors.length > 0 ? 206 : 200,
                    message: `Se terminó el proceso. Cuentas actualizadas: ${updatedAccounts}.`,
                    errors
                });
            } else {
                return reject({
                    status: 404,
                    module: 'Cuentas',
                    message: 'No se encontró ninguna cuenta.'
                });
            }
        });
    }

    //DDDD  EEEEE L     EEEEE TTTTT EEEEE
    //D   D E     L     E       T   E
    //D   D EEE   L     EEE     T   EEE
    //D   D E     L     E       T   E
    //DDDD  EEEEE LLLLL EEEEE   T   EEEEE

    public deleteAccount(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let errors: Array<any> = [];

            // SSSS EEEEE RRRR  V   V IIIII  CCCC IIIII  OOO
            //S     E     R   R V   V   I   C       I   O   O
            // SSS  EEE   RRRR  V   V   I   C       I   O   O
            //    S E     R   R  V V    I   C       I   O   O
            //SSSS  EEEEE R   R   V   IIIII  CCCC IIIII  OOO

            let accountId: string = '';
            let accountNumber: string = '';
            let _account: any = {};
            try {
                _account = await axios.get(configuration.services.domain.accounts.deleteAccount, { params: query });
                if(_account.data) {
                    accountId = _account.data._id;
                    accountNumber = _account.data.accountNumber;
                    await axios.delete(configuration.services.domain.accounts.deleteAccount, { params: query });
                }
            } catch(error) {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                    });
                } else {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'Ocurrió un error al intentar borrar la información (SERVICIO).',
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
                    parentType: 'account',
                    parentId: accountId
                };
                let addressModel = new AddressModel();
                await addressModel.deleteAddress(params);
            } catch(error) {
                // Ocurrió un error pero no se debe detener la ejecución.
                errors.push(error);
            }

            // CCCC  OOO  N   N TTTTT  AAA   CCCC TTTTT  OOO   SSSS
            //C     O   O NN  N   T   A   A C       T   O   O S
            //C     O   O N N N   T   AAAAA C       T   O   O  SSS
            //C     O   O N  NN   T   A   A C       T   O   O     S
            // CCCC  OOO  N   N   T   A   A  CCCC   T    OOO  SSSS

            // TODO: Generar recurso para la eliminación masiva de contactos.
            try {
                let params = {
                    parentType: 'account',
                    parentId: accountId
                };
                let contactModel = new ContactModel();
                await contactModel.deleteContact(params);
            } catch(error) {
                // Ocurrió un error pero no se debe detener la ejecución.
                errors.push(error);
            }

            //EEEEE V   V EEEEE N   N TTTTT  OOO   SSSS
            //E     V   V E     NN  N   T   O   O S
            //EEE   V   V EEE   N N N   T   O   O  SSS
            //E      V V  E     N  NN   T   O   O     S
            //EEEEE   V   EEEEE N   N   T    OOO  SSSS

            // TODO: Generar recurso para la eliminación masiva de eventos.
            try {
                let params = {
                    parentType: 'account',
                    parentId: accountId
                };
                let eventModel = new EventModel();
                await eventModel.deleteEvent(params);
            } catch(error) {
                errors.push(error);
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

            let result: any = {
                accountNumber,
                message: 'Registro eliminado con éxito.'
            }
            if(errors.length > 0) {
                result['errors'] = errors;
            }
            return resolve(result);
        });
    }

    //RRRR  EEEEE  CCCC IIIII BBBB   OOO
    //R   R E     C       I   B   B O   O
    //RRRR  EEE   C       I   BBBB  O   O
    //R   R E     C       I   B   B O   O
    //R   R EEEEE  CCCC IIIII BBBB   OOO

    public getAccountReceipt(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { folio, ...account }: { folio: number } & IComplexAccount = body;
            if(!isEmpty(account) && Object.keys(account).length > 1) {

                //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
                //E     R   R R   R O   O R   R E     S
                //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
                //E     R   R R   R O   O R   R E         S
                //EEEEE R   R R   R  OOO  R   R EEEEE SSSS

                // account.accountNumber = accountNumber;
                let errors: Array<any> = [];
                // CUENTA.
                let accountErrors: any = await this.validateSchema(account);
                errors = errors.concat(accountErrors);
                // Si ocurrió algún error se termina la función.
                if(errors.length > 0) {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'La información no es válida.',
                        error: errors
                    });
                } else {

                    // CCCC U   U EEEEE N   N TTTTT  AAA   SSSS       AAA   SSSS  OOO   CCCC IIIII  AAA  DDDD   AAA   SSSS
                    //C     U   U E     NN  N   T   A   A S          A   A S     O   O C       I   A   A D   D A   A S
                    //C     U   U EEE   N N N   T   AAAAA  SSS       AAAAA  SSS  O   O C       I   AAAAA D   D AAAAA  SSS
                    //C     U   U E     N  NN   T   A   A     S      A   A     S O   O C       I   A   A D   D A   A     S
                    // CCCC  UUU  EEEEE N   N   T   A   A SSSS       A   A SSSS   OOO   CCCC IIIII A   A DDDD  A   A SSSS

                    if(account.isMaster /*&& (!Array.isArray(account.slaveAccounts) || account.slaveAccounts.length === 0)*/) {
                        try {
                            let filters: any = {
                                all: true,
                                masterReference: account.accountNumber,
                                statusValue: 'active'
                            }
                            let _slaveAccountsResult = await this.getAccounts(filters);
                            account['slaveAccounts'] = _slaveAccountsResult.results;
                        } catch(error) {
                            return reject(error);
                        }
                    }
                }
            } else if(typeof account.accountNumber === 'string' && account.accountNumber.length > 0) {

                // CCCC U   U EEEEE N   N TTTTT  AAA
                //C     U   U E     NN  N   T   A   A
                //C     U   U EEE   N N N   T   AAAAA
                //C     U   U E     N  NN   T   A   A
                // CCCC  UUU  EEEEE N   N   T   A   A

                let _account: IComplexAccount;
                try {
                    let filters: any = {
                        accountNumber: account.accountNumber,
                    };
                    _account = await this.getAccount(filters);
                } catch(error) {
                    return reject(error);
                }

                // CCCC U   U EEEEE N   N TTTTT  AAA   SSSS       AAA   SSSS  OOO   CCCC IIIII  AAA  DDDD   AAA   SSSS
                //C     U   U E     NN  N   T   A   A S          A   A S     O   O C       I   A   A D   D A   A S
                //C     U   U EEE   N N N   T   AAAAA  SSS       AAAAA  SSS  O   O C       I   AAAAA D   D AAAAA  SSS
                //C     U   U E     N  NN   T   A   A     S      A   A     S O   O C       I   A   A D   D A   A     S
                // CCCC  UUU  EEEEE N   N   T   A   A SSSS       A   A SSSS   OOO   CCCC IIIII A   A DDDD  A   A SSSS

                if(_account && _account.isMaster /*&& (!Array.isArray(account.slaveAccounts) || account.slaveAccounts.length === 0)*/) {
                    try {
                        let filters: any = {
                            all: true,
                            masterReference: _account.accountNumber,
                            statusValue: 'active',
                            isForcedTerm: true
                        }
                        let getSlaveAccounts: { results: Array<Account>, summary: any } = await this.getAccounts(filters);
                        _account.slaveAccounts = getSlaveAccounts.results;
                    } catch(error) {
                        return reject(error);
                    }
                }
                account = Object.assign({}, _account);
            } else {
                return reject({
                    status: 404,
                    module: 'Cuentas',
                    message: 'No se pudo encontrar información sobre la cuenta en la petición.'
                });
            }

            let receiptsModel: ReceiptModel = new ReceiptModel();

            //  °   EEEEE X   X IIIII  SSSS TTTTT EEEEE  ???
            //  ¿   E      X X    I   S       T   E     ?   ?
            // ¿¿   EEE     X     I    SSS    T   EEE     ??
            //¿   ¿ E      X X    I       S   T   E       ?
            // ¿¿¿  EEEEE X   X IIIII SSSS    T   EEEEE   °

            try {
                let today: Date = new Date();
                let startDate: Date = new Date(today.getFullYear(), today.getMonth(), 1);
                let endDate: Date = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                let start: string = date2String(startDate);
                let end: string = date2String(endDate);
                let filters = {
                    parentId: account.accountNumber,
                    parentType: 'account',
                    typeValue: 'monthly',
                    movementDate: { "start": start, "end": end }
                };
                let _receipt = await receiptsModel.getReceipts(filters);
                let count: any = idx(_receipt, _ => _.results.length) || 0;
                if(count > 0) {
                    return reject({
                        status: 400,
                        module: 'Cuentas',
                        message: 'El recibo del mes en curso ya existe.'
                    })
                }
            } catch(error) {
                // Si ocurrió un error puede que sea sólo por que NO existe, entonces por ahora no se hace algo.
            }

            //FFFFF  OOO  L     IIIII  OOO
            //F     O   O L       I   O   O
            //FFF   O   O L       I   O   O
            //F     O   O L       I   O   O
            //F      OOO  LLLLL IIIII  OOO

            // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
            // El folio se genera automáticamente desde el microservicio a partir de la versión 1.7.3
            /*
            let lastReceiptFolio: number = 1;
            let folioFilter: any = {
                // serie: 'A',
                limit: 1,
                page: 1,
                sort: { "field": "folio", "type": "DESC" }
            };
            try {
                let _receiptsResult = await receiptsModel.getReceipts(folioFilter);
                if(Array.isArray(_receiptsResult.results) && _receiptsResult.results.length > 0) {
                    lastReceiptFolio = parseInt(_receiptsResult.results[0].folio) + 1;
                }
            } catch(error) {
                return reject(error);
            }
            */

            //DDDD   AAA  TTTTT  OOO   SSSS        GGGG EEEEE N   N EEEEE RRRR   AAA  L     EEEEE  SSSS
            //D   D A   A   T   O   O S           G     E     NN  N E     R   R A   A L     E     S
            //D   D AAAAA   T   O   O  SSS        G  GG EEE   N N N EEE   RRRR  AAAAA L     EEE    SSS
            //D   D A   A   T   O   O     S       G   G E     N  NN E     R   R A   A L     E         S
            //DDDD  A   A   T    OOO  SSSS         GGGG EEEEE N   N EEEEE R   R A   A LLLLL EEEEE SSSS

            // Totales.
            // ERROR: Al inicializar los totales, se duplican posteriormente (°~°).
            let subTotal: number = /*account.subTotal ? parseFloat(account.subTotal.toFixed(2)) :*/ 0;
            let taxes: number = /*account.taxes ? parseFloat(account.taxes.toFixed(2)) :*/ 0;
            let discount: number = /*account.discount ? parseFloat(account.discount.toFixed(2)) :*/ 0;
            // let total: number = account.total ? parseFloat(account.total.toFixed(2)) : 0;
            let total: number = parseFloat(((subTotal + taxes) - discount).toFixed(2));
            // Elementos.
            let items: Array<Item> = [];
            // Fecha.
            let movementDate: string = date2String(new Date());

            // CCCC U   U EEEEE N   N TTTTT  AAA   SSSS       AAA   SSSS  OOO   CCCC IIIII  AAA  DDDD   AAA   SSSS
            //C     U   U E     NN  N   T   A   A S          A   A S     O   O C       I   A   A D   D A   A S
            //C     U   U EEE   N N N   T   AAAAA  SSS       AAAAA  SSS  O   O C       I   AAAAA D   D AAAAA  SSS
            //C     U   U E     N  NN   T   A   A     S      A   A     S O   O C       I   A   A D   D A   A     S
            // CCCC  UUU  EEEEE N   N   T   A   A SSSS       A   A SSSS   OOO   CCCC IIIII A   A DDDD  A   A SSSS

            // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
            // En caso de que se requiera el desglose 1 a 1 (caso "A"), preguntar como se repartiría el descuento.

            if(Array.isArray(account.slaveAccounts) && account.slaveAccounts.length > 0) {
                for(const slaveAccount of account.slaveAccounts) {

                    if(slaveAccount.unitCost === 0) {
                        continue;
                    }

                    //PPPP  RRRR   OOO  PPPP   OOO  RRRR   CCCC IIIII  OOO  N   N  AAA  L
                    //P   P R   R O   O P   P O   O R   R C       I   O   O NN  N A   A L
                    //PPPP  RRRR  O   O PPPP  O   O RRRR  C       I   O   O N N N AAAAA L
                    //P     R   R O   O P     O   O R   R C       I   O   O N  NN A   A L
                    //P     R   R  OOO  P      OOO  R   R  CCCC IIIII  OOO  N   N A   A LLLLL

                    let proportionalCharge: number = this.getAccountProportionalCharge(slaveAccount);
                    if(proportionalCharge < 0) {
                        // Existe un cargo proporcional por el mes anterior.
                        // MES ANTERIOR.
                        // Se da formato a los totales de la cuenta asociada.
                        proportionalCharge = proportionalCharge * -1;
                        let proportionalSubTotal = parseFloat(proportionalCharge.toFixed(2));
                        let proportionalTaxes = parseFloat((proportionalSubTotal * 0.16).toFixed(2));
                        let proportionalDiscount = 0;
                        // Se modifican los totales.
                        subTotal += proportionalSubTotal;
                        taxes = parseFloat((taxes + proportionalTaxes).toFixed(2));
                        discount += proportionalDiscount;
                        total += parseFloat(((proportionalSubTotal + proportionalTaxes) - proportionalDiscount).toFixed(2));
                        // NOTE: El nombre del producto tiene una longitud de 200.
                        let today: Date = new Date();
                        let previousMonthName: string = number2Month((today.getMonth()), true);
                        let proportionalMessage: string = ` (proporcional del mes de ${previousMonthName})`;
                        let newProductName: string = '';
                        if((slaveAccount.productName.length + proportionalMessage.length) > 200) {
                            let excesiveCharacters: number = ((slaveAccount.productName.length + proportionalMessage.length) - 200) + 4;
                            newProductName = slaveAccount.productName;
                            newProductName = newProductName.substr(0, (newProductName.length - excesiveCharacters));
                            newProductName = `${newProductName}... ${proportionalMessage}`
                        } else {
                            newProductName = `${slaveAccount.productName}${proportionalMessage}`;
                        }
                        // Se agrega el elemento.
                        // NOTE: Para el proporcional del mes anterior se agrega un solo registro.
                        items.push({
                            productId: slaveAccount.productId,
                            productName: newProductName,
                            quantity: 1,
                            unitCost: proportionalSubTotal,
                            discount: proportionalDiscount,
                            total: proportionalSubTotal,
                            key: slaveAccount.accountNumber
                        });
                        // MES ACTUAL.
                        // TODO: Revisar el tipo de desglose y agregar registros de acuerdo a esto.
                        let breakdownType: string = /*account.breakdownType ||*/ 'B';
                        switch(breakdownType.toUpperCase().trim()) {
                            // Tipo "A": Desglosar 1 x 1.
                            case 'A': {
                                    for(let index: number = 1; index < (account.quantity || 1); index++) {
                                        // Se da formato a los totales de la cuenta asociada.
                                        let slaveSubTotal: number = slaveAccount.unitCost ? parseFloat(slaveAccount.unitCost.toFixed(2)) : 0;
                                        let slaveTaxes: number = parseFloat((slaveSubTotal * 0.16).toFixed(2));
                                        let slaveDiscount: number = slaveAccount.discount ? parseFloat((slaveAccount.discount / (slaveAccount.quantity || 1)).toFixed(2)) : 0;
                                        // Se modifican los totales.
                                        subTotal += slaveSubTotal;
                                        taxes = parseFloat((taxes + slaveTaxes).toFixed(2));
                                        discount += slaveDiscount;
                                        total += parseFloat(((slaveSubTotal + slaveTaxes) - slaveDiscount).toFixed(2));
                                        // Se agrega el elemento.
                                        items.push({
                                            productId: slaveAccount.productId,
                                            productName: slaveAccount.productName,
                                            quantity: 1,
                                            discount: 0, // slaveDiscount,
                                            unitCost: slaveSubTotal,
                                            total: slaveSubTotal,
                                            key: slaveAccount.accountNumber
                                        });
                                    }
                                }
                                break;
                            // Tipo "B": Desglosar con una sola cantidad.
                            case 'B': {
                                    // Se da formato a los totales de la cuenta asociada.
                                    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                    // El costo unitario es diferente al subtotal, a este ya se le aplicaron cálculos de impuestos y etc.
                                    let slaveQuantity: number = slaveAccount.quantity || 1;
                                    let slaveUnitCost: number = slaveAccount.unitCost ? parseFloat(slaveAccount.unitCost.toFixed(2)) : 0;
                                    let slaveDiscount: number = slaveAccount.discount ? parseFloat(slaveAccount.discount.toFixed(2)) : 0;
                                    // let slaveSubTotal: number = slaveAccount.subTotal ? parseFloat(slaveAccount.subTotal.toFixed(2)) : 0;
                                    // let slaveTaxes: number = slaveAccount.taxes ? parseFloat(slaveAccount.taxes.toFixed(2)) : 0;
                                    // Se modifican los totales.
                                    // NOTE: Se debe utilizar el costo unitario de la cuenta.
                                    subTotal += slaveUnitCost;
                                    discount += slaveDiscount;
                                    // NOTE: Los impuestos y el total se deben calcular al final.
                                    // taxes = parseFloat((taxes + slaveTaxes).toFixed(2));
                                    // total += parseFloat(((slaveSubTotal + slaveTaxes) - slaveDiscount).toFixed(2));
                                    // Se agrega el elemento.
                                    items.push({
                                        productId: slaveAccount.productId,
                                        productName: slaveAccount.productName,
                                        quantity: slaveQuantity,
                                        discount: slaveDiscount,
                                        unitCost: slaveUnitCost,
                                        total: parseFloat((slaveUnitCost * slaveQuantity).toFixed(2)),
                                        key: slaveAccount.accountNumber
                                    });
                                }
                                break;
                            // Tipo "C": Un solo registro con la cantidad en la descripción ¯\_(ツ)_/¯.
                            case 'C': {
                                    // Se da formato a los totales de la cuenta asociada.
                                    let slaveSubTotal: number = slaveAccount.subTotal ? parseFloat(slaveAccount.subTotal.toFixed(2)) : 0;
                                    let slaveTaxes: number = slaveAccount.taxes ? parseFloat(slaveAccount.taxes.toFixed(2)) : 0;
                                    let slaveDiscount: number = slaveAccount.discount ? parseFloat(slaveAccount.discount.toFixed(2)) : 0;
                                    // Se modifican los totales.
                                    subTotal += slaveSubTotal;
                                    taxes = parseFloat((taxes + slaveTaxes).toFixed(2));
                                    discount += slaveDiscount;
                                    total += parseFloat(((slaveSubTotal + slaveTaxes) - slaveDiscount).toFixed(2));
                                    // Se agrega el elemento.
                                    items.push({
                                        productId: slaveAccount.productId,
                                        productName: `${slaveAccount.quantity} x ${slaveAccount.productName}`,
                                        quantity: 1,
                                        discount: 0, // slaveDiscount,
                                        unitCost: slaveSubTotal,
                                        total: slaveSubTotal,
                                        key: slaveAccount.accountNumber
                                    });
                                }
                                break;
                        }
                    } else if (proportionalCharge > 0) {
                        // El recibo debe ser sólo del proporcional actual.
                        // Se da formato a los totales de la cuenta asociada.
                        let slaveSubTotal: number = parseFloat(proportionalCharge.toFixed(2));
                        let slaveTaxes: number = parseFloat((slaveSubTotal * 0.16).toFixed(2));
                        let slaveDiscount: number = 0;
                        // Se modifican los totales.
                        subTotal += slaveSubTotal;
                        taxes = parseFloat((taxes + slaveTaxes).toFixed(2));
                        discount += slaveDiscount;
                        total += parseFloat(((slaveSubTotal + slaveTaxes) - slaveDiscount).toFixed(2));
                        // NOTE: El nombre del producto tiene una longitud de 200.
                        let today: Date = new Date();
                        let currentMonthName: string = number2Month((today.getMonth() + 1), true);
                        let proportionalMessage: string = ` (proporcional del mes de ${currentMonthName})`;
                        let newProductName: string = '';
                        if((slaveAccount.productName.length + proportionalMessage.length) > 200) {
                            let excesiveCharacters: number = ((slaveAccount.productName.length + proportionalMessage.length) - 200) + 4;
                            newProductName = slaveAccount.productName;
                            newProductName = newProductName.substr(0, (newProductName.length - excesiveCharacters));
                            newProductName = `${newProductName}... ${proportionalMessage}`
                        } else {
                            newProductName = `${slaveAccount.productName}${proportionalMessage}`;
                        }
                        // Se agrega el elemento.
                        items.push({
                            productId: slaveAccount.productId,
                            productName: newProductName,
                            quantity: 1,
                            discount: 0, // slaveDiscount,
                            unitCost: slaveSubTotal,
                            total: slaveSubTotal,
                            key: slaveAccount.accountNumber
                        });
                    } else {
                        // El recibo es el normal del mes.
                        // TODO: Revisar el tipo de desglose y agregar registros de acuerdo a esto.
                        let breakdownType: string = /*account.breakdownType ||*/ 'B';
                        switch(breakdownType.toUpperCase().trim()) {
                            // Tipo "A": Desglosar 1 x 1.
                            case 'A': {
                                    for(let index: number = 1; index < (account.quantity || 1); index++) {
                                        // Se da formato a los totales de la cuenta asociada.
                                        let slaveSubTotal: number = slaveAccount.unitCost ? parseFloat(slaveAccount.unitCost.toFixed(2)) : 0;
                                        let slaveTaxes: number = parseFloat((slaveSubTotal * 0.16).toFixed(2));
                                        let slaveDiscount: number = slaveAccount.discount ? parseFloat((slaveAccount.discount / (slaveAccount.quantity || 1)).toFixed(2)) : 0;
                                        // Se modifican los totales.
                                        subTotal += slaveSubTotal;
                                        taxes = parseFloat((taxes + slaveTaxes).toFixed(2));
                                        discount += slaveDiscount;
                                        total += parseFloat(((slaveSubTotal + slaveTaxes) - slaveDiscount).toFixed(2));
                                        // Se agrega el elemento.
                                        items.push({
                                            productId: slaveAccount.productId,
                                            productName: slaveAccount.productName,
                                            quantity: 1,
                                            discount: 0, // slaveDiscount,
                                            unitCost: slaveSubTotal,
                                            total: slaveSubTotal,
                                            key: slaveAccount.accountNumber
                                        });
                                    }
                                }
                                break;
                            // Tipo "B": Desglosar con una sola cantidad.
                            case 'B': {
                                    // Se da formato a los totales de la cuenta asociada.
                                    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                    // El costo unitario es diferente al subtotal, a este ya se le aplicaron cálculos de impuestos y etc.
                                    let slaveQuantity: number = slaveAccount.quantity || 1;
                                    let slaveUnitCost: number = slaveAccount.unitCost ? parseFloat(slaveAccount.unitCost.toFixed(2)) : 0;
                                    let slaveDiscount: number = slaveAccount.discount ? parseFloat(slaveAccount.discount.toFixed(2)) : 0;
                                    // let slaveSubTotal: number = slaveAccount.subTotal ? parseFloat(slaveAccount.subTotal.toFixed(2)) : 0;
                                    // let slaveTaxes: number = slaveAccount.taxes ? parseFloat(slaveAccount.taxes.toFixed(2)) : 0;
                                    // Se modifican los totales.
                                    // NOTE: Se debe utilizar el costo unitario de la cuenta ¡¡¡PERO MULTIPLICADO POR LA CANTIDAD PEDAZO DE ANIMAL!!!.
                                    subTotal += parseFloat((slaveUnitCost * slaveQuantity).toFixed(2));
                                    discount += slaveDiscount;
                                    // NOTE: Los impuestos y el total se deben calcular al final.
                                    // taxes = parseFloat((taxes + slaveTaxes).toFixed(2));
                                    // total += parseFloat(((slaveSubTotal + slaveTaxes) - slaveDiscount).toFixed(2));
                                    // Se agrega el elemento.
                                    items.push({
                                        productId: slaveAccount.productId,
                                        productName: slaveAccount.productName,
                                        quantity: slaveQuantity,
                                        discount: slaveDiscount,
                                        unitCost: slaveUnitCost,
                                        total: parseFloat((slaveUnitCost * slaveQuantity).toFixed(2)),
                                        key: slaveAccount.accountNumber
                                    });
                                }
                                break;
                            // Tipo "C": Un solo registro con la cantidad en la descripción ¯\_(ツ)_/¯.
                            case 'C': {
                                    // Se da formato a los totales de la cuenta asociada.
                                    let slaveSubTotal: number = slaveAccount.subTotal ? parseFloat(slaveAccount.subTotal.toFixed(2)) : 0;
                                    let slaveTaxes: number = slaveAccount.taxes ? parseFloat(slaveAccount.taxes.toFixed(2)) : 0;
                                    let slaveDiscount: number = slaveAccount.discount ? parseFloat(slaveAccount.discount.toFixed(2)) : 0;
                                    // Se modifican los totales.
                                    subTotal += slaveSubTotal;
                                    taxes = parseFloat((taxes + slaveTaxes).toFixed(2));
                                    discount += slaveDiscount;
                                    total += parseFloat(((slaveSubTotal + slaveTaxes) - slaveDiscount).toFixed(2));
                                    // Se agrega el elemento.
                                    items.push({
                                        productId: slaveAccount.productId,
                                        productName: `${slaveAccount.quantity} x ${slaveAccount.productName}`,
                                        quantity: 1,
                                        discount: 0, // slaveDiscount,
                                        unitCost: slaveSubTotal,
                                        total: slaveSubTotal,
                                        key: slaveAccount.accountNumber
                                    });
                                }
                                break;
                        }
                    }
                    // NOTE: Se redondean las cantidad al fin de cada ciclo.
                    discount = parseFloat(discount.toFixed(2));
                    subTotal = parseFloat(subTotal.toFixed(2));
                }
            } else {

                //PPPP  RRRR   OOO  PPPP   OOO  RRRR   CCCC IIIII  OOO  N   N  AAA  L
                //P   P R   R O   O P   P O   O R   R C       I   O   O NN  N A   A L
                //PPPP  RRRR  O   O PPPP  O   O RRRR  C       I   O   O N N N AAAAA L
                //P     R   R O   O P     O   O R   R C       I   O   O N  NN A   A L
                //P     R   R  OOO  P      OOO  R   R  CCCC IIIII  OOO  N   N A   A LLLLL

                let proportionalCharge: number = this.getAccountProportionalCharge(account);
                if(proportionalCharge < 0) {
                    // Existe un cargo proporcional por el mes anterior.
                    // MES ANTERIOR.
                    // Se da formato a los totales de la cuenta asociada.
                    proportionalCharge = proportionalCharge * -1;
                    let proportionalSubTotal = parseFloat(proportionalCharge.toFixed(2));
                    let proportionalTaxes = parseFloat((proportionalSubTotal * 0.16).toFixed(2));
                    let proportionalDiscount = 0;
                    // Se modifican los totales.
                    subTotal += proportionalSubTotal;
                    taxes = parseFloat((taxes + proportionalTaxes).toFixed(2));
                    discount += proportionalDiscount;
                    total += parseFloat(((proportionalSubTotal + proportionalTaxes) - proportionalDiscount).toFixed(2));
                    // NOTE: El nombre del producto tiene una longitud de 200.
                    let today: Date = new Date();
                    let previousMonthName: string = number2Month((today.getMonth()), true);
                    let proportionalMessage: string = ` (proporcional del mes de ${previousMonthName})`;
                    let newProductName: string = '';
                    if((account.productName.length + proportionalMessage.length) > 200) {
                        let excesiveCharacters: number = ((account.productName.length + proportionalMessage.length) - 200) + 4;
                        newProductName = account.productName;
                        newProductName = newProductName.substr(0, (newProductName.length - excesiveCharacters));
                        newProductName = `${newProductName}... ${proportionalMessage}`
                    } else {
                        newProductName = `${account.productName}${proportionalMessage}`;
                    }
                    // Se agrega el elemento.
                    // NOTE: Para el proporcional del mes anterior se agrega un solo registro.
                    items.push({
                        productId: account.productId,
                        productName: newProductName,
                        quantity: 1,
                        discount: 0,
                        unitCost: proportionalSubTotal,
                        total: proportionalSubTotal,
                        key: account.accountNumber
                    });
                    // MES ACTUAL.
                    let breakdownType: string = /*account.breakdownType ||*/ 'B';
                    switch(breakdownType.toUpperCase().trim()) {
                        // Tipo "A": Desglosar 1 x 1.
                        case 'A': {
                                for(let index: number = 1; index < (account.quantity || 1); index++) {
                                    // Se da formato a los totales de la cuenta asociada.
                                    let normalSubTotal: number = account.unitCost ? parseFloat(account.unitCost.toFixed(2)) : 0;
                                    let normalTaxes: number = parseFloat((normalSubTotal * 0.16).toFixed(2));
                                    let normalDiscount: number = account.discount ? parseFloat((account.discount / (account.quantity || 1)).toFixed(2)) : 0;
                                    // Se modifican los totales.
                                    subTotal += normalSubTotal;
                                    taxes = parseFloat((taxes + normalTaxes).toFixed(2));
                                    discount += normalDiscount;
                                    total += parseFloat(((normalSubTotal + normalTaxes) - normalDiscount).toFixed(2));
                                    // Se agrega el elemento.
                                    items.push({
                                        productId: account.productId,
                                        productName: account.productName,
                                        quantity: 1,
                                        discount: 0, // normalDiscount,
                                        unitCost: normalSubTotal,
                                        total: normalSubTotal,
                                        key: account.accountNumber
                                    });
                                }
                            }
                            break;
                        // Tipo "B": Desglosar con una sola cantidad.
                        case 'B': {
                                // Se da formato a los totales de la cuenta asociada.
                                // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                // El costo unitario es diferente al subtotal, a este ya se le aplicaron cálculos de impuestos y etc.
                                let normalQuantity: number = account.quantity || 1;
                                let normalUnitCost: number = account.unitCost ? parseFloat(account.unitCost.toFixed(2)) : 0;
                                let normalDiscount: number = account.discount ? parseFloat(account.discount.toFixed(2)) : 0;
                                // let normalSubTotal: number = account.subTotal ? parseFloat(account.subTotal.toFixed(2)) : 0;
                                // let normalTaxes: number = account.taxes ? parseFloat(account.taxes.toFixed(2)) : 0;
                                // Se modifican los totales.
                                // NOTE: Se debe utilizar el costo unitario de la cuenta.
                                subTotal += normalUnitCost;
                                discount += normalDiscount;
                                // NOTE: Los impuestos y el total se deben calcular al final.
                                // taxes = parseFloat((taxes + normalTaxes).toFixed(2));
                                // total += parseFloat(((normalSubTotal + normalTaxes) - normalDiscount).toFixed(2));
                                // Se agrega el elemento.
                                items.push({
                                    productId: account.productId,
                                    productName: account.productName,
                                    quantity: normalQuantity,
                                    discount: normalDiscount,
                                    unitCost: normalUnitCost,
                                    total: parseFloat((normalUnitCost * normalQuantity).toFixed(2)),
                                    key: account.accountNumber
                                });
                            }
                            break;
                        // Tipo "C": Un solo registro con la cantidad en la descripción ¯\_(ツ)_/¯.
                        case 'C': {
                                // Se da formato a los totales de la cuenta asociada.
                                let normalSubTotal: number = account.subTotal ? parseFloat(account.subTotal.toFixed(2)) : 0;
                                let normalTaxes: number = account.taxes ? parseFloat(account.taxes.toFixed(2)) : 0;
                                let normalDiscount: number = account.discount ? parseFloat(account.discount.toFixed(2)) : 0;
                                // Se modifican los totales.
                                subTotal += normalSubTotal;
                                taxes = parseFloat((taxes + normalTaxes).toFixed(2));
                                discount += normalDiscount;
                                total += parseFloat(((normalSubTotal + normalTaxes) - normalDiscount).toFixed(2));
                                // Se agrega el elemento.
                                items.push({
                                    productId: account.productId,
                                    productName: `${account.quantity} x ${account.productName}`,
                                    quantity: 1,
                                    discount: 0, // normalDiscount,
                                    unitCost: normalSubTotal,
                                    total: normalSubTotal,
                                    key: account.accountNumber
                                });
                            }
                            break;
                    }
                } else if (proportionalCharge > 0) {
                    // El recibo debe ser sólo del proporcional actual.
                    // Totales.
                    subTotal = parseFloat(proportionalCharge.toFixed(2));
                    taxes = parseFloat((subTotal * 0.16).toFixed(2));
                    discount = 0;
                    total = parseFloat(((subTotal + taxes) - discount).toFixed(2));
                    // NOTE: El nombre del producto tiene una longitud de 200.
                    let today: Date = new Date();
                    let currentMonthName: string = number2Month((today.getMonth() + 1), true);
                    let proportionalMessage: string = ` (proporcional del mes de ${currentMonthName})`;
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
                        unitCost: subTotal,
                        total: subTotal,
                        key: account.accountNumber
                    });
                } else {
                    // El recibo es el normal del mes.
                    let breakdownType: string = /*account.breakdownType ||*/ 'B';
                    switch(breakdownType.toUpperCase().trim()) {
                        // Tipo "A": Desglosar 1 x 1.
                        case 'A': {
                                for(let index: number = 1; index < (account.quantity || 1); index++) {
                                    // Se da formato a los totales de la cuenta asociada.
                                    let normalSubTotal: number = account.unitCost ? parseFloat(account.unitCost.toFixed(2)) : 0;
                                    let normalTaxes: number = parseFloat((normalSubTotal * 0.16).toFixed(2));
                                    let normalDiscount: number = account.discount ? parseFloat((account.discount / (account.quantity || 1)).toFixed(2)) : 0;
                                    // Se modifican los totales.
                                    subTotal += normalSubTotal;
                                    taxes = parseFloat((taxes + normalTaxes).toFixed(2));
                                    discount += normalDiscount;
                                    total += parseFloat(((normalSubTotal + normalTaxes) - normalDiscount).toFixed(2));
                                    // Se agrega el elemento.
                                    items.push({
                                        productId: account.productId,
                                        productName: account.productName,
                                        quantity: 1,
                                        discount: 0, // normalDiscount,
                                        unitCost: normalSubTotal,
                                        total: normalSubTotal,
                                        key: account.accountNumber
                                    });
                                }
                            }
                            break;
                        // Tipo "B": Desglosar con una sola cantidad.
                        case 'B': {
                                // Se da formato a los totales de la cuenta asociada.
                                // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                // El costo unitario es diferente al subtotal, a este ya se le aplicaron cálculos de impuestos y etc.
                                let normalQuantity: number = account.quantity || 1;
                                let normalUnitCost: number = account.unitCost ? parseFloat(account.unitCost.toFixed(2)) : 0;
                                let normalDiscount: number = account.discount ? parseFloat(account.discount.toFixed(2)) : 0;
                                // let normalSubTotal: number = account.subTotal ? parseFloat(account.subTotal.toFixed(2)) : 0;
                                // let normalTaxes: number = account.taxes ? parseFloat(account.taxes.toFixed(2)) : 0;
                                // Se modifican los totales.
                                // NOTE: Se debe utilizar el costo unitario de la cuenta ¡¡¡PERO MULTIPLICADO POR LA CANTIDAD PEDAZO DE ANIMAL!!!.
                                subTotal += parseFloat((normalUnitCost * normalQuantity).toFixed(2));
                                discount += normalDiscount;
                                // taxes = parseFloat((taxes + normalTaxes).toFixed(2));
                                // total += parseFloat(((normalSubTotal + normalTaxes) - normalDiscount).toFixed(2));
                                // Se agrega el elemento.
                                items.push({
                                    productId: account.productId,
                                    productName: account.productName,
                                    quantity: account.quantity,
                                    discount: normalDiscount,
                                    unitCost: normalUnitCost,
                                    total: parseFloat((normalUnitCost * normalQuantity).toFixed(2)),
                                    key: account.accountNumber
                                });
                            }
                            break;
                        // Tipo "C": Un solo registro con la cantidad en la descripción ¯\_(ツ)_/¯.
                        case 'C': {
                                // Se da formato a los totales de la cuenta asociada.
                                let normalSubTotal: number = account.subTotal ? parseFloat(account.subTotal.toFixed(2)) : 0;
                                let normalTaxes: number = account.taxes ? parseFloat(account.taxes.toFixed(2)) : 0;
                                let normalDiscount: number = account.discount ? parseFloat(account.discount.toFixed(2)) : 0;
                                // Se modifican los totales.
                                subTotal += normalSubTotal;
                                taxes = parseFloat((taxes + normalTaxes).toFixed(2));
                                discount += normalDiscount;
                                total += parseFloat(((normalSubTotal + normalTaxes) - normalDiscount).toFixed(2));
                                // Se agrega el elemento.
                                items.push({
                                    productId: account.productId,
                                    productName: `${account.quantity} x ${account.productName}`,
                                    quantity: 1,
                                    discount: 0, // normalDiscount,
                                    unitCost: normalSubTotal,
                                    total: normalSubTotal,
                                    key: account.accountNumber
                                });
                            }
                            break;
                    }
                }
            }

            //TTTTT  OOO  TTTTT  AAA  L     EEEEE  SSSS
            //  T   O   O   T   A   A L     E     S
            //  T   O   O   T   AAAAA L     EEE    SSS
            //  T   O   O   T   A   A L     E         S
            //  T    OOO    T   A   A LLLLL EEEEE SSSS

            discount = parseFloat(discount.toFixed(2));
            subTotal = parseFloat(subTotal.toFixed(2));
            taxes = parseFloat(((subTotal - discount) * 0.16).toFixed(2));
            total = parseFloat(((subTotal - discount) + taxes).toFixed(2));

            //RRRR  EEEEE  CCCC IIIII BBBB   OOO
            //R   R E     C       I   B   B O   O
            //RRRR  EEE   C       I   BBBB  O   O
            //R   R E     C       I   B   B O   O
            //R   R EEEEE  CCCC IIIII BBBB   OOO

            let receipt: Receipt = {
                parentId: account.accountNumber,
                parentType: 'account',
                folio: 0,                   // No es necesario enviar el folio.
                movementDate,
                items,
                total,
                subTotal,
                taxes,
                discount,
                exchangeRate: 1,            // Obtener el tipo de cambio del día.
                currencyValue: 'MXN',
                statusValue: 'pending',
                typeValue: 'monthly',
                // receiptFile: '',
                // invoice: ''
            };

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

            return resolve({
                receipt,
                slaveAccounts: account.slaveAccounts || []
            });
        });
    }

    //M   M IIIII DDDD  DDDD  L     EEEEE W   W  AAA  RRRR  EEEEE
    //MM MM   I   D   D D   D L     E     W   W A   A R   R E
    //M M M   I   D   D D   D L     EEE   W W W AAAAA RRRR  EEE
    //M   M   I   D   D D   D L     E     WW WW A   A R   R E
    //M   M IIIII DDDD  DDDD  LLLLL EEEEE W   W A   A R   R EEEEE

    public isAccountActive(accountNumber: string): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            try {
                let account: Account = await this.getAccount({ accountNumber });
                let status: string = account.statusValue || 'unknown';
                let isForcedTerm: boolean = account.isForcedTerm;
                if(status === 'active') {
                    return resolve(true);
                } else if(status === 'inactive' && !isForcedTerm) {
                    return resolve(true);
                } else {
                    return reject({
                        status: status,
                        module: 'Cuentas',
                        message: 'El estatus de la cuenta no es ACTIVA o no es PREPAGO.'
                    });
                }
            } catch(error) {
                return reject(error);
            }
        });
    }

    // AAA  L     TTTTT  AAA  N   N
    //A   A L       T   A   A NN  N
    //AAAAA L       T   AAAAA N N N
    //A   A L       T   A   A N  NN
    //A   A LLLLL   T   A   A N   N

    public activateAllComplements(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {


            //======================================================================================================================
            // TEMPORAL:
            // Listado de las cuentas a excluir sólo para la fecha: 02/09/2020.
            // let accounts2Exclude: Array<string> = ['MV104-0000013','MV104-0000014','MV104-0000017','MV104-0000018','MV104-0000019','MV104-0000020','MV104-0000021','MV104-0000022','MV104-0000025','MV104-0000026','MV104-0000030','MV104-0000031','MV104-0000032','MV104-0000033','MV104-0000035','MV104-0000036','MV104-0000037','MV104-0000038','MV104-0000039','MV104-0000040','MV104-0000041','MV104-0000042','MV104-0000043','MV104-0000045','MV104-0000046','MV104-0000048','MV104-0000049','MV104-0000050','MV104-0000053','MV104-0000054','MV104-0000055','MV104-0000056','MV104-0000057','MV104-0000058','MV104-0000059','MV104-0000060','MV104-0000061','MV104-0000062','MV104-0000063','MV104-0000064','MV104-0000065','MV104-0000066','MV104-0000067','MV104-0000068','MV104-0000069','MV104-0000070','MV104-0000071','MV104-0000072','MV104-0000073','MV104-0000075','MV104-0000076','MV104-0000077','MV104-0000078','MV104-0000079','MV104-0000080','MV104-0000082','MV104-0000083','MV104-0000084','MV104-0000085','MV104-0000086','MV104-0000087','MV104-0000088','MV104-0000089','MV104-0000091','MV104-0000093','MV104-0000094','MV104-0000136','MV104-0000230','MV104-0000396','MV104-0000795','MV104-0001079','MV104-0001102','MV104-0001393','MV104-0001394','MV104-0001395','MV104-0001396','MV104-0001397','MV104-0001398','MV104-0001399','MV104-0001400','MV104-0001401','MV104-0001403','MV104-0001404','MV104-0001405','MV104-0001406','MV104-0001407','MV104-0001408','MV104-0001409','MV104-0001410','MV104-0001411','MV104-0001415','MV104-0001416','MV104-0001417','MV104-0001418','MV104-0001419','MV104-0001420','MV104-0001421','MV104-0001422','MV104-0001423','MV104-0001425','MV104-0001504','MV104-0001555','MV104-0001556','MV104-0001567','MV104-0001568','MV104-0001602','MV104-0001603','MV104-0001604','MV104-0001605','MV104-0001606','MV104-0001607','MV104-0001631','MV104-0001724','MV104-0001725','MV104-0001797','MV104-0001799','MV104-0001809','MV104-0001818','MV104-0001847','MV104-0001848','MV104-0001887','MV104-0001888','MV104-0001889','MV104-0001890','MV104-0001891','MV104-0001892','MV104-0001903','MV104-0001905','MV104-0001913','MV104-0001922','MV104-0001923','MV104-0001924','MV104-0001936','MV104-0001937','MV104-0001956','MV104-0001957','MV104-0001958','MV104-0001964','MV104-0001965','MV104-0001968','MV104-0001969','MV104-0001976','MV104-0001977','MV104-0001982','MV104-0001983','MV104-0001998','MV104-0002001','MV104-0002008','MV104-0002037','MV104-0002041','MV104-0001841'];
            //======================================================================================================================


            // 1. Buscar todos los productos tipo movilidad y que sean paquete.
            let productModel: ProductModel = new ProductModel();
            let products: { results: Array<Product>, summary: any } = { results: [], summary: {} };
            try {
                let params = { all: true, categoryValue: 'MV104', isBundle: true, statusValue: 'active' };
                products = await productModel.getProducts(params);
                // console.log('[MODELOS][CUENTAS][activateAllComplements] Productos de movilidad: ', products.summary);
            } catch(error) {
                return reject(error);
            }
            // 2. Si se encontraron resultados, se recorren.
            let productIds: Array<string> = [];
            if(products.results.length > 0) {
                for(const product of products.results) {
                    productIds.push(product._id);
                }
            } else {
                return reject({
                    status: 400,
                    module: 'Cuentas',
                    message: 'No se encontró ningún producto de movilidad activo.'
                });
            }
            // console.log('[MODELOS][CUENTAS][activateAllComplements] Identificadores: ', productIds);
            // 3. Se piden todas las cuentas que tengan alguno de los productos de arriba.
            let accounts: { results: Array<Account>, summary: any } = { results: [], summary: {} };
            try {
                let params = { all: true, statusValue: 'active', productId: productIds };
                accounts = await this.getAccounts(params);
                // console.log('[MODELOS][CUENTAS][activateAllComplements] Cuentas con productos adicionales: ', accounts.summary);
            } catch(error) {
                return reject(error);
            }
            // 4. Se activan los paquetes complemento.
            // let accountNumbers: Array<string> = [];
            if(accounts.results.length > 0) {
                let errors: Array<any> = [];
                let activatedComplements: number = 0;
                for(const account of accounts.results) {


                    //==============================================================================================================
                    // TEMPORAL:
                    // Se excluyen las cuentas de la lista de arriba ↑
                    // if(accounts2Exclude.indexOf(account.accountNumber) >= 0) continue;
                    //==============================================================================================================


                    try {
                        // console.log('[MODELOS][CUENTAS][activateAllComplements] No se brincó la cuenta: ', account.accountNumber);
                        await this.activateComplements({ accountNumber: account.accountNumber });
                        // accountNumbers.push(account.accountNumber);
                        activatedComplements++;
                    } catch(error) {
                        errors.push(error);
                    }
                }
                // console.log('[MODELOS][CUENTAS][activateAllComplements] Cuentas: ', JSON.stringify(accountNumbers));
                return resolve({
                    status: 200,
                    message: `Proceso terminado. Complementos activados: ${activatedComplements}. Errors: ${errors.length}.`
                });
            } else {
                return reject({
                    status: 400,
                    module: 'Cuentas',
                    message: 'No se encontró ninguna cuenta activa con producto de movilidad.'
                });
            }
        });
    }

    public activateComplements(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { accountNumber, ...rest }: { accountNumber: string } & any = body;

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let account: Account = new Account();
            let product: Product = new Product();
            try {
                account = await this.getAccount({ accountNumber });
                product = account.product || new Product();
            } catch(error) {
                return reject(error);
            }

            //PPPP  RRRR   OOO  DDDD  U   U  CCCC TTTTT  OOO       PPPP  RRRR  IIIII N   N  CCCC IIIII PPPP   AAA  L
            //P   P R   R O   O D   D U   U C       T   O   O      P   P R   R   I   NN  N C       I   P   P A   A L
            //PPPP  RRRR  O   O D   D U   U C       T   O   O      PPPP  RRRR    I   N N N C       I   PPPP  AAAAA L
            //P     R   R O   O D   D U   U C       T   O   O      P     R   R   I   N  NN C       I   P     A   A L
            //P     R   R  OOO  DDDD   UUU   CCCC   T    OOO       P     R   R IIIII N   N  CCCC IIIII P     A   A LLLLL

            let msisdn: string = account.phone;
            if(!msisdn || msisdn.length !== 10) {
                return reject({
                    status: 400,
                    module: 'Cuentas',
                    message: 'La cuenta no tiene dado de alta un teléfono (MSISDN).'
                });
            }
            let offeringId: string = product.code;
            // console.log('[MODELOS][CUENTAS][activateComplements] Producto principal: ', msisdn);
            // console.log('[MODELOS][CUENTAS][activateComplements] Oferta principal: ', offeringId);
            let offerings: Array<string> = [];          // <- Este es el arreglo de ofertas complementarias.
            let altanModel: AltanAPIsModel = new AltanAPIsModel();
            // Este proceso arma las ofertas complementarias a activar.
            if(product.bundle && product.bundle.length > 0) {
                for(const productInBundle of product.bundle) {
                    // @ts-ignore
                    let offering: string = productInBundle.productId.code;
                    let times: number = productInBundle.quantity || 1;
                    if(offering !== offeringId) {
                        for(let i: number = 1; i <= times; i++) {
                            offerings.push(offering);
                        }
                    }
                }
                // console.log('[MODELOS][CUENTAS][activateComplements] Ofertas adicionales: ', offerings);
                try {
                    await altanModel.postPurchase({ msisdn, offerings });
                    // console.log('[MODELOS][CUENTAS][activateComplements] Producto principal - Compras exitosas.');
                    // NOTE: Aún no se debe terminar la ejecución de la función, faltan los servicios asociados a la cuenta principal.
                    /*
                    return resolve({
                        status: 200,
                        message: 'Complementos activados con éxito.'
                    });
                    */
                } catch(error) {
                    return reject(error);
                }
            } else {
                return reject({
                    status: 400,
                    module: 'Cuentas',
                    message: 'No se encontró ningún producto listado en el paquete.'
                });
            }

            //PPPP  RRRR   OOO  DDDD  U   U  CCCC TTTTT  OOO   SSSS
            //P   P R   R O   O D   D U   U C       T   O   O S
            //PPPP  RRRR  O   O D   D U   U C       T   O   O  SSS
            //P     R   R O   O D   D U   U C       T   O   O     S
            //P     R   R  OOO  DDDD   UUU   CCCC   T    OOO  SSSS

            // let msisdns: Array<string> = [];
            // Se buscan todos los productos Altán asociados a la cuenta principal.
            let altanProductModel: AltanProductModel = new AltanProductModel();
            let altanProducts: { results: Array<AltanProduct>, summary: any } = { results: [], summary: {} };
            try {
                altanProducts = await altanProductModel.getAltanProducts({ accountNumber });
            } catch(error) {
                return resolve({
                    status: 206,
                    message: 'Se pudieron activar los complementos del servicio principal, pero no se encontraron servicios adicionales.'
                });
            }
            // Si hay servicios asociados, se deben activar igual.
            let errors: Array<any> = [];
            if(altanProducts.results.length > 0) {
                for(const altanProduct of altanProducts.results) {
                    // console.log('[MODELOS][CUENTAS][activateComplements] Producto asociado: ', altanProduct.msisdn);
                    try {
                        await altanModel.postPurchase({ msisdn: altanProduct.msisdn, offerings });
                        // console.log('[MODELOS][CUENTAS][activateComplements] Producto asociado - Compras exitosas.');
                    } catch(error) {
                        errors.push(error);
                    }
                }
            }
            return resolve({
                status: errors.length > 0 ? 206 : 200,
                message: 'Complementos activados con éxito.',
                errors
            });
        });
    }
}