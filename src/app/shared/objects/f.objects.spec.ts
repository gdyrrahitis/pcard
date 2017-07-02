import { getProp, filterProp } from "../index";

describe("Functional objects spec", () => {
    it("should get value of property", () => {
        // arrange
        let person = { firstName: "George", lastName: "Dyrrachitis", age: 26 };
        let car = { make: "BMW", model: "3-Series", fuel: "Petrol" };

        // act
        let lastName = getProp("lastName")(person);
        let fuel = getProp("fuel")(car);

        // assert
        expect(lastName).toBe("Dyrrachitis");
        expect(fuel).toBe("Petrol");
    });

    it("should compare two values from different objects", () => {
        // arrange
        let person = { id: 1, name: "George", age: 26 };
        let objs = [{ id: 1 }, {id: 2}];

        // act
        let truthyResult = filterProp(objs[0].id)("id")(person);
        let falsyResult = filterProp(objs[1].id)("id")(person);

        // assert
        expect(truthyResult).toBeTruthy();
        expect(falsyResult).toBeFalsy();
    });
});