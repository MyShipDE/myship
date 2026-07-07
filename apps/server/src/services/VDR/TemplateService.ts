import {TemplateVDR} from "../../modals/TemplateVDR";
import {Storage} from "../../DatabaseProvider";

export class TemplateService {

    private static _Instance: TemplateService;

    centralTemplates: TemplateVDR[] = [
        new TemplateVDR('Regatta', 20, 10, 10, 120, 6, true),
        new TemplateVDR('Inshore', 300, 10, 10, 60, 10, true),
        new TemplateVDR('Offshore', 3600, 100, 50, 120, 20, true),
    ];

    customTemplates: TemplateVDR[] = [
        new TemplateVDR('Benutzerdefiniert', 60, 10, 5, 30, 8, false),
    ];

    async EnsureTemplatesExists(): Promise<void> {

        // Ensure if all Central-Templates exists
        for (const template of this.centralTemplates) {
            if (!(await Storage.getInstance().TemplateVDR.exist({where: {name: template.name}}))) {
                await template.save();
            }
        }

        // Ensure if all Custom-Templates exists
        for (const template of this.customTemplates) {
            if (!(await Storage.getInstance().TemplateVDR.exist({where: {name: template.name}}))) {
                await template.save();
            }
        }

        const templates = await Storage.getInstance().TemplateVDR.find();

        for (const template of templates) {
            const item = this.centralTemplates.find(x => x.name === template.name);

            if (item != null) {
                template.reminderInterval = item.reminderInterval;
                template.allowedCourseChange = item.allowedCourseChange;
                template.idleTime = item.idleTime;
                template.loggingInterval = item.loggingInterval;
                template.radiusOfMovement = item.radiusOfMovement;
                await template.save();
            } else if (template.central) {
                await template.remove();
            }
        }

        for (const template of templates) {
            const item = this.customTemplates.find(x => x.name === template.name);

            if (item == null && !template.central) {
                await template.remove();
            }
        }

        await this.EnsureOnlyOneActive();
    }

    async EnsureOnlyOneActive() {
        const templates = await Storage.getInstance().TemplateVDR.find();
        const activeTemplates = templates.filter(x => x.active);

        if (activeTemplates.length < 1) {
            templates[0].active = true;
            await templates[0].save();
        } else if (activeTemplates.length > 1) {
            templates.map(async (template: TemplateVDR) => {
                template.active = false;
                await template.save();
            });
            templates[1].active = true;
            await templates[1].save();
        }
    }

    async GetActive(): Promise<TemplateVDR> {
        return await Storage.getInstance().TemplateVDR.findOneBy({active: true});
    }

    public static getInstance(): TemplateService {
        if (this._Instance == null) this._Instance = new TemplateService();
        return this._Instance;
    }

}
