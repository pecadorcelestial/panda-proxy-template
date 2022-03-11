import axios from 'axios';
import idx from 'idx';
import { validate, IsBoolean, IsString, IsArray, IsEmail, IsEnum, IsDefined, IsBase64, IsUrl } from "class-validator";
import { RemodelErrors } from "../scripts/data-management";
import configuration from '../configuration';
import { MERGE_LENGUAGES, TO_TYPES } from '../constants/constants';

//EEEEE M   M  AAA  IIIII L
//E     MM MM A   A   I   L
//EEE   M M M AAAAA   I   L
//E     M   M A   A   I   L
//EEEEE M   M A   A IIIII LLLLL

export class Email {
    // key: string;
    // Estructura del mensaje.
    @IsDefined({
        message: 'El objeto es obligatorio.'
    })
    message: Message;
    // ¿Envío asyncrono? (Para envíos masivos).
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    async?: boolean = false;
    // Nombre del pool de IPs dedicado para utilizar.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    ip_pool?: string;
    // Tiempo de envío (para programarlo).
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    send_at?: string;
};

export class EmailWithTemplate {
    // key: string;
    // Estructura del mensaje.
    @IsDefined({
        message: 'El objeto es obligatorio.'
    })
    message: Message;
    // Nombre de la plantilla a utilizar.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    template_name: string;
    // Contenido a inyectar en la plantilla.
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    template_content: Array<{ [key: string]: string }>;
    // Estructura del mensaje.
    // message: any;
    // ¿Envío asyncrono? (Para envíos masivos).
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    async?: boolean = false;
    // Nombre del pool de IPs dedicado para utilizar.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    ip_pool?: string;
    // Tiempo de envío (para programarlo).
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    send_at?: string;
};

export class Message {
    // HTML del cuerpo del mensaje.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    html: string;
    // Texto a enviar.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    text?: string;
    // Asunto.
    @IsDefined({
        message: 'El objeto es obligatorio.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    subject: string;
    // Email de quien envía el mensaje.
    from_email?: string;
    // Nombre de quien envía el mensaje.
    from_name?: string;
    // Información del destinatario.
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    to: Array<To>;

    // OOO  PPPP   CCCC IIIII  OOO  N   N  AAA  L     EEEEE  SSSS
    //O   O P   P C       I   O   O NN  N A   A L     E     S
    //O   O PPPP  C       I   O   O N N N AAAAA L     EEE    SSS
    //O   O P     C       I   O   O N  NN A   A L     E         S
    // OOO  P      CCCC IIIII  OOO  N   N A   A LLLLL EEEEE SSSS

    // Encabezados del mensaje.
    headers?: any;
    // ¿Es importante?
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    important?: boolean = false;
    // ¿Reportar cuando el mensaje es abierto?
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    track_opens?: boolean = false;
    // ¿Reportar los clics dentro del mensaje?
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    track_clicks?: boolean = false;
    // ¿Se debe generar texto automaticamente cuando no exista texto?
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    auto_text?: boolean = false;
    // ¿Se debe generar HTML automaticamente cuando no exista HTML?
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    auto_html?: boolean = true;
    // ¿Los estilos se utilizan en línea?
    // NOTE: Sólo para documentos HTML menores a 256KB.
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    inline_css?: boolean = true;
    // ¿Quitar los parámetros de las URLs que son rastreadas?
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    url_strip_qs?: boolean = true;
    // ¿Exponer a todos los destinatarios?
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    preserve_recipients?: boolean = false;
    // ¿Logear contenido de las rutas?
    // NOTE: Configurar en 'falso' para correos con información delicada.
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    view_content_link?: boolean = false;
    // Email para recibir una copia del correo enviado.
    @IsEmail(undefined, {
        message: 'El valor no tiene el formato correcto.'
    })
    bcc_address?: string;
    // Dominio personalizado para hacer rastreo de correos abiertos y clics.
    // NOTE: Este dominio se utilizará en lugar de "mandrillapp.com".
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @IsUrl(undefined, {
        message: 'El valor no tiene el formato correcto.'
    })
    tracking_domain?: string;
    // Dominio personalizado para firmas SPF/DKIM del correo.
    // NOTE: Este dominio se utilizará en lugar de "mandrillapp.com".
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @IsUrl(undefined, {
        message: 'El valor no tiene el formato correcto.'
    })
    signing_domain?: string;
    // Dominio personalizado para la URL de retorno de correos.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @IsUrl(undefined, {
        message: 'El valor no tiene el formato correcto.'
    })
    return_path_domain?: string;
    // ¿Unir / mezclar los tags del mensaje?
    // NOTE: Se vuelve verdadero si se envían los campos "mergeVars" o "globalMergeVars".
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    merge?: boolean = true;
    // Lenguaje a utilizar para unir los tags.
    // NOTE: Debe ser uno de "mailchimp" o "handlebars".
    @IsEnum(MERGE_LENGUAGES, {
        message: 'El valor no está dentro del listado permitido.'
    })
    merge_lenguage?: string = 'mailchimp';
    // Variables globales a unir para todos los destinatarios.
    // NOTE: Se pueden sobre-escribir para cada destinatario.
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    global_merge_vars?: Array<{ [key: string]: any }>;
    // Variables a unir por cada destinatario.
    // NOTE: Sobre-escriben las variables globales.
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    merge_vars?: Array<{ rcpt: string, vars: Array<{ [key: string]: any }> }>;
    // Arreglo de tags a incluir con el correo.
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    tags?: Array<string>;
    // Identificador único de una subcuenta para el mensaje.
    // NOTE: Debe existir previamente o devolvera un error.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    sub_account?: string;
    // Arreglo de URLs que tendran parámetros de GA agregados automáticamente a los query.
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    google_analytics_domains?: Array<string>;
    // Valor que se agregará al parámetro "utm_campaign" automaticamente.
    google_analytics_campaign?: Array<string> | string;
    // Mandrill almacenará este metadata y lo tendrá disponible para su lectura.
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    metadata?: Array<any>;
    // Metadata por destinatario.
    // NOTE: Sobre-escribe el metadata anterior.
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    recipient_metadata?: Array<{ rcpt: string, values: any }>;
    // Archivos adjuntos.
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    attachments?: Array<FileStructure>;
    // Imágenes adjuntas.
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    images?: Array<FileStructure>;
}

