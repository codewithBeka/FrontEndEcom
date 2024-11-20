import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-hot-toast";
import AdminMenu from "./AdminMenu";

const ProductList = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState(0);
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const navigate = useNavigate();

  const [uploadProductImage] = useUploadProductImageMutation();
  const [createProduct] = useCreateProductMutation();
  const { data: categories } = useFetchCategoriesQuery();


  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const productData = new FormData();
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("category", category);
      productData.append("quantity", quantity);
      productData.append("brand", brand);
      productData.append("countInStock", stock);
  
      // Append image URLs instead of the file objects
        // Append the image file objects
      images.forEach((image) => {
        productData.append("images", image);
      });

  
      const { data } = await createProduct(productData);
  
      if (data.error) {
        toast.error("Product create failed. Try Again." + data.error);
        console.log(data.error);

      } else {
        toast.success(`${data.name} is created`);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Product create failed. Try Again." + error);
    }
  };
  



  const uploadFileHandler = async (e) => {
    try {
      const files = Array.from(e.target.files);
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("images", file);
      });

      const res = await uploadProductImage(formData).unwrap();

      toast.success("Images uploaded successfully");
      setImages(res.images);
      setImageUrls((prevUrls) => [...prevUrls, ...res.images]); // Append the new URLs to the existing ones
     

    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

   console.log(images)
  // console.log(imageUrls)
  // const productData = new FormData();
  // images.forEach((image) => {
  //   productData.append("images", image);
  //   console.log(image)

  // });
  // console.log(productData)


  return (
    <div className="container xl:mx-[9rem] sm:mx-[0]">
      <div className="flex flex-col md:flex-row">
        <AdminMenu />
        <div className="md:w-3/4 p-3">
          <div className="h-12">Create Product</div>

          {imageUrls.length > 0 && (
  <div className="text-center">
    <div className="grid grid-cols-3 gap-4">
      {imageUrls.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`product-${index}`}
          className="block mx-auto max-h-[200px]"
        />
      ))}
    </div>
  </div>
)}

<div className="mb-3">
  <label className="border text-white px-4 block w-full text-center rounded-lg cursor-pointer font-bold py-11">
    {images.length > 0
      ? `${images.length} image(s) uploaded`
      : "Upload Images"}

    <input
      type="file"
      name="images"
      accept="image/*"
      multiple
      onChange={uploadFileHandler}
      className={images.length > 0 ? "hidden" : "text-white"}
    />
  </label>
</div>
          <div className="p-3">
            <div className="flex flex-wrap">
              <div className="one">
                <label htmlFor="name">Name</label> <br />
                <input
                  type="text"
                  className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="two ml-10 ">
                <label htmlFor="name block">Price</label> <br />
                <input
                  type="number"
                  className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="one">
                <label htmlFor="name block">Quantity</label> <br />
                <input
                  type="number"
                  className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="two ml-10 ">
                <label htmlFor="name block">Brand</label> <br />
                <input
                  type="text"
                  className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
            </div>

            <label htmlFor="" className="my-5">
              Description
            </label>
            <textarea
              type="text"
              className="p-2 mb-3 bg-[#101011] border rounded-lg w-[95%] text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            <div className="flex justify-between">
              <div>
                <label htmlFor="name block">Count In Stock</label> <br />
                <input
                  type="text"
                  className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="">Category</label> <br />
                <select
                  placeholder="Choose Category"
                  className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="py-4 px-10 mt-5 rounded-lg text-lg font-bold bg-pink-600"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
