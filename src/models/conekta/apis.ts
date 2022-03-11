// Módulos.
import conekta from 'conekta';
import JsBarcode from 'jsbarcode';
import { createCanvas, Canvas } from 'canvas';
// Modelos.
import InternalAccountModel, { InternalAccount } from '../catalogs/internalAccounts';
import PaymentModel, { Payment } from '../payments';
// Configuración.
import configuration from '../../configuration';
// Funciones.
import { date2StringFormat } from '../../scripts/dates';
import { To, Message, EmailWithTemplate, EmailModel } from '../notifications';

conekta.api_key = configuration.services.conekta.apiKey; // 'key_eYvWV7gSDkNYXsmr';
conekta.api_version = '2.0.0';
conekta.locale = 'es';

//IIIII N   N TTTTT EEEEE RRRR  FFFFF  AAA   CCCC EEEEE  SSSS
//  I   NN  N   T   E     R   R F     A   A C     E     S
//  I   N N N   T   EEE   RRRR  FFF   AAAAA C     EEE    SSS
//  I   N  NN   T   E     R   R F     A   A C     E         S
//IIIII N   N   T   EEEEE R   R F     A   A  CCCC EEEEE SSSS

export interface IRetailOrder {
    // Identificador único de la orden asignado al azar.
    id?: string;
    // Clase del objeto. En este caso, "order".
    object: string; // 'order'
    // Fecha de creación de la orden.
    created_at?: number; // (32-bit unix timestamp)
    // Fecha de la última actualización de la orden.
    updated_at?: number; // (32-bit unix timestamp)
    // Divisa con la cual se realizará el cobro. Utiliza el código de 3 letras del Estándar Internacional ISO 4217.
    // https://es.wikipedia.org/wiki/ISO_4217
    currency: string; // 'MXN'
    // Lista de los productos que se venden en la orden. Debe tener al menos un producto.
    line_items: Array<IProduct>;
    // Lista de los costos de envío. Si la tienda en línea ofrece productos digitales, este parámetro es opcional.
    shipping_lines?: Array<IShippingCost>;
    // Lista de los impuestos que se pagan.
    tax_lines?: Array<ITax>;
    // Lista de los descuentos que se aplican a la orden.
    discount_lines?: Array<IDiscont>;
    // true: Modo de producción. false: Modo de prueba
    livemode?: boolean;
    // Hash en donde el usuario puede enviar información adicional para la orden
    metadata?: any;
    // Detalles del envío, obligatorio en caso de mandar un shipping_line. Si no recibimos un shipping_contact en la orden, se utilizará el shipping_contact del customer por default.
    shipping_contact?: IShippingContact;
    // Cantidad que se calcula por el sistema a partir de `line_items`, `shipipng_lines`, `tax_lines` y `discount_lines`.
    amount?: number;
    // Cantidad a la cual se hizo un refund a través de la llamada a orders/:order_id/refund.
    amount_refunded?: number;
    // El status del pago de la orden. Este campo es controlado por el sistema y puede ser pending_payment, declined, expired, paid, refunded, partially_refunded, charged_back, pre_authorized y voided.
    payment_status?: 'pending_payment' | 'declined' | 'expired' | 'paid' | 'refunded' | 'partially_refunded' | 'charged_back' | 'pre_authorized' | 'voided';
    // Hash que contiene la información del cliente.
    customer_info: {
        // ID del cliente. Es obligatorio cuando no se envían los otros campos de `customer_info`.
        customer_id?: string;
        // Nombre del cliente. (opcional si se envía el `id`)
        name: string;
        // Teléfono del cliente. (opcional si se envía el `id`)
        phone: string;
        // Email del cliente. (opcional si se envía el `id`)
        email: string;
        // Booleano que indica si el usuario es corporativo o no, el default es `false`. (opcional)
        corporate?: boolean;
    }
    // Lista de los cargos que se generaron para cubrir el monto de la orden.
    charges?: Array<ICharge>;
}

