import React, { useEffect, useState, useRef } from "react";
import { X, Edit, Plus, Save } from "lucide-react";
import axios from 'axios';
import toastr from 'toastr';
import Swal from "sweetalert2";
import 'toastr/build/toastr.min.css';

const ProductCategories = ({  }) => {
    const [categories, setCategories] = useState([]);
    const [meta, setMeta] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [categoryModal, setCategoryModal] = useState(false);
    const [category, setCategory] = useState({
        id: null,
        name: null,
        increment: 'N',
        code_start: null
    });

    useEffect(() => {
        fetchCategories();
    }, [search]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleCategoryModal = (category) => {
        setCategory({
            id: category.id,
            name: category.name,
            increment: category.increment,
            code_start: category.code_start
        });
        setCategoryModal(true);
    };
    
    const handleCloseCategoryModal = () => {
        setCategory({
            id: null,
            name: null,
            increment: 'N',
            code_start: null
        });
        setCategoryModal(false);
    };

    const fetchCategories = async () => {
        
        try {
            const authToken = localStorage.getItem("token");
            const response = await axios.get(`/api/products/categories/index`, {
                params: {
                search: search,
            },
                headers: { Authorization: `Bearer ${authToken}` },
            });
    
            setCategories(response.data.data);
            setMeta(response.data.meta);
        } catch (error) {
          // console.error("Error fetching product categories:", error);
        }
    };

    const handleCategoryModalSubmit = async () => {
        if (!category.name) {
            toastr.error("Please input Category name!");
            return;
        }

        if (category.increment === 'Y' && !category.code_start) {
            toastr.error("Please input Category Code Start!");
            return;
        }

        try {            
            const formData = {
                id: category.id,
                name: category.name,
                increment: category.increment,
                code_start: category.code_start
            };
            const token = localStorage.getItem("token");
            const response = await axios.post(`/api/products/categories/manage`, 
                formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200 || response.status === 201) {
                toastr.success(response.data.message);
                fetchCategories();
                setCategory({
                    id: null,
                    name: null,
                    increment: 'N',
                    code_start: null
                });
                setCategoryModal(false);
            }else{
                toastr.error("Error! There is something wrong in saving new category.");
            }
        } catch (error) {
            toastr.error("Error!", error.response?.data);
        }
    };

    return (
        <div>
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Product Categories</h1>
                <button
                    onClick={() => handleCategoryModal(category)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                >
                    <Plus size={18} /> New Category
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={search}
                    onChange={handleSearch}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
                
            {/* Supplier Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700">
                                <th className="border border-gray-300 px-4 py-2 text-left">#</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Increment?</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Code Start</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories?.length > 0 ? (
                            categories.map((category, index) => (
                                <tr key={category.id}>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {index + 1}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {category.name}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {category.increment}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {category.code_start}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 gap-2">
                                        <button onClick={() => handleCategoryModal(category)}
                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline">
                                            <Edit size={16} /> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="border border-gray-300 px-4 py-2 text-center">
                                    No Category found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
                
            {/* Pagination Controls */}
            {meta && (
                <div className="flex justify-between items-center mt-4">
                    <button
                        disabled={!meta.prev}
                        onClick={() => setPage(page - 1)}
                        className={`px-4 py-2 rounded-lg ${meta.prev ? "text-white bg-blue-600 hover:bg-blue-500" : "bg-gray-200 cursor-not-allowed"}`}
                    >
                        Previous
                    </button>
                    <span>
                        Page {meta.current_page} of {meta.last_page}
                    </span>
                    <button
                        disabled={!meta.next}
                        onClick={() => setPage(page + 1)}
                        className={`px-4 py-2 rounded-lg ${meta.next ? "text-white bg-blue-600 hover:bg-blue-500" : "bg-gray-200 cursor-not-allowed"}`}
                    >
                        Next
                    </button>
                </div>
            )}

            {categoryModal && (
                <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative">
                        {/* Header */}
                        <div className="flex justify-between">
                            <h2 className="text-xl font-semibold">
                                {category.id ? "Edit Category" : "New Category"}
                            </h2>
                            <button 
                                onClick={handleCloseCategoryModal} 
                                className="text-gray-500 hover:text-gray-700 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Category Name */}
                        <label className="block text-sm font-medium mt-4">Name {category.id}</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={category.name}
                                onChange={(e) =>
                                    setCategory((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                className="w-full p-2 border rounded"
                                placeholder="Category Name..."
                            />
                        </div>

                        {/* Category Increment */}
                        <label className="block text-sm font-medium mt-4">Increment?</label>
                        <div className="relative">
                            <select
                                value={category.increment || ""}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    setCategory((prev) => ({
                                        ...prev,
                                        increment: value,
                                        code_start: value === "N" ? "" : prev.code_start,
                                    }));
                                }}
                                className="w-full p-2 border rounded"
                            >
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                            </select>
                        </div>

                        {/* Category Code Start */}
                        <label className="block text-sm font-medium mt-4">Code Start</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={category.code_start}
                                onChange={(e) =>
                                    setCategory((prev) => ({
                                        ...prev,
                                        code_start: e.target.value,
                                    }))
                                }
                                className="w-full p-2 border rounded"
                                placeholder="Category Code Start..."
                                disabled={category.increment === "N"}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="button"
                            onClick={handleCategoryModalSubmit} 
                            className="mt-4 p-2 flex items-center bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            <Save size={16} />  Save Category
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCategories;
