import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LogisticsService {
  private readonly ERRANDERS_API_URL = process.env.ERRANDERS_API_URL || 'http://localhost:3000/api/v1';
  private readonly INTERNAL_API_KEY = process.env.ERRANDERS_INTERNAL_API_KEY;

  async dispatchRiderForBarter(sellerLocation: string, buyerLocation: string, itemTitle: string) {
    try {
      const response = await fetch(
        `${this.ERRANDERS_API_URL}/orders/create-automated-dispatch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-api-key': this.INTERNAL_API_KEY,
          },
          body: JSON.stringify({
            pickupLocation: sellerLocation,
            dropoffLocation: buyerLocation,
            packageDescription: `Barter Item: ${itemTitle}`,
            priority: 'high',
          }),
        }
      );
      const data = await response.json();
      return data.trackingUrl;
    } catch (error) {
      Logger.error('Failed to auto-dispatch rider', error);
      throw new Error('Logistics automation failed');
    }
  }
}