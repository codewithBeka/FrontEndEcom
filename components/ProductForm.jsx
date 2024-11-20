import React, { useState, useEffect } from 'react';
import {
    useGetChildCategoriesQuery,
    useGetMainCategoriesQuery,
    useGetSubCategoriesQuery,
} from '../redux/api/categorySlice';
import { useCreateProductMutation, useUpdateProductMutation } from '../redux/api/productsSlice';
import { useGetFiltersQuery } from '../redux/api/filterSlice';
import { useGetCommonFiltersQuery } from '../redux/api/commonFilterSlice';
import { useDeleteMediaMutation } from '../redux/api/mediaSlice';
import { useGetBrandsQuery } from '../redux/api/brandSlice';
import MediaUploadModal from './MediaUploadModal';

const ProductForm = ({ productToEdit, onClose }) => {
    const [name, setName] = useState('');
    const [brandId, setBrandId] = useState('');
    const [selectedBrandValue, setSelectedBrandValue] = useState('');
    const [uploadedMedia, setUploadedMedia] = useState([]);
    const [quantity, setQuantity] = useState(0);
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [countInStock, setCountInStock] = useState(0);
    const [mainCategory, setMainCategory] = useState('');
    const [childCategory, setChildCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [filterValues, setFilterValues] = useState({});
    const [commonFilterValues, setCommonFilterValues] = useState({});
    const [condition, setCondition] = useState('New');
    const [discounts, setDiscounts] = useState([]); // State for discounts
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const { data: mainCategories = [], isLoading: mainCategoriesLoading } = useGetMainCategoriesQuery();
    const { data: childCategories = [], isLoading: childCategoriesLoading } = useGetChildCategoriesQuery(mainCategory, { skip: !mainCategory });
    const { data: subCategories = [], isLoading: subCategoriesLoading } = useGetSubCategoriesQuery(
        { mainCategoryId: mainCategory, childCategoryId: childCategory },
        { skip: !mainCategory || !childCategory }
    );

    const { data: brands = [], isLoading: brandsLoading } = useGetBrandsQuery({
        mainCategoryId: mainCategory,
        childCategoryId: childCategory,
        subCategoryId: subCategory,
    });

    const { data: filters = [] } = useGetFiltersQuery();
    const { data: commonFilters = [] } = useGetCommonFiltersQuery();
    const [createProduct] = useCreateProductMutation();
    const [updateProduct] = useUpdateProductMutation();
    const [deleteMedia] = useDeleteMediaMutation();

    useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name || '');
            setBrandId(productToEdit.brand?.brandId || '');
            setSelectedBrandValue(productToEdit.brand?.values[0] || '');
            setQuantity(productToEdit.quantity || 0);
            setDescription(productToEdit.description || '');
            setPrice(productToEdit.price || 0);
            setCountInStock(productToEdit.countInStock || 0);
            setMainCategory(productToEdit.mainCategory?._id || '');
            setChildCategory(productToEdit.childCategory?._id || '');
            setSubCategory(productToEdit.subCategory?._id || '');
            setUploadedMedia(productToEdit.media || []);
            setCondition(productToEdit.condition || 'New');
            setDiscounts(productToEdit.discounts || []); // Set existing discounts

            const currentFilterValues = {};
            productToEdit.filters.forEach(filter => {
                const filterId = filter.filterId._id; 
                currentFilterValues[filterId] = filter.values.join(',');
            });
            setFilterValues(currentFilterValues);

            const currentCommonFilterValues = {};
            productToEdit.commonFilters.forEach(commonFilter => {
                const commonFilterId = commonFilter.commonFilterId._id;
                currentCommonFilterValues[commonFilterId] = commonFilter.values.join(',');
            });
            setCommonFilterValues(currentCommonFilterValues);
        } else {
            setFilterValues({});
            setCommonFilterValues({});
            setCondition('New');
            setDiscounts([]); // Reset discounts
        }
    }, [productToEdit]);

    const handleUploadComplete = (newMedia) => {
        const flattenedMedia = newMedia.flat();
        setUploadedMedia(prev => [...prev, ...flattenedMedia]);
    };

    const handleMediaDelete = async (media) => {
        const publicId = media.publicId || media.public_id;
        const resourceType = media.type === 'video' ? 'video' : 'image';

        if (!publicId) return;

        try {
            await deleteMedia({ public_id: publicId, resource_type: resourceType }).unwrap();
            setUploadedMedia(prev => prev.filter(item => item.publicId !== publicId));
        } catch (error) {
            setError('Failed to delete media. Please try again.');
        }
    };

    const handleFilterValueChange = (filterId, value) => {
        setFilterValues(prev => ({
            ...prev,
            [filterId]: value,
        }));
    };

    const handleCommonFilterValueChange = (commonFilterId, value) => {
        setCommonFilterValues(prev => ({
            ...prev,
            [commonFilterId]: value,
        }));
    };

    const handleDiscountChange = (index, field, value) => {
        const newDiscounts = [...discounts];
        newDiscounts[index] = { ...newDiscounts[index], [field]: value };
        setDiscounts(newDiscounts);
    };

    const addDiscount = () => {
        setDiscounts(prev => [...prev, { type: 'percentage', value: 0, startTime: '', endTime: '', isActive: true }]);
    };

    const removeDiscount = (index) => {
        setDiscounts(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const productData = { 
            name, 
            brand: brandId ? { brandId, values: [selectedBrandValue] } : null,
            media: uploadedMedia,
            quantity, 
            description, 
            price, 
            countInStock, 
            mainCategory, 
            childCategory, 
            subCategory,
            condition,
            filters: Object.keys(filterValues).map(filterId => {
                const filter = filters.find(f => f._id === filterId);
                return filter ? {
                    filterId: filter._id,
                    values: filterValues[filterId] ? filterValues[filterId].split(',').map(value => value.trim()) : [],
                    categoryId: filter.categoryId,
                    filterType: filter.filterType 
                } : null;
            }).filter(Boolean),
            commonFilters: Object.keys(commonFilterValues).map(commonFilterId => {
                const commonFilter = commonFilters.find(cf => cf._id === commonFilterId);
                return commonFilter ? {
                    commonFilterId: commonFilter._id,
                    values: commonFilterValues[commonFilterId] ? commonFilterValues[commonFilterId].split(',').map(value => value.trim()) : [],
                } : null;
            }).filter(Boolean),
            discounts, // Include discounts in product data
        };

        setLoading(true);
        setError(null);
    
        try {
            if (productToEdit) {
                await updateProduct({ id: productToEdit._id, ...productData }).unwrap();
            } else {
                await createProduct(productData).unwrap();
            }
            onClose();
        } catch (error) {
            setError('Failed to save product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (mainCategoriesLoading || childCategoriesLoading || subCategoriesLoading || brandsLoading || loading) {
        return <div>Loading...</div>;
    }

    const uniqueFilters = Array.from(new Set(filters.map(filter => filter._id)))
        .map(id => filters.find(filter => filter._id === id));

    const uniqueCommonFilters = Array.from(new Set(commonFilters.map(cf => cf._id)))
        .map(id => commonFilters.find(cf => cf._id === id));

    return (
        <div className="max-h-screen overflow-auto z-100">
            <form onSubmit={handleSubmit} className="bg-black p-4 rounded">
                {error && <div className="text-red-500">{error}</div>}
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" required className="border border-gray-600 p-2 mb-2 w-full bg-gray-800 text-white" />
                
                <select value={mainCategory} onChange={(e) => { setMainCategory(e.target.value); setChildCategory(''); setSubCategory(''); }} required className="border border-gray-600 p-2 mb-2 w-full bg-gray-800 text-white">
                    <option value="">Select Main Category</option>
                    {mainCategories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>

                <select value={childCategory} onChange={(e) => { setChildCategory(e.target.value); setSubCategory(''); }} required className="border border-gray-600 p-2 mb-2 w-full bg-gray-800 text-white">
                    <option value="">Select Child Category</option>
                    {childCategories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>

                <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} required className="border border-gray-600 p-2 mb-2 w-full bg-gray-800 text-white">
                    <option value="">Select Sub Category</option>
                    {subCategories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>
                <select
    value={brandId}
    onChange={(e) => {
        const selectedBrand = brands.find((brand) => brand._id === e.target.value);
        console.log('Selected brand:', selectedBrand);
        setBrandId(selectedBrand ? selectedBrand._id : '');
        setSelectedBrandValue(selectedBrand ? selectedBrand.values[0].value : '');
    }}
    required
    className="border border-gray-600 p-2 mb-2 w-full bg-gray-800 text-white"
>
    <option value="">Select Brand</option>
    {brands.map((brand) => (
        <optgroup key={brand._id} label={brand.name}>
            {brand.values.map((value, index) => (
                <option key={`${brand._id}-${index}`} value={brand._id}>
                    {value.value}
                </option>
            ))}
        </optgroup>
    ))}
</select>
                <select 
                    value={condition} 
                    onChange={(e) => setCondition(e.target.value)} 
                    required 
                    className="border border-gray-600 p-2 mb-2 w-full bg-gray-800 text-white"
                >
                    <option value="New">New</option>
                    <option value="Renewed">Renewed</option>
                    <option value="Used">Used</option>
                </select>

                <button type="button" onClick={() => setShowUploadModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded mb-2">
                    Upload Media
                </button>

                {uploadedMedia.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-white">Uploaded Media</h3>
                        <div className="flex flex-wrap">
                            {uploadedMedia.map((media, index) => (
                                <div key={index} className="relative mr-2 mb-2">
                                    {media.type === 'image' ? (
                                        <img src={media.url} alt="Uploaded" className="w-32 h-32 object-cover" />
                                    ) : media.type === 'video' ? (
                                        <video controls className="w-32 h-32 object-cover">
                                            <source src={media.url} type="video/mp4" />
                                        </video>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => handleMediaDelete(media)}
                                        className="absolute top-0 right-0 text-red-500"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} placeholder="Quantity" required className="border border-gray-600 p-2 mb-2 w-full bg-gray-800 text-white" />
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required className="border border-gray-600 p-2 mb-2 w-full bg-gray-800 text-white" />
                <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Price" required className="border border-gray-600 p-2 mb-2 w-full bg-gray-800 text-white" />
                <input type="number" value={countInStock} onChange={(e) => setCountInStock(Number(e.target.value))} placeholder="Count in Stock" required className="border border-gray-600 p-2 mb-2 w-full bg-gray-800 text-white" />

                {/* Discounts Section */}
                <h3 className="text-white mt-4">Discounts</h3>
                {discounts.map((discount, index) => (
                    <div key={index} className="border border-gray-600 p-2 mb-2 bg-gray-800">
                        <select value={discount.type} onChange={(e) => handleDiscountChange(index, 'type', e.target.value)} className="border border-gray-600 mb-2 bg-gray-700 text-white">
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                        </select>
                        <input
                            type="number"
                            value={discount.value}
                            onChange={(e) => handleDiscountChange(index, 'value', Number(e.target.value))}
                            placeholder="Discount Value"
                            className="border border-gray-600 mb-2 w-full bg-gray-700 text-white"
                        />
                        <input
                            type="datetime-local"
                            value={discount.startTime}
                            onChange={(e) => handleDiscountChange(index, 'startTime', e.target.value)}
                            placeholder="Start Time"
                            className="border border-gray-600 mb-2 w-full bg-gray-700 text-white"
                        />
                        <input
                            type="datetime-local"
                            value={discount.endTime}
                            onChange={(e) => handleDiscountChange(index, 'endTime', e.target.value)}
                            placeholder="End Time"
                            className="border border-gray-600 mb-2 w-full bg-gray-700 text-white"
                        />
                        <button type="button" onClick={() => removeDiscount(index)} className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded">
                            Remove Discount
                        </button>
                    </div>
                ))}
                <button type="button" onClick={addDiscount} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded mb-2">
                    Add Discount
                </button>

                <h3 className="text-white mt-4">Filters</h3>
                {uniqueFilters.map(filter => (
                    <div key={filter._id} className="mb-2">
                        <label className="text-white">{filter.filterType}</label>
                        <input
                            type="text"
                            value={filterValues[filter._id] || ''} 
                            onChange={(e) => handleFilterValueChange(filter._id, e.target.value)}
                            placeholder="Enter values separated by commas"
                            className="border border-gray-600 p-2 w-full mb-1 bg-gray-800 text-white"
                        />
                    </div>
                ))}

                <h3 className="text-white mt-4">Common Filters</h3>
                {uniqueCommonFilters.map(commonFilter => (
                    <div key={commonFilter._id} className="mb-2">
                        <label className="text-white">{commonFilter.filterType}</label>
                        <input
                            type="text"
                            value={commonFilterValues[commonFilter._id] || ''} 
                            onChange={(e) => handleCommonFilterValueChange(commonFilter._id, e.target.value)}
                            placeholder="Enter values separated by commas"
                            className="border border-gray-600 p-2 w-full mb-1 bg-gray-800 text-white"
                        />
                    </div>
                ))}

                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">
                    {productToEdit ? 'Update' : 'Create'} Product
                </button>
            </form>

            {showUploadModal && (
                <MediaUploadModal 
                    onClose={() => setShowUploadModal(false)} 
                    onUploadComplete={handleUploadComplete} 
                />
            )}
        </div>
    );
};

export default ProductForm;