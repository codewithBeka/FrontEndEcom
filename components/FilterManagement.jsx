import React, { useState, useEffect } from 'react';
import {
    useGetFiltersQuery,
    useCreateFilterMutation,
    useUpdateFilterMutation,
    useDeleteFilterMutation,
} from '../redux/api/filterSlice';
import { useGetChildCategoriesQuery, useGetMainCategoriesQuery, useGetSubCategoriesQuery } from '../redux/api/categorySlice';

const FilterManagement = () => {
    const { data: filters = [], isLoading: loadingFilters } = useGetFiltersQuery();
    const { data: mainCategories = [], isLoading: loadingMainCategories } = useGetMainCategoriesQuery();

    const [createFilter] = useCreateFilterMutation();
    const [updateFilter] = useUpdateFilterMutation();
    const [deleteFilter] = useDeleteFilterMutation();

    const [editMode, setEditMode] = useState(false);
    const [currentFilter, setCurrentFilter] = useState({});
    const [selectedMainCategory, setSelectedMainCategory] = useState('');
    const [selectedChildCategory, setSelectedChildCategory] = useState('');
    const [childCategories, setChildCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState('');

    const { data: fetchedChildCategories } = useGetChildCategoriesQuery(selectedMainCategory, { skip: !selectedMainCategory });
    const { data: fetchedSubCategories } = useGetSubCategoriesQuery({ mainCategoryId: selectedMainCategory, childCategoryId: selectedChildCategory }, { skip: !selectedChildCategory });

    useEffect(() => {
        if (fetchedChildCategories) {
            setChildCategories(fetchedChildCategories);
        }
    }, [fetchedChildCategories]);

    useEffect(() => {
        if (fetchedSubCategories) {
            setSubCategories(fetchedSubCategories);
        }
    }, [fetchedSubCategories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { filterType, values } = e.target.elements;
        const filterData = {
            categoryId: selectedMainCategory,
            childCategoryId: selectedChildCategory,
            subCategoryId: selectedSubCategory,
            filterType: filterType.value,
            values: values.value.split(',').map(v => v.trim())
        };

        if (editMode) {
            await updateFilter({ id: currentFilter._id, ...filterData });
        } else {
            await createFilter(filterData);
        }

        e.target.reset();
        resetForm();
    };

    const resetForm = () => {
        setEditMode(false);
        setCurrentFilter({});
        setSelectedMainCategory('');
        setSelectedChildCategory('');
        setSelectedSubCategory('');
        setChildCategories([]);
        setSubCategories([]);
    };

    const handleEdit = (filter) => {
        setCurrentFilter(filter);
        setEditMode(true);
        setSelectedMainCategory(filter.categoryId?._id || ''); 
        setSelectedChildCategory(filter.childCategoryId?._id || ''); 
        setSelectedSubCategory(filter.subCategoryId?._id || ''); 
    };

    const handleDelete = async (id) => {
        await deleteFilter(id);
    };

    const getCategoryNameById = (id) => {
        if (!id) return 'N/A'; // Return a placeholder if id is null or undefined
        const category = mainCategories.find(cat => cat._id === id);
        return category ? category.name : id; // Return the name or the id if not found
    };

    if (loadingFilters || loadingMainCategories) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Filter Management</h1>
            <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded bg-gray-800">
                <select
                    value={selectedMainCategory}
                    onChange={(e) => {
                        const selectedValue = e.target.value;
                        setSelectedMainCategory(selectedValue);
                        setSelectedChildCategory('');
                        setSelectedSubCategory('');
                        setChildCategories([]);
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
                        const selectedValue = e.target.value;
                        setSelectedChildCategory(selectedValue);
                        setSelectedSubCategory('');
                        setSubCategories([]);
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

                <input type="text" name="filterType" placeholder="Filter Type" required className="border border-gray-600 p-2 mb-2 w-full" defaultValue={editMode ? currentFilter.filterType : ''} />
                <input type="text" name="values" placeholder="Values (comma separated)" required className="border border-gray-600 p-2 mb-2 w-full" defaultValue={editMode ? currentFilter.values.join(', ') : ''} />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">
                    {editMode ? 'Update Filter' : 'Create Filter'}
                </button>
            </form>

            <table className="min-w-full bg-gray-800">
                <thead>
                    <tr className="text-white">
                        <th className="py-2">Main Category</th>
                        <th className="py-2">Child Category</th>
                        <th className="py-2">Sub Category</th>
                        <th className="py-2">Filter Type</th>
                        <th className="py-2">Values</th>
                        <th className="py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filters.map((filter) => (
                        <tr key={filter._id} className="text-gray-300">
                            <td className="py-2">{getCategoryNameById(filter.categoryId?._id || null)}</td>
                            <td className="py-2">{getCategoryNameById(filter.childCategoryId?._id || null)}</td>
                            <td className="py-2">{getCategoryNameById(filter.subCategoryId?._id || null)}</td>
                            <td className="py-2">{filter.filterType}</td>
                            <td className="py-2">{filter.values.join(', ')}</td>
                            <td className="py-2">
                                <button onClick={() => handleEdit(filter)} className="bg-yellow-500 hover:bg-yellow-400 text-white px-2 py-1 rounded mr-2">Edit</button>
                                <button onClick={() => handleDelete(filter._id)} className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FilterManagement;