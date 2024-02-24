// This component is used to render the AddProductModal component

// Importing the AddProductModal component
import AddBookModal from "./modal/AddBookModal";

// Define the AddProduct component
const AddBook = () => {
    return (
        <div className="flex justify-start">
            {/* Render the AddProductModal component */}
            <AddBookModal />
        </div>
    );
};

export default AddBook;