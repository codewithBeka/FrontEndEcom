import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ searchTerm, selectedBrands, minPrice, maxPrice, condition, commonFilters, page = 1, limit = 12, ...filters }) => {
        const params = new URLSearchParams();

        // Add search term if provided
        if (searchTerm) params.append('searchTerm', searchTerm);
        if (selectedBrands) params.append('brands', selectedBrands);
        if (minPrice !== undefined && !isNaN(minPrice)) params.append('minPrice', Number(minPrice));
        if (maxPrice !== undefined && !isNaN(maxPrice)) params.append('maxPrice', Number(maxPrice));
        if (condition) params.append('condition', condition);
        
        // Add dynamic filters
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            params.append(key, value.join(','));
          } else if (value && typeof value === 'string') {
            params.append(key, value);
          }
        });

        params.append('page', page);
        params.append('limit', limit);

        return `api/products/search?${params.toString()}`;
      },

      transformResponse: (response) => {
        const products = response.products || [];
        const brands = response.brands || [];
        const filters = response.filters || [];
        const commonFilters = response.commonFilters || [];

        return {
          products,
          totalCount: response.totalCount || 0,
          brands,
          filters,
          commonFilters,
        };
      },
    }),
    getProductsByCatagory: builder.query({
      query: ({  mainCategoryId,childCategoryId,subCategoryId, selectedBrands, minPrice, maxPrice, condition, commonFilters, page = 1, limit = 12, ...filters }) => {
        const params = new URLSearchParams();

        
    // Add category IDs if provided
        if (mainCategoryId) params.append('mainCategoryId', mainCategoryId);
        if (childCategoryId) params.append('childCategoryId', childCategoryId);
        if (subCategoryId) params.append('subCategoryId', subCategoryId);

        if (selectedBrands) params.append('brands', selectedBrands);
        if (minPrice !== undefined && !isNaN(minPrice)) params.append('minPrice', Number(minPrice));
        if (maxPrice !== undefined && !isNaN(maxPrice)) params.append('maxPrice', Number(maxPrice));
        if (condition) params.append('condition', condition);
        
        // Add dynamic filters
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            params.append(key, value.join(','));
          } else if (value && typeof value === 'string') {
            params.append(key, value);
          }
        });

        params.append('page', page);
        params.append('limit', limit);

        return `api/products/category?${params.toString()}`;
      },

      transformResponse: (response) => {
        const products = response.products || [];
        const brands = response.brands || [];
        const filters = response.filters || [];
        const commonFilters = response.commonFilters || [];

        return {
          products,
          totalCount: response.totalCount || 0,
          brands,
          filters,
          commonFilters,
        };
      },
    }),

    createProduct: builder.mutation({
      query: (newProduct) => ({
        url: "api/products",
        method: "POST",
        body: newProduct,
      }),
      async onQueryStarted(newProduct, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productApi.util.updateQueryData("getProducts", undefined, (draft) => {
            draft.push(newProduct); // Optimistically add the new product
          })
        );
        try {
          const { data } = await queryFulfilled; // Wait for the mutation to complete
          patchResult.undo(); // Undo optimistic update
          dispatch(
            productApi.util.updateQueryData("getProducts", undefined, (draft) => {
              draft.push(data); // Add the actual product from the server
            })
          );
        } catch {
          patchResult.undo(); // If it fails, undo the optimistic update
        }
      },
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `api/products/${id}`,
        method: "PUT",
        body: patch,
      }),
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productApi.util.updateQueryData("getProducts", undefined, (draft) => {
            const product = draft.find((product) => product.id === id);
            if (product) {
              Object.assign(product, patch); // Optimistically update the product
            }
          })
        );
        try {
          const { data } = await queryFulfilled; // Wait for the mutation to complete
          patchResult.undo(); // Undo optimistic update
          dispatch(
            productApi.util.updateQueryData("getProducts", undefined, (draft) => {
              const productIndex = draft.findIndex((product) => product.id === id);
              if (productIndex >= 0) {
                draft[productIndex] = data; // Update with the actual product from the server
              }
            })
          );
        } catch {
          patchResult.undo(); // If it fails, undo the optimistic update
        }
      },
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `api/products/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productApi.util.updateQueryData("getProducts", undefined, (draft) => {
            return draft.filter((product) => product.id !== id); // Optimistically remove the product
          })
        );
        try {
          await queryFulfilled; // Wait for the mutation to complete
        } catch {
          patchResult.undo(); // If it fails, undo the optimistic update
        }
      },
    }),

    getBrands: builder.query({
      query: () => "api/brands",
      transformResponse: (response) => {
        return response.brands || []; // Transform response to return brands
      },
    }),

    getProductById: builder.query({
      query: (id) => `api/products/${id}`,
      transformResponse: (response) => {
        return {
          product: response.product,
          relatedProducts: response.relatedProducts,
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetProductsQuery,
  useGetProductsByCatagoryQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useGetBrandsQuery,
} = productApi;