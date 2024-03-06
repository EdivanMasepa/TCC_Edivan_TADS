import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { dirname } from "path";

@Injectable()
export class dbConfigService implements TypeOrmOptionsFactory{
    constructor(private configService: ConfigService){}

    createTypeOrmOptions(): TypeOrmModuleOptions{
        return{
            type: 'mariadb',
            host: this.configService.get<string>('DB_HOST'),
            port: this.configService.get<number>('DB_PORT'),
            username: this.configService.get<string>('DB_USER'),
            password: this.configService.get<string>('DB_PASSWORD'),
            database:  this.configService.get<string>('DB_NAME'),
            entities: [__dirname + '/../**/*.entity{.js,.ts}'],
            synchronize: true
        }
    }   
    
} 