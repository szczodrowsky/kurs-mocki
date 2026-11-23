const products = '/api/v1/products';

export const apiEndpoints = {
	products,
	product: (id: number) => `${products}/${id}`,
	productSearch: `${products}/search`,
	cartItems: '/api/v1/cart/items',
	currentUser: '/api/v1/users/me',
	signIn: '/api/v1/users/signin'
};
