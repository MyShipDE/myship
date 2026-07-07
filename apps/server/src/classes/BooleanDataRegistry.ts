import {DataRegistry} from "./DataRegistry";

export class BooleanDataRegistry extends DataRegistry {

    static items: BooleanDataRegistry[] = [];

    value: boolean;

    constructor() {
        super();
    }

    static register(name: string): BooleanDataRegistry {
        if (BooleanDataRegistry.getByName(name) != null) {
            return null;
        }
        const instance = new this();
        instance.name = name;
        BooleanDataRegistry.items.push(instance);
        return instance;
    }

    static getByName(name: string): BooleanDataRegistry {
        return BooleanDataRegistry.items.find((item) => item.name === name);
    }

    static isExists(name: string): boolean {
        return BooleanDataRegistry.items.find((item) => item.name === name) != null;
    }

}
