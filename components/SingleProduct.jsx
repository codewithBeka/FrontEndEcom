import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProductByIdQuery } from '../redux/api/productsSlice';
import ProductCard from './ProductCard';
import { FaFacebook, FaTwitter, FaPinterest, FaLinkedin, FaReddit, FaWhatsapp, FaEnvelope, FaShareAlt, FaInstagram } from 'react-icons/fa';

const SingleProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, error, isLoading } = useGetProductByIdQuery(id);

    if (isLoading) return <div className="text-center p-4">Loading product...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error loading product</div>;

    const product = data?.product;
    const relatedProducts = data?.relatedProducts || [];

    if (!product) {
        return <div className="text-center p-4 text-red-500">Product not found</div>;
    }

    const shareUrl = `https://yourdomain.com/products/${product._id}`; // Update with your domain

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row">
                <img src={product.image} alt={product.name} className="w-full md:w-1/2 h-60 object-cover rounded-lg mb-4 md:mb-0" />
                <div className="md:ml-6">
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="text-gray-600 mt-2">{product.description}</p>
                    <p className="text-lg font-bold text-green-600 mt-4">${product.price}</p>

                    {/* Social Media Sharing */}
                    <div className="flex space-x-4 mt-4">
                        <FaShareAlt className="text-gray-700" size={30} onClick={copyLink} title="Copy Link" style={{ cursor: 'pointer' }} />
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
                            <FaFacebook className="text-blue-600 hover:text-blue-700" size={30} />
                        </a>
                        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer">
                            <FaTwitter className="text-blue-400 hover:text-blue-500" size={30} />
                        </a>
                        <a href={`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(product.image)}&description=${encodeURIComponent(product.description)}`} target="_blank" rel="noopener noreferrer">
                            <FaPinterest className="text-red-600 hover:text-red-700" size={30} />
                        </a>
                        <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer">
                            <FaReddit className="text-orange-600 hover:text-orange-700" size={30} />
                        </a>
                        <a href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
                            <FaWhatsapp className="text-green-500 hover:text-green-600" size={30} />
                        </a>
                        <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer">
                            <FaLinkedin className="text-blue-700 hover:text-blue-800" size={30} />
                        </a>
                        <a href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
                            <FaEnvelope className="text-gray-700 hover:text-gray-800" size={30} />
                        </a>
                        <a href={`https://www.instagram.com/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
                            <FaInstagram className="text-purple-600 hover:text-purple-700" size={30} />
                        </a>
                    </div>
                </div>
            </div>
            <h2 className="text-2xl font-semibold mt-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
                {relatedProducts.map((relatedProduct) => (
                    <ProductCard
                        key={relatedProduct._id}
                        product={relatedProduct}
                        onClick={() => navigate(`/productdetail/${relatedProduct._id}`)}
                    />
                ))}
            </div>
        </div>
    );
};

export default SingleProduct;