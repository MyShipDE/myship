import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity("engine_hour_meter_records")
export class EngineHourMeterRecord extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;

    @Column({type: 'datetime', update: false})
    startAt: Date;

    @Column({type: 'datetime', default: null})
    stopAt?: Date;
}
