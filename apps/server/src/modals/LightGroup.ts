import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn, ManyToMany, JoinTable
} from "typeorm"
import {Light} from "./Light";
import {Scene} from "./Scene";

@Entity("light_groups")
export class LightGroup extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column() name: string;
    @Column({default: null}) lastSceneId: number;

    @ManyToMany(() => Light)
    @JoinTable()
    lights: Light[]

    @ManyToMany(() => Scene)
    @JoinTable()
    scenes: Scene[]

    @CreateDateColumn({type: 'datetime'})
    createdAt: Date;

    @UpdateDateColumn({type: 'datetime'})
    updatedAt: Date;
}
