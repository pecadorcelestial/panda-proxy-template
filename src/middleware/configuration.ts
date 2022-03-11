import * as express from 'express';
import configuration from '../configuration';

let mimeTypes: { [key: string]: string } = {
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
};

export default class AppConfiguration {
    public setResponseHeaders(app: express.Application): void {
        app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
            // Sitios a los que se desea dar acceso.
            let allowedOrigins: Array<string> = configuration.security.cors;
            // @ts-ignore
            let origin: string = request.get('origin');
            if(allowedOrigins.indexOf(origin) > -1) {
                response.setHeader('Access-Control-Allow-Origin', origin);
            }
            // Tipo de solicitudes que se van a permitir.
            response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
            // Encabezados de solicitudes permitidas.
            response.setHeader('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, Origin, X-PINGOTHER, X-Requested-With, Z-User-Agent');
            // Ajustar a 'True' si se desea que el sitio incluya cookies en las solicitudes enviadas al sitio a través del API.
            // P. ej.: si se usan sesiones.
            response.setHeader('Access-Control-Allow-Credentials', 'true');
            // Tipo de contenido.
            // Se debe diferenciar entre petición de un archivo y de información.
            let path: string = request.path;
            let pathParts: Array<string> = path.split('.');
            let extension: string | undefined = (Array.isArray(pathParts) && pathParts.length > 0) ? pathParts[pathParts.length - 1] : undefined;
            let contentType: string = extension ? (mimeTypes[extension] || 'application/json') : 'application/json';
            response.setHeader('Content-Type', contentType);
            // OPTIONS.
            // Permitir verificación previa.
            if(request.method === 'OPTIONS') {
                response.sendStatus(200);
            } else {
                next();
            }
            // Continuamos con el siguiente middleware.
            // next();
        });
    }
    public unhandledRejection(): void {
        process.on('unhandledRejection', (reason, promise) => {
            console.error('[SERVER][APP][Unhandled Rejection] At:', promise, 'reason:', JSON.stringify(reason));
        });
    }
}