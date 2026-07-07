import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm"

@Entity("batteryLogs")
export class BatteryLog extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column({default: null}) voltage: number;
    @Column({default: null}) current: number;
    @Column({default: null}) state: number;
    @Column({default: null}) remaining: number;

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;

    @UpdateDateColumn({type: 'datetime'})
    updatedAt: Date;
}
