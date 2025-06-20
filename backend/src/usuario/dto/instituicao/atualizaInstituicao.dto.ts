import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, MaxDate } from "class-validator";
import { SegmentoInstituicao } from "../../enum/segmentoInstituicao.enum";

export class AtualizaInstituicaoDTO{

    @IsDate({message:"DATA DE FUNDAÇÃO tem tipo inválido."})
    @MaxDate(new Date())
    @IsOptional()
    dataFundacao: Date;

    @IsOptional()
    @IsEnum(SegmentoInstituicao, {message:"SEGMENTO não está predefinido."})
    segmento?: SegmentoInstituicao;
}