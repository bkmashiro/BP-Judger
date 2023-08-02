interface Node<T> {
  key: string;
  value: T;
  next: Node<T> | null;
  prev: Node<T> | null;
}

export class LRUCache<T> {
  private capacity: number;
  private cache: Map<string, Node<T>>;
  private head: Node<T> | null;
  private tail: Node<T> | null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
  }

  private setHead(node: Node<T>): void {
    node.next = this.head;
    node.prev = null;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: Node<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  get(key: string): T | undefined {
    const node = this.cache.get(key);

    if (node) {
      // Move the accessed node to the front (most recently used)
      this.removeNode(node);
      this.setHead(node);
      return node.value;
    }

    return undefined;
  }

  put(key: string, value: T): void {
    if (this.cache.has(key)) {
      // Update the existing node and move it to the front
      const existingNode = this.cache.get(key);
      if (existingNode) {
        existingNode.value = value;
        this.removeNode(existingNode);
        this.setHead(existingNode);
      }
    } else {
      if (this.cache.size >= this.capacity) {
        // Remove the least recently used node (tail)
        const tailKey = this.tail?.key;
        if (tailKey) {
          this.cache.delete(tailKey);
          this.removeNode(this.tail);
        }
      }

      // Add the new node to the front
      const newNode: Node<T> = {
        key,
        value,
        next: null,
        prev: null,
      };
      this.setHead(newNode);
      this.cache.set(key, newNode);
    }
  }

  resize(newCapacity: number): void {
    if (newCapacity < this.capacity) {
      while (this.cache.size > newCapacity) {
        const tailKey = this.tail?.key;
        if (tailKey) {
          this.cache.delete(tailKey);
          this.removeNode(this.tail);
        }
      }
    }
    this.capacity = newCapacity;
  }

  size(): number {
    return this.cache.size;
  }
}
