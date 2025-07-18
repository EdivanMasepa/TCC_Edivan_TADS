import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CriaPublicacaoDTO } from './dto/criaPublicacao.dto';
import { UsuarioEntity } from 'src/usuario/entities/usuario.entity';
import { PublicacaoEntity } from './entities/publicacao.entity';
import { AtualizaPublicacaoDTO } from './dto/atualizaPublicacao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioService } from 'src/usuario/usuario.service';
import { ListaPublicacaoDTO } from './dto/listaPublicacao.dto';
import { AvaliaPublicacaoDTO } from './dto/avaliaPublicacao.dto';
import { PesquisaPublicacaoDTO } from './dto/pesquisaPublicacao.dto copy';
import { CategoriaPublicacaoEnum } from './enum/categoriaPublicacao.enum';

@Injectable()
export class PublicacaoService {
  constructor(
    @InjectRepository(PublicacaoEntity) 
    private readonly publicacaoRepository: Repository<PublicacaoEntity>,
    @Inject(forwardRef(() => UsuarioService))
    private readonly usuarioService: UsuarioService
  ){}

  async criar(idUsuario: number, publicacao:CriaPublicacaoDTO){
    try{
      const usuarioEncontrado:UsuarioEntity = await this.usuarioService.buscar(idUsuario);
      const publicacaoEntity:PublicacaoEntity = new PublicacaoEntity();

      if (!usuarioEncontrado)
        throw new NotFoundException('Erro ao relacionar usuário.');

      publicacaoEntity.categoria = publicacao.categoria;
      publicacaoEntity.titulo = publicacao.titulo;
      publicacaoEntity.descricao = publicacao.descricao;
      publicacaoEntity.usuarioResponsavel = usuarioEncontrado;
      publicacaoEntity.aprovada = false;
      publicacaoEntity.imagem = null;
   
      await this.publicacaoRepository.save(publicacaoEntity);
            
      return {statuscode:201, message: 'Publicação enviada para análise.'}
    
    }catch(erro){

      if(erro instanceof NotFoundException)
        throw erro;

      throw new InternalServerErrorException('Erro ao criar publicação.')
    }
  }

  async listar(aprovada: boolean | null, categoria: CategoriaPublicacaoEnum | string){
    try{
        const where: any = {};
        where.aprovada = aprovada

        if(categoria === CategoriaPublicacaoEnum.PEDIDO_AJUDA || categoria === CategoriaPublicacaoEnum.ACAO_SOLIDARIA || categoria === CategoriaPublicacaoEnum.INFORMACAO_PUBLICA)
          where.categoria = categoria;

      const listaPublicacao:PublicacaoEntity[] = await this.publicacaoRepository.find({
        where, 
        relations:{usuarioResponsavel:true},
        order:{data: 'DESC'}
      })

      return listaPublicacao.map((publicacao)=> new ListaPublicacaoDTO(
          publicacao.id,
          publicacao.categoria,          
          publicacao.titulo, 
          publicacao.descricao, 
          publicacao.data,    
          publicacao.aprovada,      
          publicacao.usuarioResponsavel.nome,
          publicacao.usuarioResponsavel.usuarioPessoa.situacao,
          publicacao.usuarioResponsavel.id
        )
      );
    }catch{
      throw new InternalServerErrorException('Erro ao buscar publicações.')
    }
  }

  async buscar(id:number){
      const publicacaoEncontrada: PublicacaoEntity = await this.publicacaoRepository.findOneBy({id:id});

      if(!publicacaoEncontrada)
        throw new NotFoundException('Nenhuma publicação encontrada.') 
    
      return publicacaoEncontrada;
  }

  async buscarPorTexto(texto: string){
    const buscaPublicacoes: PublicacaoEntity[] = await this.publicacaoRepository
      .createQueryBuilder('publicacao')
      .select([
        'publicacao.id',
        'publicacao.titulo',
      ])
      .where('lower(publicacao.titulo) like concat("%", lower(:texto), "%")', {texto})
      .orWhere('lower(publicacao.descricao) like concat("%", lower(:texto), "%")', {texto})
      .getMany();

    const publicacoes: PesquisaPublicacaoDTO[] | null = buscaPublicacoes.length > 0 ? buscaPublicacoes.map((publicacao) => new PesquisaPublicacaoDTO(publicacao.id, publicacao.titulo)) : null
  
    return publicacoes;
  }

  async editar(idUsuario: number, idPublicacao:number, novosDadosPublicacao: AtualizaPublicacaoDTO){
    try{
      const usuarioEncontrado: UsuarioEntity = await this.usuarioService.buscar(idUsuario);
      const publicacaoEncontrada: PublicacaoEntity = await this.buscar(idPublicacao);
      let publicacaoEncontradaUsuario: PublicacaoEntity | null = null;
      
      if(usuarioEncontrado === null)  
        throw new NotFoundException('Erro ao relacionar usuário.');

      for(let publicacao of usuarioEncontrado.publicacoes){
        if(publicacao.id === publicacaoEncontrada.id){
          publicacaoEncontradaUsuario = publicacao;
          publicacaoEncontrada.descricao = novosDadosPublicacao.descricao
        }               
      }

      if(publicacaoEncontradaUsuario == null)  
        throw new NotFoundException('Erro ao relacionar publicação.');

      const a = await this.publicacaoRepository.save(publicacaoEncontrada)
      console.log(publicacaoEncontrada, novosDadosPublicacao)

      return {statuscode:200, message: 'Alteração feita com sucesso.'};

    }catch(erro){

      if(erro instanceof NotFoundException)
        throw erro;

      throw new InternalServerErrorException('Erro ao editar publicação.');
    }
  }

  async avaliar(avaliacao: AvaliaPublicacaoDTO, idUsuario: number){
    try{
      const publicacao: PublicacaoEntity = await this.buscar(avaliacao.idPublicacao);
      const usuario :UsuarioEntity = await this.usuarioService.buscar(idUsuario) ;

      if(!publicacao)
        throw new NotFoundException('Publicação não encontrada.');

      if(usuario.moderador === true){
        publicacao.aprovada = publicacao.aprovada;
        publicacao.usuarioModerador = usuario;
      }

      await this.publicacaoRepository.save(publicacao)

      return {statuscode: 200, message: 'Alteração feita com sucesso.'}

    }catch(erro){

      if(erro)
        throw new erro

      throw new BadRequestException('Erro ao atualizar publicacao.')
    }
  }

  async deletar(idUsuario:number, idPublicacao:number){
    try{
      const usuarioEncontrado: UsuarioEntity = await this.usuarioService.buscar(idUsuario);
      const publicacaoEncontrada: PublicacaoEntity = await this.buscar(idPublicacao);
      let publicacaoEncontradaUsuario: PublicacaoEntity | null = null;

      if(!usuarioEncontrado)  
        throw new NotFoundException('Erro ao relacionar usuário.');

      if(!publicacaoEncontrada)
        throw new NotFoundException("Publicação não encontrada.");

      for(let publicacao of usuarioEncontrado.publicacoes){
        if(publicacao.id === idPublicacao)
          publicacaoEncontradaUsuario = publicacao;
      }

      if(publicacaoEncontradaUsuario == null)  
        throw new NotFoundException('Erro ao relacionar publicação.');
      
      await this.publicacaoRepository.remove(publicacaoEncontradaUsuario);

      return {statuscode:200, message:'Publicação excluída com sucesso.'};

    }catch(erro){

      if(erro instanceof NotFoundException)
        throw erro;

      throw new BadRequestException('Erro ao excluir publicação.');
    }
  }
}
