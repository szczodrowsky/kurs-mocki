import type { Product } from '@models/product.js';

export function productSearchResponse(products: readonly Product[], searchParams: URLSearchParams) {
	const query = searchParams.get('q')?.trim().toLowerCase();
	const matches = query
		? products.filter(({ name, description }) => [name, description].some((text) => text.toLowerCase().includes(query)))
		: products;
	const pageNumber = Number(searchParams.get('page') ?? 0);
	const pageSize = Number(searchParams.get('size') ?? 12);
	const start = pageNumber * pageSize;
	const prices = matches.map(({ price }) => price);
	const categories = Object.entries(Object.groupBy(matches, ({ category }) => category)).map(([value, entries]) => ({
		value,
		count: entries.length
	}));

	return {
		content: matches.slice(start, start + pageSize),
		pageNumber,
		pageSize,
		totalElements: matches.length,
		totalPages: Math.ceil(matches.length / pageSize),
		facets: {
			categories,
			priceRange: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 0 },
			inStockCount: matches.filter(({ stockQuantity }) => stockQuantity > 0).length
		}
	};
}
