import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectAllAssets, 
  selectLoading, 
  selectError, 
  selectLastUpdated,
  selectFavorites,
  fetchCryptoData 
} from '../features/crypto/cryptoSlice';
import CryptoRow from './CryptoRow';
import ErrorDisplay from './ErrorDisplay';

const CryptoTable = () => {
    const dispatch = useDispatch();
    const assets = useSelector(selectAllAssets);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);
    const lastUpdated = useSelector(selectLastUpdated);
    const favorites = useSelector(selectFavorites);
    
    // State for filters and sorting
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filterOptions, setFilterOptions] = useState({
      priceMin: '',
      priceMax: '',
      percentChangeMin: '',
      searchTerm: ''
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
  
    // Handle pagination changes
    const handlePageChange = (page) => {
      setCurrentPage(page);
    };

    // Handle items per page change
    const handleItemsPerPageChange = (e) => {
      const newItemsPerPage = Number(e.target.value);
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1); // Reset to first page when changing items per page
      
      // Immediately fetch with new items per page
      dispatch(fetchCryptoData({ page: 1, perPage: newItemsPerPage }));
    };

    // Handle fetching data for different pages
    useEffect(() => {
      if (!loading) {
        dispatch(fetchCryptoData({ page: currentPage, perPage: itemsPerPage }));
      }
    }, [dispatch, currentPage]);

    const formatLastUpdated = () => {
      if (!lastUpdated) return '';
      const date = new Date(lastUpdated);
      return `${date.toLocaleTimeString()}`;
    };

    // Sorting function
    const requestSort = (key) => {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    };

    // Apply sorting
    const sortedAssets = React.useMemo(() => {
      let sortableAssets = [...assets];
      if (sortConfig.key) {
        sortableAssets.sort((a, b) => {
          // Handle null values
          if (a[sortConfig.key] === null) return 1;
          if (b[sortConfig.key] === null) return -1;
          
          // Compare based on data type
          if (typeof a[sortConfig.key] === 'string') {
            return sortConfig.direction === 'asc' 
              ? a[sortConfig.key].localeCompare(b[sortConfig.key])
              : b[sortConfig.key].localeCompare(a[sortConfig.key]);
          } else {
            return sortConfig.direction === 'asc' 
              ? a[sortConfig.key] - b[sortConfig.key]
              : b[sortConfig.key] - a[sortConfig.key];
          }
        });
      }
      return sortableAssets;
    }, [assets, sortConfig]);

    // Apply filters
    const filteredAssets = React.useMemo(() => {
      return sortedAssets.filter(asset => {
        // Filter by favorites
        if (showOnlyFavorites && !favorites.includes(asset.id)) {
          return false;
        }
        
        // Filter by price range
        if (filterOptions.priceMin && asset.price < parseFloat(filterOptions.priceMin)) {
          return false;
        }
        if (filterOptions.priceMax && asset.price > parseFloat(filterOptions.priceMax)) {
          return false;
        }
        
        // Filter by percentage change
        if (filterOptions.percentChangeMin && asset.percentChange24h < parseFloat(filterOptions.percentChangeMin)) {
          return false;
        }
        
        // Filter by search term (name or symbol)
        if (filterOptions.searchTerm && 
           !asset.name.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()) && 
           !asset.symbol.toLowerCase().includes(filterOptions.searchTerm.toLowerCase())) {
          return false;
        }
        
        return true;
      });
    }, [sortedAssets, showOnlyFavorites, favorites, filterOptions]);

    // Handle filter changes
    const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilterOptions(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Reset to first page when filtering
      setCurrentPage(1);
    };

    // Reset filters
    const resetFilters = () => {
      setFilterOptions({
        priceMin: '',
        priceMax: '',
        percentChangeMin: '',
        searchTerm: ''
      });
      setShowOnlyFavorites(false);
      setCurrentPage(1);
    };
    
    // Get sort direction indicator
    const getSortDirectionIndicator = (key) => {
      if (sortConfig.key !== key) {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        );
      }
      
      return sortConfig.direction === 'asc' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    };

    if (loading && assets.length === 0) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-b-blue-600 border-l-gray-200 border-r-gray-200 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-700">Loading crypto data...</p>
            <p className="text-sm text-gray-500">Fetching latest market information</p>
          </div>
        </div>
      );
    }

    // Use our new error component
    if (error) {
      return <ErrorDisplay error={error} />;
    }

    return (
      <div className="w-full h-screen overflow-hidden flex flex-col bg-gray-50">
        {/* Header section */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cryptocurrency Market</h1>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Updated: {formatLastUpdated()}</span>
                  </div>
                  <div className="mx-2 h-4 w-px bg-gray-300"></div>
                  <div className="text-sm text-gray-500">
                    {filteredAssets.length} assets
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    name="searchTerm"
                    value={filterOptions.searchTerm}
                    onChange={handleFilterChange}
                    placeholder="Search coins..."
                    className="pl-9 pr-4 py-2 rounded-full border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm shadow-sm transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
                <label htmlFor="favorites-toggle" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      id="favorites-toggle"
                      type="checkbox"
                      checked={showOnlyFavorites}
                      onChange={() => setShowOnlyFavorites(!showOnlyFavorites)}
                      className="sr-only"
                    />
                    <div className={`block w-10 h-6 rounded-full ${showOnlyFavorites ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-200`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform ${showOnlyFavorites ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <div className="ml-3 text-sm font-medium text-gray-700">Favorites</div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Advanced Filter Section */}
        <div className={`bg-white shadow-sm transition-all duration-300 overflow-hidden ${isFilterOpen ? 'max-h-64' : 'max-h-0'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label htmlFor="priceMin" className="block text-xs text-gray-500">Min Price ($)</label>
                <input
                  id="priceMin"
                  name="priceMin"
                  type="number"
                  value={filterOptions.priceMin}
                  onChange={handleFilterChange}
                  placeholder="0"
                  className="mt-1 block w-24 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="priceMax" className="block text-xs text-gray-500">Max Price ($)</label>
                <input
                  id="priceMax"
                  name="priceMax"
                  type="number"
                  value={filterOptions.priceMax}
                  onChange={handleFilterChange}
                  placeholder="∞"
                  className="mt-1 block w-24 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="percentChangeMin" className="block text-xs text-gray-500">Min 24h Change (%)</label>
                <input
                  id="percentChangeMin"
                  name="percentChangeMin"
                  type="number"
                  value={filterOptions.percentChangeMin}
                  onChange={handleFilterChange}
                  placeholder="-100"
                  className="mt-1 block w-24 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Table container */}
        <div className="flex-grow overflow-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="sr-only">Favorite</span>
                    </th>
                    <th 
                      className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer"
                      onClick={() => requestSort('rank')}
                    >
                      <div className="flex items-center">
                        <span># Rank</span>
                        <span className="ml-1 flex-none rounded">{getSortDirectionIndicator('rank')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer"
                      onClick={() => requestSort('name')}
                    >
                      <div className="flex items-center">
                        <span>Name</span>
                        <span className="ml-1 flex-none rounded">{getSortDirectionIndicator('name')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer"
                      onClick={() => requestSort('price')}
                    >
                      <div className="flex items-center justify-end">
                        <span>Price</span>
                        <span className="ml-1 flex-none rounded">{getSortDirectionIndicator('price')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer"
                      onClick={() => requestSort('percentChange1h')}
                    >
                      <div className="flex items-center justify-end">
                        <span>1h %</span>
                        <span className="ml-1 flex-none rounded">{getSortDirectionIndicator('percentChange1h')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer"
                      onClick={() => requestSort('percentChange24h')}
                    >
                      <div className="flex items-center justify-end">
                        <span>24h %</span>
                        <span className="ml-1 flex-none rounded">{getSortDirectionIndicator('percentChange24h')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer"
                      onClick={() => requestSort('percentChange7d')}
                    >
                      <div className="flex items-center justify-end">
                        <span>7d %</span>
                        <span className="ml-1 flex-none rounded">{getSortDirectionIndicator('percentChange7d')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer"
                      onClick={() => requestSort('marketCap')}
                    >
                      <div className="flex items-center justify-end">
                        <span>Market Cap</span>
                        <span className="ml-1 flex-none rounded">{getSortDirectionIndicator('marketCap')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer"
                      onClick={() => requestSort('volume24h')}
                    >
                      <div className="flex items-center justify-end">
                        <span>Volume(24h)</span>
                        <span className="ml-1 flex-none rounded">{getSortDirectionIndicator('volume24h')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer"
                      onClick={() => requestSort('circulatingSupply')}
                    >
                      <div className="flex items-center justify-end">
                        <span>Circulating Supply</span>
                        <span className="ml-1 flex-none rounded">{getSortDirectionIndicator('circulatingSupply')}</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span>7D Chart</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((asset) => (
                      <CryptoRow key={asset.id} asset={asset} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-500 text-lg font-medium">No results found</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {showOnlyFavorites ? "No favorites added yet." : "Try adjusting your filters."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Pagination controls */}
        <div className="bg-white shadow-sm border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label htmlFor="itemsPerPage" className="text-sm text-gray-700 mr-2">Show:</label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="block w-20 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100 transition-colors duration-150'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <div className="bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Page {currentPage}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default CryptoTable;