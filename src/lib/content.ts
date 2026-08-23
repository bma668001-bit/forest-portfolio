type Publishable = { draft: boolean } | { data: { draft: boolean } };
type Orderable = { order: number } | { data: { order: number } };

const draftOf = (item: Publishable) => ('data' in item ? item.data.draft : item.draft);
const orderOf = (item: Orderable) => ('data' in item ? item.data.order : item.order);

export const filterPublished = <T extends Publishable>(items: T[]) =>
  items.filter((item) => !draftOf(item));

export const sortByOrder = <T extends Orderable>(items: T[]) =>
  [...items].sort((a, b) => orderOf(a) - orderOf(b));
