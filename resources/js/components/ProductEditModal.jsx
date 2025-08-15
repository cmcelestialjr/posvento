import React, { useState } from "react";
import { X, Save  } from "lucide-react";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import axios from 'axios';
import AsyncSelect from "react-select/async";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ProductEditModal = ({
    showEditModal,
    setShowEditModal,
    fetchProducts,
    filterType,
    filterCategory,
    productCategories,
    editFormData,
    setEditFormData
}) => {
    if (!showEditModal) return null;    
    const [editErrors, setEditErrors] = useState({});
    const [showPricingModal, setShowPricingModal] = useState(false);      
    const [pricingErrors, setPricingErrors] = useState({});
    const [selectedPricing, setSelectedPricing] = useState({
        id: "",
        cost: "",
        price: "",
        qty: "",
        supplierId: null,
        effective_date: null,
    });

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
        if (e.target.value.trim() !== "") {
        setEditErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: null }));
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (validateEditForm()) {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`/api/products/${editFormData.id}`, editFormData, {
            headers: { Authorization: `Bearer ${token}` },
            });
        
            toastr.success("Product updated successfully!");
            fetchProducts(filterType,filterCategory);
        } catch (error) {
            toastr.error("Error updating product");
        }
        }
    };

    const validateEditForm = () => {
        let newErrors = {};

        Object.keys(editFormData).forEach((key) => {
        // Exclude supplierId from required field validation
        if (key !== "conversionQuantity" && key !== "productParentId" && key !== "supplierId" && !editFormData[key]) {
            newErrors[key] = "This field is required";
        }
        });

        setEditErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRemovePricing = (pricing) => {
        Swal.fire({
            title: `Remove?`,
            text: `Are you sure you want to remove this price "${pricing.price}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, remove it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const authToken = localStorage.getItem("token");
                    const response = await axios.get("/api/products/pricing/delete", {
                        params: { id: pricing.id },
                        headers: { Authorization: `Bearer ${authToken}` },
                    });

                    if (response.data.message === 'Price removed successfully.') {
                        // ✅ Update local state
                        const updatedPricingList = editFormData.pricingList.filter(
                            (p) => p.id !== pricing.id
                        );
                        setEditFormData({
                            ...editFormData,
                            pricingList: updatedPricingList,
                        });

                        Swal.fire("Removed!", `Price "${pricing.price}" has been removed.`, "success");
                    } else {
                        Swal.fire("Error", response.data.message, "error");
                    }
                } catch (error) {
                    Swal.fire("Error", "An error occurred while removing the price.", "error");
                }
            }
        });
    };

    const handleSavePricing = async () => {
        let errors = {};
    
        if (!selectedPricing.cost) errors.cost = "Cost is required.";
        if (!selectedPricing.price) errors.price = "Price is required.";
        if (!selectedPricing.qty) errors.qty = "Quantity is required.";
        if (!selectedPricing.effective_date) errors.effective_date = "Effective Date is required.";
    
        if (Object.keys(errors).length > 0) {
        setPricingErrors(errors);
        return;
        }
    
        try {
        const token = localStorage.getItem("token");
        
        const formattedData = {
            ...selectedPricing,
            effective_date: selectedPricing.effective_date
            ? new Date(selectedPricing.effective_date).toISOString().split("T")[0]
            : null,
            supplierId: selectedPricing.supplierId?.value ?? null,
        };
        let response;
        var check = 0;
        if (selectedPricing.id) {
            response = await axios.put(`/api/product-pricing/${selectedPricing.id}`, formattedData, {
            headers: { Authorization: `Bearer ${token}` },
            });
            if(response.data.message=="success"){
            toastr.success("Product Pricing updated successfully!");
            check = 1;
            }else{
            toastr.error(response.data.message);
            }  
        } else {
            response = await axios.post(`/api/product-pricing`, formattedData, {
            headers: { Authorization: `Bearer ${token}` },
            });
            if(response.data.message=="success"){
            toastr.success("Success!");
            check = 1;
            }else{
            toastr.error(response.data.message);
            }        
        }
        if(check==1){
            setEditFormData((prevData) => ({
            ...prevData,
            pricingList: response.data.product,
            }));
            fetchProducts(filterType,filterCategory);
            setShowPricingModal(false);
        }
        } catch (error) {
        toastr.error("Error saving pricing:", error.response?.data);
        }
    };

    const handlePricingDateChange = (date) => {
        setSelectedPricing((prev) => ({
        ...prev,
        effective_date: date,
        }));
    };   

    const openEditPricingModal = (pricing) => {
        setSelectedPricing({
        ...pricing,
        supplierId: {
            value: pricing.supplier_id,
            label: pricing.supplier?.name || 'Unknown Supplier',
        },
        });

        setShowPricingModal(true);
    };
    
    const openNewPricingModal = (productId) => {
        setSelectedPricing({
        id: "",
        product_id: productId,
        cost: "",
        price: "",
        qty: "",
        supplierId: null,
        effective_date: null,
        });
        setShowPricingModal(true);
    };

    const fetchSuppliersModal = async (inputValue) => {
        const authToken = localStorage.getItem("token");
        const response = await axios.get(`/api/fetch-suppliers`, {
            headers: { Authorization: `Bearer ${authToken}` },
            params: {
                search: inputValue,
            },
        });
        const data = response.data;
        return data.map((supplier) => ({
            label: supplier.name,
            value: supplier.id,
        }));
    };
    
    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] md:w-[600px] max-h-[90vh] shadow-lg overflow-y-auto relative">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Product</h2>
                    <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <form name="editForm" onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Code</label>
                        <input
                            type="text"
                            name="code"
                            value={editFormData.code}
                            onChange={handleEditChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                            editErrors.code ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={editFormData.name}
                            onChange={handleEditChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                            editErrors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Variant</label>
                        <input
                            type="text"
                            name="variant"
                            value={editFormData.variant}
                            onChange={handleEditChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                            editErrors.variant ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Product Category:</label>
                        <select
                            name="productCategoryId"
                            value={editFormData.productCategoryId}
                            onChange={handleEditChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none ${
                            editErrors.productCategoryId ? "border-red-500" : "border-gray-300"
                            }`}
                            wrapperClassName={`w-full ${
                            editErrors.productCategoryId ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                            <option value="">Please select category...</option>
                            {productCategories?.map((category) => (
                            <option key={category.id} 
                                value={category.id}>
                                {category.name}
                            </option>
                            ))}
                        </select>
                        </div>
                        {editFormData.track !== 'N' && (
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <input
                                type="checkbox"
                                name="phaseOut"
                                checked={editFormData.product_status === "Phaseout"}
                                onChange={(e) => {
                                setEditFormData({
                                    ...editFormData,
                                    product_status: e.target.checked ? "Phaseout" : "Available",
                                });
                                }}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span>PhaseOut?</span>
                            </label>
                        </div>
                        )}
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Track Product:</label>
                        <select
                            name="track"
                            value={editFormData.track}
                            // onChange={(e) => setEditFormData({ ...editFormData, track: e.target.value })}
                            onChange={handleEditChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none ${
                            editErrors.track ? "border-red-500" : "border-gray-300"
                            }`}
                            wrapperClassName={`w-full ${
                            editErrors.track ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                            <option value="Y">Yes</option>
                            <option value="N">No</option>
                        </select>
                        </div>

                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                        type="submit"                    
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                        >
                        Save Changes
                        </button>
                    </div>
                    {editFormData.pricingList.length > 0 ? (
                        <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">Pricing List</h3>
                            {editFormData.track !== 'N' && (
                            <button
                                type="button"
                                onClick={() => openNewPricingModal(editFormData.id)}
                                className="bg-green-600 text-white text-sm px-3 py-1 rounded-md hover:bg-green-700 transition"
                            >
                                New Pricing
                            </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 p-2 border rounded-lg shadow-md">
                            {editFormData.pricingList.map((pricing, index) => (
                            <div
                                key={index}
                                className="p-4 border rounded-lg shadow-sm bg-white flex flex-col justify-between"
                            >
                                <div>
                                <p className="text-xl font-semibold text-blue-600">{pricing.price}</p>
                                <p className="text-sm text-gray-500">Cost: {pricing.cost}</p>
                                <p className="text-sm text-gray-500">Qty: {pricing.qty}</p>
                                <p className="text-sm text-gray-500">Supplier: {pricing.supplier?.name}</p>
                                <p className="text-xs text-gray-400">
                                    Effective Date: {new Date(pricing.effective_date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    })}
                                </p>
                                </div>
                                <button
                                type="button"
                                onClick={() => openEditPricingModal(pricing)}
                                className="mt-2 bg-blue-500 text-white text-sm py-1 px-2 rounded-md hover:bg-blue-600 transition"
                                >
                                Edit
                                </button>
                                {pricing.qty<=0 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemovePricing(pricing)}
                                    className="mt-2 bg-red-500 text-white text-sm py-1 px-2 rounded-md hover:bg-red-600 transition"
                                >
                                    Delete
                                </button>
                                )}
                            </div>
                            ))}
                        </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">No pricing details available.</p>
                    )}
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                        >
                        Close
                        </button>
                    </div>
                </form>
            </div>

            {showPricingModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg w-96">
                    <h3 className="text-lg font-semibold mb-4">
                    {selectedPricing.id ? "Edit Pricing" : "New Pricing"}
                    </h3>

                    {/* Cost Input */}
                    <label className="block mb-2">Cost:</label>
                    <input
                    type="number"
                    value={selectedPricing.cost}
                    onChange={(e) => setSelectedPricing({ ...selectedPricing, cost: e.target.value })}
                    className={`w-full border p-2 rounded-md ${
                        pricingErrors.cost ? "border-red-500" : "border-gray-300"
                    }`}
                    />

                    {/* Price Input */}
                    <label className="block mb-2 mt-3">Price:</label>
                    <input
                    type="number"
                    value={selectedPricing.price}
                    onChange={(e) => setSelectedPricing({ ...selectedPricing, price: e.target.value })}
                    className={`w-full border p-2 rounded-md ${
                        pricingErrors.price ? "border-red-500" : "border-gray-300"
                    }`}
                    />

                    {/* Quantity Input */}
                    <label className="block mb-2 mt-3">Quantity:</label>
                    <input
                    type="number"
                    value={selectedPricing.qty}
                    onChange={(e) => setSelectedPricing({ ...selectedPricing, qty: e.target.value })}
                    className={`w-full border p-2 rounded-md ${
                        pricingErrors.qty ? "border-red-500" : "border-gray-300"
                    }`}
                    />
        
                    {/* Supplier */}
                    {editFormData.track !== "N" && ( <>
                    <label className="block mb-2 mt-3">Supplier:</label>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions
                        loadOptions={fetchSuppliersModal}
                        name="supplierId"
                        onChange={(selected) => setSelectedPricing({ ...selectedPricing, supplierId: selected })}
                        value={selectedPricing.supplierId}
                        className="w-full"
                        placeholder="Search Suppliers..."
                    /> </>
                    )}
                    {/* Effective Date Picker */}
                    <label className="block mb-2 mt-3">Effective Date:</label>
                    <DatePicker
                    selected={selectedPricing.effective_date}
                    onChange={(date) => setSelectedPricing({ ...selectedPricing, effective_date: date })}
                    className={`w-full border px-3 py-2 rounded-lg focus:outline-none ${
                        pricingErrors.effective_date ? "border-red-500" : "border-gray-300"
                    }`}
                    dateFormat="MMMM d, yyyy"
                    />

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setShowPricingModal(false)} className="text-gray-600">
                        Cancel
                    </button>
                    <button onClick={handleSavePricing} className="bg-blue-600 text-white px-4 py-2 rounded-md">
                        Save
                    </button>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default ProductEditModal;