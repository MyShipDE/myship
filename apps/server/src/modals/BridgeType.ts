import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn, OneToMany
} from "typeorm"
import {Device} from "./Device";
import {Bridge} from "./Bridge";

@Entity("bridge_types")
export class BridgeType extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column({default: null}) identifier: string;
    @Column({default: null}) description: string;

    @OneToMany(() => Bridge, bridge => bridge.type)
    bridges: Bridge[];
}
