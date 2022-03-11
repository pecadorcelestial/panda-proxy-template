import idx from "idx";

export function userPermissions(user: any): Array<any> {
    // @ts-ignore
    let result: Array<any> = [];
    let permissions: any = idx(user, _ => _.permissions) || [];
    if(Array.isArray(permissions) && permissions.length > 0) {
        permissions.forEach((permission: any) => {
            // Módulo.
            let module: string = (idx(permission, _ => _.module[0].value) || '').toString();
            // Permisos.
            let _permissions: string = '';
            _permissions += idx(permission, _ => _.role[0].create) ? 'C' : '-';
            _permissions += idx(permission, _ => _.role[0].read) ? 'R' : '-';
            _permissions += idx(permission, _ => _.role[0].update) ? 'U' : '-';
            _permissions += idx(permission, _ => _.role[0].delete) ? 'D' : '-';
            _permissions += idx(permission, _ => _.role[0].approve) ? 'A' : '-';
            // Se agrega al arreglo.
            if(module != '') {
                result.push({
                    module,
                    permissions: _permissions
                });
            }
        });
    }
    return result;
}