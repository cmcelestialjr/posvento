import React, { useEffect, useState, useRef } from "react";
import { View  } from "lucide-react";
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toastr from 'toastr';
import Swal from "sweetalert2";
import 'toastr/build/toastr.min.css';

const ProductSales = ({  }) => {
    const [productsSales, setProductsSales] = useState([]);
    const [metaProductsSales, setMetaProductsSales] = useState(null);      
    const [pageProductsSales, setPageProductsSales] = useState(1);
    const [searchProductsSales, setSearchProductsSales] = useState("");
    const [sortColumnProductsSales, setSortColumnProductsSales] = useState(null);
    const [sortOrderProductsSales, setSortOrderProductsSales] = useState("asc"); 
    const [showViewProductSalesModal, setShowViewProductSalesModal] = useState(false);  
    const [selectedProductsSales, setSelectedProductsSales] = useState(null);
    const [dateRange, setDateRange] = useState([
        new Date(),
        new Date(),
    ]);
    const [startDate, endDate] = dateRange;

    useEffect(() => {
        fetchProductsSales();
    }, [searchProductsSales, pageProductsSales, sortColumnProductsSales, sortOrderProductsSales, startDate, endDate]);

    const handleSearchProductsSales = (e) => {
        setSearchProductsSales(e.target.value);
        setPageProductsSales(1);
    };

    const handleSortProductsSales = (column) => {
        const newSortOrder = 
            sortColumnProductsSales === column && sortOrderProductsSales === "asc" ? "desc" : "asc";

        setSortColumnProductsSales(column);
        setSortOrderProductsSales(newSortOrder);
    };

    const openViewProductSalesModal = (product) => {
        setSelectedProductsSales(product);
        setShowViewProductSalesModal(true);
    };

    const formatPrice = (price) => {
        if (Number(price) === 0) return ' -';
        return `₱${Number(price).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    };

    const fetchProductsSales = async () => {
        
        try {
            const authToken = localStorage.getItem("token");
            const response = await axios.get(`/api/products/sales`, {
                params: {
                search: searchProductsSales,
                page: pageProductsSales,
                sort_column: sortColumnProductsSales, 
                sort_order: sortOrderProductsSales,
                start_date: startDate ? startDate.toISOString().split("T")[0] : null,
                end_date: endDate ? endDate.toISOString().split("T")[0] : null,
            },
                headers: { Authorization: `Bearer ${authToken}` },
            });
    
            setProductsSales(response.data.data);
            setMetaProductsSales(response.data.meta || {});
        } catch (error) {
          // console.error("Error fetching products:", error);
        }
    };
    
    return (
        <div>
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Products Sales</h1>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search products sales..."
                    value={searchProductsSales}
                    onChange={handleSearchProductsSales}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Single Calendar for Date Range */}
                <DatePicker
                    selected={startDate}
                    onChange={(update) => setDateRange(update)}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    isClearable
                    placeholderText="Select duration"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Products Sales Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-gray-700">
                    <th
                        className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                        onClick={() => handleSortProductsSales("code")}
                    >
                        <div className="flex items-center">
                            <span>Code</span>
                            <span className="ml-1">
                                {sortColumnProductsSales === "code" ? (sortOrderProductsSales === "asc" ? "🔼" : "🔽") : "↕️"}
                            </span>
                        </div>
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Image</th>
                    <th
                        className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                        onClick={() => handleSortProductsSales("name_variant")}
                    >
                        <div className="flex items-center">
                            <span>Product</span>
                            <span className="ml-1">
                                {sortColumnProductsSales === "name_variant" ? (sortOrderProductsSales === "asc" ? "🔼" : "🔽") : "↕️"}
                            </span>
                        </div>
                    </th>
                    <th
                        className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                        onClick={() => handleSortProductsSales("product_category_id")}
                    >
                        <div className="flex items-center">
                            <span>Category</span>
                            <span className="ml-1">
                                {sortColumnProductsSales === "product_category_id" ? (sortOrderProductsSales === "asc" ? "🔼" : "🔽") : "↕️"}
                            </span>
                        </div>
                    </th>
                    <th
                        className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                        onClick={() => handleSortProductsSales("total_costs")}
                    >
                        <div className="flex items-center">
                            <span>Cost</span>
                            <span className="ml-1">
                                {sortColumnProductsSales === "total_costs" ? (sortOrderProductsSales === "asc" ? "🔼" : "🔽") : "↕️"}
                            </span>
                        </div>
                    </th>
                    <th
                        className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                        onClick={() => handleSortProductsSales("total_amount")}
                    >
                        <div className="flex items-center">
                            <span>Amount</span>
                            <span className="ml-1">
                                {sortColumnProductsSales === "total_amount" ? (sortOrderProductsSales === "asc" ? "🔼" : "🔽") : "↕️"}
                            </span>
                        </div>
                    </th>
                    <th
                        className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                        onClick={() => handleSortProductsSales("total_qty")}
                    >
                        <div className="flex items-center">
                            <span>Qty</span>
                            <span className="ml-1">
                                {sortColumnProductsSales === "total_qty" ? (sortOrderProductsSales === "asc" ? "🔼" : "🔽") : "↕️"}
                            </span>
                        </div>
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {productsSales.length > 0 ? (
                    productsSales.map((product, index) => (
                        <tr key={product.id}>
                        <td className="border border-gray-300 px-4 py-2">{product.code}</td>                      
                        <td className="border border-gray-300 px-4 py-2 flex justify-center">
                            <img
                            src={product.img}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                            // onClick={() => handleImageClick(product.img,product.id)}
                            />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{product.name_variant}</td>
                        <td className="border border-gray-300 px-4 py-2">{product.product_category?.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{product.total_costs}</td>
                        <td className="border border-gray-300 px-4 py-2">{product.total_amount}</td>
                        <td className="border border-gray-300 px-4 py-2">{product.total_qty}</td>
                        <td className="border border-gray-300 px-4 py-2 gap-2">
                            <button onClick={() => openViewProductSalesModal(product)}
                            className="flex items-center gap-1 text-blue-600 hover:underline">
                            <View size={16} /> View
                            </button>
                        </td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan="7" className="border border-gray-300 px-4 py-2 text-center">
                        No products found.
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {metaProductsSales && (
                <div className="flex justify-between items-center mt-4">
                <button
                    disabled={!metaProductsSales.prev}
                    onClick={() => setPageProductsSales(pageProductsSales - 1)}
                    className={`px-4 py-2 rounded-lg ${metaProductsSales.prev ? "text-white bg-blue-600 hover:bg-blue-500" : "bg-gray-200 cursor-not-allowed"}`}
                >
                    Previous
                </button>
                <span>
                    Page {metaProductsSales.current_page} of {metaProductsSales.last_page}
                </span>
                <button
                    disabled={!metaProductsSales.next}
                    onClick={() => setPageProductsSales(pageProductsSales + 1)}
                    className={`px-4 py-2 rounded-lg ${metaProductsSales.next ? "text-white bg-blue-600 hover:bg-blue-500" : "bg-gray-200 cursor-not-allowed"}`}
                >
                    Next
                </button>
                </div>
            )}

            {showViewProductSalesModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
                    <h3 className="text-lg font-semibold mb-4">
                    {selectedProductsSales.name_variant}
                    </h3>

                    <div className="mt-2">
                    <div>
                        <label>Total Cost: </label>
                        <span className="text-blue-600">
                            {formatPrice(selectedProductsSales.total_costs)}
                        </span>
                    </div>
                    <div>
                        <label>Total Quantity: </label>
                        <span className="text-purple-600">
                            {selectedProductsSales.total_qty}
                        </span>
                    </div>
                    <div>
                        <label>Total Quantity: </label> 
                        <span className="text-green-600">
                            {formatPrice(selectedProductsSales.total_amount)}
                        </span>
                    </div>
                    </div>

                    <div className="overflow-x-auto mt-4">
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="border border-gray-300 px-4 py-2 text-left">DateTime of Sale</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Cost</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Qty</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedProductsSales?.sales?.length > 0 ? (
                            selectedProductsSales.sales.map((sale, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2">
                                    {new Date(sale.sale_info?.date_time_of_sale).toLocaleString()}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-right">
                                    {formatPrice(sale.cost)}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-right">
                                    {formatPrice(sale.price)}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-right">
                                    {sale.qty}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-right">
                                    {formatPrice(sale.amount)}
                                </td>
                                </tr>
                            ))
                            ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-gray-500">
                                No sales data available.
                                </td>
                            </tr>
                            )}
                        </tbody>
                        </table>
                    </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setShowViewProductSalesModal(false)} className="text-gray-600">
                        Close
                    </button>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default ProductSales;
