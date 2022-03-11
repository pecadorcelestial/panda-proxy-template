import moxios from 'moxios';
import AccountModel from '../../models/accounts';

// Respuestas.
import accountResponse from '../responses/account.json';

// Peticiones.
import accountRequest from '../requests/account.json';

describe('[MODELOS][SERVICIOS][ÉXITO]', () => {
	// Se inicializa el mock de peticiones asíncronas.
	beforeEach(() => {
		moxios.install();
	});
	// Se limpian los mocks después de cada petición.
	afterEach(() => {
		moxios.uninstall();
	});
	// Se crean las pruebas.
	it('GET - Debe obtener la información de todos los servicios existentes.', (done: jest.DoneCallback) => {
		// Se crea el ejemplo de la acción que se espera desencadenar.
		let model = new AccountModel();
        model.getAccounts({})
        .then((data: any) => {
            expect(data).toEqual([accountResponse]);
        });
        // Se mantiene el mock a la espera de la petición.
        // NOTE: Eliminar la dirección y los contactos del servicio.
        let response: Array<any> = [accountResponse];
		moxios.wait(async() => {
			const request = moxios.requests.mostRecent();
			await request.respondWith({
				status: 200,
				response
			});
			done();
		});
	});
})