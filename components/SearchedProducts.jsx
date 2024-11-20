import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductFilter from './ProductFilter';
import ProductCard from './ProductCard';
import { useGetProductsQuery } from '../redux/api/productsSlice';

const SearchedProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  // Extract URL parameters
  const searchTerm = searchParams.get('searchTerm') || '';
  const selectedBrandsParam = searchParams.get('brands');
  const selectedBrands = selectedBrandsParam ? selectedBrandsParam.split(',') : [];
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  
  const condition = searchParams.get('condition') ? searchParams.get('condition').split(',') : []; 
  const commonFiltersParam = searchParams.get('commonFilters');
  const commonFilters = commonFiltersParam ? commonFiltersParam.split(',') : []; // New line for common filters
  
  const filterParams = Object.fromEntries(searchParams.entries());
  
  // Fetch products with RTK Query based on the search parameters
  const { data, error, isLoading, refetch } = useGetProductsQuery({
    searchTerm,
    selectedBrands,
    minPrice,
    maxPrice,
    page: 1,
    limit: 12,
    condition,
    commonFilters, // Pass commonFilters to the query
    ...filterParams,
  }, { skip: !searchTerm });

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

  useEffect(() => {
    if (isLoading && !isLocalLoading) {
      setIsLocalLoading(true);
    } else if (!isLoading && isLocalLoading) {
      setIsLocalLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (data) {
      setIsLocalLoading(false);
    }
  }, [data]);

  if (error) {
    console.error("Error fetching products:", error);
    return <p className="text-red-500">Error fetching products. Please try again.</p>;
  }

  return (
    <div className="flex">
      {/* Filter Section */}
      <div className="w-1/4 p-4">
        <ProductFilter
          brands={data?.brands || []}
          filters={data?.filters || []}
          commonFilters={data?.commonFilters || []} // Pass common filters to ProductFilter
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Products Section */}
      <div className="w-3/4 p-4">
        <h2 className="text-xl font-bold mb-4">Products</h2>
        
        {isLocalLoading || isLoading ? (
          <p className="text-center">Loading products...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {data?.products?.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onClick={(id) => console.log(`Product clicked: ${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchedProducts;