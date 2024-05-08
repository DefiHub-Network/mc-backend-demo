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
}

function getPackageInfo(packageId: number) {
  return PackageItem[packageId];
}

function createNewOrder(packageId: number): {
  id: string;
  packageId: string;
  amount: string;
  description: string;
} {
  const packageInfo = getPackageInfo(packageId);

  return DB.insert({
    packageId,
    amount: packageInfo.amount,
    description: packageInfo.description,
  });
}

function getById(id: string): Order {
  return DB.findOne(id);
}

function getAll(): Order[] {
  return DB.findAll();
}

export default {
  createNewOrder,
  getById,
  getAll,
};
