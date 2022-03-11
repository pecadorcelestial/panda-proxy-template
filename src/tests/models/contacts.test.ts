import moxios from 'moxios';
import ContactModel from '../../models/contacts';

// Respuestas.
import contactResponse from '../responses/contact.json';

// Peticiones.
import contactRequest from '../requests/contact.json';

describe('[MODELOS][CONTACTOS][ÉXITO]', () => {
	// Se inicializa el mock de peticiones asíncronas.
	beforeEach(() => {
		moxios.install();
	});
	// Se limpian los mocks después de cada petición.
	afterEach(() => {
		moxios.uninstall();
	});
	// Se crean las pruebas.
	it('GET - Debe obtener la información de todos los contactos existentes.', (done: jest.DoneCallback) => {
		// Se crea el ejemplo de la acción que se espera desencadenar.
		let model = new ContactModel();
        model.getContacts({})
        .then((data: any) => {
            expect(data).toEqual([contactResponse]);
        });
        // Se mantiene el mock a la espera de la petición.
        let response: Array<any> = [contactResponse];
		moxios.wait(async() => {
			const request = moxios.requests.mostRecent();
			await request.respondWith({
				status: 200,
				response
			});
			done();
		});
	});
	it('POST - Debe guardar la información de un contacto.', (done: jest.DoneCallback) => {
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new ContactModel();
        model.postContact(contactRequest)
        .then((data: any) => {
            expect(data).toEqual(contactResponse);
        });
        // Se mantiene el mock a la espera de la petición.
        let response: any = Object.assign({}, contactResponse);
        moxios.wait(async() => {
            const request = moxios.requests.mostRecent();
            await request.respondWith({
                status: 200,
                response
            });
            done();
        });
	});
	it('PUT - Debe actualizar la información de un contacto.', (done: jest.DoneCallback) => {
        // Resultado esperado.
        let response: any = Object.assign({}, contactResponse);
        response.name = 'Fulanito DeTal III';
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new ContactModel();
        model.putContact({ id: '5c9ba7fd867ae283bc2a6ef2', name: 'Fulanito DeTal III' })
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
	it('DELETE - Debe eliminar la información de un contacto.', (done: jest.DoneCallback) => {
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new ContactModel();
        model.putContact({ id: '5c914060d5b5242cb817c0c7' })
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