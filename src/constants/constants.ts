// GGGG EEEEE N   N EEEEE RRRR   AAA  L     EEEEE  SSSS
//G     E     NN  N E     R   R A   A L     E     S
//G  GG EEE   N N N EEE   RRRR  AAAAA L     EEE    SSS
//G   G E     N  NN E     R   R A   A L     E         S
// GGGG EEEEE N   N EEEEE R   R A   A LLLLL EEEEE SSSS

export const ACCOUNT_TYPE_PREFIXES = {
    microwave: '100',       // Microonda.
    fiber: '101',           // Fibra óptica.
    wireless: '102',        // Sin cables.
    microwavePhone: '103',  // Telefonía por microonda.
    fiberPhone: '104',      // Telefonía por fibra óptica.
    connectPlus: '105',     // CONNECT +
    other: '999'            // Otro (sin clasificar).
};
export const CATALOGS: Array<string> = ['account', 'address', 'client', 'contact','invoice', 'odx', 'payment', 'product', 'prospect', 'provider', 'quotation', 'receipt', 'schedule', 'user', 'warehouse', 'altan'];
export const CATALOGS_ES: Array<string> = ['cuenta', 'dirección', 'cliente', 'contacto','factura', 'orden', 'pago', 'producto', 'prospecto', 'proveedor', 'cotización', 'recibo', 'cita', 'almacén'];

//FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA   CCCC IIIII  OOO  N   N
//F     A   A C       T   U   U R   R A   A C       I   O   O NN  N
//FFF   AAAAA C       T   U   U RRRR  AAAAA C       I   O   O N N N
//F     A   A C       T   U   U R   R A   A C       I   O   O N  NN
//F     A   A  CCCC   T    UUU  R   R A   A  CCCC IIIII  OOO  N   N

export const CFDI_USE: Array<string> = ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'P01'];
/*
┌───────┬─────────────────────────────────────┐
│ Clave │ Descripción                         │
├───────┼─────────────────────────────────────┤
│   1   │ Efectivo                            │
│   2   │ Cheque nominativo                   │
│   3   │ Transferencia electrónica de fondos │
│   4   │ Tarjeta de crédito                  │
│   5   │ Monedero electrónico                │
│   6   │ Dinero electrónico                  │
│   8   │ Vales de despensa                   │
│  12   │ Dación en pago                      │
│  13   │ Pago por subrogación                │
│  14   │ Pago por consignación               │
│  15   │ Condonación                         │
│  17   │ Compensación                        │
│  23   │ Novación                            │
│  24   │ Confusión                           │
│  25   │ Remisión de deuda                   │
│  26   │ Prescripción o caducidad            │
│  27   │ A satisfacción del acreedor         │
│  28   │ Tarjeta de débito                   │
│  29   │ Tarjeta de servicios                │
│  30   │ Aplicación de anticipos             │
│  31   │ Intermediario pagos                 │
│  99   │ Por definir                         │
└───────┴─────────────────────────────────────┘
*/
export const PAYMENT_FORMS: Array<string> = ['01', '02', '03', '04', '05', '06', '08', '12', '13', '14', '15', '17', '23', '24', '25', '26', '27', '28', '29', '30', '31', '99'];
export const PAYMENT_METHODS: Array<string> = ['PPD', 'PUE'];
export const SERIES: Array<string> = ['A', 'E', 'I', 'P'];
export const VOUCHER_TYPES: Array<string> = ['I', 'E', 'P'];
export const RELATIONSHIP_TYPES: string[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];
// 001 = ISR.
// 002 = IVA.
export const TAX_TYPES: string[] = ['001', '002'];

//N   N  OOO  TTTTT IIIII FFFFF IIIII  CCCC  AAA   CCCC IIIII  OOO  N   N EEEEE  SSSS
//NN  N O   O   T     I   F       I   C     A   A C       I   O   O NN  N E     S
//N N N O   O   T     I   FFF     I   C     AAAAA C       I   O   O N N N EEE    SSS
//N  NN O   O   T     I   F       I   C     A   A C       I   O   O N  NN E         S
//N   N  OOO    T   IIIII F     IIIII  CCCC A   A  CCCC IIIII  OOO  N   N EEEEE SSSS

export const MERGE_LENGUAGES: Array<string> = ['mailchimp', 'handlebars'];
export const TO_TYPES: Array<string> = ['to', 'cc', 'bcc'];
