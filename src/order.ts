import DB from './db';

export const PackageItem: Record<number, { amount: string; description: string; months: number }> = {
  1: {
    amount: '0.01',
    description: 'Subscription for 1 month',
    months: 1,
  },
  2: {
    amount: '0.02',
    description: 'Subscription for 3 months',
    months: 3,
  },
  3: {
    amount: '0.03',
    description: 'Subscription for 5 months',
    months: 5,
  },
};

export interface Order {
  id: string;
  packageId: number;
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
  getPackageInfo,
  createNewOrder,
  updateOrder,
  getById,
  getAll,
};
