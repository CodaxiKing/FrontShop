export function partitionByDate(produtos: any[]) {
  const today = new Date();
  const normalProducts: any[] = [];
  const futureGroups: Record<string, any[]> = {};

  produtos.forEach((prod) => {
    const dp = prod.dataPrevistaPA;
    const dpDate = dp ? new Date(dp) : null;
    if (dp && dpDate! > today) {
      if (!futureGroups[dp]) futureGroups[dp] = [];
      futureGroups[dp].push(prod);
    } else {
      normalProducts.push(prod);
    }
  });

  return { normalProducts, futureGroups };
}
