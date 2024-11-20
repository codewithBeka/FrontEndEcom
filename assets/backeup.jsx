


// import React, { useState, useEffect, useMemo } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { useGetProductsQuery } from '../redux/api/productsSlice';
// import ProductFilter from './ProductFilter';

// const SearchedProducts = () => {
//     const [filters, setFilters] = useState({ filters: [] });
//     const [selectedBrands, setSelectedBrands] = useState([]);
//     const [availableFilters, setAvailableFilters] = useState([]);
//     const [isLoadingFilters, setIsLoadingFilters] = useState(false);
//     const location = useLocation();
//     const navigate = useNavigate();

//     // Memoize query and search term to avoid recomputation on every render
//     const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
//     const searchTerm = useMemo(() => query.get('searchTerm') || '', [query]);
//     const currentPage = useMemo(() => parseInt(query.get('page')) || 1, [query]);

//     // Initialize filters from URL
//     useEffect(() => {
//         const filtersParam = query.get('filters');
//         if (filtersParam) {
//             try {
//                 const parsedFilters = JSON.parse(decodeURIComponent(filtersParam));
//                 setFilters({ filters: parsedFilters });

//                 // Extract selected brands from filters if applicable
//                 const brandsFromFilters = parsedFilters.map(f => f.values).flat();
//                 setSelectedBrands(brandsFromFilters);
//             } catch (error) {
//                 console.warn('Error parsing filters:', error);
//             }
//         }
//     }, [query]);

//     const queryOptions = {
//         brands: selectedBrands,
//         minPrice: filters.minPrice,
//         maxPrice: filters.maxPrice,
//         searchTerm,
//         page: currentPage,
//         filters: filters.filters || [],
//     };

//     const { data: { products = [], totalCount = 0, brands = [], filters: fetchedFilters = [] } = {}, error: productError, isLoading: productLoading } = useGetProductsQuery(queryOptions);

//     // Update available filters when new filters are fetched
//     useEffect(() => {
//         if (fetchedFilters.length > 0) {
//             setAvailableFilters(fetchedFilters);
//         }
//     }, [fetchedFilters]);

//     const handleFilterChange = (newFilters) => {
//         console.log('New Filters:', newFilters);

//         const updatedFilters = {
//             ...filters,
//             filters: newFilters.filters.map(filter => {
//                 if (!filter || !filter.value) return null;
//                 return { filterId: filter.filterId, values: [filter.value] };
//             }).filter(Boolean),
//             minPrice: newFilters.minPrice,
//             maxPrice: newFilters.maxPrice,
//         };

//         setSelectedBrands(newFilters.brands || []);

//         setFilters(updatedFilters);
//         setIsLoadingFilters(true);

//         const filterParams = updatedFilters.filters.length > 0
//             ? `filters=${encodeURIComponent(JSON.stringify(updatedFilters.filters))}`
//             : '';

//         // Only navigate if filters have actually changed
//         navigate(`/search?searchTerm=${encodeURIComponent(searchTerm)}&page=1&${filterParams}`);
//     };

//     const clearFilters = () => {
//         // Reset filters and reload products
//         setFilters({ filters: [] });
//         setSelectedBrands([]);
//         setIsLoadingFilters(true);

//         // Navigate to the search page without filters
//         navigate(`/search?searchTerm=${encodeURIComponent(searchTerm)}&page=1`);
//     };

//     // Stop loading state once products are loaded
//     useEffect(() => {
//         if (!productLoading && isLoadingFilters) {
//             setIsLoadingFilters(false);
//         }
//     }, [productLoading, isLoadingFilters]);

//     if (isLoadingFilters || productLoading) {
//         return <div className="text-center p-4">Loading products...</div>;
//     }

//     if (productError) {
//         return <div className="text-center p-4 text-red-500">Error loading products</div>;
//     }

//     const totalPages = Math.ceil(totalCount / 12);

//     return (
//         <div className="p-6">
//             <h1 className="text-3xl font-bold mb-6">Search Results for: "{searchTerm}"</h1>
//             <h2 className="text-xl mb-4">{totalCount} product(s) found.</h2>
//             <ProductFilter 
//                 onFilterChange={handleFilterChange} 
//                 brands={brands} 
//                 selectedBrands={selectedBrands} 
//                 filters={availableFilters} 
//                 clearFilters={clearFilters}
//             />
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//                 {totalCount > 0 ? (
//                     products.map(product => (
//                         <div 
//                             key={product._id}
//                             className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
//                         >
//                             <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
//                             <div className="p-4">
//                                 <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
//                                 <p className="text-gray-600 mb-2">{product.description}</p>
//                                 <p className="text-lg font-bold text-green-600">${product.price}</p>
//                             </div>
//                         </div>
//                     ))
//                 ) : (
//                     <div className="text-center p-4">No products found.</div>
//                 )}
//             </div>
//             {totalPages > 1 && (
//                 <div className="flex justify-center mt-4">
//                     {Array.from({ length: totalPages }, (_, index) => (
//                         <button
//                             key={index + 1}
//                             onClick={() => navigate(`/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${index + 1}`)}
//                             className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
//                         >
//                             {index + 1}
//                         </button>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default SearchedProducts;



// import React, { useState, useEffect } from 'react';

// const ProductFilter = ({ onFilterChange, brands = [], filters = [] }) => {
//     const [minPrice, setMinPrice] = useState('');
//     const [maxPrice, setMaxPrice] = useState('');
//     const [selectedFilters, setSelectedFilters] = useState({});
//     const [selectedBrands, setSelectedBrands] = useState([]);

