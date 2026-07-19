import { AddressUtility } from "./address-utility";
import { Direction as D } from "../enums/direction";

const testData = [
  ["000", ["411", "233", "001", "002"]],
  ["001", ["000", "231", "010", "003"]],
  ["002", ["413", "000", "003", "020"]],
  ["003", ["002", "001", "012", "021"]],
];

test.each(testData)(
  "AddressUtility",
  (addressStr, [expectedLeft, expectedUp, expectedRight, expectedDown]) => {
    const u = new AddressUtility();
    const addressArr = addressStr.split("").map((x) => parseInt(x));

    const actualLeft = u.getNeighborAddress(addressArr, D.left).join("");
    const actualUp = u.getNeighborAddress(addressArr, D.up).join("");
    const actualRight = u.getNeighborAddress(addressArr, D.right).join("");
    const actualDown = u.getNeighborAddress(addressArr, D.down).join("");

    expect(expectedLeft).toBe(actualLeft);
    expect(expectedUp).toBe(actualUp);
    expect(expectedRight).toBe(actualRight);
    expect(expectedDown).toBe(actualDown);
  }
);
