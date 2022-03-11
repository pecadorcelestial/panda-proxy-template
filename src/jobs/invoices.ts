import * as cron from 'node-cron';

cron.schedule('* * * * * *', async () => {
    // Pruebas.
    console.log(`[JOB][INVOICES] ${new Date()}`);
});