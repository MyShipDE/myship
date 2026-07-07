import {DataRegistry} from "./DataRegistry";

export class StringDataRegistry extends DataRegistry {

    static items: StringDataRegistry[] = [];

    value: string;

    constructor() {
        super();
    }

    static register(name: string): StringDataRegistry {
        if (StringDataRegistry.getByName(name) != null) {
            return null;
        }
        const instance = new this();
        instance.name = name;
        StringDataRegistry.items.push(instance);
        return instance;
    }

    static getByName(name: string): StringDataRegistry {
        return StringDataRegistry.items.find((item) => item.name === name);
    }

    static isExists(name: string): boolean {
        return StringDataRegistry.items.find((item) => item.name === name) != null;
    }

}
