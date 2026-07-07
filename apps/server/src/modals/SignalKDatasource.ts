import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm"

@Entity("signalk_data")
export class SignalKDatasource extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column() name: string;
    @Column() path: string;
    @Column({default: null}) unit: string;
}
