export class fileNode<T> {
  name: string;
  data: T | undefined;
  children: Map<string, fileNode<T>>;

  constructor(name: string) {
    this.name = name;
    this.children = new Map<string, fileNode<T>>();
  }

  addChild(name: string): fileNode<T> {
    const child = new fileNode<T>(name);
    this.children.set(name, child);
    return child;
  }
}

export class fileTree<T> {
  name: string;
  fileSize: number;
  root: fileNode<T>;

  constructor(name: string) {
    this.name = name;
    this.fileSize = 0;
    this.root = new fileNode<T>('/');
  }

  addFileSize(s: number) {
    this.fileSize += s;
  }
  addPath(path: string, entry: T) {
    const parts = path.split('/');
    let node = this.root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === '') {
        continue;
      }
      const next = node.children.get(part);
      if (next) {
        node = next;
      } else {
        node = node.addChild(part);
      }
    }
    node.data = entry;
  }
}
