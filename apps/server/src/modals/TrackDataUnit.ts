import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("track_data_units")
export class TrackDataUnit extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column() unit: string;
}