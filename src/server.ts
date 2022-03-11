//IIIII M   M PPPP   OOO  RRRR  TTTTT  SSSS
//  I   MM MM P   P O   O R   R   T   S
//  I   M M M PPPP  O   O RRRR    T    SSS
//  I   M   M P     O   O R   R   T       S
//IIIII M   M P      OOO  R   R   T   SSSS

// Módulos.
import * as cron from 'node-cron';
import fs from 'fs';
import http from 'http';
import https from 'https';
// Aplicación.
import app from './app';
// Modelos.
import AccountModel from './models/accounts';
import AccountProcessesModel from './models/processes/accounts';
import BalanceModel from './models/processes/balance';
import InvoiceModelV2 from './models/invoicesV2';

// CCCC EEEEE RRRR  TTTTT IIIII FFFFF IIIII  CCCC  AAA  DDDD   OOO
//C     E     R   R   T     I   F       I   C     A   A D   D O   O
//C     EEE   RRRR    T     I   FFF     I   C     AAAAA D   D O   O
//C     E     R   R   T     I   F       I   C     A   A D   D O   O
// CCCC EEEEE R   R   T   IIIII F     IIIII  CCCC A   A DDDD   OOO

//Comando para generar un CSR (Certificate Signing Request).
//openssl req -new -newkey rsa:2048 -nodes -keyout tudominio.key -out tudominio.csr

let httpsOptions = {
    key: fs.readFileSync(__dirname + '/certificate/domain.net.key', 'utf8'),
    cert: fs.readFileSync(__dirname + '/certificate/domain.net.crt', 'utf8'),
    ca: [
        fs.readFileSync(__dirname + '/certificate/bundle.crt', 'utf8')
    ]
};

const environment: string = process.env.NODE_ENV || 'development';
let PORT: number = 3000;
switch(environment.trim().toLowerCase()) {
    case 'qa':
        PORT = 3003;
        break;
    case 'staging':
        PORT = 3002;
        break;
    case 'production':
        PORT = 3001;
        break;
    case 'development':
    default:
        PORT = 3000;
        break;
}

// SSSS EEEEE RRRR  V   V IIIII DDDD   OOO  RRRR
//S     E     R   R V   V   I   D   D O   O R   R
// SSS  EEE   RRRR  V   V   I   D   D O   O RRRR
//    S E     R   R  V V    I   D   D O   O R   R
//SSSS  EEEEE R   R   V   IIIII DDDD   OOO  R   R

let httpServer = http.createServer(app);
let httpsServer = https.createServer(httpsOptions, app);

if(environment.trim().toLowerCase() === 'production') {

    //H   H TTTTT TTTTT PPPP   SSSS
    //H   H   T     T   P   P S
    //HHHHH   T     T   PPPP   SSS
    //H   H   T     T   P         S
    //H   H   T     T   P     SSSS

    httpsServer.listen(PORT, () => {
        const url = `https://0.0.0.0:${PORT}`;
        console.info('==========================================');
        console.info('Listening at: ', url);
        console.info('Running in: ', environment);
        console.info('Root folder: ', __dirname);
        console.info('==========================================');
    });
    httpsServer.timeout = 25000;
} else {

    //H   H TTTTT TTTTT PPPP   SSSS
    //H   H   T     T   P   P S
    //HHHHH   T     T   PPPP   SSS
    //H   H   T     T   P         S
    //H   H   T     T   P     SSSS

    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA TURBO 9000:
    // Se agrega esta línea de código para permitir peticiones con cualquier tipo de certificado.
    // Esto es SUPER PELIGROSO, utilícelo bajo su propio riesgo... Paco no se hace responsable por cualquier
    // daño causado o trauma adquirido por la siguiente línea.
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    httpServer.listen(PORT, () => {
        const url = `http://0.0.0.0:${PORT}`;
        console.info('==========================================');
        console.info('Listening at: ', url);
        console.info('Running in: ', environment);
        console.info('Root folder: ', __dirname);
        console.info('==========================================');
    });
    // httpServer.timeout = 25000;
}

//JJJJJ  OOO  BBBB   SSSS
//  J   O   O B   B S
//  J   O   O BBBB   SSS
//J J   O   O B   B     S
// J     OOO  BBBB  SSSS

