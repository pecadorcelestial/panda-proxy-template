// Módulos.
import axios from 'axios';
import idx from 'idx';
import builder from 'xmlbuilder';
// Modelos.
import AccountModel, { Account } from './accounts';
import { Address } from './addresses';
// Configuración.
import configuration from '../configuration';
// Funciones.
import { date2StringFormat } from '../scripts/dates';

export default class NineOneONeModel {
    
    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public post911Call(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { phone, ...rest }: { phone: string } & any = body;

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let account: Account = new Account();
            let address: Address = new Address();
            let accountModel: AccountModel = new AccountModel();
            try {
                account = await accountModel.getAccount({ phone });
                address = account.address as Address;
                // @ts-ignore
                let categoryValue: string = account.product.categoryValue || '';
                if(['TL102'].indexOf(categoryValue) < 0) {
                    return reject({
                        status: 400,
	                    module: 'Autenticación',
	                    message: 'La cuenta no pertenece a las categorías de telefonía.'
                    });
                }
                if(account.statusValue === 'inactive') {
                    return reject({
                        status: 400,
	                    module: 'Autenticación',
	                    message: 'La cuenta está inactiva.'
                    });
                }
            } catch(error) {
                return reject(error);
            }

            //DDDD  IIIII RRRR  EEEEE  CCCC  CCCC IIIII  OOO  N   N
            //D   D   I   R   R E     C     C       I   O   O NN  N
            //D   D   I   RRRR  EEE   C     C       I   O   O N N N
            //D   D   I   R   R E     C     C       I   O   O N  NN
            //DDDD  IIIII R   R EEEEE  CCCC  CCCC IIIII  OOO  N   N
    
            // 29/01/2020 13:00:58
            let registryDate: string = date2StringFormat(new Date(), 'DD/MM/YYYY hh:mm:ss');
            // TODO:
            // a) Valores por defecto si éste no existe.
            // b) ¿Fecha?
            let address2JSON: any = {
                ubicacion911: {
                    ubicacion: {
                        id_tel: {
                            '#text': phone
                        },
                        entidad: {
                            // @ts-ignore
                            '#text': (idx(address, _ => _.extraDetails.state.name) || '').toString()
                        },
                        ciudad_localidad: {
                            // @ts-ignore
                            '#text': (idx(address, _ => _.extraDetails.state.name) || '').toString()
                        },
                        del_mun: {
                            // @ts-ignore
                            '#text': (idx(address, _ => _.extraDetails.town.name) || '').toString()
                        },
                        colonia: {
                            // @ts-ignore
                            '#text': (idx(address, _ => _.extraDetails.name) || '').toString()
                        },
                        calle: {
                            '#text': address.street || ''
                        },
                        no_ext: {
                            '#text': address.outdoorNumber || ''
                        },
                        no_int: {
                            '#text': address.interiorNumber || ''
                        },
                        cp: {
                            '#text': address.zipCode || ''
                        },
                        fecha_registro: {
                            '#text': registryDate
                        },
                    }
                }
            };
            // Objeto XML.
            let xml: string = builder.create(address2JSON).end({ pretty: true});
            // console.log(xml);
            
            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T

            // TODO: Hacer llamada al API Rest de 911 (no tenemos información).
    
            return resolve({ xml });
        });
    }

}