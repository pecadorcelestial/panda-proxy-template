// Módulos.
import axios, { AxiosResponse } from 'axios';
import idx from 'idx';
import { IsDefined, IsString, IsEnum, IsNumber, IsDateString, Min, Max, MaxLength, validate, ValidateIf } from 'class-validator';
import { IsRFC } from "../decorators/rfc";
import convert from 'xml-js';
// Configuración.
import configuration from '../configuration';
// Modelos.
import AccountModel, { Account } from './accounts';
import AccountProcessesModel from './processes/accounts';
import { Address } from './addresses';
import FilesModel from './files';
import { FileStructure } from './notifications';
import ClientModel, { Client } from './clients';
import GeneralSettingsModel, { GeneralSettings } from './generalSettings';
import InvoiceModel, { Invoice as InvoiceV1} from './invoices';
import ReceiptModel, { Receipt, IPendingReceipt } from './receipts';
import { ReceiptStatusController } from '../controllers/catalogs/receiptStatuses';
import PaymentModel, { Payment as PaymentV1 } from './payments';
// Funciones.
import { RemodelErrors } from '../scripts/data-management';
import { currencyFormat, number2Words } from '../scripts/numbers';
import { date2String, EDateType, date2StringFormat } from '../scripts/dates';
import { isEmpty } from '../scripts/object-prototypes';
import { pdf2Base64 } from '../classes/pdf';
// Constantes.
import { CFDI_USE, PAYMENT_FORMS, PAYMENT_METHODS, SERIES, VOUCHER_TYPES, RELATIONSHIP_TYPES, TAX_TYPES } from '../constants/constants';
// Interfaces.
import { IJSON2Issue, IConcept, ITransferedTaxes, IConceptP, IIssueResponse, IRelatedCFDIs, IComplement, IPayment, IRelatedDocuments } from '../interfaces/json2Issue';

export class Invoice {
    // Versión.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    version?: string = '3.3'; // 3.3, valor por default - Requerido.
    // Serie.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @IsEnum(SERIES, {
        message: 'El valor no está dentro del catálogo.',
		groups: ['P', 'E', 'I']
    })
    serie: string; // Requerido (normal === A complementos === P).
    // Folio.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    folio?: number; // Requerido (autoincremental por serie).
    // Fecha de creación.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsDateString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    createdDate?: string; // Requerido.
    // Sello / Estampa del CFDI.
    cfdiStamp?: string; // Emtpy
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @IsEnum(PAYMENT_FORMS, {
        message: 'El valor no está dentro del catálogo.',
		groups: ['P', 'E', 'I']
    })
    paymentForm: string; // Mandar el value del catálogo - Requerido
    // Número del certificado del CFDI.
    cfdiCertNumber?: string; // Emtpy.
    // Certificado del CFDI.
    cfdiCertificate?: string; // Emtpy.
    // Condiciones de pago.
    paymentConditions?: string; // Emtpy.
    // Subtotal.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    subTotal?: number; // Requerido.
    // Descuento global.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    discount?: number; // Requerido si en algún concepto se incluye descuento (es MONTO no PORCENTAJE).
    // Moneda.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    currency: string; // Requerido, mandar el 'value' del catálogo.
    // Tipo de cambio.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    exchangeRate?: number; // Requerido - Default 1 si es MXN.
    // Total.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    total?: number; // Requerido.
    // Tipo de comprobante.
    // I = Ingreso.
    // E = Egreso.
    // P = Complemento.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @IsEnum(VOUCHER_TYPES, {
        message: 'El valor no está dentro del catálogo.',
		groups: ['P', 'E', 'I']
    })
    compType: string = 'I'; // Requerido, por default 'I' = Ingreso.
    // Método de pago.
    @ValidateIf(o => o.compType != 'P')
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @IsEnum(PAYMENT_METHODS, {
        message: 'El valor no está dentro del catálogo.',
		groups: ['P', 'E', 'I']
    })
    paymentMethod: string; // Requerido, NO enviar si 'compType' = 'P'.
    // Lugar de expedición.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({},{
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(1000, {
        message: 'El valor es menor al permitido.',
		groups: ['P', 'E', 'I']
    })
    @Max(99999, {
        message: 'El valor es mayor al permitido.',
		groups: ['P', 'E', 'I']
    })
	expeditionPlace?: string; // Requerido, es el ZipCode de donde se emitió la factura.
	// CFDI's relacionados (cuando aplique).
	relatedCfdis?: Array<RelatedCFDI>;
	// Complemento de pago (cuando aplique).
	paymentComplement?: PaymentComplement;  // Solo enviar si 'compType' = 'P'.
    // Datos del EMISOR.
    // RFC.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @MaxLength(13, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
		groups: ['P', 'E', 'I']
    })
    @IsRFC({
        message: 'El valor no tiene el formato correcto.',
		groups: ['P', 'E', 'I']
    })
    issuerRFC?: string; // Requerido.
    // Nombre.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    issuerName?: string; // Requerido - Razón Social.
    // Regimen fiscal.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
	issuerTaxRegime?: string; // Requerido, 'value' del catálogo.
    // Datos del RECEPTOR.
    // RFC.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @MaxLength(13, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
		groups: ['P', 'E', 'I']
    })
    @IsRFC({
        message: 'El valor no tiene el formato correcto.',
		groups: ['P', 'E', 'I']
    })
    receptorRFC: string; // Requerido.
    // Razón social.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    receptorName: string; // Requerido - Razón Social.
    // Uso de CFDI.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @IsEnum(CFDI_USE, {
        message: 'El valor no está dentro del catálogo.',
		groups: ['P', 'E', 'I']
    })
	cfdiUse: string; // Requerido.
	// Conceptos.
	concepts: Array<Concept> | Array<ConceptP>;
    // Impuestos, NO ENVIAR si el 'compType' = 'P'.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    totalTaxAmount?: number; // Requerido, es la SUMA de todos los 'amount' dentro del arreglo de 'taxes' de 'concepts'. Daaaamn...
    // Detalles de los impuesto.
    taxDetails?: Array<TaxDetail>;

    // Cuenta.
    account?: Account;
    // Cliente.
    client?: Client;
}

export class RelatedCFDI {
    // Identificador UUID.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    uuid: string; // "UUID v4";
    // Tipo de relación.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @IsEnum(RELATIONSHIP_TYPES, {
        message: 'El valor no está dentro del catálogo.',
		groups: ['P', 'E', 'I']
    })
    relationshipType: string; // Nos falta un catálogo de tipo de relaciones de cfdi.
}

export class PaymentComplement {
    // Versión.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    version: string; // Requerido y valor por default = "1.0"
    // Fecha de pago (puede ser anterior a la fecha de creación de la clase INVOICE).
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsDateString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    paymentDate: string; // Requerido, fecha del pago.
    // Forma de pago.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @IsEnum(PAYMENT_FORMS, {
        message: 'El valor no está dentro del catálogo.',
		groups: ['P', 'E', 'I']
    })
    paymentForm: string; // Requerido, la forma en la que se recibió el pago, 'value' del catálogo.
    // Moneda.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    currency: string; // Requerido, 'value' del catálogo.
    exchangeRate?: number;
    // Monto total.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    amount: number; // Requerido - Monto total del Pago.
    // Cuenta ordenante.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    ordAccount: string; // Opcional, (Cuanta ordenante)
    // RFC de la cuenta ordenante.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @MaxLength(13, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
		groups: ['P', 'E', 'I']
    })
    @IsRFC({
        message: 'El valor no tiene el formato correcto.',
		groups: ['P', 'E', 'I']
    })
    issuerRfcOrdAccount: string; // Requerido, SOLO si se registra una cuenta ordenante (RFC de la cuenta ordenante).
    // Nombre del banco de la cuenta ordenante.
    ordBankName: string; // Requerido, SOLO si se registra una cuenta ordenante (Nombre del Banco ordenante),
    // Pagos (detalle).
    payments: Array<Payment>;
}

export class Payment {
    // Identificador UUID.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    relatedCfdi: string; // Requerido - UUID de la factura a la que aplicó el pago.
    // Moneda.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    currencyDR: string; // Requerido - Moneda, pero, de la factura a la cual se aplicó el pago (la del UUID de arriba)
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    exchangeRateDR?: number;
    // Método de pago.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @IsEnum(PAYMENT_METHODS, {
        message: 'El valor no está dentro del catálogo.',
		groups: ['P', 'E', 'I']
    })
    paymentMethodDR: string; // Requerido - Método de pago de la factura a la cual se aplicó el pago. En teoría siempre debe ser 'PPD'.
    // Número de la parcialidad.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    partiality: number; // Requerido - No. de Parcialidad de la factura pagada (Si se pago en dos tantos, deberia decir un 2 por ejemplo).
    // Adeudo anterior.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    lastBalance: number; // Requerido - Saldo anterior de la factura pagada.
    // Monto a pagar.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    amount: number; // Requerido - Monto pagado a la factura realcionada.
    // Adeudo siguiente.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    currentBalance: number; // Requerido - Saldo actual de la factura pagada, debe ser: 'lastBalance' - 'amount' = 'currentBalance', y nunca debe ser negativo.
    serieNFolio: string;
}

// NOTE: Cuando el 'compType' sea 'P' (complemento de pago), de debe emandar SOLO éste concepto, 
//       tal cual, con los valores que vienen, así lo requiere el SAT ¯\_(ツ)_/¯.
export class ConceptP {
    // Descripción.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    description: string;
    // Clave de unidad.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    unitCve?: string = 'E48';
    // Clave del producto o servicio.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    cveProductService: string;
    // Valor unitario.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    unitValue: number;
    // Cantidad.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    quantity: number;
    // Monto / Total.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    amount: number;
    // Identificador.
    idNumber?: string;
    // Impuestos por concepto
    taxes?: Array<Tax>;
    // Descuento.
    discount: number;
}

export class Concept {
    // Descripción.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    description: string; // Requerido.
    // Clave de unidad.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    unitCve?: string; // Requerido - De momento solo usamos esa clave, mandarla por default.
    // Clave del producto o servicio.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    cveProductService: string; // Requerido, NOTA: Nos falto agregar este campo en la cuenta!
    // Valor unitario.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    unitValue: number; // Requerido.
    // Cantidad.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    quantity: number; // Requerido.
    // Monto / total.
    // @IsDefined({
    //     message: 'El campo es requerido.'
    // })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    amount: number; // Requerido.
    // Descuento.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    discount: number; // Requerido.
    // Identificador.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    idNumber: string; // Opcional - normalmente, se manda el número de cuenta/cliente.
    // Impuestos por concepto
    taxes?: Array<Tax>;
}

export class Tax {
    // Base (monto).
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    base: number; // Requerido, es el importe (amount) del concepto.
    // Tasa.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    tasa: number; // Requerido, es el valor del impuesto, por default solo es el IVA = 0.160000 (si, a 6 decimales).
    // Monto / total.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    amount: number; // Requerido = Base * Tasa.
    // Tipo de impuesto.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @IsEnum(TAX_TYPES, {
        message: 'El valor no está dentro del catálogo.',
		groups: ['P', 'E', 'I']
    })
    tax: string; // Requerido, 002 = IVA, 003 = ISR, de momento, nosotros solo usamos IVA = 002.
    // Tipo de factor.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    factorType: string; // Requerido, de momento solo estamos cobrando el tipo de factor = "Tasa".
}

export class TaxDetail {
    // Total.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    amount: number; // Requerido - Debe ser la suma, de todos los AMOUNT, de los TAXES, pero, solo del mismo tipo de impuesto.
    // Tipo de impuesto.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @IsEnum(TAX_TYPES, {
        message: 'El valor no está dentro del catálogo.',
		groups: ['P', 'E', 'I']
    })
    tax: string; // Requerido - Tipo de impuesto (IVA).
    // Tasa.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
		groups: ['P', 'E', 'I']
    })
    tasa: number; // Requerido - Tasa del impuesto = 16% a 6 decimales.
    // Tipo de factor.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['P', 'E', 'I']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['P', 'E', 'I']
    })
    factorType: string; // Requerido - Enviar TASA por default.
}

export default class InvoiceModelV2 {

    constructor() {}

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    private async validateSchemas(_invoice: any = {}, _relatedCfdis: any = [], _paymentComplement: any = {}, _concepts: any = [], _taxDetails: any = [], groups: Array<string> = ['I']): Promise<any> {
        
        let errors: Array<any> = [];
        
        // Información general de la factura.
        let invoice = new Invoice();
        invoice.version = _invoice.version;
        invoice.serie = _invoice.serie;
        invoice.folio = _invoice.folio;
        invoice.createdDate = _invoice.createdDate;
        invoice.paymentForm = _invoice.paymentForm;
        invoice.subTotal = _invoice.subTotal;
        invoice.discount = _invoice.discount;
        invoice.currency = _invoice.currency;
        invoice.exchangeRate = _invoice.exchangeRate;
        invoice.total = _invoice.total;
        invoice.compType = _invoice.compType;
        invoice.paymentMethod = _invoice.paymentMethod;
        invoice.expeditionPlace = _invoice.expeditionPlace;
        invoice.issuerRFC = _invoice.issuerRFC;
        invoice.issuerName = _invoice.issuerName;
        invoice.issuerTaxRegime = _invoice.issuerTaxRegime;
        invoice.receptorRFC = _invoice.receptorRFC;
        invoice.receptorName = _invoice.receptorName;
        invoice.cfdiUse = _invoice.cfdiUse;
        invoice.totalTaxAmount = _invoice.totalTaxAmount;
        let invoiceErrors = await validate(invoice, { groups, skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(invoiceErrors, 'invoice'));
        // CFDIs relacionados.
        _relatedCfdis.forEach( async (_relatedCFDI: any, index: number) => {
            let relatedCFDI = new RelatedCFDI();
            relatedCFDI.uuid = _relatedCFDI.uuid;
            relatedCFDI.relationshipType = _relatedCFDI.relationshipType;
            let relatedCFDIsErrors = await validate(relatedCFDI, { groups, skipMissingProperties: true });
            errors = errors.concat(RemodelErrors(relatedCFDIsErrors, `invoice.relatedCfdis[${index}]`));
        });
        // Complementos de pagos.
        if(invoice.compType && invoice.compType === 'P') {
            let paymentComplement = new PaymentComplement();
            paymentComplement.version = _paymentComplement.version;
            paymentComplement.paymentDate = _paymentComplement.paymentDate;
            paymentComplement.paymentForm = _paymentComplement.paymentForm;
            paymentComplement.currency = _paymentComplement.currency;
            paymentComplement.amount = _paymentComplement.amount;
            paymentComplement.ordAccount = _paymentComplement.ordAccount;
            paymentComplement.issuerRfcOrdAccount = _paymentComplement.issuerRfcOrdAccount;
            paymentComplement.ordBankName = _paymentComplement.ordBankName;
            let paymentComplementErrors = await validate(paymentComplement, { groups, skipMissingProperties: true });
            errors = errors.concat(RemodelErrors(paymentComplementErrors, `invoice.paymentComplement`));
            // Pagos.
            if(Array.isArray(_paymentComplement.payments) && _paymentComplement.payments.length > 0) {
                _paymentComplement.payments.forEach( async (_payment: any, index: number) => {
                    let payment = new Payment();
                    payment.relatedCfdi = _payment.relatedCfdi;
                    payment.currencyDR = _payment.currencyDR;
                    payment.paymentMethodDR = _payment.paymentMethodDR;
                    payment.partiality = _payment.partiality;
                    payment.lastBalance = _payment.lastBalance;
                    payment.amount = _payment.amount;
                    payment.currentBalance = _payment.currentBalance;
                    let paymentErrors = await validate(payment, { groups, skipMissingProperties: true });
                    errors = errors.concat(RemodelErrors(paymentErrors, `invoice.paymentComplement.payments[${index}]`));
                });
            }
        }
        // Conceptos.
        _concepts.forEach( async (_concept: any, index: number) => {
            if(invoice.compType && invoice.compType === 'P') {
                let conceptP = new ConceptP();
                conceptP.description = _concept.description;
                conceptP.unitCve = _concept.unitCve;
                conceptP.cveProductService = _concept.cveProductService;
                conceptP.unitValue = _concept.unitValue;
                conceptP.quantity = _concept.quantity;
                conceptP.amount = _concept.amount;
                let conceptErrors = await validate(conceptP, { skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(conceptErrors, `invoice.concepts[${index}]`));
            } else {
                let concept = new Concept();
                concept.description = _concept.description;
                concept.unitCve = _concept.unitCve;
                concept.cveProductService = _concept.cveProductService;
                concept.unitValue = _concept.unitValue;
                concept.quantity = _concept.quantity;
                concept.amount = _concept.amount;
                concept.idNumber = _concept.idNumber;
                let conceptErrors = await validate(concept, { skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(conceptErrors, `invoice.concepts[${index}]`));
                // Impuestos.
                if(Array.isArray(_concept.taxes) && _concept.taxes.length > 0) {
                    _concept.taxes.forEach( async (_tax: any, subIndex: number) => {
                        let tax = new Tax();
                        tax.base = _tax.base;
                        tax.tasa = _tax.tasa;
                        tax.amount = _tax.amount;
                        tax.tax = _tax.tax;
                        tax.factorType = _tax.factorType;
                        let taxErrors = await validate(tax, { skipMissingProperties: true });
                        errors = errors.concat(RemodelErrors(taxErrors, `invoice.concepts[${index}].taxes[${subIndex}]`));
                    });
                }
            }
        });
        // Detalles del impuesto.
        _taxDetails.forEach( async (_taxDetail: any, index: number) => {
            let taxDetail = new TaxDetail();
            taxDetail.amount = _taxDetail.amount;
            taxDetail.tax = _taxDetail.tax;
            taxDetail.tasa = _taxDetail.tasa;
            taxDetail.factorType = _taxDetail.factorType;
            let taxDetailErrors = await validate(taxDetail, { skipMissingProperties: true });
            errors = errors.concat(RemodelErrors(taxDetailErrors, `invoice.taxDetails[${index}]`));
        });

        // Resultado.
        return errors;
    }

    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getInvoiceFromReceipt(receipt: Receipt): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
            
            // Se debe obtener la información del cliente (ya sea desde la cuenta o desde el mismo cliente).
            let client: any = {};
            let account: any = {};
            switch(receipt.parentType){
                case 'client':
                    let clientModel: ClientModel = new ClientModel();
                    try {
                        client = await clientModel.getClient({ folio: receipt.parentId });
                    } catch(error) {
                        return reject(error);
                    }
                    break;
                case 'account':
                    let accountModel: AccountModel = new AccountModel();
                    try {
                        account = await accountModel.getAccount({ accountNumber: receipt.parentId });
                        client = account.client;
                    } catch(error) {
                        return reject(error);
                    }
                    break;
                default:
                    return reject({
                        status: 404,
                        message: 'Facturas v2 | No se encontró información sobre el tipo de padre en el recibo.',
                    });
            }
            if(!isEmpty(client)) {

                //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
                //F     A   A C       T   U   U R   R A   A
                //FFF   AAAAA C       T   U   U RRRR  AAAAA
                //F     A   A C       T   U   U R   R A   A
                //F     A   A  CCCC   T    UUU  R   R A   A
                
                let invoice: Invoice;
                // WARNING: Por disposición oficial, ahora TODOS los recibos generan una factura previa ¯\_(ツ)_/¯.
                // let paymentMethod = idx(client, _ => _.businessData.paymentMethod);
                // if(typeof paymentMethod === 'string' && paymentMethod === 'PPD') {
                    // Saldo anterior.
                    let previousBalance: number = (receipt.previousBalance && receipt.previousBalance > 0) ? receipt.previousBalance : 0;
                    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                    // El balance anterior ya tiene calculado (sumado) el impuesto, por lo que para hacer el descuento por concepto se debe eliminar.
                    previousBalance = previousBalance > 0 ? parseFloat((previousBalance / 1.16).toFixed(2)) : 0;
                    // Conceptos.
                    let concepts: Array<Concept> = [];
                    // NOTE: Se mandan los datos en 'crudo' (sin albur), el proceso de generación de factura les da formato.
                    if(Array.isArray(receipt.items) && receipt.items.length > 0) {
                        for(const item of receipt.items) {
                            // Costo unitario.
                            let itemUnitCost: number = item.unitCost ? parseFloat(item.unitCost.toFixed(2)) : 0;
                            // Descuento.
                            let itemDiscount: number = item.discount ? parseFloat(item.discount.toFixed(2)) : 0;
                            // (Cantidad x Valor Unitario) - Descuento.
                            let itemAmount: number = parseFloat((((item.quantity || 1) * itemUnitCost) - itemDiscount).toFixed(2));
                            // Importe total del concepto x 0.16000000.
                            let taxAmount: number = parseFloat((itemAmount * 0.16).toFixed(2));
                            // Importe total del concepto + Impuesto.
                            let itemAmountPlusTaxes: number = parseFloat((itemAmount + taxAmount).toFixed(2));

                            // console.log('FACTURA - Descuento del item:', itemDiscount);
                            // console.log('FACTURA - Total del item:', itemAmount);
                            // console.log('FACTURA - Total con impuestos del item:', itemAmountPlusTaxes);

                            // SSSS  AAA  L     DDDD   OOO        AAA  N   N TTTTT EEEEE RRRR  IIIII  OOO  RRRR
                            //S     A   A L     D   D O   O      A   A NN  N   T   E     R   R   I   O   O R   R
                            // SSS  AAAAA L     D   D O   O      AAAAA N N N   T   EEE   RRRR    I   O   O RRRR
                            //    S A   A L     D   D O   O      A   A N  NN   T   E     R   R   I   O   O R   R
                            //SSSS  A   A LLLLL DDDD   OOO       A   A N   N   T   EEEEE R   R IIIII  OOO  R   R

                            // console.log('FACTURA - Balance anterior: ', previousBalance);
                            if(previousBalance > 0) {
                                // Existe un saldo a favor.
                                if(previousBalance >= itemAmount) {
                                    // console.log('FACTURA - El balance es mayor al total del item.');
                                    // NOTE: En este caso no se debe agregar el concepto.
                                    // FIX: Ahora si se debe incluir el concepto pero en 0 y sin incluir impuestos.
                                    itemAmount = parseFloat((((item.quantity || 1) * itemUnitCost) - itemDiscount).toFixed(2));
                                    itemDiscount = itemAmount;
                                    taxAmount = 0;
                                    // IMPORTANT: Falta actualizar el total más impuestos.
                                    itemAmountPlusTaxes = 0;
                                    // Se agrega el concepto con los nuevo valores.
                                    concepts.push({
                                        unitCve: item.unitCve,
                                        description: item.productName,
                                        cveProductService: item.satProductCode || '81161700',
                                        unitValue: itemUnitCost,
                                        quantity: item.quantity || 1,
                                        discount: itemDiscount,
                                        // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                        // Se debe mandar el total ya con impuestos, para comparación de redondeo en la creación de la factura.
                                        amount: itemAmountPlusTaxes,
                                        // FIX: Obtener el número de la cuenta que generó el movimiento.
                                        // NOTE: Ya se guarda dentro de cada concepto del recibo el número de cuenta que genera el movimiento.
                                        idNumber: item.key ? item.key : (account.accountNumber || ''),
                                        // En este caso, el concepto no debe contener impuestos.
                                        /*
                                        taxes: [{
                                            base: itemAmount || 0,
                                            tasa: 0.160000,
                                            amount: taxAmount, // parseFloat(((item.unitCost || 0) * 0.16).toFixed(2)),
                                            tax: '002',
                                            factorType: 'Tasa'
                                        }]
                                        */
                                    });
                                    // El balance anterior (a favor) es mayor o igual al total del concepto.
                                    // NOTE: La resta debe ser contra el total del concepto sin impuestos.
                                    previousBalance = parseFloat((previousBalance - itemAmount).toFixed(2));
                                } else {
                                    // console.log('FACTURA - El balance es menor al total del item.');
                                    // El total del concepto es mayor al balance anterior (a favor).
                                    // En este caso los totales van a cambiar.
                                    // NOTE: El que debe cambiar es el descuento y los totales se recalculan:
                                    itemDiscount = parseFloat((itemDiscount + previousBalance).toFixed(2));
                                    itemAmount = parseFloat((((item.quantity || 1) * itemUnitCost) - itemDiscount).toFixed(2));
                                    taxAmount = parseFloat((itemAmount * 0.16).toFixed(2));
                                    // IMPORTANT: Falta actualizar el total más impuestos.
                                    itemAmountPlusTaxes = parseFloat((itemAmount + taxAmount).toFixed(2));
                                    // console.log(itemAmount);
                                    // console.log(taxAmount);
                                    // Se agrega el concepto con los nuevo valores.
                                    concepts.push({
                                        unitCve: item.unitCve,
                                        description: item.productName,
                                        cveProductService: item.satProductCode || '81161700',
                                        unitValue: itemUnitCost,
                                        quantity: item.quantity || 1,
                                        discount: itemDiscount,
                                        // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                        // Se debe mandar el total ya con impuestos, para comparación de redondeo en la creación de la factura.
                                        amount: itemAmountPlusTaxes,
                                        // FIX: Obtener el número de la cuenta que generó el movimiento.
                                        // NOTE: Ya se guarda dentro de cada concepto del recibo el número de cuenta que genera el movimiento.
                                        idNumber: item.key ? item.key : (account.accountNumber || ''),
                                        taxes: [{
                                            base: itemAmount /*item.unitCost*/ || 0,
                                            tasa: 0.160000,
                                            amount: taxAmount, // parseFloat(((item.unitCost || 0) * 0.16).toFixed(2)),
                                            tax: '002',
                                            factorType: 'Tasa'
                                        }]
                                    });
                                    // El balance se vuelve 0.
                                    previousBalance = 0;
                                }
                            } else {
                                // No existe un saldo a favor, se agrega el concepto tal cual.
                                concepts.push({
                                    unitCve: item.unitCve,
                                    description: item.productName,
                                    cveProductService: item.satProductCode || '81161700',
                                    unitValue: itemUnitCost,
                                    quantity: item.quantity || 1,
                                    discount: itemDiscount,
                                    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                    // Se debe mandar el total ya con impuestos, para comparación de redondeo en la creación de la factura.
                                    amount: itemAmountPlusTaxes,
                                    // FIX: Obtener el número de la cuenta que generó el movimiento.
                                    // NOTE: Ya se guarda dentro de cada concepto del recibo el número de cuenta que genera el movimiento.
                                    idNumber: item.key ? item.key : (account.accountNumber || ''),
                                    taxes: [{
                                        base: itemAmount /*item.unitCost*/ || 0,
                                        tasa: 0.160000,
                                        amount: taxAmount, // parseFloat(((item.unitCost || 0) * 0.16).toFixed(2)),
                                        tax: '002',
                                        factorType: 'Tasa'
                                    }]
                                });
                            }
                        };

                        // CCCC  OOO  N   N  CCCC EEEEE PPPP  TTTTT  OOO   SSSS
                        //C     O   O NN  N C     E     P   P   T   O   O S
                        //C     O   O N N N C     EEE   PPPP    T   O   O  SSS
                        //C     O   O N  NN C     E     P       T   O   O     S
                        // CCCC  OOO  N   N  CCCC EEEEE P       T    OOO  SSSS

                        if(concepts.length === 0) {
                            return reject({
                                status: 400,
                                module: 'Facturas v2',
                                message: 'Se eliminaron todos los conceptos por cuestión de saldo a favor.'
                            })
                        }
                    } else {
                        return reject({
                            status: 404,
                            module: 'Facturas v2',
                            message: 'El recibo no contiene elementos que facturar (lista de "Items" vacía).'
                        });
                    }
                    // Factura.
                    // TODO: Revisar si se debe agregar el descuento general.
                    invoice = {
                        serie: 'I',
                        paymentForm: '99',
                        currency: receipt.currencyValue || 'MXN',
                        exchangeRate: receipt.exchangeRate || 1,
                        compType: 'I',
                        paymentMethod: 'PPD',
                        receptorRFC: (idx(client, _ => _.businessData.rfc) || '').toString(),
                        receptorName: (idx(client, _ => _.businessData.businessName) || '').toString(),
                        cfdiUse: (idx(client, _ => _.businessData.cfdiUse) || '').toString(),
                        concepts,
                        account,
                        client
                    };
                    return resolve(invoice);
                // } else {
                //     return reject({
                //         status: 400,
                //         message: 'El método de pago no requiere de la generación de una factura (no es PPD).'
                //     });
                // }
            } else {
                return reject({
                    status: 404,
                    message: 'Facturas v2 | No se pudo obtener la información del cliente.'
                });
            }
        });
    }
    
