declare interface ITrustedFilter {
    (url: string): string;
}

declare interface IPluralFilter {
    (input: string, plural: string, count: number): string;
}