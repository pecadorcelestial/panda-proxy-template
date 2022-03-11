import { RouterOSClient, RosApiMenu, RosApiCommands } from 'routeros-client';
import configuration from '../../configuration';
// import MikroNode from 'mikronode';

// DEPENDENCIAS.
// rxjs ^5.3.0
// core-decorators

// Interfaces.

export interface IUser {
    $$path?: string;
    id?: string;
    customer?: string;
    actualProfile?: string;
    username: string;       // *
    password?: string;
    ipv6Dns?: string;
    sharedUsers?: string;
    wirelessPsk?: string;
    wirelessEncKey?: string;
    wirelessEncAlgo?: string;
    uptimeUsed?: string;
    lastSeen?: string;
    active?: boolean;
    incomplete?: boolean;
    disabled?: boolean;
    comment?: string;
}

export interface IProfile {
    $$path?: string;
    id?: string;
    name: string;
    owner: string;
    nameForUsers?: string;
    validity?: string;
    startsAt?: string;
    price?: number;
    overrideSharedUsers?: string;
}

export default class MikrotikAPIsModel {

    //U   U  SSSS U   U  AAA  RRRR  IIIII  OOO   SSSS
    //U   U S     U   U A   A R   R   I   O   O S
    //U   U  SSS  U   U AAAAA RRRR    I   O   O  SSS
    //U   U     S U   U A   A R   R   I   O   O     S
    // UUU  SSSS   UUU  A   A R   R IIIII  OOO  SSSS