    public getInvoiceFromReceiptByFolio(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { folio, ...rest }: { folio: number } & any = query;
            
            //RRRR  EEEEE  CCCC IIIII BBBB   OOO
            //R   R E     C       I   B   B O   O
            //RRRR  EEE   C       I   BBBB  O   O
            //R   R E     C       I   B   B O   O
            //R   R EEEEE  CCCC IIIII BBBB   OOO

            let receiptModel: ReceiptModel = new ReceiptModel();
            let receipt: Receipt = new Receipt();
            try {
                receipt = await receiptModel.getReceipt({ folio });
            } catch(error) {
                return reject(error);
            }

            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
            
            // Se debe obtener la información del cliente (ya sea desde la cuenta o desde el mismo cliente).
            let client: any = {};
            let account: any = {};
            switch(receipt.parentType){
                case 'client':
                    let clientModel: ClientModel = new ClientModel();
                    try {
                        client = await clientModel.getClient({ folio: receipt.parentId });
                    } catch(error) {
                        return reject(error);
                    }
                    break;
                case 'account':
                    let accountModel: AccountModel = new AccountModel();
                    try {
                        account = await accountModel.getAccount({ accountNumber: receipt.parentId });
                        client = account.client;
                    } catch(error) {
                        return reject(error);
                    }
                    break;
                default:
                    return reject({
                        status: 404,
                        message: 'Facturas v2 | No se encontró información sobre el tipo de padre en el recibo.',
                    });
            }
            if(!isEmpty(client)) {

                //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
                //F     A   A C       T   U   U R   R A   A
                //FFF   AAAAA C       T   U   U RRRR  AAAAA
                //F     A   A C       T   U   U R   R A   A
                //F     A   A  CCCC   T    UUU  R   R A   A
                
                let invoice: Invoice;
                // WARNING: Por disposición oficial, ahora TODOS los recibos generan una factura previa ¯\_(ツ)_/¯.
                // let paymentMethod = idx(client, _ => _.businessData.paymentMethod);
                // if(typeof paymentMethod === 'string' && paymentMethod === 'PPD') {
                    // Saldo anterior.
                    let previousBalance: number = (receipt.previousBalance && receipt.previousBalance > 0) ? receipt.previousBalance : 0;
                    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                    // El balance anterior ya tiene calculado (sumado) el impuesto, por lo que para hacer el descuento por concepto se debe eliminar.
                    previousBalance = previousBalance > 0 ? parseFloat((previousBalance / 1.16).toFixed(2)) : 0;
                    // Conceptos.
                    let concepts: Array<Concept> = [];
                    // NOTE: Se mandan los datos en 'crudo' (sin albur), el proceso de generación de factura les da formato.
                    if(Array.isArray(receipt.items) && receipt.items.length > 0) {
                        for(const item of receipt.items) {
                            // Costo unitario.
                            let itemUnitCost: number = item.unitCost ? parseFloat(item.unitCost.toFixed(2)) : 0;
                            // Descuento.
                            let itemDiscount: number = item.discount ? parseFloat(item.discount.toFixed(2)) : 0;
                            // (Cantidad x Valor Unitario) - Descuento.
                            let itemAmount: number = parseFloat((((item.quantity || 1) * itemUnitCost) - itemDiscount).toFixed(2));
                            // Importe total del concepto x 0.16000000.
                            let taxAmount: number = parseFloat((itemAmount * 0.16).toFixed(2));
                            // Importe total del concepto + Impuesto.
                            let itemAmountPlusTaxes: number = parseFloat((itemAmount + taxAmount).toFixed(2));

                            // console.log('FACTURA - Descuento del item:', itemDiscount);
                            // console.log('FACTURA - Total del item:', itemAmount);
                            // console.log('FACTURA - Total con impuestos del item:', itemAmountPlusTaxes);

                            // SSSS  AAA  L     DDDD   OOO        AAA  N   N TTTTT EEEEE RRRR  IIIII  OOO  RRRR
                            //S     A   A L     D   D O   O      A   A NN  N   T   E     R   R   I   O   O R   R
                            // SSS  AAAAA L     D   D O   O      AAAAA N N N   T   EEE   RRRR    I   O   O RRRR
                            //    S A   A L     D   D O   O      A   A N  NN   T   E     R   R   I   O   O R   R
                            //SSSS  A   A LLLLL DDDD   OOO       A   A N   N   T   EEEEE R   R IIIII  OOO  R   R

                            // console.log('FACTURA - Balance anterior: ', previousBalance);
                            if(previousBalance > 0) {
                                // Existe un saldo a favor.
                                if(previousBalance >= itemAmount) {
                                    // console.log('FACTURA - El balance es mayor al total del item.');
                                    // NOTE: En este caso no se debe agregar el concepto.
                                    // FIX: Ahora si se debe incluir el concepto pero en 0 y sin incluir impuestos.
                                    itemAmount = parseFloat((((item.quantity || 1) * itemUnitCost) - itemDiscount).toFixed(2));
                                    itemDiscount = itemAmount;
                                    taxAmount = 0;
                                    // IMPORTANT: Falta actualizar el total más impuestos.
                                    itemAmountPlusTaxes = 0;
                                    // Se agrega el concepto con los nuevo valores.
                                    concepts.push({
                                        unitCve: item.unitCve,
                                        description: item.productName,
                                        cveProductService: item.satProductCode || '81161700',
                                        unitValue: itemUnitCost,
                                        quantity: item.quantity || 1,
                                        discount: itemDiscount,
                                        // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                        // Se debe mandar el total ya con impuestos, para comparación de redondeo en la creación de la factura.
                                        amount: itemAmountPlusTaxes,
                                        // FIX: Obtener el número de la cuenta que generó el movimiento.
                                        // NOTE: Ya se guarda dentro de cada concepto del recibo el número de cuenta que genera el movimiento.
                                        idNumber: item.key ? item.key : (account.accountNumber || ''),
                                        // En este caso, el concepto no debe contener impuestos.
                                        /*
                                        taxes: [{
                                            base: itemAmount || 0,
                                            tasa: 0.160000,
                                            amount: taxAmount, // parseFloat(((item.unitCost || 0) * 0.16).toFixed(2)),
                                            tax: '002',
                                            factorType: 'Tasa'
                                        }]
                                        */
                                    });
                                    // El balance anterior (a favor) es mayor o igual al total del concepto.
                                    // NOTE: La resta debe ser contra el total del concepto sin impuestos.
                                    previousBalance = parseFloat((previousBalance - itemAmount).toFixed(2));
                                } else {
                                    // console.log('FACTURA - El balance es menor al total del item.');
                                    // El total del concepto es mayor al balance anterior (a favor).
                                    // En este caso los totales van a cambiar.
                                    // NOTE: El que debe cambiar es el descuento y los totales se recalculan:
                                    itemDiscount = parseFloat((itemDiscount + previousBalance).toFixed(2));
                                    itemAmount = parseFloat((((item.quantity || 1) * itemUnitCost) - itemDiscount).toFixed(2));
                                    taxAmount = parseFloat((itemAmount * 0.16).toFixed(2));
                                    // IMPORTANT: Falta actualizar el total más impuestos.
                                    itemAmountPlusTaxes = parseFloat((itemAmount + taxAmount).toFixed(2));
                                    // console.log(itemAmount);
                                    // console.log(taxAmount);
                                    // Se agrega el concepto con los nuevo valores.
                                    concepts.push({
                                        unitCve: item.unitCve,
                                        description: item.productName,
                                        cveProductService: item.satProductCode || '81161700',
                                        unitValue: itemUnitCost,
                                        quantity: item.quantity || 1,
                                        discount: itemDiscount,
                                        // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                        // Se debe mandar el total ya con impuestos, para comparación de redondeo en la creación de la factura.
                                        amount: itemAmountPlusTaxes,
                                        // FIX: Obtener el número de la cuenta que generó el movimiento.
                                        // NOTE: Ya se guarda dentro de cada concepto del recibo el número de cuenta que genera el movimiento.
                                        idNumber: item.key ? item.key : (account.accountNumber || ''),
                                        taxes: [{
                                            base: itemAmount /*item.unitCost*/ || 0,
                                            tasa: 0.160000,
                                            amount: taxAmount, // parseFloat(((item.unitCost || 0) * 0.16).toFixed(2)),
                                            tax: '002',
                                            factorType: 'Tasa'
                                        }]
                                    });
                                    // El balance se vuelve 0.
                                    previousBalance = 0;
                                }
                            } else {
                                // No existe un saldo a favor, se agrega el concepto tal cual.
                                concepts.push({
                                    unitCve: item.unitCve,
                                    description: item.productName,
                                    cveProductService: item.satProductCode || '81161700',
                                    unitValue: itemUnitCost,
                                    quantity: item.quantity || 1,
                                    discount: itemDiscount,
                                    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                    // Se debe mandar el total ya con impuestos, para comparación de redondeo en la creación de la factura.
                                    amount: itemAmountPlusTaxes,
                                    // FIX: Obtener el número de la cuenta que generó el movimiento.
                                    // NOTE: Ya se guarda dentro de cada concepto del recibo el número de cuenta que genera el movimiento.
                                    idNumber: item.key ? item.key : (account.accountNumber || ''),
                                    taxes: [{
                                        base: itemAmount /*item.unitCost*/ || 0,
                                        tasa: 0.160000,
                                        amount: taxAmount, // parseFloat(((item.unitCost || 0) * 0.16).toFixed(2)),
                                        tax: '002',
                                        factorType: 'Tasa'
                                    }]
                                });
                            }
                        };

                        // CCCC  OOO  N   N  CCCC EEEEE PPPP  TTTTT  OOO   SSSS
                        //C     O   O NN  N C     E     P   P   T   O   O S
                        //C     O   O N N N C     EEE   PPPP    T   O   O  SSS
                        //C     O   O N  NN C     E     P       T   O   O     S
                        // CCCC  OOO  N   N  CCCC EEEEE P       T    OOO  SSSS

                        if(concepts.length === 0) {
                            return reject({
                                status: 400,
                                module: 'Facturas v2',
                                message: 'Se eliminaron todos los conceptos por cuestión de saldo a favor.'
                            })
                        }
                    } else {
                        return reject({
                            status: 404,
                            module: 'Facturas v2',
                            message: 'El recibo no contiene elementos que facturar (lista de "Items" vacía).'
                        });
                    }
                    // Factura.
                    // TODO: Revisar si se debe agregar el descuento general.
                    invoice = {
                        serie: 'I',
                        paymentForm: '99',
                        currency: receipt.currencyValue || 'MXN',
                        exchangeRate: receipt.exchangeRate || 1,
                        compType: 'I',
                        paymentMethod: 'PPD',
                        receptorRFC: (idx(client, _ => _.businessData.rfc) || '').toString(),
                        receptorName: (idx(client, _ => _.businessData.businessName) || '').toString(),
                        cfdiUse: (idx(client, _ => _.businessData.cfdiUse) || '').toString(),
                        concepts,
                        account,
                        client
                    };
                    return resolve(invoice);
                // } else {
                //     return reject({
                //         status: 400,
                //         message: 'El método de pago no requiere de la generación de una factura (no es PPD).'
                //     });
                // }
            } else {
                return reject({
                    status: 404,
                    message: 'Facturas v2 | No se pudo obtener la información del cliente.'
                });
            }
        });
    }

    // NOTE: Recurso expuesto.
    public getInvoicesFromPaymentById(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //PPPP   AAA   GGGG  OOO
            //P   P A   A G     O   O
            //PPPP  AAAAA G  GG O   O
            //P     A   A G   G O   O
            //P     A   A  GGGG  OOO

            let _id: string = query._id;
            let payment: PaymentV1 = new PaymentV1;
            // console.log(_id);
            let paymentModel: PaymentModel = new PaymentModel();
            try {
                payment = await paymentModel.getPayment({ _id });
                // console.log(payment);
            } catch(error) {
                reject(error);
            }
            try {
                let invoices: Array<Invoice> = await this.getInvoicesFromPayment(payment);
                return resolve(invoices);
            } catch(error) {
                return reject(error);
            }
        });
    }

    public getInvoicesFromPayment(payment: PaymentV1): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
            
            // Se debe obtener la información del cliente (ya sea desde la cuenta o desde el mismo cliente).
            let client: Client = new Client();
            let account: Account = new Account();
            switch(payment.parentType){
                case 'client':
                    let clientModel: ClientModel = new ClientModel();
                    try {
                        client = await clientModel.getClient({ folio: payment.parentId });
                    } catch(error) {
                        return reject(error);
                    }
                    break;
                case 'account':
                    let accountModel: AccountModel = new AccountModel();
                    try {
                        account = await accountModel.getAccount({ accountNumber: payment.parentId });
                        client = account.client || new Client();
                    } catch(error) {
                        return reject(error);
                    }
                    break;
                default:
                    return reject({
                        status: 404,
                        message: 'Facturas v2 | No se encontró información sobre el tipo de padre en el recibo.',
                    });
            }
            if(!isEmpty(client)) {

                //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
                //F     A   A C       T   U   U R   R A   A
                //FFF   AAAAA C       T   U   U RRRR  AAAAA
                //F     A   A C       T   U   U R   R A   A
                //F     A   A  CCCC   T    UUU  R   R A   A

                // Información general.
                let paymentMethod: string = 'PPD'; // idx(client, _ => _.businessData.paymentMethod);
                // let serie: string = paymentMethod === 'PPD' ? 'P' : 'A';
                let compType: string = paymentMethod === 'PPD' ? 'P' : 'I';
                let paymentForm: any = idx(client, _ => _.businessData.paymentForm) || payment.paymentForm;
                let receptorRFC: any = idx(client, _ => _.businessData.rfc);
                let receptorName: any = idx(client, _ => _.businessData.businessName);
                let cfdiUse: any = idx(client, _ => _.businessData.cfdiUse);
                // let conceptUnitValue: number = parseFloat((payment.amountPaid / 1.16).toFixed(2));
                // Cuerpo de la factura.
                let invoice: Invoice = {
                    serie: 'I',                         // "P" cuanto paymentMethod === "PPD" && tiene saldo pendiente.
                    paymentForm,                        // CLIENTE.
                    currency: payment.currencyValue,
                    exchangeRate: payment.exchangeRate,
                    compType,                           // Siempre es "I" a menos que sea complemento.
                    paymentMethod,                      // CLIENTE: paymentMethod === "PPD" entonces compType = "P" a menos que sea saldo a favor.
                    receptorRFC,                        // CLIENTE.
                    receptorName,                       // CLIENTE.
                    cfdiUse,                            // CLIENTE.
                    concepts: [],
                    // relatedCfdis,                    // Se manda en el BODY. Se agrega después si se requiere.
                    // "paymentComplement"              // CLIENTE: paymentMethod === "PPD".
                    account,
                    client
                };

                // CCCC  OOO  N   N  CCCC EEEEE PPPP  TTTTT  OOO   SSSS
                //C     O   O NN  N C     E     P   P   T   O   O S
                //C     O   O N N N C     EEE   PPPP    T   O   O  SSS
                //C     O   O N  NN C     E     P       T   O   O     S
                // CCCC  OOO  N   N  CCCC EEEEE P       T    OOO  SSSS

                let concepts: Array<Concept> = [];
                let conceptsTotal: number = 0;

                // CCCC  OOO  M   M PPPP  L     EEEEE M   M EEEEE N   N TTTTT  OOO       DDDD  EEEEE      PPPP   AAA   GGGG  OOO
                //C     O   O MM MM P   P L     E     MM MM E     NN  N   T   O   O      D   D E          P   P A   A G     O   O
                //C     O   O M M M PPPP  L     EEE   M M M EEE   N N N   T   O   O      D   D EEE        PPPP  AAAAA G  GG O   O
                //C     O   O M   M P     L     E     M   M E     N  NN   T   O   O      D   D E          P     A   A G   G O   O
                // CCCC  OOO  M   M P     LLLLL EEEEE M   M EEEEE N   N   T    OOO       DDDD  EEEEE      P     A   A  GGGG  OOO

                let paymentComplement: any = {
                    paymentDate: payment.paymentDate,
                    paymentForm,
                    currency: payment.currencyValue,
                    exchangeRate: payment.exchangeRate,
                    // amount: payment.amountPaid,
                    ordAccount: idx(client, _ => _.businessData.issuingAccountNumber),
                    issuerRfcOrdAccount: idx(client, _ => _.businessData.issuingBankRfc),
                    ordBankName: idx(client, _ => _.businessData.issuingBankName),
                };
                if(['02', '03', '04', '05', '06', '28', '29'].indexOf(paymentForm) < 0) {
                    try {
                        delete paymentComplement.ordAccount;
                        delete paymentComplement.issuerRfcOrdAccount;
                        delete paymentComplement.ordBankName;
                    } catch(error) {}
                }
                let paymentComplementTotal: number = 0;
                let complementPayments: Array<Payment> = [];
                if(Array.isArray(payment.details)) {
                    let receiptModel: ReceiptModel = new ReceiptModel();
                    let paymentModel: PaymentModel = new PaymentModel();
                    let invoiceModel: InvoiceModel = new InvoiceModel();
                    // Se deben recorrer 1 a 1 los recibos que se pagaron para obtener la información de sus facturas (°~°).
                    // paymentDetails.forEach( async (paymentDetail: any) => {
                    for(const paymentDetail of payment.details) {

                        //RRRR  EEEE  CCCC IIIII BBBB   OOO
                        //R   R E    C       I   B   B O   O
                        //RRRR  EEE  C       I   BBBB  O   O
                        //R   R E    C       I   B   B O   O
                        //R   R EEEE  CCCC IIIII BBBB   OOO

                        // Recibo.
                        let receipt: Receipt = new Receipt();
                        try {
                            receipt = await receiptModel.getReceipt({ _id: paymentDetail.receiptId });
                        } catch(error) {
                            return reject(error);
                        }

                        //N   N  OOO  TTTTT  AAA   SSSS      DDDD  EEEEE       CCCC RRRR  EEEEE DDDD  IIIII TTTTT  OOO
                        //NN  N O   O   T   A   A S          D   D E          C     R   R E     D   D   I     T   O   O
                        //N N N O   O   T   AAAAA  SSS       D   D EEE        C     RRRR  EEE   D   D   I     T   O   O
                        //N  NN O   O   T   A   A     S      D   D E          C     R   R E     D   D   I     T   O   O
                        //N   N  OOO    T   A   A SSSS       DDDD  EEEEE       CCCC R   R EEEEE DDDD  IIIII   T    OOO

                        //Notas de crédito asociadas a la factura del recibo.
                        let creditNotes: { results: Array<InvoiceV1>, summary: any } = { results: [], summary: {} };
                        // @ts-ignore
                        if(receipt.invoice && (receipt.invoice as InvoiceV1).uuid) {
                            try {
                                // @ts-ignore
                                creditNotes = await invoiceModel.getInvoices({ affectedCFDIs: (receipt.invoice as InvoiceV1).uuid, statusValue: 'active', all: true });
                            } catch(error) {
                                return reject(error);
                            }
                        }
                        let totalCredited: number = 0;
                        if(creditNotes.results.length > 0) {
                            for(const creditNote of creditNotes.results) {
                                // 1. Se debe leer el JSON.
                                let creditNoteJSON: JSON = JSON.parse(creditNote.json);
                                // 2. Se debe revisar el tipo de relación, para notas de crédito es 01.
                                let creditNoteRelationshipType: string = (idx(creditNoteJSON, _ => _['cfdi:Comprobante']['cfdi:CfdiRelacionados']['_attributes']['TipoRelacion']) || '').toString();
                                let creditNoteTotal: number = parseFloat((idx(creditNoteJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0.00').toString());
                                if(creditNoteRelationshipType === '01') {
                                    totalCredited += creditNoteTotal;
                                }
                            }
                        }
                        // NOTE: Continúa en el tag [CONT.INV.V2.01].

                        //PPPP   AAA   GGGG  OOO   SSSS
                        //P   P A   A G     O   O S
                        //PPPP  AAAAA G  GG O   O  SSS
                        //P     A   A G   G O   O     S
                        //P     A   A  GGGG  OOO  SSSS

                        // Pagos asociados al recibo, parcialidades, saldo anterior y actual.
                        let payments: { results: Array<PaymentV1>, summary: any } = { results: [], summary: {} };
                        let receiptPayments: Array<PaymentV1> = [];
                        let partiality: number = 1;
                        let lastBalance: number = receipt.total;
                        let currentBalance: number = 0;
                        try {
                            payments = await paymentModel.getPayments({ 'details.receiptId': paymentDetail.receiptId });
                            // NOTE: Se debe eliminar el pago actual.
                            receiptPayments = payments.results.filter((_payment: any) => {
                                // TODO: En realidad sólo se debe excluir el pago que provenga de una nota de crédito generada por el mismo recibo.
                                return (_payment._id != payment._id && _payment.statusValue !== 'credit');
                            });
                            // Se obtienen las parcialidades y el total pagado.
                            partiality = (receiptPayments.length || 0) + 1;
                            // [CONT.INV.V2.01]
                            // NOTE: El total pagado del recibo debe comenzar con el total acreditado, el cual será de 0 si no existe ninguna nota de crédito.
                            let totalAmountPaid: number = totalCredited;
                            // Por cada pago se deben revisar los detalles (@_@)...
                            for(const receiptPayment of receiptPayments) {
                                let receiptPaymentDetails: Array<{ receiptId: string; amount: number; }> = receiptPayment.details || [];
                                for(const receiptPaymentDetail of receiptPaymentDetails) {
                                    if(receiptPaymentDetail.receiptId === paymentDetail.receiptId) {
                                        totalAmountPaid += parseFloat(receiptPaymentDetail.amount.toFixed(2));
                                    }
                                }
                            }
                            // Se calculan los totales.
                            lastBalance -= totalAmountPaid;
                            lastBalance = lastBalance < 0 ? 0 : parseFloat(lastBalance.toFixed(2));
                            // DELETE: Borrar por que NO debería ocurrir.
                            if(lastBalance < paymentDetail.amount) lastBalance = paymentDetail.amount;
                            currentBalance = lastBalance - paymentDetail.amount;
                            currentBalance = currentBalance < 0 ? 0 : parseFloat(currentBalance.toFixed(2));
                        } catch(error) {
                            return reject(error);
                        }

                        //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
                        //F     A   A C       T   U   U R   R A   A
                        //FFF   AAAAA C       T   U   U RRRR  AAAAA
                        //F     A   A C       T   U   U R   R A   A
                        //F     A   A  CCCC   T    UUU  R   R A   A

                        // Factura asociada al recibo.
                        // let invoice: InvoiceV1 = new InvoiceV1;
                        let invoiceJSON: any = {};
                        // NOTE: Esto es innecesario, la factura ya viene dentro de la información del recibo.
                        if(receipt.invoice/* && typeof receipt.invoice._id === 'string'*/) {
                            // try {
                            //     invoice = await invoiceModel.getInvoice({ _id: receipt.invoice._id });
                                // @ts-ignore
                                invoiceJSON = JSON.parse(receipt.invoice.json);
                            // } catch(error){
                            //     return reject(error);
                            // }
                        }
                        // Agregar pago al complemento SÓLO SI SE ENCONTRÓ FACTURA, de lo contrario se agregan al arreglo de conceptos.
                        if(!isEmpty(invoiceJSON)) {
                            paymentComplementTotal += parseFloat(paymentDetail.amount.toFixed(2));
                            // @ts-ignore
                            let serie: string = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Serie']) || receipt.invoice.serie).toString();
                            // @ts-ignore
                            let folio: string = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Folio']) || receipt.invoice.folio).toString();
                            complementPayments.push({
                                relatedCfdi: (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['UUID']) || '').toString(),
                                currencyDR: (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Moneda']) || '').toString(),
                                exchangeRateDR: parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['TipoCambio']) || '1').toString()),
                                paymentMethodDR: paymentMethod,
                                partiality,                                             // Número de pagos anteriores + 1.
                                lastBalance,                                            // Saldo anterior.
                                amount: parseFloat(paymentDetail.amount.toFixed(2)),    // Cantidad que se paga.
                                currentBalance,                                         // Saldo actual.
                                serieNFolio: `${serie}${folio}`
                            });
                        } else {
                            let amountWithoutTax: number = parseFloat((paymentDetail.amount / 1.16).toFixed(2));
                            conceptsTotal += parseFloat(paymentDetail.amount.toFixed(2));
                            concepts.push({
                                description: 'Servicio de telecomunicaciones.',
                                cveProductService: '81161700',
                                unitValue: amountWithoutTax,        // paymentDetail.amount,    // payment.amountPaid - IVA.
                                quantity: 1,
                                discount: 0,                        // NO APLICA.
                                idNumber: account.accountNumber,    // El folio de la cuenta / servicio.
                                // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                // Se debe mandar el total ya con impuestos, para comparación de redondeo en la creación de la factura.
                                amount: paymentDetail.amount,
                                taxes: [{
                                    base: amountWithoutTax,
                                    tasa: 0.160000,
                                    amount: parseFloat((amountWithoutTax * 0.16).toFixed(2)),
                                    tax: '002',
                                    factorType: 'Tasa'
                                }]
                            });
                        }
                    };
                }

                //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                //R   R E     S     U   U L       T   A   A D   D O   O
                //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                //R   R E         S U   U L       T   A   A D   D O   O
                //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

                let invoices: Array<Invoice> = [];
                // Factura tipo "complemento de pago".
                // NOTE: Si el arreglo de pagos está vacío, no se debe agregar el complemento de pago.
                if(complementPayments.length > 0) {
                    let paymentComplementInvoice: Invoice = Object.assign({}, invoice);
                    // Se cambia la seria de la factura.
                    paymentComplementInvoice.serie = 'P'
                    // Se eliminan los conceptos si existen.
                    // NOTE: En este punto el pago pudo generar 2(3) facturas, y alguna incluye conceptos... la de tipo
                    //       complemento de pago debe contener un único concepto "especial".
                    try {
                        delete paymentComplementInvoice.concepts;
                        // paymentComplementInvoice.concepts = [{ 
                        //     description: 'Pago', 
                        //     unitCve: 'ACT', 
                        //     cveProductService: '84111506', 
                        //     unitValue: 0, 
                        //     quantity: 1, 
                        //     amount: 0 
                        // }];
                    } catch(error) {}
                    // Se debe agregar el complemento de pago.
                    paymentComplement.amount = parseFloat(paymentComplementTotal.toFixed(2));
                    paymentComplement.payments = complementPayments;
                    paymentComplementInvoice.paymentComplement = paymentComplement;
                    // Total a manera de ayuda posterior.
                    paymentComplementInvoice.total = parseFloat(paymentComplementTotal.toFixed(2));
                    // Se agrega la factura al arreglo del resultado.
                    invoices.push(paymentComplementInvoice);
                } 
                // Factura "normal".
                // NOTE: Por ahora se suma el remanente al concepto de la factura PUE.
                let remainingAmount: number = parseFloat((payment.amountPaid - paymentComplementTotal - conceptsTotal).toFixed(2));
                if(concepts.length > 0 || remainingAmount > 0) {
                    let normalInvoice: Invoice = Object.assign({}, invoice);
                    // Se debe cambiar el tipo de factura.
                    normalInvoice.serie = 'I';
                    normalInvoice.compType = 'I';
                    normalInvoice.paymentMethod = 'PUE';
                    // Se debe actualizar el total de la factura en el concepto.
                    // NOTE: El valor de "conceptsTotal" aún tiene el impuesto, se de debe restar.
                    normalInvoice.concepts.push({
                        description: 'Servicio de telecomunicaciones.',
                        cveProductService: '81161700',
                        unitValue: (conceptsTotal + remainingAmount) / 1.16,    // ELIMINAR EL REMANENTE.
                        quantity: 1,
                        discount: 0,                                            // NO APLICA.
                        idNumber: account.accountNumber,                        // El folio de la cuenta / servicio.
                        amount: conceptsTotal + remainingAmount,                // ELIMINAR EL REMANENTE.
                        taxes: [{
                            base: conceptsTotal + remainingAmount,
                            tasa: 0.160000,
                            amount: parseFloat(((conceptsTotal + remainingAmount) * 0.16).toFixed(2)),
                            tax: '002',
                            factorType: 'Tasa'
                        }]
                    });
                    // Total a manera de ayuda posterior.
                    normalInvoice.total = parseFloat((conceptsTotal + remainingAmount).toFixed(2));
                    // Se agrega la factura al arreglo del resultado.
                    invoices.push(normalInvoice);
                }
                // Factura "anticipo de pago".
                // NOTA[1]: Por ahora esto no aplica... hasta que lo vuelvan a pedir.
                // NOTA[2]: Cuando lo vuelvan a pedir hay que cambiar las claves y concepto.
                /*
                if(remainingAmount > 0) {
                    let advancePaymentInvoice: Invoice = Object.assign({}, invoice);
                    // Se debe cambiar el tipo de factura.
                    advancePaymentInvoice.serie = 'A';
                    advancePaymentInvoice.compType = 'I';
                    advancePaymentInvoice.paymentMethod = 'PUE';
                    // Se debe actualizar el total de la factura en el concepto.
                    advancePaymentInvoice.concepts.push({
                        description: 'Servicio de telecomunicaciones.',     // 'Aplicación de anticipo.',
                        cveProductService: '81161700',                      // '84111506',
                        // unitCve: 'ACT',
                        unitValue: remainingAmount,
                        quantity: 1,
                        discount: 0,                        // NO APLICA.
                        idNumber: account.accountNumber,    // El folio de la cuenta / servicio.
                        amount: remainingAmount,
                    });
                    // Se agrega la factura al arreglo del resultado.
                    invoices.push(advancePaymentInvoice);
                }
                */
               
                return resolve(invoices);
            } else {
                return reject({
                    status: 404,
                    message: 'Facturas v2 | No se pudo obtener la información del cliente.'
                });
            }
        });
    }

    public getInvoicesFromCustomInfo(payment: PaymentV1, details: Array<{ receiptId: string, amount: number }> | undefined, unstampedAmount: number = 0): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
            
            // Se debe obtener la información del cliente (ya sea desde la cuenta o desde el mismo cliente).
            let client: Client = new Client();
            let account: Account = new Account();
            switch(payment.parentType){
                case 'client':
                    let clientModel: ClientModel = new ClientModel();
                    try {
                        client = await clientModel.getClient({ folio: payment.parentId });
                    } catch(error) {                        
                        return reject(error);
                    }
                    break;
                case 'account':
                    let accountModel: AccountModel = new AccountModel();
                    try {
                        account = await accountModel.getAccount({ accountNumber: payment.parentId });
                        client = account.client || new Client();
                    } catch(error) {
                        return reject(error);
                    }
                    break;
                default:
                    return reject({
                        status: 404,
                        message: 'Facturas v2 | No se encontró información sobre el tipo de padre en el recibo.',
                    });
            }
            if(!isEmpty(client)) {
                
                //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
                //F     A   A C       T   U   U R   R A   A
                //FFF   AAAAA C       T   U   U RRRR  AAAAA
                //F     A   A C       T   U   U R   R A   A
                //F     A   A  CCCC   T    UUU  R   R A   A

                // Información general.
                let paymentMethod: string = 'PPD'; // idx(client, _ => _.businessData.paymentMethod);
                let compType: string = paymentMethod === 'PPD' ? 'P' : 'I';
                let paymentForm: any = payment.paymentForm || idx(client, _ => _.businessData.paymentForm);
                let receptorRFC: any = idx(client, _ => _.businessData.rfc);
                let receptorName: any = idx(client, _ => _.businessData.businessName);
                let cfdiUse: any = idx(client, _ => _.businessData.cfdiUse);
                // Cuerpo de la factura.
                let invoice: Invoice = {
                    serie: 'I',                         // "P" cuanto paymentMethod === "PPD" && tiene saldo pendiente.
                    paymentForm,                        // CLIENTE.
                    currency: payment.currencyValue,
                    exchangeRate: payment.exchangeRate,
                    compType,                           // Siempre es "I" a menos que sea complemento.
                    paymentMethod,                      // CLIENTE: paymentMethod === "PPD" entonces compType = "P" a menos que sea saldo a favor.
                    receptorRFC,                        // CLIENTE.
                    receptorName,                       // CLIENTE.
                    cfdiUse,                            // CLIENTE.
                    concepts: [],
                    // relatedCfdis,                    // Se manda en el BODY. Se agrega después si se requiere.
                    // "paymentComplement"              // CLIENTE: paymentMethod === "PPD".
                    account,
                    client
                };

                // CCCC  OOO  N   N  CCCC EEEEE PPPP  TTTTT  OOO   SSSS
                //C     O   O NN  N C     E     P   P   T   O   O S
                //C     O   O N N N C     EEE   PPPP    T   O   O  SSS
                //C     O   O N  NN C     E     P       T   O   O     S
                // CCCC  OOO  N   N  CCCC EEEEE P       T    OOO  SSSS

                let concepts: Array<Concept> = [];
                let conceptsTotal: number = 0;

                // CCCC  OOO  M   M PPPP  L     EEEEE M   M EEEEE N   N TTTTT  OOO       DDDD  EEEEE      PPPP   AAA   GGGG  OOO
                //C     O   O MM MM P   P L     E     MM MM E     NN  N   T   O   O      D   D E          P   P A   A G     O   O
                //C     O   O M M M PPPP  L     EEE   M M M EEE   N N N   T   O   O      D   D EEE        PPPP  AAAAA G  GG O   O
                //C     O   O M   M P     L     E     M   M E     N  NN   T   O   O      D   D E          P     A   A G   G O   O
                // CCCC  OOO  M   M P     LLLLL EEEEE M   M EEEEE N   N   T    OOO       DDDD  EEEEE      P     A   A  GGGG  OOO

                let paymentComplement: any = {
                    paymentDate: payment.paymentDate,
                    paymentForm,
                    currency: payment.currencyValue,
                    exchangeRate: payment.exchangeRate,
                    // amount: payment.amountPaid,
                    ordAccount: idx(client, _ => _.businessData.issuingAccountNumber),
                    issuerRfcOrdAccount: idx(client, _ => _.businessData.issuingBankRfc),
                    ordBankName: idx(client, _ => _.businessData.issuingBankName),
                };
                if(['02', '03', '04', '05', '06', '28', '29'].indexOf(paymentForm) < 0) {
                    try {
                        delete paymentComplement.ordAccount;
                        delete paymentComplement.issuerRfcOrdAccount;
                        delete paymentComplement.ordBankName;
                    } catch(error) {

                    }
                }
                let paymentComplementTotal: number = 0;
                let complementPayments: Array<Payment> = [];
                if(Array.isArray(details) && details.length > 0) {
                    let receiptModel: ReceiptModel = new ReceiptModel();
                    let paymentModel: PaymentModel = new PaymentModel();
                    let invoiceModel: InvoiceModel = new InvoiceModel();
                    // Se deben recorrer 1 a 1 los recibos que se pagaron para obtener la información de sus facturas (°~°).
                    for(const paymentDetail of details) {

                        //RRRR  EEEE  CCCC IIIII BBBB   OOO
                        //R   R E    C       I   B   B O   O
                        //RRRR  EEE  C       I   BBBB  O   O
                        //R   R E    C       I   B   B O   O
                        //R   R EEEE  CCCC IIIII BBBB   OOO

                        // Recibo.
                        let receipt: Receipt = new Receipt();
                        try {
                            receipt = await receiptModel.getReceipt({ _id: paymentDetail.receiptId });
                        } catch(error) {
                            return reject(error);
                        }

                        //N   N  OOO  TTTTT  AAA   SSSS      DDDD  EEEEE       CCCC RRRR  EEEEE DDDD  IIIII TTTTT  OOO
                        //NN  N O   O   T   A   A S          D   D E          C     R   R E     D   D   I     T   O   O
                        //N N N O   O   T   AAAAA  SSS       D   D EEE        C     RRRR  EEE   D   D   I     T   O   O
                        //N  NN O   O   T   A   A     S      D   D E          C     R   R E     D   D   I     T   O   O
                        //N   N  OOO    T   A   A SSSS       DDDD  EEEEE       CCCC R   R EEEEE DDDD  IIIII   T    OOO

                        //Notas de crédito asociadas a la factura del recibo.
                        let creditNotes: { results: Array<InvoiceV1>, summary: any } = { results: [], summary: {} };
                        // @ts-ignore
                        if(receipt.invoice && (receipt.invoice as InvoiceV1).uuid) {
                            try {
                                // @ts-ignore
                                creditNotes = await invoiceModel.getInvoices({ affectedCFDIs: (receipt.invoice as InvoiceV1).uuid, statusValue: 'active', all: true });
                            } catch(error) {
                                return reject(error);
                            }
                        }
                        let totalCredited: number = 0;
                        if(creditNotes.results.length > 0) {
                            for(const creditNote of creditNotes.results) {
                                // 1. Se debe leer el JSON.
                                let creditNoteJSON: JSON = JSON.parse(creditNote.json);
                                // 2. Se debe revisar el tipo de relación, para notas de crédito es 01.
                                let creditNoteRelationshipType: string = (idx(creditNoteJSON, _ => _['cfdi:Comprobante']['cfdi:CfdiRelacionados']['_attributes']['TipoRelacion']) || '').toString();
                                let creditNoteTotal: number = parseFloat((idx(creditNoteJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0.00').toString());
                                if(creditNoteRelationshipType === '01') {
                                    totalCredited += creditNoteTotal;
                                }
                            }
                        }
                        // NOTE: Continúa en el tag [CONT.INV.V2.02].

                        //PPPP   AAA   GGGG  OOO   SSSS
                        //P   P A   A G     O   O S
                        //PPPP  AAAAA G  GG O   O  SSS
                        //P     A   A G   G O   O     S
                        //P     A   A  GGGG  OOO  SSSS

                        // Pagos asociados al recibo, parcialidades, saldo anterior y actual.
                        let payments: { results: Array<PaymentV1>, summary: any } = { results: [], summary: {} };
                        let receiptPayments: Array<PaymentV1> = [];
                        let partiality: number = 1;
                        let lastBalance: number = receipt.total;
                        let currentBalance: number = 0;
                        try {
                            // console.log('==========================================================================');
                            payments = await paymentModel.getPayments({ 'details.receiptId': paymentDetail.receiptId });
                            // NOTE: Se debe eliminar el pago actual.
                            receiptPayments = payments.results.filter((_payment: any) => {
                                // console.log(`ID pago actual: ${payment._id}`);
                                // console.log(`ID pago recibo: ${_payment._id}`);
                                // console.log(`Estatus del pago: ${_payment.statusValue}`);
                                // console.log(_payment._id !== payment._id);
                                // console.log(_payment.statusValue !== 'credit');
                                // TODO: En realidad sólo se debe excluir el pago que provenga de una nota de crédito generada por el mismo recibo.
                                return (_payment._id != payment._id && _payment.statusValue !== 'credit');
                            });
                            // console.log(`Recibo: ${paymentDetail.receiptId}`);
                            // console.log(`Pago: ${payment._id}`);
                            // console.log(`Total del recibo: ${receipt.total}`);
                            // console.log(`Total acreditado: ${totalCredited}`);
                            // console.log(receiptPayments);
                            // Se obtienen las parcialidades y el total pagado.
                            partiality = (receiptPayments.length || 0) + 1;
                            // [CONT.INV.V2.02]
                            // NOTE: El total pagado del recibo debe comenzar con el total acreditado, el cual será de 0 si no existe ninguna nota de crédito.
                            let totalAmountPaid: number = totalCredited;
                            // Por cada pago se deben revisar los detalles (@_@)...
                            for(const receiptPayment of receiptPayments) {
                                let receiptPaymentDetails: Array<{ receiptId: string; amount: number; }> = receiptPayment.details || [];
                                for(const receiptPaymentDetail of receiptPaymentDetails) {
                                    if(receiptPaymentDetail.receiptId === paymentDetail.receiptId) {
                                        // console.log(`Pago registrado: ${receiptPaymentDetail.amount}`);
                                        totalAmountPaid += parseFloat(receiptPaymentDetail.amount.toFixed(2));
                                    }
                                }
                            }
                            // Se calculan los totales.
                            // console.log(`Total pagado: ${totalAmountPaid}`);
                            // console.log(`Total a pagar: ${paymentDetail.amount}`);
                            lastBalance -= totalAmountPaid;
                            lastBalance = lastBalance < 0 ? 0 : parseFloat(lastBalance.toFixed(2));
                            // DELETE: Borrar por que NO debería ocurrir.
                            if(lastBalance < paymentDetail.amount) lastBalance = paymentDetail.amount;
                            // console.log(`Balance anterior: ${lastBalance}`);
                            currentBalance = lastBalance - paymentDetail.amount;
                            currentBalance = currentBalance < 0 ? 0 : parseFloat(currentBalance.toFixed(2));
                            // console.log(`Balance actual: ${currentBalance}`);
                        } catch(error) {
                            return reject(error);
                        }

                        //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
                        //F     A   A C       T   U   U R   R A   A
                        //FFF   AAAAA C       T   U   U RRRR  AAAAA
                        //F     A   A C       T   U   U R   R A   A
                        //F     A   A  CCCC   T    UUU  R   R A   A

                        // Factura asociada al recibo.
                        // let invoice: InvoiceV1 = new InvoiceV1;
                        let invoiceJSON: any = {};
                        if(receipt.invoice /*&& typeof receipt.invoice._id === 'string'*/) {
                            // try {
                                // invoice = await invoiceModel.getInvoice({ _id: receipt.invoice._id });
                                // @ts-ignore
                                invoiceJSON = JSON.parse(receipt.invoice.json);
                            // } catch(error){
                            //     return reject(error);
                            // }
                        }
                        // Agregar pago al complemento SÓLO SI SE ENCONTRÓ FACTURA, de lo contrario se agregan al arreglo de conceptos.
                        if(!isEmpty(invoiceJSON)) {
                            paymentComplementTotal += parseFloat(paymentDetail.amount.toFixed(2));
                            // @ts-ignore
                            let serie: string = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Serie']) || receipt.invoice.serie).toString();
                            // @ts-ignore
                            let folio: string = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Folio']) || receipt.invoice.folio).toString();
                            complementPayments.push({
                                // @ts-ignore
                                relatedCfdi: receipt.invoice.uuid || (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['UUID']) || '').toString(),
                                currencyDR: (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Moneda']) || '').toString(),
                                exchangeRateDR: parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['TipoCambio']) || '1').toString()),
                                paymentMethodDR: paymentMethod,
                                partiality,                     // Número de pagos anteriores + 1.
                                lastBalance,                    // Saldo anterior.
                                amount: paymentDetail.amount,   // Cantidad que se paga.
                                currentBalance,                 // Saldo actual.
                                serieNFolio: `${serie}${folio}`
                            });
                        } else {
                            let amountWithoutTax: number = parseFloat((paymentDetail.amount / 1.16).toFixed(2));
                            conceptsTotal += parseFloat(paymentDetail.amount.toFixed(2));
                            concepts.push({
                                description: 'Servicio de telecomunicaciones.',
                                cveProductService: '81161700',
                                unitValue: amountWithoutTax,        // paymentDetail.amount,    // payment.amountPaid - IVA.
                                quantity: 1,
                                discount: 0,                        // NO APLICA.
                                idNumber: account.accountNumber,    // El folio de la cuenta / servicio.
                                amount: amountWithoutTax,           // paymentDetail.amount,
                                taxes: [{
                                    base: amountWithoutTax,
                                    tasa: 0.160000,
                                    amount: parseFloat((amountWithoutTax * 0.16).toFixed(2)),
                                    tax: '002',
                                    factorType: 'Tasa'
                                }]
                            });
                        }
                    };
                }

                //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                //R   R E     S     U   U L       T   A   A D   D O   O
                //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                //R   R E         S U   U L       T   A   A D   D O   O
                //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

                let invoices: Array<Invoice> = [];
                // Factura tipo "complemento de pago".
                // NOTE: Si el arreglo de pagos está vacío, no se debe agregar el complemento de pago.
                if(complementPayments.length > 0) {
                    let paymentComplementInvoice: Invoice = Object.assign({}, invoice);
                    // Se cambia la seria de la factura.
                    paymentComplementInvoice.serie = 'P'
                    // Se eliminan los conceptos si existen.
                    // NOTE: En este punto el pago pudo generar 2(3) facturas, y alguna incluye conceptos... la de tipo
                    //       complemento de pago debe contener un único concepto "especial".
                    try {
                        delete paymentComplementInvoice.concepts;
                    } catch(error) {}
                    // Se debe agregar el complemento de pago.
                    paymentComplement.amount = parseFloat(paymentComplementTotal.toFixed(2));
                    paymentComplement.payments = complementPayments;
                    paymentComplementInvoice.paymentComplement = paymentComplement;
                    // Total a manera de ayuda posterior.
                    paymentComplementInvoice.total = parseFloat(paymentComplementTotal.toFixed(2));
                    // Se agrega la factura al arreglo del resultado.
                    invoices.push(paymentComplementInvoice);
                } 
                // Factura "normal".
                // NOTE: Por ahora se suma el remanente al concepto de la factura PUE.
                let remainingAmount: number = parseFloat((conceptsTotal + unstampedAmount).toFixed(2));
                if(concepts.length > 0 || remainingAmount > 0) {
                    let normalInvoice: Invoice = Object.assign({}, invoice);
                    // Se debe cambiar el tipo de factura.
                    normalInvoice.serie = 'I';
                    normalInvoice.compType = 'I';
                    normalInvoice.paymentMethod = 'PUE';
                    // Se debe actualizar el total de la factura en el concepto.
                    // NOTE: El valor de "conceptsTotal" aún tiene el impuesto, se de debe restar.
                    normalInvoice.concepts.push({
                        description: 'Servicio de telecomunicaciones.',
                        cveProductService: '81161700',
                        unitValue: parseFloat(((conceptsTotal + remainingAmount) / 1.16).toFixed(2)),   // ELIMINAR EL REMANENTE.
                        quantity: 1,
                        discount: 0,                                                                    // NO APLICA.
                        idNumber: account.accountNumber,                                                // El folio de la cuenta / servicio.
                        amount: parseFloat((conceptsTotal + remainingAmount).toFixed(2)),               // ELIMINAR EL REMANENTE.
                        taxes: [{
                            base: conceptsTotal + remainingAmount,
                            tasa: 0.160000,
                            amount: parseFloat(((conceptsTotal + remainingAmount) * 0.16).toFixed(2)),
                            tax: '002',
                            factorType: 'Tasa'
                        }]
                    });
                    // Total a manera de ayuda posterior.
                    normalInvoice.total = parseFloat((conceptsTotal + remainingAmount).toFixed(2));
                    // Se agrega la factura al arreglo del resultado.
                    invoices.push(normalInvoice);
                }
                // Se devuelven las facturas.
                return resolve(invoices);
            } else {
                return reject({
                    status: 404,
                    message: 'Facturas v2 | No se pudo obtener la información del cliente.'
                });
            }
        });
    }

    public getInvoiceStatus(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
            //F     A   A C       T   U   U R   R A   A
            //FFF   AAAAA C       T   U   U RRRR  AAAAA
            //F     A   A C       T   U   U R   R A   A
            //F     A   A  CCCC   T    UUU  R   R A   A
            
            let { _id, id, update, ...rest }: { _id: string, id: string, update: boolean } & any = query;
            _id = _id ? _id : id;
            switch(typeof update) {
                case 'string':
                    update = JSON.parse(update);
                    break;
                case 'boolean':
                    update = update;
                    break;
                default:
                    update = false;
                    break;
            }
            let invoice: InvoiceV1 = new InvoiceV1();
            let invoiceModel = new InvoiceModel();
            // Se busca información de la factura.
            try {
                // @ts-ignore
                invoice = await invoiceModel.getInvoice({ _id });
            } catch(error) {
                return reject(error);
            }
            // Se debe obtener la siguiente información.
            // RFC del emisor.
            let issuerRFC: string = '';
            // RFC del receptor.
            let receiverRFC: string = '';
            // Total.
            let total: string = '';
            // UUID.
            let uuid: string = '';
            try {
                uuid = invoice.uuid;
                let invoiceJSON: any = JSON.parse(invoice.json);
                if(typeof uuid != 'string' || uuid.length === 0) uuid = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['UUID']) || '').toString();
                issuerRFC = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Emisor']['_attributes']['Rfc']) || '').toString();
                receiverRFC = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Receptor']['_attributes']['Rfc']) || '').toString();
                total = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '').toString();
            } catch(error) {
                return reject({
                    status: 404,
                    message: 'Facturas v2 | Ocurrió un error al interpretar la información sobre la factura.',
                    error
                });
            }
            // Escapar caracteres especiales en el RFC.
            receiverRFC = receiverRFC.replace(/\&/gi, '&amp;');
            // Se modifica el total para cumplir con la regla de los 2 decimales.
            // if(total === '0') {
            //     total = '0.00'
            // }

            // SSSS  AAA  TTTTT
            //S     A   A   T
            // SSS  AAAAA   T
            //    S A   A   T
            //SSSS  A   A   T

            let data: string = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
                <soapenv:Header/>
                <soapenv:Body>
                    <tem:Consulta>
                        <!--Optional:-->
                        <tem:expresionImpresa><![CDATA[?re=${issuerRFC}&rr=${receiverRFC}&tt=${total}&id=${uuid}]]></tem:expresionImpresa>
                    </tem:Consulta>
                </soapenv:Body>
            </soapenv:Envelope>
            `;
            axios.post(configuration.services.sat.cfdi.getStatus, data, {
                headers: {
                    'Content-Type': 'text/xml;charset="utf-8"',
                    'Accept': 'text/xml',
                    'SOAPAction': 'http://tempuri.org/IConsultaCFDIService/Consulta'
                }
            })
            .then( async (response: any) => {
                let result: any = {};
                let result2JSON: any = {};
                try {
                    let options: any = {
                        compact: true,
                        ignoreComment: true
                    };
                    result2JSON = convert.xml2js(response.data, options);
                    let statusCode: string = (idx(result2JSON, _ => _['s:Envelope']['s:Body']['ConsultaResponse']['ConsultaResult']['a:CodigoEstatus']['_text']) || '').toString();
                    let isItCancelable: string = (idx(result2JSON, _ => _['s:Envelope']['s:Body']['ConsultaResponse']['ConsultaResult']['a:EsCancelable']['_text']) || '').toString();
                    let status: string = (idx(result2JSON, _ => _['s:Envelope']['s:Body']['ConsultaResponse']['ConsultaResult']['a:Estado']['_text']) || '').toString();
                    let cancellationStatus: string = (idx(result2JSON, _ => _['s:Envelope']['s:Body']['ConsultaResponse']['ConsultaResult']['a:EstatusCancelacion']['_text']) || '(no disponible)').toString();
                    result = {
                        statusCode,
                        isItCancelable,
                        status,
                        cancellationStatus
                    };

                    // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
                    //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
                    //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
                    //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
                    //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

                    let updatedInvoice: any = invoice;
                    let errors: Array<any> = [];
                    if(update) {
                        let statusValue: string = invoice.statusValue;
                        // 1. Se obtiene el estatus.
                        // Factura cancelada.
                        if(['active', 'c_process'].indexOf(invoice.statusValue) >= 0 && status.toLowerCase() === 'cancelado') {
                            statusValue = 'cancelled';
                        }
                        // Cancelación rechazada.
                        if(invoice.statusValue === 'c_process' && cancellationStatus.toLowerCase() === 'solicitud rechazada') {
                            statusValue = 'active';
                        }
                        // Cancelación en proceso.
                        if(invoice.statusValue === 'active' && cancellationStatus.toLowerCase() === 'en proceso') {
                            statusValue = 'c_process';
                        }
                        // 2. Se actualiza la factura si el estatus es CANCELADO.
                        if(statusValue === 'cancelled') {
                            try {
                                let cancelledDate: string = date2StringFormat(new Date());
                                let data: any = {
                                    _id,
                                    statusValue,
                                    cancelledDate,
                                    affectedCFDIs: []
                                };
                                updatedInvoice = await invoiceModel.putInvoice(data);
                            } catch(error) {
                                errors.push(error);
                            }
                            // 3. Se ejecuta proceso de cancelación (eliminar la factura del pago/recibo).
                            try {
                                await this.putRemoveInvoiceFromExistance({ _id });
                            } catch(error) {
                                errors.push(error);
                            }
                        }
                        // 4. Se debe actualizar de cualquier manera si el estatus cambió.
                        // NOTE: Si el proceso pasó por el punto 3, esto crea una paradoja en el curso del espacio-tiempo que podría significar el final de raza humana o en el peor de los casos la completa aniquilación de la galaxia.
                        /*
                        if(['active', 'c_process'].indexOf(statusValue) >= 0 && invoice.statusValue !== statusValue) {
                            try {
                                let data: any = {
                                    _id,
                                    statusValue
                                };
                                updatedInvoice = await invoiceModel.putInvoice(data);
                            } catch(error) {
                                errors.push(error);
                            }
                        }
                        */
                        result.errors = errors;
                        result.invoice = updatedInvoice;
                    } else {
                        result.invoice = invoice;
                    }
                    /*
                    {
                        "s:Envelope": {
                            "_attributes": {
                                "xmlns:s": "http://schemas.xmlsoap.org/soap/envelope/"
                            },
                            "s:Body": {
                                "ConsultaResponse": {
                                    "_attributes": {
                                        "xmlns": "http://tempuri.org/"
                                    },
                                    "ConsultaResult": {
                                        "_attributes": {
                                            "xmlns:a": "http://schemas.datacontract.org/2004/07/Sat.Cfdi.Negocio.ConsultaCfdi.Servicio",
                                            "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance"
                                        },
                                        "a:CodigoEstatus": {
                                            "_text": "S - Comprobante obtenido satisfactoriamente."
                                        },
                                        "a:EsCancelable": {
                                            "_text": "Cancelable sin aceptación"
                                        },
                                        "a:Estado": {
                                            "_text": "Vigente"
                                        },
                                        "a:EstatusCancelacion": {}
                                    }
                                }
                            }
                        }
                    }
                    */
                } catch(error) {
                    result = idx(response, _ => _.data) || {};
                } finally {
                    return resolve(result);
                }
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Facturas v2 | Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Facturas v2 | Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    // Utilizando el servicio del proveedor.
    public getInvoiceRelatedCFDIs(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
            //F     A   A C       T   U   U R   R A   A
            //FFF   AAAAA C       T   U   U RRRR  AAAAA
            //F     A   A C       T   U   U R   R A   A
            //F     A   A  CCCC   T    UUU  R   R A   A
            
            let { _id, id, ...rest } = query;
            _id = _id ? _id : id;
            let invoice: InvoiceV1 = new InvoiceV1();
            let invoiceModel = new InvoiceModel();
            // Se busca información de la factura.
            try {
                // @ts-ignore
                invoice = await invoiceModel.getInvoice({ _id });
            } catch(error) {
                return reject(error);
            }
            // Se debe obtener la siguiente información.
            // RFC del emisor.
            let issuerRFC: string = '';
            // RFC del receptor.
            let receiverRFC: string = '';
            // UUID.
            let uuid: string = '';
            try {
                uuid = invoice.uuid;
                let invoiceJSON: any = JSON.parse(invoice.json);
                if(typeof uuid != 'string' || uuid.length === 0) uuid = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['UUID']) || '').toString();
                issuerRFC = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Emisor']['_attributes']['Rfc']) || '').toString();
                receiverRFC = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Receptor']['_attributes']['Rfc']) || '').toString();
            } catch(error) {
                return reject({
                    status: 404,
                    message: 'Facturas v2 | Ocurrió un error al interpretar la información sobre la factura.',
                    error
                });
            }

            // SSSS  AAA  TTTTT
            //S     A   A   T
            // SSS  AAAAA   T
            //    S A   A   T
            //SSSS  A   A   T

            let url: string = configuration.services.sat.cfdi.getRelatedCFDIs;
            url = url.replace('{RFC}', issuerRFC);
            url = url.replace('{UUID}', uuid);
            // console.log(url);
            axios.post(url, {}, {
                headers: {
                    Authorization: `bearer ${configuration.services.sat.cfdi.keys.infiniteToken}`
                }
            })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Facturas v2 | Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Facturas v2 | Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    // Revisando la información dentro de la factura, obtiene los CFDIs que relaciona, no a los que está relacionados ಠ_ಠ
    public getInvoiceRelatedCFDIsV2(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
            //F     A   A C       T   U   U R   R A   A
            //FFF   AAAAA C       T   U   U RRRR  AAAAA
            //F     A   A C       T   U   U R   R A   A
            //F     A   A  CCCC   T    UUU  R   R A   A
            
            let { _id, id, ...rest } = query;
            _id = _id ? _id : id;
            let invoice: InvoiceV1 = new InvoiceV1();
            let invoiceModel = new InvoiceModel();
            // Se busca información de la factura.
            try {
                // @ts-ignore
                invoice = await invoiceModel.getInvoice({ _id });
            } catch(error) {
                return reject(error);
            }
            // Se debe obtener la siguiente información.
            // Documentos relacionados.
            let relatedCFDIs: Array<any> = [];
            try {
                let invoiceJSON: any = JSON.parse(invoice.json);

                //PPPP   AAA   GGGG  OOO   SSSS
                //P   P A   A G     O   O S
                //PPPP  AAAAA G  GG O   O  SSS
                //P     A   A G   G O   O     S
                //P     A   A  GGGG  OOO  SSSS

                let payments: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['pago10:Pagos']['pago10:Pago']['pago10:DoctoRelacionado']);
                if(Array.isArray(payments) && payments.length > 0) {
                    for(const payment of payments) {
                        let attributes: any = payment['_attributes'];
                        /*
                        "IdDocumento":"3132e5f5-d2eb-44a0-95e1-56010335c4de",
                        "MonedaDR":"MXN",
                        "MetodoDePagoDR":"PPD",
                        "NumParcialidad":"1",
                        "ImpSaldoAnt":"1000.00",
                        "ImpPagado":"1000.00",
                        "ImpSaldoInsoluto":"0.00"
                        */
                        relatedCFDIs.push({
                            uuid: attributes.IdDocumento,
                            paymentMethod: attributes.MetodoDePagoDR,
                            partiality: attributes.NumParcialidad,
                            previousBalance: attributes.ImpSaldoAnt,
                            currentBaland: attributes.ImpSaldoInsoluto,
                            amountPaid: attributes.ImpPagado
                        });
                    }
                } else if(payments && payments.hasOwnProperty('_attributes')) {
                    let attributes: any = payments['_attributes'];
                    relatedCFDIs.push({
                        uuid: attributes.IdDocumento,
                        paymentMethod: attributes.MetodoDePagoDR,
                        partiality: attributes.NumParcialidad,
                        previousBalance: attributes.ImpSaldoAnt,
                        currentBaland: attributes.ImpSaldoInsoluto,
                        amountPaid: attributes.ImpPagado
                    });
                }
                
                // CCCC FFFFF DDDD  IIIII  SSSS      RRRR  EEEEE L      AAA   CCCC IIIII  OOO  N   N  AAA  DDDD   OOO   SSSS
                //C     F     D   D   I   S          R   R E     L     A   A C       I   O   O NN  N A   A D   D O   O S
                //C     FFF   D   D   I    SSS       RRRR  EEE   L     AAAAA C       I   O   O N N N AAAAA D   D O   O  SSS
                //C     F     D   D   I       S      R   R E     L     A   A C       I   O   O N  NN A   A D   D O   O     S
                // CCCC F     DDDD  IIIII SSSS       R   R EEEEE LLLLL A   A  CCCC IIIII  OOO  N   N A   A DDDD   OOO  SSSS

                let related: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:CfdiRelacionados']);
                if(Array.isArray(related) && related.length > 0) {
                    for(const single of related) {
                        let attributes: any = single['_attributes'];
                        let cfdi: any = single['cfdi:CfdiRelacionado']['_attributes'];
                        /*
                        "_attributes":{
                            "TipoRelacion":"01"
                        },
                        "cfdi:CfdiRelacionado":{
                            "_attributes":{
                                "UUID":"45cbd4d5-caea-4112-a21c-ee590d76c36d"
                            }
                        }
                        */
                        relatedCFDIs.push({
                            uuid: cfdi.UUID,
                            relationshipType: attributes.TipoRelacion
                        });
                    }
                } else if(related && related.hasOwnProperty('_attributes')) {
                    let attributes: any = related['_attributes'];
                    let cfdi: any = related['cfdi:CfdiRelacionado']['_attributes'];
                    relatedCFDIs.push({
                        uuid: cfdi.UUID,
                        relationshipType: attributes.TipoRelacion
                    });
                }
            } catch(error) {
                return reject({
                    status: 404,
                    message: 'Facturas v2 | Ocurrió un error al interpretar la información sobre la factura.',
                    error
                });
            }

            return resolve({ relatedCFDIs });
        });
    }

    public getInvoiceRelatedCFDIsV3(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
            //F     A   A C       T   U   U R   R A   A
            //FFF   AAAAA C       T   U   U RRRR  AAAAA
            //F     A   A C       T   U   U R   R A   A
            //F     A   A  CCCC   T    UUU  R   R A   A
            
            let { _id, id, ...rest } = query;
            _id = _id ? _id : id;
            let invoice: InvoiceV1 = new InvoiceV1();
            let invoiceModel = new InvoiceModel();
            // Se busca información de la factura.
            try {
                // @ts-ignore
                invoice = await invoiceModel.getInvoice({ _id });
            } catch(error) {
                return reject(error);
            }
            // Se debe obtener la siguiente información.
            // UUID.
            let uuid: string = '';
            try {
                uuid = invoice.uuid;
                let invoiceJSON: any = JSON.parse(invoice.json);
                if(typeof uuid != 'string' || uuid.length === 0) uuid = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['UUID']) || '').toString();
            } catch(error) {
                return reject({
                    status: 404,
                    message: 'Facturas v2 | Ocurrió un error al interpretar la información sobre la factura.',
                    error
                });
            }

            // CCCC FFFFF DDDD  IIIII  SSSS      RRRR  EEEEE L      AAA   CCCC IIIII  OOO  N   N  AAA  DDDD   OOO   SSSS
            //C     F     D   D   I   S          R   R E     L     A   A C       I   O   O NN  N A   A D   D O   O S
            //C     FFF   D   D   I    SSS       RRRR  EEE   L     AAAAA C       I   O   O N N N AAAAA D   D O   O  SSS
            //C     F     D   D   I       S      R   R E     L     A   A C       I   O   O N  NN A   A D   D O   O     S
            // CCCC F     DDDD  IIIII SSSS       R   R EEEEE LLLLL A   A  CCCC IIIII  OOO  N   N A   A DDDD   OOO  SSSS

            let relatedCFDIs: Array<any> = [];
            let _invoices: any = {};
            try {
                _invoices = await invoiceModel.getInvoices({ affectedCFDIs: uuid });
            } catch(error) {
                return reject(error);
            }
            if(Array.isArray(_invoices.results) && _invoices.results.length > 0) {
                for(const _invoice of _invoices.results) {
                    relatedCFDIs.push(_invoice);
                }
            }

            return resolve({ relatedCFDIs });
        });
    }

    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postInvoice(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            // Variables.
            // let { relatedCfdis, paymentComplement, concepts, returnFiles, ..._invoice } = body;
            let account: Account = body.account ? Object.assign({}, body.account) : {};
            let client: Client = body.client ? Object.assign({}, body.client) : {};
            let concepts: Concept[] = (Array.isArray(body.concepts)) ? body.concepts.slice(0): [];
            let relatedCfdis: RelatedCFDI[] = (Array.isArray(body.relatedCfdis)) ? body.relatedCfdis.slice(0) : [];
            let paymentComplement: PaymentComplement = body.paymentComplement ? Object.assign({}, body.paymentComplement) : {};
            let returnFiles: boolean = body.returnFiles ? JSON.parse(body.returnFiles) : false;
            try {
                delete body.account;
                delete body.client;
                delete body.concepts;
                delete body.relatedCfdis;
                delete body.paymentComplement;
                delete body.returnFiles;
            } catch(error) {}
            let invoice: Invoice = body; // ? Object.assign({}, body) : {};

            // 0) Pedir la información del último folio x serie y la configuración general.

            //FFFFF  OOO  L     IIIII  OOO
            //F     O   O L       I   O   O
            //FFF   O   O L       I   O   O
            //F     O   O L       I   O   O
            //F      OOO  LLLLL IIIII  OOO
            
            let query: any = {
                serie: invoice.serie,
                limit: 1,
                page: 1,
                sort: { "field": "folio", "type": "DESC" }                
            };
            let invoiceModelV1 = new InvoiceModel();
            let lastFolio: number = configuration.services.sat.cfdi.stamping.startingFolio;
            try {
                let _invoices = await invoiceModelV1.getInvoices(query);
                if(Array.isArray(_invoices.results) && _invoices.results.length > 0) {
                    lastFolio = (parseInt(_invoices.results[0].folio) + 1) > lastFolio ? parseInt(_invoices.results[0].folio) + 1 : lastFolio;
                }
            } catch(error) {
                return reject(error);
            }

            // CCCC  OOO  N   N FFFFF IIIII  GGGG U   U RRRR   AAA   CCCC IIIII  OOO  N   N       GGGG EEEEE N   N EEEEE RRRR   AAA  L
            //C     O   O NN  N F       I   G     U   U R   R A   A C       I   O   O NN  N      G     E     NN  N E     R   R A   A L
            //C     O   O N N N FFF     I   G  GG U   U RRRR  AAAAA C       I   O   O N N N      G  GG EEE   N N N EEE   RRRR  AAAAA L
            //C     O   O N  NN F       I   G   G U   U R   R A   A C       I   O   O N  NN      G   G E     N  NN E     R   R A   A L
            // CCCC  OOO  N   N F     IIIII  GGGG  UUU  R   R A   A  CCCC IIIII  OOO  N   N       GGGG EEEEE N   N EEEEE R   R A   A LLLLL

            let generalSettingsModel: GeneralSettingsModel = new GeneralSettingsModel();
            let generalSettings: GeneralSettings;
            try {
                generalSettings = await generalSettingsModel.getGeneralSetting({});
            } catch(error) {
                return reject(error);
            }

            // 1) Completar la información.

            // Información que se puede completar:
            // ┌────────────────┬────────────────────────────────────────────────┐
            // │ Nombre         │ Donde o como obtenerlo                         │
            // ├────────────────┼────────────────────────────────────────────────┤
            // │ Versión        │ Configuración.                                 │
            // ├────────────────┼────────────────────────────────────────────────┤
            // │ Folio          │ Del total de folios + 1.                       │
            // ├────────────────┼────────────────────────────────────────────────┤
            // │ Fecha          │ Fecha actual.                                  │
            // ├────────────────┼────────────────────────────────────────────────┤
            // │ Descuento      │ Suma de los descuentos de todos los conceptos. │
            // ├────────────────┼────────────────────────────────────────────────┤
            // │ Lugar          │ Configuración general.                         │
            // ├────────────────┼────────────────────────────────────────────────┤
            // │ RFC            │ Configuración general.                         │
            // ├────────────────┼────────────────────────────────────────────────┤
            // │ Razón Social   │ Configuración general.                         │
            // ├────────────────┼────────────────────────────────────────────────┤
            // │ Razón Social   │ Configuración general.                         │
            // ├────────────────┼────────────────────────────────────────────────┤
            // │ Regimen Fiscal │ Configuración general.                         │
            // └────────────────┴────────────────────────────────────────────────┘
            // Versión.
            let version: string = configuration.services.sat.cfdi.version;
            // Folio
            let folio: number | string = lastFolio;
            // Fecha de creación.
            let today: Date = new Date();
            // YYYY-MM-DDThh:mm:ss
            let createdDate: string = date2StringFormat(today, 'YYYY-MM-DDThh:mm:ss.000z');
            // Descuento.
            let discount: number = 0;
            // if(Array.isArray(concepts) && concepts.length > 0) {
            //     concepts.forEach((concept: any) => {
            //         discount += concept.discount || 0;
            //     });
            // }
            // Subtotal.
            let subTotal: number = 0;
            // Total.
            let total: number = 0;
            // Lugar de expedición.
            let expeditionPlace: string = generalSettings.zipCode;
            // EMISOR:
            // RFC.
            let issuerRFC: string = generalSettings.rfc;
            // Razón social.
            let issuerName: string = generalSettings.name;
            // Regimen fiscal.
            let issuerTaxRegime: any = generalSettings.taxRegimeValue;
            // Información que se envía en blanco.
            // "cfdiStamp": "",
            // "cfdiCertNumber": "",
            // "cfdiCertificate": "",
            // "paymentConditions": "",

            //DDDD   AAA  TTTTT  OOO   SSSS       GGGG EEEEE N   N EEEEE RRRR   AAA  L     EEEEE  SSSS
            //D   D A   A   T   O   O S          G     E     NN  N E     R   R A   A L     E     S
            //D   D AAAAA   T   O   O  SSS       G  GG EEE   N N N EEE   RRRR  AAAAA L     EEE    SSS
            //D   D A   A   T   O   O     S      G   G E     N  NN E     R   R A   A L     E         S
            //DDDD  A   A   T    OOO  SSSS        GGGG EEEEE N   N EEEEE R   R A   A LLLLL EEEEE SSSS

            invoice.version = version;
            invoice.folio = folio;
            invoice.createdDate = createdDate;
            // invoice.discount = discount;
            let exchangeRate: number = invoice.exchangeRate ? invoice.exchangeRate : 1;
            invoice.exchangeRate = exchangeRate;
            invoice.expeditionPlace = expeditionPlace;
            invoice.issuerRFC = issuerRFC;
            invoice.issuerName = issuerName;
            invoice.issuerTaxRegime = issuerTaxRegime;
            // invoice.cfdiStamp = '';
            // invoice.cfdiCertNumber = '';
            // invoice.cfdiCertificate = '';
            // invoice.paymentConditions = '';
            // try {
            //     delete invoice.cfdiStamp;
            //     delete invoice.cfdiCertNumber;
            //     delete invoice.cfdiCertificate;
            //     delete invoice.paymentConditions;
            // } catch(error) {}

            // CCCC  OOO  M   M PPPP  L     EEEEE M   M EEEEE N   N TTTTT  OOO   SSSS
            //C     O   O MM MM P   P L     E     MM MM E     NN  N   T   O   O S
            //C     O   O M M M PPPP  L     EEE   M M M EEE   N N N   T   O   O  SSS
            //C     O   O M   M P     L     E     M   M E     N  NN   T   O   O     S
            // CCCC  OOO  M   M P     LLLLL EEEEE M   M EEEEE N   N   T    OOO  SSSS

            let affectedCFDIs: Array<string> = [];
            if(paymentComplement) {
                paymentComplement.version = configuration.services.sat.cfdi.paymentComplement.version;
                if(Array.isArray(paymentComplement.payments) && paymentComplement.payments.length > 0) {
                    for(const complementPayment of paymentComplement.payments) {
                        // parseFloat(concept.unitValue.toFixed(2))
                        complementPayment.lastBalance = parseFloat(complementPayment.lastBalance.toFixed(2)) || 0.0;
                        complementPayment.amount = parseFloat(complementPayment.amount.toFixed(2)) || 0.0;
                        complementPayment.currentBalance = parseFloat(complementPayment.currentBalance.toFixed(2)) || 0.0;
                        // Totales de la facura.
                        subTotal += parseFloat((complementPayment.amount).toFixed(2));
                        // CFDI afectado.
                        affectedCFDIs.push(complementPayment.relatedCfdi);
                    }
                }
                // Se eliminan los conceptos por que la factura de tipo "complemento de pago" NO los debe llevar.
                // try {
                //     concepts = [];
                // } catch(error) {}
            }

            // CCCC  OOO  N   N  CCCC EEEEE PPPP  TTTTT  OOO   SSSS
            //C     O   O NN  N C     E     P   P   T   O   O S
            //C     O   O N N N C     EEE   PPPP    T   O   O  SSS
            //C     O   O N  NN C     E     P       T   O   O     S
            // CCCC  OOO  N   N  CCCC EEEEE P       T    OOO  SSSS

            // Total de los impuestos.
            let totalTaxAmount: number = 0;
            // Se deben filtrar los conceptos, y sólo dejar los que son mayores a 0.
            if(Array.isArray(concepts) && concepts.length > 0) {
                concepts = concepts.filter((concept: Concept) => {
                    return typeof concept.unitValue === 'number' && concept.unitValue > 0;
                });
            }
            // Se recorren los conceptos restantes.
            if(Array.isArray(concepts) && concepts.length > 0) {
                for(const concept of concepts) {
                    // Totales del concepto.
                    let conceptUnitValue: number = concept.unitValue ? parseFloat(concept.unitValue.toFixed(2)) : 0;
                    let conceptQuantity: number = concept.quantity ? parseFloat(concept.quantity.toFixed(2)) : 1;
                    let conceptDiscount: number = concept.discount ? parseFloat(concept.discount.toFixed(2)) : 0;
                    // Subtotal del concepto (antes de descuento).
                    let conceptAmount: number = parseFloat((conceptUnitValue * conceptQuantity).toFixed(2));
                    // Base para impuesto.
                    let conceptTaxBase: number = parseFloat(((conceptUnitValue * conceptQuantity) - conceptDiscount).toFixed(2));
                    let conceptTaxAmount: number = parseFloat((conceptTaxBase * 0.16).toFixed(2));
                    // console.log(`Total del concepto (sin descuento): ${conceptAmount}`);
                    // console.log(`Decuento del concepto: ${conceptDiscount}`);
                    // console.log(`Base del impuesto: ${conceptTaxBase}`);
                    // console.log(conceptTaxAmount);
                    
                    // SUPER PODEROSA NINJA TURBO NEO ULTRA HYPER MEGA MULTI ALPHA META EXTRA UBER PREFIJO NOTA:
                    // Se debe validar que las cantidades den el total de la factura original, por ejemplo, de una factura de $500 se están 
                    // generando datos que suman $499.99 (también puede ser hacía arriba $500.01).
                    // Si fuesen diferentes (en centavos), ¿se deben sumar a los impuestos o al subtotal? R = Impuestos.

                    // console.log(`Total del concepto (en concepto): ${concept.amount}`);
                    let conceptAmountPlusTaxes: number = parseFloat((conceptTaxBase + conceptTaxAmount).toFixed(2));
                    // console.log(`Total de impuestos: ${conceptTaxAmount}`);
                    // console.log(`Total + impuestos: ${conceptAmountPlusTaxes}`);
                    let missing: number = parseFloat((concept.amount - conceptAmountPlusTaxes).toFixed(2));
                    // console.log(`Faltante: ${missing}`);
                    if(/*typeof missing === 'number'*/ !isNaN(missing) && missing != 0) {
                        conceptTaxAmount += missing;
                        conceptTaxAmount = parseFloat(conceptTaxAmount.toFixed(2));
                    }
                    // Totales de la facura.
                    discount += parseFloat((concept.discount || 0).toFixed(2));
                    subTotal = parseFloat((subTotal + conceptAmount).toFixed(2));
                    // Impuestos del concepto.
                    let conceptTaxes = [{
                        base: conceptTaxBase,
                        tasa: 0.160000,
                        amount: conceptTaxAmount,
                        tax: '002',
                        factorType: 'Tasa'
                    }];
                    // console.log(conceptTaxes);
                    // Se elimina el descuento si viene en 0.
                    try {
                        // console.log(`[MODELOS][FACTURAS][postInvoice] Se eliminan los campos innecesarios.`);
                        // console.log(`[MODELOS][FACTURAS][postInvoice] Tipo: ${typeof concept.idNumber}`);
                        // console.log(`[MODELOS][FACTURAS][postInvoice] Valor: ${concept.idNumber}`);
                        // console.log(`[MODELOS][FACTURAS][postInvoice] ¿Existe? R=${concept.idNumber ? 'Si' : 'No'}`);
                        // console.log(`[MODELOS][FACTURAS][postInvoice] ¿Está vacío? R=${concept.idNumber === '' ? 'Si' : 'No'}`);
                        if(typeof concept.idNumber === 'string' && concept.idNumber == '') {
                            // console.log(`[MODELOS][FACTURAS][postInvoice] Se elimina el "idNumber".`);
                            delete concept.idNumber;
                        }
                        if(concept.discount && concept.discount <= 0) delete concept.discount;
                    } catch(error) {
                        // console.log(`[MODELOS][FACTURAS][postInvoice] Error: ${JSON.stringify(error)}`);
                    }
                    // Cantidades del concepto.
                    concept.unitValue = conceptUnitValue;
                    concept.amount = conceptAmount;             // Cantidad * Precio unitario.
                    concept.unitCve = concept.unitCve || 'E48';
                    // SUPER PODEROSA NINJA TURBO NEO ULTRA HYPER MEGA MULTI ALPHA META EXTRA UBER PREFIJO NOTA:
                    // Se debe revisar si el total y el descuento son la misma cantidad, de esa forma NO se agregan los impuestos.
                    // console.log('[1}Descuento: ', concept.discount);
                    // console.log('[1}Total: ', concept.amount);
                    // console.log('[1}¿Es mayor? R=', (concept.amount > concept.discount));
                    if(concept.amount > concept.discount) {
                        // console.log('[1}Si se agregan impuestos.');
                        concept.taxes = conceptTaxes;
                        // Totales de la facura. (cont...)
                        totalTaxAmount = parseFloat((totalTaxAmount + conceptTaxAmount).toFixed(2));
                    } else {
                        try {
                            delete concept.taxes;
                        } catch(error) {}
                    }
                };
                invoice.concepts = concepts;
            }

            // CCCC  AAA  N   N TTTTT IIIII DDDD   AAA  DDDD  EEEEE  SSSS
            //C     A   A NN  N   T     I   D   D A   A D   D E     S
            //C     AAAAA N N N   T     I   D   D AAAAA D   D EEE    SSS
            //C     A   A N  NN   T     I   D   D A   A D   D E         S
            // CCCC A   A N   N   T   IIIII DDDD  A   A DDDD  EEEEE SSSS

            // NOTE: La función "toFixed" convierte el número en string, ocasionando problemas con las validaciones.
            discount = parseFloat(discount.toFixed(2));
            subTotal = parseFloat(subTotal.toFixed(2));

            // SUPER PODEROSA NINJA TURBO NEO ULTRA HYPER MEGA MULTI ALPHA META EXTRA UBER PREFIJO NOTA:
            // Se debe validar que las cantidades den el total de la factura original, por ejemplo, de una factura de $500 se están 
            // generando datos que suman $499.99 (también puede ser hacía arriba $500.01).
            // Si fuesen diferentes (en centavos), ¿se deben sumar a los impuestos o al subtotal? R = Impuestos.
            // if(typeof invoice.total === 'number') {
            //     let missing: number = invoice.total - (subTotal + totalTaxAmount);
            //     if(missing > 0) {
            //        totalTaxAmount += missing;
            //     } else if(missing < 0) {
            //         totalTaxAmount -= missing;
            //     }
            // }

            totalTaxAmount = parseFloat(totalTaxAmount.toFixed(2));
            total = parseFloat(((subTotal + totalTaxAmount) - discount).toFixed(2));
            // Agregar a la infomración de la factura.
            invoice.discount = discount;
            invoice.subTotal = subTotal;
            invoice.total = total;
            invoice.totalTaxAmount = totalTaxAmount;
            
            //IIIII M   M PPPP  U   U EEEEE  SSSS TTTTT  OOO   SSSS
            //  I   MM MM P   P U   U E     S       T   O   O S
            //  I   M M M PPPP  U   U EEE    SSS    T   O   O  SSS
            //  I   M   M P     U   U E         S   T   O   O     S
            //IIIII M   M P      UUU  EEEEE SSSS    T    OOO  SSSS

            invoice.taxDetails = [{
                amount: totalTaxAmount,
                tax: '002',
                tasa: 0.160000,
                factorType: 'Tasa'
            }];

            //TTTTT IIIII PPPP   OOO
            //  T     I   P   P O   O
            //  T     I   PPPP  O   O 
            //  T     I   P     O   O
            //  T   IIIII P      OOO

            // I (Ingresos) | E (Egresos) | P (Complemento de Pago)
            invoice.compType = invoice.compType.toUpperCase();
            switch(invoice.compType) {
                case 'P':
                    // La moneda debe ser "XXX".
                    invoice.currency = 'XXX';
                    // No se debe enviar la propiedad "paymentMethod".
                    if(invoice.hasOwnProperty('paymentMethod')) {
                        try {
                            delete invoice['paymentMethod'];
                        } catch(error) {}
                    }
                    // Los complementos de pago DEBEN existir.
                    // if(!paymentComplement) {
                    //     paymentComplement = {};
                    // }
                    // Los conceptos deben contener sólo un objeto MUY particular.
                    let newConcepts: Array<ConceptP> = [];
                    newConcepts.push({
                        description: 'Pago',
                        unitCve: 'ACT',
                        cveProductService: '84111506',
                        unitValue: 0,
                        quantity: 1,
                        amount: 0,
                        discount: 0
                    });
                    invoice.concepts = newConcepts.slice(0);
                    // No se deben enviar los impuestos.
                    try {
                        delete invoice['totalTaxAmount'];
                        delete invoice['taxDetails'];
                    } catch(error) {}
                    // Complemento de pago.
                    invoice.paymentComplement = paymentComplement;
                    break;
            }

            // 2) Validar información completa.
            // [AYUDA].
            // console.log(`[MODELOS][FACTURAS][postInvoice] Factura completa: ${JSON.stringify(invoice)}`);
            // console.log('==================== FACTURA COMPLETA ==========\n', invoice);

            // CCCC FFFFF DDDD  IIIII  SSSS      RRRR  EEEEE L      AAA   CCCC IIIII  OOO  N   N  AAA  DDDD   OOO   SSSS
            //C     F     D   D   I   S          R   R E     L     A   A C       I   O   O NN  N A   A D   D O   O S
            //C     FFF   D   D   I    SSS       RRRR  EEE   L     AAAAA C       I   O   O N N N AAAAA D   D O   O  SSS
            //C     F     D   D   I       S      R   R E     L     A   A C       I   O   O N  NN A   A D   D O   O     S
            // CCCC F     DDDD  IIIII SSSS       R   R EEEEE LLLLL A   A  CCCC IIIII  OOO  N   N A   A DDDD   OOO  SSSS

            if(Array.isArray(relatedCfdis) && relatedCfdis.length > 0) {
                invoice.relatedCfdis = relatedCfdis;
                for(const relatedCFDI of relatedCfdis) {
                    affectedCFDIs.push(relatedCFDI.uuid);
                }
            }

            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
    
            let errors: Array<any> = [];
            let clientErrors: any = await this.validateSchemas(invoice, invoice.relatedCfdis, paymentComplement, concepts, invoice.taxDetails, [invoice.compType]);
            errors = errors.concat(clientErrors);
            // Si ocurrió algún error se termina la función.
            if(errors.length > 0) {
                return reject({
                    status: 400,
                    message: 'Facturas v2 | La información no es válida.',
                    errors
                });
            } else {
    
                // 3) Timbrar.
    
                // DELETE: Borrar, ya no se va a utilizar este servicio.
                // a) Obtener el token.
                /*
                let token: string = '';
                try {
                    let data = {
                        email: configuration.services.sat.cfdi.stamping.login.email,
                        password: configuration.services.sat.cfdi.stamping.login.password
                    };
                    let loginResult: any = await axios.post(configuration.services.sat.cfdi.stamping.login.url, data);
                    // console.log(`[MODELOS][FACTURAS][postInvoice] Resultado Login: ${JSON.stringify(loginResult.data)}`);
                    token = loginResult.data.token;
                } catch(error) {
                    return reject({
                        status: 400,
                        message: 'No se pudo iniciar sesión en el servicio de timbrado.',
                        error: idx(error, _ => _.response.data) || error
                    });
                }
                */
                // b) Timbrar.
                let stampedInvoiceResult: IIssueResponse = {
                    status: 200,
                    data: {
                        cadenaOriginalSAT: '',
                        noCertificadoSAT: '',
                        noCertificadoCFDI: '',
                        uuid: '',
                        selloSAT: '',
                        selloCFDI: '',
                        fechaTimbrado: '',
                        qrCode: '',
                        cfdi: ''
                    }
                };
                let xmlText: any = '';
                let pdfText: any = '';
                let qrCode: any = '';
                let uuid: string = '';
                let originalString: string = '';
                try {
                    // stampedInvoiceResult = await axios.post(configuration.services.sat.cfdi.stamping.stamping, invoice, {
                    //     headers: {
                    //         'Authorization': `Token ${token}`
                    //     }
                    // });
                    stampedInvoiceResult = await this.postIssueJSONWithProvider(invoice);
                    xmlText = idx(stampedInvoiceResult, _ => _.data.cfdi);
                    // pdfText = idx(stampedInvoiceResult, _ => _.data.data.pdf);
                    qrCode = idx(stampedInvoiceResult, _ => _.data.qrCode);
                    uuid = (idx(stampedInvoiceResult, _ => _.data.uuid) || '').toString();
                    originalString = (idx(stampedInvoiceResult, _ => _.data.cadenaOriginalSAT) || '').toString();
                } catch(error) {
                    return reject(error);
                }
    
                //PPPP  DDDD  FFFFF
                //P   P D   D F
                //PPPP  D   D FFF
                //P     D   D F
                //P     DDDD  F

                let ejsData: any = {};
                try {
                    // Información necesaria para el formato EJS.
                    // Dirección.
                    let address: Address = client.address || new Address();
                    let location: any = address.extraDetails;
                    let address1: string = `${address.street || ''}, ${address.outdoorNumber || 'S/N'}${address.interiorNumber ? ` int. ${address.interiorNumber},` : ','} ${idx(location, _ => _.name) || ''}`;
                    let address2: string = `${idx(location, _ => _.town.name) || ''}, ${idx(location, _ => _.state.name) || ''}, ${idx(location, _ => _.country.name) || ''}`;
                    // Fecha de emisión
                    let today: Date = new Date();
                    let date: string = date2String(new Date(), EDateType.Long);
                    // Fecha de vencimiento.
                    let dueDate:string = date2StringFormat(new Date(today.getFullYear(), today.getMonth() + 1, 0), 'DD/MM/YYYY');
                    // Conceptos.
                    // Se debe dar fomato a las cantidades.
                    let _concepts: Array<{ [key: string]: string }> = [];
                    if(invoice.compType === 'P') {
                        // Tipo "P".
                        for(const _payment of paymentComplement.payments) {
                            _concepts.push({
                                uuid: _payment.relatedCfdi,
                                serieNfolio: _payment.serieNFolio.toUpperCase(),
                                lastBalance: `$${currencyFormat.format(_payment.lastBalance || 0)}`,
                                amount: `$${currencyFormat.format(_payment.amount || 0)}`,
                                currentBalance: `$${currencyFormat.format(_payment.currentBalance || 0)}`
                            });
                        }
                    } else {
                        // Tipo "A".
                        for(const _concept of invoice.concepts) {
                            _concepts.push({
                                amount: (_concept.quantity || 1).toString(),
                                key: _concept.idNumber || '-----', // Número de cuenta
                                unitKey: _concept.unitCve || 'E48',
                                serviceKey: _concept.cveProductService,
                                description: _concept.description,
                                unitCost: `$${currencyFormat.format(_concept.unitValue || 0)}`,
                                total: `$${currencyFormat.format(_concept.amount || 0)}`
                            });
                        }
                    }
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
                    // Datos completos.
                    ejsData = {
                        date,
                        dueDate,
                        invoice: {
                            folio: `${invoice.serie.toUpperCase()}-${invoice.folio}`,
                            uuid: idx(stampedInvoiceResult, _ => _.data.uuid),
                            stampingDate: idx(stampedInvoiceResult, _ => _.data.fechaTimbrado),
                            csd: idx(stampedInvoiceResult, _ => _.data.noCertificadoCFDI),
                            satCSD: idx(stampedInvoiceResult, _ => _.data.noCertificadoSAT),
                            cfdiUse: invoice.cfdiUse,
                            paymentForm: invoice.paymentForm,
                            paymentMethod: invoice.paymentMethod,
                            subtotal: `$${currencyFormat.format(invoice.subTotal)}`,
                            discount: `$${currencyFormat.format(invoice.discount)}`,
                            taxes: `$${currencyFormat.format(invoice.totalTaxAmount)}`,
                            total: `$${currencyFormat.format(invoice.total)}`,
                            totalInText: number2Words(invoice.total, invoice.currency),
                            qrCode: idx(stampedInvoiceResult, _ => _.data.qrCode),
                            originalString: idx(stampedInvoiceResult, _ => _.data.cadenaOriginalSAT),
                            concepts: _concepts,
                            cfdiStamp: idx(stampedInvoiceResult, _ => _.data.selloCFDI),
                            satStamp: idx(stampedInvoiceResult, _ => _.data.selloSAT),
                            currency: invoice.currency,
                            exchangeRate: invoice.exchangeRate || 1
                        },
                        account: {
                            accountNumber: account.accountNumber,
                            paymentReferences
                        },
                        client: {
                            name: `${client.firstName || ''} ${client.secondName || ''} ${client.firstLastName || ''} ${client.secondLastName || ''}`,
                            rfc: idx(client, _ => _.businessData.rfc) || '',
                            address1,
                            zipCode: `C.P.: ${idx(location, _ => _.zipCode) || ''}`,
                            address2,
                            // Sólo cuando la forma de pago sea 02, 03, 04 o 28,
                            businessData: {
                                businessName: idx(client, _ => _.businessData.businessName) || '',
                                issuingAccountNumber: idx(client, _ => _.businessData.issuingAccountNumber) || '',
                                issuingBankRfc: idx(client, _ => _.businessData.issuingBankRfc) || '',
                                issuingBankName: idx(client, _ => _.businessData.issuingBankName) || ''
                            }
                        },
                        company: {
                            name: generalSettings.businessName,
                            rfc: generalSettings.rfc,
                            accountNumber: ''
                        }
                    };
                    // Se genera el archivo PDF "virtual.".
                    // P === Complemento.
                    // E === Nota de Crédito.
                    let templateName: string = '../templates/invoice.type.a.ejs';
                    switch(invoice.compType) {
                        case 'P':
                            templateName = '../templates/invoice.type.p.ejs';
                            break;
                        case 'E':
                            templateName = '../templates/invoice.type.cn.ejs';
                            break;
                    }
                    let pdfToBase64Result = await pdf2Base64(templateName, ejsData);
                    pdfText = pdfToBase64Result.data;
                } catch(error) {
                    // No se hace ningún cambio, se deja el PDF original.
                }

                // 4) Convertir XML -> JSON.
    
                let invoiceJSON: string = '';
                let xmlBuffer: Buffer | undefined;
                let pdfBuffer: Buffer | undefined;
                try {
                    let options: any = {
                        compact: true,
                        ignoreComment: true
                    };
                    invoiceJSON = JSON.stringify(convert.xml2js(xmlText, options));
                    // Se crea un "archivo virtual" del tipo XML.
                    // Blob isn't available because it's defined by a DOM API and Node is not a DOM implementation.
                    // https://stackoverflow.com/questions/14653349/node-js-can´t-create-blobs
                    // xml = new Blob([xmlText], { type : 'text/xml' });
                    xmlBuffer = Buffer.from(xmlText);
                    // Se crea un "archivo virtual" del tipo PDF.
                    // pdf = new Blob([pdfText], { type : 'application/pdf' });
                    pdfBuffer = Buffer.from(pdfText, 'base64');
                } catch(exception) {
                    // console.log(`[MODELOS][FACTURAS][postInvoice][CREAR BUFFER] Error: ${exception}`);
                }
    
                // 5) Se guardan los archivos XML y PDF.
    
                // AAA  RRRR   CCCC H   H IIIII V   V  OOO   SSSS
                //A   A R   R C     H   H   I   V   V O   O S
                //AAAAA RRRR  C     HHHHH   I   V   V O   O  SSS
                //A   A R   R C     H   H   I    V V  O   O     S
                //A   A R   R  CCCC H   H IIIII   V    OOO  SSSS
                
                // Variables
                let id = invoice.serie;
                let category = 'invoices';
                let company = configuration.company.name;
                let xmlURL: string = '';
                let pdfURL: string = '';
                let fileModel = new FilesModel();
                // XML.
                if(xmlBuffer){
                    try {
                        let _file: any = await fileModel.postFileFromBuffer(xmlBuffer, 'text/xml', `${invoice.serie}${invoice.folio}.xml`, id, category, company);
                        xmlURL = _file.path;
                    } catch(error) {
                        return reject(error);
                    }
                }
                // PDF.
                if(pdfBuffer){
                    try {
                        let _file: any = await fileModel.postFileFromBuffer(pdfBuffer, 'application/pdf', `${invoice.serie}${invoice.folio}.pdf`, id, category, company);
                        pdfURL = _file.path;
                    } catch(error) {
                        return reject(error);
                    }
                }
    
                // 6) Se guarda la información con el modelo INVOICE v1.
    
                let invoiceV1: InvoiceV1 = {
                    invoiceDate: createdDate,
                    serie: invoice.serie,
                    folio,
                    xml: xmlURL,
                    pdf: pdfURL,
                    json: invoiceJSON,
                    qrCode,
                    uuid,
                    statusValue: 'active',
                    affectedCFDIs,
                    originalString
                };
                invoiceModelV1.postInvoice(invoiceV1)
                .then((response: any) => {
                    // Se revisa si se pidió devolver los archivos.
                    if(returnFiles) {
                        response.files = {};
                        response.files.xml = xmlText;
                        response.files.pdf = pdfText;
                    }
                    // EXTRA: Como información adicional se devuelven los datos para formar el EJS.
                    // response.ejs = ejsData.invoice;
                    // Resultado final.
                    return resolve(response);
                })
                .catch((error: any) => {
                    return reject(error);
                });
            }
        });
    }

    // DELETE:
    public postCreditNote(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Se obtienen el id del pago, el tipo de relación, concepto y monto a aplicar del body.
            let { invoiceId, relationshipType, cfdiUse, concept, amount, paymentForm }: { invoiceId: string, relationshipType: string, cfdiUse: string, concept: string, amount: number, paymentForm: string } = body;
            // Se verifica que la información sea correcta.

            //RRRR  EEEEE L      AAA   CCCC IIIII  OOO  N   N
            //R   R E     L     A   A C       I   O   O NN  N
            //RRRR  EEE   L     AAAAA C       I   O   O N N N
            //R   R E     L     A   A C       I   O   O N  NN
            //R   R EEEEE LLLLL A   A  CCCC IIIII  OOO  N   N

            if(RELATIONSHIP_TYPES.indexOf(relationshipType) < 0) {
                return reject({
                    status: 400,
                    message: 'Facturas v2 | El tipo de relación no es válido.'
                });
            }

            //U   U  SSSS  OOO       DDDD  EEEEE       CCCC FFFFF DDDD  IIIII
            //U   U S     O   O      D   D E          C     F     D   D   I
            //U   U  SSS  O   O      D   D EEE        C     FFF   D   D   I
            //U   U     S O   O      D   D E          C     F     D   D   I
            // UUU  SSSS   OOO       DDDD  EEEEE       CCCC F     DDDD  IIIII

            if(CFDI_USE.indexOf(cfdiUse) < 0) {
                return reject({
                    status: 400,
                    message: 'Facturas v2 | El uso de CFDI no es válido.'
                });
            }

            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
            //F     A   A C       T   U   U R   R A   A
            //FFF   AAAAA C       T   U   U RRRR  AAAAA
            //F     A   A C       T   U   U R   R A   A
            //F     A   A  CCCC   T    UUU  R   R A   A

            let invoiceV1: InvoiceV1 = new InvoiceV1();
            let invoiceJSON: any = {};
            try {
                let invoiceModelV1: InvoiceModel = new InvoiceModel();
                invoiceV1 = await invoiceModelV1.getInvoice({ _id: invoiceId });
                invoiceJSON = JSON.parse(invoiceV1.json);
            } catch(error) {
                return reject(error);
            }
            
            //PPPP   AAA   GGGG  OOO
            //P   P A   A G     O   O
            //PPPP  AAAAA G  GG O   O
            //P     A   A G   G O   O
            //P     A   A  GGGG  OOO

            let payment: PaymentV1 = new PaymentV1();
            let paymentModel: PaymentModel = new PaymentModel();
            let isFromPayment: boolean = true;
            try {
                payment = await paymentModel.getPayment({ invoices: invoiceId });
            } catch(error) {
                /*
                return reject({
                    status: 404,
                    message: 'Ocurrió un error al intentar obtener la información del pago.',
                    error
                });
                */
                isFromPayment = false;
            }

            //RRRR  EEEEE  CCCC IIIII BBBB   OOO
            //R   R E     C       I   B   B O   O
            //RRRR  EEE   C       I   BBBB  O   O
            //R   R E     C       I   B   B O   O
            //R   R EEEEE  CCCC IIIII BBBB   OOO

            let receipt: Receipt = new Receipt();
            let receiptModel: ReceiptModel = new ReceiptModel();
            if(!isFromPayment) {
                try {
                    receipt = await receiptModel.getReceipt({ invoice: invoiceId });
                } catch(error) {
                    return reject(error);
                }
            }

            //M   M  OOO  N   N TTTTT  OOO
            //MM MM O   O NN  N   T   O   O
            //M M M O   O N N N   T   O   O
            //M   M O   O N  NN   T   O   O
            //M   M  OOO  N   N   T    OOO

            // SUPER PODEROSA NINJA TURBO NEO ULTRA HYPER MEGA MULTI ALPHA META EXTRA UBER PREFIJO NOTA:
            // El monto debe reflejar todas las notas de crédito existentes.

            // Total acreditado de todas las notas de crédito existentes.
            let affectedCFDIs: Array<InvoiceV1> = [];
            let amountCredited: number = 0;
            try {
                affectedCFDIs = await this.getInvoiceRelatedCFDIsV3({ invoiceId });
            } catch(error) {
                return reject(error);
            }
            if(affectedCFDIs.length > 0) {
                for(const affectedCFDI of affectedCFDIs) {
                    // Se revisa que la factura sea de tipo EGRESO.
                    if(affectedCFDI.serie === 'E') {
                        // Se parsea la información de la factura.
                        let affectedCFDIJSON: any = JSON.parse(affectedCFDI.json);
                        // Se obtiene el total de la factura desde la información general.
                        let affectedCFDITotal: number = parseFloat((idx(affectedCFDIJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0').toString());
                        // Se revisa si el total no está en el complemento.
                        if(affectedCFDITotal === 0) {
                            let payments: any = idx(affectedCFDIJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['pago10:Pagos']);
                            if(Array.isArray(payments) && payments.length > 0) {
                                for(const payment of payments) {
                                    affectedCFDITotal += parseFloat(payment['pago10:Pago']['_attributes']['Monto'] || 0);                        
                                }
                            } else if(payments && payments.hasOwnProperty('_attributes')) {
                                affectedCFDITotal = parseFloat(payments['pago10:Pago']['_attributes']['Monto'] || 0);
                            }
                        }
                        // Se suma el total acreditado.
                        amountCredited += affectedCFDITotal;
                    }
                }
            }
            // Total de la factura actual.
            let invoiceTotal: number = parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0').toString());
            // Se revisa si el total no está en el complemento.
            if(invoiceTotal === 0) {
                let payments: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['pago10:Pagos']);
                if(Array.isArray(payments) && payments.length > 0) {
                    for(const payment of payments) {
                        invoiceTotal += parseFloat(payment['pago10:Pago']['_attributes']['Monto'] || 0);                        
                    }
                } else if(payments && payments.hasOwnProperty('_attributes')) {
                    invoiceTotal = parseFloat(payments['pago10:Pago']['_attributes']['Monto'] || 0);
                }
            }
            // Se revisa que el total no sea mayor al que resta por acreditar.
            if(amount >= (invoiceTotal - amountCredited)) {
                return reject({
                    status: 400,
                    message: 'El monto a aplicar no puede ser mayor ni igual al monto del pago original.'
                });
            }

            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE

            // Se debe obtener la información del cliente (ya sea desde la cuenta o desde el mismo cliente).
            let client: Client = new Client();
            let account: Account = new Account();
            let parentId: string = payment.parentId || receipt.parentId;
            let parentType: string = payment.parentType || receipt.parentType;
            switch(parentType){
                case 'client':
                    let clientModel: ClientModel = new ClientModel();
                    try {
                        client = await clientModel.getClient({ folio: parentId });
                    } catch(error) {                        
                        return reject(error);
                    }
                    break;
                case 'account':
                    let accountModel: AccountModel = new AccountModel();
                    try {
                        account = await accountModel.getAccount({ accountNumber: parentId });
                        client = account.client || new Client();
                    } catch(error) {
                        return reject(error);
                    }
                    break;
                default:
                    return reject({
                        status: 404,
                        message: 'Facturas v2 | No se encontró información sobre el tipo de padre en el recibo.',
                    });
            }

            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
            //F     A   A C       T   U   U R   R A   A
            //FFF   AAAAA C       T   U   U RRRR  AAAAA
            //F     A   A C       T   U   U R   R A   A
            //F     A   A  CCCC   T    UUU  R   R A   A

            let invoice: Invoice;
            // Conceptos.
            let concepts: Array<Concept> = [];
            // NOTE: Se mandan los datos en 'crudo' (sin albur), el proceso de generación de factura les da formato.
            let amountWithoutTaxes: number = parseFloat((amount / 1.16).toFixed(2));
            concepts.push({
                description: concept,
                cveProductService: '84111506',
                unitCve: 'ACT',
                unitValue: amountWithoutTaxes, // amount,
                quantity: 1,
                discount: 0,
                amount,
                idNumber: account.accountNumber || '',
                taxes: [{
                    base: amountWithoutTaxes, // amount,
                    tasa: 0.160000,
                    amount: parseFloat((amountWithoutTaxes * 0.16).toFixed(2)),
                    tax: '002',
                    factorType: 'Tasa'
                }]
            });
            // Factura.
            let currency: string = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Moneda']) || 'MXN').toString();
            let exchangeRate: number = parseInt((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['TipoCambio']) || '1').toString());
            invoice = {
                serie: 'E',
                paymentForm: paymentForm,
                currency, // : 'MXN',                                    // TODO: Revisar que venga del pago o factura.
                exchangeRate, // : 1,                                    // TODO: Revisar que venga del pago o factura.
                compType: 'E',
                paymentMethod: 'PUE',
                receptorRFC: (idx(client, _ => _.businessData.rfc) || '').toString(),
                receptorName: (idx(client, _ => _.businessData.businessName) || '').toString(),
                cfdiUse: cfdiUse, // (idx(client, _ => _.businessData.cfdiUse) || '').toString(),
                concepts,
                account,
                client
            };
            // CFDIs relacionados.
            let uuid: string = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['UUID']) || '').toString();
            let relatedCFDIs: Array<RelatedCFDI> = [];
            relatedCFDIs.push({
                uuid,
                relationshipType
            })
            invoice.relatedCfdis = relatedCFDIs;

            //TTTTT IIIII M   M BBBB  RRRR   AAA  DDDD   OOO
            //  T     I   MM MM B   B R   R A   A D   D O   O
            //  T     I   M M M BBBB  RRRR  AAAAA D   D O   O
            //  T     I   M   M B   B R   R A   A D   D O   O
            //  T   IIIII M   M BBBB  R   R A   A DDDD   OOO

            let stamping: any = {};
            let attachments: Array<FileStructure> = [];
            try {
                // @ts-ignore
                invoice.returnFiles = true;
                stamping = await this.postInvoice(invoice);
                // Se revisan los archivos recibidos y se agregan al arreglo de archivos adjuntos.
                // XML.
                let xmlFile: string = (idx(stamping, _ => _.files.xml) || '').toString();
                if(typeof xmlFile === 'string' && xmlFile.length > 0) {
                    attachments.push({
                        type: 'text/xml',
                        name: 'Factura.xml',
                        content: xmlFile
                    });
                }
                // PDF.
                let pdfFile: string = (idx(stamping, _ => _.files.pdf) || '').toString();
                if(typeof pdfFile === 'string' && pdfFile.length > 0) {
                    attachments.push({
                        type: 'application/pdf',
                        name: 'Factura.pdf',
                        content: pdfFile
                    });
                }
            } catch(error) {
                return reject(error);
            }

            //PPPP   AAA   GGGG  OOO
            //P   P A   A G     O   O
            //PPPP  AAAAA G  GG O   O
            //P     A   A G   G O   O
            //P     A   A  GGGG  OOO
            
            let _payment: any = {};
            try {
                let paymentV1 = new PaymentV1();
                paymentV1 = {
                    parentId: account.accountNumber,
                    parentType: 'account',
                    paymentDate: date2StringFormat(new Date()),
                    applicationDate: date2StringFormat(new Date()),
                    amountPaid: amount,
                    typeValue: '01',
                    statusValue: 'credit',
                    description: concept,
                    currencyValue: currency, // 'MXN',                  // TODO: Revisar que venga del pago o factura.
                    exchangeRate, // : 1,                               // TODO: Revisar que venga del pago o factura.
                    // internalAccountNumber
                    // comission
                    // cardDetails
                    invoices: [stamping._id],
                    reference: account.accountNumber,
                    // details
                    paymentForm
                }
                _payment = await paymentModel.postPayment(paymentV1);
            } catch(error) {
                return reject(error);
            }

            //EEEEE M   M  AAA  IIIII L
            //E     MM MM A   A   I   L
            //EEE   M M M AAAAA   I   L
            //E     M   M A   A   I   L
            //EEEEE M   M A   A IIIII LLLLL
            
            let accountProcessesModel: AccountProcessesModel = new AccountProcessesModel();
            let mailingErrors: Array<any> = [];
            if(attachments.length > 0) {
                let data: any = {
                    accountNumber: account.accountNumber,
                    attachments,
                    template: 'client_notification',
                    content: [
                        {
                            name: 'message',
                            content: 'Por medio del presente correo le hacemos llegar su estado de cuenta del mes.'
                        }
                    ],
                    subject: `Domain Estado de cuenta ${account.accountNumber}.`
                };
                try {
                    await accountProcessesModel.sendEmail(data);
                } catch(error) {
                    mailingErrors.push(error);
                }
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            let result: any = Object.assign({}, _payment);
            result.errors = {};
            result.errors.mailingErrors = mailingErrors;
            return resolve({
                status: 200,
                data: result
            });
        });
    }

    // NOTE: Esta versión acepta más de un sólo concepto.
    public postCreditNoteV2(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Se obtienen el id del pago, el tipo de relación, concepto y monto a aplicar del body.
            let { invoiceId, relationshipType, cfdiUse, concepts: _concepts, paymentForm, paymentMethod }: { invoiceId: string, relationshipType: string, cfdiUse: string, concepts: Array<{ concept: string, quantity: number, unitCost: number, productCode: string, unitCode: string }>, paymentForm: string, paymentMethod: string } = body;
            // Se verifica que la información sea correcta.
            
            //RRRR  EEEEE L      AAA   CCCC IIIII  OOO  N   N
            //R   R E     L     A   A C       I   O   O NN  N
            //RRRR  EEE   L     AAAAA C       I   O   O N N N
            //R   R E     L     A   A C       I   O   O N  NN
            //R   R EEEEE LLLLL A   A  CCCC IIIII  OOO  N   N

            if(RELATIONSHIP_TYPES.indexOf(relationshipType) < 0) {
                return reject({
                    status: 400,
                    message: 'Facturas v2 | El tipo de relación no es válido.'
                });
            }

            //U   U  SSSS  OOO       DDDD  EEEEE       CCCC FFFFF DDDD  IIIII
            //U   U S     O   O      D   D E          C     F     D   D   I
            //U   U  SSS  O   O      D   D EEE        C     FFF   D   D   I
            //U   U     S O   O      D   D E          C     F     D   D   I
            // UUU  SSSS   OOO       DDDD  EEEEE       CCCC F     DDDD  IIIII

            if(CFDI_USE.indexOf(cfdiUse) < 0) {
                return reject({
                    status: 400,
                    message: 'Facturas v2 | El uso de CFDI no es válido.'
                });
            }

            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
            //F     A   A C       T   U   U R   R A   A
            //FFF   AAAAA C       T   U   U RRRR  AAAAA
            //F     A   A C       T   U   U R   R A   A
            //F     A   A  CCCC   T    UUU  R   R A   A

            let invoiceV1: InvoiceV1 = new InvoiceV1();
            let invoiceJSON: any = {};
            try {
                let invoiceModelV1: InvoiceModel = new InvoiceModel();
                invoiceV1 = await invoiceModelV1.getInvoice({ _id: invoiceId });
                invoiceJSON = JSON.parse(invoiceV1.json);
            } catch(error) {
                return reject(error);
            }
            
            //PPPP   AAA   GGGG  OOO
            //P   P A   A G     O   O
            //PPPP  AAAAA G  GG O   O
            //P     A   A G   G O   O
            //P     A   A  GGGG  OOO

            let payment: PaymentV1 = new PaymentV1();
            let paymentModel: PaymentModel = new PaymentModel();
            let isFromPayment: boolean = true;
            try {
                payment = await paymentModel.getPayment({ invoices: invoiceId });
            } catch(error) {
                /*
                return reject({
                    status: 404,
                    message: 'Ocurrió un error al intentar obtener la información del pago.',
                    error
                });
                */
                isFromPayment = false;
            }

            //RRRR  EEEEE  CCCC IIIII BBBB   OOO
            //R   R E     C       I   B   B O   O
            //RRRR  EEE   C       I   BBBB  O   O
            //R   R E     C       I   B   B O   O
            //R   R EEEEE  CCCC IIIII BBBB   OOO

            let receipt: Receipt = new Receipt();
            let receiptModel: ReceiptModel = new ReceiptModel();
            if(!isFromPayment) {
                try {
                    receipt = await receiptModel.getReceipt({ invoice: invoiceId });
                } catch(error) {
                    return reject(error);
                }
            }

            //M   M  OOO  N   N TTTTT  OOO
            //MM MM O   O NN  N   T   O   O
            //M M M O   O N N N   T   O   O
            //M   M O   O N  NN   T   O   O
            //M   M  OOO  N   N   T    OOO

            // SUPER PODEROSA NINJA TURBO NEO ULTRA HYPER MEGA MULTI ALPHA META EXTRA UBER PREFIJO NOTA:
            // El monto debe reflejar todas las notas de crédito existentes.

            // Total acreditado de todas las notas de crédito existentes.
            let affectedCFDIs: Array<InvoiceV1> = [];
            let amountCredited: number = 0;
            try {
                affectedCFDIs = await this.getInvoiceRelatedCFDIsV3({ invoiceId });
            } catch(error) {
                return reject(error);
            }
            if(affectedCFDIs.length > 0) {
                for(const affectedCFDI of affectedCFDIs) {
                    // Se revisa que la factura sea de tipo EGRESO.
                    if(affectedCFDI.serie === 'E') {
                        // Se parsea la información de la factura.
                        let affectedCFDIJSON: any = JSON.parse(affectedCFDI.json);
                        // Se obtiene el total de la factura desde la información general.
                        let affectedCFDITotal: number = parseFloat((idx(affectedCFDIJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0').toString());
                        // Se revisa si el total no está en el complemento.
                        if(affectedCFDITotal === 0) {
                            let payments: any = idx(affectedCFDIJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['pago10:Pagos']);
                            if(Array.isArray(payments) && payments.length > 0) {
                                for(const payment of payments) {
                                    affectedCFDITotal += parseFloat(payment['pago10:Pago']['_attributes']['Monto'] || 0);                        
                                }
                            } else if(payments && payments.hasOwnProperty('_attributes')) {
                                affectedCFDITotal = parseFloat(payments['pago10:Pago']['_attributes']['Monto'] || 0);
                            }
                        }
                        // Se suma el total acreditado.
                        amountCredited += affectedCFDITotal;
                    }
                }
            }
            // Total de la factura actual.
            let invoiceTotal: number = parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0').toString());
            // Se revisa si el total no está en el complemento.
            if(invoiceTotal === 0) {
                let payments: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['pago10:Pagos']);
                if(Array.isArray(payments) && payments.length > 0) {
                    for(const payment of payments) {
                        invoiceTotal += parseFloat(payment['pago10:Pago']['_attributes']['Monto'] || 0);                        
                    }
                } else if(payments && payments.hasOwnProperty('_attributes')) {
                    invoiceTotal = parseFloat(payments['pago10:Pago']['_attributes']['Monto'] || 0);
                }
            }
            // Monto total de todos los conceptos.
            let totalAmount: number = 0;
            for(const _concept of _concepts) {
                // monto = cantidad x precio unitario
                totalAmount += parseFloat(((_concept.quantity * _concept.unitCost) * 1.16).toFixed(2));
            }
            totalAmount = parseFloat(totalAmount.toFixed(2));
            // Se revisa que el total no sea mayor al que resta por acreditar.
            if(totalAmount >= (invoiceTotal - amountCredited)) {
                return reject({
                    status: 400,
                    message: 'Facturas v2 | El monto a aplicar no puede ser mayor ni igual al monto del pago original.'
                });
            }

            //DDDD  EEEEE TTTTT  AAA  L     L     EEEEE  SSSS
            //D   D E       T   A   A L     L     E     S
            //D   D EEE     T   AAAAA L     L     EEE    SSS
            //D   D E       T   A   A L     L     E         S
            //DDDD  EEEEE   T   A   A LLLLL LLLLL EEEEE SSSS

            let details: { receiptId: string, amount: number }[] = [];
            // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
            // Se deben crear detalles para el pago que se va a generar dependiendo de lo siguiente:

            // - RECIBO -
            // a) Si el recibo no está saldado:
            //        i) El monto de la nota de crédito salda el recibo, se agrega al detalle y se cambia el estatus del recibo.
            //           Si queda un monto restante, se intenta asignar al igual que cuando se crea un recibo.
            //       ii) El monto no lo salda y sólo se agrega al detalle del pago.
            // b) El recibo está saldado:
            //        i) Si hay recibos pendientes se asigna al igual que cuando se crea un recibo.
            //       ii) Si no hay recibos pendientes se genera el pago sin detalles.

            // SUPER PODEROSA NINJA TURBO NEO ULTRA HYPER MEGA MULTI ALPHA META EXTRA UBER PREFIJO NOTA:
            // Para cualquiera de las opciones aquí descrita, el saldo "libre" de la nota de crédito se asigna automáticamente
            // al crear el pago... según yo, reviso y confirmo...
            // Sí, si lo hace.

            // - PAGO -
            // Si la nota de crédito se genera desde un pago, se manda sin detalles.
            if(!isFromPayment) {
                // console.log('Es de un recibo.');
                try {
                    let receiptDetails: IPendingReceipt = await receiptModel.getReceiptDetails({ _id: receipt._id });
                    let { _receipt, ...amounts }: { receipt: Receipt } & any = receiptDetails;
                    // console.log(amounts);
                    if(receiptDetails.pendingAmount > 0) {
                        // console.log('El recibo tiene saldo pendiente.');
                        if(totalAmount >= receiptDetails.pendingAmount) {
                            details.push({
                                receiptId: receipt._id as string,
                                amount: receiptDetails.pendingAmount
                            });
                            // TODO: Se debe actualizar el estatus del recibo.
                            //       Se va a revisar si esto lo hace la asignación del pago.
                            //       No, no lo hace ¯\_ʕ•ᴥ•ʔ_/¯
                            try {
                                await receiptModel.putReceipt({ _id: receipt._id, statusValue: 'paid' });
                            } catch(error) {
                                return reject(error);
                            }
                        } else {
                            details.push({
                                receiptId: receipt._id as string,
                                amount: totalAmount
                            });
                        }
                        // console.log(details);
                    }
                } catch(error) {
                    return reject(error);
                }
            }

            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE

            // Se debe obtener la información del cliente (ya sea desde la cuenta o desde el mismo cliente).
            let client: Client = new Client();
            let account: Account = new Account();
            let parentId: string = payment.parentId || receipt.parentId;
            let parentType: string = payment.parentType || receipt.parentType;
            switch(parentType){
                case 'client':
                    let clientModel: ClientModel = new ClientModel();
                    try {
                        client = await clientModel.getClient({ folio: parentId });
                    } catch(error) {                        
                        return reject(error);
                    }
                    break;
                case 'account':
                    let accountModel: AccountModel = new AccountModel();
                    try {
                        account = await accountModel.getAccount({ accountNumber: parentId });
                        client = account.client || new Client();
                    } catch(error) {
                        return reject(error);
                    }
                    break;
                default:
                    return reject({
                        status: 404,
                        message: 'Facturas v2 | No se encontró información sobre el tipo de padre en el recibo.',
                    });
            }

            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
            //F     A   A C       T   U   U R   R A   A
            //FFF   AAAAA C       T   U   U RRRR  AAAAA
            //F     A   A C       T   U   U R   R A   A
            //F     A   A  CCCC   T    UUU  R   R A   A

            let invoice: Invoice;
            // Conceptos.
            let concepts: Array<Concept> = [];
            for(const _concept of _concepts) {
                // NOTE: Se mandan los datos en 'crudo' (sin albur), el proceso de generación de factura les da formato.
                let amountWithoutTaxes: number = parseFloat((_concept.quantity * _concept.unitCost).toFixed(2));
                concepts.push({
                    description: _concept.concept,
                    cveProductService: _concept.productCode,    // '84111506',
                    unitCve: _concept.unitCode,                 // 'ACT',
                    unitValue: _concept.unitCost,               // amount,
                    quantity: _concept.quantity,
                    discount: 0,
                    amount: parseFloat(((_concept.quantity * _concept.unitCost) * 1.16).toFixed(2)),
                    idNumber: account.accountNumber || '',
                    taxes: [{
                        base: amountWithoutTaxes, // amount,
                        tasa: 0.160000,
                        amount: parseFloat((amountWithoutTaxes * 0.16).toFixed(2)),
                        tax: '002',
                        factorType: 'Tasa'
                    }]
                });
            }
            // Serie y Folio.
            let serie: string = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Serie']) || 'I').toString();
            let folio: string = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Folio']) || '0').toString();
            // Factura.
            // FIX:
            // Moneda y tipo de cambio.
            let currency: string = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Moneda']) || 'MXN').toString();
            let exchangeRate: number = parseInt((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['TipoCambio']) || '1').toString());
            if(currency === 'XXX') {
                currency = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['pago10:Pagos']['pago10:Pago']['_attributes']['MonedaP']) || 'MXN').toString();
                exchangeRate = parseInt((idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['pago10:Pagos']['pago10:Pago']['_attributes']['TipoCambioP']) || '1').toString());
            }
            invoice = {
                serie: 'E',
                paymentForm,
                currency, // : 'MXN',                                    // TODO: Revisar que venga del pago o factura.
                exchangeRate, // : 1,                                    // TODO: Revisar que venga del pago o factura.
                compType: 'E',
                paymentMethod, // : 'PUE',
                receptorRFC: (idx(client, _ => _.businessData.rfc) || '').toString(),
                receptorName: (idx(client, _ => _.businessData.businessName) || '').toString(),
                cfdiUse: cfdiUse, // (idx(client, _ => _.businessData.cfdiUse) || '').toString(),
                concepts,
                account,
                client
            };
            // CFDIs relacionados.
            let uuid: string = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['UUID']) || '').toString();
            let relatedCFDIs: Array<RelatedCFDI> = [];
            relatedCFDIs.push({
                uuid,
                relationshipType
            })
            invoice.relatedCfdis = relatedCFDIs;
            
            //TTTTT IIIII M   M BBBB  RRRR   AAA  DDDD   OOO
            //  T     I   MM MM B   B R   R A   A D   D O   O
            //  T     I   M M M BBBB  RRRR  AAAAA D   D O   O
            //  T     I   M   M B   B R   R A   A D   D O   O
            //  T   IIIII M   M BBBB  R   R A   A DDDD   OOO

            let stamping: any = {};
            let attachments: Array<FileStructure> = [];
            try {
                // @ts-ignore
                invoice.returnFiles = true;
                stamping = await this.postInvoice(invoice);
                // Se revisan los archivos recibidos y se agregan al arreglo de archivos adjuntos.
                // XML.
                let xmlFile: string = (idx(stamping, _ => _.files.xml) || '').toString();
                if(typeof xmlFile === 'string' && xmlFile.length > 0) {
                    attachments.push({
                        type: 'text/xml',
                        name: 'Factura.xml',
                        content: xmlFile
                    });
                }
                // PDF.
                let pdfFile: string = (idx(stamping, _ => _.files.pdf) || '').toString();
                if(typeof pdfFile === 'string' && pdfFile.length > 0) {
                    attachments.push({
                        type: 'application/pdf',
                        name: 'Factura.pdf',
                        content: pdfFile
                    });
                }
            } catch(error) {
                return reject(error);
            }

            //PPPP   AAA   GGGG  OOO
            //P   P A   A G     O   O
            //PPPP  AAAAA G  GG O   O
            //P     A   A G   G O   O
            //P     A   A  GGGG  OOO
            
            let newPayment: Payment = new Payment();
            try {
                let paymentV1 = new PaymentV1();
                paymentV1 = {
                    parentId: account.accountNumber,
                    parentType: 'account',
                    paymentDate: date2StringFormat(new Date()),
                    applicationDate: date2StringFormat(new Date()),
                    amountPaid: totalAmount,
                    typeValue: '01',
                    statusValue: 'credit',
                    // Nota de crédito relacionada al folio XXXXXX
                    // TODO: Cambiar la descripción de alguna manera para hacerla única.
                    description: `Nota de crédito relacionada al folio ${serie}${folio}.`,
                    currencyValue: currency, // 'MXN',
                    exchangeRate, // : 1,
                    // internalAccountNumber
                    // comission
                    // cardDetails
                    invoices: [stamping._id],
                    reference: account.accountNumber,
                    // details
                    paymentForm
                }
                if(details.length > 0) paymentV1.details = details;
                newPayment = await paymentModel.postPayment(paymentV1);
            } catch(error) {
                return reject(error);
            }

            //EEEEE M   M  AAA  IIIII L
            //E     MM MM A   A   I   L
            //EEE   M M M AAAAA   I   L
            //E     M   M A   A   I   L
            //EEEEE M   M A   A IIIII LLLLL
            
            let accountProcessesModel: AccountProcessesModel = new AccountProcessesModel();
            let mailingErrors: Array<any> = [];
            if(attachments.length > 0) {
                let data: any = {
                    accountNumber: account.accountNumber,
                    attachments,
                    template: 'client_notification',
                    content: [
                        {
                            name: 'message',
                            content: 'Por medio del presente correo le hacemos llegar su estado de cuenta del mes.'
                        }
                    ],
                    subject: `Domain Estado de cuenta ${account.accountNumber}.`
                };
                try {
                    await accountProcessesModel.sendEmail(data);
                } catch(error) {
                    mailingErrors.push(error);
                }
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            let result: any = Object.assign({}, newPayment);
            result.errors = {};
            result.errors.mailingErrors = mailingErrors;
            return resolve({
                status: 200,
                data: result
            });
        });
    }

    public postInvoiceCancellation(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
            //F     A   A C       T   U   U R   R A   A
            //FFF   AAAAA C       T   U   U RRRR  AAAAA
            //F     A   A C       T   U   U R   R A   A
            //F     A   A  CCCC   T    UUU  R   R A   A

            let { _id, id, ...rest } = body;
            _id = _id ? _id : id;
            let invoice: InvoiceV1 = new InvoiceV1();
            let invoiceModel = new InvoiceModel();
            // Se busca información de la factura.
            try {
                // @ts-ignore
                invoice = await invoiceModel.getInvoice({ _id });
            } catch(error) {
                return reject(error);
            }
            // Se debe obtener la siguiente información.
            // RFC del emisor.
            let issuerRFC: string = '';
            // UUID.
            let uuid: string = '';
            try {
                uuid = invoice.uuid;
                let invoiceJSON: any = JSON.parse(invoice.json);
                if(typeof uuid != 'string' || uuid.length === 0) uuid = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['UUID']) || '').toString();
                issuerRFC = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Emisor']['_attributes']['Rfc']) || '').toString();
            } catch(error) {
                return reject({
                    status: 404,
                    message: 'Facturas v2 | Ocurrió un error al interpretar la información sobre la factura.',
                    error
                });
            }

            //EEEEE  SSSS TTTTT  AAA  TTTTT U   U  SSSS
            //E     S       T   A   A   T   U   U S
            //EEE    SSS    T   AAAAA   T   U   U  SSS
            //E         S   T   A   A   T   U   U     S
            //EEEEE SSSS    T   A   A   T    UUU  SSSS
            
            let invoiceStatus: any = {};
            try {
                /*
                {
                    "statusCode": "S - Comprobante obtenido satisfactoriamente.",
                    "isItCancelable": "Cancelable sin aceptación",
                    "status": "Vigente",
                    "cancellationStatus": "(no disponible)"
                }
                */
                invoiceStatus = await this.getInvoiceStatus({ _id });
            } catch(error) {
                return reject(error);
            }
            if(invoiceStatus.hasOwnProperty('status') && invoiceStatus.hasOwnProperty('isItCancelable')) {
                let status: string = invoiceStatus.status;
                let isItCancelable: string = invoiceStatus.isItCancelable;
                if(isItCancelable.toLowerCase() === 'no cancelable') {
                    return reject({
                        status: 400,
                        message: 'Facturas v2 | La factura no es cancelable, revisa si la factura no cuenta con CFDIs relacionados.'
                    });
                }
                if(status.toLowerCase() === 'cancelado') {
                    let cancellationStatus: string = invoiceStatus.cancellationStatus || 'No disponible';
                    return reject({
                        status: 400,
                        message: `Facturas v2 | La factura ya está cancelada. Estatus: ${cancellationStatus}.`
                    });
                }
            } else {
                return reject({
                    status: 400,
                    message: 'Facturas v2 | No se puede leer la información sobre el estatus de la factura ante el SAT.'
                });
            }
            
            // CCCC FFFFF DDDD  IIIII  SSSS      RRRR  EEEEE L      AAA   CCCC IIIII  OOO  N   N  AAA  DDDD   OOO   SSSS
            //C     F     D   D   I   S          R   R E     L     A   A C       I   O   O NN  N A   A D   D O   O S
            //C     FFF   D   D   I    SSS       RRRR  EEE   L     AAAAA C       I   O   O N N N AAAAA D   D O   O  SSS
            //C     F     D   D   I       S      R   R E     L     A   A C       I   O   O N  NN A   A D   D O   O     S
            // CCCC F     DDDD  IIIII SSSS       R   R EEEEE LLLLL A   A  CCCC IIIII  OOO  N   N A   A DDDD   OOO  SSSS

            let relatedCFDIs: any = {};
            try {
                relatedCFDIs = await invoiceModel.getInvoices({ affectedCFDIs: uuid });
                if(Array.isArray(relatedCFDIs.results) && relatedCFDIs.results.length > 0) {
                    return reject({
                        status: 400,
                        message: 'Facturas v2 | La factura no es cancelable ya que cuenta con CFDIs relacionados.'
                    });
                }
            } catch(error) {
                return reject(error);
            }

            // CCCC  AAA  N   N  CCCC EEEEE L      AAA   CCCC IIIII  OOO  N   N
            //C     A   A NN  N C     E     L     A   A C       I   O   O NN  N
            //C     AAAAA N N N C     EEE   L     AAAAA C       I   O   O N N N
            //C     A   A N  NN C     E     L     A   A C       I   O   O N  NN
            // CCCC A   A N   N  CCCC EEEEE LLLLL A   A  CCCC IIIII  OOO  N   N
            
            let url: string = configuration.services.sat.cfdi.postCancellation;
            url = url.replace('{RFC}', issuerRFC);
            url = url.replace('{UUID}', uuid);
            // console.log(url);
            axios.post(url, {}, {
                headers: {
                    'Authorization': `bearer ${configuration.services.sat.cfdi.keys.infiniteToken}`
                }
            })
            .then( async (response: AxiosResponse<any>) => {
                let message: string = 'UUID Cancelado exitosamente.';
                let comments: string = 'Se considera una solicitud de cancelación exitosa, sin embargo esto no asegura su cancelación.';
                switch(response.status) {
                    case 201:
                        message = 'UUID Cancelado exitosamente.';
                        comments = 'Se considera una solicitud de cancelación exitosa, sin embargo esto no asegura su cancelación.';
                        break;
                    case 202:
                        message = 'UUID Previamente cancelado.';
                        comments = 'Se considera previamente cancelado. Estatus "Cancelado" ante el SAT.';
                        break;
                    case 203:
                        message = 'UUID No corresponde el RFC del emisor y de quien solicita la cancelación.';
                        comments = '';
                        break;
                    case 205:
                        message = 'No Existe.';
                        comments = 'El SAT da una prorroga de 72 hrs para que el comprobante aparezca con estatus Vigente posterior al envió por parte del Proveedor de Certificación de CFDI. Puede que algunos comprobantes no aparezcan al momento, es necesario esperar por lo menos 72 hrs.';
                        break;
                }

                //EEEEE  SSSS TTTTT  AAA  TTTTT U   U  SSSS
                //E     S       T   A   A   T   U   U S
                //EEE    SSS    T   AAAAA   T   U   U  SSS
                //E         S   T   A   A   T   U   U     S
                //EEEEE SSSS    T   A   A   T    UUU  SSSS

                let newStatus: any = {};
                let updatedInvoice: any = {};
                let cancellationErrors: Array<any> = [];
                try {
                    newStatus = await this.getInvoiceStatus({ _id });
                    let statusValue: string = 'active';
                    if(newStatus.hasOwnProperty('status') && newStatus.status.toLowerCase() === 'cancelado') {
                        statusValue = 'cancelled';
                    } else if(newStatus.hasOwnProperty('cancellationStatus') && newStatus.cancellationStatus.toLowerCase() === 'en proceso') {
                        statusValue = 'c_process';
                    }
                    let cancelledDate: string = date2StringFormat(new Date());

                    //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
                    //F     A   A C       T   U   U R   R A   A
                    //FFF   AAAAA C       T   U   U RRRR  AAAAA
                    //F     A   A C       T   U   U R   R A   A
                    //F     A   A  CCCC   T    UUU  R   R A   A

                    let data = {
                        _id,
                        statusValue,
                        cancelledDate,
                        affectedCFDIs: []
                    };
                    try {
                        updatedInvoice = await invoiceModel.putInvoice(data);
                    } catch(error) {
                        cancellationErrors.push(error);
                    }
                } catch(error) {
                    cancellationErrors.push(error);
                }

                // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
                //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
                //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
                //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
                //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

                let updatedPayment: Payment = new Payment();
                let updatedReceipt: Receipt = new Receipt();
                try {
                    let removeInvoice: any = await this.putRemoveInvoiceFromExistance({ _id });
                    updatedPayment = removeInvoice.payment;
                    updatedReceipt = removeInvoice.receipt;
                } catch(error) {
                    cancellationErrors.push(error);
                }

                //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                //R   R E     S     U   U L       T   A   A D   D O   O
                //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                //R   R E         S U   U L       T   A   A D   D O   O
                //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

                return resolve({
                    status: response.status,
                    message,
                    comments,
                    invoice: updatedInvoice,
                    payment: updatedPayment,
                    receipt: updatedReceipt,
                    errors: cancellationErrors
                });
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Facturas v2 | Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Facturas v2 | Ocurrió un error al intentar cancelar la factura.',
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

    public putRemoveInvoiceFromExistance(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
            //F     A   A C       T   U   U R   R A   A
            //FFF   AAAAA C       T   U   U RRRR  AAAAA
            //F     A   A C       T   U   U R   R A   A
            //F     A   A  CCCC   T    UUU  R   R A   A

            let { _id, id, ...rest } = body;
            _id = _id ? _id : id;
            let invoice: InvoiceV1 = new InvoiceV1();
            let invoiceModel = new InvoiceModel();
            // Se busca información de la factura.
            try {
                invoice = await invoiceModel.getInvoice({ _id });
            } catch(error) {
                return reject(error);
            }
            if(invoice.statusValue != 'cancelled') {
                return reject({
                    status: 400,
                    model: 'Facturas v2',
                    message: 'El estatus de la factura es diferente de CANCELADA.'
                })
            }
            
            //PPPP   AAA   GGGG  OOO       /  RRRR  EEEEE  CCCC IIIII BBBB   OOO
            //P   P A   A G     O   O     /   R   R E     C       I   B   B O   O
            //PPPP  AAAAA G  GG O   O    /    RRRR  EEE   C       I   BBBB  O   O
            //P     A   A G   G O   O   /     R   R E     C       I   B   B O   O
            //P     A   A  GGGG  OOO   /      R   R EEEEE  CCCC IIIII BBBB   OOO

            let payment: PaymentV1 = new PaymentV1();
            let receipt: Receipt = new Receipt();
            let isFromPayment: boolean = false;
            let isFromReceipt: boolean = false;
            let paymentModel: PaymentModel = new PaymentModel();
            let receiptModel: ReceiptModel = new ReceiptModel();
            let errors: Array<any> = [];
            try {
                payment = await paymentModel.getPayment({ invoices: _id });
                isFromPayment = true;
            } catch(error) {
                errors.push({
                    status: 404,
                    message: 'La factura no pertenece a ningún pago.'
                });
                try {
                    receipt = await receiptModel.getReceipt({ invoice: _id });
                    isFromReceipt = true;
                } catch(error) {
                    errors.push({
                        status: 404,
                        message: 'La factura no pertenece a ningún recibo.'
                    });
                }
            }

            // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
            //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
            //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
            //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
            //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

            let updatedPayments: Array<PaymentV1> = [];
            let updatedReceipt: Receipt = new Receipt();
            if(isFromPayment) {
                
                // Actualizar el pago relacionado a la factura:
                //     a) Cambiar estatus a "unassigned".
                //     b) Eliminar el _id de la factura del arreglo de "invoices".

                // Arreglo de facturas desde el pago (son objetos).
                let invoices: Array<any> = payment.invoices || [];
                let details: Array<{ receiptId: string, amount: number }> = payment.details || [];
                // Arreglo sólo para los identificadores de las facturas.
                let _invoices: string[] = [];
                // Se obtienen sólo los identificadores de los objetos tipo 'invoice'.
                for (const invoice of invoices)  {
                    _invoices.push(invoice._id);
                }
                // Se elimina el identificador de la factura actual.
                if (_invoices.length > 0) {
                    let _index: number =_invoices.indexOf(_id);
                    _invoices.splice(_index, 1);
                }
                // Se crea la información a actualizar.
                let data: any = {
                    _id: payment._id,
                    statusValue: 'unassigned',
                    invoices: _invoices
                }
                // Se revisa si el pago era de una nota de crédito.
                if(payment.statusValue === 'credit' && _invoices.length === 0) {
                    data.statusValue = 'cancelled';
                }
                // Se actualiza la información del pago.
                try {
                    let updatedPayment: PaymentV1 = await paymentModel.putPayment(data);
                    updatedPayments.push(updatedPayment);
                } catch(error) {
                    errors.push(error);
                }
            } else if(isFromReceipt) {

                // Actualizar el recibo relacionado a la factura:
                //     a) Cambiar estatus a "cancelled".
                //     b) Eliminar el _id de la factura de "invoice".
                //     c) Eliminar el recibo del arreglo de "details" del(los) pago(s) correspondiente(s).

                let data: any = {
                    _id: receipt._id,
                    statusValue: 'cancelled',
                    // invoice: ''
                };
                try {
                    updatedReceipt = await receiptModel.putReceipt(data);
                } catch(error) {
                    errors.push(error);
                }
                let getPayments: { results: Array<PaymentV1>, summary: any } = { results: [], summary: {} };
                try {
                    getPayments = await paymentModel.getPayments({ 'details.receiptId': receipt._id });
                    if(getPayments.results.length > 0) {
                        for(const involvedPayment of getPayments.results) {
                            let details = involvedPayment.details;
                            if(Array.isArray(details)) details = details.filter((element: any) => {
                                return element.receiptId != receipt._id;
                            });
                            try {
                                let updatedPayment: PaymentV1 = await paymentModel.putPayment({ _id: involvedPayment._id, details, statusValue: 'unassigned' });
                                updatedPayments.push(updatedPayment);
                            } catch(error) {
                                errors.push(error);
                            }
                        }
                    }
                } catch(error) {
                    errors.push(error);
                }
            } else {
                return reject({
                    status: 404,
                    module: 'Facturas v2',
                    message: 'La factura no se encontró relacionada a ningún pago o recibo.'
                });
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

            return resolve({
                _id,
                invoice,
                payment: updatedPayments,
                receipt: updatedReceipt,
                errors
            });
        });
    }

    //PPPP  RRRR   OOO  V   V EEEEE EEEEE DDDD   OOO  RRRR
    //P   P R   R O   O V   V E     E     D   D O   O R   R
    //PPPP  RRRR  O   O V   V EEE   EEE   D   D O   O RRRR
    //P     R   R O   O  V V  E     E     D   D O   O R   R
    //P     R   R  OOO    V   EEEEE EEEEE DDDD   OOO  R   R

    // IMPORTANT:
    // - Servicios disponibles con el proveedor:
    // https://developers.sw.com.mx/article-categories/servicios/
    // - Timbrado con JSON:
    // https://developers.sw.com.mx/knowledge-base/emision-timbrado-json-cfdi-3-3/
    private postIssueJSONWithProvider(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let {...invoice}: Invoice = body;
            // console.log('==================== FACTURA ====================\n');
            // console.log(invoice);

            // 1. Transformar JSON.
            // a) Conceptos.
            // WARNING: Se crean diferente para "P" o "I".
            let concepts: Array<IConcept> | Array<IConceptP> = [];
            if(invoice.compType === 'P') {
                if(Array.isArray(invoice.concepts) && invoice.concepts.length > 0) {
                    for(const concept of invoice.concepts) {
                        concepts.push({
                            ClaveProdServ: concept.cveProductService,
                            Cantidad: concept.quantity,
                            ClaveUnidad: concept.unitCve || '',
                            Descripcion: concept.description,
                            ValorUnitario: concept.unitValue.toFixed(2),
                            Importe: (concept.amount || 0).toFixed(2)
                        });
                    }
                }
            } else {
                if(Array.isArray(invoice.concepts) && invoice.concepts.length > 0) {
                    for(const concept of invoice.concepts) {
                        // Impuestos por concepto.
                        let conceptTaxes: Array<ITransferedTaxes> = [];
                        if(Array.isArray(concept.taxes) && concept.taxes.length) {
                            for(const tax of concept.taxes) {
                                // console.log(tax);
                                conceptTaxes.push({
                                    Base: tax.base.toFixed(2),
                                    Impuesto: tax.tax,
                                    TipoFactor: tax.factorType,
                                    TasaOCuota: '0.160000', // tax.tasa.toString(),
                                    Importe: tax.amount.toFixed(2)
                                });
                            }
                        }
                        // Concepto.
                        let newConcept: IConcept = {
                            /*
                            Impuestos: {
                                Traslados: conceptTaxes,
                                // Retenciones: {}
                            },
                            */
                            // InformacionAduanera: '',
                            // CuentaPredial: '',
                            // ComplementoConcepto: '',
                            // Parte: '',
                            ClaveProdServ: concept.cveProductService,
                            NoIdentificacion: concept.idNumber || '',
                            Cantidad: concept.quantity,
                            ClaveUnidad: concept.unitCve || '',
                            // Unidad: '',
                            Descripcion: concept.description,
                            ValorUnitario: concept.unitValue.toFixed(2),
                            Importe: (concept.amount || 0).toFixed(2)
                        }
                        // SUPER PODEROSA NINJA TURBO NEO ULTRA HYPER MEGA MULTI ALPHA META EXTRA UBER PREFIJO NOTA:
                        // Se debe revisar si el total y el descuento son la misma cantidad, de esa forma NO se agregan los impuestos.
                        // console.log('[2]Descuento: ', concept.discount);
                        // console.log('[2]Total: ', concept.amount);
                        // console.log('[2]¿Es mayor? R =', (concept.amount > concept.discount));
                        if(concept.amount > concept.discount) {
                            // console.log('[2]Si se agregan impuestos.');
                            newConcept.Impuestos = {
                                Traslados: conceptTaxes,
                                // Retenciones: {}
                            }
                        }
                        // NOTE: Al parecer el decuento si se debe definir aquí también ʕ╯•ᴥ•ʔ╯︵ ┻━┻
                        if(typeof concept.discount === 'number' && concept.discount > 0) newConcept.Descuento = concept.discount.toString();
                        concepts.push(newConcept);
                    }
                }
            }
            // b) Impuestos.
            let taxes: Array<ITransferedTaxes> = [];
            if(Array.isArray(invoice.taxDetails) && invoice.taxDetails.length > 0) {
                for(const tax of invoice.taxDetails) {
                    taxes.push({
                        // Base: '',
                        Impuesto: tax.tax,
                        TipoFactor: tax.factorType,
                        TasaOCuota: '0.160000', // tax.tasa.toString(),
                        Importe: tax.amount.toFixed(2)
                    });
                }
            }
            // c) Factura completa.
            let json: IJSON2Issue = {
                // Complemento: '',
                // Addenda: '',
                Version: '3.3',
                Serie: invoice.serie,
                Folio: (invoice.folio || 0).toString(),
                Fecha: invoice.createdDate || date2StringFormat(new Date()),
                Descuento: (invoice.discount || 0).toFixed(2),
                Sello: '',
                FormaPago: invoice.paymentForm,
                NoCertificado: '',
                Certificado: '',
                // CondicionesDePago: '',
                SubTotal: (invoice.subTotal || 0).toFixed(2),
                Moneda: invoice.currency,
                TipoCambio: (invoice.exchangeRate || 1).toString(),
                Total: (invoice.total || 0).toFixed(2),
                TipoDeComprobante: invoice.compType,
                MetodoPago: invoice.paymentMethod,
                HasComplemento: false,
                LugarExpedicion: invoice.expeditionPlace || '0',
                // NOTE: Sólo si existen.
                // CfdiRelacionados: '',
                Emisor: {
                    Rfc: invoice.issuerRFC || '',
                    Nombre: invoice.issuerName || '',
                    RegimenFiscal: invoice.issuerTaxRegime || ''
                },
                Receptor: {
                    Rfc: invoice.receptorRFC,
                    Nombre: invoice.receptorName,
                    // NumRegIdTrib: '',
                    UsoCFDI: invoice.cfdiUse,
                },
                Conceptos: concepts,
                Impuestos: {
                    // Retenciones: '',
                    Traslados: taxes,
                    TotalImpuestosTrasladados: (invoice.totalTaxAmount || 0).toString(),
                }
            };
            if(json.Descuento === '0.00') delete json.Descuento;
            // console.log('==================== JSON ====================\n');
            // console.log(json);
            // d) Se revisa el tipo de comprobante.
            if(invoice.compType === 'P') {
                try {
                    delete json.Descuento;
                    delete json.FormaPago;
                    delete json.Impuestos;
                    delete json.TipoCambio;
                    delete json.MetodoPago;
                    json.SubTotal = '0';
                    json.Moneda = 'XXX';
                    json.Total = '0';
                    json.HasComplemento = true;
                    // DELETE: No hay razón aún del por qué lo estaba cambiando.
                    json.Receptor.UsoCFDI = 'P01';
                } catch(error) {}
                // Complemento de pago.
                let complement: Array<IComplement> = [];
                if(!isEmpty(invoice.paymentComplement)) {
                    // i) Documentos relacionados.
                    let relatedDocuments: Array<IRelatedDocuments> = [];
                    if(invoice.paymentComplement && Array.isArray(invoice.paymentComplement.payments) && invoice.paymentComplement.payments.length) {
                        for(const payment of invoice.paymentComplement.payments) {
                            let relatedDocument: IRelatedDocuments = {
                                IdDocumento: payment.relatedCfdi,
                                Serie: payment.serieNFolio.substring(0, 1),
                                Folio: payment.serieNFolio.substring(1, payment.serieNFolio.length),
                                MonedaDR: payment.currencyDR,
                                MetodoDePagoDR: payment.paymentMethodDR,
                                // TipoCambioDR: payment.exchangeRateDR.toString(),
                                NumParcialidad: payment.partiality.toString(),
                                ImpSaldoAnt: payment.lastBalance.toString(),
                                ImpPagado: payment.amount.toString(),
                                ImpSaldoInsoluto: payment.currentBalance.toString()
                            }
                            // NOTE: Según el SAT, el tipo de cambio del complemento sólo se agrega si la moneda del pago del complemento es diferente al de la factura en sí.
                            // NOTE: CORRECCIÓN A LA NOTA DE ARRIBA - Se debe agregar el tipo de cambio cuando la monda es diferente de 'MXN'.
                            // NOTE: Al parecer éste tipo de cambio NO se debe registrar... ¡QUE SE PINCHES DECIDAN! t(ò_ót)
                            // console.log('Moneda del pago: ', payment.currencyDR);
                            // console.log('Tipo de cambio en el pago: ', payment.exchangeRateDR)
                            // if(payment.currencyDR !== 'MXN'/*payment.currencyDR*/) {
                            //     relatedDocument.TipoCambioDR = (payment.exchangeRateDR || 1).toString()
                            // };
                            relatedDocuments.push(relatedDocument);
                        }
                    }
                    // ii) Pago.
                    let payment: Array<IPayment> = [];
                    if(invoice.paymentComplement) {
                        let newPayment: IPayment = {
                            // FechaPago: invoice.paymentComplement.paymentDate,
                            FechaPago: date2StringFormat(new Date(invoice.paymentComplement.paymentDate)),
                            FormaDePagoP: invoice.paymentComplement.paymentForm,
                            MonedaP: invoice.paymentComplement.currency,
                            Monto: invoice.paymentComplement.amount.toString(),
                            DoctoRelacionado: relatedDocuments,
                            // RfcEmisorCtaOrd: '',
                            // NomBancoOrdExt: '',
                            // RfcEmisorCtaBen: '',
                            // CtaBeneficiario: '',
                            // CtaOrdenante: ''
                        };
                        // Tipo de cambio.
                        // NOTE: Según el SAT, el tipo de cambio del complemento sólo se agrega si la moneda del pago del complemento es diferente al de la factura en sí.
                        // NOTE: CORRECCIÓN A LA NOTA DE ARRIBA - Se debe agregar el tipo de cambio cuando la monda es diferente de 'MXN'.
                        // console.log('Moneda del complemento: ', invoice.paymentComplement.currency);
                        // console.log('Tipo de cambio en el complemento: ', invoice.paymentComplement.exchangeRate);
                        // console.log('Factura: ', invoice);
                        if(invoice.paymentComplement.currency !== 'MXN'/*payment.currencyDR*/) {
                            newPayment.TipoCambioP = (invoice.paymentComplement.exchangeRate || 1).toString()
                        };
                        // Se agrega el pago al arreglo.
                        payment.push(newPayment);
                        if(typeof invoice.paymentComplement.ordAccount === 'string' && invoice.paymentComplement.ordAccount.length > 0) {
                            payment[0].CtaOrdenante = invoice.paymentComplement.ordAccount;
                            payment[0].RfcEmisorCtaOrd = invoice.paymentComplement.issuerRfcOrdAccount;
                        }
                    }
                    // iii) Complemento.
                    try {
                        complement.push({
                            HasElements: true,
                            Any: [{
                                "Pago10:Pagos": {
                                    Pago: payment
                                }
                            }]
                        });
                    } catch(error) {}
                    json.Complemento = complement;
                }
            }
            // e) CFDIs relacionados.
            /*
                "CfdiRelacionados": {
                    "TipoRelacion":"01",
                    "CfdiRelacionado": [
                        {
                            "UUID":"bac98b90-3bcb-451f-bf1f-2c7b259ec74c"
                        }
                    ]
                }
            */
            let relatedCFDIs: Array<{ UUID: string }> = [];
            // FIX: Se debe modificar el modelo de CFDIs relacionados para empatar con el modelo de arriba ↑ .
            let relationshipType: string = '';
            if(Array.isArray(invoice.relatedCfdis) && invoice.relatedCfdis.length > 0) {
                for(const relatedCfdi of invoice.relatedCfdis) {
                    relationshipType = relatedCfdi.relationshipType;
                    relatedCFDIs.push({
                        // TipoRelacion: relatedCfdi.relationshipType,
                        UUID: relatedCfdi.uuid
                    });
                }
                try {
                    json.CfdiRelacionados = {
                        TipoRelacion: relationshipType,
                        CfdiRelacionado: relatedCFDIs
                    };
                } catch(error) {}
            }

            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T

            // 2. Petición REST.
            // console.log('==================== JSON ====================\n');
            // console.log(JSON.stringify(json));
            axios.post(configuration.services.sat.cfdi.postIssueJSON, json, {
                headers: {
                    'Authorization': `bearer ${configuration.services.sat.cfdi.keys.infiniteToken}`,
                    'Content-Type': 'application/jsontoxml',
                    // 'Cache-Control': 'no-cache'
                }
            })
            .then((response: AxiosResponse<any>) => {
                /*
                Ejemplo de la respuesta desde el proveedor:
                {
                    "data": {
                        "cadenaOriginalSAT": "||1.1|8d844a26-f4ee-4b45-bf77-ad0b3cf16ee3|2018-08-29T13:38:15|AAA010101AAA|aIwMYuU8vO9x5M1IDjbK1Tjv5Wlwj30C8Oom6Nbx1NFK6H1KUUD7p57NNVrbr7xJWL5PHm97VpUfouQfhSBHZb33OO5GBelcg7TVQ2Oedq/ZciD/LYtiBzkA+DRE+y57FzaM5ccUAqJsbuoPTjeF3eWeNcLIgseBTXN3o/k+ccQQltyNABiJpFAuIhj3IM9vV5pnAtuBu/wapTbODmrTLiQcGK9abZ+GI5/NYpEUs+xT/2xHq6GiminB/OOFCLYv6J+DCrZp0JOfEWLqfo0mZVYg3tfrezYSB84PkwWSDw4l5Gpv+CuXl+AMQMIojf+688kO85ytqq65i5CewsARtw==|20001000000300022323||",
                        "noCertificadoSAT": "20001000000300022323",
                        "noCertificadoCFDI": "20001000000300022815",
                        "uuid": "8d844a26-f4ee-4b45-bf77-ad0b3cf16ee3",
                        "selloSAT": "BPRJOOv0DrLyxIApE/NvJpg0yG75VNtCgWfQevpXrHL8XmWedv6ST0vMoMuXLbcAmcOei5e4aoHHqiwuC2lBiFXmvJhaIqCfBNzAZdgvt2LOwBekZXWySarcN/MfIl8Ti4FdyFIM5kmSfaATq3T5eAw2PbTpg9mx+OIL0nLjCIbBT4ck+AweGZMu9p0W+6HjKfYvcnbkUnOkgHrpMhZLfB05vBr4+z7ihrQx0xKCO6amzBVzgvQqUPvHvd2mem6iCGehHpryj87aH3y1+CATiYNJhX3zPS017+18oVQ05SIPyvZFkpEJ0/Yjut/TVys9nHP2SvK+HOMgplexaWClXg==",
                        "selloCFDI": "aIwMYuU8vO9x5M1IDjbK1Tjv5Wlwj30C8Oom6Nbx1NFK6H1KUUD7p57NNVrbr7xJWL5PHm97VpUfouQfhSBHZb33OO5GBelcg7TVQ2Oedq/ZciD/LYtiBzkA+DRE+y57FzaM5ccUAqJsbuoPTjeF3eWeNcLIgseBTXN3o/k+ccQQltyNABiJpFAuIhj3IM9vV5pnAtuBu/wapTbODmrTLiQcGK9abZ+GI5/NYpEUs+xT/2xHq6GiminB/OOFCLYv6J+DCrZp0JOfEWLqfo0mZVYg3tfrezYSB84PkwWSDw4l5Gpv+CuXl+AMQMIojf+688kO85ytqq65i5CewsARtw==",
                        "fechaTimbrado": "2018-08-29T13:38:15",
                        "qrCode": "iVBORw0KGgoAAAANSUhEUgAAAIwAAACMCAYAAACuwEE+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAyQSURBVHhe7ZLRqiS7DkPn/396Lg0tEIuo7FTch+GSBXqQrHi7N/Xn7+Wywf1gLlvcD+ayxf1gLlvcD+ayxf1gLlvcD+ayxf1gLlvcD+ayxf1gLlvcD+ayxf1gLlvcD+ayxf1gLlvcD+ayxf1gLlvcD+ayxcgH8+fPn1dKrLodiSonVV6poupx3u3vaoKRLavjOkqsuh2JKidVXqmi6nHe7e9qgpEtuwdVfc7lmYvunPgbn1d5wt+sJFIuuvMuu/0nRrZM/wDO5ZmL7pz4G59XecLfrCRSLrrzLrv9J0a28CB5Sux60c3f9ugT6iUJevG2J5jLU4L+hJEt6UBK7HrRzd/26BPqJQl68bYnmMtTgv6EkS3pQEokz1wwTz7lidSnEtVc+K6dvuh6StCfMLIlHUiJ5JkL5smnPJH6VKKaC9+10xddTwn6E0a2pAMpkTxz0c2TT7nwzpPEavZRIvWYUwnO/Y1L0J8wsiUdSInkmYtunnzKhXeeJFazjxKpx5xKcO5vXIL+hJEtuwexn3zKu6T3KU/4m6eeYK/yQnmai2pOdvtPjGw5/QHJp7xLep/yhL956gn2Ki+Up7mo5mS3/8TIFh20K3H9O7+rCUa2rI7rSFz/zu9qgpkth1Q/iHN55oQ9SaSccO5vXAnOk6f+Rf6Jq6p/EOfyzAl7kkg54dzfuBKcJ0/9i4xcxR/oP/pJFalfeZFyol4lQU/8jYukXPhb7zFP+gUjW3mgH/2kitSvvEg5Ua+SoCf+xkVSLvyt95gn/YLfbD2k+sH+T/FeygXnkqAXqZdy4R3PBXPvei6Yn/beMLNlmOoHas5eygXnkqAXqZdy4R3PBXPvei6Yn/beMLIlHchcMPfuKhfeWSlRzQV7b33KBX0i9ZjLM/8FI9t5qB/vuWDu3VUuvLNSopoL9t76lAv6ROoxl2f+C0a2p4PpSZorT3OS+swpkXLCub9xicoL5RRhvusnGNmmw3ggPUlz5WlOUp85JVJOOPc3LlF5oZwizHf9BLPbvlSHJ89cMPfuSl1S33f5POUV3XdpzrzrqQlmtgAe2PXMBXPvrtQl9X2Xz1Ne0X2X5sy7nppgZEt1WJrTi24uX+WSSL7Kk0TlK9SnKqp+yt8wssWPXR2W5vSim8tXuSSSr/IkUfkK9amKqp/yN8xsAdXhSYS5dz0XaV7lxLs+p0/4W5eovEi9lJOUnzC77Uv1A5IIc+96LtK8yol3fU6f8LcuUXmReiknKT9hdtuX6UPTvipPIrtzSaS8gu+SSJpXfoLZbV+mD037qjyJ7M4lkfIKvksiaV75CUa2pUOZC+apR9SjRMoFc++ucpF8yoV3Vjnxrs/pSeozn2BkGw/zYz0XzFOPqEeJlAvm3l3lIvmUC++scuJdn9OT1Gc+wcg2Hvb2UL2jSJpXufDOKhfeWYmkXHAu380J5/7GNcnINh729lC9o0iaV7nwzioX3lmJpFxwLt/NCef+xjXJ6LZ0IHN55oJzqYI9f9vJxW5O1KvUZfV2pf+C0b+SDmcuz1xwLlWw5287udjNiXqVuqzervRf8JO/wh/gP8pzkXKxO0995ZUq2PO3LpLmzCslqvkEP9nOw+WZi5SL3XnqK69UwZ6/dZE0Z14pUc0nGNnuP8YPTj7lXXzH07s097c788oTzdmrcuEdF0m5qOY7jGzRQTws+ZR38R1P79Lc3+7MK080Z6/KhXdcJOWimu8ws+WLDuOBb/Muqa+cItVcpF7KK1Lfd/mcvsvbdytmtnzRYTzwbd4l9ZVTpJqL1Et5Rer7Lp/Td3n7bsXMlkA6VDmV6PYEe/52lZNuLn8qkXyVSyTlJ8xuA9UPoRLdnmDP365y0s3lTyWSr3KJpPyEkW08TJ5KVD3OkxKr7kci5Qn20ruUC83ZY04JelLN3zCyjYfJU4mqx3lSYtX9SKQ8wV56l3KhOXvMKUFPqvkbRrfpQB7KPClRzUXqVfmuBH3C365EVp03+gWjW9PBzJMS1VykXpXvStAn/O1KZNV5o1/wm62g+gGcy1cSXU8JeuJvVqo47UuJ1Ev5CTNbCqqDOZevJLqeEvTE36xUcdqXEqmX8hNmtnxJB+56UvXlmYsq57zyCfXYr7zo5pX/JaN/RYfzB+x6UvXlmYsq57zyCfXYr7zo5pX/JSN/Jf0AKlH1OJcSq65LpJxw/tZTYjX7SNATf+O9lJ8wsoUH+ZGuRNXjXEqsui6RcsL5W0+J1ewjQU/8jfdSfsLMli/pQOZJIvkkQS+863Pmb5VYdVcS3bwrQX/CzJYvfqwfyDxJJJ8k6IV3fc78rRKr7kqim3cl6E8Y2eJHPh2W5sy7PdJ9J9+VqHLiXZdYzVyEuXc9F9X8DSNbuoelOfNuj3TfyXclqpx41yVWMxdh7l3PRTV/w8gWHuRHPuVSl/SOXnjXRdKcXnjX51UuvLPKiXdXc9HtnTCylQf60U+51CW9oxfedZE0pxfe9XmVC++scuLd1Vx0eyeMbOWBfvQqT/gb7yXPXFR5mlfwfZJIvpKgF971Of0vGNmeDk95wt94L3nmosrTvILvk0TylQS98K7P6X/B6Hb/ES6R8i5831WXqv92rjzNRXdOkWp+wug2HiqJlHfh+666VP23c+VpLrpzilTzE2a3fXl7qP/IJ4lufiqRcpFywbl8Ell1XIlqvsPMFvD2QL2rJLr5qUTKRcoF5/JJZNVxJar5DjNbgP8IP5R5pUTq7eYk9VKeYF8SlRe7Pc7pJ5jd9sWP94OZV0qk3m5OUi/lCfYlUXmx2+OcfoKRbX6sH5hywTz1SOoppwR9RXpfqcvq7UdiNXMJepHyE0a26TAemHLBPPVI6imnBH1Fel+py+rtR2I1cwl6kfITRrZVh3Ge+qnXlVjNXAnO/c1KhLl3Vznx7tNcJE9NMrKtOozz1E+9rsRq5kpw7m9WIsy9u8qJd5/mInlqktFtq2NdCc5TP/WSEqvuR4JeePdpLrzreQX71fvT+Q4zW77osKQE56mfekmJVfcjQS+8+zQX3vW8gv3q/el8h5EtPEieEvTE33gveeaJ1GOefMqFd060S3pPP8HItnQoJeiJv/Fe8swTqcc8+ZQL75xol/SefoKRbekw5WkuOPc3TyLMUy/RfV/16CvSe+aCuXc9/wUj29Oh/iNWc8G5v3kSYZ56ie77qkdfkd4zF8y96/kvGNnOg6XEqvtRIvWYd0XSnF5UeZKo8i67/QlG/poOpxKr7keJ1GPeFUlzelHlSaLKu+z2Jxj5azxcnnki9ZOnCPNuTyivVFH1fNdKYjX7SNCTar7DyBYeJM88kfrJU4R5tyeUV6qoer5rJbGafSToSTXfYWSLDuJhzLtKVD3OJUFPUp8SyVe5RLrzLrv9DiPbdBgPZN5VoupxLgl6kvqUSL7KJdKdd9ntdxjdpgPfHtp9539j1WfuXc9JNRfsJc88wZ6/9VxUc1HN3zC6zX/Em0O77/xvrPrMves5qeaCveSZJ9jzt56Lai6q+Rtmt4F0cJUnJTj3NyuRVedJovJCOef0IvVONcHMlkA6tMqTEpz7m5XIqvMkUXmhnHN6kXqnmmBmyyGrH7eSoK9I76nEqvuRoCf+xnvdXEqkXspPmNlyCH9YkqCvSO+pxKr7kaAn/sZ73VxKpF7KTxjZwsO6SnDubzwXzL3rEqvZR6Lyopsnn3LhnVUu6H/JyF/RwbtKcO5vPBfMvesSq9lHovKimyefcuGdVS7of8nIX9k9mP3kU0686xKr2UeCnlR9eeYizbu5lKh6KX/DyJbdg9hPPuXEuy6xmn0k6EnVl2cu0rybS4mql/I3jGzhQfKUSD7lovJd0p63SnR7Cb7flaA/YWRLOpASyadcVL5L2vNWiW4vwfe7EvQnjGxJB1Ii+W5O2JMI865PEvTCuy6RfCVBn+j2Ooxs4UHylEi+mxP2JMK865MEvfCuSyRfSdAnur0OI1t4kDwlkk8izL3rEqvZSiLlIs2ZSyTlFdU+zlN+wsgWHuRHukTySYS5d11iNVtJpFykOXOJpLyi2sd5yk8Y2bJ7ULevXpLYzQXzygvlSV3SO3qR8sRuv8PItl/9EPWSxG4umFdeKE/qkt7Ri5QndvsdRrbpsF0JetKdp16apzzR7Qnf7e9S3oXvKj/JyFYduCtBT7rz1EvzlCe6PeG7/V3Ku/Bd5Sf5zdbL/y33g7lscT+Yyxb3g7lscT+Yyxb3g7lscT+Yyxb3g7lscT+Yyxb3g7lscT+Yyxb3g7lscT+Yyxb3g7lscT+Yyxb3g7lscT+YywZ///4PGU0t8ggSmSIAAAAASUVORK5CYII=",
                        "cfdi": "<?xml version=\"1.0\" encoding=\"utf-8\"?><cfdi:Comprobante xsi:schemaLocation=\"http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd\" Version=\"3.3\" Serie=\"RogueOne\" Folio=\"HNFK231\" Fecha=\"2018-08-27T08:44:56\" Sello=\"aIwMYuU8vO9x5M1IDjbK1Tjv5Wlwj30C8Oom6Nbx1NFK6H1KUUD7p57NNVrbr7xJWL5PHm97VpUfouQfhSBHZb33OO5GBelcg7TVQ2Oedq/ZciD/LYtiBzkA+DRE+y57FzaM5ccUAqJsbuoPTjeF3eWeNcLIgseBTXN3o/k+ccQQltyNABiJpFAuIhj3IM9vV5pnAtuBu/wapTbODmrTLiQcGK9abZ+GI5/NYpEUs+xT/2xHq6GiminB/OOFCLYv6J+DCrZp0JOfEWLqfo0mZVYg3tfrezYSB84PkwWSDw4l5Gpv+CuXl+AMQMIojf+688kO85ytqq65i5CewsARtw==\" FormaPago=\"01\" NoCertificado=\"20001000000300022815\" Certificado=\"MIIFxTCCA62gAwIBAgIUMjAwMDEwMDAwMDAzMDAwMjI4MTUwDQYJKoZIhvcNAQELBQAwggFmMSAwHgYDVQQDDBdBLkMuIDIgZGUgcHJ1ZWJhcyg0MDk2KTEvMC0GA1UECgwmU2VydmljaW8gZGUgQWRtaW5pc3RyYWNpw7NuIFRyaWJ1dGFyaWExODA2BgNVBAsML0FkbWluaXN0cmFjacOzbiBkZSBTZWd1cmlkYWQgZGUgbGEgSW5mb3JtYWNpw7NuMSkwJwYJKoZIhvcNAQkBFhphc2lzbmV0QHBydWViYXMuc2F0LmdvYi5teDEmMCQGA1UECQwdQXYuIEhpZGFsZ28gNzcsIENvbC4gR3VlcnJlcm8xDjAMBgNVBBEMBTA2MzAwMQswCQYDVQQGEwJNWDEZMBcGA1UECAwQRGlzdHJpdG8gRmVkZXJhbDESMBAGA1UEBwwJQ295b2Fjw6FuMRUwEwYDVQQtEwxTQVQ5NzA3MDFOTjMxITAfBgkqhkiG9w0BCQIMElJlc3BvbnNhYmxlOiBBQ0RNQTAeFw0xNjEwMjUyMTUyMTFaFw0yMDEwMjUyMTUyMTFaMIGxMRowGAYDVQQDExFDSU5ERU1FWCBTQSBERSBDVjEaMBgGA1UEKRMRQ0lOREVNRVggU0EgREUgQ1YxGjAYBgNVBAoTEUNJTkRFTUVYIFNBIERFIENWMSUwIwYDVQQtExxMQU43MDA4MTczUjUgLyBGVUFCNzcwMTE3QlhBMR4wHAYDVQQFExUgLyBGVUFCNzcwMTE3TURGUk5OMDkxFDASBgNVBAsUC1BydWViYV9DRkRJMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgvvCiCFDFVaYX7xdVRhp/38ULWto/LKDSZy1yrXKpaqFXqERJWF78YHKf3N5GBoXgzwFPuDX+5kvY5wtYNxx/Owu2shNZqFFh6EKsysQMeP5rz6kE1gFYenaPEUP9zj+h0bL3xR5aqoTsqGF24mKBLoiaK44pXBzGzgsxZishVJVM6XbzNJVonEUNbI25DhgWAd86f2aU3BmOH2K1RZx41dtTT56UsszJls4tPFODr/caWuZEuUvLp1M3nj7Dyu88mhD2f+1fA/g7kzcU/1tcpFXF/rIy93APvkU72jwvkrnprzs+SnG81+/F16ahuGsb2EZ88dKHwqxEkwzhMyTbQIDAQABox0wGzAMBgNVHRMBAf8EAjAAMAsGA1UdDwQEAwIGwDANBgkqhkiG9w0BAQsFAAOCAgEAJ/xkL8I+fpilZP+9aO8n93+20XxVomLJjeSL+Ng2ErL2GgatpLuN5JknFBkZAhxVIgMaTS23zzk1RLtRaYvH83lBH5E+M+kEjFGp14Fne1iV2Pm3vL4jeLmzHgY1Kf5HmeVrrp4PU7WQg16VpyHaJ/eonPNiEBUjcyQ1iFfkzJmnSJvDGtfQK2TiEolDJApYv0OWdm4is9Bsfi9j6lI9/T6MNZ+/LM2L/t72Vau4r7m94JDEzaO3A0wHAtQ97fjBfBiO5M8AEISAV7eZidIl3iaJJHkQbBYiiW2gikreUZKPUX0HmlnIqqQcBJhWKRu6Nqk6aZBTETLLpGrvF9OArV1JSsbdw/ZH+P88RAt5em5/gjwwtFlNHyiKG5w+UFpaZOK3gZP0su0sa6dlPeQ9EL4JlFkGqQCgSQ+NOsXqaOavgoP5VLykLwuGnwIUnuhBTVeDbzpgrg9LuF5dYp/zs+Y9ScJqe5VMAagLSYTShNtN8luV7LvxF9pgWwZdcM7lUwqJmUddCiZqdngg3vzTactMToG16gZA4CWnMgbU4E+r541+FNMpgAZNvs2CiW/eApfaaQojsZEAHDsDv4L5n3M1CC7fYjE/d61aSng1LaO6T1mh+dEfPvLzp7zyzz+UgWMhi5Cs4pcXx1eic5r7uxPoBwcCTt3YI1jKVVnV7/w=\" SubTotal=\"200.00\" Moneda=\"MXN\" TipoCambio=\"1\" Total=\"603.20\" TipoDeComprobante=\"I\" MetodoPago=\"PUE\" LugarExpedicion=\"06300\" xmlns:cfdi=\"http://www.sat.gob.mx/cfd/3\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"><cfdi:Emisor Rfc=\"LAN7008173R5\" Nombre=\"PruebaDelJSON\" RegimenFiscal=\"601\" /><cfdi:Receptor Rfc=\"AAA010101AAA\" Nombre=\"Compañía\" UsoCFDI=\"G03\" /><cfdi:Conceptos><cfdi:Concepto ClaveProdServ=\"50211503\" NoIdentificacion=\"UT421511\" Cantidad=\"1\" ClaveUnidad=\"H87\" Unidad=\"Pieza\" Descripcion=\"Cigarros\" ValorUnitario=\"200.00\" Importe=\"200.00\"><cfdi:Impuestos><cfdi:Traslados><cfdi:Traslado Base=\"200.00\" Impuesto=\"002\" TipoFactor=\"Tasa\" TasaOCuota=\"0.160000\" Importe=\"32.00\" /><cfdi:Traslado Base=\"232.00\" Impuesto=\"003\" TipoFactor=\"Tasa\" TasaOCuota=\"1.600000\" Importe=\"371.20\" /></cfdi:Traslados></cfdi:Impuestos></cfdi:Concepto></cfdi:Conceptos><cfdi:Impuestos TotalImpuestosTrasladados=\"403.20\"><cfdi:Traslados><cfdi:Traslado Impuesto=\"002\" TipoFactor=\"Tasa\" TasaOCuota=\"0.160000\" Importe=\"32.00\" /><cfdi:Traslado Impuesto=\"003\" TipoFactor=\"Tasa\" TasaOCuota=\"1.600000\" Importe=\"371.20\" /></cfdi:Traslados></cfdi:Impuestos><cfdi:Complemento><tfd:TimbreFiscalDigital xsi:schemaLocation=\"http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd\" Version=\"1.1\" UUID=\"8d844a26-f4ee-4b45-bf77-ad0b3cf16ee3\" FechaTimbrado=\"2018-08-29T13:38:15\" RfcProvCertif=\"AAA010101AAA\" SelloCFD=\"aIwMYuU8vO9x5M1IDjbK1Tjv5Wlwj30C8Oom6Nbx1NFK6H1KUUD7p57NNVrbr7xJWL5PHm97VpUfouQfhSBHZb33OO5GBelcg7TVQ2Oedq/ZciD/LYtiBzkA+DRE+y57FzaM5ccUAqJsbuoPTjeF3eWeNcLIgseBTXN3o/k+ccQQltyNABiJpFAuIhj3IM9vV5pnAtuBu/wapTbODmrTLiQcGK9abZ+GI5/NYpEUs+xT/2xHq6GiminB/OOFCLYv6J+DCrZp0JOfEWLqfo0mZVYg3tfrezYSB84PkwWSDw4l5Gpv+CuXl+AMQMIojf+688kO85ytqq65i5CewsARtw==\" NoCertificadoSAT=\"20001000000300022323\" SelloSAT=\"BPRJOOv0DrLyxIApE/NvJpg0yG75VNtCgWfQevpXrHL8XmWedv6ST0vMoMuXLbcAmcOei5e4aoHHqiwuC2lBiFXmvJhaIqCfBNzAZdgvt2LOwBekZXWySarcN/MfIl8Ti4FdyFIM5kmSfaATq3T5eAw2PbTpg9mx+OIL0nLjCIbBT4ck+AweGZMu9p0W+6HjKfYvcnbkUnOkgHrpMhZLfB05vBr4+z7ihrQx0xKCO6amzBVzgvQqUPvHvd2mem6iCGehHpryj87aH3y1+CATiYNJhX3zPS017+18oVQ05SIPyvZFkpEJ0/Yjut/TVys9nHP2SvK+HOMgplexaWClXg==\" xmlns:tfd=\"http://www.sat.gob.mx/TimbreFiscalDigital\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" /></cfdi:Complemento></cfdi:Comprobante>"
                    },
                    "status": "success"
                }
                */
                let invoiceInfo: any = idx(response, _ => _.data.data);
                return resolve({
                    status: 200,
                    data: {
                        cadenaOriginalSAT: invoiceInfo.cadenaOriginalSAT,
                        noCertificadoSAT: invoiceInfo.noCertificadoSAT,
                        noCertificadoCFDI: invoiceInfo.noCertificadoCFDI,
                        uuid: invoiceInfo.uuid,
                        selloSAT: invoiceInfo.selloSAT,
                        selloCFDI: invoiceInfo.selloCFDI,
                        fechaTimbrado: invoiceInfo.fechaTimbrado,
                        qrCode: invoiceInfo.qrCode,
                        cfdi: invoiceInfo.cfdi
                    }
                });
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                    return reject({
                        status: 400,
                        message: 'Facturas v2 | Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                    });
                } else {
                    return reject({
                        status: 400,
                        message: 'Facturas v2 | Ocurrió un error al intentar guardar la información del pago.',
                        error: idx(error, _ => _.response.data) || error
                    });
                }
            });
        });
    }

    //JJJJJ  OOO  BBBB   SSSS
    //  J   O   O B   B S
    //  J   O   O BBBB   SSS
    //J J   O   O B   B     S
    // J     OOO  BBBB  SSSS

    public auditInvoicesStatus(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // 1. Se obtienen todas las facturas que tengan un estatus de cancelación en proceso.
            let getInvoices: { results: Array<InvoiceV1>, summary: any } = { results: [], summary: {} };
            let invoicesModelV1: InvoiceModel = new InvoiceModel();
            try {
                getInvoices = await invoicesModelV1.getInvoices({ statusValue: 'c_process', all: true });
                // console.log(`Facturas a auditar: ${getInvoices.results.length}`);
            } catch(error) {
                return reject(error);
            }
            // 2. Si existen resultados, se debe revisar el estatus de cada uno para actualizarlo.
            let errors: Array<any> = [];
            let cancelled: number = 0;
            if(getInvoices.results.length > 0) {
                for(const invoice of getInvoices.results) {
                    try {
                        await this.getInvoiceStatus({ _id: invoice._id, update: true });
                        cancelled++;
                    } catch(error) {
                        errors.push(error);
                    }
                }
            }
            // 3. Se devuelve el resultado.
            // console.log(`Facturas canceladas: ${cancelled}. Errores: ${errors.length}.`);
            return resolve({
                status: errors.length > 0 ? 206 : 200,
                message: 'Proceso de revisión de estatos de facturas terminado.',
                errors
            });
        });
    }
}