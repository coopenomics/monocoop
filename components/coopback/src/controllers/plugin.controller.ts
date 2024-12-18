import { Response } from 'express';
import { pluginService } from '../services';
import httpStatus from 'http-status';
import type { RGetPluginConfig, RGetPluginList, RGetPluginSchema, RSetPlugin } from '../types';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';
import { ExtensionDomainInteractor } from '~/domain/extension/interactors/extension-domain.interactor';
import { nestApp } from '..';

export const getPluginList = catchAsync(async (req: RGetPluginList, res: Response) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const plugins = await pluginService.queryPlugins(filter, options);

  res.send(plugins);
});

// Контроллер для обновления параметров плагинов
export const setPluginConfig = catchAsync(async (req: RSetPlugin, res: Response) => {
  const { name, config, enabled } = req.body;
  try {
    const updatedConfig = await pluginService.updatePluginConfig(name, enabled, config);

    const extensionDomainInteractor = nestApp.get(ExtensionDomainInteractor);

    if (enabled == false) await extensionDomainInteractor.terminateApp(name);
    else await extensionDomainInteractor.restartApp(name);

    res.status(httpStatus.OK).json({
      message: `Конфигурация плагина ${name} успешно обновлена`,
      config: updatedConfig,
    });
  } catch (e: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, e.message);
  }
});

// Контроллер для обновления параметров плагинов
export const getPluginSchema = catchAsync(async (req: RGetPluginSchema, res: Response) => {
  const { name } = req.query;
  try {
    const schema = pluginService.getPluginSchema(name);
    res.status(httpStatus.OK).json(schema);
  } catch (e: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, e.message);
  }
});

// Контроллер для обновления параметров плагинов
export const getPluginConfig = catchAsync(async (req: RGetPluginConfig, res: Response) => {
  const { name } = req.query;
  const config = await pluginService.getPluginConfig(name);

  res.status(httpStatus.OK).json(config);
});
