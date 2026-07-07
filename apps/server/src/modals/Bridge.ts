import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn, ManyToOne, OneToMany
} from "typeorm"
import {BridgeType} from "./BridgeType";
import {Device} from "./Device";

@Entity("bridges")
export class Bridge extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column({default: null}) name: string;
    @Column({default: null}) ip: string;
    @Column({default: 0}) totalConsumption: number;

    @ManyToOne(() => BridgeType, (bridgeType: BridgeType) => bridgeType.id)
    type: BridgeType;

    @OneToMany(() => Device, device => device.bridge)
    devices: Device[];

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;

    @UpdateDateColumn({type: 'datetime'})
    updatedAt: Date;
}
