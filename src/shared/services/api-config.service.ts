import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MongooseModuleOptions } from '@nestjs/mongoose';
import { isNil } from 'lodash';

@Injectable()
export class ApiConfigService {
    constructor(private configService: ConfigService) {}

    get isDevelopment(): boolean {
        return this.nodeEnv === 'development';
    }

    get isProduction(): boolean {
        return this.nodeEnv === 'production';
    }

    get isTest(): boolean {
        return this.nodeEnv === 'test';
    }

    private getNumber(key: string): number {
        const value = this.get(key);

        try {
            return Number(value);
        } catch {
            throw new Error(key + ' environment variable is not a number');
        }
    }

    private getBoolean(key: string): boolean {
        const value = this.get(key);

        try {
            return Boolean(JSON.parse(value));
        } catch {
            throw new Error(key + ' env var is not a boolean');
        }
    }

    private getString(key: string): string {
        const value = this.get(key);

        return value.replace(/\\n/g, '\n');
    }

    get nodeEnv(): string {
        return this.getString('NODE_ENV');
    }

    getMongooseOptions(): MongooseModuleOptions {
        const options: MongooseModuleOptions = {
            uri: this.getString('MONGODB_DEV'),
            dbName: 'ielts-ai-assistant',
            user: this.get('MONGOOSE_USERNAME'),
            pass: this.get('MONGOOSE_PASSWORD'),
        };

        return options;
    }

    get mongodbConfig(): string {
        return this.getString('MONGODB_DEV');
    }

    get serverConfig() {
        return {
            port: this.configService.get<string>('PORT') || 4000
        };
    }

    get documentationEnabled(): boolean {
        return this.getBoolean('ENABLE_DOCUMENTATION');
    }

    get authConfig() {
        return {
            privateKey: this.getString('JWT_PRIVATE_KEY'),
            publicKey: this.getString('JWT_PUBLIC_KEY'),
            jwtExpirationTime: this.getNumber('JWT_EXPIRATION_TIME') ?? 3600
        };
    }

    private get(key: string): string {
        const value = this.configService.get<string>(key);

        if (isNil(value)) {
            // probably we should call process.exit() too to avoid locking the service

            throw new Error(key + ' environment variable does not set');
        }

        return value;
    }
}
