<template>
  <div>
    <h1>Danh Sách Anime</h1>
    <div class="container">
      <div class="filter-section">
        <select v-model="selectedCategory" @change="applyFilters">
          <option value="">Tất cả thể loại</option>
          <option v-for="category in categories" :key="category.slug" :value="category.slug">
            {{ category.name }}
          </option>
        </select>
        <select v-model="selectedYear" @change="applyFilters">
          <option value="">Tất cả năm</option>
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
        <select v-model="selectedCountry" @change="applyFilters">
          <option value="">Tất cả quốc gia</option>
          <option v-for="country in countries" :key="country.slug" :value="country.slug">
            {{ country.name }}
          </option>
        </select>
        <select v-model="selectedType" @change="applyFilters">
          <option value="">Tất cả loại phim</option>
          <option value="series">Phim bộ</option>
          <option value="single">Phim lẻ</option>
          <option value="hoathinh">Hoạt hình</option>
          <option value="tvshows">TV Shows</option>
        </select>
      </div>
      
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm phim..."
          @input="debounceSearch"
        >
        <button @click="searchMovies" class="search-button">
          <i class="bi bi-search"></i>
        </button>
      </div>

      <div v-if="loading" class="loading">Đang tải dữ liệu...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="movies.length > 0" class="movie-list">
        <div v-for="(movie, index) in movies" :key="index" class="movie-card card">
          <img :src="getMovieImage(movie)" :alt="movie.name" class="card-img-top movie-thumb" />
          <div class="card-body">
            <h5 class="card-title">{{ movie.name }}</h5>
            <p class="card-text">{{ movie.description }}</p>
            <router-link class="btn btn-custom" :to="`/movie/${movie.slug}`">Xem phim</router-link>
          </div>
        </div>
      </div>

      <div v-if="!loading && movies.length === 0" class="no-movies">
        Không có phim nào.
      </div>

      <div v-if="!isSearching" class="pagination">
        <button @click="fetchMovies(currentPage - 1)" :disabled="currentPage === 1">Trang trước</button>
        <span v-for="page in getPaginationButtons()" :key="page">
          <button @click="fetchMovies(page)" :class="{ active: page === currentPage }">{{ page }}</button>
        </span>
        <button @click="fetchMovies(currentPage + 1)" :disabled="currentPage === totalPages">Trang sau</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      movies: [],
      currentPage: 1,
      totalPages: 1,
      loading: false,
      error: null,
      searchQuery: '',
      isSearching: false,
      debounceTimer: null,
      selectedCategory: '',
      selectedYear: '',
      selectedCountry: '',
      selectedType: '',
      categories: [
  { slug: 'tinh-cam', name: 'Tình cảm' },
  { slug: 'hai-huoc', name: 'Hài hước' },
  { slug: 'hanh-dong', name: 'Hành động' },
  { slug: 'vien-tuong', name: 'Viễn tưởng' },
  { slug: 'kinh-di', name: 'Kinh dị' },
  { slug: 'vo-thuat', name: 'Võ thuật' },
  { slug: 'phieu-luu', name: 'Phiêu lưu' },
  { slug: 'co-trang', name: 'Cổ trang' },
  { slug: 'bi-an', name: 'Bí ẩn' },
  { slug: 'hoc-duong', name: 'Học đường' },
  { slug: 'am-nhac', name: 'Âm nhạc' },
  { slug: 'the-thao', name: 'Thể thao' },
  { slug: 'chinh-kich', name: 'Chính kịch' },
  { slug: 'gia-dinh', name: 'Gia đình' },
  { slug: 'tai-lieu', name: 'Tài liệu' },
  { slug: 'hoat-hinh', name: 'Hoạt hình' },
  { slug: 'than-thoai', name: 'Thần thoại' },
  { slug: 'trinh-tham', name: 'Trinh thám' },
  { slug: 'tu-linh', name: 'Tử linh' },
  { slug: 'khoa-hoc', name: 'Khoa học' },
  { slug: 'thieu-nhi', name: 'Thiếu nhi' },
  { slug: 'chien-tranh', name: 'Chiến tranh' },
  { slug: 'phim-ma', name: 'Phim ma' }
],

years: Array.from({ length: 30 }, (_, i) => 2023 - i),

