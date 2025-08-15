import React, { useState } from "react";
import { X, Save  } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AsyncSelect from "react-select/async";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import axios from 'axios';

const ProductNewModal = ({
    showModal,
    setShowModal,
    fetchProducts,
    filterType,
    filterCategory,
    productCategories
}) => {
    if (!showModal) return null; 
    const [errors, setErrors] = useState({});
    const [searchProduct, setSearchProduct] = useState(null);
    const [productOptions, setProductOptions] = useState([]);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        variant: "",
        cost: "",
        price: "",
        qty: "",
        productCategoryId: "",
        effective_date: null,
        supplierId: null,
        productParentId: "",
        conversionQuantity: 0,
        track: 'Y'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
                const authToken = localStorage.getItem("token");
        
                const cleanFormData = {
                ...formData,
                // supplierId: formData.track === 'N' ? 1 : formData.supplierId?.value ?? null,
                };
        
                const response = await axios.post(
                    "/api/products/store",
                    cleanFormData,
                    {
                        headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                        Authorization: `Bearer ${authToken}`,
                        },
                    }
                );
        
                if(response.data.message=="success"){
                    fetchProducts(filterType,filterCategory);
                    toastr.success("Product added successfully!");
                    setShowModal(false);
                    setFormData({
                        code: "",
                        name: "",
                        variant: "",
                        cost: "",
                        price: "",
                        qty: "",
                        productCategoryId: "",
                        supplierId: null,
                        effective_date: null,
                        track: 'Y',
                        productParentId: "",
                        conversionQuantity: 0,
                    });
                    setErrors({});
                }else{
                    toastr.error(response.data.message);
                }      
        
            } catch (error) {
                toastr.error("Failed to add product.", error);
            }          
        }
    };

    const validateForm = () => {
        let newErrors = {};
        Object.keys(formData).forEach((key) => {
            
            if (key !== "conversionQuantity" && key !== "productParentId" && key !== "supplierId" && !formData[key]) {
                newErrors[key] = "This field is required";
                console.log(newErrors[key]);
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSelectProduct = (productSelected) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            ['productParentId']: productSelected.id,
        }));
        setSearchProduct(`${productSelected.code}-${productSelected.name_variant}`);
        setProductOptions([]);
    };
    
    const handleConversionQuantity = (e) => {
        const value = e.target.value;
    
        setFormData((prevFormData) => ({
            ...prevFormData,
            conversionQuantity: value,
        }));
    
        if (formData.productParentId !== "" && value <= 0) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                conversionQuantity: "Conversion quantity must be greater than 0.", 
            }));
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                conversionQuantity: null,
            }));
        }
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;

        if (e.target.name === "productCategoryId") {
            if(e.target.value!=""){
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
                const authToken = localStorage.getItem("token");

                const formDataCategory = {
                    id: e.target.value
                };

                const response = await axios.post(
                "/api/product/category/code",
                formDataCategory,
                {
                    headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    Authorization: `Bearer ${authToken}`,
                    },
                }
                );
                
                if (response.status === 200 || response.status === 201) {
                if(response.data.message=="success"){
                    setFormData((prevFormData) => ({
                    ...prevFormData,
                    code: response.data.code,
                    [name]: value,
                    }));
                
                }
                }
            }else{
                setFormData((prevFormData) => ({
                ...prevFormData,
                code: "",
                [name]: value,
                }));
            }
        
        }else{
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));
        }
        if (e.target.value.trim() !== "") {
            setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: null }));
        }
        
    };

    const handleDateChange = (date) => {
        setFormData({ ...formData, effective_date: date });

        if (date) {
            setErrors((prevErrors) => ({ ...prevErrors, effective_date: null }));
        }
    };

    const handleProductSearch = async (e) => {
        const search = e.target.value;
        setSearchProduct(search);
        if (search.length > 1) {
            try {
                const authToken = localStorage.getItem("token");
                const response = await axios.get("/api/fetch-products", {
                    params: { search: search },
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                setProductOptions(response.data);
            } catch (error) {
                    // console.error("Error fetching products:", error);
            }
        } else {
            setProductOptions([]);
        }
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
            <div className="bg-white rounded-lg p-6 w-[500px] md:w-[600px] shadow-lg max-h-[90vh] overflow-y-auto relative">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Add New Product</h2>
                    <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <form name="newForm" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Track Product:</label>
                        <select
                            name="track"
                            value={formData.track}
                            // onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                            onChange={handleChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none ${
                            errors.track ? "border-red-500" : "border-gray-300"
                            }`}
                            wrapperClassName={`w-full ${
                            errors.track ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                            <option value="Y">Yes</option>
                            <option value="N">No</option>
                        </select>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Product Category:</label>
                        <select
                            name="productCategoryId"
                            value={formData.productCategoryId}
                            onChange={handleChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none ${
                            errors.productCategoryId ? "border-red-500" : "border-gray-300"
                            }`}
                            wrapperClassName={`w-full ${
                            errors.productCategoryId ? "border-red-500" : "border-gray-300"
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
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Code</label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                            errors.code ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}                      
                        />
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                            errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}                      
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Variant</label>
                        <input
                            type="text"
                            name="variant"
                            value={formData.variant}
                            onChange={handleChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                            errors.variant ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        />
                        </div>
                        {formData.track !== 'N' && (
                            <div>
                            <label className="block text-sm font-medium text-gray-700">Supplier</label>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                loadOptions={fetchSuppliersModal}
                                name="supplierId"
                                onChange={(selected) => setFormData({ ...formData, supplierId: selected })}
                                value={formData.supplierId}
                                className="w-full"
                                placeholder="Search Suppliers..."
                            />
                            </div>
                        )}
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Cost</label>
                        <input
                            type="number"
                            name="cost"
                            value={formData.cost}
                            onChange={handleChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                            errors.cost ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}                      
                        />
                        </div>  
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                            errors.price ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}                      
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input
                            type="number"
                            name="qty"
                            value={formData.qty}
                            onChange={handleChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                            errors.qty ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}                      
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Effective Date:</label>
                        <DatePicker
                            name="effectiveDate"
                            selected={formData.effective_date}
                            onChange={handleDateChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none ${
                            errors.effective_date ? "border-red-500" : "border-gray-300"
                            }`}
                            wrapperClassName={`w-full ${
                            errors.effective_date ? "border-red-500" : "border-gray-300"
                            }`}
                            dateFormat="MM-dd-yyyy"
                        />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">Product Parent:</label>
                            <input 
                                type="text"
                                name="searchProduct"
                                placeholder="Search Product"
                                value={searchProduct}
                                onChange={handleProductSearch}
                                className="border px-3 py-2 rounded-lg w-full"
                            />
                            {productOptions.length > 0 && (
                                <ul className="absolute left-0 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-60">
                                    {productOptions.map((product) => (
                                    <li 
                                        key={product.id} 
                                        className="p-2 cursor-pointer hover:bg-gray-200 flex items-center space-x-2"
                                        onClick={() => handleSelectProduct(product)}
                                    >
                                        <img
                                            src={product.img}
                                            alt={product.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <span>{product.code}-{product.name_variant}</span>
                                    </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {formData.productParentId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Conversion Qty:</label>
                            <input
                            type="number"
                            name="conversionQuantity"
                            value={formData.conversionQuantity}
                            onChange={handleConversionQuantity}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                                errors.conversionQuantity ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}                      
                            />
                        </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex items-center gap-1 bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                        >
                        <X size={16}/> Cancel
                        </button>
                        <button
                        type="submit"
                        className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                        >
                        <Save size={16} /> Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductNewModal;
