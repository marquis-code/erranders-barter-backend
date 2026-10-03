import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting } from './schemas/setting.schema';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(@InjectModel(Setting.name) private settingModel: Model<Setting>) {}

  async onModuleInit() {
    const defaultSettings = [
      { key: 'base_errander_fee', value: 500 }
    ];
    for (const s of defaultSettings) {
      const exists = await this.settingModel.findOne({ key: s.key });
      if (!exists) {
        await this.settingModel.create(s);
      }
    }
  }

  async getSetting(key: string) {
    const setting = await this.settingModel.findOne({ key });
    return setting ? setting.value : null;
  }

  async updateSetting(key: string, value: any) {
    return this.settingModel.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true }
    );
  }
}
