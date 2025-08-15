import React, { useEffect, useState, useRef } from "react";
import { Pencil, Trash, Plus, X, Package, CheckCircle, XCircle, AlertTriangle, Recycle, Boxes, Puzzle, Bolt, Printer, ZapOff, View, Save  } from "lucide-react";
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toastr from 'toastr';
import Swal from "sweetalert2";
import 'toastr/build/toastr.min.css';
import AsyncSelect from "react-select/async";
import Layout from "./Layout";
import ProductCategories from "./ProductCategories";
import ProductSales from "./ProductSales";
import { productPrint } from "./ProductPrint";
import ProductNewModal from "./ProductNewModal";
import ProductEditModal from "./ProductEditModal";

const Products = () => {
  const [activeTab, setActiveTab] = useState("lists");
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);  
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [productCategories, setProductCategories] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState(null);  
  const [modalImageOpen, setModalImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageProductId, setSelectedImageProductId] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");   
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedSupplierModal, setSelectedSupplierModal] = useState(null);
  const [isImageEditing, setIsImageEditing] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(selectedImage);
  
  const fileInputRef = useRef(null);
  const didFetch = useRef(false);
  const [dateRange, setDateRange] = useState([
    new Date(),
    new Date(),
  ]);
  const [startDate, endDate] = dateRange;
  const [summary, setSummary] = useState({
    total: 0,
    available: 0,
    out_of_stock: 0,
    low_stock: 0,
    phaseout: 0,
    damaged: 0
  });
  const [categoriesCount, setCategoriesCount] = useState({
    main: 0,
    accessories: 0,
    boltsNscrews: 0,
  });
  const [editFormData, setEditFormData] = useState({ 
    id: "", 
    code: "", 
    name: "",
    variant: "",
    productCategoryId: "",
    product_status: "Available",
    productParentId: "",
    conversionQuantity: 0,
    track: 'Y'
  });   

  useEffect(() => {
    fetchProducts(filterType,filterCategory);
  }, [search, page, sortColumn, sortOrder, filterType, filterCategory, selectedSupplier]);

  useEffect(() => {
    fetchCategoriesCount(filterType);
  }, [filterType]);

  // useEffect(() => {
  //   fetchSuppliers();
  // }, [supplierSearch]);

  useEffect(() => {
    if (didFetch.current) return;
        didFetch.current = true;
    const fetchSummary = async () => {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.get("/api/products/summary", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setSummary(response.data);
      } catch (error) {
        // console.error("Error fetching summary:", error);
      }
    };

    const fetchProductCategories = async () => {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.get("/api/products/categories", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setProductCategories(response.data);
      } catch (error) {
        // console.error("Error fetching summary:", error);
      }
    };
  
    fetchSummary();
    fetchProductCategories();    
  }, []);

  

  const handleFilter = (filterType) => {
    setFilterType(filterType);
    fetchProducts(filterType,filterCategory);
  };

  const handleFilterCategories = (filterCategory) => {
    setFilterCategory(filterCategory);
    fetchProducts(filterType,filterCategory);
  };
  
  const fetchProducts = async (filter,filterCategory) => {
    
    try {
      const numericSelectedCategory = (selectedSupplier || []).map((item) => Number(item.value));
      const authToken = localStorage.getItem("token");
      const response = await axios.get(`/api/products`, {
        params: {
          search: search,
          page: page,
          filter: filter,
          filterCategory: filterCategory,
          suppliers: numericSelectedCategory,
          sort_column: sortColumn, 
          sort_order: sortOrder,
      },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setProducts(response.data.data);
      setMeta(response.data.meta || {});
    } catch (error) {
      // console.error("Error fetching products:", error);
    }
  };

  

  const fetchCategoriesCount = async (filter) => {
    try {
      const authToken = localStorage.getItem("token");
      const response = await axios.get(`/api/products/categoriesCount`, {
        params: {
          filter: filter
      },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // setCategoriesCount(response.data);

      const countData = response.data; 

      setProductCategories(prevCategories =>
        prevCategories.map(category => {
          const match = countData.find(
            item => item.product_category_id === category.id
          );
          return {
            ...category,
            count_products: match ? match.count_products : 0 
          };
        })
      );
    } catch (error) {
      // console.error("Error fetching products:", error);
    }
  };

  const handleSort = (column) => {
    const newSortOrder = 
        sortColumn === column && sortOrder === "asc" ? "desc" : "asc";

    setSortColumn(column);
    setSortOrder(newSortOrder);
};

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleImageEditClick = () => {
    setIsImageEditing(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewImageFile(file);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleImageClick = (imgSrc,productId) => {
    setSelectedImageProductId(productId);
    setSelectedImage(imgSrc);
    setPreviewImage(imgSrc);
    setModalImageOpen(true);
  };

  const handleImageClose = () => {
    setModalImageOpen(false);
    setSelectedImageProductId(null);
    setSelectedImage(null);
    setIsImageEditing(false);
    setNewImageFile(null);
  };

  const handleImageSave = async () => {
    if (!newImageFile || !selectedImageProductId) return;

    const formDataImage = new FormData();
    formDataImage.append('image', newImageFile);
    formDataImage.append('product_id', selectedImageProductId);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/product/update-image`, formDataImage, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setSelectedImage(response.data.image_url);
        setPreviewImage(response.data.image_url);
        setIsImageEditing(false);
        setNewImageFile(null);
        fetchProducts(filterType,filterCategory);
        toastr.success("Success!");
      } else {
        // console.error(response.data.message);
      }
    } catch (error) {
      // console.error('Image update failed:', error);
    }
  };

  const fetchSuppliers = async (inputValue) => {
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

  const openEditModal = (product) => {
    setEditFormData({
      id: product.id,
      code: product.code,
      name: product.name,
      variant: product.variant,
      productCategoryId: product.product_category_id,
      product_status: product.product_status,
      track: product.track,
      productParentId: product.parent_id,
      conversionQuantity: product.conversion_quantity,
      pricingList: product.pricing_list || [],
    });
    setShowEditModal(true);
  };

  return (
    <Layout>
      <div className="w-full mt-10 mx-auto">
        {/* Tabs */}
        <div className="mt-15 flex gap-4 mb-4">
          {["lists", "sales", "categories"].map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                activeTab === tab
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "lists" &&

        <div className="border border-gray-300 shadow-xl rounded-lg p-6 bg-white mx-auto w-full mt-4">  
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            >
              <Plus size={18} /> New Product
            </button>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {/* Total Products */}
            <button
              onClick={() => handleFilter("all")}
              className={`flex flex-col items-center p-3 rounded-xl shadow-md transition transform hover:scale-105 ${
                filterType === "all" ? "bg-blue-600 text-white" : "bg-white border border-gray-300"
              }`}
            >
              <Package size={28} className={`${filterType === "all" ? "text-white" : "text-blue-600"}`} />
              <span className="mt-2 text-base font-semibold">Total Products</span>
              <span className="text-lg font-bold">{summary.total}</span>
            </button>

            {/* Available Products */}
            <button
              onClick={() => handleFilter("available")}
              className={`flex flex-col items-center p-3 rounded-xl shadow-md transition transform hover:scale-105 ${
                filterType === "available" ? "bg-green-600 text-white" : "bg-white border border-gray-300"
              }`}
            >
              <CheckCircle size={28} className={`${filterType === "available" ? "text-white" : "text-green-600"}`} />
              <span className="mt-2 text-base font-semibold">Available</span>
              <span className="text-lg font-bold">{summary.available}</span>
            </button>

            {/* Out of Stock */}
            <button
              onClick={() => handleFilter("out-of-stock")}
              className={`flex flex-col items-center p-3 rounded-xl shadow-md transition transform hover:scale-105 ${
                filterType === "out-of-stock" ? "bg-red-600 text-white" : "bg-white border border-gray-300"
              }`}
            >
              <XCircle size={28} className={`${filterType === "out-of-stock" ? "text-white" : "text-red-600"}`} />
              <span className="mt-2 text-base font-semibold">Out of Stock</span>
              <span className="text-lg font-bold">{summary.out_of_stock}</span>
            </button>

            {/* Low Stock */}
            <button
              onClick={() => handleFilter("low-stock")}
              className={`flex flex-col items-center p-3 rounded-xl shadow-md transition transform hover:scale-105 ${
                filterType === "low-stock" ? "bg-yellow-600 text-white" : "bg-white border border-gray-300"
              }`}
            >
              <AlertTriangle size={25} className={`${filterType === "low-stock" ? "text-white" : "text-yellow-600"}`} />
              <span className="mt-2 text-base font-semibold">Low Stock</span>
              <span className="text-lg font-bold">{summary.low_stock}</span>
            </button>

            {/* Phaseout Stock */}
            <button
              onClick={() => handleFilter("phaseout")}
              className={`flex flex-col items-center p-3 rounded-xl shadow-md transition transform hover:scale-105 ${
                filterType === "phaseout" ? "bg-yellow-600 text-white" : "bg-white border border-gray-300"
              }`}
            >
              <Recycle size={25} className={`${filterType === "phaseout" ? "text-white" : "text-gray-600"}`} />
              <span className="mt-2 text-base font-semibold">Phaseout</span>
              <span className="text-lg font-bold">{summary.phaseout}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6 justify-center">
            {productCategories?.map((category, index) => {
              
                const isSelected = filterCategory === category.id;

                const colorVariants = [
                  "bg-red-100 text-red-700",
                  "bg-green-100 text-green-700",
                  "bg-blue-100 text-blue-700",
                  "bg-yellow-100 text-yellow-700",
                  "bg-purple-100 text-purple-700",
                  "bg-pink-100 text-pink-700",
                  "bg-teal-100 text-teal-700",
                  "bg-orange-100 text-orange-700",
                  "bg-cyan-100 text-cyan-700",
                  "bg-lime-100 text-lime-700",
                ];
                const selectedVariant = isSelected ? "bg-indigo-600 text-white" : colorVariants[index % colorVariants.length];

                return (
                  <button
                    key={category.id}
                    onClick={() => handleFilterCategories(category.id)}
                    className={`flex flex-col items-center justify-center text-center p-3 rounded-lg shadow-md transition transform hover:scale-105 ${selectedVariant}`}
                  >
                    <span className="text-sm font-semibold">{category.name}</span>
                    <span className="text-base font-bold mt-1">{category.count_products || 0}</span>
                  </button>
                );
              
            })}
          </div>

          {/* Search Input */}
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-6">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={handleSearch}
                className="flex-grow border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <AsyncSelect
                isMulti
                cacheOptions
                defaultOptions
                loadOptions={fetchSuppliers}
                onChange={(selected) => setSelectedSupplier(selected || [])}
                value={selectedSupplier}
                className="w-full"
                placeholder="Search Suppliers..."
              />
              <button
                onClick={() => productPrint(search, filterType, filterCategory)}
                className="flex flex-row items-center justify-center p-3 rounded-xl bg-blue-600 text-white shadow-md transition transform hover:scale-105"
              >
                <Printer size={28} />
                <span className="ml-2 text-base font-semibold">Print</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center">
                        <span>Code</span>
                        <span className="ml-1">
                            {sortColumn === "code" ? (sortOrder === "asc" ? "🔼" : "🔽") : "↕️"}
                        </span>
                    </div>
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                    onClick={() => handleSort("supplier")}
                  >
                    <div className="flex items-center">
                        <span>Supplier</span>
                        <span className="ml-1">
                            {sortColumn === "supplier" ? (sortOrder === "asc" ? "🔼" : "🔽") : "↕️"}
                        </span>
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Image</th>
                  <th
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                        <span>Name</span>
                        <span className="ml-1">
                            {sortColumn === "name" ? (sortOrder === "asc" ? "🔼" : "🔽") : "↕️"}
                        </span>
                    </div>
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                    onClick={() => handleSort("variant")}
                  >
                    <div className="flex items-center">
                        <span>Variant</span>
                        <span className="ml-1">
                            {sortColumn === "variant" ? (sortOrder === "asc" ? "🔼" : "🔽") : "↕️"}
                        </span>
                    </div>
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                    onClick={() => handleSort("product_category_id")}
                  >
                    <div className="flex items-center">
                        <span>Category</span>
                        <span className="ml-1">
                            {sortColumn === "product_category_id" ? (sortOrder === "asc" ? "🔼" : "🔽") : "↕️"}
                        </span>
                    </div>
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                    onClick={() => handleSort("cost")}
                  >
                    <div className="flex items-center">
                        <span>Cost</span>
                        <span className="ml-1">
                            {sortColumn === "cost" ? (sortOrder === "asc" ? "🔼" : "🔽") : "↕️"}
                        </span>
                    </div>
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center">
                        <span>Price</span>
                        <span className="ml-1">
                            {sortColumn === "price" ? (sortOrder === "asc" ? "🔼" : "🔽") : "↕️"}
                        </span>
                    </div>
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                    onClick={() => handleSort("qty")}
                  >
                    <div className="flex items-center">
                        <span>Qty</span>
                        <span className="ml-1">
                            {sortColumn === "qty" ? (sortOrder === "asc" ? "🔼" : "🔽") : "↕️"}
                        </span>
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product, index) => (
                    <tr key={product.id}>
                      <td className="border border-gray-300 px-4 py-2">{product.code}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {product.pricing_list_available?.length > 0 ? (
                          <div className="space-y-3">
                            {product.pricing_list_available
                              ?.filter((value, index, self) => 
                                index === self.findIndex((t) => (
                                  t.supplier?.id === value.supplier?.id
                                ))
                              )
                              .map((price, index) => (
                                <div
                                  key={index}
                                  className="p-2 border-b border-gray-200 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow"
                                >
                                  <p className="text-sm font-semibold text-gray-800">{price.supplier?.name}</p>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">No supplier available</p>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 flex justify-center">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded cursor-pointer"
                          onClick={() => handleImageClick(product.img,product.id)}
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.variant}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.product_category?.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.cost}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.price}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.qty}</td>
                      <td className="border border-gray-300 px-4 py-2 gap-2">
                        <button onClick={() => openEditModal(product)}
                          className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Pencil size={16} /> Edit
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

          <ProductNewModal
            showModal={showModal}
            setShowModal={setShowModal}
            fetchProducts={fetchProducts}
            filterType={filterType}
            filterCategory={filterCategory}
            productCategories={productCategories}
          />

          <ProductEditModal
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            fetchProducts={fetchProducts}
            filterType={filterType}
            filterCategory={filterCategory}
            productCategories={productCategories}
            editFormData={editFormData}
            setEditFormData={setEditFormData}
          />

          {modalImageOpen && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Product Image</h2>
    
              <img
                src={previewImage}
                alt="Product Preview"
                className="w-full max-h-[70vh] object-contain border rounded mb-4"
              />
    
              {isImageEditing && (
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full border p-2 rounded"
                  />
                </div>
              )}
    
              <div className="flex justify-end space-x-2">
                {!isImageEditing ? (
                  <button
                    onClick={handleImageEditClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit Image
                  </button>
                ) : (
                  <button
                    onClick={handleImageSave}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                )}
                <button
                  onClick={handleImageClose}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          
          )}

        </div>
        }

        {activeTab === "categories" &&
          <div className="border border-gray-300 shadow-xl rounded-lg p-6 bg-white mx-auto w-full mt-4">
            <ProductCategories/>
          </div>
        }
        {activeTab === "sales" &&
          <div className="border border-gray-300 shadow-xl rounded-lg p-6 bg-white mx-auto w-full mt-4">
            <ProductSales/>
          </div>
        }
      </div>
    </Layout>
  );
};

export default Products;
