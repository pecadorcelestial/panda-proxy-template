// interface Object {
//     isEmpty(): boolean;
// }

// Object.prototype.isEmpty = function() {
//     // ¿Indefinido?
//     if (!this) return true;
//     // ¿Cadena vacía?
//     if (typeof this === 'string' && this.length === 0) return true;
//     // ¿Arreglo?
//     if (Array.isArray(this) && this.length === 0) return true;
//     // ¿Objeto?
// 	if (typeof this !== 'object') {
//         return true;
//     } else {
//         for(let key in this) {
//             if(this.hasOwnProperty(key)) return false;
//         }
//         return true;
//     }
// }

export const isEmpty = (_object: any) => {
    // ¿Indefinido?
    if (!_object) return true;
    // ¿Cadena vacía?
    if (typeof _object === 'string' && _object.length === 0) return true;
    // ¿Arreglo?
    if (Array.isArray(_object) && _object.length === 0) return true;
    // ¿Objeto?
    if (typeof _object !== 'object') {
        return true;
    } else {
        for(let key in _object) {
            if(_object.hasOwnProperty(key)) return false;
        }
        return true;
    }
}