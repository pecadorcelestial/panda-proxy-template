import idx from 'idx';
import configuration from '../configuration';
import { GoogleMapsClient, GeocodingResponseStatus, GeocodingResponse, GeocodingResult, AddressComponent } from '@google/maps';
import { ZipCodeModel } from './locations';
import { percentFound } from '../scripts/strings';

export default class GoogleModel {

    public getAddressFromCoordinates(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            // GGGG  OOO   OOO   GGGG L     EEEEE
            //G     O   O O   O G     L     E
            //G  GG O   O O   O G  GG L     EEE
            //G   G O   O O   O G   G L     E
            // GGGG  OOO   OOO   GGGG LLLLL EEEEE

            // Dirección.
            let { address } = query;
            // Cliente de los mapas de Google.
            const googleMapsClient: GoogleMapsClient = require('@google/maps').createClient({
                key: configuration.google.maps.clientID,
                Promise: Promise
            });
            // Se ejecuta la promesa.
            googleMapsClient.reverseGeocode({ latlng: `${address}`, result_type: 'street_address' })
                .asPromise()
                .then( async (geolocation: any) => {
                    // response.status(200).end(JSON.stringify(geolocation.json.results));
                    let resultsJSON: GeocodingResponse = geolocation.json;
                    // Si existen resultados, se busca el código postal.
                    if(resultsJSON) {
                        let status: GeocodingResponseStatus = resultsJSON.status;
                        if(status === 'OK') {
                            let results: Array<GeocodingResult> = resultsJSON.results;
                            let locations: Array<any> = [];
                            for(const result of results) {
                                if(result.types.indexOf('street_address') >= 0) {

                                    // CCCC  OOO  DDDD  IIIII  GGGG  OOO       PPPP   OOO   SSSS TTTTT  AAA  L
                                    //C     O   O D   D   I   G     O   O      P   P O   O S       T   A   A L
                                    //C     O   O D   D   I   G  GG O   O      PPPP  O   O  SSS    T   AAAAA L
                                    //C     O   O D   D   I   G   G O   O      P     O   O     S   T   A   A L
                                    // CCCC  OOO  DDDD  IIIII  GGGG  OOO       P      OOO  SSSS    T   A   A LLLLL
        
                                    let googleZipCodes: Array<AddressComponent> = result.address_components.filter((address: AddressComponent) => {
                                        // Código postal === 'postal_code'.
                                        // Colonia === 'sublocality' || 'sublocality_level_1'
                                        return address.types.indexOf('postal_code') >= 0;
                                    });

                                    // CCCC  AAA  L     L     EEEEE
                                    //C     A   A L     L     E
                                    //C     AAAAA L     L     EEE
                                    //C     A   A L     L     E
                                    // CCCC A   A LLLLL LLLLL EEEEE

                                    let streets: Array<AddressComponent> = result.address_components.filter((address: AddressComponent) => {
                                        // Calle === 'route'.
                                        return address.types.indexOf('route') >= 0;
                                    });
        
                                    // CCCC  OOO  L      OOO  N   N IIIII  AAA
                                    //C     O   O L     O   O NN  N   I   A   A
                                    //C     O   O L     O   O N N N   I   AAAAA
                                    //C     O   O L     O   O N  NN   I   A   A
                                    // CCCC  OOO  LLLLL  OOO  N   N IIIII A   A
        
                                    let googleSettlements: Array<AddressComponent> = result.address_components.filter((address: AddressComponent) => {
                                        // Código postal === 'postal_code'.
                                        // Colonia === 'sublocality' || 'sublocality_level_1'
                                        // Municipio === 'locality'
                                        return address.types.indexOf('sublocality') >= 0;
                                    });
        
                                    //U   U BBBB  IIIII  CCCC  AAA   CCCC IIIII  OOO  N   N
                                    //U   U B   B   I   C     A   A C       I   O   O NN  N
                                    //U   U BBBB    I   C     AAAAA C       I   O   O N N N
                                    //U   U B   B   I   C     A   A C       I   O   O N  NN
                                    // UUU  BBBB  IIIII  CCCC A   A  CCCC IIIII  OOO  N   N
        
                                    if(googleZipCodes.length > 0) {
                                        let zipCodesModel: ZipCodeModel = new ZipCodeModel();
                                        let zipCodes: Array<any>;
                                        try {
                                            zipCodes = await zipCodesModel.getZipCodes({ zipCode: googleZipCodes[0].long_name });
                                        } catch(error) {
                                            return reject(error);
                                        }
                                        if(Array.isArray(zipCodes) && zipCodes.length > 1) {
                                            // Existe más de una ubicación y se deben filtrar.
                                            if(googleSettlements.length > 0) {
                                                // Se busca por el nombre de la colonia y se da un peso a cada resultado.
                                                let filteredZipCodes: Array<any> = zipCodes.filter((_zipCode: any, _index: number) => {
                                                    let weight: number = percentFound(_zipCode.name, googleSettlements[0].long_name);
                                                    zipCodes[_index].weight = weight;
                                                    return weight > 0;
                                                });
                                                // Se ordena el arreglo por el peso calculado.
                                                filteredZipCodes.sort((a: any, b: any) => {
                                                    return b.weight - a.weight;
                                                });
                                                // Se devuelve la ubicación encontrada.
                                                // NOTE: Se agrega el nombre de la calle al resultado.
                                                let newLocation: any = filteredZipCodes[0];
                                                if(streets.length > 0) newLocation.street = streets[0].long_name;
                                                locations.push(newLocation);
                                            } else {
                                                // Si Google no devolvió el nombre de la colonia, se toma la primera ubicación del arreglo.
                                                // NOTE: Se agrega el nombre de la calle al resultado.
                                                let newLocation: any = zipCodes[0];
                                                if(streets.length > 0) newLocation.street = streets[0].long_name;
                                                locations.push(newLocation);
                                            }
                                        } else if(Array.isArray(zipCodes) && zipCodes.length === 1) {
                                            // Sólo existe un resultado y es el que se devuelve.
                                            // NOTE: Se agrega el nombre de la calle al resultado.
                                            let newLocation: any = zipCodes[0];
                                            if(streets.length > 0) newLocation.street = streets[0].long_name;
                                            locations.push(newLocation);
                                        } else {
                                            // No se encontró ninguna ubicación con el código postal de Google.
                                        }
                                    } else {
                                        // No se encontró ningún código postal dentro de los resultados de Google.
                                    }
                                }
                            }
                            resolve(locations);
                        } else {
                            return reject({
                                status: 404,
                                module: 'Google',
                                message: 'No se pudo obtener información desde el servicio de Google.',
                                error: resultsJSON.error_message || resultsJSON.status
                            });
                        }
                    }
                })
                .catch((error: any) => {
                    let message = (error.json != undefined && error.json.error_message != undefined) ? `Google | ${error.json.error_message}` : 'Google | Ocurrió un error al intentar obtener los datos de geolocalización.';
                    return reject({
                        status: 400,
                        message,
                        error
                    });
                });
        });
    }
}