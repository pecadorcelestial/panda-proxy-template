import moxios from 'moxios';
import ModuleModel from '../../models/catalogs/modules';

// Respuestas.
import moduleResponse from '../responses/module.json';

// Peticiones.
import moduleRequest from '../requests/module.json';

describe('[MODELOS][MÓDULOS][ÉXITO]', () => {
	// Se inicializa el mock de peticiones asíncronas.
	beforeEach(() => {
		moxios.install();
	});
	// Se limpian los mocks después de cada petición.
	afterEach(() => {
		moxios.uninstall();
	});
	// Se crean las pruebas.
	it('GET - Debe obtener la información de todos los módulos existentes.', (done: jest.DoneCallback) => {
		// Se crea el ejemplo de la acción que se espera desencadenar.
		let model = new ModuleModel();
        model.getModules({})
        .then((data: any) => {
            expect(data).toEqual([moduleResponse]);
        });
        // Se mantiene el mock a la espera de la petición.
        let response: Array<any> = [moduleResponse];
		moxios.wait(async() => {
			const request = moxios.requests.mostRecent();
			await request.respondWith({
				status: 200,
				response
			});
			done();
		});
	});
	it('POST - Debe guardar la información de un módulo.', (done: jest.DoneCallback) => {
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new ModuleModel();
        model.postModule(moduleRequest)
        .then((data: any) => {
            expect(data).toEqual(moduleResponse);
        });
        // Se mantiene el mock a la espera de la petición.
        let response: any = Object.assign([], moduleResponse);
        moxios.wait(async() => {
            const request = moxios.requests.mostRecent();
            await request.respondWith({
                status: 200,
                response
            });
            done();
        });
	});
	it('PUT - Debe actualizar la información de un módulo.', (done: jest.DoneCallback) => {
        // Resultado esperado.
        let response: any = Object.assign({}, moduleResponse);
        response.name = 'Clientes';
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new ModuleModel();
        model.putModule({ id: '5c914060d5b5242cb817c0c7', name: 'Clientes' })
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
	it('DELETE - Debe eliminar la información de un módulo.', (done: jest.DoneCallback) => {
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new ModuleModel();
        model.deleteModule({ id: '5c914060d5b5242cb817c0c7' })
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