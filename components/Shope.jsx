import React, { useState,useEffect } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useGetProductsByCatagoryQuery } from "../redux/api/productsSlice";
import ProductFilter from "./ProductFilter";
import {
  useGetMainCategoriesQuery,
  useGetChildCategoriesQuery,
  useGetSubCategoriesQuery,
} from "../redux/api/categorySlice";
import ProductCard from "./ProductCard";

const Shope = () => {
  const { mainCategoryId, childCategoryId, subCategoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const navigate = useNavigate();


  const selectedBrandsParam = searchParams.get('brands');
  const selectedBrands = selectedBrandsParam ? selectedBrandsParam.split(',') : [];
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  
  const condition = searchParams.get('condition') ? searchParams.get('condition').split(',') : []; 
  const commonFiltersParam = searchParams.get('commonFilters');
  const commonFilters = commonFiltersParam ? commonFiltersParam.split(',') : []; // New line for common filters
  
  const filterParams = Object.fromEntries(searchParams.entries());
  const [dummyState, setDummyState] = useState(0); // Forcing re-renders

  
  const {
    data: mainCategories = [],
    error: categoryError,
    isLoading: categoryLoading,
  } = useGetMainCategoriesQuery();
  const { data: childCategories = [] } =
    useGetChildCategoriesQuery(mainCategoryId);
  const { data: subCategories = [] } = useGetSubCategoriesQuery({
    mainCategoryId,
    childCategoryId,
  });

  // Fetch products based on category
  const {
    data: productsData,
    error: productError,
    isLoading: productLoading,
  } = useGetProductsByCatagoryQuery({
    mainCategoryId,
    childCategoryId,
    subCategoryId,
    selectedBrands,
    minPrice,
    maxPrice,
    page: 1,
    limit: 12,
    condition,
    commonFilters, // Pass commonFilters to the query
    ...filterParams,
  });

  console.log("brands",productsData?.brands)

  const currentMainCategory = mainCategories.find(
    (category) => category._id === mainCategoryId
  );
  const currentChildCategory = childCategories.find(
    (category) => category._id === childCategoryId
  );
  const currentSubCategory = subCategories.find(
    (category) => category._id === subCategoryId
  );

  const handleCategoryClick = (mainId, childId, subId) => {
    const url = `/products/${mainId}${childId ? `/${childId}` : ""}${
      subId ? `/${subId}` : ""
    }?page=1`;
    navigate(url);
  };

  const handleProductClick = (productId) => {
    navigate(`/productdetail/${productId}`);
  };

  const handlePageChange = (page) => {
    navigate(
      `/products/${mainCategoryId}${
        childCategoryId ? `/${childCategoryId}` : ""
      }${subCategoryId ? `/${subCategoryId}` : ""}?page=${page}`
    );
  };

  const handleFilterChange = (key, values) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (key === 'minPrice' || key === 'maxPrice') {
      if (values !== undefined && values !== '') {
        newSearchParams.set(key, values);
      } else {
        newSearchParams.delete(key);
      }
    } else {
      if (Array.isArray(values) && values.length) {
        newSearchParams.set(key, values.join(','));
      } else {
        newSearchParams.delete(key);
      }
    }

    setSearchParams(newSearchParams);
    setIsLocalLoading(true);
  };


  const clearFilters = () => {
    const newSearchParams = new URLSearchParams();
    console.log("Before setting new search params:", searchParams.toString());
    setSearchParams(newSearchParams);
    setDummyState(prev => prev + 1); // Force a re-render
    console.log("Clearing filters, setting new search params:", newSearchParams.toString());
  };
  console.log("Shope component rendered");
  useEffect(() => {
    console.log("Updated searchParams:", searchParams.toString());
  }, [searchParams]);


  useEffect(() => {
    if (productError && !productLoading) {
      setIsLocalLoading(true);
    } else if (!productError && productLoading) {
      setIsLocalLoading(false);
    }
  }, [productLoading]);

  useEffect(() => {
    if (productsData) {
      setIsLocalLoading(false);
    }
  }, [productsData]);


  // // Calculate total pages based on totalCount
  // const productsPerPage = 12;
  // const totalPages = Math.ceil(totalCount / productsPerPage);

  if (productLoading || categoryLoading)
    return <div className="text-center p-4">Loading products...</div>;
  if (productError || categoryError)
    return (
      <div className="text-center p-4 text-red-500">Error loading products</div>
    );

  return (
    <div className="p-6">
      <div className="flex">
        <div className="w-1/4 p-4">
          <div className="mb-4">
            <h2 className="text-xl">
              Current Category:
              <span
                onClick={() => handleCategoryClick(mainCategoryId)}
                className="cursor-pointer text-blue-500"
              >
                {currentMainCategory ? currentMainCategory.name : "N/A"}
              </span>
            </h2>
            {currentChildCategory && (
              <>
                <h3 className="text-lg">
                  Child Category:
                  <span
                    onClick={() =>
                      handleCategoryClick(mainCategoryId, childCategoryId)
                    }
                    className="cursor-pointer text-blue-500"
                  >
                    {currentChildCategory.name}
                  </span>
                </h3>
                {currentSubCategory ? (
                  <h4 className="text-md">
                    Sub Category: {currentSubCategory.name}
                  </h4>
                ) : (
                  <>
                    <h4 className="text-md">Sub Categories:</h4>
                    <ul className="list-disc pl-5">
                      {subCategories.map((sub) => (
                        <li
                          key={sub._id}
                          onClick={() =>
                            handleCategoryClick(
                              mainCategoryId,
                              childCategoryId,
                              sub._id
                            )
                          }
                          className="cursor-pointer text-blue-500"
                        >
                          {sub.name}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
            {!currentChildCategory && (
              <>
                <h3 className="text-lg">Child Categories:</h3>
                <ul className="list-disc pl-5">
                  {childCategories.map((child) => (
                    <li
                      key={child._id}
                      onClick={() =>
                        handleCategoryClick(mainCategoryId, child._id)
                      }
                      className="cursor-pointer text-blue-500"
                    >
                      {child.name}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Product Filter Component */}
          <ProductFilter
            brands={productsData?.brands || []}
            filters={productsData?.filters || []}
            commonFilters={productsData?.commonFilters || []}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="w-3/4 p-4">
          <h1 className="text-3xl font-bold mb-6">Products</h1>
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
            <h2 className="sr-only">Products</h2>
            {isLocalLoading || productLoading ? (
          <p className="text-center">Loading products...</p>
        ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {productsData?.products?.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onClick={handleProductClick}
                />
              ))}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      {/* <div className="flex justify-center mt-4">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
            <div className="flex justify-between mt-4">
                <button 
                    disabled={currentPage === 1} 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Previous
                </button>
                <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Next
                </button>
            </div> */}
    </div>
  );
};

export default Shope;
