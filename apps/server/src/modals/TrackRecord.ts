import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany, OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {Track} from "./Track";
import {TrackData} from "./TrackData";
import {VoiceEntry} from "./VoiceEntry";
import {ManualEntry} from "./ManualEntry";

@Entity("track_records")
export class TrackRecord extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Track, (track) => track.id)
    track: Track;

    @OneToMany(() => TrackData, (data) => data.record)
    data: TrackData[];

    @OneToOne(() => VoiceEntry, (voiceEntry: VoiceEntry) => voiceEntry.id)
    @JoinColumn({name: "voiceEntryId"})
    voiceEntry: VoiceEntry;

    @OneToMany(() => ManualEntry, (manualEntry: ManualEntry) => manualEntry.record)
    manualEntries: ManualEntry[]

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;
}