export interface IProduct {
    // Identificador único para el producto.
    id?: string;
    // Nombre del producto.
    name: string;
    // Pequeña descripción del producto (< 250). (opcional)
    description?: string;
    // El precio por unidad expresado en centavos.
    unit_price: number;
    // Cantidad vendida del producto.
    quantity: number;
    // Indica el Storage Keeping Unit designado por la empresa (opcional)
    sku?: string;
    // Arreglo que contiene las categorías a las que pertenece el producto. Debe tener al menos un elemento. (opcional)
    tags?: Array<string>;
    // Marca del producto. (opcional)
    brand?: string;
    // Hash en donde el usuario puede enviar información adicional por cada producto. (opcional)
    metadata?: any;
}

interface IShippingCost {
    // Identificador único, asignado al azar.
    id?: string;
    // El precio del envío en centavos.
    amount: number;
    // Número de rastreo que el proveedor de envios proporciona. (opcional)
    tracking_number?: string;
    // Nombre del proveedor de envío.
    carrier: string;
    // Método de envío. (opcional)
    method?: string;
    // Hash en donde el usuario puede enviar información adicional por cada `shipping_line`. (opcional)
    metadata?: any;
}

interface ITax {
    // Identificador único para el cobro de impuesto.
    id?: string;
    // Código del impuesto.
    description: string;
    // La cantidad a cobrar por impuesto en centavos.
    amount: number;
    // Hash en donde el usuario puede enviar información adicional por cada tax_line (opcional).
    metadata?: any;
}

interface IDiscont {
    // Identificador único del descuento, asignado al azar.
    id?: string;
    // Código del descuento.
    code: string;
    // Puede ser 'loyalty', 'campaign', 'coupon' o 'sign'
    type: 'loyalty' | 'campaign' | 'coupon' | 'sign';
    // La cantidad a descontar de la suma total de todos los pagos, en centavos.
    amount: number;
}

interface IShippingContact {
    // Identificador único, asignado al azar.
    id?: string;
    // Teléfono de contacto.
    phone: string;
    // Nombre de la persona a la que va dirigido el paquete. (opcional)
    receiver?: string;
    // Las calles al lado de la dirección de entrega. (opcional)
    between_streets?: string;
    // Dirección de entrega.
    address: {
        // La primera línea para la dirección de envío. Usualmente es utilizado para calle y número.
        street1: string;
        // La segunda línea para la dirección de envío. Usualmente es utilizado para número interior, suite, fraccionamiento o delegación (opcional).
        street2?: string;
        // La ciudad de la dirección de envío.
        city: string;
        // El estado de la dirección de envío.
        state: string;
        // País de destino, utiliza el formato ISO 3166-1 de 2 dígitos.
        // https://es.wikipedia.org/wiki/ISO_4217
        country: string;
        // El código postal de la dirección de envío.
        postal_code: string;
        // Booleano que indica si es una dirección de envío residencial. Por defecto se toma como verdadero (opcional).
        residential?: boolean;
    }
}

// NOTE: Los campos "opcionales" son proporcionados por el API.
interface ICharge {
    // Identificador único del cargo asignado al azar.
    id?: string;
    // Fecha de creación del cargo.
    created_at?: number; // (32-bit unix timestamp)
    // Divisa con la cual se realizará el cobro. Utiliza el código de 3 letras del Estándar Internacional ISO 4217.
    // https://en.wikipedia.org/wiki/ISO_4217
    currency: string; // 'MXN'
    // Cantidad a pagar.
    amount?: number;
    // Cadena donde el usuario puede enviar información adicional para la orden.
    reference_id?: string;
    // Meses sin intereses a los que se diferirá el cargo. Conekta ofrece 3, 6, 9 y 12 meses sin intereses.
    monthly_installments?: number;
    // true: Modo de producción. false: Modo de prueba.
    livemode: boolean;
    // Clase del objeto. En este caso, "charge".
    object: string; // 'charge'
    // Status del cargo.
    status?: string;
    // Cantidad de la comisión en centavos.
    fee?: number;
    // Id de la orden a la que pertenece el cargo
    order_id?: string;
    // Método de pago del cargo.
    payment_method: {
        service_name: string; // "OxxoPay"
        object: string; // "cash_payment"
        type: string; // "oxxo"
        expires_at?: string | number;
        store_name: string; // "OXXO"
        reference?: string;
    }
}

