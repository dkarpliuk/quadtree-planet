export class RandomLCG {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 0x19660D + 0x3C6EF35F) | 0x0;
    return (this.seed >>> 0x0) / 0xFFFFFFFF;
  }
}