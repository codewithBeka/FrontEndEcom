// src/components/ProductManager.js
import React, { useState } from 'react';
import ProductForm from './ProductForm';
import ProductCrud from './ProductCrud';

const ProductManager = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Product Manager</h1>
            <button
                onClick={() => {
                    setProductToEdit(null);
                    setIsOpen(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded mb-4"
            >
                Add Product
            </button>
            <ProductCrud />
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-900 p-6 rounded">
                        <ProductForm productToEdit={productToEdit} onClose={() => setIsOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManager;