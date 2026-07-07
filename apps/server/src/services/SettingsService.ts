import {BooleanDataRegistry} from "../classes/BooleanDataRegistry";
import {Setup} from "../modals/Setup";
import {Storage} from "../DatabaseProvider";
import {StringDataRegistry} from "../classes/StringDataRegistry";
import {NumberDataRegistry} from "../classes/NumberDataRegistry";
import {registerProperties} from "../resources/RegistryProperties";

export class SettingsService {

    private static _Instance: SettingsService;

    private constructor() {
        //
    }

    static get Instance() {
        if (this._Instance == null) {
            this._Instance = new this();
        }
        return this._Instance;
    }

    async boot(): Promise<void> {
        registerProperties();
        await this.pull();
        await this.push();
    }

    registerProperty<T>(name: string, value: T) {
        if (typeof value === 'boolean') {
            const registry = BooleanDataRegistry.register(name);
            registry.value = value;
        } else if (typeof value === 'string') {
            const registry = StringDataRegistry.register(name);
            registry.value = value;
        } else if (typeof value === 'number') {
            const registry = NumberDataRegistry.register(name);
            registry.value = value;
        }
    }

    findProperty<T>(name: string): BooleanDataRegistry | StringDataRegistry | NumberDataRegistry {
        if (BooleanDataRegistry.isExists(name)) {
            return BooleanDataRegistry.getByName(name);
        } else if (StringDataRegistry.isExists(name)) {
            return StringDataRegistry.getByName(name);
        } else if (NumberDataRegistry.isExists(name)) {
            return NumberDataRegistry.getByName(name);
        }
        return null;
    }

    async push() {
        for (const item of BooleanDataRegistry.items) {
            await this.save(item);
        }
        for (const item of StringDataRegistry.items) {
            await this.save(item);
        }
        for (const item of NumberDataRegistry.items) {
            await this.save(item);
        }
    }

    async pull() {
        for (const item of await Storage.getInstance().Setup.find()) {
            await this.get(item);
        }
    }

    async save(item: BooleanDataRegistry | StringDataRegistry | NumberDataRegistry) {
        let setupItem: Setup = await Storage.getInstance().Setup.findOneBy({name: item.name});
        if (setupItem == null) {
            setupItem = new Setup();
            setupItem.name = item.name;
        }

        if (typeof item.value === 'boolean') {
            setupItem.boolValue = item.value;
        } else if (typeof item.value === 'string') {
            setupItem.stringValue = item.value;
        } else if (typeof item.value === 'number') {
            setupItem.numericValue = item.value;
        }
        
        await setupItem.save();
    }

    async get(item: Setup): Promise<BooleanDataRegistry | StringDataRegistry | NumberDataRegistry> {
        if (await this.deleteIfNotExists(item)) {
            return null;
        }
        if (item.boolValue != null) {
            const registry = BooleanDataRegistry.getByName(item.name);
            registry.value = item.boolValue;
            return registry;
        } else if (item.stringValue != null) {
            const registry = StringDataRegistry.getByName(item.name);
            registry.value = item.stringValue;
            return registry;
        } else if (item.numericValue != null) {
            const registry = NumberDataRegistry.getByName(item.name);
            registry.value = item.numericValue;
            return registry;
        }
        return null;
    }

    async deleteIfNotExists(item: Setup) {
        if (!BooleanDataRegistry.isExists(item.name) && !StringDataRegistry.isExists(item.name) && !NumberDataRegistry.isExists(item.name)) {
            await item.remove();
            return true;
        }
        return false;
    }

}
