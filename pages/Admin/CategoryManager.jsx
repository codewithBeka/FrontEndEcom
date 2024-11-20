import React, { useState } from 'react';
import {
useGetMainCategoriesQuery,
useCreateMainCategoryMutation,
useUpdateMainCategoryMutation,
useDeleteMainCategoryMutation,
useGetChildCategoriesQuery,
useCreateChildCategoryMutation,
useUpdateChildCategoryMutation,
useDeleteChildCategoryMutation,
useGetSubCategoriesQuery,
useCreateSubCategoryMutation,
useUpdateSubCategoryMutation,
useDeleteSubCategoryMutation,
} from '../../redux/api/categorySlice';
import MediaUploadModal from '../../components/MediaUploadModal'; // Import your modal component
import { useDeleteMediaMutation } from '../../redux/api/mediaSlice';


const CategoryManager = () => {
    const { data: mainCategories = [], error: mainError, isLoading: mainLoading } = useGetMainCategoriesQuery();
    const [newMainCategoryName, setNewMainCategoryName] = useState('');
    const [editMainCategoryId, setEditMainCategoryId] = useState(null);
    const [editMainCategoryName, setEditMainCategoryName] = useState('');
    const [editMainCategoryImages, setEditMainCategoryImages] = useState([]);
    const [createMainCategory] = useCreateMainCategoryMutation();
    const [updateMainCategory] = useUpdateMainCategoryMutation();
    const [deleteMainCategory] = useDeleteMainCategoryMutation();
    const [images, setImages] = useState([]); // State to hold uploaded images
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
    const [deleteMedia] = useDeleteMediaMutation();

    if (mainLoading) return <div className="text-white">Loading main categories...</div>;
    if (mainError) return <div className="text-red-500">Error loading main categories</div>;

    const handleCreateMainCategory = async () => {
        await createMainCategory({ name: newMainCategoryName, images }).unwrap();
        setNewMainCategoryName('');
        setImages([]); // Reset images after creating a category
    };

    const handleUploadComplete = (uploadedImages) => {
        const flatImages = uploadedImages.flat(2);
        setImages(flatImages);
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

            // Remove from local state
            if (editMainCategoryId) {
                setEditMainCategoryImages(prev => prev.filter(item => item.publicId !== publicId));
            } else {
                setImages(prev => prev.filter(item => item.publicId !== publicId));
            }
        } catch (error) {
            console.error('Failed to delete media:', error);
        }
    };

    const handleUpdateMainCategory = async () => {
        const updatedImages = [...editMainCategoryImages, ...images]; // Combine existing images with new ones

        // Remove any deleted images from the updated list
        const imagesToUpdate = updatedImages.filter(image => image.publicId !== undefined);

        await updateMainCategory({
            id: editMainCategoryId,
            name: editMainCategoryName,
            images: imagesToUpdate,
        }).unwrap();

        // Reset states after update
        setEditMainCategoryId(null);
        setEditMainCategoryName('');
        setEditMainCategoryImages([]);
        setImages([]); // Reset uploaded images after updating
    };

    return (
        <div className="p-4 bg-gray-900 text-white">
            <h1 className="text-2xl font-bold mb-4">Category Manager</h1>

            <div className="mb-4">
                <h2 className="text-xl mb-2">Create Main Category</h2>
                <input
                    type="text"
                    value={newMainCategoryName}
                    onChange={(e) => setNewMainCategoryName(e.target.value)}
                    placeholder="New Main Category Name"
                    className="border border-gray-600 p-2 mr-2 bg-gray-800 text-white"
                />
                <div className="flex items-center mb-2">
                    <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white p-2 mr-2">Upload Images</button>
                    <button onClick={handleCreateMainCategory} className="bg-blue-600 text-white p-2">Create</button>
                </div>
                <div className="flex flex-wrap">
                    {images.length > 0 && (
                        <div className="mb-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {images.map((image, index) => (
                                <div key={index} className="relative">
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
            </div>

            <table className="min-w-full border-collapse border border-gray-700">
                <thead>
                    <tr className="bg-gray-800">
                        <th className="border border-gray-700 px-4 py-2">Main Category</th>
                        <th className="border border-gray-700 px-4 py-2">Images</th>
                        <th className="border border-gray-700 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {mainCategories.map((mainCategory) => (
                        <tr key={mainCategory._id} className="hover:bg-gray-700">
                            <td className="border border-gray-700 px-4 py-2">
                                {editMainCategoryId === mainCategory._id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editMainCategoryName}
                                            onChange={(e) => setEditMainCategoryName(e.target.value)}
                                            className="border border-gray-600 p-1 bg-gray-800 text-white"
                                        />
                                        <div className="flex items-center mb-2">
                                            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white p-2 mr-2">Upload Images</button>
                                            <button onClick={handleUpdateMainCategory} className="bg-green-600 text-white px-2">Update</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {mainCategory.name}
                                        <button onClick={() => {
                                            setEditMainCategoryId(mainCategory._id);
                                            setEditMainCategoryName(mainCategory.name);
                                            setEditMainCategoryImages(mainCategory.images || []);
                                            setImages([]); // Reset new images when starting edit
                                        }} className="bg-yellow-500 text-white px-2">Edit</button>
                                        <button onClick={() => deleteMainCategory(mainCategory._id)} className="bg-red-600 text-white px-2 ml-2">Delete</button>
                                    </>
                                )}
                            </td>
                            <td className="border border-gray-700 px-4 py-2">
                                <div className="flex flex-wrap">
                                    {editMainCategoryId === mainCategory._id ? (
                                        <>
                                            {editMainCategoryImages.map((image, index) => (
                                                <div key={index} className="relative">
                                                    <img src={image.url} alt="Category" className="h-32 w-full object-cover mb-2" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMediaDelete(image)}
                                                        className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                                                    >
                                                        &times; {/* Delete icon */}
                                                    </button>
                                                </div>
                                            ))}
                                            {images.length > 0 && (
                                                <div className="mb-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                    {images.map((image, index) => (
                                                        <div key={index} className="relative">
                                                            <img src={image.url} alt="Uploaded" className="h-32 w-full object-cover mb-2" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        // Show main category images
                                        mainCategory.images.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img src={image.url} alt="Category" className="h-32 w-full object-cover mb-2" />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </td>
                            <td className="border border-gray-700 px-4 py-2">
                                <ChildCategoryManager mainCategoryId={mainCategory._id} />
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

const ChildCategoryManager = ({ mainCategoryId }) => {
    const { data: childCategories = [], error, isLoading } = useGetChildCategoriesQuery(mainCategoryId);
    const [newChildCategoryName, setNewChildCategoryName] = useState('');
    const [editChildId, setEditChildId] = useState(null);
    const [editChildName, setEditChildName] = useState('');
    const [editChildImages, setEditChildImages] = useState([]);
    const [createChildCategory] = useCreateChildCategoryMutation();
    const [updateChildCategory] = useUpdateChildCategoryMutation();
    const [deleteChildCategory] = useDeleteChildCategoryMutation();
    const [images, setImages] = useState([]); // State to hold uploaded images
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
    const [deleteMedia] = useDeleteMediaMutation();

    if (isLoading) return <div className="text-white">Loading child categories...</div>;
    if (error) return <div className="text-red-500">Error loading child categories</div>;

    const handleCreateChildCategory = async () => {
        const payload = { id: mainCategoryId, name: newChildCategoryName, images };
        console.log("Creating child category with payload:", payload); // Log the payload
        await createChildCategory(payload).unwrap();
        setNewChildCategoryName('');
        setImages([]); // Reset images after creating a child category
    };

    const handleUploadComplete = (uploadedImages) => {
        const flatImages = uploadedImages.flat(2);
        setImages(flatImages);
        console.log("Uploaded images:", flatImages); // Log uploaded images
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
            if (editChildId) {
                setEditChildImages(prev => prev.filter(item => item.publicId !== publicId));
            } else {
                setImages(prev => prev.filter(item => item.publicId !== publicId));
            }
        } catch (error) {
            console.error('Failed to delete media:', error);
        }
    };

    const handleUpdateChildCategory = async () => {
        const updatedImages = [...editChildImages, ...images];
        const imagesToUpdate = updatedImages.filter(image => image.publicId !== undefined);

        await updateChildCategory({
            id: mainCategoryId,
            childId: editChildId,
            name: editChildName,
            images: imagesToUpdate,
        }).unwrap();

        setEditChildId(null);
        setEditChildName('');
        setEditChildImages([]);
        setImages([]); // Reset uploaded images after updating
    };

    return (
        <div>
            <h3 className="text-lg mb-2">Child Categories</h3>
            <input
                type="text"
                value={newChildCategoryName}
                onChange={(e) => setNewChildCategoryName(e.target.value)}
                placeholder="New Child Category Name"
                className="border border-gray-600 p-2 mr-2 bg-gray-800 text-white"
            />
            <div className="flex items-center mb-2">
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white p-2 mr-2">Upload Images</button>
                <button onClick={handleCreateChildCategory} className="bg-blue-600 text-white p-2">Create</button>
            </div>
            <div className="flex flex-wrap">
                {images.length > 0 && (
                    <div className="mb-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {images.map((image, index) => (
                            <div key={index} className="relative">
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

            <table className="min-w-full border-collapse border border-gray-700 mt-4">
                <thead>
                    <tr className="bg-gray-800">
                        <th className="border border-gray-700 px-4 py-2">Child Category</th>
                        <th className="border border-gray-700 px-4 py-2">Images</th>
                        <th className="border border-gray-700 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(childCategories) && childCategories.length > 0 ? (
                        childCategories.map((childCategory) => (
                            <tr key={childCategory._id} className="hover:bg-gray-700">
                                <td className="border border-gray-700 px-4 py-2">
                                    {editChildId === childCategory._id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editChildName}
                                                onChange={(e) => setEditChildName(e.target.value)}
                                                className="border border-gray-600 p-1 bg-gray-800 text-white"
                                            />
                                            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-2">Upload Images</button>
                                            <button onClick={handleUpdateChildCategory} className="bg-green-600 text-white px-2">Update</button>
                                        </>
                                    ) : (
                                        <>
                                            {childCategory.name}
                                            <button onClick={() => {
                                                setEditChildId(childCategory._id);
                                                setEditChildName(childCategory.name);
                                                setEditChildImages(childCategory.images || []);
                                                setImages([]); // Reset new images when starting edit
                                                setIsModalOpen(true); // Open modal to update images
                                            }} className="bg-yellow-500 text-white px-2">Edit</button>
                                            <button onClick={() => deleteChildCategory({ id: mainCategoryId, childId: childCategory._id })} className="bg-red-600 text-white px-2 ml-2">Delete</button>
                                        </>
                                    )}
                                </td>
                                <td className="border border-gray-700 px-4 py-2">
                                    <div className="flex flex-wrap">
                                        {(editChildId === childCategory._id ? editChildImages : childCategory.images || []).map((image, index) => (
                                            <div key={index} className="relative">
                                                <img src={image.url} alt="Category" className="h-32 w-full object-cover mb-2" />
                                                {editChildId === childCategory._id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMediaDelete(image)}
                                                        className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                                                    >
                                                        &times; {/* Delete icon */}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="border border-gray-700 px-4 py-2">
                                    <SubCategoryManager mainCategoryId={mainCategoryId} childCategoryId={childCategory._id} />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center border border-gray-700 px-4 py-2">No child categories found.</td>
                        </tr>
                    )}
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

const SubCategoryManager = ({ mainCategoryId, childCategoryId }) => {
    const { data: subCategories = [], error, isLoading } = useGetSubCategoriesQuery({ mainCategoryId, childCategoryId });
    const [newSubCategoryName, setNewSubCategoryName] = useState('');
    const [editSubId, setEditSubId] = useState(null);
    const [editSubName, setEditSubName] = useState('');
    const [editSubImages, setEditSubImages] = useState([]);
    const [createSubCategory] = useCreateSubCategoryMutation();
    const [updateSubCategory] = useUpdateSubCategoryMutation();
    const [deleteSubCategory] = useDeleteSubCategoryMutation();
    const [images, setImages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteMedia] = useDeleteMediaMutation();

    if (isLoading) return <div className="text-white">Loading sub-categories...</div>;
    if (error) return <div className="text-red-500">Error loading sub-categories</div>;

    const handleCreateSubCategory = async () => {
        const payload = { id: mainCategoryId, childCategoryId, name: newSubCategoryName, images };
        await createSubCategory(payload).unwrap();
        setNewSubCategoryName('');
        setImages([]);
    };

    const handleUploadComplete = (uploadedImages) => {
        const flatImages = uploadedImages.flat(2);
        setImages(flatImages);
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
            setImages(prev => prev.filter(item => item.publicId !== publicId));
        } catch (error) {
            console.error('Failed to delete media:', error);
        }
    };
    const handleEditSubCategory = async () => {
        try {
            await updateSubCategory({
                id: mainCategoryId,
                childCategoryId,
                subId: editSubId, // Ensure this is the correct sub-category ID
                name: editSubName,
                images: editSubImages,
            }).unwrap();
            setEditSubId(null);
            setEditSubImages([]);
        } catch (error) {
            console.error("Failed to update sub-category:", error);
        }
    };

    return (
        <div>
            <h4 className="text-md mb-2">Sub Categories</h4>
            <input
                type="text"
                value={newSubCategoryName}
                onChange={(e) => setNewSubCategoryName(e.target.value)}
                placeholder="New Sub Category Name"
                className="border border-gray-600 p-2 mr-2 bg-gray-800 text-white"
            />
            <div className="flex items-center mb-2">
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white p-2 mr-2">Upload Images</button>
                <button onClick={handleCreateSubCategory} className="bg-blue-600 text-white p-2">Create</button>
            </div>
            <div className="flex flex-wrap mb-4">
                {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {images.map((image, index) => (
                            <div key={index} className="relative">
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

            <table className="min-w-full border-collapse border border-gray-700">
                <thead>
                    <tr className="bg-gray-800">
                        <th className="border border-gray-700 px-4 py-2">Sub Category</th>
                        <th className="border border-gray-700 px-4 py-2">Images</th>
                        <th className="border border-gray-700 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {subCategories.map((subCategory) => (
                        <tr key={subCategory._id} className="hover:bg-gray-700">
                            <td className="border border-gray-700 px-4 py-2">
                                {editSubId === subCategory._id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editSubName}
                                            onChange={(e) => setEditSubName(e.target.value)}
                                            className="border border-gray-600 p-1 bg-gray-800 text-white"
                                        />
                                        <button onClick={handleEditSubCategory} className="bg-green-600 text-white px-2">Update</button>
                                        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-2 ml-2">Upload Images</button> {/* Upload button for editing */}
                                    </>
                                ) : (
                                    <>
                                        {subCategory.name}
                                        <button onClick={() => {
                                            setEditSubId(subCategory._id);
                                            setEditSubName(subCategory.name);
                                            setEditSubImages(subCategory.images || []);
                                            setImages(subCategory.images || []); // Load images for editing
                                            setIsModalOpen(true); // Open modal to edit images
                                        }} className="bg-yellow-500 text-white px-2">Edit</button>
                                        <button onClick={() => deleteSubCategory({ id: mainCategoryId, childCategoryId, subCategoryId: subCategory._id })} className="bg-red-600 text-white px-2 ml-2">Delete</button>
                                    </>
                                )}
                            </td>
                            <td className="border border-gray-700 px-4 py-2">
                                <div className="flex flex-wrap">
                                    {subCategory.images && subCategory.images.length > 0 ? (
                                        subCategory.images.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img src={image.url} alt="Category" className="h-32 w-full object-cover mb-2" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleMediaDelete(image)}
                                                    className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                                                >
                                                    &times; {/* Delete icon */}
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <span>No images</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Media Upload Modal */}
            {isModalOpen && (
                <MediaUploadModal
                    onClose={() => {
                        setIsModalOpen(false);
                        setImages([]); // Reset images when modal closes
                    }}
                    onUploadComplete={handleUploadComplete}
                    existingImages={editSubImages} // Pass existing images for editing
                />
            )}
        </div>
    );
};

export default CategoryManager;