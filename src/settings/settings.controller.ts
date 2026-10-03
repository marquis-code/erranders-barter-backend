import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':key')
  async getSetting(@Param('key') key: string) {
    const value = await this.settingsService.getSetting(key);
    return { key, value };
  }

  @Post(':key')
  async updateSetting(@Param('key') key: string, @Body('value') value: any) {
    const setting = await this.settingsService.updateSetting(key, value);
    return setting;
  }
}
