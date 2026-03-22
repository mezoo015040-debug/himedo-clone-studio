// تصنيفات الأسعار بناءً على قيمة السيارة
interface PriceTier {
  minVehicleValue: number;
  maxVehicleValue: number;
  thirdParty: { min: number; max: number };
  comprehensive: { min: number; max: number };
}

const priceTiers: PriceTier[] = [
  {
    minVehicleValue: 5000,
    maxVehicleValue: 30000,
    thirdParty: { min: 499, max: 1599 },
    comprehensive: { min: 899, max: 2599 },
  },
  {
    minVehicleValue: 30000,
    maxVehicleValue: 80000,
    thirdParty: { min: 899, max: 2999 },
    comprehensive: { min: 1299, max: 3599 },
  },
  {
    minVehicleValue: 80000,
    maxVehicleValue: 200000,
    thirdParty: { min: 1399, max: 3999 },
    comprehensive: { min: 2299, max: 5599 },
  },
];

function getTier(vehicleValue: number): PriceTier {
  for (const tier of priceTiers) {
    if (vehicleValue >= tier.minVehicleValue && vehicleValue <= tier.maxVehicleValue) {
      return tier;
    }
  }
  // Default: if below 5000 use tier 1, if above 200000 use tier 3
  if (vehicleValue < 5000) return priceTiers[0];
  return priceTiers[2];
}

/**
 * Generate a price for a company based on its position (index) in the list.
 * Companies are spread across the price range: index 0 = cheapest, last = most expensive.
 */
export function calculateCompanyPrices(
  vehicleValue: number,
  companyIndex: number,
  totalCompanies: number,
  type: 'thirdParty' | 'comprehensive',
  discount: number
): { salePrice: number; regularPrice: number } {
  const tier = getTier(vehicleValue);
  const range = type === 'thirdParty' ? tier.thirdParty : tier.comprehensive;

  // Position ratio: 0 = cheapest, 1 = most expensive
  const ratio = totalCompanies > 1 ? companyIndex / (totalCompanies - 1) : 0;

  // Interpolate sale price within range
  const salePrice = Math.round(range.min + ratio * (range.max - range.min));

  // Calculate regular price from sale price and discount
  const regularPrice = Math.round(salePrice / (1 - discount / 100));

  return { salePrice, regularPrice };
}
