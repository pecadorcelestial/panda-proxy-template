import moxios from 'moxios';
import RoleModel from '../../models/catalogs/roles';

// Respuestas.
import roleResponse from '../responses/role.json';

// Peticiones.
import roleRequest from '../requests/role.json';

describe('[MODELOS][DEPARTAMENTOS][ÉXITO]', () => {
	// Se inicializa el mock de peticiones asíncronas.
	beforeEach(() => {
		moxios.install();
	});
	// Se limpian los mocks después de cada petición.
	afterEach(() => {
		moxios.uninstall();
	});
	// Se crean las pruebas.
	it('GET - Debe obtener la información de todos los roles existentes.', (done: jest.DoneCallback) => {
		// Se crea el ejemplo de la acción que se espera desencadenar.
		let model = new RoleModel();
        model.getRoles({})
        .then((data: any) => {
            expect(data).toEqual([roleResponse]);
        });
        // Se mantiene el mock a la espera de la petición.
        let response: Array<any> = [roleResponse];
		moxios.wait(async() => {
			const request = moxios.requests.mostRecent();
			await request.respondWith({
				status: 200,
				response
			});
			done();
		});
	});
	it('POST - Debe guardar la información de un rol.', (done: jest.DoneCallback) => {
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new RoleModel();
        model.postRole(roleRequest)
        .then((data: any) => {
            expect(data).toEqual(roleResponse);
        });
        // Se mantiene el mock a la espera de la petición.
        let response: any = Object.assign([], roleResponse);
        moxios.wait(async() => {
            const request = moxios.requests.mostRecent();
            await request.respondWith({
                status: 200,
                response
            });
            done();
        });
	});
	it('PUT - Debe actualizar la información de un rol.', (done: jest.DoneCallback) => {
        // Resultado esperado.
        let response: any = Object.assign({}, roleResponse);
        response.name = 'user';
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new RoleModel();
        model.putRole({ id: '5c914060d5b5242cb817c0c7', name: 'user' })
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
	it('DELETE - Debe eliminar la información de un rol.', (done: jest.DoneCallback) => {
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new RoleModel();
        model.deleteRole({ id: '5c914060d5b5242cb817c0c7' })
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