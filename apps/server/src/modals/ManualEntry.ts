import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn, OneToMany, ManyToOne
} from "typeorm"
import {TrackRecord} from "./TrackRecord";

@Entity("manual_entries")
export class ManualEntry extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column({default: null}) name: string;
    @Column({default: null}) value: string;

    @ManyToOne(() => TrackRecord, record => record.id)
    record: TrackRecord;

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;
}
