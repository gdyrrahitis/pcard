export const isUndefined = (data: {}): boolean => {
    return typeof data === "undefined" || data === null || Object.keys(data).length <= 0;
}