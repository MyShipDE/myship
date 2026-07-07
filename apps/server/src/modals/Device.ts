import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn, ManyToOne
} from "typeorm"
import {BridgeType} from "./BridgeType";
import {Bridge} from "./Bridge";

@Entity("devices")
export class Device extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column({default: null}) name: string;
    @Column({default: null}) identifier: string;
    @Column({default: null}) type: string;
    @Column({default: null}) isActive: boolean;
    @Column({default: false}) isHidden: boolean = false;
    @Column({default: null}) error: boolean;

    @ManyToOne(() => Bridge, (bridge: Bridge) => bridge.id)
    bridge: Bridge;
    
    @Column({default: null}) bridgePort: number;

    @Column({default: null}) SecurityBlock: number;
    @Column({default: null}) SecurityBlockPort: number;
    @Column({default: null}) SecurityBlockAmpere: number;
    @Column({default: null}) Voltage: string;
    @Column({default: null, type: "text"}) notes: string;
    @Column({default: null}) InstallationDate: Date;

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;

    @UpdateDateColumn({type: 'datetime'})
    updatedAt: Date;
}

