import { JournalPaper } from '../types';
import { ASSETS } from './assets';
import { assetPath } from '../utils/assetPath';

// Conferences data for the Community page
type ConferenceEntry = Omit<JournalPaper, 'image'> & {
  image?: string;
  content: string; // HTML content shown in the detail modal
};

const CONFERENCE_ENTRIES: ConferenceEntry[] = [
  {
    title: "AI-Driven Microstructure Prediction for Next-Gen Superalloys",
    doi: "https://doi.org/10.1016/j.jmrt.2025.01.094",
    image: undefined, // Use default gallery image
    journal: "TMS 2025 Annual Meeting", 
    date: "2025.03.15",
    content: `
      <p class="mb-4 font-bold">AI-Driven Microstructure Prediction for Next-Gen Superalloys</p>
      <p class="mb-4">This presentation introduced an end-to-end workflow for predicting microstructures in next-generation superalloys using data-driven modeling.</p>
      <p class="mb-4">We presented how training datasets are constructed from representative alloy compositions and simulation-derived descriptors, followed by model development, cross-validation, and uncertainty-aware evaluation.</p>
      <p>Key results show improved predictive accuracy for microstructure features, enabling faster design exploration and more reliable guidance for experimental planning.</p>
    `,
  },
  {
    title: "In-situ Synchrotron Analysis of Metastable Alloys",
    doi: "https://doi.org/10.1016/j.actamat.2025.120757",
    image: undefined, // Use default gallery image
    journal: "Materials Science & Technology (MS&T) 2024", 
    date: "2024.10.20",
    content: `
      <p class="mb-4 font-bold">In-situ Synchrotron Analysis of Metastable Alloys</p>
      <p class="mb-4">We reported an in-situ synchrotron study of metastable alloys, focusing on time-resolved evolution of structural features under controlled conditions.</p>
      <p class="mb-4">The talk covered experimental acquisition strategy, preprocessing of diffraction signals, and an analysis pipeline that links observed changes to phase transformation mechanisms.</p>
      <p>We also discussed how the workflow can be integrated with machine-learning interpretation to accelerate insight extraction from large-scale measurements.</p>
    `,
  },
];

const buildImage = (image?: string) =>
  image ? assetPath(image) : ASSETS.GALLERY.TMS_CONF;

export const conferenceData: Array<JournalPaper & { content: string }> = CONFERENCE_ENTRIES.map((entry) => ({
  ...entry,
  image: buildImage(entry.image),
}));
