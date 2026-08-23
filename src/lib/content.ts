type Publishable = { draft: boolean };
type Orderable = { order: number };

export const filterPublished = <T extends Publishable>(items: T[]) =>
  items.filter((item) => !item.draft);

export const sortByOrder = <T extends Orderable>(items: T[]) =>
  [...items].sort((a, b) => a.order - b.order);
