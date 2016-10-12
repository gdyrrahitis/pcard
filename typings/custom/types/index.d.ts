declare type Predicate<T> = (value: T) => boolean;
declare type Action<T> = (...T) => void;
declare type Connection = {
    id: string,
    userId: string,
    room: string,
    moderator: boolean
}