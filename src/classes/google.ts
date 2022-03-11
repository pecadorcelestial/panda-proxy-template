import GoogleMaps from '@google/maps';
import configuration from '../configuration';

export interface IAddress {
    street: string;
    outdoorNumber: string;
    interiorNumber?: string;
    settlement: string;
    town: string;
    state: string;
    country: string;
    zipCode: string;
}

export default class Google {

    constructor() {}

    public getCoordinatesFromAddress(address: IAddress): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // '1600 Amphitheatre Parkway, Mountain View, CA'
            // Calle+Nogal+121,+Arboledas,+76140+Santiago+de+Querétaro,+Qro
            let address2String: string = `${address.street} ${address.outdoorNumber}${address.interiorNumber ? ` ${address.interiorNumber}`: ''}, ${address.settlement}, ${address.zipCode} ${address.town}, ${address.state}, ${address.country}`;
            // console.log(`[CLASES][GOOGLE][getCoordinatesFromAddress][ÉXITO] Dirección: ${address2String}`);
            // Se solicitan las coordenadas al servidor.
            // a) Se crea el cliente de Google Maps.
            const googleMapsClient = GoogleMaps.createClient({
                key: configuration.google.maps.clientID, // 'AIzaSyAoW__RLW54OPYtpBVOYKxdz09CNiYwc7o',
                Promise: Promise
            });
            // b) Se ejecuta la promesa.
            googleMapsClient.geocode({ address: address2String })
            .asPromise()
            .then(geolocation => {
                // console.log('[CLASES][GOOGLE][getCoordinatesFromAddress][ÉXITO] Respuesta: ', geolocation.json.results);
                return resolve(geolocation.json.results);
            })
            .catch(exception => {
                // console.log('[CLASES][GOOGLE][getCoordinatesFromAddress][ERROR] Respuesta: ', exception.json);
                return reject({
                    message: 'No se pudo obtener información sobre la dirección.',
                    error: exception.json
                });
            });
        });
        
    }

}