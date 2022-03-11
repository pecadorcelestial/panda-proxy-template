import moxios from 'moxios';
import DepartmentModel from '../../models/catalogs/departments';

// Respuestas.
import departmentResponse from '../responses/department.json';

// Peticiones.
import departmentRequest from '../requests/department.json';

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
	it('GET - Debe obtener la información de todos los departamentos existentes.', (done: jest.DoneCallback) => {
		// Se crea el ejemplo de la acción que se espera desencadenar.
		let model = new DepartmentModel();
        model.getDepartments({})
        .then((data: any) => {
            expect(data).toEqual([departmentResponse]);
        });
        // Se mantiene el mock a la espera de la petición.
        let response: Array<any> = [departmentResponse];
		moxios.wait(async() => {
			const request = moxios.requests.mostRecent();
			await request.respondWith({
				status: 200,
				response
			});
			done();
		});
	});
	it('POST - Debe guardar la información de un departamento.', (done: jest.DoneCallback) => {
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new DepartmentModel();
        model.postDepartment(departmentRequest)
        .then((data: any) => {
            expect(data).toEqual(departmentResponse);
        });
        // Se mantiene el mock a la espera de la petición.
        let response: any = Object.assign({}, departmentResponse);
        moxios.wait(async() => {
            const request = moxios.requests.mostRecent();
            await request.respondWith({
                status: 200,
                response
            });
            done();
        });
	});
	it('PUT - Debe actualizar la información de un departamento.', (done: jest.DoneCallback) => {
        // Resultado esperado.
        let response: any = Object.assign({}, departmentResponse);
        response.name = 'RH';
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new DepartmentModel();
        model.putDepartment({ id: '5c914060d5b5242cb817c0c7', name: 'RH' })
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
	it('DELETE - Debe eliminar la información de un departamento.', (done: jest.DoneCallback) => {
        // Se crea el ejemplo de la acción que se espera desencadenar.
        let model = new DepartmentModel();
        model.deleteDepartment({ id: '5c914060d5b5242cb817c0c7' })
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