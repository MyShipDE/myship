import {DataRegistry} from "./DataRegistry";

export class NumberDataRegistry extends DataRegistry {

    static items: NumberDataRegistry[] = [];

    value: number;

    constructor() {
        super();
    }

    static register(name: string): NumberDataRegistry {
        if (NumberDataRegistry.getByName(name) != null) {
            return null;
        }
        const instance = new this();
        instance.name = name;
        NumberDataRegistry.items.push(instance);
        return instance;
    }

    static getByName(name: string): NumberDataRegistry {
        return NumberDataRegistry.items.find((item) => item.name === name);
    }

    static isExists(name: string): boolean {
        return NumberDataRegistry.items.find((item) => item.name === name) != null;
    }

}
