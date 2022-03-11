import * as express from 'express';
import http from 'http';
import configuration from '../configuration';

let mimeTypes = {
    css: 'text/css',
    gif: 'image/gif',
    html: 'text/html',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    js: 'application/javascript',
    pdf: 'application/pdf',
    png: 'image/png',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    xml: 'application/xml',
};

export class FileController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getFile(request: express.Request, response: express.Response):void {

        // NOTE: La función "download" devuelve un archivo local para su descarga.
        // response.download(`http://192.168.0.62:8084/uploads${request.path}`);

        // Opciones.
        let options = {
            method: 'GET',
            host: configuration.files.host,
            port: configuration.files.port,
            path: `/uploads${request.path}`
        };
        // Solicitud del archivo.
        let newRequest = http.request(options, (innerResponse: http.IncomingMessage) => {

            // SSSS TTTTT  AAA  TTTTT U   U  SSSS
            //S       T   A   A   T   U   U S
            // SSS    T   AAAAA   T   U   U  SSS
            //    S   T   A   A   T   U   U     S
            //SSSS    T   A   A   T    UUU  SSSS

            if(typeof innerResponse.statusCode === 'number' && innerResponse.statusCode >= 400) {
                response.writeHead(innerResponse.statusCode, {
                    'Content-Type': 'application/json'
                });
                return response.end(JSON.stringify({
                    status: innerResponse.statusCode,
                    message: 'Ocurrió un error al leer el archivo desde el repositorio remoto.'
                }));
            }

            let data: Array<any> = [];
            let result: Buffer;

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

            // TODO: Revisar qué pasa cuando se solicita el siguiente archivo:
            // /uploads/Domain/evidence/32587/32587. 2020.pdf
            innerResponse.on('end', () => {
                result = Buffer.concat(data);
                const extension = request.path.substr(request.path.lastIndexOf('.')).replace('.', '');
                let contentType: string = mimeTypes[extension];
                // NOTE: Se agrega un log para registrar el archivos solicitado cuando no tiene una extensión válida.
                // if(!contentType) {
                //     console.log('[MODULES][FILES][getFile] Archivo solicitado: ', request.path);
                // }
                response.writeHead(200, {
                    'Content-Type': contentType,
                    'Content-Disposition': 'attachment',
                    'Content-Length': result.length
                });
                return response.end(result);
            });

            //EEEEE RRRR  RRRR   OOO  RRRR
            //E     R   R R   R O   O R   R
            //EEE   RRRR  RRRR  O   O RRRR
            //E     R   R R   R O   O R   R
            //EEEEE R   R R   R  OOO  R   R

            innerResponse.on('error', (error: Error) => {
                response.writeHead(400, {
                    'Content-Type': 'application/json'
                });
                return response.end(JSON.stringify(error));
            });
        });
        // Error en la solicitud.
        newRequest.on('error', (error: Error) => {
            response.writeHead(400, {
                'Content-Type': 'application/json'
            });
            return response.end(JSON.stringify(error));
        })
        // Se debe terminar la solicitud para que comience... si, leíste bien.
        newRequest.end();
    }
}