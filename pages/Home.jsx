import { Link, useParams } from "react-router-dom";
import {  useGetProductsQuery } from '../redux/api/productsSlice';
import Loader from "../components/Loader";
import Message from "../components/Message";
import ProductCard from "../components/ProductCard"
import { useState } from "react";

const Home = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useGetProductsQuery({ page: currentPage });
  const products = Array.isArray(data?.products) ? data.products : []; // Ensure products is an array

  console.log("data",data)
  return (
    <>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error}
        </Message>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="ml-[20rem] mt-[10rem] text-[3rem]">
              Special Products
            </h1>

            <Link
              to="/shop"
              className="bg-pink-600 font-bold rounded-full py-2 px-10 mr-[18rem] mt-[10rem]"
            >
              Shop
            </Link>
          </div>

          <div>
         
          </div>
        </>
      )}
    </>
  );
};

export default Home;