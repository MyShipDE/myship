import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    ManyToOne
} from "typeorm"
import {Bridge} from "./Bridge";

@Entity("electricity_consumptions")
export class ElectricityConsumption extends BaseEntity {

    @PrimaryGeneratedColumn() id: number;

    @Column({type: "double"}) counter: number;

    @ManyToOne(() => Bridge, (bridge: Bridge) => bridge.id)
    bridge: Bridge;

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;

}