export interface IOxxoResponse {
    data: {
        object: {
          livemode: boolean;
          amount: number;
          currency: string;
          payment_status: string;
          amount_refunded: number;
          customer_info: {
              email: string;
              phone: string;
              name: string;
              object: string;
          };
          shipping_contact: {
              receiver: string;
              phone: string;
              address: {
                  street1: string;
                  city: string;
                  state: string;
                  residential: boolean;
                  object: string;
                  postal_code: string;
              };
              id: string;
              object: string;
              created_at: number;
          };
          object: string;
          id: string;
          metadata: {
              accountNumber: string;
          };
          created_at: number;
          updated_at: number;
          line_items: {
              object: string;
              has_more: boolean;
              total: number;
              data: Array<{
                  name: string;
                  description: string;
                  unit_price: number;
                  quantity: number;
                  sku: string;
                  tags: Array<string>;
                  object: string;
                  id: string;
                  parent_id: string;
                  metadata: any;
                  antifraud_info: any;
              }>
          };
          shipping_lines: {
              object: string;
              has_more: boolean;
              total: number;
              data: Array<{
                  amount: number;
                  carrier: string;
                  method: string;
                  object: string;
                  id: string;
                  parent_id: string;
              }>
          };
          tax_lines: {
              object: string;
              has_more: boolean;
              total: number;
              data: Array<{
                  description: string;
                  amount: number;
                  object: string;
                  id: string;
                  parent_id: string;
              }>
          };
          discount_lines: {
              object: string;
              has_more: boolean;
              total: number;
              data: Array<{
                  code: string;
                  amount: number;
                  type: string;
                  object: string;
                  id: string;
                  parent_id: string;
              }>
          };
          charges: {
              object: string;
              has_more: boolean;
              total: number;
              data: Array<{
                    id: string;
                    livemode: boolean;
                    created_at: number;
                    currency: string;
                    monthly_installments: number;
                    device_fingerprint: string;
                    payment_method: {
                        service_name: string;
                        barcode_url: string;
                        object: string;
                        type: string;
                        expires_at: number;
                        store_name: string;
                        reference: string;
                    };
                    object: string;
                    description: string;
                    status: string;
                    amount: number;
                    paid_at: number;
                    fee: number;
                    customer_id: string;
                    order_id: string;
                }>
          }
      };
      previous_attributes: any;
    },
    livemode: boolean;
    webhook_status: string;
    id: string;
    object: string;
    type: string;
    created_at: number;
    webhook_logs: Array<{
        id: string;
        url: string;
        failed_attempts: number;
        last_http_response_status: number;
        object: string;
        last_attempted_at: number;
    }>
}

// CCCC L      AAA   SSSS EEEEE
//C     L     A   A S     E
//C     L     AAAAA  SSS  EEE
//C     L     A   A     S E
// CCCC LLLLL A   A SSSS  EEEEE

