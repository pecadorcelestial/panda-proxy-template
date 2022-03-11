import { capitalize as Capitalize } from './strings';

/**
 * Crea una cadena "query" a partir de los parámetros enviados.
 *
 * @export
 * @param {*} parameters
 * @returns {string}
 */
export function buildQuery(parameters: any): string {
    let result: string = '';
    let keys: string[] = Object.keys(parameters);
    if(keys && keys.length > 0) {
        let entries: [string, {}][] = Object.entries(parameters);
        for(const [key, value] of entries) {
            result += `${(result === '' ? '?' : '&')}${key}=${value}`
        }
    }
    return result;
}

export function getFieldNameInSpanish(name: string, capitalize: boolean = false): string {
    let nameInSpanish: string = '';
    switch(name) {
        // case 'accountNumber':
        case 'account':
            nameInSpanish = 'número de cuenta';
			break;
        case 'statusValue':
            nameInSpanish = 'estatus';
			break;
        case 'typeValue':
            nameInSpanish = 'tipo';
			break;
        case 'quantity':
            nameInSpanish = 'cantidad';
			break;
        case 'productName':
            nameInSpanish = 'nombre de producto';
			break;
        case 'productId':
            nameInSpanish = 'identificador del catálogo padre';
			break;
        case 'phone':
            nameInSpanish = 'teléfono';
			break;
        case 'isItLoan':
            nameInSpanish = 'es comodato';
			break;
        case 'clientId':
            nameInSpanish = 'identificador del cliente';
			break;
        case 'invoiceRequired':
            nameInSpanish = 'facturación requerida';
			break;
        case 'breakdownType':
            nameInSpanish = 'tipo de desglose';
			break;
        case 'unitCost':
            nameInSpanish = 'precio unitario';
			break;
        case 'total':
            nameInSpanish = 'total';
			break;
        case 'subTotal':
            nameInSpanish = 'subtotal';
			break;
        case 'taxes':
            nameInSpanish = 'impuestos';
			break;
        case 'discount':
            nameInSpanish = 'descuento';
			break;
        case 'paymentReferences':
            nameInSpanish = 'referencias de pago';
			break;
        case 'isMaster':
            nameInSpanish = 'es cuenta maestra';
			break;
        case 'masterReference':
            nameInSpanish = 'referencia a cuenta maestra';
			break;
        case 'satProductCode':
            nameInSpanish = 'código del produco ante el SAT';
			break;
        case 'languageValue':
            nameInSpanish = 'lenugaje';
			break;
        case 'isForcedTerm':
            nameInSpanish = 'es plazo forzoso';
			break;
        case 'forcedTermValue':
            nameInSpanish = 'plazo forzoso';
			break;
        case 'pendingTerms':
            nameInSpanish = 'plazo pendiente';
			break;
        case 'activatedAt':
            nameInSpanish = 'fecha de activación';
			break;
        case 'serviceStatus':
            nameInSpanish = 'estatus del servicio';
			break;
        case 'legacyId':
            nameInSpanish = 'identificador anterior';
			break;
        case 'comments':
            nameInSpanish = 'comentarios';
			break;
        case 'folio':
            nameInSpanish = 'folio';
			break;
        case 'firstName':
            nameInSpanish = 'nombre';
			break;
        case 'secondName':
            nameInSpanish = 'segundo nombre';
			break;
        case 'firstLastName':
            nameInSpanish = 'apellido paterno';
			break;
        case 'secondLastName':
            nameInSpanish = 'apellido materno';
			break;
        case 'priorityValue':
            nameInSpanish = 'prioridad';
			break;
        case 'avoidSuspension':
            nameInSpanish = 'evitar suspención';
			break;
        case 'businessData':
            nameInSpanish = 'datos del negocio';
			break;
        case 'accountingData':
            nameInSpanish = 'datos de cuenta';
			break;
        case 'personalData':
            nameInSpanish = 'datos personales';
			break;
        case 'files':
            nameInSpanish = 'archivos';
			break;
        case 'startedAt':
            nameInSpanish = 'fecha de inicio';
			break;
        case 'finishedAt':
            nameInSpanish = 'fecha de término';
			break;
        case 'evidence':
            nameInSpanish = 'evidencia';
			break;
        case 'technicalUser':
            nameInSpanish = 'técnico asignado';
			break;
        case 'supportUser':
            nameInSpanish = 'personal de soporte asignado';
			break;
        case 'chargeDetails':
            nameInSpanish = 'detalle de cargos';
			break;
        case 'installedEquipment':
            nameInSpanish = 'equipo instalado';
			break;
        case 'createdBy':
            nameInSpanish = 'usuario que creo';
			break;
        case 'code':
            nameInSpanish = 'código';
			break;
        case 'name':
            nameInSpanish = 'nombre';
			break;
        case 'description':
            nameInSpanish = 'descripción';
			break;
        case 'minStock':
            nameInSpanish = 'inventario mínimo';
			break;
        case 'model':
            nameInSpanish = 'modelo';
			break;
        case 'brandValue':
            nameInSpanish = 'marca';
			break;
        case 'categoryValue':
            nameInSpanish = 'categoría';
			break;
        case 'specifications':
            nameInSpanish = 'especificaciones';
			break;
        case 'price':
            nameInSpanish = 'precio';
			break;
        case 'prefix':
            nameInSpanish = 'prefijo';
			break;
        case 'alert':
            nameInSpanish = 'alerta';
			break;
        case 'isBundle':
            nameInSpanish = 'es paquete';
			break;
        case 'bundle':
            nameInSpanish = 'paquete';
			break;
        case 'relatedTo':
            nameInSpanish = 'relacionado con';
			break;
        default:
            break;
    }
    if(capitalize) nameInSpanish = Capitalize(nameInSpanish);
    return nameInSpanish;
}