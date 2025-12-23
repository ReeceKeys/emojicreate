class ListNode {
    constructor(value) {
        this.value = value;
        this.next = null;
        this.prev = null;
    }
}

export class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    append(value) {
        const newNode = new ListNode(value);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        }

        else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }
        this.length++;
    }

    prepend(value) {
        const newNode = new ListNode(value);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        }
        else {
            this.head.prev = newNode;
            newNode.next = this.head;
            this.head = newNode;
        }
        this.length++;
    }

    printForward() {
        let current = this.head;
        while (current) {
            console.log(current.value) 
            curernt = current.next
        }
    }

    printBackward() {
        let current = this.tail;
        while (current) {
            console.log(current.value)
            current = current.prev
        }
    }

    fine(value) {
        let current = this.head;
        while (current) {
            if (current.value == value) return current;
            current = current.next;
        }
        return null;
    }

    moveForward(value) {
    const node = this.find(value);
    if (!node || !node.next) return; 

    const nextNode = node.next;
    const prevNode = node.prev;

    if (prevNode) prevNode.next = nextNode;
    else this.head = nextNode; // node was head

    nextNode.prev = prevNode;


    const nextNext = nextNode.next;
    nextNode.next = node;
    node.prev = nextNode;
    node.next = nextNext;

    if (nextNext) nextNext.prev = node;
    else this.tail = node; 
  }

  // Move one step backward (towards head)
  moveBackward(value) {
    const node = this.find(value);
    if (!node || !node.prev) return;

    const prevNode = node.prev;
    const nextNode = node.next;

    if (nextNode) nextNode.prev = prevNode;
    else this.tail = prevNode; 

    prevNode.next = nextNode;

    const prevPrev = prevNode.prev;
    node.prev = prevPrev;
    node.next = prevNode;
    prevNode.prev = node;
    if (prevPrev) prevPrev.next = node;
    else this.head = node; 
  }

  moveToFront(value) {
    const node = this.find(value);
    if (!node || node === this.head) return;

    // Remove node
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.tail) this.tail = node.prev;

    node.prev = null;
    node.next = this.head;
    this.head.prev = node;
    this.head = node;
  }

  moveToBack(value) {
    const node = this.find(value);
    if (!node || node === this.tail) return;

    // Remove node
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.head) this.head = node.next;

    // Insert at tail
    node.next = null;
    node.prev = this.tail;
    this.tail.next = node;
    this.tail = node;
  }

}