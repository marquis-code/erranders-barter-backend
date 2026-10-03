import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async onModuleInit() {
    const count = await this.categoryModel.countDocuments();
    if (count === 0) {
      const initialCategories = [
        { name: 'Electronics', icon: 'smartphone' },
        { name: 'Textbooks', icon: 'book' },
        { name: 'Furniture', icon: 'sofa' },
        { name: 'Clothing & Accessories', icon: 'shirt' },
        { name: 'Kitchen & Dining', icon: 'utensils' },
        { name: 'Beauty & Personal Care', icon: 'smile' },
        { name: 'Sports & Outdoors', icon: 'basketball' },
        { name: 'Stationery & Art Supplies', icon: 'pen-tool' },
        { name: 'Musical Instruments', icon: 'music' },
        { name: 'Gaming', icon: 'gamepad-2' },
      ];
      await this.categoryModel.insertMany(initialCategories);
      console.log('Seeded initial categories');
    }
  }

  async findAll() {
    return this.categoryModel.find().sort({ name: 1 }).exec();
  }
}
