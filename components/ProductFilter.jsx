import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ProductFilter = ({ brands, filters, commonFilters, onFilterChange,onClearFilters  }) => {
  const [searchParams] = useSearchParams();
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedCommonFilters, setSelectedCommonFilters] = useState({}); 
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Load selected filters from URL params
  useEffect(() => {
    const savedBrands = searchParams.get('brands')?.split(',') || [];
    const savedMinPrice = searchParams.get('minPrice') || '';
    const savedMaxPrice = searchParams.get('maxPrice') || '';
    const savedConditions = searchParams.get('condition')?.split(',') || [];

    const loadedFilters = {};
    filters.forEach(filter => {
      const filterValues = searchParams.get(`filter_${filter.filterType}`)?.split(',') || [];
      loadedFilters[filter.filterType] = filterValues;
    });

    // Load common filters similarly
    const loadedCommonFilters = {};
    commonFilters.forEach(filter => {
      const filterValues = searchParams.get(`commonFilters_${filter.filterType}`)?.split(',') || [];
      loadedCommonFilters[filter.filterType] = filterValues;
    });

    setSelectedBrands(savedBrands);
    setSelectedFilters(loadedFilters);
    setSelectedConditions(savedConditions);
    setSelectedCommonFilters(loadedCommonFilters); 
    setMinPrice(savedMinPrice);
    setMaxPrice(savedMaxPrice);
  }, [filters, searchParams]);

  const handleCommonFilterChange = (filterType, value) => {
    const updatedCommonFilters = { ...selectedCommonFilters };
    if (updatedCommonFilters[filterType]?.includes(value)) {
      updatedCommonFilters[filterType] = updatedCommonFilters[filterType].filter(v => v !== value);
    } else {
      updatedCommonFilters[filterType] = [...(updatedCommonFilters[filterType] || []), value];
    }

    setSelectedCommonFilters(updatedCommonFilters);
    onFilterChange(`commonFilters_${filterType}`, updatedCommonFilters[filterType]);
  }; 

  const handleConditionChange = (condition) => {
    const updatedConditions = selectedConditions.includes(condition)
      ? selectedConditions.filter(c => c !== condition)
      : [...selectedConditions, condition];

    setSelectedConditions(updatedConditions);
    onFilterChange('condition', updatedConditions);
  };

  const handleBrandChange = (brand) => {
    const updatedBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];

    setSelectedBrands(updatedBrands);
    onFilterChange('brands', updatedBrands);
  };

  const handleFilterChange = (filterType, value) => {
    const updatedFilters = { ...selectedFilters };
    if (updatedFilters[filterType]?.includes(value)) {
      updatedFilters[filterType] = updatedFilters[filterType].filter(v => v !== value);
    } else {
      updatedFilters[filterType] = [...(updatedFilters[filterType] || []), value];
    }

    setSelectedFilters(updatedFilters);
    onFilterChange(`filter_${filterType}`, updatedFilters[filterType]);
  };

  const handlePriceChange = () => {
    onFilterChange('minPrice', minPrice !== '' ? minPrice : undefined);
    onFilterChange('maxPrice', maxPrice !== '' ? maxPrice : undefined);
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedFilters({});
    setSelectedConditions([]);
    setSelectedCommonFilters({});
    setMinPrice('');
    setMaxPrice('');
    onClearFilters();

    // Clear all filters in URL
    onFilterChange('brands', []);
    onFilterChange('condition', []);
    onFilterChange('minPrice', undefined);
    onFilterChange('maxPrice', undefined);
    Object.keys(filters).forEach(filterType => {
      onFilterChange(`filter_${filterType}`, []);
    });
    commonFilters.forEach(filter => {
      onFilterChange(`commonFilters_${filter.filterType}`, []);
    });
    console.log("remove filters")
  };

  return (
    <div className="w-full">
      {/* Brands Filter */}
      <div className="mb-4">
        <h3 className="font-bold">Brands</h3>
        {brands.map(brandObj => (
          <div key={brandObj._id} className="flex flex-col">
            {brandObj.values.map((brand, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                  className="mr-2"
                />
                <label>{`${brand} (${brandObj.valueCounts.find(v => v.value === brand)?.productCount || 0})`}</label>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Conditions Filter */}
      <div className="mb-4">
        <h3 className="font-bold">Conditions</h3>
        {["New", "Used", "Refurbished"].map((condition, index) => (
          <div key={index} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedConditions.includes(condition)}
              onChange={() => handleConditionChange(condition)}
              className="mr-2"
            />
            <label>{condition}</label>
          </div>
        ))}
      </div>

      {/* Common Filters */}
      {commonFilters && commonFilters.length > 0 ? (
        commonFilters.map(filter => (
          <div key={filter._id} className="mb-4">
            <h3 className="font-bold">{filter.filterType}</h3>
            {Array.isArray(filter.valueCounts) && filter.valueCounts.length > 0 ? (
              filter.valueCounts.map((valueCount, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCommonFilters[filter.filterType]?.includes(valueCount.value)}
                    onChange={() => handleCommonFilterChange(filter.filterType, valueCount.value)}
                    className="mr-2"
                  />
                  <label>{`${String(valueCount.value)} (${valueCount.productCount})`}</label>
                </div>
              ))
            ) : (
              <p>No values available for this common filter.</p>
            )}
          </div>
        ))
      ) : (
        <p>No common filters available.</p>
      )}

      {/* Other Filters */}
      {filters && filters.length > 0 ? (
        filters.map(filter => (
          <div key={filter._id} className="mb-4">
            <h3 className="font-bold">{filter.filterType}</h3>
            {Array.isArray(filter.valueCounts) && filter.valueCounts.length > 0 ? (
              filter.valueCounts.map((valueCount, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFilters[filter.filterType]?.includes(valueCount.value)}
                    onChange={() => handleFilterChange(filter.filterType, valueCount.value)}
                    className="mr-2"
                  />
                  <label>{`${String(valueCount.value)} (${valueCount.productCount})`}</label>
                </div>
              ))
            ) : (
              <p>No values available for this filter.</p>
            )}
          </div>
        ))
      ) : (
        <p>No filters available.</p>
      )}

      {/* Price Filter */}
      <div className="mb-4">
        <h3 className="font-bold">Price</h3>
        <div className="flex space-x-2 flex-col items-center ">
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border p-2"
          />
          <br/>
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border p-2"
          />
        </div>
        <button
          onClick={handlePriceChange}
          className="mt-2 bg-blue-500 text-white px-4 py-2"
        >
          Apply Price
        </button>
           {/* Clear Filters Button */}
 
      </div>
      <button
        onClick={clearFilters}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default ProductFilter;