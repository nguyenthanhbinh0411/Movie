<template>
  <div class="movie-details">
    <div v-if="loading" class="loading-message">
      Đang tải dữ liệu...
    </div>
    <div v-else-if="error">
      Có lỗi xảy ra: {{ error }}
    </div>
    <div v-else class="movie-container row">
      <div class="col-md-4">
        <img :src="movie.thumb_url" :alt="movie.name" class="movie-poster" />
      </div>
      <div class="col-md-8 movie-info">
        <h1 class="movie-title">{{ movie.name }}</h1>
        <p>{{ movie.origin_name }}</p>
        <p>{{ movie.type }} | {{ movie.status }}</p>
        <p>{{ movie.time }}</p>
        <p>Chất lượng: {{ movie.quality }}</p>
        <p>Ngôn ngữ: {{ movie.lang }}</p>
        <p>Năm sản xuất: {{ movie.year }}</p>
        <p>Số lượt xem: {{ movie.view }}</p>
        <p>Thể loại: {{ movie.category.map(c => c.name).join(', ') }}</p>
        <p>Quốc gia: {{ movie.country.map(c => c.name).join(', ') }}</p>
        <button class="btn btn-primary" @click="showTrailer = true">Xem trailer</button>
        <router-link :to="{ name: 'MoviePlayer', params: { slug: $route.params.slug, episode: 'tap-1' }}" class="btn btn-success">Xem phim</router-link>
        
        <div v-if="showTrailer" class="trailer-container">
          <iframe :src="getTrailerSrc()" width="100%" height="400" frameborder="0" allowfullscreen></iframe>
          <button class="btn btn-secondary" @click="showTrailer = false">Đóng</button>
        </div>
      </div>
    </div>
    <p class="movie-description">Nội dung: {{ movie.content }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      movie: {},
      loading: true,
      error: null,
      showTrailer: false,
    };
  },
  mounted() {
    this.fetchMovieDetails();
  },
  methods: {
    async fetchMovieDetails() {
      try {
        const response = await axios.get(`https://apii.online/api/phim/${this.$route.params.slug}`);
        this.movie = response.data.movie;
        this.loading = false;
      } catch (error) {
        this.error = 'Có lỗi xảy ra khi lấy thông tin phim';
        this.loading = false;
      }
    },
    getTrailerSrc() {
      const videoId = this.movie.trailer_url.split('v=')[1];
      const ampersandPosition = videoId ? videoId.indexOf('&') : -1;
      return `https://www.youtube.com/embed/${ampersandPosition !== -1 ? videoId.substring(0, ampersandPosition) : videoId}`;
    },
  },
};
</script>

<style scoped>
.movie-details {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  max-width: 1200px;
  margin: 20px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.movie-container {
  display: flex;
  align-items: flex-start;
}

.movie-poster {
  width: auto;
  height: 400px;
  border-radius: 8px;
}

.movie-info {
  padding-left: 10px;
  text-align: left;
  font-size: 0.9em;
}

.movie-title {
  font-size: 2.2em;
  color: #333;
  margin-bottom: 10px;
}

.movie-info p {
  font-size: 1.1em;
  color: #555;
  margin: 5px 0;
}

.movie-description {
  font-size: 0.9em;
  color: #555;
  margin-bottom: 5px;
}

.btn {
  margin-right: 5px;
  padding: 10px 20px;
  font-size: 1em;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-success {
  background-color: #28a745;
  color: white;
  border: none;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}

.loading-message {
  text-align: center;
  font-size: 1.5em;
  color: #888;
}

.trailer-container {
  margin-top: 20px;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
}
</style>