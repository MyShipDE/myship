import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn, ManyToOne
} from "typeorm"
import {Alarm} from "./Alarm";

@Entity("alarm_protocols")
export class AlarmProtocol extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;

    @ManyToOne(() => Alarm, alarm => alarm.protocols)
    alarm: Alarm;

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;
}
