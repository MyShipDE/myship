import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm"

@Entity("scenes")
export class Scene extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column({default: null}) name: string;
    @Column({default: null}) R: number;
    @Column({default: null}) G: number;
    @Column({default: null}) B: number;
    @Column({default: null}) BRI: number;

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;

    @UpdateDateColumn({type: 'datetime'})
    updatedAt: Date;
}
