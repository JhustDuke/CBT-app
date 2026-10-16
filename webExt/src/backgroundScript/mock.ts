import { BackendResponseInterface } from "../interfaces";

const createDarkMockBase64 = function (size: number): string {
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		throw new Error("Canvas context not available");
	}

	// fill with dark color
	ctx.fillStyle = "#222222"; // dark background
	ctx.fillRect(0, 0, size, size);

	// return as PNG Base64 string
	return canvas.toDataURL("image/png").split(",")[1];
};

// Mock backend data
const base64Mock = createDarkMockBase64(200); // 200x200 dark placeholder

export const mockData: BackendResponseInterface[] = [
	{
		id: 1,
		fullName: "John one",
		email: "john@example.com",
		phone: "08012345671",
		course: "medicine",
		imageFile: base64Mock,
	},
	{
		id: 2,
		fullName: "Jane two",
		email: "jane@example.com",
		phone: "08098765432",
		course: "engineering",
		imageFile: base64Mock,
	},
	{
		id: 3,
		fullName: "Alice Smith",
		email: "alice@example.com",
		phone: "08055551233",
		course: "Chemistry",
		imageFile: base64Mock,
	},
];
