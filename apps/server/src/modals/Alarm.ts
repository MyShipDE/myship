import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn, ManyToOne, OneToMany
} from "typeorm"
import {SignalKDatasource} from "./SignalKDatasource";
import {AlarmProtocol} from "./AlarmProtocol";

@Entity("alarms")
export class Alarm extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column() name: string;
    @Column() interval: number;

    @Column({default: null}) email: string;
    @Column({default: null}) phone: string;
    @Column({default: false}) showInApp: boolean = false;

    @Column({type: "double"}) minValue: number;
    @Column({type: "double"}) maxValue: number;
    @Column({default: null}) customMailMessage: string;
    @Column({default: null}) lastCheck: Date;
    @Column({default: false}) active: boolean = false;
    @Column({default: false}) reached: boolean = false;

    @Column({default: false}) logging: boolean = false;
    @OneToMany(() => AlarmProtocol, protocol => protocol.alarm)
    protocols: AlarmProtocol[];

    @ManyToOne(() => SignalKDatasource, (signalKDatasource: SignalKDatasource) => signalKDatasource.id)
    signalKDatasource: SignalKDatasource;
}
