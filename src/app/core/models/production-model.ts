export interface Production {
  id?: number;
  year: Date;
  plantationId: number;
  productionInKg: number;
  purchasePrice: number;
  mustBePaid: boolean;
}
