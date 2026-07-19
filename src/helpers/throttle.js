export function throttle(f, ms) {
  let isCooldown = false;

  return function (...args) {
    if (isCooldown) {
      return;
    }

    f.apply(this, args);
    isCooldown = true;
    setTimeout(() => isCooldown = false, ms);
  };
}
