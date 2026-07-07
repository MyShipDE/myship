import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('vdr_settings')
export class TemplateVDR extends BaseEntity {

    @PrimaryGeneratedColumn() public id: number;
    @Column() public name?: string;
    @Column({type: "double"}) public loggingInterval?: number;
    @Column({type: "double"}) public idleTime?: number;
    @Column({type: "double"}) public radiusOfMovement?: number;
    @Column({type: "double"}) public reminderInterval?: number;
    @Column({type: "double"}) public allowedCourseChange?: number;
    @Column() active: boolean = false;
    @Column() central: boolean = false;

    constructor(name: string, loggingInterval?: number, idleTime?: number, radiusOfMovement?: number, reminderInterval?: number, allowedCourseChange?: number, central?: boolean) {
        super();
        this.name = name;
        this.loggingInterval = loggingInterval;
        this.idleTime = idleTime;
        this.radiusOfMovement = radiusOfMovement;
        this.reminderInterval = reminderInterval;
        this.allowedCourseChange = allowedCourseChange;
        this.central = central;
    }

}
