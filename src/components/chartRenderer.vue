<template>
  <div class="my-5">
    <Line :data="chart.data" :options="processedOptions"/>
  </div>
</template>

<script setup>
import { Line } from 'vue-chartjs';
import { computed } from 'vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale);

const props = defineProps({
  chart: Object,
});

const processedOptions = computed(() => {
  const options = props.chart.options || {};

  return {
    responsive: true,
    plugins: {
      title: {
        display: options.title?.display ?? false,
        text: options.title?.text ?? ''
      },
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero:
          options.scales?.y?.beginAtZero ??
          options.scales?.yAxes?.[0]?.ticks?.beginAtZero ??
          false
      }
    }
  };
});
</script>