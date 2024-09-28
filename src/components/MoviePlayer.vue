<template>
  <div class="movie-player">
    <div v-if="loading" class="loading-message">
      <p>Đang tải tập phim...</p>
    </div>
    <div v-else>
      <h1 class="movie-title">{{ movie.name }}</h1>
      <div v-if="selectedEpisode">
        <iframe
          v-if="selectedEpisode.link_embed"
          :src="selectedEpisode.link_embed"
          frameborder="0"
          allowfullscreen
          class="video-frame"
        ></iframe>
        <video v-else-if="selectedEpisode.link_m3u8" controls class="video-frame">
          <source :src="selectedEpisode.link_m3u8" type="application/x-mpegURL">
          Trình duyệt của bạn không hỗ trợ video này.
        </video>
        <div v-else class="no-video-message">
          Không tìm thấy đường dẫn xem phim cho tập này.
        </div>
      </div>
      <div class="episode-list">
        <h2>Danh sách tập phim:</h2>
        <button
          v-for="episode in filteredEpisodes"
          :key="episode.slug"
          @click="selectEpisode(episode)"
          :class="{ 'active': selectedEpisode && selectedEpisode.slug === episode.slug }"
          class="episode-button"
        >
          Tập {{ episode.name }}
        </button>
      </div>
      <div class="server-list">
        <h2>Chọn server:</h2>
        <button
          v-for="server in servers"
          :key="server"
          @click="selectServer(server)"
          :class="{ 'active': selectedServer === server }"
          class="server-button"
        >
          {{ server }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      movie: null,
      selectedEpisode: null,
      episodes: [],
      servers: [], // Danh sách server
      selectedServer: null, // Server được chọn
      slug: this.$route.params.slug,
      episodeSlug: this.$route.params.episode,
      loading: true,
    };
  },
  computed: {
    filteredEpisodes() {
      if (!this.selectedServer) return [];
      const serverData = this.episodes.find(episode => episode.server_name === this.selectedServer);
      return serverData ? serverData.server_data : [];
    }
  },
  methods: {
    async fetchMovieDetails() {
      try {
        const response = await axios.get(`https://apii.online/api/phim/${this.slug}`);
        this.movie = response.data.movie;
        this.episodes = response.data.episodes; // Lấy dữ liệu episodes
        this.servers = this.episodes.map(episode => episode.server_name); // Lấy danh sách server
        this.selectedServer = this.servers[0]; // Chọn server đầu tiên
        this.selectedEpisode = this.filteredEpisodes.find(episode => episode.slug === this.episodeSlug) || this.filteredEpisodes[0];
      } catch (error) {
        console.error('Lỗi khi lấy thông tin phim:', error);
      } finally {
        this.loading = false;
      }
    },
    selectEpisode(episode) {
      this.selectedEpisode = episode;
      this.$router.push({ name: 'MoviePlayer', params: { slug: this.slug, episode: episode.slug } });
    },
    selectServer(server) {
      this.selectedServer = server;
      this.selectedEpisode = this.filteredEpisodes[0]; // Chọn tập đầu tiên của server mới
      this.$router.push({ name: 'MoviePlayer', params: { slug: this.slug, episode: this.selectedEpisode.slug } });
    },
  },
  mounted() {
    this.fetchMovieDetails();
  },
};
</script>

<style scoped>
.movie-player {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  max-width: 1200px;
  margin: 20px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.movie-title {
  font-size: 24px;
  margin-bottom: 20px;
}

.video-frame {
  width: 100%;
  height: 500px;
  border: none;
  border-radius: 8px;
  margin-bottom: 20px;
}

.loading-message {
  text-align: center;
  font-size: 1.5em;
  color: #888;
}

.no-video-message {
  text-align: center;
  font-size: 1.2em;
  color: #888;
  margin-bottom: 20px;
}

.episode-list {
  margin-top: 20px;
}

.episode-button {
  margin: 5px;
  padding: 10px 15px;
  background-color: #e0e0e0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.episode-button.active {
  background-color: #4CAF50;
  color: white;
}

.episode-button:hover {
  background-color: #d0d0d0;
}

.server-list {
  margin-top: 20px;
}

.server-button {
  margin: 5px;
  padding: 10px 15px;
  background-color: #e0e0e0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.server-button.active {
  background-color: #4CAF50;
  color: white;
}

.server-button:hover {
  background-color: #d0d0d0;
}
</style>