<template>
  <nav class="navbar is-dark">
    <div class="container">
      <div id="navMenu" class="navbar-menu">
        <div class="navbar-start">
          <a class="navbar-item" @click="newQuery()">
            <h1 class="title has-text-white is-5">
              Data Insights
            </h1>
          </a>
        </div>
      </div>
    </div>
  </nav>

  <section class="hero is-dark is-fullheight-with-navbar main-content">
    <div class="hero-body">
      <!-- Input query -->
      <div v-if="!displayResults" class="container is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
        <h1 class="title is-1 has-text-centered main-title">
          Europes data analysis tool
        </h1>
        <subtitle class="subtitle has-text-centered mt-2">
          Discover patterns and insights in European datasets
        </subtitle>

        <div class="card input-card mt-2">
          <div class="card-content p-1">
            <textarea v-if="!loading" v-model="query" class="textarea is-shadowless no-border" placeholder="What do you want to know?" rows="3"></textarea>

            <p v-if="loading" class="loading-placeholder has-text-grey-light">{{ loadingMessage }}</p>

            <button class="button is-dark is-pulled-right my-2" @click="analyzeQuery" :disabled="loading">
              <span v-if="!loading">Analyze</span>
              <span v-else class="is-flex is-align-items-center">
                <span class="loader mr-2"></span> Analyzing...
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- results -->
      <div class="container is-flex is-flex-direction-column is-align-items-stretch" v-if="displayResults">

        <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
          <h1 class="title mb-0">Analysis Results</h1>
          <button class="button is-dark" @click="newQuery()">New Query</button>
        </div>

        <!-- text -->
        <div class="box has-background-dark">
            <h2 class="title is-4 mb-2">Analysis</h2>
            <p class="subtitle is-6" v-html="formattedText"></p>
        </div>

        <!-- key points -->
        <div class="box has-background-dark has-text-light">
          <h2 class="title is-4 mb-5 has-text-light">Key Findings</h2>

          <div v-for="(point, index) in analysis.points" :key="index" class="mb-4">
            <div class="is-flex is-align-items-center mb-1">
              <h3 class="title is-6 mb-0 has-text-light">{{ point.metric }}</h3>
            </div>
            <p class="subtitle is-6 has-text-grey-light" v-html="point.description"></p>
          </div>
        </div>

        <!-- charts -->
        <div class="box has-background-dark">
          <h2 class="title is-4 mb-4 has-text-light">Charts</h2>

          <div class="columns is-multiline">
            <div class="column is-half" v-for="(chart, index) in charts" :key="index">
              <ChartRenderer :chart="chart" />
            </div>
          </div>
        </div>

        <!-- limitations -->
         <div class="box has-background-warning">
          <h2 class="title is-4 mb-2">⚠️ Limitations</h2>
          <p class="subtitle is-6" v-html="analysis.limitations"></p>
         </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useToast } from "vue-toastification";

import ChartRenderer from '../components/chartRenderer.vue';

const toast = useToast()

const backendAPI = import.meta.env.VITE_BACKEND_URL;

const query = ref('');
const displayResults = ref(false);
const analysis = ref({});
const charts = ref([]);
const loading = ref(false);
const loadingMessage = ref('');
let loadingInterval = null;

const loadingMessages = [
  "Analyzing your question...",
  "Fetching data from Eurostat...",
  "Crunching numbers...",
  "Generating insights...",
  "Almost there..."
];

const startLoadingMessages = () => {
  let step = 0;
  loadingMessage.value = loadingMessages[step];

  loadingInterval = setInterval(() => {
    step++;

    if (step >= loadingMessages.length) {
      clearInterval(loadingInterval);
      return;
    }

    loadingMessage.value = loadingMessages[step];
  }, 4000);
};

const stopLoadingMessages = () => {
  clearInterval(loadingInterval);
  loadingMessage.value = '';
};

const formattedText = computed(() =>
  analysis.value.text.replace(/\n/g, '<br><br>')
);

const  analyzeQuery = async () => {
  try {
    const trimmedQuery = query.value.trim();

    if (!trimmedQuery) {
      toast.warning("Please enter a question :)");
      return;
    }

    loading.value = true;
    startLoadingMessages();

    const body = {
      query: trimmedQuery,
    } 

    const response = await axios.post(`${backendAPI}/api/v1/data`, body)

    loading.value = false;
    stopLoadingMessages();
    displayResults.value = true;
    analysis.value = response.data.analysis;
    charts.value = response.data.charts;

    return;
  } catch (error) {
    const message = error?.response?.data?.message || "";

    if (message.includes("generativelanguage.googleapis.com")) {
      toast.error("AI service failed to respond. Try a different query.");
    }

    if (message.includes("ec.europa.eu")) {
      toast.error("Eurostat failed to respond. Try a different query.");
    }

    if (error.status === 500) {
      toast.error("Internal server error. Please try again later.");
    }

    stopLoadingMessages();
    return loading.value = false;
  }
}

const newQuery = () => {
  query.value = '';
  displayResults.value = false;
  analysis.value = {};
  charts.value = [];
}

</script>

<style scoped>
.no-border {
  border: none;
  box-shadow: none;
  resize: none;
  max-height: 70px;
}

.card {
  width: 50%;
}

.loader {
  width: 1em;
  height: 1em;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.main-content {
  background: linear-gradient(to right, #1a202c, #4a5568);
  font-family: 'Inter', sans-serif;
}

.navbar {
  background: linear-gradient(to right, #1a202c, #4a5568);
  font-family: 'Inter', sans-serif;
}

.loading-placeholder {
  height: 6em; 
  padding: 0.625em 0.75em;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  line-height: 1.5;
  max-height: 70px;
  white-space: pre-wrap;
  display: block;
  color: #b5b5b5; 
  border-radius: 4px;
  background: #fff; 
}

.button {
  background-color: #8b5cf6 ;
}
</style>