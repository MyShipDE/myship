import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {TrackDataKey} from "./TrackDataKey";
import {TrackDataUnit} from "./TrackDataUnit";
import {Track} from "./Track";
import {TrackRecord} from "./TrackRecord";

@Entity("track_data")
export class TrackData extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => TrackRecord, (record) => record.id)
    record: TrackRecord;

    @Column()
    identifierId: number;

    @ManyToOne(() => TrackDataKey, (key) => key.id)
    @JoinColumn({name: 'identifierId'})
    identifier: TrackDataKey;

    @Column()
    unitId: number;

    @ManyToOne(() => TrackDataUnit, (unit) => unit.id)
    @JoinColumn({name: 'unitId'})
    unit: TrackDataUnit;

    @Column({type: 'double'})
    value: number;
}