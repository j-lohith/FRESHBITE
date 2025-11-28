class LoadingManager {
  constructor() {
    this.listeners = [];
    this.count = 0;
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.set = this.set.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.count));
  }

  start() {
    this.count += 1;
    this.notify();
  }

  stop() {
    this.count = Math.max(0, this.count - 1);
    this.notify();
  }

  set(active) {
    this.count = active ? Math.max(1, this.count) : 0;
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.count);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const loadingManager = new LoadingManager();


