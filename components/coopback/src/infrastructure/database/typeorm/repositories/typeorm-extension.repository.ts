// infrastructure/database/typeorm/repositories/typeorm-app.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtensionEntity } from '../entities/extension.entity';
import { ExtensionDomainRepository } from '~/domain/extension/repositories/extension-domain.repository.interface';
import { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';

@Injectable()
export class TypeOrmExtensionDomainRepository<TConfig = any> implements ExtensionDomainRepository<TConfig> {
  constructor(
    @InjectRepository(ExtensionEntity)
    private readonly ormRepo: Repository<ExtensionEntity<TConfig>>
  ) {}

  async findByName(name: string): Promise<ExtensionDomainEntity<TConfig> | null> {
    const ormEntity = await this.ormRepo.findOne({ where: { name } });
    return ormEntity ? ormEntity.toDomainEntity() : null;
  }

  async create(data: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>> {
    const ormEntity = this.ormRepo.create(ExtensionEntity.fromDomainEntity(data as ExtensionDomainEntity<TConfig>));
    const savedEntity = await this.ormRepo.save(ormEntity);
    return savedEntity.toDomainEntity();
  }

  async findAll(): Promise<ExtensionDomainEntity<TConfig>[]> {
    const ormEntities = await this.ormRepo.find();
    return ormEntities.map((ormEntity) => ormEntity.toDomainEntity());
  }

  async update(name: string, data: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>> {
    // Поиск существующей записи по name
    const existingEntity = await this.ormRepo.findOne({ where: { name } });

    if (!existingEntity) {
      throw new Error('Запись не найдена');
    }

    // Обновление только переданных полей
    if (data.enabled !== undefined) existingEntity.enabled = data.enabled;
    if (data.config !== undefined) existingEntity.config = data.config;

    // Сохранение обновленной записи в базе данных
    await this.ormRepo.save(existingEntity);

    return existingEntity.toDomainEntity();
  }
}