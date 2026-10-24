import type { ProductCategory } from '@enums/product-category.enum.js';

export interface Product {
	id: number;
	name: string;
	description: string;
	price: number;
	stockQuantity: number;
	category: ProductCategory;
	imageUrl: string;
	createdAt: string;
	updatedAt: string;
}
