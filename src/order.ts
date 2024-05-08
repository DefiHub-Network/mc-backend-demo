import DB from './db';

export const PackageItem: Record<number, { amount: string; description: string }> = {
  1: {
    amount: '0.1',
    description: 'Subscription for 1 month',
  },
  2: {
    amount: '0.2',
    description: 'Subscription for 3 months',
  },
  3: {
    amount: '0.3',
    description: 'Subscription for 5 months',
  },
};

export interface Order {
  id: string;
  itemId: string;
  amount: string;
  description: string;
  status: 'pending' | 'paid' | 'expired';
}

function getPackageInfo(packageId: number) {
  return PackageItem[packageId];
}

function createNewOrder(packageId: number): Order {
  const packageInfo = getPackageInfo(packageId);

  return DB.insert({
    packageId,
    amount: packageInfo.amount,
    description: packageInfo.description,
    status: 'pending',
  });
}

function getById(id: string): Order {
  return DB.findOne(id);
}

function getAll(): Order[] {
  return DB.findAll();
}

function updateOrder(order: Order): Order {
  return DB.update(order);
}

export default {
  createNewOrder,
  updateOrder,
  getById,
  getAll,
};
