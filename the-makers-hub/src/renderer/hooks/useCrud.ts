import { useState, useEffect } from 'react';

interface CrudOperations<T> {
  getAll: () => Promise<T[]>;
  add: (item: Omit<T, 'id'>) => Promise<T>;
  update: (item: T) => Promise<void>;
  delete: (id: number) => Promise<void>;
}

export const useCrud = <T extends { id: number }>(operations: CrudOperations<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [selectedItem, setSelectedItem] = useState<T | undefined>(undefined);

  const fetchItems = () => {
    operations.getAll().then(setItems);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async (item: Omit<T, 'id'>) => {
    await operations.add(item);
    fetchItems();
  };

  const handleUpdate = async (item: T) => {
    await operations.update(item);
    setSelectedItem(undefined);
    fetchItems();
  };

  const handleDelete = async (id: number) => {
    await operations.delete(id);
    fetchItems();
  };

  const handleSubmit = (item: Omit<T, 'id'>) => {
    if (selectedItem) {
      handleUpdate({ ...item, id: selectedItem.id } as T);
    } else {
      handleAdd(item);
    }
  };

  return {
    items,
    setItems,
    selectedItem,
    setSelectedItem,
    handleSubmit,
    handleDelete,
  };
};
