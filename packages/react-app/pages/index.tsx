// This is the main page of the app

// Import the AddProductModal and ProductList components
import AddProductModal from "@/components/modal/AddBookModal";
import ProductList from "@/components/BookList";

// Export the Home component
export default function Home() {
  return (
    <div>
        <AddProductModal />
        <ProductList />
    </div>
  )
}