countries: [
  { slug: 'viet-nam', name: 'Việt Nam' },
  { slug: 'trung-quoc', name: 'Trung Quốc' },
  { slug: 'han-quoc', name: 'Hàn Quốc' },
  { slug: 'nhat-ban', name: 'Nhật Bản' },
  { slug: 'my', name: 'Mỹ' },
  { slug: 'anh', name: 'Anh' },
  { slug: 'phap', name: 'Pháp' },
  { slug: 'duc', name: 'Đức' },
  { slug: 'thai-lan', name: 'Thái Lan' },
  { slug: 'an-do', name: 'Ấn Độ' },
  { slug: 'hong-kong', name: 'Hồng Kông' },
  { slug: 'italia', name: 'Italia' },
  { slug: 'nga', name: 'Nga' },
  { slug: 'uc', name: 'Úc' },
  { slug: 'canada', name: 'Canada' },
  { slug: 'mexico', name: 'Mexico' },
  { slug: 'tay-ban-nha', name: 'Tây Ban Nha' },
  { slug: 'thai-lan', name: 'Thái Lan' },
  { slug: 'philipin', name: 'Philippines' },
  { slug: 'malaysia', name: 'Malaysia' }
]

    };
  },
  mounted() {
    this.fetchMovies(this.currentPage);
  },
  methods: {
    async fetchMovies(page) {
      this.loading = true;
      this.error = null;
      try {
        let url = `https://apii.online/api/danh-sach?type=hoathinh&page=${page}`;
        if (this.selectedCategory) url += `&category=${this.selectedCategory}`;
        if (this.selectedYear) url += `&year=${this.selectedYear}`;
        if (this.selectedCountry) url += `&country=${this.selectedCountry}`;
        if (this.selectedType) url += `&type=${this.selectedType}`;

        const response = await fetch(url);
        const data = await response.json();
        this.movies = data.items || [];
        this.currentPage = page;
        this.totalPages = data.pagination.totalPages;
      } catch (err) {
        this.error = 'Lỗi khi tải danh sách phim.';
      } finally {
        this.loading = false;
      }
    },
    async searchMovies() {
      if (!this.searchQuery.trim()) {
        this.isSearching = false;
        return this.fetchMovies(1);
      }

      this.isSearching = true;
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`https://apii.online/api/danh-sach?search=${encodeURIComponent(this.searchQuery)}`);
        const data = await response.json();
        this.movies = data.items || [];
        this.totalPages = 1;
      } catch (err) {
        this.error = 'Lỗi khi tìm kiếm phim.';
      } finally {
        this.loading = false;
      }
    },
    debounceSearch() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.searchMovies();
      }, 300);
    },
    getPaginationButtons() {
      const buttons = [];
      for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
        if (i > 0 && i <= this.totalPages) {
          buttons.push(i);
        }
      }
      return buttons;
    },
    getMovieImage(movie) {
      if (movie.thumb_url) {
        return movie.thumb_url.startsWith('http') ? movie.thumb_url : `https://apii.online${movie.thumb_url}`;
      } else {
        return 'default-thumbnail.jpg';
      }
    },
    applyFilters() {
      this.fetchMovies(1);
    },
  }
};
</script>
<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar input {
  width: 300px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
  font-size: 16px;
}

.search-button {
  padding: 10px 15px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button i {
  font-size: 20px; /* Kích thước của icon */
}

.search-button:hover {
  background-color: #0056b3;
}

.loading, .error, .no-movies {
  text-align: center;
  margin-top: 20px;
}

.movie-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
}

.movie-card {
  flex: 0 0 calc(24% - 16px);
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.movie-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.movie-thumb {
  width: 100%;
  height: 280px;
  object-fit: cover;
}

.card-body {
  padding: 16px;
}

.card-title {
  font-size: 16px;
  margin-bottom: 8px;
}

.card-text {
  font-size: 14px;
  margin-bottom: 12px;
}

.btn-custom {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  text-align: center;
  text-decoration: none;
  transition: background-color 0.3s;
}

.btn-custom:hover {
  background-color: #0056b3;
}

.pagination {
  margin-top: 16px;
  text-align: center;
}

.pagination button {
  margin: 0 8px;
  padding: 8px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination button:hover {
  background-color: #e0e0e0;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination button.active {
  background-color: #007bff;
  color: white;
}.filter-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filter-section select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
</style>
