export interface IIssuer {
    Rfc: string;
    Nombre: string;
    RegimenFiscal: string;
}

export interface IReceiver {
    Rfc: string;
    Nombre: string;
    NumRegIdTrib?: any;
    UsoCFDI: string;
}

export interface ITransferedTaxes {
    Base?: string;           // Número a 2 decimales.
    Impuesto: string;
    TipoFactor: string;
    TasaOCuota: string;     // Número a 6 decimales.
    Importe: string;        // Número a 2 decimales.
}

export interface ITaxes {
    Traslados: Array<ITransferedTaxes>;
    Retenciones?: any;
}

export interface IConcept {
    Impuestos?: ITaxes;
    InformacionAduanera?: any;
    CuentaPredial?: any;
    ComplementoConcepto?: any;
    Parte?: any;
    ClaveProdServ: string;
    NoIdentificacion?: string;
    Cantidad: number;
    ClaveUnidad: string;
    Unidad?: string;
    Descripcion: string;
    ValorUnitario: string;      // Número a 2 decimales.
    Importe: string;            // Número a 2 decimales.
    Descuento?: string;          // Número a 2 decimales.
}

export interface IConceptP {
    ClaveProdServ: string;
    Cantidad: number;
    ClaveUnidad: string;
    Descripcion: string;
    ValorUnitario: string;
    Importe: string;
}

export interface IRelatedDocuments {
    IdDocumento: string;
    Serie: string;
    Folio: string;
    MonedaDR: string;
    MetodoDePagoDR: string;
    TipoCambioDR?: string;
    NumParcialidad: string;
    ImpSaldoAnt: string;
    ImpPagado: string;
    ImpSaldoInsoluto: string;
}

export interface IPayment {
    FechaPago: string;
    FormaDePagoP: string;
    MonedaP: string;
    TipoCambioP?: string;
    Monto: string;
    DoctoRelacionado: Array<IRelatedDocuments>;
    RfcEmisorCtaOrd?: string;        // NOTE: Obligatorio se existe cuenta ordenante.
    NomBancoOrdExt?: string;
    RfcEmisorCtaBen?: string;
    CtaBeneficiario?: string;
    CtaOrdenante?: string;
}

export interface IComplement {
    HasElements: boolean;
    Any: Array<{
        "Pago10:Pagos": { Pago: Array<IPayment> }
    }>;
}

export interface IRelatedCFDIs {
    TipoRelacion: string;
    UUID: string;
}

export interface IJSON2Issue {
    Complemento?: Array<IComplement>;
    Addenda?: any;
    Version: string;
    Serie: string;
    Folio: string;
    Descuento?: string;
    Fecha: string;              // "2019-01-22T10:44:54",
    Sello: string;
    FormaPago?: string;
    NoCertificado: string;
    Certificado: string;
    CondicionesDePago?: any,
    SubTotal: string;           // Número a 2 decimales.
    Moneda: string;             // "MXN"
    TipoCambio: string;
    Total: string;              // Número a 2 decimales.
    TipoDeComprobante: string;  // "I", "E", "P"
    MetodoPago: string;         // "PUE", "PPD"
    HasComplemento: boolean;
    LugarExpedicion: string;    // "06300" ???
    CfdiRelacionados?: {
        TipoRelacion: string,
        CfdiRelacionado: Array<{ UUID: string }>
    };
    Emisor: IIssuer;
    Receptor: IReceiver;
    Conceptos: Array<IConcept> | Array<IConceptP>;
    Impuestos: {
        Retenciones?: any;
        Traslados: Array<ITransferedTaxes>;
        TotalImpuestosTrasladados: string;      // Número a 2 decimales.
    }
}

export interface IIssueResponse {
    data: {
        cadenaOriginalSAT: string;
        noCertificadoSAT: string;
        noCertificadoCFDI: string;
        uuid: string;
        selloSAT: string;
        selloCFDI: string;
        fechaTimbrado: string;
        qrCode: string;
        cfdi: string;
    },
    status: number;
}
