import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn, OneToMany, ManyToOne, OneToOne, JoinColumn
} from "typeorm"
import {TrackRecord} from "./TrackRecord";

@Entity("voice_entries")
export class VoiceEntry extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column({default: null}) message: string;
    @Column({default: false}) isSaved: boolean = false;

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;

    @UpdateDateColumn({type: 'datetime'})
    updatedAt: Date;

    @OneToOne(() => TrackRecord, (x: TrackRecord) => x.voiceEntry)
    record: TrackRecord;
}
