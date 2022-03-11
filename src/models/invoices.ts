// Módulos.
import { Request, Response } from 'express';
import axios from 'axios';
import idx from 'idx';
import http from 'http';
import { IsString, MaxLength, validate, IsMongoId, IsDateString, IsNumber, IsJSON, IsUUID, IsArray, IsDefined } from 'class-validator';
import convert from 'xml-js';
// Modelos.
import AccountModel, { Account } from './accounts';
import { Address } from './addresses';
import { Client } from './clients';
import { Concept, ConceptP } from './invoicesV2';
import FilesModel from './files';
import PaymentModel, { ICollectionReport, Payment } from './payments';
// Funciones.
import { buildQuery } from '../scripts/parameters';
import { currencyFormat, number2Words } from '../scripts/numbers';
import { date2String, EDateType, date2StringFormat } from '../scripts/dates';
import { isEmpty } from '../scripts/object-prototypes';
import { pdf2Base64 } from '../classes/pdf';
import { RemodelErrors } from '../scripts/data-management';
// Configuración.
import configuration from '../configuration';

export class Invoice {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['PUT']
    })
    _id?: string;
    // Fecha de facturación.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsDateString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    invoiceDate: string;
    // Fecha de cancelación.
    @IsDateString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    cancelledDate?: string;
    // Número de serie.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(5, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    serie: string;
    // Folio.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    folio: number;
    // Ruta del archivo XML.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(120, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    xml: string;
    // Ruta del archivo PDF.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(120, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    pdf: string;
    // Objecto JSON con toda la información de la factura.
    //@IsDefined({
    //    message: 'El campo es requerido.',
    //   groups: ['POST']
    //})
    @IsJSON({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    json: any;
    // Código QR.
    //@IsDefined({
    //    message: 'El campo es requerido.',
    //    groups: ['POST']
    //})
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    qrCode: string;
    // UUID.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsUUID(undefined,{
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    uuid: string;
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
    // CFDIs afectados.
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    affectedCFDIs?: Array<string>;
    // Identificador legacy.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    legacyId?: number;
    // Cadena original.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    originalString?: string;
}

interface ITotalsReport {
    quantity: number,
    income: {
        quantity: number,           // Cantidad de documentos.
        total: number,              // Monto total.
        totalWithoutTaxes: number,  // Monto total sin impuestos.
        amount: string,             // Monto total con formato de moneda.
        amountWithoutTaxes: string  // Monto total con formato de moneda sin impuestos.
    },
    expenses: {
        quantity: number,
        total: number,
        totalWithoutTaxes: number,
        amount: string,
        amountWithoutTaxes: string
    },
    complements: {
        quantity: number,
        total: number,
        totalWithoutTaxes: number,
        amount: string,
        amountWithoutTaxes: string
    }
}

interface IBillingReport extends ICollectionReport {
    folio: string;
    client: number;
    status: string;
}

export default class InvoiceModel {
    
    //Propiedades.
    private invoice: any;

    // Constructor.
    constructor(invoice?: any) {
        this.invoice = invoice;
    }
    
    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchemas(this.invoice);
    }

    private async validateSchemas(_invoice: any = {}, groups: Array<string> = ['POST']): Promise<any> {
        
        let errors: Array<any> = [];
        
        let invoice = new Invoice();
        invoice.invoiceDate = _invoice.invoiceDate;
        invoice.cancelledDate = _invoice.cancelledDate;
        invoice.serie = _invoice.serie;
        invoice.folio = _invoice.folio;
        invoice.xml = _invoice.xml;
        invoice.pdf = _invoice.pdf;
        invoice.json = _invoice.json;
        invoice.qrCode = _invoice.qrCode;
        invoice.uuid = _invoice.uuid;
        invoice.statusValue = _invoice.statusValue;
        invoice.affectedCFDIs = _invoice.affectedCFDIs;
        invoice.legacyId = _invoice.legacyId;
        invoice.originalString = _invoice.originalString;
        let invoiceErrors = await validate(invoice, { groups, skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(invoiceErrors, 'invoice'));
        
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getInvoice(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.finance.invoices.getInvoice, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Facturas',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Facturas',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    
    public getInvoices(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.finance.invoices.getInvoices, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Facturas',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Facturas',
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

    public postInvoice(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Facturas',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.finance.invoices.postInvoice, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Facturas',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Facturas',
                            message: 'Ocurrió un error al intentar guardar la información (FACTURA).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    public postInvoices(body: any, file: Express.Multer.File): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { isTest, invoices, ...rest } = body;
            isTest = isTest ? JSON.parse(isTest) : false;

            //JJJJJ  SSSS  OOO  N   N
            //  J   S     O   O NN  N
            //  J    SSS  O   O N N N
            //J J       S O   O N  NN
            // J    SSSS   OOO  N   N

            let items: Array<Invoice> = [];
            if(file) {
                try {
                    items = JSON.parse(file.buffer.toString('utf8'));
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Facturas',
                        message: 'No se pudo leer la información del archivo.',
                        error
                    });
                }
            } else {
                if(Array.isArray(invoices) && invoices.length > 0) {
                    items = invoices;
                } else {
                    return reject({
                        status: 404,
                        module: 'Facturas',
                        message: 'No se encontró un archivo ni una lista de registros en la petición.'
                    });
                }
            }
            
            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
            
            let goodRecords: Array<any> = [];
            let badRecords: Array<any> = [];
            if(Array.isArray(items) && items.length > 0) {
                for(const invoice of items) {
                    // let { cardDetails, ...invoice } = item;
                    // Análisis y transformación de datos.
                    try {
                        // invoice.parentId = invoice.parentId.toString();
                        // invoice.json = JSON.parse(invoice.json);
                    } catch(error) {}
                    // Se crea el JSON si no existe.
                    let options: any = {
                        compact: true,
                        ignoreComment: true
                    };
                    // @ts-ignore
                    if(typeof invoice.xmlText === 'string' && (typeof invoice.json !== 'string' || invoice.json.length === 0)) {
                        // @ts-ignore
                        let invoiceJSON = convert.xml2js(invoice.xmlText, options);
                        invoice.json = invoiceJSON;
                    }
                    // Revisión de errores.
                    let invoiceErrors: any = await this.validateSchemas(invoice);
                    // Se revisa si el cliente se puede insertar o no.
                    if(invoiceErrors.length > 0) {
                        badRecords.push({
                            serie: invoice.serie,
                            folio: invoice.folio,
                            errors: invoiceErrors
                        });
                    } else {
                        goodRecords.push(invoice);
                    }
                }
            } else {
                return reject({
                    status: 400,
                    module: 'Facturas',
                    message: 'El archivo no contiene un arreglo o está vacío.'
                });
            }

            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T

            if(goodRecords.length === 0) {
                return reject({
                    status: 400,
                    module: 'Facturas',
                    message: 'No se encontró ningún registro bueno.',
                    good: {
                        total: goodRecords.length
                    },
                    bad: {
                        total: badRecords.length,
                        records: badRecords
                    }
                });
            } else {
                if(isTest) {
                    // PRUEBAS.
                    return resolve({ 
                        messge: 'Todo okey dokey.',
                        good: {
                            total: goodRecords.length
                        },
                        bad: {
                            total: badRecords.length,
                            records: badRecords
                        }
                    });
                } else {
                    // ESPARTANO.
                    axios.post(configuration.services.domain.finance.invoices.postInvoices, goodRecords)
                    .then((response: any) => {
                        return resolve({
                            status: 200,
                            message: 'Información insertada con éxito.',
                            data: idx(response, _ => _.data) || {},
                            good: {
                                total: goodRecords.length
                            },
                            bad: {
                                total: badRecords.length,
                                records: badRecords
                            }
                        });
                    })
                    .catch((error: any) => {
                        return reject({
                            status: 400,
                            module: 'Facturas',
                            message: 'Ocurrió un error al intentar guardar la información (FACTURAS).',
                            data: idx(error, _ => _.response.data) || {},
                            good: {
                                total: goodRecords.length
                            },
                            bad: {
                                total: badRecords.length,
                                records: badRecords
                            }
                        });
                    });
                }
            }
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putInvoice(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchemas(body, ['PUT'])
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Facturas',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.finance.invoices.putInvoice, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Facturas',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Facturas',
                            message: 'Ocurrió un error al intentar actualizar la información.',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    public putInvoiceGetJSON(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let invoices: Array<Invoice> = [];
            let goOn: boolean = true;
            let page: number = 1;
            let getErrors: number = 0;
            let errors: Array<any> = [];
            while(goOn && getErrors < 3/* && page === 1*/) {
                let params = {
                    limit: 100,
                    page,
                    statusValue: 'active'
                };
                try {
                    let getInvoices: { results: Array<Invoice>, summary: any } = await this.getInvoices(params);
                    invoices = getInvoices.results;
                } catch(error) {
                    page++;
                    getErrors++;
                }
                if(Array.isArray(invoices) && invoices.length > 0) {
                    // let index: number = 1;
                    for(const invoice of invoices) {
                        // console.log(index);
                        let currentInvoiceJSON: any = JSON.parse(invoice.json);
                        if((currentInvoiceJSON.hasOwnProperty('status') && currentInvoiceJSON.status === 'pending') || isEmpty(currentInvoiceJSON)) {
                            // 1. Se debe intentar leer el archivo.
                            // Solicitud del archivo.
                            let xmlFile: Buffer;
                            let xmlText: string = '';
                            try {
                                xmlFile = await this.getFile(invoice.xml);
                                xmlText = xmlFile.toString('utf8');
                            } catch(error) {
                                errors.push({
                                    invoice: `${invoice.serie}${invoice.folio}`,
                                    error
                                });
                            }
                            // 2. Convertirlo a JSON.
                            let options: any = {
                                compact: true,
                                ignoreComment: true
                            };
                            let invoiceJSON/*: convert.Element | convert.ElementCompact*/ = convert.xml2js(xmlText, options);
                            if(isEmpty(invoiceJSON)) {
                                invoiceJSON = { status: 'pending' };
                            }
                            // 3. Se actualiza la información de la factura.
                            try {
                                await this.putInvoice({ _id: invoice._id, json: JSON.stringify(invoiceJSON) });
                            } catch(error) {
                                errors.push({
                                    invoice: `${invoice.serie}${invoice.folio}`,
                                    error
                                });
                            }
                        }
                        // index++;
                    }
                } else {
                    goOn = false;
                }
                console.log(`Fin de la pagina ${page}.`);
                page++;
            }
            console.log('Fin de la función.');
            return resolve({
                status: errors.length > 0 ? 206 : 200,
                errors
            });
        });
    }

    private getFile(url: string): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let newRequest = http.request(url, (innerResponse: http.IncomingMessage) => {

                // SSSS TTTTT  AAA  TTTTT U   U  SSSS
                //S       T   A   A   T   U   U S
                // SSS    T   AAAAA   T   U   U  SSS
                //    S   T   A   A   T   U   U     S
                //SSSS    T   A   A   T    UUU  SSSS

                if(typeof innerResponse.statusCode === 'number' && innerResponse.statusCode >= 400) {
                    // Ocurrió un error.
                    return reject({
                        error: 'Facturas | Ocurrió un error al intentar leer el archivo.'
                    });
                }

                let data: Array<any> = [];

                //DDDD   AAA  TTTTT  AAA
                //D   D A   A   T   A   A
                //D   D AAAAA   T   AAAAA
                //D   D A   A   T   A   A
                //DDDD  A   A   T   A   A

                innerResponse.on('data', (chunk: any) => {
                    data.push(chunk);
                });

                //EEEEE N   N DDDD
                //E     NN  N D   D
                //EEE   N N N D   D
                //E     N  NN D   D
                //EEEEE N   N DDDD

                innerResponse.on('end', () => {
                    let xmlFile: Buffer = Buffer.concat(data);
                    return resolve(xmlFile);
                });

                //EEEEE RRRR  RRRR   OOO  RRRR
                //E     R   R R   R O   O R   R
                //EEE   RRRR  RRRR  O   O RRRR
                //E     R   R R   R O   O R   R
                //EEEEE R   R R   R  OOO  R   R

                innerResponse.on('error', (error: Error) => {
                    // Ocurrió un error.
                    return reject(error);
                });
            });
            // Error en la solicitud.
            newRequest.on('error', (error: Error) => {
                // Ocurrió un error.
                return reject(error);
            })
            // Se debe terminar la solicitud para que comience... si, leíste bien.
            newRequest.end();
        });
    }

    public async updateInvoiceDate(request: Request, response: Response): Promise<any> {
        // return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { ...filters } = request.body;
            let getInvoices: { results: Array<Invoice>, summary: any } = { results: [], summary: {} };
            try {
                getInvoices = await this.getInvoices(filters);
            } catch(error) {
                response.status(400).end(JSON.stringify(error));
            }
            // return response.status(200).end(JSON.stringify(getInvoices.summary));
            console.log(getInvoices.summary);
            if(getInvoices.results.length > 0) {
                // Se escribe la primera parte de la respuesta.
                response.write('{ "results": [');
                // Se recorren todas las facturas.
                for(const invoice of getInvoices.results) {
                    let invoiceJSON: JSON = JSON.parse(invoice.json);
                    // YYYY-MM-DDT00:00:00.000Z
                    // 2019-10-09T10:11:45
                    let invoiceDate: string = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Fecha']) || '').toString();
                    if(invoiceDate.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})$/gi)) {
                        invoiceDate = `${invoiceDate}.000Z`;
                        try {
                            await this.putInvoice({ _id: invoice._id, invoiceDate });
                        } catch(error) {
                            response.write(`${JSON.stringify({
                                folio: `${invoice.serie}${invoice.folio}`,
                                message: 'No se pudo actualizar la información.',
                                error: JSON.stringify(error)
                            })},`);
                            continue;
                        }
                    } else {
                        response.write(`${JSON.stringify({
                            folio: `${invoice.serie}${invoice.folio}`,
                            message: 'La factura no tiene una fecha válida.'
                        })},`);
                    }
                    response.write(`${JSON.stringify({
                        folio: `${invoice.serie}${invoice.folio}`,
                        message: 'Factura actualizada con éxito.'
                    })},`);
                }
                // Se escribe el cierre del objeto.
                response.write(`]}`);
                // Se termina el proceso.
                console.log('Proceso terminado con éxito.');
                response.end();
            } else {
                response.status(400).end(JSON.stringify({
                    status: 400,
                    module: 'Facturas',
                    message: 'No se encontraron resultados con los parámetros enviados.'
                }));
            }
        // });
    }

    //DDDD  EEEEE L     EEEEE TTTTT EEEEE
    //D   D E     L     E       T   E
    //D   D EEE   L     EEE     T   EEE
    //D   D E     L     E       T   E
    //DDDD  EEEEE LLLLL EEEEE   T   EEEEE

    public deleteInvoice(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.finance.invoices.deleteInvoice, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Facturas',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Facturas',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    //PPPP  RRRR   OOO   CCCC EEEEE  SSSS  OOO   SSSS
    //P   P R   R O   O C     E     S     O   O S
    //PPPP  RRRR  O   O C     EEE    SSS  O   O  SSS
    //P     R   R O   O C     E         S O   O     S
    //P     R   R  OOO   CCCC EEEEE SSSS   OOO  SSSS

    public getPDFFromInvoice(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { invoiceId, accountNumber, ...rest}: { invoiceId: string, accountNumber: string } & any = body;

            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
            //F     A   A C       T   U   U R   R A   A
            //FFF   AAAAA C       T   U   U RRRR  AAAAA
            //F     A   A C       T   U   U R   R A   A
            //F     A   A  CCCC   T    UUU  R   R A   A

            // 1. Se obtiene la información del pago.
            let invoice: Invoice = new Invoice();
            try {
                invoice = await this.getInvoice({ _id: invoiceId });
            } catch(error) {
                return reject(error);
            }

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let account: Account = new Account();
            let client: Client = new Client();
            let accountModel: AccountModel = new AccountModel();
            try {
                account = await accountModel.getAccount({ accountNumber });
                client = account.client || new Client();
            } catch(error) {
                return reject(error);
            }

            //EEEEE JJJJJ  SSSS
            //E       J   S
            //EEE     J    SSS
            //E     J J       S
            //EEEEE  J    SSSS
            
            let templateName: string = invoice.serie === 'P' ? '../templates/invoice.type.p.ejs' : '../templates/invoice.type.a.ejs';
            let invoiceJSON: any = JSON.parse(invoice.json);
            let invoiceEJS: any = {
                folio: `${invoice.serie.toUpperCase()}-${invoice.folio}`,
                uuid: invoice.uuid,
                stampingDate: idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Fecha']),
                csd: idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['NoCertificado']),
                satCSD: idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['NoCertificadoSAT']),
                cfdiUse: idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Receptor']['_attributes']['UsoCFDI']),
                paymentForm: idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['FormaPago']),
                paymentMethod: idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['MetodoPago']),
                subtotal: `$${currencyFormat.format(parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['SubTotal']) || '0.00').toString()))}`,
                discount: `$${currencyFormat.format(parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Descuento']) || '0.00').toString()))}`,
                total: `$${currencyFormat.format(parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0.00').toString()))}`,
                taxes: `$${currencyFormat.format(parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Impuestos']['_attributes']['TotalImpuestosTrasladados']) || '0.00').toString()))}`,
                totalInText: number2Words(parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0.00').toString()), (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Moneda']) || 'MXN').toString()),
                qrCode: invoice.qrCode,
                originalString: invoice.originalString || '',
                // concepts: invoiceConcepts,
                cfdiStamp: idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['SelloCFD']),
                satStamp: idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['SelloSAT']),
                currency: (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Moneda']) || 'MXN').toString(),
                exchangeRate: (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['TipoCambio']) || '1').toString()
            };
            let errors: Array<any> = [];
            // Se revisa si la factura es complemento o PUE.
            if(invoice.serie === 'P') {
                // Conceptos.
                let invoiceConcepts: Array<{ uuid: string, serieNfolio: string, lastBalance: string, amount: string, currentBalance: string }> = [];
                let jsonComplement: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['pago10:Pagos']['pago10:Pago']);
                let jsonConcepts: any = idx(jsonComplement, _ => _['pago10:DoctoRelacionado']);
                if(Array.isArray(jsonConcepts) && jsonConcepts.length > 0) {
                    for(const jsonConcept of jsonConcepts) {
                        // Serie.
                        let serie: string = (idx(jsonConcept, _ => _['_attributes']['Serie']) || '').toString();
                        // Folio.
                        let folio: string = (idx(jsonConcept, _ => _['_attributes']['Folio']) || '').toString();
                        // Conceptos.
                        invoiceConcepts.push({
                            uuid: (idx(jsonConcept, _ => _['_attributes']['IdDocumento']) || '').toString(),
                            serieNfolio: `${serie}${folio}`,
                            lastBalance: `$${currencyFormat.format(parseFloat((idx(jsonConcept, _ => _['_attributes']['ImpSaldoAnt']) || '0.00').toString()))}`,
                            amount: `$${currencyFormat.format(parseFloat((idx(jsonConcept, _ => _['_attributes']['ImpPagado']) || '0.00').toString()))}`,
                            currentBalance: `$${currencyFormat.format(parseFloat((idx(jsonConcept, _ => _['_attributes']['ImpSaldoInsoluto']) || '0.00').toString()))}`,
                        });
                    }
                } else if(!isEmpty(jsonConcepts) && jsonConcepts.hasOwnProperty('_attributes')) {
                    // Serie.
                    let serie: string = (idx(jsonConcepts, _ => _['_attributes']['Serie']) || '').toString();
                    // Folio.
                    let folio: string = (idx(jsonConcepts, _ => _['_attributes']['Folio']) || '').toString();    
                    // Conceptos.
                    invoiceConcepts.push({
                        uuid: (idx(jsonConcepts, _ => _['_attributes']['IdDocumento']) || '').toString(),
                        serieNfolio: `${serie}${folio}`,
                        lastBalance: `$${currencyFormat.format(parseFloat((idx(jsonConcepts, _ => _['_attributes']['ImpSaldoAnt']) || '0.00').toString()))}`,
                        amount: `$${currencyFormat.format(parseFloat((idx(jsonConcepts, _ => _['_attributes']['ImpPagado']) || '0.00').toString()))}`,
                        currentBalance: `$${currencyFormat.format(parseFloat((idx(jsonConcepts, _ => _['_attributes']['ImpSaldoInsoluto']) || '0.00').toString()))}`,
                    });
                }
                invoiceEJS.concepts = invoiceConcepts;
                // Otros datos:
                // Forma de pago.
                invoiceEJS.paymentForm = (idx(jsonComplement, _ => _['_attributes']['FormaDePagoP']) || '').toString();
                // Moneda.
                invoiceEJS.currency = (idx(jsonComplement, _ => _['_attributes']['MonedaP']) || 'MXN').toString();
                // Total.
                invoiceEJS.total = `$${currencyFormat.format(parseFloat((idx(jsonComplement, _ => _['_attributes']['Monto']) || '0.00').toString()))}`;
            } else {
                let invoiceConcepts: Array<Concept> = [];
                let jsonConcepts: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']);
                if(Array.isArray(jsonConcepts) && jsonConcepts.length > 0) {
                    for(const jsonConcept of jsonConcepts) {
                        invoiceConcepts.push({
                            amount: parseFloat((idx(jsonConcept, _ => _['_attributes']['Cantidad']) || 1).toString()),
                            // @ts-ignore
                            key: accountNumber, // Número de cuenta
                            unitKey: idx(jsonConcept, _ => _['_attributes']['ClaveUnidad']) || 'E48',
                            serviceKey: idx(jsonConcept, _ => _['_attributes']['ClaveProdServ']),
                            description: (idx(jsonConcept, _ => _['_attributes']['Descripcion']) || '').toString(),
                            unitCost: `$${currencyFormat.format(parseFloat((idx(jsonConcept, _ => _['_attributes']['ValorUnitario']) || '0.00').toString()))}`,
                            total: `$${currencyFormat.format(parseFloat((idx(jsonConcept, _ => _['_attributes']['Importe']) || '0.00').toString()))}`
                        });
                    }
                } else if(!isEmpty(jsonConcepts) && jsonConcepts.hasOwnProperty('_attributes')) {
                    invoiceConcepts.push({
                        amount: parseFloat((idx(jsonConcepts, _ => _['_attributes']['Cantidad']) || 1).toString()),
                        // @ts-ignore
                        key: accountNumber, // Número de cuenta
                        unitKey: idx(jsonConcepts, _ => _['_attributes']['ClaveUnidad']) || 'E48',
                        serviceKey: idx(jsonConcepts, _ => _['_attributes']['ClaveProdServ']),
                        description: (idx(jsonConcepts, _ => _['_attributes']['Descripcion']) || '').toString(),
                        unitCost: `$${currencyFormat.format(parseFloat((idx(jsonConcepts, _ => _['_attributes']['ValorUnitario']) || '0.00').toString()))}`,
                        total: `$${currencyFormat.format(parseFloat((idx(jsonConcepts, _ => _['_attributes']['Importe']) || '0.00').toString()))}`
                    });
                }
                invoiceEJS.concepts = invoiceConcepts;
            }
            
            //PPPP  DDDD  FFFFF
            //P   P D   D F
            //PPPP  D   D FFF
            //P     D   D F
            //P     DDDD  F

            let ejsData: any = {};
            let pdfToBase64: string ='';
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
                    invoice: invoiceEJS,
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
                        name: idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Emisor']['_attributes']['Nombre']),
                        rfc: idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Emisor']['_attributes']['Rfc']),
                        accountNumber: ''
                    }
                };
                // Se genera el archivo PDF "virtual.".
                let pdfToBase64Result = await pdf2Base64(templateName, ejsData);
                pdfToBase64 = pdfToBase64Result.data;
            } catch(error) {
                return reject(error);
            }
            // Si se logró generar el recibo, se guarda el archivo y se actualiza el recibo.
            let updatedInvoice: Invoice = new Invoice();
            if(pdfToBase64.length > 0) {
                                    
                // AAA  RRRR   CCCC H   H IIIII V   V  OOO
                //A   A R   R C     H   H   I   V   V O   O
                //AAAAA RRRR  C     HHHHH   I   V   V O   O
                //A   A R   R C     H   H   I    V V  O   O
                //A   A R   R  CCCC H   H IIIII   V    OOO

                let id = invoice.serie;
                let category = 'invoices';
                let company = configuration.company.name;
                let pdfBuffer: Buffer | undefined;
                pdfBuffer = Buffer.from(pdfToBase64, 'base64');
                let invoiceFile: string = '';
                if(pdfBuffer){
                    try {
                        // Se guarda el archivo.
                        let fileModel: FilesModel = new FilesModel();
                        let _file: any = await fileModel.postFileFromBuffer(pdfBuffer, 'application/pdf', `${invoice.serie}${invoice.folio}.pdf`, id, category, company);
                        invoiceFile = _file.path;
                    } catch(error) {
                        return reject(error);
                    }
                }

                // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
                //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
                //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
                //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
                //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

                if(invoiceFile.length > 0) {
                    try {
                        updatedInvoice = await this.putInvoice({ _id: invoiceId, pdf: invoiceFile });
                    } catch(error) {
                        return reject(error);
                    }
                }
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

            return resolve(updatedInvoice);
        });
    }

    //RRRR  EEEEE PPPP   OOO  RRRR  TTTTT EEEEE  SSSS
    //R   R E     P   P O   O R   R   T   E     S
    //RRRR  EEE   PPPP  O   O RRRR    T   EEE    SSS
    //R   R E     P     O   O R   R   T   E         S
    //R   R EEEEE P      OOO  R   R   T   EEEEE SSSS

    public getTotalInvoices(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { start, end }: { start: string, end: string } = query;
            // Se obtienen todos las facturas del periodo.
            let getInvoices: { results: Array<Invoice>, summary: any } = { results: [], summary: {} };
            try {
                let params: any = {
                    all: true,
                    invoiceDate: { "start": start, "end": end },
                    statusValue: 'active'
                };
                getInvoices = await this.getInvoices(params);
            } catch(error) {
                return reject(error);
            }
            // Se revisa uno por uno.
            if(getInvoices.results.length > 0) {
                let result: ITotalsReport = {
                    quantity: 0,
                    income: {
                        quantity: 0,
                        total: 0,
                        totalWithoutTaxes: 0,
                        amount: '',
                        amountWithoutTaxes: ''
                    },
                    expenses: {
                        quantity: 0,
                        total: 0,
                        totalWithoutTaxes: 0,
                        amount: '',
                        amountWithoutTaxes: ''
                    },
                    complements: {
                        quantity: 0,
                        total: 0,
                        totalWithoutTaxes: 0,
                        amount: '',
                        amountWithoutTaxes: ''
                    }
                };
                for(const invoice of getInvoices.results) {
                    let invoiceJSON: any = JSON.parse(invoice.json);
                    let invoiceTotal: number = 0;
                    // Se revisa el tipo de comprobante.
                    switch(invoice.serie) {
                        case 'P':
                            // Complementos.
                            invoiceTotal = parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['pago10:Pagos']['pago10:Pago']['_attributes']['Monto']) || '0.00').toString());
                            result.complements.total += invoiceTotal;
                            result.complements.quantity++;
                            break;
                        case 'E':
                            // Egresos.
                            invoiceTotal = parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0.00').toString());
                            result.expenses.total += invoiceTotal;
                            result.expenses.quantity++;
                            break;
                        default:
                            // Ingresos.
                            invoiceTotal = parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0.00').toString());
                            result.income.total += invoiceTotal;
                            result.income.quantity++;
                            break;
                    }
                }
                // Se "recortan" los totales.
                result.complements.total = parseFloat(result.complements.total.toFixed(2));
                result.complements.totalWithoutTaxes = parseFloat((result.complements.total / 1.16).toFixed(2));
                result.expenses.total = parseFloat(result.expenses.total.toFixed(2));
                result.expenses.totalWithoutTaxes = parseFloat((result.expenses.total / 1.16).toFixed(2));
                result.income.total = parseFloat(result.income.total.toFixed(2));
                result.income.totalWithoutTaxes = parseFloat((result.income.total / 1.16).toFixed(2));
                // Se da formato a los totales.
                result.complements.amount = `$${currencyFormat.format(result.complements.total)}`;
                result.complements.amountWithoutTaxes = `$${currencyFormat.format(result.complements.totalWithoutTaxes)}`;
                result.expenses.amount = `$${currencyFormat.format(result.expenses.total)}`;
                result.expenses.amountWithoutTaxes = `$${currencyFormat.format(result.expenses.totalWithoutTaxes)}`;
                result.income.amount = `$${currencyFormat.format(result.income.total)}`;
                result.income.amountWithoutTaxes = `$${currencyFormat.format(result.income.totalWithoutTaxes)}`;
                // Se devuelve el resultado.
                return resolve(result);
            } else {
                return reject({
                    status: 404,
                    message: 'No se encontró ninguna factura dentro del periodo especificado.'
                });
            }
        });
    }

    public async getBillingReport(request: Request, response: Response): Promise<any> {
        
        // Son 3 líneas por registro por que pues contabilidad ¯\_ʕ•ᴥ•ʔ_/¯.
        // ┌───────────┬────────────────────────────────────┬───────────┬───────────┬────────────┬─────────┬───────────────────────┬─────────┬──────────┐
        // │  Cuenta   │               Nombre               │   Cargo   │   Abono   │ Referencia │  Folio  │       Concepto        │ Cliente │ Estatus  │
        // ├───────────┼────────────────────────────────────┼───────────┼───────────┼────────────┼─────────┼───────────────────────┼─────────┼──────────┤
        // │ 110045480 │      Daniela Rodríguez Zuñiga      │  $499.00  │    ---    │  1291589   │ I108197 │ ${Nombre del Cliente} │  12915  │ GENERADO │
        // ├───────────┼────────────────────────────────────┼───────────┼───────────┼────────────┼─────────┼───────────────────────┼─────────┼──────────┤
        // │ 410000000 │               Renta                │    ---    │  $430.17  │  1291589   │ I108197 │ ${Nombre del Cliente} │  12915  │          │
        // ├───────────┼────────────────────────────────────┼───────────┼───────────┼────────────┼─────────┼───────────────────────┼─────────┼──────────┤
        // │ 210050002 │     IVA Pendiente de Trasladar     │    ---    │   $68.83  │  1291589   │ I108197 │ ${Nombre del Cliente} │  12915  │          │
        // └───────────┴────────────────────────────────────┴───────────┴───────────┴────────────┴─────────┴───────────────────────┴─────────┴──────────┘

        let getInvoices: { results: Array<Invoice>, summary: any } = { results: [], summary: {} };
        try {
            getInvoices = await this.getInvoices(request.query);
        } catch(error) {
            response.status(400).end(JSON.stringify(error));
        }
            
        response.write('{ "results": [');
        
        // let report: Array<IBillingReport> = [];
        // let errors: Array<any> = [];
        let lines: number = 0;
        for(const invoice of getInvoices.results) {

            let status: string = 'GENERADO';
            switch(invoice.statusValue) {
                case 'cancelled':
                    status = 'CANCELADA';
                    break;
                case 'c_process':
                    status = 'EN PROCESO DE CANCELACIÓN';
                    break;
            }
            let accountNumber: string = '';
            let reference: string = '--';
            let total: number = 0;
            let amountWithoutTaxes: number = 0;
            let taxes: number = 0;
            let clientName: string = '';
            let clientAccountNumber: string = '--';

            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
            //F     A   A C       T   U   U R   R A   A
            //FFF   AAAAA C       T   U   U RRRR  AAAAA
            //F     A   A C       T   U   U R   R A   A
            //F     A   A  CCCC   T    UUU  R   R A   A
            
            let invoiceJSON: any = JSON.parse(invoice.json);
            if(invoice.serie === 'P') {
                total = parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['pago10:Pagos']['pago10:Pago']['_attributes']['Monto']) || 0).toString());
                taxes = parseFloat((total * 0.16).toFixed(2));
                amountWithoutTaxes = parseFloat((total - taxes).toFixed(2));
                // TODO: Falta saber de dónde obtener el número de la cuenta.
                clientName = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Receptor']['_attributes']['Nombre']) || '--').toString();
            } else {
                amountWithoutTaxes = parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['SubTotal']) || 0).toString());
                taxes = parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Impuestos']['_attributes']['TotalImpuestosTrasladados']) || 0).toString());
                total = parseFloat((amountWithoutTaxes + taxes).toFixed(2));
                let concepts: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']);
                if(Array.isArray(concepts) && concepts.length > 0) {
                    accountNumber = concepts[0]['_attributes']['NoIdentificacion'];
                } else if(concepts.hasOwnProperty('_attributes')) {
                    accountNumber = concepts['_attributes']['NoIdentificacion'] || '';
                }
                clientName = (idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Receptor']['_attributes']['Nombre']) || '--').toString();
            }

            //PPPP   AAA   GGGG  OOO
            //P   P A   A G     O   O
            //PPPP  AAAAA G  GG O   O
            //P     A   A G   G O   O
            //P     A   A  GGGG  OOO

            let paymentModel: PaymentModel = new PaymentModel();
            let payment: Payment = new Payment();
            try {
                payment = await paymentModel.getPayment({ invoices: invoice._id });
                // Si la información se puede obtener del pago, se modifica.
                reference = payment.reference || '--';
                // NOTE: Se devuelve la información dentro del JSON.
                // total = parseFloat(payment.amountPaid.toFixed(2));
                // amountWithoutTaxes = parseFloat((payment.amountPaid / 1.16).toFixed(2));
                // taxes = parseFloat((payment.amountPaid - amountWithoutTaxes).toFixed(2));
                accountNumber = payment.parentId;
            } catch(error) {
                // continue;
                // TODO: Si no tiene pago asignado, se debe obtener la información desde el JSON de la factura.
            }
            
            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let accountModel: AccountModel = new AccountModel();
            let account: Account = new Account();
            let client: Client = new Client();
            if(accountNumber.length > 0) {
                try {
                    account = await accountModel.getAccount({ accountNumber });
                    client = account.client || new Client();
                    // Información adicional.
                    clientName = idx(client.businessData, _ => _.businessName) || `${client.firstName} ${client.secondName} ${client.firstLastName} ${client.secondLastName}`;
                    clientAccountNumber = idx(client.accountingData, _ => _.generalAccountNumber) || '--';
                } catch(error) {
                    // continue;
                }
            }
            clientName = clientName.replace(/\s+/g, ' ').trim();

            // Línea #1.
            response.write(`${(lines > 0 ? ',' : '')}${JSON.stringify({
                account: clientAccountNumber,
                name: clientName,
                charge: `$${currencyFormat.format(total)}`,
                payment: '--',
                reference,
                folio: `${invoice.serie}${invoice.folio}`,
                concept: clientName,
                client: client.folio,
                status
            })}`);
            lines++;

            // Línea #2.
            response.write(`${(lines > 0 ? ',' : '')}${JSON.stringify({
                account: configuration.contPAQi.rent,
                name: 'Renta',
                charge: '--',
                payment: `$${currencyFormat.format(amountWithoutTaxes)}`,
                reference,
                folio: `${invoice.serie}${invoice.folio}`,
                concept: clientName,
                client: client.folio,
                status: '--'
            })}`);
            lines++;

            // Línea #3.
            response.write(`${(lines > 0 ? ',' : '')}${JSON.stringify({
                account: configuration.contPAQi.pendingTaxes,
                name: 'IVA Pendiente de Trasladar',
                charge: '--',
                payment: `$${currencyFormat.format(taxes)}`,
                reference,
                folio: `${invoice.serie}${invoice.folio}`,
                concept: clientName,
                client: client.folio,
                status: '--'
            })}`);
            lines++;
        }
        // TODO: Agregar la sección "summary"... no sé, tal vez... piénsalo...
        // FIXME: La sección "summary" debe ser personalizada al proceso, ya que no se puede enviar el de obtención de pagos.
        // NOTE: El total y las páginas si se pueden usar del "summary" de pagos.
        // Pagina anterior.
        let previousPage: string = '';
        if(getInvoices.summary.currentPage > 1) {
            let previousPageParameters = Object.assign({}, request.query);
            previousPageParameters['page'] = getInvoices.summary.currentPage - 1;
            previousPage = `${request.path}${buildQuery(previousPageParameters)}`;
        }
        // Pagina siguiente.
        let nextPage = '';
        if(getInvoices.summary.currentPage < getInvoices.summary.pages) {
            let nextPageParameters = Object.assign({}, request.query);
            nextPageParameters['page'] = getInvoices.summary.currentPage + 1;
            nextPage = `${request.path}${buildQuery(nextPageParameters)}`;
        }
        // Resumen.
        let summary = {
            total: getInvoices.summary.total,
            pages: getInvoices.summary.pages,
            currentPage: getInvoices.summary.currentPage,
            nextPage,
            previousPage
        };
        // Se escribe el resumen en la respuesta.
        response.write(`], "summary": ${JSON.stringify(summary)}}`);
        // Se termina el proceso.
        response.end();
    }
}