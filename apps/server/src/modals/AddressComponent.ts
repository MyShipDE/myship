import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany, JoinTable, CreateDateColumn} from "typeorm"

@Entity("address_components")
export class AddressComponent extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column({default: null}) name: string;
}
