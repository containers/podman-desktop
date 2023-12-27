export class FileNode<T> {
  name: string;
  data: T | undefined;
  children: Map<string, FileNode<T>>;

  constructor(name: string) {
    this.name = name;
    this.children = new Map<string, FileNode<T>>();
  }

  addChild(name: string): FileNode<T> {
    const child = new FileNode<T>(name);
    this.children.set(name, child);
    return child;
  }
}

export class FileTree<T> {
  name: string;
  fileSize: number;
  root: FileNode<T>;

  constructor(name: string) {
    this.name = name;
    this.fileSize = 0;
    this.root = new FileNode<T>('/');
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
