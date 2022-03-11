import moxios from 'moxios';
import UserModel from '../../models/users';

// Respuestas.
import userResponse from '../responses/user.json';

// Peticiones.
import userRequest from '../requests/user.json';

describe('[MODELOS][USUARIOS][ÉXITO]', () => {
	// Se inicializa el mock de peticiones asíncronas.
	beforeEach(() => {
		moxios.install();
	});
	// Se limpian los mocks después de cada petición.
	afterEach(() => {
		moxios.uninstall();
	});
	// Se crean las pruebas.
	it('GET - Debe obtener la información de todos los usuarios existentes.', (done: jest.DoneCallback) => {
		// Se crea el ejemplo de la acción que se espera desencadenar.
		let model = new UserModel();
        model.getUsers({})
        .then((data: any) => {
            expect(data).toEqual([userResponse]);
        });
        // Se mantiene el mock a la espera de la petición.
        let response: Array<any> = [userResponse];
		moxios.wait(async() => {
			const request = moxios.requests.mostRecent();
			await request.respondWith({
				status: 200,
				response
			});
			done();
		});
	});
	it('POST - Debe guardar la información de un usuario.', (done: jest.DoneCallback) => {
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new UserModel();
        model.postUser(userRequest)
        .then((data: any) => {
            expect(data).toEqual(userResponse);
        });
        // Se mantiene el mock a la espera de la petición.
        let response: any = Object.assign({}, userResponse);
        moxios.wait(async() => {
            const request = moxios.requests.mostRecent();
            await request.respondWith({
                status: 200,
                response
            });
            done();
        });
	});
	it('PUT - Debe actualizar la información de un usuario.', (done: jest.DoneCallback) => {
        // Resultado esperado.
        let response: any = Object.assign({}, userResponse);
        response.firstName = 'Fulanito';
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new UserModel();
        model.putUser({ id: '5c914060d5b5242cb817c0c7', firstName: 'Fulanito' })
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
	it('DELETE - Debe eliminar la información de un usuario.', (done: jest.DoneCallback) => {
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new UserModel();
        model.deleteUser({ id: '5c914060d5b5242cb817c0c7' })
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