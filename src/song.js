export default class Song {
    constructor() {
        this.patterns = [];
        this.order = [];
        this.currentIndex = 0;
    }
    addPattern(pattern) {
        this.patterns.push(JSON.parse(JSON.stringify(pattern)));
        this.order.push(this.patterns.length - 1);
    }
    getCurrentPattern() {
        const id = this.order[this.currentIndex] || 0;
        return this.patterns[id];
    }
    nextPattern() {
        this.currentIndex = (this.currentIndex + 1) % this.order.length;
    }
    reset() {
        this.currentIndex = 0;
    }
}