    public getUsers(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Se define el dispositivo (servidor).
            const device: RouterOSClient = new RouterOSClient({
                host: configuration.services.mikrotik.device.host,
                port: configuration.services.mikrotik.device.port,
                user: configuration.services.mikrotik.device.user,
                password: configuration.services.mikrotik.device.password
            });
            // Se crea la conexión.
            device.connect().then((client: RosApiMenu) => {
                // Después de conectarse, la promesa devuelve una clase de tipo "client" para comenzar a trabajar.
                // Se pueden usar espacion (como en la terminal winbox) o usar la ruta completa.
                let userMenu: RosApiCommands = client.menu(configuration.services.mikrotik.apis.users.getInfo);
                userMenu.getAll().then((result: any) => {
                    device.close();
                    return resolve(result);
                }).catch((error: any) => {
                    device.close();
                    return reject(error);
                });
            }).catch((error) => {
                // Error de conexión.
                return reject(error);
            });
        });
    }

    /*
    router = Api(address='138.122.96.90', user='desarrollo', password='desarrollo.api2020', port=8728)
    get_message = [('/tool/user-manager/user/getall', '?username=7C:8B:CA:DD:F7:AA')]
    response = router.talk(get_message)
    set_message = [('/tool/user-manager/user/set', '=disabled=yes', '=.id={0}'.format(interface_id))]
    response = router.talk(set_message)
    */
    public getUser(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { username, ...rest }: { username: string} & any = query;
            if(!username) {
                return reject({
                    status: 400,
                    message: 'Debe enviar el nombre de usuario del dispositivo.'
                });
            }

            // Se define el dispositivo (servidor).
            const device: RouterOSClient = new RouterOSClient({
                host: configuration.services.mikrotik.device.host,
                port: configuration.services.mikrotik.device.port,
                user: configuration.services.mikrotik.device.user,
                password: configuration.services.mikrotik.device.password
            });
            // Se crea la conexión.
            device.connect().then((client: RosApiMenu) => {
                // Después de conectarse, la promesa devuelve una clase de tipo "client" para comenzar a trabajar.
                // Se pueden usar espacion (como en la terminal winbox) o usar la ruta completa.
                let userMenu: RosApiCommands = client.menu(configuration.services.mikrotik.apis.users.getInfo);
                userMenu.where('username', username).getAll().then((result: any) => {
                    device.close();
                    return resolve(result);
                }).catch((error: any) => {
                    device.close();
                    return reject(error);
                });
            }).catch((error) => {
                // Error de conexión.
                return reject(error);
            });
        });
    }

    public postUser(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // '/tool/user-manager/user/add',
            // '=customer=xe1uca',
            // '=username=50:D4:F7:E1:B3:C6',
            // '=password=',
            // '=copy-from=7C:8B:CA:DD:F7:AA'
            let { ...user }: IUser = body;
            // Se define el dispositivo (servidor).
            const device: RouterOSClient = new RouterOSClient({
                host: configuration.services.mikrotik.device.host,
                port: configuration.services.mikrotik.device.port,
                user: configuration.services.mikrotik.device.user,
                password: configuration.services.mikrotik.device.password
            });
            // Se crea la conexión.
            device.connect().then((client: RosApiMenu) => {
                let userMenu: RosApiCommands = client.menu(configuration.services.mikrotik.apis.users.postInfo);
                // TODO: Solo para pruebas, cambiar por "userInfo".
                userMenu.add(user).then((result: any) => {
                    device.close();
                    return resolve(result);
                }).catch((error: Error) => {
                    device.close();
                    let message: string = 'Ocurrió un error al intentar guardar la información.';
                    try {
                        message = error.message;
                    } catch(error) {}
                    return reject({ status: 400, error: message });
                });
            }).catch((error) => {
                // Error de conexión.
                return reject(error);
            });
        });
    }

    public putUser(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Por ahora sólo se van hacer operaciones somer el campo "username".
            let { username, ...user }: IUser = body;
            if(!username) {
                return reject({
                    status: 400,
                    message: 'Debe enviar el nombre de usuario del dispositivo.'
                });
            }
            // Se eliminan los campos inexistentes del objeto.
            Object.keys(user).forEach(key => user[key] === undefined ? delete user[key] : {});
            // Se define el dispositivo (servidor).
            const device: RouterOSClient = new RouterOSClient({
                host: configuration.services.mikrotik.device.host,
                port: configuration.services.mikrotik.device.port,
                user: configuration.services.mikrotik.device.user,
                password: configuration.services.mikrotik.device.password
            });
            // Se crea la conexión.
            device.connect().then((client: RosApiMenu) => {
                // Después de conectarse, la promesa devuelve una clase de tipo "client" para comenzar a trabajar.
                // Se pueden usar espacion (como en la terminal winbox) o usar la ruta completa.
                let userMenu: RosApiCommands = client.menu(configuration.services.mikrotik.apis.users.putInfo);
                userMenu.where('username', username).update(user).then((result: any) => {
                    device.close();
                    return resolve(result);
                }).catch((error: any) => {
                    device.close();
                    return reject(error);
                });
            }).catch((error) => {
                // Error de conexión.
                return reject(error);
            });
        });
    }

    //PPPP  EEEEE RRRR  FFFFF IIIII L     EEEEE  SSSS
    //P   P E     R   R F       I   L     E     S
    //PPPP  EEE   RRRR  FFF     I   L     EEE    SSS
    //P     E     R   R F       I   L     E         S
    //P     EEEEE R   R F     IIIII LLLLL EEEEE SSSS

    public getProfiles(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Se define el dispositivo (servidor).
            const device: RouterOSClient = new RouterOSClient({
                host: configuration.services.mikrotik.device.host,
                port: configuration.services.mikrotik.device.port,
                user: configuration.services.mikrotik.device.user,
                password: configuration.services.mikrotik.device.password
            });
            // Se crea la conexión.
            device.connect().then((client: RosApiMenu) => {
                // Después de conectarse, la promesa devuelve una clase de tipo "client" para comenzar a trabajar.
                // Se pueden usar espacion (como en la terminal winbox) o usar la ruta completa.
                let userMenu: RosApiCommands = client.menu(configuration.services.mikrotik.apis.profiles.getInfo);
                userMenu.getAll().then((result: any) => {
                    device.close();
                    return resolve(result);
                }).catch((error: any) => {
                    device.close();
                    return reject(error);
                });
            }).catch((error) => {
                // Error de conexión.
                return reject(error);
            });
        });
    }
    
    public postProfile(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { ...profile }: IProfile = body;
            // Se define el dispositivo (servidor).
            const device: RouterOSClient = new RouterOSClient({
                host: configuration.services.mikrotik.device.host,
                port: configuration.services.mikrotik.device.port,
                user: configuration.services.mikrotik.device.user,
                password: configuration.services.mikrotik.device.password
            });
            // Se crea la conexión.
            device.connect().then((client: RosApiMenu) => {
                let userMenu: RosApiCommands = client.menu(configuration.services.mikrotik.apis.profiles.postInfo);
                // TODO: Solo para pruebas, cambiar por "userInfo".
                userMenu.add(profile).then((result: any) => {
                    device.close();
                    return resolve(result);
                }).catch((error: Error) => {
                    device.close();
                    let message: string = 'Ocurrió un error al intentar guardar la información.';
                    try {
                        message = error.message;
                    } catch(error) {}
                    return reject({ status: 400, error: message });
                });
            }).catch((error) => {
                // Error de conexión.
                return reject(error);
            });
        });
    }

}