import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemStatus } from './schemas/item.schema';

@Injectable()
export class ItemsService {
  constructor(@InjectModel(Item.name) private itemModel: Model<Item>) {}

  async create(createItemDto: any, userId: string): Promise<Item> {
    const newItem = new this.itemModel({ ...createItemDto, sellerId: userId });
    return newItem.save();
  }

  async findAll(query: any): Promise<Item[]> {
    const filter: any = { status: ItemStatus.ACTIVE };
    if (query.location) filter.location = query.location;
    if (query.type) filter.type = query.type;
    if (query.category) filter.category = query.category;
    if (query.search || query.q) filter.$text = { $search: query.search || query.q };
    if (query.budget) filter.price = { $lte: Number(query.budget) };

    let dbQuery = this.itemModel.find(filter).populate('sellerId', 'firstName lastName hostel level rating isVerified avatar');
    
    if (query.sort === 'price_asc') {
      dbQuery = dbQuery.sort({ price: 1 });
    } else if (query.sort === 'price_desc') {
      dbQuery = dbQuery.sort({ price: -1 });
    } else if (query.search || query.q) {
      dbQuery = dbQuery.sort({ score: { $meta: 'textScore' }, createdAt: -1 });
    } else {
      dbQuery = dbQuery.sort({ createdAt: -1 });
    }

    return dbQuery.limit(50).exec();
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemModel.findById(id).populate('sellerId', 'firstName lastName hostel level rating isVerified avatar totalTrades').exec();
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }
}