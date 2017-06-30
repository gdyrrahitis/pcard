export let getProp = <T>(prop: string) => (obj: T) => obj[prop];
export let filterProp = <T>(val: any) => (prop: string) => (obj: T) => getProp(prop)(obj) === val;
export let reducer = (prop: string) => (value: any) => (previous: number, current: any, index: number) => (current[prop] === value && previous === -1) ? index : previous;