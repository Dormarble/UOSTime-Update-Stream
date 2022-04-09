import { IncompleteInputException } from "../exception/incompleteInput.exception";

export function checkInput(...properties: any[]): void {
    if(!properties.every((property: any) => property !== null && property !== undefined)) {
        throw new IncompleteInputException();
    }
}