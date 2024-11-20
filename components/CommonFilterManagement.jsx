// components/CommonFilterManagement.js
import React, { useState, useEffect } from 'react';

import { useGetMainCategoriesQuery } from '../redux/api/categorySlice'; // Assuming you have this endpoint
import { useCreateCommonFilterMutation, useDeleteCommonFilterMutation, useGetCommonFiltersQuery, useUpdateCommonFilterMutation } from '../redux/api/commonFilterSlice';

const CommonFilterManagement = () => {
    const { data: filters = [], isLoading: loadingFilters } = useGetCommonFiltersQuery();
    const { data: mainCategories = [], isLoading: loadingCategories } = useGetMainCategoriesQuery();
    const [createCommonFilter] = useCreateCommonFilterMutation();
    const [updateCommonFilter] = useUpdateCommonFilterMutation();
    const [deleteCommonFilter] = useDeleteCommonFilterMutation();
    console.log("filters",filters)

    const [editMode, setEditMode] = useState(false);
    const [currentFilter, setCurrentFilter] = useState({});
    const [filterType, setFilterType] = useState('');
    const [values, setValues] = useState('');
    const [applicableCategories, setApplicableCategories] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const filterData = {
            filterType,
            values: values.split(',').map(v => v.trim()),
            applicableCategories,
        };

        if (editMode) {
            await updateCommonFilter({ id: currentFilter._id, ...filterData }).unwrap();
        } else {
            console.log("data common filter",filterData)
            await createCommonFilter(filterData).unwrap();
        }

        resetForm();
    };

    const resetForm = () => {
        setEditMode(false);
        setCurrentFilter({});
        setFilterType('');
        setValues('');
        setApplicableCategories([]);
    };

    const handleEdit = (filter) => {
        setCurrentFilter(filter);
        setEditMode(true);
        setFilterType(filter.filterType);
        setValues(filter.values.join(', '));
        setApplicableCategories(filter.applicableCategories); // Assuming this is an array of IDs
    };

    const handleDelete = async (id) => {
        await deleteCommonFilter(id).unwrap();
    };

    const handleCategoryChange = (e) => {
        const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
        setApplicableCategories(selectedValues);
    };

    if (loadingFilters || loadingCategories) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Common Filter Management</h1>
            <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded bg-gray-800">
                <input
                    type="text"
                    placeholder="Filter Type"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    required
                    className="border border-gray-600 p-2 mb-2 w-full"
                />
                <input
                    type="text"
                    placeholder="Values (comma separated)"
                    value={values}
                    onChange={(e) => setValues(e.target.value)}
                    required
                    className="border border-gray-600 p-2 mb-2 w-full"
                />
                <select
                    value={applicableCategories}
                    onChange={handleCategoryChange}
                    className="border border-gray-600 p-2 mb-2 w-full bg-black"
                >
                    <option value="">Select Sub Category</option>
                    {mainCategories.map(category => (
                        <option key={category._id} value={category._id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
                >
                    {editMode ? 'Update Filter' : 'Create Filter'}
                </button>
            </form>

            <table className="min-w-full bg-gray-800">
                <thead>
                    <tr className="text-white">
                        <th className="py-2">Filter Type</th>
                        <th className="py-2">Values</th>
                        <th className="py-2">Applicable Categories</th>
                        <th className="py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filters.map((filter) => (
                        <tr key={filter._id} className="text-gray-300">
                            <td className="py-2">{filter.filterType}</td>
                            <td className="py-2">{filter.values?.join(', ')}</td>
                            <td className="py-2">{filter.applicableCategories.map(key =>key.name)}</td>
                            <td className="py-2">
                                <button
                                    onClick={() => handleEdit(filter)}
                                    className="bg-yellow-500 hover:bg-yellow-400 text-white px-2 py-1 rounded mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(filter._id)}
                                    className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CommonFilterManagement;