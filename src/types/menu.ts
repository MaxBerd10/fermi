export interface MenuNode {
  id: number;
  title: string;
  urlType: string;
  urlValue: string;
  href: string;
  children: MenuNode[];
}
