export type Predicate<T> = (value: T) => boolean;
export type Action<T> = (...T) => void;