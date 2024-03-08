/* eslint-disable @next/next/no-img-element */
// This component displays and enables the purchase, delete and toggle the status of a book

// Importing the dependencies
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
// Import ethers to format the price of the Book correctly
import { ethers } from "ethers";
// Import the useConnectModal hook to trigger the wallet connect modal
import { useConnectModal } from "@rainbow-me/rainbowkit";
// Import the useAccount hook to get the user's address
import { useAccount } from "wagmi";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import our custom identicon template to display the owner of the Book
import { identiconTemplate } from "@/helpers";
// Import our custom hooks to interact with the smart contract
import { useContractApprove } from "@/hooks/contract/useApprove";
import { useContractCall } from "@/hooks/contract/useContractRead";
import { useContractSend } from "@/hooks/contract/useContractWrite";
import { useMarkAsRead, useMarkAsUnRead } from "@/hooks/contract/useContractMark";
import { useRemove } from "@/hooks/contract/useContractRemove";

// Define the interface for the Book, an interface is a type that describes the properties of an object
interface Book {
  owner: string;
  title: string;
  author: string;
  image: string;
  price: number;
  sold: number;
  isRead: boolean;
}

// Define the Book component which takes in the id of the Book and some functions to display notifications
const Book = ({ id, setError, setLoading, clear }: any) => {
  // Use the useAccount hook to store the user's address
  const { address } = useAccount();
  // Use the useContractCall hook to read the data of the Book with the id passed in, from the marketplace contract
  const { data: rawBook }: any = useContractCall("getBook", [id], true);
  // Use the useContractSend hook to purchase the Book with the id passed in, via the marketplace contract
  const { writeAsync: purchase } = useContractSend("buyBook", [Number(id)]);

  const { writeAsync: mark } = useMarkAsRead("markAsRead", [Number(id)])
  const { writeAsync: unMark } = useMarkAsUnRead("markAsUnread", [Number(id)])
  const { writeAsync: remove } = useRemove("removeBook", [Number(id)])
  const [Book, setBook] = useState<Book | null>(null);
  // Use the useContractApprove hook to approve the spending of the Book's price, for the ERC20 cUSD contract
  const { writeAsync: approve } = useContractApprove(
    Book?.price?.toString() || "0"
  );
  // Use the useConnectModal hook to trigger the wallet connect modal
  const { openConnectModal } = useConnectModal();
  // Format the Book data that we read from the smart contract
  const getFormatBook = useCallback(() => {
    if (!rawBook) return null;
    setBook({
      owner: rawBook[0],
      title: rawBook[1],
      author: rawBook[2],
      image: rawBook[3],
      price: rawBook[4],
      sold: Number(rawBook[5]),
      isRead: rawBook[6]
    });
  }, [rawBook]);

  // Call the getFormatBook function when the rawBook state changes
  useEffect(() => {
    getFormatBook();
  }, [getFormatBook]);

  // Define the handlePurchase function which handles the purchase interaction with the smart contract
  const handlePurchase = async () => {
    if (!approve || !purchase) {
      throw "Failed to purchase this Book";
    }
    // Approve the spending of the Book's price, for the ERC20 cUSD contract
    const approveTx = await approve();
    // Wait for the transaction to be mined, (1) is the number of confirmations we want to wait for
    await approveTx.wait(1);
    setLoading("Purchasing...");
    // Once the transaction is mined, purchase the Book via our marketplace contract buyBook function
    const res = await purchase();
    // Wait for the transaction to be mined
    await res.wait();
  };

  const handleMark = async () => {
    if (!Book?.isRead) {
      if (!mark) {
        throw "Failed to mark this book as read";
      }
      setLoading("Marking...");
      // Once the transaction is mined, purchase the Book via our marketplace contract buyBook function
      const res = await mark();
      res.wait()

    } else {
      if (!unMark) {
        throw "Failed to Unmark this book as read";
      }
      setLoading("UnMarking...");
      // Once the transaction is mined, purchase the Book via our marketplace contract buyBook function
      const res = await unMark();
      // Wait for the transaction to be mined
      res.wait()
    }
  };

  const handleRemove = async () => {
    if (!remove) {
      throw "Failed to mark this book as read";
    }

    const res = await remove();
    setLoading("Removing Book...");
    // Once the transaction is mined, purchase the Book via our marketplace contract buyBook function
    res.wait()
  }
  // const handleUnMark = async () => {


  // }

  // Define the purchaseBook function that is called when the user clicks the purchase button
  const purchaseBook = async () => {
    setLoading("Approving ...");
    clear();

    try {
      // If the user is not connected, trigger the wallet connect modal
      if (!address && openConnectModal) {
        openConnectModal();
        return;
      }
      // If the user is connected, call the handlePurchase function and display a notification
      await toast.promise(handlePurchase(), {
        pending: "Purchasing Book...",
        success: "Book purchased successfully",
        error: "Failed to purchase Book",
      });
      // If there is an error, display the error message
    } catch (e: any) {
      console.log({ e });
      toast.error(e?.reason || e?.message || "Something went wrong. Try again.");
      // Once the purchase is complete, clear the loading state
    } finally {
      setLoading(null);
    }
  };

  // Define the markBook function that is called when the user clicks the toggle button
  const markBook = async () => {
    setLoading("Approving ...");
    clear();

    try {
      // If the user is not connected, trigger the wallet connect modal
      if (!address && openConnectModal) {
        openConnectModal();
        return;
      }
      // If the user is connected, call the handleMark function and display a notification
      await toast.promise(handleMark(), {
        pending: "Marking Book...",
        success: "Book Read status changed successfully",
        error: "Failed to change Read status",
      });
      // If there is an error, display the error message
    } catch (e: any) {
      console.log({ e });
      toast.error(e?.reason || e?.message || "Something went wrong. Try again.");
      // Once the purchase is complete, clear the loading state
    } finally {
      setLoading(null);
    }
  };

  const removeBook = async () => {
    setLoading("Approving ...");
    clear();

    try {
      // If the user is not connected, trigger the wallet connect modal
      if (!address && openConnectModal) {
        openConnectModal();
        return;
      }
      // If the user is connected, call the handleRemove function and display a notification
      await toast.promise(handleRemove(), {
        pending: "Removing Book...",
        success: "Book has been removed successfully",
        error: "Failed to Remove Book",
      });
      // If there is an error, display the error message
    } catch (e: any) {
      console.log({ e });
      toast.error(e?.reason || e?.message || "Something went wrong. Try again.");
      // Once the purchase is complete, clear the loading state
    } finally {
      setLoading(null);
    }
  };
  // const unMarkBook = async () => {
  //   setLoading("Approving ...");
  //   clear();

  //   try {
  //     // If the user is not connected, trigger the wallet connect modal
  //     if (!address && openConnectModal) {
  //       openConnectModal();
  //       return;
  //     }
  //     // If the user is connected, call the handleMark function and display a notification
  //     await toast.promise(handleUnMark(), {
  //       pending: "Marking Book...",
  //       success: "Book Read status changed successfully",
  //       error: "Failed to change Read status",
  //     });
  //     // If there is an error, display the error message
  //   } catch (e: any) {
  //     console.log({ e });
  //     setError(e?.reason || e?.message || "Something went wrong. Try again.");
  //     // Once the purchase is complete, clear the loading state
  //   } finally {
  //     setLoading(null);
  //   }
  // };

  // If the Book cannot be loaded, return null
  if (!Book) return null;

  // Format the price of the Book from wei to cUSD otherwise the price will be way too high
  const BookPriceFromWei = ethers.utils.formatEther(
    Book.price.toString()
  );

  // Return the JSX for the Book component
  return (
    <div className={"shadow-lg relative rounded-b-lg"}>
      <div className="group">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-white xl:aspect-w-7 xl:aspect-h-8 ">
          {/* Show the number of Books sold */}
          <span
            className={
              "absolute z-10 right-0 mt-4 bg-amber-400 text-black p-1 me-2 rounded px-4"
            }
          >
            {Book.sold} sold
          </span>
          <div className="absolute text-white top-0 z-10 p-1 start-0 bg-red-700 mt-4 ms-2 px-4 py-1 rounded hover:bg-red-800" onClick={removeBook} style={{ cursor: "pointer" }}>
            Delete
          </div>
          {/* Show the Book image */}
          <img
            src={Book.image}
            alt={"image"}
            className="w-full h-80 rounded-t-md  object-cover object-center group-hover:opacity-75"
          />
          {/* Show the address of the Book owner as an identicon and link to the address on the Celo Explorer */}
          <Link
            href={`https://explorer.celo.org/alfajores/address/${Book.owner}`}
            className={"absolute -mt-7 ml-6 h-16 w-16 rounded-full"}
          >
            {identiconTemplate(Book.owner)}
          </Link>
        </div>

        <div className={"m-5"}>
          <div className={"pt-1"}>
            {/* Show the Book name */}
            <p className="mt-4 text-2xl font-bold">{Book.title}</p>
            <div className={"h-20 overflow-y-hidden scrollbar-hide"}>
              {/* Show the Book description */}
              <h3 className="mt-4 text-1xl text-gray-700">
                By {Book.author}
              </h3>
            </div>
          </div>

          <div>
            <div className={"flex flex-row"}>
              {/* Show the Book location */}
              <h3 className="pt-1 text-sm text-gray-700">I have {Book.isRead ? 'Read' : 'Not Read'} this Book</h3>
            </div>

            {/* Toggle button that calls the markAsRead function on click */}
            <button
              onClick={markBook}
              className="mt-4 h-14 w-full border-[1px] border-gray-500 text-black p-2 rounded-lg hover:bg-black hover:text-white"
            >
              {/* Show the Book price in cUSD */}
              Toggle Read Status
            </button>

            {/* Buy button that calls the purchaseBook function on click */}
            <button
              onClick={purchaseBook}
              className="mt-4 h-14 w-full border-[1px] border-gray-500 text-black p-2 rounded-lg hover:bg-black hover:text-white"
            >
              {/* Show the Book price in cUSD */}
              Buy for {BookPriceFromWei} cUSD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;