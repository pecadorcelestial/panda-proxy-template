export interface ILocation {
    _id: string;
    name: string;
    country: {
        _id: number;
        name: string;
    };
    state: {
        _id: number;
        name: string;
    },
    town: {
        _id: number;
        name: string;
    },
    settlement: {
        _id: number;
        name: string;
    },
    zipCode: number;
}