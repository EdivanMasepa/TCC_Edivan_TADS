import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UsuarioEntity } from "./usuario.entity";

@Entity({name:'pessoa'})
export class PessoaEntity{

    @PrimaryGeneratedColumn()
    id:number;

    @Column({name:'id_usuario', nullable:false})
    idUsuario: number;

    @Column({name: 'cpf', nullable:false})
    cpf: string;  

    @Column({name: 'data_nascimento', nullable:false})
    dataNascimento: string;

    @Column({name: 'genero', length:30, nullable:false})
    genero: string;

    @Column({name: 'situacao', length:20, nullable:false})
    situacao: string;
    
    @OneToOne(() => UsuarioEntity, usuario => usuario.usuarioPessoa)
    usuario: UsuarioEntity;
}