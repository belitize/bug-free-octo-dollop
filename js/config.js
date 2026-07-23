/**
 * Survey configuration — edit before deploying.
 *
 * FORMSPREE SETUP:
 * 1. Create a free account at https://formspree.io using a throwaway email (e.g. ProtonMail).
 * 2. Create a new form → copy the form ID (e.g. "xyzabcde").
 * 3. Set FORMSPREE_ENDPOINT below to: https://formspree.io/f/YOUR_FORM_ID
 * 4. In Formspree dashboard: disable "Store submissions" IP logging if available;
 *    enable email notifications to your throwaway inbox only.
 * 5. Never commit this file with a real endpoint to a public repo if you want extra obscurity —
 *    set the endpoint via GitHub Secrets + build step, or configure after clone.
 */
const SURVEY_CONFIG = {
  // Replace with your Formspree endpoint, or leave empty to use local-only storage
  FORMSPREE_ENDPOINT: '',

  // Passphrase for #admin export panel (change this!)
  ADMIN_PASSPHRASE: 'change-me-before-deploy',

  // localStorage keys
  DRAFT_KEY: 'hair_fetish_survey_draft_v1',
  SUBMISSIONS_KEY: 'hair_fetish_survey_submissions_v1',
};
