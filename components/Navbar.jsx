import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useGetMainCategoriesQuery, useGetChildCategoriesQuery, useGetSubCategoriesQuery } from '../redux/api/categorySlice';
import { useGetSuggestionsQuery, useSaveSearchMutation, useGetSearchHistoryQuery, useRemoveSearchMutation } from '../redux/api/searchSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useFetchWishlistCountQuery } from '../redux/api/wishlistSlice'; 
import { FaHeart } from 'react-icons/fa';
import { useFetchCartQuery } from '../redux/api/cartSlice'; // Import the cart API

const Navbar = () => {
    const { data: mainCategories = [], error, isLoading } = useGetMainCategoriesQuery();
    const [hoveredMainCategory, setHoveredMainCategory] = useState(null);
    const [hoveredChildCategory, setHoveredChildCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [savedSearches, setSavedSearches] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const [saveSearch] = useSaveSearchMutation();
    const [removeSearch] = useRemoveSearchMutation();
    const inputRef = useRef(null);

    // Fetch wishlist count
    const { data: wishlistCountData } = useFetchWishlistCountQuery();
    const wishlistCount = wishlistCountData ? wishlistCountData.count : 0;

    // Fetch cart count
    const { data: cartData } = useFetchCartQuery(); // Fetch cart data
    const cartCount = cartData ? cartData.items.length : 0; // Get number of items in cart

    // Access userInfo from the Redux store
    const userInfo = useSelector((state) => state.auth.userInfo);
    const userId = userInfo ? userInfo._id : 'guest';

    // Fetch suggestions based on search term
    const { data: suggestionData } = useGetSuggestionsQuery({ userId, query: searchTerm }, { skip: !searchTerm });
    const { data: searchHistory } = useGetSearchHistoryQuery(userId);

    useEffect(() => {
        setSuggestions(suggestionData || []);
    }, [suggestionData]);

    useEffect(() => {
        setSavedSearches(searchHistory || []);
    }, [searchHistory]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowDropdown(value.length > 0 || savedSearches.length > 0);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        const trimmedSearchTerm = searchTerm.trim();
        if (trimmedSearchTerm) {
            await saveSearch({ userId, query: trimmedSearchTerm });
            navigate(`/search?searchTerm=${encodeURIComponent(trimmedSearchTerm)}`);
        }
    };

    const handleRemoveSearch = async (search) => {
        await removeSearch({ userId, query: search });
        setSavedSearches(savedSearches.filter(item => item !== search));
    };

    const handleFocus = () => {
        setShowDropdown(true);
    };

    const handleBlur = () => {
        setTimeout(() => setShowDropdown(false), 100); // Timeout to allow for click event
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        setShowDropdown(false);
    };

    const dropdownItems = searchTerm.length > 0
        ? suggestions.map((suggestion, index) => (
            <li key={index} className="p-2 hover:bg-blue-600 cursor-pointer" onMouseDown={() => handleSuggestionClick(suggestion)}>
                {suggestion}
            </li>
        ))
        : savedSearches.map((search, index) => (
            <li key={index} className="p-2 hover:bg-blue-600 cursor-pointer flex justify-between">
                <span onMouseDown={() => handleSuggestionClick(search)}>{search}</span>
                <button 
                    onMouseDown={(e) => { e.stopPropagation(); handleRemoveSearch(search); }} 
                    className="text-red-500 hover:text-red-700"
                >
                    x
                </button>
            </li>
        ));

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading categories</div>;

    return (
        <nav className="bg-gray-800 shadow-md">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="text-white text-lg font-bold">Product Filter</div>
                    </div>
                    <form onSubmit={handleSearchSubmit} className="flex items-center relative">
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchTerm} 
                            onChange={handleSearchChange} 
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            ref={inputRef}
                            className="p-2 rounded-l bg-gray-200 text-gray-800 focus:outline-none"
                        />
                        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">Search</button>
                        {showDropdown && (
                            <ul className="absolute top-8 h-60 z-10 bg-black border border-gray-300 rounded mt-1 w-full max-h-60 overflow-y-auto shadow-lg">
                                {dropdownItems.length > 0 ? dropdownItems : <li className="p-2 text-gray-500">No results</li>}
                            </ul>
                        )}
                    </form>
                    <div className="hidden md:flex md:space-x-4">
                        {mainCategories.map((mainCat) => (
                            <div
                                key={mainCat._id}
                                className="relative group"
                                onMouseEnter={() => {
                                    setHoveredMainCategory(mainCat._id);
                                    setHoveredChildCategory(null);
                                }}
                                onMouseLeave={() => {
                                    setHoveredMainCategory(null);
                                    setHoveredChildCategory(null);
                                }}
                            >
                                <Link
                                    to={`/products/${mainCat._id}`}
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    {mainCat.name}
                                </Link>
                                {hoveredMainCategory === mainCat._id && (
                                    <ChildCategoryMenu 
                                        mainCategoryId={mainCat._id} 
                                        setHoveredChildCategory={setHoveredChildCategory}
                                        hoveredChildCategory={hoveredChildCategory}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Wishlist Icon */}
                    <Link to="/wishlist" className="relative text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        <FaHeart className="h-6 w-6" />
                        {wishlistCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {wishlistCount}
                            </span>
                        )}
                    </Link>
                    {/* Cart Icon */}
                    <Link to="/cart" className="relative text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l3 9h12l3-9H6" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    );
};

const ChildCategoryMenu = ({ mainCategoryId, setHoveredChildCategory, hoveredChildCategory }) => {
    const { data: childCategories = [] } = useGetChildCategoriesQuery(mainCategoryId);

    return (
        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
            {childCategories.map((childCat) => (
                <div 
                    key={childCat._id} 
                    className="relative group"
                    onMouseEnter={() => setHoveredChildCategory(childCat._id)}
                    onMouseLeave={() => setHoveredChildCategory(null)}
                >
                    <Link
                        to={`/products/${mainCategoryId}/${childCat._id}`}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                        {childCat.name}
                    </Link>
                    {hoveredChildCategory === childCat._id && (
                        <SubCategoryMenu childCategoryId={childCat._id} mainCategoryId={mainCategoryId} />
                    )}
                </div>
            ))}
        </div>
    );
};

const SubCategoryMenu = ({ childCategoryId, mainCategoryId }) => {
    const { data: subCategories = [] } = useGetSubCategoriesQuery({ mainCategoryId, childCategoryId });

    return (
        <div className="absolute left-full top-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
            {subCategories.map((subCat) => (
                <Link
                    key={subCat._id}
                    to={`/products/${mainCategoryId}/${childCategoryId}/${subCat._id}`}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                    {subCat.name}
                </Link>
            ))}
        </div>
    );
};

export default Navbar;