import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn, ManyToMany, JoinTable
} from "typeorm"
import {LightGroup} from "./LightGroup";

@Entity("lights")
export class Light extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column({default: null}) name: string;
    @Column({default: null}) host: string;
    @Column({default: null}) isActive: boolean;
    @Column({default: null}) R: number;
    @Column({default: null}) G: number;
    @Column({default: null}) B: number;
    @Column({default: null}) BRI: number;

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;

    @UpdateDateColumn({type: 'datetime'})
    updatedAt: Date;
}
