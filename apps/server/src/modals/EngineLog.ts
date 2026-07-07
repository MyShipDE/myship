import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany, JoinTable, CreateDateColumn} from "typeorm"

@Entity("engine_logs")
export class EngineLog extends BaseEntity {

    @PrimaryGeneratedColumn() id: number;

    @Column() state: boolean;

    @Column() rpm: number;

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;

}
