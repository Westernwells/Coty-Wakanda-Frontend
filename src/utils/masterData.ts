type WithDataArray = {
    id: number;
    data: any[];
  };
  
  export function mergeByIdConcatData<T extends WithDataArray>(arr: T[]): T[] {
    const map = new Map<number, T>();
  
    for (const item of arr) {
      if (map.has(item.id)) {
        const existing = map.get(item.id)!;
        existing.data = existing.data.concat(item.data);
      } else {
        map.set(item.id, { ...item, data: [...item.data] });
      }
    }
  
    return Array.from(map.values());
  }