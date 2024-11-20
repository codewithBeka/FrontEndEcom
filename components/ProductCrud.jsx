import React, { useState } from 'react';
import ProductForm from './ProductForm';
import { useDeleteProductMutation, useGetProductsQuery } from '../redux/api/productsSlice';

function ProductCrud() {
    const [currentPage, setCurrentPage] = useState(1);
    const { data, isLoading, error } = useGetProductsQuery({ page: currentPage });
    const [deleteProduct] = useDeleteProductMutation();
    const [isOpen, setIsOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
        }
    };

    const handleNextPage = () => {
        if (data && currentPage < Math.ceil(data.totalCount / 12)) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>; // Loading indicator
    }

    if (error) {
        return <div className="text-red-500">Error loading products: {error.message}</div>; // Error message
    }

    const products = Array.isArray(data?.products) ? data.products : []; // Ensure products is an array
console.log(products)
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-black text-white">
                <thead>
                    <tr className="border-b border-gray-700">
                        <th className="py-2">Name</th>
                        <th className="py-2">Brand</th>
                        <th className="py-2">Price</th>
                        <th className="py-2">Quantity</th>
                        <th className="py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product._id} className="border-b border-gray-700">
                            <td className="py-2">{product.name}</td>
                            <td className="py-2">{product.brand?.values[0] || 'N/A'}</td> {/* Accessing the brand value */}
                            <td className="py-2">${product.price.toFixed(2)}</td>
                            <td className="py-2">{product.quantity}</td>
                            <td className="py-2">
                                <button
                                    onClick={() => {
                                        setProductToEdit(product);
                                        setIsOpen(true);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between mt-4">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="self-center text-white">Page {currentPage}</span>
                <button
                    onClick={handleNextPage}
                    disabled={data && currentPage >= Math.ceil(data.totalCount / 12)}
                    className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-900 p-6 rounded">
                        <ProductForm productToEdit={productToEdit} onClose={() => { setIsOpen(false); setProductToEdit(null); }} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductCrud;