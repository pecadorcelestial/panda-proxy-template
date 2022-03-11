import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import puppeteer, { PDFFormat } from 'puppeteer';
import configuration from '../configuration';

export function pdf2Base64(template: string, content: any, format: PDFFormat = "Letter"): Promise<any> {
    return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
        
        //EEEEE JJJJJ  SSSS
        //E       J   S
        //EEE     J    SSS
        //E     J J       S
        //EEEEE  J    SSSS

        let ejs2HTML: string = '';
        try {
            let template2ejs = fs.readFileSync(path.join(__dirname, template), 'ascii');
            // TODO: Esta URL debe moverse a los archivos de configuración.
            let publicPath: string = configuration.services.domain.public.images; // 'https://localhost:3001/public';
            content.publicPath = publicPath;
            ejs2HTML = ejs.render(template2ejs, content);
            // console.log(ejs2HTML);
        } catch(error) {
            return reject({
                status: 400,
                message: 'No se pudo leer la plantilla HTML.',
                error: error.toString()
            });
        }

        //PPPP  DDDD  FFFFF
        //P   P D   D F
        //PPPP  D   D FFF
        //P     D   D F
        //P     DDDD  F

        try {
            // Se lanza un Chrome "headless" en memoria.
            // NOTE: Esta función está lanzando un error al estar dentro de CentOS:
            /*
            No usable sandbox!
            */
            // https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md
            // NOTE: Para que el navegador pueda ser ejecutado en CentOS se requieren de las siguientes dependencias:
            /*
            alsa-lib.x86_64
            atk.x86_64
            cups-libs.x86_64
            gtk3.x86_64
            ipa-gothic-fonts
            libXcomposite.x86_64
            libXcursor.x86_64
            libXdamage.x86_64
            libXext.x86_64
            libXi.x86_64
            libXrandr.x86_64
            libXScrnSaver.x86_64
            libXtst.x86_64
            pango.x86_64
            xorg-x11-fonts-100dpi
            xorg-x11-fonts-75dpi
            xorg-x11-fonts-cyrillic
            xorg-x11-fonts-misc
            xorg-x11-fonts-Type1
            xorg-x11-utils
            https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix
            */
            // Instalación:
            // sudo yum install alsa-lib.x86_64 atk.x86_64 cups-libs.x86_64 gtk3.x86_64 ipa-gothic-fonts libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXrandr.x86_64 libXScrnSaver.x86_64 libXtst.x86_64 pango.x86_64 xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi xorg-x11-fonts-cyrillic xorg-x11-fonts-misc xorg-x11-fonts-Type1 xorg-x11-utils 
            const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
            // Se crea una nueva pestaña.
            const page = await browser.newPage();
            // Se asigna el contenido de la pagina creada.
            await page.setContent(ejs2HTML, { waitUntil: 'networkidle0' });
            // Se le dice a Chrome en qué modo presentar / emular el contenido.
            await page.emulateMedia('print');
            // Se crea el PDF a partir de la pagina anterior.
            const byteArray = await page.pdf({
                format,
                margin: { top: 0, right: 0, bottom: 0, left: 0 },
                landscape: false,
                scale: 1,
                printBackground: true
            });
            // Se cierra el navegador (se elimina de memoria).
            browser.close();
            // Se devuelve el resultado.
            return resolve({
                data: byteArray.toString('base64')
            });
        } catch(error) {
            console.error(error);
            return reject({
                status: 400,
                message: 'No se pudo crear un lienzo a partir del HTML.',
                error
            });
        }

    });
}