//     // Load filters from local storage on mount
//     useEffect(() => {
//         const savedSelectedFilters = localStorage.getItem('selectedFilters');
//         const savedSelectedBrands = localStorage.getItem('selectedBrands');

//         if (savedSelectedFilters) {
//             setSelectedFilters(JSON.parse(savedSelectedFilters));
//         }

//         if (savedSelectedBrands) {
//             setSelectedBrands(JSON.parse(savedSelectedBrands));
//         }
//     }, []);

//     // Update local storage whenever selected filters or brands change
//     useEffect(() => {
//         localStorage.setItem('selectedFilters', JSON.stringify(selectedFilters));
//         localStorage.setItem('selectedBrands', JSON.stringify(selectedBrands));
//     }, [selectedFilters, selectedBrands]);

//     // Initialize selectedFilters when filters change
//     useEffect(() => {
//         const initialSelectedFilters = filters.reduce((acc, filter) => {
//             acc[filter._id] = acc[filter._id] || [];
//             return acc;
//         }, {});
//         setSelectedFilters(initialSelectedFilters);
//     }, [filters]);

//     // Apply filters
//     const applyFilters = () => {
//         const filterArray = Object.entries(selectedFilters).flatMap(([filterId, values]) =>
//             values.map(value => ({ filterId, value }))
//         );

//         const filterData = {
//             brands: selectedBrands,
//             minPrice: minPrice ? Number(minPrice) : undefined,
//             maxPrice: maxPrice ? Number(maxPrice) : undefined,
//             filters: filterArray,
//         };

//         onFilterChange(filterData);
//     };

//     // Handle changes to the filter checkboxes
//     const handleFilterChange = (filterId, value) => {
//         setSelectedFilters(prev => {
//             const currentValues = prev[filterId] || [];
//             if (currentValues.includes(value)) {
//                 return {
//                     ...prev,
//                     [filterId]: currentValues.filter(v => v !== value),
//                 };
//             } else {
//                 return {
//                     ...prev,
//                     [filterId]: [...currentValues, value],
//                 };
//             }
//         });
//     };

//     // Handle brand selection changes
//     const handleBrandChange = (brand) => {
//         const newSelectedBrands = selectedBrands.includes(brand)
//             ? selectedBrands.filter(b => b !== brand)
//             : [...selectedBrands, brand];

//         setSelectedBrands(newSelectedBrands);
//     };

//     // Clear all filters
//     const clearFilters = () => {
//         setMinPrice('');
//         setMaxPrice('');
//         setSelectedFilters(filters.reduce((acc, filter) => {
//             acc[filter._id] = [];
//             return acc;
//         }, {}));
//         setSelectedBrands([]);
//         onFilterChange({ brands: [], minPrice: undefined, maxPrice: undefined, filters: [] });
//     };

//     return (
//         <div className="p-4 border border-gray-200 rounded-lg mb-6">
//             <h2 className="text-lg font-bold mb-4">Filters</h2>

//             {/* Brand Filter */}
//             <div className="mb-4">
//                 <label className="block mb-1">Brand</label>
//                 <ul className="list-disc pl-5">
//                     {brands.map(brand => (
//                         <li key={brand} className="flex items-center mb-2">
//                             <input
//                                 type="checkbox"
//                                 id={brand}
//                                 checked={selectedBrands.includes(brand)}
//                                 onChange={() => handleBrandChange(brand)}
//                                 className="mr-2"
//                             />
//                             <label htmlFor={brand} className="cursor-pointer">{brand}</label>
//                         </li>
//                     ))}
//                 </ul>
//             </div>

//             {/* Price Range Filter */}
//             <div className="mb-4">
//                 <label className="block mb-1">Price Range</label>
//                 <input
//                     type="number"
//                     placeholder="Min Price"
//                     value={minPrice}
//                     onChange={(e) => setMinPrice(e.target.value)}
//                     className="border border-gray-300 rounded-md p-2 w-full mb-2"
//                 />
//                 <input
//                     type="number"
//                     placeholder="Max Price"
//                     value={maxPrice}
//                     onChange={(e) => setMaxPrice(e.target.value)}
//                     className="border border-gray-300 rounded-md p-2 w-full"
//                 />
//             </div>

//             {/* Product Filters */}
//             <div className="mb-4">
//                 <label className="block mb-1">Product Filters</label>
//                 {filters.map(filter => (
//                     <div key={filter._id} className="mb-2">
//                         <h4 className="font-semibold">{filter.filterType}</h4>
//                         {filter.values.map(value => (
//                             <label key={value} className="flex items-center mb-1">
//                                 <input
//                                     type="checkbox"
//                                     checked={selectedFilters[filter._id]?.includes(value) || false}
//                                     onChange={() => handleFilterChange(filter._id, value)}
//                                     className="mr-2"
//                                 />
//                                 {value}
//                             </label>
//                         ))}
//                     </div>
//                 ))}
//             </div>

//             {/* Apply and Clear Filters Buttons */}
//             <button onClick={applyFilters} className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2">
//                 Apply Filters
//             </button>
//             <button onClick={clearFilters} className="bg-gray-300 text-black px-4 py-2 rounded-md">
//                 Clear Filters
//             </button>
//         </div>
//     );
// };

// export default ProductFilter;