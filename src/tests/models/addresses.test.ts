import moxios from 'moxios';
import AddressModel from '../../models/addresses';

// Respuestas.
import addressResponse from '../responses/address.json';

// Peticiones.
import addressRequest from '../requests/address.json';

describe('[MODELOS][DIRECCIONES][ÉXITO]', () => {
	// Se inicializa el mock de peticiones asíncronas.
	beforeEach(() => {
		moxios.install();
	});
	// Se limpian los mocks después de cada petición.
	afterEach(() => {
		moxios.uninstall();
	});
	// Se crean las pruebas.
	it('GET - Debe obtener la información de todos las direcciones existentes.', (done: jest.DoneCallback) => {
		// Se crea el ejemplo de la acción que se espera desencadenar.
		let model = new AddressModel();
        model.getAddresses({})
        .then((data: any) => {
            expect(data).toEqual([addressResponse]);
        });
        // Se mantiene el mock a la espera de la petición.
        let response: Array<any> = [addressResponse];
		moxios.wait(async() => {
			const request = moxios.requests.mostRecent();
			await request.respondWith({
				status: 200,
				response
			});
			done();
		});
	});
	it('POST - Debe guardar la información de una dirección.', (done: jest.DoneCallback) => {
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new AddressModel();
        model.postAddress(addressRequest)
        .then((data: any) => {
            expect(data).toEqual(addressResponse);
        });
        // Se mantiene el mock a la espera de la petición.
        let response: any = Object.assign({}, addressResponse);
        moxios.wait(async() => {
            const request = moxios.requests.mostRecent();
            await request.respondWith({
                status: 200,
                response
            });
            done();
        });
	});
	it('PUT - Debe actualizar la información de una dirección.', (done: jest.DoneCallback) => {
        // Resultado esperado.
        let response: any = Object.assign({}, addressResponse);
        response.reference = 'Sobre la alberca de Aquarium.';
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new AddressModel();
        model.putAddress({ id: '5c914060d5b5242cb817c0c7', reference: 'Sobre la alberca de Aquarium.' })
        .then((data: any) => {
            expect(data).toEqual(response);
        });
        // Se mantiene el mock a la espera de la petición.
        moxios.wait(async() => {
            const request = moxios.requests.mostRecent();
            await request.respondWith({
                status: 200,
                response
            });
            done();
        });
	});
	it('DELETE - Debe eliminar la información de una dirección.', (done: jest.DoneCallback) => {
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new AddressModel();
        model.putAddress({ id: '5c914060d5b5242cb817c0c7' })
        .then((data: any) => {
            expect(data.message).toBe('Registro eliminado con éxito.');
        });
        // Se mantiene el mock a la espera de la petición.
        moxios.wait(async() => {
            const request = moxios.requests.mostRecent();
            await request.respondWith({
                status: 200,
                response: { message: 'Registro eliminado con éxito.' }
            });
            done();
        });
	});
})