export class To {
    // Email del destinatario.
    @IsDefined({
        message: 'El campo es obligatorio.'
    })
    @IsEmail(undefined, {
        message: 'El valor no tiene el formato correcto.'
    })
    email: string;
    // Nombre del destinatario.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    name?: string;
    // Tipo de destinatario.
    @IsEnum(TO_TYPES, {
        message: 'El valor no está dentro del listado permitido.'
    })
    type?: string = 'to';
}

export class FileStructure {
    // Tipo de archivo.
    @IsDefined({
        message: 'El campo es obligatorio.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    type: string;
    // Nombre del archivo.
    @IsDefined({
        message: 'El campo es obligatorio.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    name: string;
    // Contenido del archivo en base64.
    @IsDefined({
        message: 'El campo es obligatorio.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @IsBase64({
        message: 'El formato del valor es incorrecto.'
    })
    content: string;
}

export class EmailModel {

    // Propiedades.
    private email: EmailWithTemplate | undefined;

    // Constructor.
    constructor(email?: EmailWithTemplate) {
        this.email = email;
    }

    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        let { message, ...email } = this.email ? this.email : { message: {} };
        return this.validateSchemas(email, message);
    }

    private async validateSchemas(_email: any = {}, _message: any = {}): Promise<any> {
        // Arreglo de errores.
        let errors: Array<any> = [];
        // Email.
        let email = new EmailWithTemplate();
        email.template_name = _email.template_name;
        email.template_content = _email.template_content;
        email.async = _email.async;
        email.ip_pool = _email.ip_pool;
        email.send_at = _email.send_at;
        let emailErrors = await validate(email, { skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(emailErrors, 'email'));
        // Mensaje.
        let message = new Message();
        message.html = _message.html;
        message.text = _message.text;
        message.subject = _message.subject;
        message.from_email = _message.from_email;
        message.from_name = _message.from_name;
        message.to = _message.to;
        // -- Opcionales --
        message.headers = _message.headers;
        message.important = _message.important;
        message.track_opens = _message.track_opens;
        message.track_clicks = _message.track_clicks;
        message.auto_text = _message.auto_text;
        message.auto_html = _message.auto_html;
        message.inline_css = _message.inline_css;
        message.url_strip_qs = _message.url_strip_qs;
        message.preserve_recipients = _message.preserve_recipients;
        message.view_content_link = _message.view_content_link;
        message.bcc_address = _message.bcc_address;
        message.tracking_domain = _message.tracking_domain;
        message.signing_domain = _message.signing_domain;
        message.return_path_domain = _message.return_path_domain;
        message.merge = _message.merge;
        message.merge_lenguage = _message.merge_lenguage;
        message.global_merge_vars = _message.global_merge_vars;
        message.merge_vars = _message.merge_vars;
        message.tags = _message.tags;
        message.sub_account = _message.sub_account;
        message.google_analytics_domains = _message.google_analytics_domains;
        message.google_analytics_campaign = _message.google_analytics_campaign;
        message.metadata = _message.metadata;
        message.recipient_metadata = _message.recipient_metadata;
        message.attachments = _message.attachments;
        message.images = _message.images;
        let messageErrors = await validate(message, { skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(messageErrors, 'email.message'));
        // Contactos.
        if(Array.isArray(_message.to) && _message.to.length > 0) {
            _message.to.forEach( async (_recipient: To, index: number) => {
                let recipient = new To();
                recipient.email = _recipient.email;
                recipient.name = _recipient.name;
                recipient.type = _recipient.type;
                let recipientErrors = await validate(recipient, { skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(recipientErrors, `email.message.to[${index}]`));
            });
        }
        // Archivos adjuntos.
        if(Array.isArray(_message.attachments) && _message.attachments.length > 0) {
            _message.attachments.forEach( async (_attachment: FileStructure, index: number) => {
                let attachment = new FileStructure();
                attachment.type = _attachment.type;
                attachment.name = _attachment.name;
                attachment.content = _attachment.content;
                let attachmentErrors = await validate(attachment, { skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(attachmentErrors, `email.message.attachments[${index}]`));
            });
        }
        // Imágenes.
        if(Array.isArray(_message.images) && _message.images.length > 0) {
            _message.images.forEach( async (_image: FileStructure, index: number) => {
                let image = new FileStructure();
                image.type = _image.type;
                image.name = _image.name;
                image.content = _image.content;
                let imageErrors = await validate(image, { skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(imageErrors, `email.message.images[${index}]`));
            });
        }
        // Resultado.
        return errors;
    }
    
    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postEmail(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            let { message, ...email } = body;
            this.validateSchemas(email, message)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Email',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.notifications.email.postEmail, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Email',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject(idx(error, _ => _.response.data) || {
                            status: 400,
                            module: 'Email',
                            message: 'Ocurrió un error al intentar enviar la notificación (Email).',
                            error
                        });
                    }
                });
            }
        });
    }
}

// SSSS M   M  SSSS
//S     MM MM S
// SSS  M M M  SSS
//    S M   M     S
//SSSS  M   M SSSS

export class SMS {
    // Número telefónico.
    number: string;
    // Mensaje.
    message: string;
}

export class SMSModel {
    
    // Propiedades.
    private sms: Array<SMS> | undefined;

    // Constructor.
    constructor(sms?: Array<SMS>) {
        this.sms = sms || [];
    }

    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchemas(this.sms);
    }

    private async validateSchemas(_sms: any = []): Promise<any> {
        // Arreglo de errores.
        let errors: Array<any> = [];
        // Email.
        // for(const _message of _sms) {
            let sms = new SMS();
            sms.number = _sms.number;
            sms.message = _sms.message;
            let smsErrors = await validate(sms, { skipMissingProperties: true });
            errors = errors.concat(RemodelErrors(smsErrors, 'sms'));
        // }
        // Resultado.
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getSMS(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.notifications.sms.getSMS, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                    return reject({
                        status: 400,
                        module: 'SMS',
                        message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                    });
                } else {
                    return reject(idx(error, _ => _.response.data) || {
                        status: 400,
                        module: 'SMS',
                        message: 'Ocurrió un error al intentar obtener la información.',
                        error
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

    public postSMS(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            let sms: SMS = body;
            this.validateSchemas(sms)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'SMS',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.notifications.sms.postSMS, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'SMS',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject(idx(error, _ => _.response.data) || {
                            status: 400,
                            module: 'SMS',
                            message: 'Ocurrió un error al intentar enviar la notificación (SMS).',
                            error
                        });
                    }
                });
            }
        });
    }
}