import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { FaUpload } from "react-icons/fa";
import Loader from "../../components/Loader";
import { useProfileMutation } from "../../redux/api/usersApiSlice";
import { useDeleteMediaMutation } from "../../redux/api/mediaSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { Link } from "react-router-dom";
import MediaUploadModal from "../../components/MediaUploadModal";
import AddressForm from "../../components/AddressForm";
import AddressList from "../../components/AddressList";

const Profile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [oldProfilePicId, setOldProfilePicId] = useState(null);
  const [oldResourceType, setOldResourceType] = useState("image"); // Default resource type

  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [updateUser, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();
  const [deleteMedia] = useDeleteMediaMutation();

  useEffect(() => {
    setFirstName(userInfo.firstName || "");
    setLastName(userInfo.lastName || "");
    setEmail(userInfo.email || "");
    setUsername(userInfo.username || "");
    // Ensure you correctly access the first item in the profileImage array
    if (
      Array.isArray(userInfo.profileImage) &&
      userInfo.profileImage.length > 0
    ) {
      const firstImage = userInfo.profileImage[0]; // Access the first image object
      setProfilePic(userInfo.profileImage); // Set the first profile image
      setOldProfilePicId(firstImage.publicId || null); // Set the publicId of the first image
      setOldResourceType(firstImage.type || "image"); // Set the resource type
    } else {
      setProfilePic(null);
      setOldProfilePicId(null);
      setOldResourceType("image");
    }
  }, [userInfo]);

  console.log("oldProfilePicId", oldProfilePicId, oldResourceType);
  console.log(oldProfilePicId, userInfo);
  const handleUploadComplete = (uploadedMedia) => {
    if (uploadedMedia.length > 0) {
      setProfilePic(uploadedMedia[0]);
    }
    console.log("Uploaded Media:", uploadedMedia[0]);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        userId: userInfo._id,
        username,
        email,
        firstName,
        lastName,
        profileImage: profilePic,
      };

      console.log("Payload:", payload);
      const res = await updateUser(payload).unwrap();
      dispatch(setCredentials({ ...res.user }));

      // Delete the old profile picture if it exists and a new picture is uploaded
      if (
        oldProfilePicId &&
        profilePic &&
        profilePic.publicId !== oldProfilePicId
      ) {
        await deleteMedia({
          public_id: oldProfilePicId,
          resource_type: oldResourceType,
        }).unwrap();
      }

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
      console.error("Profile Update Error:", err);
    }
  };

  return (
    <div className="container mx-auto p-4 mt-[10rem]">
      <div className="flex justify-center align-center md:flex md:space-x-4">
        <div className="md:w-1/3">
          <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label className="block text-white mb-2">First Name</label>
              <input
                type="text"
                placeholder="Enter first name"
                className="form-input p-4 rounded-sm w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2">Last Name</label>
              <input
                type="text"
                placeholder="Enter last name"
                className="form-input p-4 rounded-sm w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter email"
                className="form-input p-4 rounded-sm w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2">Username</label>
              <input
                type="text"
                placeholder="Enter username"
                className="form-input p-4 rounded-sm w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2">Profile Picture</label>
              <div
                className="bg-pink-500 text-white py-2 px-4 rounded hover:bg-pink-600 cursor-pointer"
                onClick={() => setShowUploadModal(true)}
              >
                {profilePic && profilePic.length > 0 ? (
                  (console.log("image", profilePic),
                  (
                    // Display the first image in the array
                    <img
                      src={profilePic[0].url} // Access the first image's URL
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover inline-block mr-2"
                    />
                  ))
                ) : (
                  <FaUpload className="inline-block mr-2" />
                )}
                {profilePic ? "Change" : "Upload"}
              </div>
            </div>
            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-pink-500 text-white py-2 px-4 rounded hover:bg-pink-600"
              >
                Update
              </button>
              <Link
                to="/user-orders"
                className="bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700"
              >
                My Orders
              </Link>
              <Link
                to="/wishlist"
                className="bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700"
              >
                My Wishlist
              </Link>
            </div>
            {loadingUpdateProfile && <Loader />}
          </form>
              {/* Address Management Section */}
   
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Manage Addresses</h2>
        <AddressForm userId={userInfo._id} /> {/* Pass userId to AddressForm */}
        <AddressList userId={userInfo._id} /> {/* Pass userId to AddressList */}
      </div>
      {showUploadModal && (
        <MediaUploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
};

export default Profile;
