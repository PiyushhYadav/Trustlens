// Inject a DOM element to signal that the TrustLens extension is installed.
const marker = document.createElement('div');
marker.id = 'trustlens-extension-installed';
marker.style.display = 'none';

// We run at document_start, so document.body might not exist yet.
// Wait for DOMContentLoaded or append to documentElement.
if (document.body) {
  document.body.appendChild(marker);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(marker);
  });
}

// Also dispatch an event for immediate detection if the script loads later.
window.dispatchEvent(new CustomEvent('trustlens-installed', { detail: { version: '1.0.0' } }));
