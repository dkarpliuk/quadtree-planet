export function debounce(f, ms) {
  let isCooldown = false;

  return function () {
    this.original = f;

    if (!isCooldown) {
      f.apply(this, arguments);
      isCooldown = true;
      setTimeout(() => isCooldown = false, ms);
    }
  };
}