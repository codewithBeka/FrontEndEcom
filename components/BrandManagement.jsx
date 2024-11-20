import React, { useState } from 'react';
import {
    useGetBrandsQuery,
    useCreateBrandMutation,
    useUpdateBrandMutation,
    useDeleteBrandMutation,
} from '../redux/api/brandSlice';
import { useGetMainCategoriesQuery, useGetChildCategoriesQuery, useGetSubCategoriesQuery } from '../redux/api/categorySlice';
import MediaUploadModal from './MediaUploadModal'; // Import your modal component
import { useDeleteMediaMutation } from '../redux/api/mediaSlice';

const BrandManagement = () => {
    const { data: brands = [], isLoading: loadingBrands } = useGetBrandsQuery();
    const { data: mainCategories = [], isLoading: loadingMainCategories } = useGetMainCategoriesQuery();

    const [createBrand] = useCreateBrandMutation();
    const [updateBrand] = useUpdateBrandMutation();
    const [deleteBrand] = useDeleteBrandMutation();
    const [deleteMedia] = useDeleteMediaMutation();

    const [editMode, setEditMode] = useState(false);
    const [currentBrand, setCurrentBrand] = useState({});
    const [selectedMainCategory, setSelectedMainCategory] = useState('');
    const [selectedChildCategory, setSelectedChildCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [values, setValues] = useState([{ value: '', images: [] }]); // Updated structure to include images
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

    const { data: childCategories = [], isLoading: loadingChildCategories } = useGetChildCategoriesQuery(selectedMainCategory, { skip: !selectedMainCategory });
    const { data: subCategories = [], isLoading: loadingSubCategories } = useGetSubCategoriesQuery({ mainCategoryId: selectedMainCategory, childCategoryId: selectedChildCategory }, { skip: !selectedChildCategory });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const brandData = {
            categoryId: selectedMainCategory,
            childCategoryId: selectedChildCategory,
            subCategoryId: selectedSubCategory,
            values,
        };

        if (editMode) {
            await updateBrand({ id: currentBrand._id, ...brandData });
        } else {
            await createBrand(brandData);
        }

        e.target.reset();
        resetForm();
    };

    const resetForm = () => {
        setEditMode(false);
        setCurrentBrand({});
        setSelectedMainCategory('');
        setSelectedChildCategory('');
        setSelectedSubCategory('');
        setValues([{ value: '', images: [] }]); // Reset values to default structure
    };

    const handleEdit = (brand) => {
        setCurrentBrand(brand);
        setEditMode(true);
        setSelectedMainCategory(brand.categoryId);
        setSelectedChildCategory(brand.childCategoryId);
        setSelectedSubCategory(brand.subCategoryId);
        setValues(brand.values || [{ value: '', images: [] }]); // Adjust according to your data structure
    };

    const handleDelete = async (id) => {
        await deleteBrand(id);
    };

    const handleUploadComplete = (uploadedImages) => {
        const flatImages = uploadedImages.flat(2);
        // Assuming images are added to the last value in the values array
        setValues(prev => {
            const updatedValues = [...prev];
            updatedValues[updatedValues.length - 1].images = flatImages; // Add images to the last value
            return updatedValues;
        });
    };

    const handleMediaDelete = async (media) => {
        const publicId = media.publicId || media.public_id;
        const resourceType = media.type === 'video' ? 'video' : 'image';

        if (!publicId) {
            console.error('No public ID provided for deletion');
            return;
        }
        
        try {
            await deleteMedia({ public_id: publicId, resource_type: resourceType }).unwrap();
            // Remove the deleted image from the last value's images
            setValues(prev => {
                const updatedValues = [...prev];
                updatedValues[updatedValues.length - 1].images = updatedValues[updatedValues.length - 1].images.filter(item => item.publicId !== publicId);
                return updatedValues;
            });
        } catch (error) {
            console.error('Failed to delete media:', error);
        }
    };

    if (loadingBrands || loadingMainCategories || loadingChildCategories || loadingSubCategories) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Brand Management</h1>
            <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded bg-gray-800">
                <select
                    value={selectedMainCategory}
                    onChange={(e) => {
                        setSelectedMainCategory(e.target.value);
                        setSelectedChildCategory('');
                        setSelectedSubCategory('');
                    }}
                    required
                    className="border border-gray-600 p-2 mb-2 w-full bg-black"
                >
                    <option value="">Select Main Category</option>
                    {mainCategories.map(category => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                </select>

                <select
                    value={selectedChildCategory}
                    onChange={(e) => {
                        setSelectedChildCategory(e.target.value);
                        setSelectedSubCategory('');
                    }}
                    required
                    className="border border-gray-600 p-2 mb-2 w-full bg-black"
                >
                    <option value="">Select Child Category</option>
                    {childCategories.map(child => (
                        <option key={child._id} value={child._id}>{child.name}</option>
                    ))}
                </select>

                <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    required
                    className="border border-gray-600 p-2 mb-2 w-full bg-black"
                >
                    <option value="">Select Sub Category</option>
                    {subCategories.map(sub => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                    ))}
                </select>

                {/* Handling multiple brand values */}
                {values.map((valueObj, index) => (
                    <div key={index} className="mb-2">
                        <input
                            type="text"
                            placeholder="Brand Value"
                            required
                            className="border border-gray-600 p-2 mb-2 w-full"
                            value={valueObj.value}
                            onChange={(e) => {
                                const updatedValues = [...values];
                                updatedValues[index].value = e.target.value;
                                setValues(updatedValues);
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded mb-2"
                        >
                            Upload Images for this Value
                        </button>

                        {/* Display Uploaded Images for each value */}
                        {valueObj.images.length > 0 && (
                            <div className="mb-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {valueObj.images.map((image, imageIndex) => (
                                    <div key={imageIndex} className="relative">
                                        <img src={image.url} alt="Uploaded" className="h-32 w-full object-cover mb-2" />
                                        <button
                                            type="button"
                                            onClick={() => handleMediaDelete(image)}
                                            className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                                        >
                                            &times; {/* Delete icon */}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => setValues([...values, { value: '', images: [] }])}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded mb-2"
                >
                    Add Another Brand Value
                </button>

                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">
                    {editMode ? 'Update Brand' : 'Create Brand'}
                </button>
            </form>

            <table className="min-w-full bg-gray-800">
                <thead>
                    <tr className="text-white">
                        <th className="py-2">Main Category</th>
                        <th className="py-2">Child Category</th>
                        <th className="py-2">Sub Category</th>
                        <th className="py-2">Brand Values</th>
                        <th className="py-2">Images</th> {/* New Column for Images */}
                        <th className="py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {brands.map((brand) => (
                        <tr key={brand._id} className="text-gray-300">
                            <td className="py-2">{brand.categoryId.name}</td>
                            <td className="py-2">{brand.childCategoryId.name}</td>
                            <td className="py-2">{brand.subCategoryId.name}</td>
                            <td className="py-2">{brand.values.map(v => v.value).join(', ')}</td>
                            <td className="py-2">
                                {/* Display Images in the Table */}
                                <div className="flex space-x-2">
                                    {brand.values.map(valueObj => 
                                        valueObj.images.map((image, index) => (
                                            <img key={index} src={image.url} alt="Brand" className="h-12 w-12 object-cover" />
                                        ))
                                    )}
                                </div>
                            </td>
                            <td className="py-2">
                                <button onClick={() => handleEdit(brand)} className="bg-yellow-500 hover:bg-yellow-400 text-white px-2 py-1 rounded mr-2">Edit</button>
                                <button onClick={() => handleDelete(brand._id)} className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Media Upload Modal */}
            {isModalOpen && (
                <MediaUploadModal
                    onClose={() => setIsModalOpen(false)}
                    onUploadComplete={handleUploadComplete}
                />
            )}
        </div>
    );
};

export default BrandManagement;