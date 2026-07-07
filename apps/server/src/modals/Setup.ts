import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm"

@Entity("settings")
export class Setup extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column() name: string;
    @Column({default: null}) stringValue: string;
    @Column({default: null, type: "double"}) numericValue: number;
    @Column({default: null}) boolValue: boolean;

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;

    @UpdateDateColumn({type: 'datetime'})
    updatedAt: Date;
}
