(function () {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("image-input");
  const previewContainer = document.getElementById("preview-container");
  const form = document.getElementById("detect-form");
  const submitBtn = document.getElementById("submit-btn");
  const formAlerts = document.getElementById("form-alerts");
  const resultsEmpty = document.getElementById("results-empty");
  const resultsBody = document.getElementById("results-body");
  const apiKeyInput = document.getElementById("apikey-input");
  const rememberKey = document.getElementById("remember-key");
  const latInput = document.getElementById("lat-input");
  const lngInput = document.getElementById("lng-input");
  const useLocationBtn = document.getElementById("use-location");

  let selectedFile = null;
  let imageDims = { width: 0, height: 0 };

  const storedKey = getStoredApiKey();
  if (storedKey) {
    apiKeyInput.value = storedKey;
    rememberKey.checked = true;
  }

  ["dragenter", "dragover"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add("is-dragover");
    })
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove("is-dragover");
    })
  );
  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  function handleFile(file) {
    if (!file.type.startsWith("image/")) {
      renderAlert(formAlerts, "error", "Please choose a JPEG or PNG image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      renderAlert(formAlerts, "error", "That image is over 10MB — the API rejects anything larger.");
      return;
    }
    formAlerts.innerHTML = "";
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        imageDims = { width: img.naturalWidth, height: img.naturalHeight };
        previewContainer.innerHTML = `<div class="preview-wrap"><img id="preview-img" src="${reader.result}" alt="Selected road photo preview" /><canvas id="preview-canvas" style="position:absolute; inset:0;"></canvas></div>`;
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  useLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showToast("Geolocation isn't supported in this browser.", "error");
      return;
    }
    useLocationBtn.disabled = true;
    useLocationBtn.textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latInput.value = pos.coords.latitude.toFixed(6);
        lngInput.value = pos.coords.longitude.toFixed(6);
        useLocationBtn.disabled = false;
        useLocationBtn.textContent = "Use my current location";
        showToast("Location captured.", "success");
      },
      (err) => {
        useLocationBtn.disabled = false;
        useLocationBtn.textContent = "Use my current location";
        showToast(`Couldn't get your location: ${err.message}`, "error");
      },
      { timeout: 10000 }
    );
  });

  function renderAlert(container, type, message) {
    container.innerHTML = `<div class="alert ${type}">${escapeHtml(message)}</div>`;
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.innerHTML = isLoading
      ? '<span class="spinner"></span> Running detection…'
      : "Run detection";
  }

  function drawBoxes(detections) {
    const canvas = document.getElementById("preview-canvas");
    const img = document.getElementById("preview-img");
    if (!canvas || !img || !imageDims.width) return;

    const draw = () => {
      const rect = img.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const scaleX = rect.width / imageDims.width;
      const scaleY = rect.height / imageDims.height;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      detections.forEach((d) => {
        const isPothole = d.label.toLowerCase() === "pothole";
        ctx.strokeStyle = isPothole ? "#ff5f6d" : "#ffb648";
        ctx.lineWidth = 3;
        const x = d.bbox.x1 * scaleX;
        const y = d.bbox.y1 * scaleY;
        const w = (d.bbox.x2 - d.bbox.x1) * scaleX;
        const h = (d.bbox.y2 - d.bbox.y1) * scaleY;
        ctx.strokeRect(x, y, w, h);
        const label = `${d.label} ${(d.confidence * 100).toFixed(0)}%`;
        ctx.font = "600 12px -apple-system, sans-serif";
        const textW = ctx.measureText(label).width + 10;
        ctx.fillStyle = isPothole ? "#ff5f6d" : "#ffb648";
        ctx.fillRect(x, Math.max(0, y - 18), textW, 18);
        ctx.fillStyle = "#0b0b14";
        ctx.fillText(label, x + 5, Math.max(12, y - 5));
      });
    };
    if (img.complete) draw();
    else img.onload = draw;
    window.addEventListener("resize", draw, { once: true });
  }

  function renderResults(data) {
    resultsEmpty.classList.add("hidden");
    resultsBody.classList.remove("hidden");

    const badge = data.pothole_detected
      ? '<span class="badge danger">Pothole confirmed</span>'
      : '<span class="badge success">No pothole detected</span>';

    const rows = data.detections.length
      ? data.detections
          .map(
            (d) => `
        <tr>
          <td>${escapeHtml(d.label)}</td>
          <td>${(d.confidence * 100).toFixed(1)}%</td>
          <td>${d.bbox.x1.toFixed(0)}, ${d.bbox.y1.toFixed(0)} → ${d.bbox.x2.toFixed(0)}, ${d.bbox.y2.toFixed(0)}</td>
        </tr>`
          )
          .join("")
      : `<tr><td colspan="3" class="muted">No objects detected in this frame.</td></tr>`;

    resultsBody.innerHTML = `
      <div class="flex-between" style="margin-bottom:14px;">
        ${badge}
        <span class="small muted">${new Date(data.timestamp).toLocaleString()}</span>
      </div>
      ${data.id ? `<p class="small muted mt-8">Saved as detection <code>${escapeHtml(data.id)}</code> at ${data.coordinates.lat}, ${data.coordinates.lng}.</p>` : `<p class="small muted mt-8">Not saved — no pothole met the 40% confidence threshold.</p>`}
      <div class="table-wrap mt-16">
        <table>
          <thead><tr><th>Label</th><th>Confidence</th><th>Bounding box</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    drawBoxes(data.detections);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formAlerts.innerHTML = "";

    if (!selectedFile) {
      renderAlert(formAlerts, "error", "Choose a road photo before running detection.");
      return;
    }
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      renderAlert(formAlerts, "error", "Enter both latitude and longitude.");
      return;
    }
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      renderAlert(formAlerts, "error", "An API key is required — /api/v1/detect is a protected endpoint.");
      return;
    }

    storeApiKey(apiKey, rememberKey.checked);
    setLoading(true);

    try {
      const data = await RoadGuardApi.detect({
        file: selectedFile,
        lat,
        lng,
        deviceId: document.getElementById("device-input").value.trim() || "manual",
        apiKey,
      });
      renderResults(data);
      showToast(
        data.pothole_detected ? "Pothole confirmed and saved." : "Detection complete — no pothole found.",
        data.pothole_detected ? "success" : "info"
      );
    } catch (err) {
      let message = err.message;
      if (err.status === 401 || err.status === 403) {
        message = "That API key was rejected. Double-check it with your project admin.";
      } else if (err.status === 400) {
        message = err.message || "Those coordinates fall outside Ghana's bounding box.";
      } else if (err.status === 413) {
        message = "That image is too large — max size is 10MB.";
      } else if (err.status === 422) {
        message = "Couldn't read that file as an image. Try a JPEG or PNG.";
      } else if (err.status === 503) {
        message = "The detection model isn't ready on the server yet. Try again shortly.";
      }
      renderAlert(formAlerts, "error", message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  });
})();
