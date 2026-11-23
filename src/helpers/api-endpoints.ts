const products = '/api/v1/products';
const cart = '/api/v1/cart';
const cartItems = `${cart}/items`;

export const apiEndpoints = {
	products,
	product: (id: number) => `${products}/${id}`,
	productSearch: `${products}/search`,
	cart,
	cartItems,
	cartItem: (productId: number) => `${cartItems}/${productId}`,
	currentUser: '/api/v1/users/me',
	signIn: '/api/v1/users/signin',
	signUp: '/api/v1/users/signup'
};
