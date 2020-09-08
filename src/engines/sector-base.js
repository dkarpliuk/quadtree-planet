export class SectorBase {
  matter = null;

  constructor(matter) {
    this.matter = matter;
  }

  split() {
    throw 'Method not implemented!';
  }
}