// ┌────────────── second (optional)
// │ ┌──────────── minute
// │ │ ┌────────── hour
// │ │ │ ┌──────── day of month
// │ │ │ │ ┌────── month
// │ │ │ │ │ ┌──── day of week
// │ │ │ │ │ │
// │ │ │ │ │ │
// * * * * * *

// Auditoria de facturas canceladas.
// Debe ejecutarse todos los días a las 5 de la mañana, excepto el día primero (por la facturación).
// Monday,Tuesday,Wednesday,Thursday,Friday
cron.schedule('0 0 5 2-31 * *', async () => {
    // Ambiente.
    let environment: string = process.env.NODE_ENV || 'local';
    // Se revisa en cuál se está trabajando.
    if(environment === 'production') {
        console.log(`[JOB][INVOICES][STATUS] ${new Date()}`);
        let invoiceModelV2: InvoiceModelV2 = new InvoiceModelV2();
        try {
            await invoiceModelV2.auditInvoicesStatus({});
        } catch(error) {
            console.log('[JOB][INVOICES][STATUS] Error: ', error);
        }
    } else {
        // Pruebas.
        console.log(`[JOB][INVOICES][STATUS][DEVELOPMENT] ${new Date()}`);
    }
});

// Envío de correos por adeudo de más de un mes.
// Debe ejecutarse cada día 1 y 5 de mes.
cron.schedule('0 0 7 1,5 * *', async () => {
    // Ambiente.
    let environment: string = process.env.NODE_ENV || 'local';
    // Se revisa en cuál se está trabajando.
    if(environment === 'production') {
        let accountProcessesModel: AccountProcessesModel = new AccountProcessesModel();
        let today: Date = new Date();
        let previousMonth: Date = new Date(today.getFullYear(), today.getMonth() - 1);
        try {
            await accountProcessesModel.sendPastDueBalance({ dueDate: previousMonth });
        } catch(error) {
            console.log('[JOB][ACCOUNTS][DUE][BALANCE] Error: ', error);
        }
    } else {
        // Pruebas.
        console.log(`[JOB][ACCOUNTS][DUE][BALANCE][DEV] ${new Date()}`);
    }
});

// Envío de correos próximos a vencer.
// Debe ejecutarse cada día 20 y 28 de mes.
cron.schedule('0 0 7 20,28 * *', async () => {
    // Ambiente.
    let environment: string = process.env.NODE_ENV || 'local';
    // Se revisa en cuál se está trabajando.
    if(environment === 'production') {
        let accountProcessesModel: AccountProcessesModel = new AccountProcessesModel();
        let today: Date = new Date();
        try {
            await accountProcessesModel.sendClose2DueDate({ dueDate: today });
        } catch(error) {
            console.log('[JOB][ACCOUNTS][CLOSE 2 DUE DATE] Error: ', error);
        }
    } else {
        // Pruebas.
        console.log(`[JOB][ACCOUNTS][CLOSE 2 DUE DATE][DEV] ${new Date()}`);
    }
});

// Generación de recibos mensuales.
// Debe ejecutarse cada día 1ro.
cron.schedule('0 30 0 1 * *', async () => {
    // Ambiente.
    let environment: string = process.env.NODE_ENV || 'local';
    // Se revisa en cuál se está trabajando.
    if(environment === 'production') {
        let accountProcessesModel: AccountProcessesModel = new AccountProcessesModel();
        try {
            await accountProcessesModel.postAllAccountsReceipts({});
        } catch(error) {
            console.log('[JOB][ACCOUNTS][CREATE MONTHLY RECEIPTS] Error: ', error);
        }
    } else {
        // Pruebas.
        console.log(`[JOB][ACCOUNTS][CREATE MONTHLY RECEIPTS][DEV] ${new Date()}`);
    }
});

