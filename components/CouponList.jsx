import { useEffect, useState } from "react";
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from "../redux/api/couponSlice";

const CouponManager = () => {
  const { data: coupons, isLoading, isError } = useGetCouponsQuery();
  const [createCoupon] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();
  
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: 0,
    startDate: "",
    endDate: "",
    editingId: null,
  });

  useEffect(() => {
    if (formData.editingId) {
      const coupon = coupons.find((c) => c._id === formData.editingId);
      if (coupon) {
        setFormData({
          ...formData,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          startDate: new Date(coupon.startDate).toISOString().slice(0, 10),
          endDate: new Date(coupon.endDate).toISOString().slice(0, 10),
        });
      }
    }
  }, [formData.editingId, coupons]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const couponData = {
      code: formData.code,
      type: formData.type,
      value: formData.value,
      startDate: formData.startDate,
      endDate: formData.endDate,
    };

    if (formData.editingId) {
      updateCoupon({ id: formData.editingId, updates: couponData });
    } else {
      createCoupon(couponData);
    }

    // Reset form fields
    setFormData({ code: "", type: "percentage", value: 0, startDate: "", endDate: "", editingId: null });
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      startDate: new Date(coupon.startDate).toISOString().slice(0, 10),
      endDate: new Date(coupon.endDate).toISOString().slice(0, 10),
      editingId: coupon._id,
    });
  };

  const handleDelete = (id) => {
    deleteCoupon(id);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error occurred</div>;

  return (
    <div className="container mx-auto my-8">
      <h1 className="text-2xl font-bold mb-4">Coupon Manager</h1>

      <form onSubmit={handleSubmit} className="bg-black shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="code">
            Coupon Code
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="code"
            type="text"
            placeholder="Enter coupon code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="type">
            Coupon Type
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="value">
            Coupon Value
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="value"
            type="number"
            placeholder="Enter coupon value"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="startDate">
            Start Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="endDate">
            End Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            {formData.editingId ? "Update Coupon" : "Create Coupon"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-black border border-gray-200">
          <thead>
            <tr className="bg-black border-b">
              <th className="py-2 px-4 text-left">Code</th>
              <th className="py-2 px-4 text-left">Type</th>
              <th className="py-2 px-4 text-left">Value</th>
              <th className="py-2 px-4 text-left">Valid From</th>
              <th className="py-2 px-4 text-left">Valid To</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{coupon.code}</td>
                <td className="py-2 px-4">{coupon.type}</td>
                <td className="py-2 px-4">{coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value}`}</td>
                <td className="py-2 px-4">{new Date(coupon.startDate).toLocaleDateString()}</td>
                <td className="py-2 px-4">{new Date(coupon.endDate).toLocaleDateString()}</td>
                <td className="py-2 px-4">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                    onClick={() => handleEdit(coupon)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    onClick={() => handleDelete(coupon._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponManager;