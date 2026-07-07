import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    OneToMany
} from "typeorm"
import {TrackRecord} from "./TrackRecord";

@Entity("tracks")
export class Track extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column({default: null}) name: string;
    @Column({default: null}) stopAt: Date;
    @Column({default: false}) isHidden: boolean = false;
    @Column({default: false}) isSaved: boolean = false;
    @Column({default: null}) identifier: string;
    @Column({default: null}) lastReminder: Date;

    @OneToMany(() => TrackRecord, (record) => record.track)
    records: TrackRecord[];

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;
}
