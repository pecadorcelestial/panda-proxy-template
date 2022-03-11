import * as express from 'express';
import axios, { AxiosResponse } from 'axios';
import idx from 'idx';
import configuration from '../configuration';

import FormData from 'form-data';
import http from 'http';

export default class FilesModel {

    constructor() {}
    
    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postFile(file: Express.Multer.File, id: string, category: string, company: string): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            /*
            {
                "fieldname":"logo",
                "originalname":"icon_512.png",
                "encoding":"7bit",
                "mimetype":"image/png",
                "buffer":{
                    "type":"Buffer",
                    "data":[]
                },
                "size":10243
            }
            */
            if(file && file.buffer) {

                let { buffer, ...rest } = file;
               
                // OOO  PPPP   CCCC IIIII  OOO  N   N        1
                //O   O P   P C       I   O   O NN  N       11
                //O   O PPPP  C       I   O   O N N N        1
                //O   O P     C       I   O   O N  NN        1
                // OOO  P      CCCC IIIII  OOO  N   N      11111
            
                let formData = new FormData();
                try {
                    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                    // - Mutex no recibe ningún campo después del archivo, es decir, que cualquier valor que se desee
                    //   leer dentro del "body" debe ir antes del archivo.
                    formData.append('id', id); //'5c732219e9eea328a402cec9');
                    formData.append('category', category); //'configuration');
                    formData.append('company', company); //'Domain');
                    formData.append('file', file.buffer, file.originalname);
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Archivos',
                        message: 'Ocurrió un error al intentar generar la forma de petición.',
                        error
                    });
                }
                // Actual: 20954058
                // Máximo: 2097152
                axios.post(configuration.services.domain.files.postFile, formData, { 
                    maxContentLength: 52428890,
                    timeout: 250000,
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
                    },
                })
                .then((response: AxiosResponse<any>) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Archivos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Archivos',
                            message: 'Ocurrió un error al intentar guardar la información (ARCHIVO).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });

                // OOO  PPPP   CCCC IIIII  OOO  N   N       222
                //O   O P   P C       I   O   O NN  N      2   2
                //O   O PPPP  C       I   O   O N N N        22
                //O   O P     C       I   O   O N  NN       2
                // OOO  P      CCCC IIIII  OOO  N   N      22222
                /*
                // Datos.
                let formData = new FormData();
                try {
                    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                    // - Mutex no recibe ningún campo después del archivo, es decir, que cualquier valor que se desee
                    //   leer dentro del "body" debe ir antes del archivo.
                    formData.append('id', id); //'5c732219e9eea328a402cec9');
                    formData.append('category', category); //'configuration');
                    formData.append('company', company); //'Domain');
                    formData.append('file', file.buffer, file.originalname);
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Archivos',
                        message: 'Ocurrió un error al intentar generar la forma de petición.',
                        error
                    });
                }
                // Opciones.
                let options: http.RequestOptions = {
                    protocol: 'http:',
                    hostname: '192.168.0.62',
                    port: '8084',
                    path: '/file',
                    timeout: 150000,
                    method: 'POST'
                };
                // Encabezados.
                options.headers = {
                    'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`, //file.mimetype,
                    // 'Content-Length': Buffer.byteLength(file.buffer)
                };
                console.log('OPCIONES:', options);
                // Petición.
                let error: boolean = false;
                let rawData: any = '';
                let statusOK: Array<number> = [200, 201, 202, 203, 204, 205, 206, 207, 208];
                let req: http.ClientRequest = http.request(options, (res: http.IncomingMessage) => {
                    //Se obtiene el estatus devuelto.
                    console.log('[SAVE FILE] Estatus: ', res.statusCode);
                    let statusCode: number | undefined = res.statusCode || 200;
                    //Se revisa.
                    if (statusOK.indexOf(statusCode) < 0) {
                        error = true;
                    }
                    //RESPUESTA.
                    //Se hace un encoding a UTF-8.
                    res.setEncoding('utf8');
                    //Se obtiene la información.
                    res.on('data', (chunk: any) => rawData += chunk);
                    //Se termina la llamada.
                    res.on('end', () => {
                        //Se devuelve el resultado.
                        if(error) {
                            console.log('[SAVE FILE] Error: ', rawData);
                            // response.status(statusCode).end(rawData);
                            return reject({
                                status: 400,
                                module: 'Archivos',
                                message: 'Ocurrió un error al intentar guardar el archivo.'
                            })
                        } else {
                            console.log('[SAVE FILE] Éxito: ', rawData);
                            // response.end(rawData);
                            return resolve(rawData);
                        }
                    });
                });
                // req.write(file.buffer);
                req.write(formData);
                
                //Se atrapa cualquier error dentro de la solicitud.
                req.on('error', (e: Error) => {
                    console.log('[SAVE FILE] Excepción: ', e);
                });

                //Se termina la solicitud.
                req.end();
                */
            } else {
                return reject({
                    status: 404,
                    module: 'Archivos',
                    message: 'No se encontró ningún archivo en la petición.'
                });
            }
        });
    }

    public postFileFromBuffer(file: Buffer | undefined, contentType: string, fileName: string, id: string, category: string, company: string): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            if(file) {
                let formData = new FormData();
                try {
                    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                    // - Mutex no recibe ningún campo después del archivo, es decir, que cualquier valor que se desee
                    //   leer dentro del "body" debe ir antes del archivo.
                    formData.append('id', id);
                    formData.append('category', category);
                    formData.append('company', company);
                    formData.append('file', file, {
                        contentType,
                        filename: fileName
                    })
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Archivos',
                        message: 'Ocurrió un error al intentar generar la forma de petición.',
                        error
                    });
                }
                axios.post(configuration.services.domain.files.postFile, formData, { 
                    maxContentLength: 52428890,
                    timeout: 250000,
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
                    }
                })
                .then(response => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch(error => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Archivos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Archivos',
                            message: 'Ocurrió un error al intentar guardar la información (ARCHIVO DE BUFFER).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            } else {
                return reject({
                    status: 404,
                    module: 'Archivos',
                    message: 'No se encontró ningún archivo en la petición.'
                });
            }
        });
    }

    public postFiles(files: Express.Multer.File[], id: string, category: string, company: string): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            if(files && files.length > 0) {
                let formData = new FormData();
                try {
                    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA TURBO 9000:
                    // - Mutex no recibe ningún campo después del archivo, es decir, que cualquier valor que se desee
                    //   leer dentro del "body" debe ir antes del archivo.
                    formData.append('id', id);
                    formData.append('category', category);
                    formData.append('company', company);
                    files.forEach((file: Express.Multer.File) => {
                        // let { buffer, ...rest } = file;
                        // console.log(`[MODELOS][CONFIGURACIÓN][postFiles] Archivo: ${JSON.stringify(rest)}`);
                        formData.append('files', file.buffer, file.originalname);
                    });
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Archivos',
                        message: 'Ocurrió un error al intentar generar la forma de petición.',
                        error
                    });
                }
                axios.post(configuration.services.domain.files.postFiles, formData, { 
                    maxContentLength: Infinity,
                    timeout: 250000,
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
                    }
                })
                .then(response => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch(error => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Archivos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Archivos',
                            message: 'Ocurrió un error al intentar guardar la información (ARCHIVOS).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            } else {
                return reject({
                    status: 404,
                    module: 'Archivos',
                    message: 'No se encontró ningún archivo en la petición.'
                });
            }
        });
    }

    //DDDD  EEEEE L     EEEEE TTTTT EEEEE
    //D   D E     L     E       T   E
    //D   D EEE   L     EEE     T   EEE
    //D   D E     L     E       T   E
    //DDDD  EEEEE LLLLL EEEEE   T   EEEEE

    public deleteFiles(files: string[]): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            if(files && files.length > 0) {
                axios.delete(configuration.services.domain.files.deleteFiles, { params: { files }})
                .then(response => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch(error => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Archivos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Archivos',
                            message: 'Ocurrió un error al intentar eliminar la información.',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            } else {
                let error = {
                    code: 404,
                    module: 'Archivos',
                    message: 'No existe ningún archivo dentro de la petición.'
                };
                return reject(error);
            }
        });
    }
}