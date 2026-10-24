import { ProductCategory } from '@enums/product-category.enum.js';
import { faker } from '@faker-js/faker';
import type { Product, ProductOverrides } from '@models/product.js';

const categories = Object.values(ProductCategory);

function formatBackendDate(date: Date): string {
	return date.toISOString().replace('Z', '');
}

export function generateProduct(id: number, overrides: ProductOverrides = {}): Product {
	const createdAt = faker.date.recent({ days: 365 });
	const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

	return {
		id,
		name: faker.commerce.productName(),
		description: faker.commerce.productDescription(),
		price: Number(faker.commerce.price({ min: 1, max: 2000, dec: 2 })),
		stockQuantity: faker.number.int({ min: 0, max: 500 }),
		category: faker.helpers.arrayElement(categories),
		imageUrl: '/images/iphone.png',
		createdAt: formatBackendDate(createdAt),
		updatedAt: formatBackendDate(updatedAt),
		...overrides
	};
}

export function generateProducts(count = 8): Product[] {
	const productCount = Math.max(0, Math.floor(count));
	const names = faker.helpers.uniqueArray(() => faker.commerce.productName(), productCount);

	return names.map((name, index) => generateProduct(index + 1, { name }));
}
