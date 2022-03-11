import axios, { AxiosResponse } from 'axios';
import idx from 'idx';
import configuration from '../../configuration';

export default class VectormaxAPIsModel {

    // CCCC U   U EEEEE N   N TTTTT  AAA   SSSS
    //C     U   U E     NN  N   T   A   A S
    //C     U   U EEE   N N N   T   AAAAA  SSS
    //C     U   U E     N  NN   T   A   A     S
    // CCCC  UUU  EEEEE N   N   T   A   A SSSS

    public getAccounts = (query: any): Promise<any> => {
		return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.get(configuration.services.vectormax.apis.accounts.getAccounts, { params: query })
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    public getAccount = (query: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.get(configuration.services.vectormax.apis.accounts.getAccount, { params: query })
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    public postAccount = (body: any): Promise<any> => {
        	return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.post(configuration.services.vectormax.apis.accounts.postAccount, body)
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar guardar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    public putAccount = (body: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.put(configuration.services.vectormax.apis.accounts.putAccount, body)
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar actualizar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    public deleteAccount = (query: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.delete(configuration.services.vectormax.apis.accounts.deleteAccount, { params: query })
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar eliminar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    //U   U  SSSS U   U  AAA  RRRR  IIIII  OOO   SSSS
    //U   U S     U   U A   A R   R   I   O   O S
    //U   U  SSS  U   U AAAAA RRRR    I   O   O  SSS
    //U   U     S U   U A   A R   R   I   O   O     S
    // UUU  SSSS   UUU  A   A R   R IIIII  OOO  SSSS

    public getUsers = (query: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.get(configuration.services.vectormax.apis.accounts.getUsers, { params: query })
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    public postUser = (body: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.post(configuration.services.vectormax.apis.accounts.postUser, body)
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar guardar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    public putUser = (body: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.put(configuration.services.vectormax.apis.accounts.putUser, body)
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar actualizar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    public deleteUser = (query: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.delete(configuration.services.vectormax.apis.accounts.deleteUser, { params: query })
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar eliminar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    public getRoles = (query: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.get(configuration.services.vectormax.apis.roles.getRoles, { params: query })
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    // SSSS U   U  SSSS  CCCC RRRR  IIIII PPPP   CCCC IIIII  OOO  N   N EEEEE  SSSS
    //S     U   U S     C     R   R   I   P   P C       I   O   O NN  N E     S
    // SSS  U   U  SSS  C     RRRR    I   PPPP  C       I   O   O N N N EEE    SSS
    //    S U   U     S C     R   R   I   P     C       I   O   O N  NN E         S
    //SSSS   UUU  SSSS   CCCC R   R IIIII P      CCCC IIIII  OOO  N   N EEEEE SSSS

    public deleteSubscriptions = (query: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.delete(configuration.services.vectormax.apis.accounts.deleteSubscriptions, { params: query })
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar eliminar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    public postSubscription = (body: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.post(configuration.services.vectormax.apis.accounts.postSubscription, body)
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar guardar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    public deleteSubscription = (query: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.delete(configuration.services.vectormax.apis.accounts.deleteSubscription, { params: query })
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar eliminar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    public getSubscriptions = (query: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.get(configuration.services.vectormax.apis.subscriptions.getSubscriptions, { params: query })
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    //DDDD  IIIII  SSSS PPPP   OOO   SSSS IIIII TTTTT IIIII V   V  OOO   SSSS
    //D   D   I   S     P   P O   O S       I     T     I   V   V O   O S
    //D   D   I    SSS  PPPP  O   O  SSS    I     T     I   V   V O   O  SSS
    //D   D   I       S P     O   O     S   I     T     I    V V  O   O     S
    //DDDD  IIIII SSSS  P      OOO  SSSS  IIIII   T   IIIII   V    OOO  SSSS

    public postDevice = (body: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.post(configuration.services.vectormax.apis.accounts.postDevice, body)
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar guardar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    public deleteDevice = (query: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.delete(configuration.services.vectormax.apis.accounts.deleteDevice, { params: query })
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar eliminar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

    public getDevices = (query: any): Promise<any> => {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
			axios.get(configuration.services.vectormax.apis.devices.getDevices, { params: query })
            .then((response: any) => {
				return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
				if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
		});
    }

}