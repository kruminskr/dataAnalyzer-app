<template>
  <nav class="navbar is-dark">
    <div class="container">
      <div id="navMenu" class="navbar-menu">
        <div class="navbar-start">
          <a class="navbar-item" @click="newQuery()">
            <h1 class="title has-text-white is-5">
              EU Data Insights
            </h1>
          </a>
        </div>
      </div>
    </div>
  </nav>

  <section class="hero is-dark is-fullheight-with-navbar">
    <div class="hero-body">
      <!-- Input query -->
      <div v-if="!displayResults" class="container is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
        <h1 class="title has-text-centered">
          Europes data analysis tool
        </h1>

        <div class="card input-card mt-2">
          <div class="card-content p-1">
            <textarea v-model="query" class="textarea is-shadowless no-border" placeholder="What do you want to know?" rows="3"></textarea>
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
          <button class="button" @click="newQuery()">New Query</button>
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

import ChartRenderer from '../components/chartRenderer.vue';

const query = ref('');
const displayResults = ref(false);
const analysis = ref({});
const charts = ref([]);
const loading = ref(false);

const formattedText = computed(() =>
  analysis.value.text.replace(/\n/g, '<br><br>')
);

const  analyzeQuery = async () => {
  try {
    loading.value = true;

    const body = {
      query: query.value,
    } 

    const response = await axios.post('http://localhost:3000/api/v1/data', body)

    loading.value = false;
    displayResults.value = true;
    analysis.value = response.data.analysis;
    charts.value = response.data.charts;

    return;
  } catch (error) {
    console.error(error)
    loading.value = false;
    return;
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
</style>