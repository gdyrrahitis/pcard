import { isUndefined } from "./validation.methods";

export class Guard {
    static throwIfObjectUndefined(data: {}, message: string) {
        this.throwIfConditionIsTruthy(isUndefined(data), message);
    }

    private static throwIfConditionIsTruthy(condition: boolean, message: string) {
        if (condition) {
            throw new Error(message);
        }
    }

    static throwIfStringNotDefinedOrEmpty(value: string, message: string) {
        this.throwIfConditionIsTruthy(!value || (value !== null && !value.trim()), message);
    }

    static validate(condition: boolean, message: string) {
        this.throwIfConditionIsTruthy(condition, message);
    }
}