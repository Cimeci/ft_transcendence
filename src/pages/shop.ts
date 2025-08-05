export function ShopPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.textContent = "Shop";
	mainContainer.className = "flex justify-content-center align-items-center text-blue-500";
	return (mainContainer);
}