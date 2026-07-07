import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("track_data_keys")
export class TrackDataKey extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column() identifier: string;
    @Column({default: null}) description: string;
    @Column({default: false}) isSynced: boolean = false;
}