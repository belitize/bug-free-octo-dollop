(function () {
  'use strict';

  const TOTAL_SECTIONS = 6;
  let currentSection = 1;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const landing = $('#landing');
  const surveyForm = $('#surveyForm');
  const declined = $('#declined');
  const success = $('#success');
  const progressWrap = $('#progressWrap');
  const progressBar = $('#progressBar');
  const progressLabel = $('#progressLabel');
  const landingConsent = $('#landingConsent');
  const beginBtn = $('#beginBtn');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const intensity = $('#intensity');
  const intensityValue = $('#intensityValue');
  const aspectsOtherCheck = $('#aspectsOtherCheck');
  const aspectsOtherText = $('#aspectsOtherText');
  const shareLink = $('#shareLink');
  const copyLinkBtn = $('#copyLinkBtn');
  const adminPanel = $('#adminPanel');

  // --- Accordion ---
  $$('.accordion-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      const icon = btn.querySelector('.accordion-icon');
      const isOpen = target.classList.toggle('open');
      icon.style.transform = isOpen ? 'rotate(180deg)' : '';
    });
  });

  // --- Landing consent ---
  landingConsent?.addEventListener('change', () => {
    beginBtn.disabled = !landingConsent.checked;
  });

  beginBtn?.addEventListener('click', () => {
    if (!landingConsent.checked) return;
    landing.classList.remove('active');
    landing.classList.add('hidden');
    surveyForm.classList.remove('hidden');
    progressWrap.classList.remove('hidden');
    showSection(1);
    restoreDraft();
  });

  // --- Intensity slider ---
  intensity?.addEventListener('input', () => {
    intensityValue.textContent = intensity.value;
  });

  // --- Aspects other ---
  aspectsOtherCheck?.addEventListener('change', () => {
    aspectsOtherText.classList.toggle('hidden', !aspectsOtherCheck.checked);
  });

  // --- Section navigation ---
  function getSectionPanel(n) {
    return document.querySelector(`.section-panel[data-section="${n}"]`);
  }

  function showSection(n) {
    $$('.section-panel[data-section]').forEach((el) => el.classList.remove('active'));
    const panel = getSectionPanel(n);
    if (panel) panel.classList.add('active');
    currentSection = n;
    updateProgress();
    prevBtn.disabled = n === 1;
    nextBtn.textContent = n === TOTAL_SECTIONS ? 'Review →' : 'Next →';
    nextBtn.classList.toggle('hidden', n === TOTAL_SECTIONS);
    if (n === TOTAL_SECTIONS) buildReviewSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateProgress() {
    const pct = ((currentSection - 1) / TOTAL_SECTIONS) * 100;
    progressBar.style.width = `${pct}%`;
    progressLabel.textContent = `Step ${currentSection} of ${TOTAL_SECTIONS}`;
  }

  function validateSection(n) {
    const panel = getSectionPanel(n);
    if (!panel) return true;

    if (n === 1) {
      const consent = panel.querySelector('input[name="consent"]:checked');
      if (!consent) {
        alert('Please indicate whether you consent to participate.');
        return false;
      }
      if (consent.value === 'No') {
        surveyForm.classList.add('hidden');
        progressWrap.classList.add('hidden');
        declined.classList.remove('hidden');
        clearDraft();
        return false;
      }
      const gender = panel.querySelector('input[name="gender"]:checked');
      if (!gender) {
        alert('Please select your gender (required).');
        return false;
      }
    }
    return true;
  }

  prevBtn?.addEventListener('click', () => {
    if (currentSection > 1) showSection(currentSection - 1);
  });

  nextBtn?.addEventListener('click', () => {
    if (!validateSection(currentSection)) return;
    saveDraft();
    if (currentSection < TOTAL_SECTIONS) showSection(currentSection + 1);
  });

  // Consent "No" immediate exit
  surveyForm?.addEventListener('change', (e) => {
    if (e.target.name === 'consent' && e.target.value === 'No') {
      surveyForm.classList.add('hidden');
      progressWrap.classList.add('hidden');
      declined.classList.remove('hidden');
      clearDraft();
    }
  });

  // --- Collect form data ---
  function collectFormData() {
    const fd = new FormData(surveyForm);
    const data = {
      submitted_at: new Date().toISOString(),
      consent: fd.get('consent') || '',
      gender: fd.get('gender') || '',
      age_group: fd.get('age_group') || '',
      region: fd.get('region') || '',
      awareness_duration: fd.get('awareness_duration') || '',
      intensity: fd.get('intensity') || '',
      frequency: fd.get('frequency') || '',
      aspects: fd.getAll('aspects'),
      aspects_other: fd.get('aspects_other') || '',
      experience: fd.get('experience') || '',
      shared_partner: fd.get('shared_partner') || '',
      fantasies: fd.get('fantasies') || '',
      specific_hair_types: fd.get('specific_hair_types') || '',
      specific_hair_types_detail: fd.get('specific_hair_types_detail') || '',
      cultural_influences: fd.get('cultural_influences') || '',
      additional: fd.get('additional') || '',
    };
    return data;
  }

  function buildReviewSummary() {
    const data = collectFormData();
    const lines = [
      ['Consent', data.consent],
      ['Gender', data.gender],
      ['Age group', data.age_group],
      ['Region', data.region],
      ['Awareness duration', data.awareness_duration],
      ['Intensity (1-10)', data.intensity],
      ['Frequency', data.frequency],
      ['Aspects', data.aspects.join(', ') || '(none)'],
      ['Experience', truncate(data.experience, 80)],
      ['Shared with partner', truncate(data.shared_partner, 80)],
      ['Fantasies', truncate(data.fantasies, 80)],
      ['Specific hair types', `${data.specific_hair_types} ${data.specific_hair_types_detail}`.trim()],
      ['Cultural influences', truncate(data.cultural_influences, 80)],
      ['Additional', truncate(data.additional, 80)],
    ];
    $('#reviewSummary').innerHTML = lines
      .map(([k, v]) => `<div><span class="text-accent-muted">${k}:</span> ${escapeHtml(v || '—')}</div>`)
      .join('');
  }

  function truncate(str, len) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '…' : str;
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // --- localStorage draft ---
  function saveDraft() {
    const data = collectFormData();
    data._section = currentSection;
    try {
      localStorage.setItem(SURVEY_CONFIG.DRAFT_KEY, JSON.stringify(data));
      flashSaveNotice();
    } catch (_) {}
  }

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(SURVEY_CONFIG.DRAFT_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      populateForm(data);
      if (data._section && data._section >= 1 && data._section <= TOTAL_SECTIONS) {
        showSection(data._section);
      }
    } catch (_) {}
  }

  function clearDraft() {
    try { localStorage.removeItem(SURVEY_CONFIG.DRAFT_KEY); } catch (_) {}
  }

  function populateForm(data) {
    if (data.consent) setRadio('consent', data.consent);
    if (data.gender) setRadio('gender', data.gender);
    if (data.age_group) setRadio('age_group', data.age_group);
    if (data.region) setRadio('region', data.region);
    if (data.awareness_duration) $('#awareness_duration').value = data.awareness_duration;
    if (data.intensity) { intensity.value = data.intensity; intensityValue.textContent = data.intensity; }
    if (data.frequency) setRadio('frequency', data.frequency);
    if (data.aspects?.length) {
      data.aspects.forEach((v) => {
        const cb = surveyForm.querySelector(`input[name="aspects"][value="${CSS.escape(v)}"]`);
        if (cb) cb.checked = true;
      });
    }
    if (data.aspects_other) {
      aspectsOtherText.value = data.aspects_other;
      if (data.aspects.includes('Other')) aspectsOtherText.classList.remove('hidden');
    }
    ['experience', 'shared_partner', 'fantasies', 'specific_hair_types_detail', 'cultural_influences', 'additional'].forEach((name) => {
      const el = surveyForm.querySelector(`[name="${name}"]`);
      if (el && data[name]) el.value = data[name];
    });
    if (data.specific_hair_types) setRadio('specific_hair_types', data.specific_hair_types);
  }

  function setRadio(name, value) {
    const input = surveyForm.querySelector(`input[name="${name}"][value="${CSS.escape(value)}"]`);
    if (input) input.checked = true;
  }

  function flashSaveNotice() {
    [$('#saveBtn'), $('#saveBtnMobile')].forEach((btn) => {
      if (!btn) return;
      const orig = btn.textContent;
      btn.textContent = 'Saved ✓';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    });
  }

  $('#saveBtn')?.addEventListener('click', saveDraft);
  $('#saveBtnMobile')?.addEventListener('click', saveDraft);

  // Auto-save on input
  surveyForm?.addEventListener('change', saveDraft);
  surveyForm?.addEventListener('input', debounce(saveDraft, 800));

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  // --- Download participant responses ---
  function downloadParticipantCsv() {
    const data = collectFormData();
    const rows = Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v.join('; ') : v]);
    const csv = rows.map(([k, v]) => `"${String(k).replace(/"/g, '""')}","${String(v).replace(/"/g, '""')}"`).join('\n');
    downloadBlob(csv, 'my-survey-responses.csv', 'text/csv');
  }

  $('#downloadResponsesBtn')?.addEventListener('click', downloadParticipantCsv);

  function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // --- Submit ---
  surveyForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateSection(1)) return;

    const submitBtn = $('#submitBtn');
    const status = $('#submitStatus');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    status.classList.remove('hidden');
    status.textContent = 'Sending your anonymous responses…';
    status.className = 'text-sm text-accent-muted';

    const data = collectFormData();
    let ok = false;

    // Store local backup
    storeSubmissionLocally(data);

    // Send to Formspree if configured
    if (SURVEY_CONFIG.FORMSPREE_ENDPOINT) {
      try {
        const res = await fetch(SURVEY_CONFIG.FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(flattenForFormspree(data)),
        });
        ok = res.ok;
        if (!ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
      } catch (err) {
        status.textContent = `Formspree error: ${err.message}. Your response was saved locally — contact the researcher.`;
        status.className = 'text-sm text-red-400';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Anonymously';
        return;
      }
    } else {
      ok = true;
      status.textContent = 'Saved locally (Formspree not configured — see js/config.js).';
    }

    if (ok) {
      clearDraft();
      surveyForm.classList.add('hidden');
      progressWrap.classList.add('hidden');
      $('#navButtons')?.classList.add('hidden');
      success.classList.remove('hidden');
      shareLink.value = window.location.href.split('#')[0];
    }
  });

  function flattenForFormspree(data) {
    return {
      ...data,
      aspects: data.aspects.join('; '),
      _subject: `Survey submission — ${data.gender || 'unknown gender'}`,
    };
  }

  function storeSubmissionLocally(data) {
    try {
      const existing = JSON.parse(localStorage.getItem(SURVEY_CONFIG.SUBMISSIONS_KEY) || '[]');
      existing.push(data);
      localStorage.setItem(SURVEY_CONFIG.SUBMISSIONS_KEY, JSON.stringify(existing));
    } catch (_) {}
  }

  // --- Share link ---
  copyLinkBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareLink.value);
      copyLinkBtn.textContent = 'Copied!';
      setTimeout(() => { copyLinkBtn.textContent = 'Copy'; }, 2000);
    } catch (_) {
      shareLink.select();
      document.execCommand('copy');
    }
  });

  // --- Admin panel (#admin) ---
  function checkAdminHash() {
    if (window.location.hash === '#admin') adminPanel.classList.remove('hidden');
  }
  window.addEventListener('hashchange', checkAdminHash);
  checkAdminHash();

  $('#adminClose')?.addEventListener('click', () => {
    adminPanel.classList.add('hidden');
    history.replaceState(null, '', window.location.pathname);
  });

  $('#adminUnlock')?.addEventListener('click', () => {
    const pass = $('#adminPass').value;
    if (pass === SURVEY_CONFIG.ADMIN_PASSPHRASE) {
      $('#adminTools').classList.remove('hidden');
      updateSubmissionCount();
    } else {
      alert('Incorrect passphrase.');
    }
  });

  function getSubmissions() {
    try {
      return JSON.parse(localStorage.getItem(SURVEY_CONFIG.SUBMISSIONS_KEY) || '[]');
    } catch (_) {
      return [];
    }
  }

  function updateSubmissionCount() {
    $('#submissionCount').textContent = getSubmissions().length;
  }

  $('#exportCsvBtn')?.addEventListener('click', () => {
    const subs = getSubmissions();
    if (!subs.length) { alert('No local submissions.'); return; }
    const keys = [...new Set(subs.flatMap(Object.keys))];
    const header = keys.join(',');
    const rows = subs.map((s) =>
      keys.map((k) => `"${String(Array.isArray(s[k]) ? s[k].join('; ') : (s[k] ?? '')).replace(/"/g, '""')}"`).join(',')
    );
    downloadBlob([header, ...rows].join('\n'), `submissions-${Date.now()}.csv`, 'text/csv');
  });

  $('#exportJsonBtn')?.addEventListener('click', () => {
    const subs = getSubmissions();
    downloadBlob(JSON.stringify(subs, null, 2), `submissions-${Date.now()}.json`, 'application/json');
  });

  $('#clearLocalBtn')?.addEventListener('click', () => {
    if (confirm('Clear all locally stored submissions? Formspree copies are unaffected.')) {
      localStorage.removeItem(SURVEY_CONFIG.SUBMISSIONS_KEY);
      updateSubmissionCount();
    }
  });

  // Restore draft prompt on load if exists
  window.addEventListener('DOMContentLoaded', () => {
    try {
      if (localStorage.getItem(SURVEY_CONFIG.DRAFT_KEY)) {
        const resume = confirm('You have a saved draft. Resume where you left off?');
        if (resume) {
          landingConsent.checked = true;
          beginBtn.disabled = false;
          beginBtn.click();
        }
      }
    } catch (_) {}
  });
})();
