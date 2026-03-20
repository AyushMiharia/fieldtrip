import React from "react";
import PropTypes from "prop-types";
import "./SearchBar.css";

function SearchBar({ filters, setFilters, onSearch }) {
  const handleChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  const handleClear = () => {
    const cleared = {
      search: "",
      category: "",
      difficulty: "",
      format: "",
      minCost: "",
      maxCost: "",
    };
    setFilters(cleared);
    onSearch(cleared);
  };

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-row-main">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Search activities by name, location..."
          className="search-input"
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
        {hasFilters && (
          <button type="button" className="btn btn-ghost" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>

      <div className="search-filters">
        <select name="category" value={filters.category} onChange={handleChange}>
          <option value="">All Categories</option>
          <option value="hiking">Hiking</option>
          <option value="food">Food</option>
          <option value="sports">Sports</option>
          <option value="culture">Culture</option>
          <option value="nightlife">Nightlife</option>
        </select>

        <select name="difficulty" value={filters.difficulty} onChange={handleChange}>
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="hard">Hard</option>
        </select>

        <select name="format" value={filters.format} onChange={handleChange}>
          <option value="">All Formats</option>
          <option value="outdoor">Outdoor</option>
          <option value="indoor">Indoor</option>
          <option value="virtual">Virtual</option>
        </select>

        <input
          type="number"
          name="minCost"
          value={filters.minCost}
          onChange={handleChange}
          placeholder="Min $"
          min="0"
          className="cost-input"
        />

        <input
          type="number"
          name="maxCost"
          value={filters.maxCost}
          onChange={handleChange}
          placeholder="Max $"
          min="0"
          className="cost-input"
        />
      </div>
    </form>
  );
}

SearchBar.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    category: PropTypes.string,
    difficulty: PropTypes.string,
    format: PropTypes.string,
    minCost: PropTypes.string,
    maxCost: PropTypes.string,
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
