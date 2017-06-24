export let filter = <T>(predicate: Predicate<T>) => (collection: T[]): T[] => collection.filter(predicate);
export let getFirst = <T>(collection: T[]) => collection[0];
export let findIndex = <T>(reducer: (previous: number, current: T, index: number) => number) => (collection: T[]) => collection.reduce(reducer, -1);
export let removeFromIndexNumberOfItems = <T>(startIndex: number, deleteCount: number) => (collection: T[]) => startIndex > 0 ? collection.splice(startIndex, deleteCount) : [];