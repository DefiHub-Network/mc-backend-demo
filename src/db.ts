import { v4 as uuidv4 } from 'uuid';

// simulate in-memory db for demo purposes
const MAX_STORAGE_SIZE = 1000;
const storage: any[] = [];

function insert(data: any) {
  if (storage.length >= MAX_STORAGE_SIZE) {
    storage.shift();
  }

  const newRow = {
    id: uuidv4(),
    ...data,
  };
  storage.push(newRow);
  return newRow;
}

function update(data: any & { id: string }) {
  const index = storage.findIndex(row => row.id === data.id);
  if (index !== -1) {
    storage[index] = {
      ...storage[index],
      ...data,
    };
    return storage[index];
  }
  return null;
}

function findOne(id: string) {
  return storage.find(row => row.id === id);
}

function findAll() {
  return storage.reverse();
}

export default {
  insert,
  findOne,
  findAll,
  update,
};
