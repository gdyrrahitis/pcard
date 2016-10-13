export let filter = <T>(predicate: Predicate<T>) => (collection: T[]): T[] => collection.filter(predicate);
export let getFirst = <T>(collection: T[]) => collection[0];