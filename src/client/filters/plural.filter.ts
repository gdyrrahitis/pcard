export function PluralFilter(): IPluralFilter {
    return (input: string, plural: string, count: number) => {
        return count < 0 ? null : count === 1 ? input : plural;
    }
}