export default class ConektaModel {
    
    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postRetailerOrder(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Información.
            let {accountNumber, ...order}: { accountNumber: string } & IRetailOrder = body;
            // Se debe actualizar la información dependiendo del ambiente (si es bueno es desarrollo, si es tóxico es producción).
            let environment: string = process.env.NODE_ENV || 'development';
            // livemode
            let livemode: boolean = false;
            if(['development', 'local'].indexOf(environment.trim()) >= 0) {
                livemode = false;
            } else {
                livemode = true;
            }
            order.livemode = livemode;
            // charge.payment_method
            // NOTE: Se crea un sólo cargo de manera manual.
            order.charges = [{
                currency: 'MXN',
                livemode,
                object: 'charge',
                payment_method: {
                    service_name: 'OxxoPay',
                    object: 'cash_payment',
                    type: 'oxxo_cash',
                    // expires_at: expires_at,
                    store_name: 'OXXO',
                    reference: 'M100-000-001122'
                }
            }];
            /*
            for(let charge of order.charges) {
                // expires_at
                // TODO: Agregar X días a la fecha actual si el valor no se envía.
                let expiresAtAsDate: Date = (charge.payment_method && charge.payment_method.expires_at) ? new Date(charge.payment_method.expires_at as string) : new Date();
                let expires_at: number = Math.floor(expiresAtAsDate.getTime() / 1000);
                // Otros campos.
                // if(!charge.payment_method) charge.payment_method = {};
                charge.payment_method = {
                    service_name: "OxxoPay",
                    object: "cash_payment",
                    type: "oxxo_cash",
                    // expires_at: expires_at,
                    store_name: "OXXO",
                    // reference: ""
                }
            }
            */
            // metadata
            order.metadata = {
                accountNumber
            };

            // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
            // Las cantidades se manejan siempre en centavos... por lo que hay que multiplicar todo por 100 ¯\_ʕ•ᴥ•ʔ_/¯

            // return resolve(order);
            // REST.
            conekta.Order.create(order, (error: any, result: any) => {
                if(error) {
                    return reject({
                        status: 400,
                        message: 'Ocurrió un error al intentar crear la orden.',
                        error
                    });
                } else {
                    return resolve(result.toObject());
                }
            });
        });
    }

    //W   W EEEEE BBBB  H   H  OOO   OOO  K   K
    //W   W E     B   B H   H O   O O   O K  K
    //W W W EEE   BBBB  HHHHH O   O O   O KKK
    //WW WW E     B   B H   H O   O O   O K  K
    //W   W EEEEE BBBB  H   H  OOO   OOO  K   K

    public postConektaWebhook(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let order: IOxxoResponse = body;
            // Valores de TYPE en el ciclo de vida:
            // order.created
            // order.pending_payment
            // charge.created
            // order.paid
            // charge.paid
            let type: string = order.type.trim();
            switch(type) {
                case 'order.paid':
                    // Ayuda.
                    // console.log(JSON.stringify(order));
                    // console.log('Número de cuenta: ', order.data.object.metadata.accountNumber);
                    
                    //DDDD   AAA  TTTTT  OOO   SSSS
                    //D   D A   A   T   O   O S
                    //D   D AAAAA   T   O   O  SSS
                    //D   D A   A   T   O   O     S
                    //DDDD  A   A   T    OOO  SSSS
        
                    // Número de cuenta.
                    let accountNumber: string = order.data.object.metadata.accountNumber;
                    // Cantidad pagada.
                    
                    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                    // Las cantidades se manejan siempre en centavos... por lo que hay que dividir la cantidad por 100 ¯\_ʕ•ᴥ•ʔ_/¯

                    let amountPaid: number = parseFloat((order.data.object.amount / 100).toFixed(2));
                    // Arreglo de cargos (se usa para obtener la referencia).
                    let charges: Array<ICharge> = order.data.object.charges.data;
                    let chargeId: string = charges[0].id || '';
                    // Referencia.
                    let reference: string = '';
                    // NOTE: Como por ahora sólo se está utilizando un cargo (en Oxxo), se lee la información del primer objeto en el arreglo.
                    reference = charges[0].payment_method.reference || '';
                    // Número de cuenta interna para los pagos en línea.
                    // 6504898maestra1
                    let onlineAccount: InternalAccount = new InternalAccount();
                    let internalAccountModel: InternalAccountModel = new InternalAccountModel();
                    try {
                        onlineAccount = await internalAccountModel.getInternalAccount({ value: '6504898maestra1' });
                    } catch (error) {}
                    // Fecha de aplicación del pago.
                    // "event_date" : "2013-11-22T11:04:49-06:00",
                    let longTimeAgo: Date = new Date(1970, 0, 1);
                    longTimeAgo.setSeconds(order.created_at);
                    let applicationDate: Date = longTimeAgo;
                    // Se crea el objeto de pago.
                    let payment: Payment = {
                        parentId: accountNumber,
                        parentType: 'account',
                        paymentDate: date2StringFormat(applicationDate),
                        applicationDate: date2StringFormat(applicationDate),
                        amountPaid,
                        typeValue: 'conekta',                                   // NOTE: Revisar si se puede obtener de algún lado.
                        statusValue: 'paid',                                    // NOTE: Se debe actualizar al asignar el pago.
                        description: 'Pago servicio de telecomunicaciones.',    // bankResponse.Ds_MerchantData || '',
                        currencyValue: 'MXN',
                        exchangeRate: 1,
                        internalAccountNumber: onlineAccount._id,
                        reference,
                        paymentForm: '04',
                    };
                    // Ayuda.
                    // console.log(JSON.stringify(payment));
                    
                    //PPPP   AAA   GGGG  OOO
                    //P   P A   A G     O   O
                    //PPPP  AAAAA G  GG O   O
                    //P     A   A G   G O   O
                    //P     A   A  GGGG  OOO
        
                    let paymentModel: PaymentModel = new PaymentModel();
                    try {
                        await paymentModel.postPayment(payment);
                    } catch(error) {
        
                        //EEEEE M   M  AAA  IIIII L
                        //E     MM MM A   A   I   L
                        //EEE   M M M AAAAA   I   L
                        //E     M   M A   A   I   L
                        //EEEEE M   M A   A IIIII LLLLL
        
                        let emailTo: Array<To> = [];
                        emailTo.push({
                            email: 'dev@domain.com',
                            name: 'Ministerio de magia',
                            type: 'to'
                        });
                        let message: Message = {
                            html: `<h1>Example HTML content.</h1>`,
                            subject: `[ERROR] Al intentar guardar el pago enviado desde Conekta.`,
                            to: emailTo
                        };
                        let email: EmailWithTemplate = {
                            async: true,
                            message,
                            template_name: 'client_notification_new',
                            template_content: [{
                                name: 'message',
                                content: `Ocurrió un error al intentar guardar el pago enviado por el servicio de Conekta.<br/><br/>
                                        <h2>Datos:</h2><br/>${chargeId}<br/><br/>
                                        <h2>Error:</h2><br/>${JSON.stringify(error)}`
                            }]
                        };
                        try {
                            let emailModel: EmailModel = new EmailModel();
                            await emailModel.postEmail(email);
                        } catch(error) {}
                    }
                    
                    break;
            }
            // Respuesta temporal.
            return resolve({
                status: 200,
                message: 'Todo Ok'
            });
        });
    }

    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getBarcode(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // TODO: Obtener la siguiente información desde los parámetros:
            // 1. Tamaño de la imagen.
            // 2. Formato del código de barras.
            let { value, height, width, format, ...rest }: { value: string, height: number, width: number, format: string } & any = query;
            height = height ? parseInt(height) : 150;
            width = width ? parseInt(width) : 500;
            format = format ? format : 'CODE128';
            let barcode: string = '';
            try {
                let canvas: Canvas = createCanvas(width, height);
                JsBarcode(canvas, value, {
                    format,
                    height,
                    // width,
                    text: value,
                    displayValue: true
                });
                // Se convierte el lienzo a una cadena de texto en base64.
                let canvasAsBuffer: Buffer = canvas.toBuffer('image/jpeg');
                barcode = canvasAsBuffer.toString('base64');
            } catch(error) {
                return reject(error);
            }
            return resolve(barcode);
        });
    }
}