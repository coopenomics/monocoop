import Joi from 'joi';
import cron from 'node-cron';
import { blockchainService } from '../../services';
import { default as coopConfig } from '../../config/config';
import { Inject, Module } from '@nestjs/common';
import { BaseExtModule } from '../base.extension.module';
import {
  EXTENSION_REPOSITORY,
  type ExtensionDomainRepository,
} from '~/domain/extension/repositories/extension-domain.repository.interface';
import { WinstonLoggerService } from '~/modules/logger/logger-app.service';
import type { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';
import {
  LOG_EXTENSION_REPOSITORY,
  LogExtensionDomainRepository,
} from '~/domain/extension/repositories/log-extension-domain.repository.interface';

// Интерфейс для параметров конфигурации плагина powerup
export interface IConfig {
  dailyPackageSize: number; // Размер ежедневного пакета в AXON
  topUpAmount: number; // Сумма пополнения при достижении порога (в AXON)
  systemSymbol: string;
  systemPrecision: number;
  lastDailyReplenishmentDate: Date;
  thresholds: {
    cpu: number; // Порог CPU в микросекундах
    net: number; // Порог NET в байтах
    ram: number; // Порог RAM в байтах
  };
}

export interface ILog {
  type: 'daily' | 'now';
  amount: string;
  resources: {
    username: string;
    ram_usage: any;
    ram_quota: any;
    net_limit: any;
    cpu_limit: any;
  };
}

export class PowerupPlugin extends BaseExtModule {
  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>,
    @Inject(LOG_EXTENSION_REPOSITORY) private readonly logExtensionRepository: LogExtensionDomainRepository<ILog>,
    private readonly logger: WinstonLoggerService
  ) {
    super();
    this.logger.setContext(PowerupPlugin.name);
  }

  name = 'powerup';
  plugin!: ExtensionDomainEntity<IConfig>;

  public configSchemas = Joi.object<IConfig>({
    dailyPackageSize: Joi.number().required(),
    topUpAmount: Joi.number().required(),
    thresholds: Joi.object({
      cpu: Joi.number().required(),
      net: Joi.number().required(),
      ram: Joi.number().required(),
    }).required(),
  });

  async initialize() {
    const pluginData = await this.extensionRepository.findByName(this.name);
    if (!pluginData) throw new Error('Конфиг не найден');

    this.plugin = pluginData;

    this.logger.info(`Инициализация ${this.name} с конфигурацией`, this.plugin.config);

    // Проверяем, было ли ежедневное пополнение в последние 24 часа
    const lastDate = new Date(this.plugin.config.lastDailyReplenishmentDate);
    const now = new Date();

    if (lastDate) {
      const diffInHours = Math.abs(now.getTime() - lastDate.getTime()) / 36e5; // Разница во времени в часах
      if (diffInHours < 24) {
        this.logger.info('Ежедневное пополнение уже выполнялось в последние 24 часа. Повторное пополнение не требуется.');
      } else {
        this.logger.info('Ежедневное пополнение не выполнялось в последние 24 часа. Выполняем пополнение...');
        await this.runDailyTask();
      }
    } else {
      this.logger.info('Дата последнего пополнения отсутствует. Выполняем пополнение...');
      await this.runDailyTask();
    }

    // Регистрация cron-задачи для ежедневного пополнения
    cron.schedule('0 0 * * *', () => {
      this.logger.info('Запуск ежедневной задачи пополнения');
      this.runDailyTask();
    });

    // Регистрация cron-задачи для проверки ресурсов каждую минуту
    cron.schedule('* * * * *', () => {
      this.logger.info('Запуск задачи проверки ресурсов');
      this.runTask();
    });
  }

  private getQuantity(amount: number): string {
    return `${amount.toFixed(this.plugin.config.systemPrecision)} ${this.plugin.config.systemSymbol}`;
  }

  // Ежедневная задача пополнения
  private async runDailyTask() {
    const quantity = this.getQuantity(this.plugin.config.dailyPackageSize);

    this.logger.info(`Выполнение ежедневного пополнения на сумму ${quantity}`);

    try {
      // Получаем имя пользователя из окружения или другой конфигурации
      const username = coopConfig.coopname;
      const account = await blockchainService.getBlockchainAccount(username);

      await blockchainService.powerUp(username, quantity);

      this.plugin.config.lastDailyReplenishmentDate = new Date();
      await this.extensionRepository.update(this.name, this.plugin);

      await this.log({
        type: 'daily',
        amount: quantity,
        resources: {
          username: account.account_name,
          ram_usage: account.ram_usage,
          ram_quota: account.ram_quota,
          net_limit: account.net_limit,
          cpu_limit: account.cpu_limit,
        },
      });

      this.logger.info('Ежедневное пополнение выполнено успешно');
    } catch (error) {
      console.error('Ошибка при выполнении ежедневного пополнения:', error);
    }
  }

  private async log(action: ILog) {
    await this.logExtensionRepository.push(this.name, action);
  }

  // Задача проверки и пополнения ресурсов
  private async runTask() {
    this.logger.info(`Задача плагина ${this.name} выполняется...`);

    try {
      // Получаем имя пользователя из окружения или другой конфигурации
      const username = coopConfig.coopname;

      const account = await blockchainService.getBlockchainAccount(username);

      // Получаем текущие значения квот
      const cpuLimit = account.cpu_limit;
      const netLimit = account.net_limit;
      const ramQuota = account.ram_quota;
      const ramUsage = account.ram_usage;
      const availableRam = ramQuota - ramUsage;

      // Проверяем пороги и пополняем при необходимости
      let needPowerUp = false;

      if (cpuLimit.available <= this.plugin.config.thresholds.cpu) {
        this.logger.info(`CPU квота ниже порога (${cpuLimit.available} µs).`);
        needPowerUp = true;
      }

      if (netLimit.available <= this.plugin.config.thresholds.net) {
        this.logger.info(`NET квота ниже порога (${netLimit.available} bytes).`);
        needPowerUp = true;
      }

      if (availableRam <= this.plugin.config.thresholds.ram) {
        this.logger.info(`RAM квота ниже порога (${availableRam} bytes).`);
        needPowerUp = true;
      }

      if (needPowerUp) {
        // Выполняем пополнение ресурсов
        const quantity = this.getQuantity(this.plugin.config.topUpAmount);
        await blockchainService.powerUp(username, quantity);
        this.logger.info(`Пополнение выполнено на сумму ${quantity}.`);

        await this.log({
          type: 'now',
          amount: quantity,
          resources: {
            username: account.account_name,
            ram_usage: account.ram_usage,
            ram_quota: account.ram_quota,
            net_limit: account.net_limit,
            cpu_limit: account.cpu_limit,
          },
        });
      } else {
        this.logger.info('Квоты ресурсов в норме, пополнение не требуется.');
      }
    } catch (error) {
      console.error('Ошибка при проверке и пополнении ресурсов:', error);
    }
  }
}

@Module({
  providers: [PowerupPlugin], // Регистрируем PowerupPlugin как провайдер
  exports: [PowerupPlugin], // Экспортируем его для доступа в других модулях
})
export class PowerupPluginModule {
  constructor(private readonly powerupPlugin: PowerupPlugin) {}

  async initialize() {
    await this.powerupPlugin.initialize();
  }
}