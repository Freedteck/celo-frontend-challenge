// This component is used to display all the books in the marketplace

// Importing the dependencies
import { useState } from "react";
// Import the useContractCall hook to read how many books are in the marketplace via the contract
import { useContractCall } from "@/hooks/contract/useContractRead";
// Import the book and Alert components
import Book from "@/components/Books";
import ErrorAlert from "@/components/alerts/ErrorAlert";
import LoadingAlert from "@/components/alerts/LoadingAlert";
import SuccessAlert from "@/components/alerts/SuccessAlert";

// Define the BookList component
const BookList = () => {
  // Use the useContractCall hook to read how many books are in the marketplace contract
  const { data } = useContractCall("getBooksLength", [], true);
  // Convert the data to a number
  const bookLength = data ? Number(data.toString()) : 0;
  // Define the states to store the error, success and loading messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState("");
  // Define a function to clear the error, success and loading states
  const clear = () => {
    setError("");
    setSuccess("");
    setLoading("");
  };
  // Define a function to return the books
  const getBooks = () => {
    // If there are no books, return null
    if (!bookLength) return null;
    const books = [];
    // Loop through the books, return the book component and push it to the books array
    for (let i = 0; i < bookLength; i++) {
      books.push(
        <Book
          key={i}
          id={i}
          setSuccess={setSuccess}
          setError={setError}
          setLoading={setLoading}
          loading={loading}
          clear={clear}
        />
      );
    }
    return books;
  };

  // Return the JSX for the component
  return (
    <div>
      {/* If there is an alert, display it */}
      {error && <ErrorAlert message={error} clear={clear} />}
      {success && <SuccessAlert message={success} />}
      {loading && <LoadingAlert message={loading} />}
      {/* Display the books */}
      <div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">books</h2>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {/* Loop through the books and return the book component */}
          {getBooks()}
        </div>
      </div>
    </div>
  );
};

export default BookList;