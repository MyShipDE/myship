import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm"

@Entity("clients")
export class Client extends BaseEntity {

    @PrimaryGeneratedColumn() id: number;
    @Column({default: null}) token: string;
    @Column({default: null}) uuid: string;
    @Column({default: null}) comment: string;
    @Column({default: null}) secret: string;
    @Column({default: null}) identifier: string;
    @Column({default: null}) isAdmin: boolean;
    @Column({default: null}) ip: string;
    @Column({default: null}) language: string;
    @Column({default: null}) platform: string;
    @Column({default: null}) osType: string;
    @Column({default: null}) osVersion: string;
    @Column({default: null}) name: string;
    @Column({default: null}) model: string;
    @Column({default: null}) manufacturer: string;

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;

    @UpdateDateColumn({type: 'datetime'})
    updatedAt: Date;

}
