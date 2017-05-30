import { Card } from "./card";

export class Deck {
    private _cards: Card[] = [
        new Card("zero"),
        new Card("half"),
        new Card("one"),
        new Card("two"),
        new Card("three"),
        new Card("five"),
        new Card("eight"),
        new Card("thirteen"),
        new Card("twenty"),
        new Card("forty"),
        new Card("one-hundred"),
        new Card("coffee"),
        new Card("question")
    ];

    public get cards(): Card[] {
        return this._cards;
    }

    public getCard(name: string) {
        let card =  this._cards.filter(c => c.name === name)[0];
        if(!card) {
            throw new Error(`Card '${name}' does not exist`)
        }

        return card;
    }

    public reset() {
        this._cards.forEach(c => c.clean());
    }
}