// Envío de formatos de OpenPay.
// Debe ejecutarse cada día 2.
/*
cron.schedule('0 30 0 2 * *', async () => {
    // Ambiente.
    let environment: string = process.env.NODE_ENV || 'local';
    // Se revisa en cuál se está trabajando.
    if(environment === 'production') {
        let accountProcessesModel: AccountProcessesModel = new AccountProcessesModel();
        try {
            await accountProcessesModel.sendAllAccountsOpenPayFormats({});
        } catch(error) {
            console.log('[JOB][ACCOUNTS][SEND MONTHLY OPENPAY] Error: ', error);
        }
    } else {
        // Pruebas.
        console.log(`[JOB][ACCOUNTS][SEND MONTHLY OPENPAY][DEV] ${new Date()}`);
    }
});
*/

// Activación de paquetes complementarios (exclusivo de paquetes Altán).
// Debe ejecutarse cada día 2.
cron.schedule('0 30 0 2 * *', async () => {
    // Ambiente.
    let environment: string = process.env.NODE_ENV || 'local';
    // Se revisa en cuál se está trabajando.
    if(environment === 'production') {
        let accountModel: AccountModel = new AccountModel();
        try {
            await accountModel.activateAllComplements({});
        } catch(error) {
            console.log('[JOB][ACCOUNTS][ACTIVATE COMPLEMENTS] Error: ', error);
        }
    } else {
        // Pruebas.
        console.log(`[JOB][ACCOUNTS][ACTIVATE COMPLEMENTS][DEV] ${new Date()}`);
    }
});

// Suspención de servicio de movilidad por adeudo de más de un mes.
// Debe ejecutarse cada día 5 de mes.
cron.schedule('0 0 7 5 * *', async () => {
    // Ambiente.
    let environment: string = process.env.NODE_ENV || 'local';
    // Se revisa en cuál se está trabajando.
    if(environment === 'production') {
        let accountProcessesModel: AccountProcessesModel = new AccountProcessesModel();
        let today: Date = new Date();
        let previousMonth: Date = new Date(today.getFullYear(), today.getMonth() - 1);
        try {
            await accountProcessesModel.suspendMobilityService({ dueDate: previousMonth });
        } catch(error) {
            console.log('[JOB][ACCOUNTS][SUSPEND][MOBILITY] Error: ', error);
        }
    } else {
        // Pruebas.
        console.log(`[JOB][ACCOUNTS][SUSPEND][MOBILITY][DEV] ${new Date()}`);
    }
});

// Reconstrucción de saldos.
// Debe ejecutarse de lunes a viernes a las 8 de la noche.
cron.schedule('0 0 20 * * 1-5', async () => {
// Ambiente.
let environment: string = process.env.NODE_ENV || 'local';
// Se revisa en cuál se está trabajando.
if(environment === 'production') {
    let balanceModel: BalanceModel = new BalanceModel();
    try {
        await balanceModel.putREbuildAllBalances({});
    } catch(error) {
        console.log('[JOB][BALANCE][REBUILD][ALL] Error: ', error);
    }
} else {
    // Pruebas.
    console.log(`[JOB][BALANCE][REBUILD][ALL][DEV] ${new Date()}`);
}
});

//PPPP  RRRR  U   U EEEEE BBBB   AAA   SSSS
//P   P R   R U   U E     B   B A   A S
//PPPP  RRRR  U   U EEE   BBBB  AAAAA  SSS
//P     R   R U   U E     B   B A   A     S
//P     R   R  UUU  EEEEE BBBB  A   A SSSS

// Envío de propaganda... debería ser bajo demanda pero la conexión local está de la ¡#%$&@!
/*
cron.schedule('0 30 11 24 12 *', async () => {
    // Ambiente.
    let environment: string = process.env.NODE_ENV || 'local';
    // Se revisa en cuál se está trabajando.
    if(environment === 'production') {
        let clientProcessesModel: ClientProcessesModel = new ClientProcessesModel();
        try {
            await clientProcessesModel.sendAdvertising({
                template: 'navidadIentc2019', // buenFin2019_ecarNetworks', // 'buenFin2019_movilidad',
                content: [],
                subject: 'Domain te desea Felices Fiestas', // ECAR Networks | Buen Fin'
            });
        } catch(error) {
            console.log('[JOB][CLIENTS][SEND ADVERTISING] Error: ', error);
        }
    } else {
        // Pruebas.
        console.log(`[JOB][CLIENTS][SEND ADVERTISING][DEV] ${new Date()}`);
    }
});
*/