import { AddressUtility } from "./address-utility";
import { Direction as D } from "../enums/direction";

const testData = [
  ["000", ["411", "222", "001", "003"]],
  ["001", ["000", "221", "010", "002"]],
  ["002", ["003", "001", "013", "031"]],
  ["003", ["412", "000", "002", "030"]],
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
