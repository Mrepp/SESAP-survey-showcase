import { adminStyles } from './admin-styles';

function renderNav(): string {
  return `
    <nav>
      <a href="/upload" class="btn btn-success" style="margin-left: auto;">+ New Interview</a>
    </nav>
  `;
}

export function renderUploadPage(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload Interview - SESAP Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
  <style>${adminStyles}</style>
</head>
<body>
  <header>
    <h1>SESAP Survey Showcase - Admin</h1>
    ${renderNav()}
  </header>

  <div class="container">
    <div id="alert-container"></div>

    <div class="card">
      <h2>Upload New Interview</h2>
      <form id="upload-form">
        <div class="form-group">
          <label for="title">Interview Title *</label>
          <input type="text" id="title" name="title" required placeholder="e.g., John Doe - Computer Science 2024">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="interviewDate">Interview Date *</label>
            <input type="date" id="interviewDate" name="interviewDate" required>
          </div>
          <div class="form-group">
            <label for="interviewer">Interviewer *</label>
            <input type="text" id="interviewer" name="interviewer" required placeholder="e.g., Dr. Smith">
          </div>
        </div>

        <div class="form-group">
          <label for="interviewURL">Video URL (optional)</label>
          <input type="url" id="interviewURL" name="interviewURL" placeholder="https://youtube.com/watch?v=...">
        </div>

        <h3 style="margin-top: 24px; margin-bottom: 16px; font-size: 18px;">Demographics</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="college">College/Institution *</label>
            <input type="text" id="college" name="college" required value="Oregon State University">
          </div>
          <div class="form-group">
            <label for="graduationYear">Graduation Year *</label>
            <input type="text" id="graduationYear" name="graduationYear" required placeholder="e.g., 2024">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="major">Major *</label>
            <input type="text" id="major" name="major" required placeholder="e.g., Computer Science">
          </div>
          <div class="form-group">
            <label for="gender">Gender (optional)</label>
            <input type="text" id="gender" name="gender" placeholder="e.g., Male, Female, Non-binary">
          </div>
        </div>

        <div class="form-group">
          <label for="ethnicity">Ethnicity (optional)</label>
          <input type="text" id="ethnicity" name="ethnicity" placeholder="e.g., Asian, Hispanic, etc.">
        </div>

        <div class="form-group">
          <label for="transcript">Transcript File *</label>
          <input type="file" id="transcript" name="transcript" accept=".txt,.md" required>
          <small style="display: block; margin-top: 4px; color: #666;">Accepted formats: .txt, .md</small>
        </div>

        <div class="form-group">
          <label for="notes">Notes (optional)</label>
          <textarea id="notes" name="notes" placeholder="Additional notes about this interview..."></textarea>
        </div>

        <div style="display: flex; gap: 12px;">
          <button type="submit" class="btn btn-primary" id="submit-btn">Upload Interview</button>
          <a href="/" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  </div>

  <script>
    const form = document.getElementById('upload-form');
    const submitBtn = document.getElementById('submit-btn');
    const alertContainer = document.getElementById('alert-container');

    function showAlert(message, type) {
      alertContainer.innerHTML = \`
        <div class="alert alert-\${type}">
          \${message}
        </div>
      \`;
      setTimeout(() => {
        alertContainer.innerHTML = '';
      }, 5000);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      submitBtn.disabled = true;
      submitBtn.textContent = 'Uploading...';

      try {
        const formData = new FormData(form);
        const transcriptFile = formData.get('transcript');

        // Build metadata JSON
        const metadata = {
          title: formData.get('title'),
          demographics: {
            college: formData.get('college'),
            graduationYear: formData.get('graduationYear'),
            major: formData.get('major'),
          },
          metadata: {
            interviewDate: formData.get('interviewDate'),
            interviewer: formData.get('interviewer'),
          }
        };

        // Add optional fields
        const interviewURL = formData.get('interviewURL');
        if (interviewURL) {
          metadata.metadata.interviewURL = interviewURL;
        }

        const gender = formData.get('gender');
        if (gender) {
          metadata.demographics.gender = gender;
        }

        const ethnicity = formData.get('ethnicity');
        if (ethnicity) {
          metadata.demographics.ethnicity = ethnicity;
        }

        const notes = formData.get('notes');
        if (notes) {
          metadata.metadata.notes = notes;
        }

        // Prepare multipart form data for API
        const apiFormData = new FormData();
        apiFormData.append('transcript', transcriptFile);
        apiFormData.append('metadata', JSON.stringify(metadata));

        const response = await fetch('/api/interviews', {
          method: 'POST',
          body: apiFormData,
        });

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            window.location.reload();
            return;
          }
          throw new Error(result.error?.message || 'Upload failed');
        }

        showAlert('Interview uploaded successfully! Processing has started.', 'success');
        form.reset();

        // Redirect to review page after a brief delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);

      } catch (error) {
        console.error('Upload error:', error);
        showAlert(\`Upload failed: \${error.message}\`, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload Interview';
      }
    });
  </script>
</body>
</html>
  `;
}

export function renderReviewPage(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Review Dashboard - SESAP Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
  <style>${adminStyles}</style>
</head>
<body>
  <header>
    <h1>SESAP Survey Showcase - Admin</h1>
    ${renderNav()}
  </header>

  <div class="container">
    <div class="card">
      <h2>Interview Review Dashboard</h2>

      <div class="filter-bar">
        <select id="status-filter">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>

        <select id="approval-filter">
          <option value="all">All Approvals</option>
          <option value="pending_review">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <button class="btn btn-secondary" onclick="loadInterviews()">Refresh</button>
      </div>

      <div id="interviews-container">
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading interviews...</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    let allInterviews = [];

    async function loadInterviews() {
      const container = document.getElementById('interviews-container');
      container.innerHTML = \`
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading interviews...</p>
        </div>
      \`;

      try {
        const response = await fetch('/api/interviews');
        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            window.location.reload();
            return;
          }
          throw new Error(result.error?.message || 'Failed to load interviews');
        }

        allInterviews = result.data || [];
        renderInterviews();

      } catch (error) {
        console.error('Load error:', error);
        container.innerHTML = \`
          <div class="alert alert-error">
            Failed to load interviews: \${error.message}
          </div>
        \`;
      }
    }

    function renderInterviews() {
      const container = document.getElementById('interviews-container');
      const statusFilter = document.getElementById('status-filter').value;
      const approvalFilter = document.getElementById('approval-filter').value;

      let filtered = allInterviews;

      if (statusFilter !== 'all') {
        filtered = filtered.filter(i => i.processing.status === statusFilter);
      }

      if (approvalFilter !== 'all') {
        filtered = filtered.filter(i => i.approval.status === approvalFilter);
      }

      if (filtered.length === 0) {
        container.innerHTML = \`
          <div class="empty-state">
            <p>No interviews found</p>
          </div>
        \`;
        return;
      }

      const html = \`
        <div class="interview-list">
          \${filtered.map(interview => {
            const showApprovalStatus = interview.processing.status === 'completed' || interview.processing.status === 'failed';
            return \`
            <div class="interview-item">
              <div class="interview-info">
                <h3>\${escapeHtml(interview.title)}</h3>
                <div class="interview-meta">
                  <span><strong>College:</strong> \${escapeHtml(interview.demographics.college)}</span>
                  <span><strong>Major:</strong> \${escapeHtml(interview.demographics.major)}</span>
                  <span><strong>Graduation:</strong> \${escapeHtml(interview.demographics.graduationYear)}</span>
                  <span class="badge badge-\${interview.processing.status}">\${interview.processing.status.toUpperCase()}</span>
                  \${showApprovalStatus ? \`<span class="badge badge-\${interview.approval.status.replace('_', '-')}">\${interview.approval.status.replace('_', ' ').toUpperCase()}</span>\` : ''}
                </div>
              </div>
              <div class="interview-actions">
                <a href="/interview/\${interview.id}" class="btn btn-primary">View Details</a>
              </div>
            </div>
          \`;
          }).join('')}
        </div>
      \`;

      container.innerHTML = html;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Add filter event listeners
    document.getElementById('status-filter').addEventListener('change', renderInterviews);
    document.getElementById('approval-filter').addEventListener('change', renderInterviews);

    // Load on page load
    loadInterviews();
  </script>
</body>
</html>
  `;
}

export function renderInterviewDetailPage(interviewId: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Details - SESAP Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
  <style>${adminStyles}</style>
</head>
<body>
  <header>
    <h1>SESAP Survey Showcase - Admin</h1>
    ${renderNav()}
  </header>

  <div class="container">
    <div id="alert-container"></div>

    <div id="content-container">
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading interview details...</p>
      </div>
    </div>
  </div>

  <script>
    const interviewId = '${interviewId}';
    let interview = null;
    let transcript = '';
    let analysis = null;

    function showAlert(message, type) {
      const alertContainer = document.getElementById('alert-container');
      alertContainer.innerHTML = \`
        <div class="alert alert-\${type}">
          \${message}
        </div>
      \`;
      setTimeout(() => {
        alertContainer.innerHTML = '';
      }, 5000);
    }

    async function loadInterview() {
      try {
        // Load interview metadata
        const response = await fetch(\`/api/interviews/\${interviewId}\`);
        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            window.location.reload();
            return;
          }
          throw new Error(result.error?.message || 'Failed to load interview');
        }

        interview = result.data;

        // Load transcript
        const transcriptResponse = await fetch(\`/api/interviews/\${interviewId}/transcript\`);
        transcript = await transcriptResponse.text();

        // Load analysis if completed
        if (interview.processing.status === 'completed') {
          try {
            const analysisResponse = await fetch(\`/api/interviews/\${interviewId}/analysis\`);
            const analysisResult = await analysisResponse.json();
            analysis = analysisResult.data;
          } catch (err) {
            console.warn('No analysis available yet');
          }
        }

        renderInterview();

      } catch (error) {
        console.error('Load error:', error);
        document.getElementById('content-container').innerHTML = \`
          <div class="alert alert-error">
            Failed to load interview: \${error.message}
          </div>
        \`;
      }
    }

    function renderInterview() {
      const canApprove = interview.processing.status === 'completed' && interview.approval.status === 'pending_review';

      const html = \`
        <div class="card">
          <h2>\${escapeHtml(interview.title)}</h2>

          <div class="detail-section">
            <h3>Status</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Processing Status</label>
                <div class="value">
                  <span class="badge badge-\${interview.processing.status}">\${interview.processing.status.toUpperCase()}</span>
                </div>
              </div>
              \${(interview.processing.status === 'completed' || interview.processing.status === 'failed') ? \`
                <div class="detail-item">
                  <label>Approval Status</label>
                  <div class="value">
                    <span class="badge badge-\${interview.approval.status.replace('_', '-')}">\${interview.approval.status.replace('_', ' ').toUpperCase()}</span>
                  </div>
                </div>
              \` : ''}
            </div>
            \${interview.processing.error ? \`
              <div class="alert alert-error" style="margin-top: 12px;">
                <strong>Processing Error:</strong> \${escapeHtml(interview.processing.error)}
              </div>
            \` : ''}
            \${interview.approval.rejectionReason ? \`
              <div class="alert alert-error" style="margin-top: 12px;">
                <strong>Rejection Reason:</strong> \${escapeHtml(interview.approval.rejectionReason)}
              </div>
            \` : ''}
          </div>

          <div class="detail-section">
            <h3>Demographics</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>College/Institution</label>
                <div class="value">\${escapeHtml(interview.demographics.college)}</div>
              </div>
              <div class="detail-item">
                <label>Graduation Year</label>
                <div class="value">\${escapeHtml(interview.demographics.graduationYear)}</div>
              </div>
              <div class="detail-item">
                <label>Major</label>
                <div class="value">\${escapeHtml(interview.demographics.major)}</div>
              </div>
              \${interview.demographics.gender ? \`
                <div class="detail-item">
                  <label>Gender</label>
                  <div class="value">\${escapeHtml(interview.demographics.gender)}</div>
                </div>
              \` : ''}
              \${interview.demographics.ethnicity ? \`
                <div class="detail-item">
                  <label>Ethnicity</label>
                  <div class="value">\${escapeHtml(interview.demographics.ethnicity)}</div>
                </div>
              \` : ''}
            </div>
          </div>

          <div class="detail-section">
            <h3>Transcript</h3>
            <div class="transcript-box">\${escapeHtml(transcript)}</div>
          </div>

          \${analysis ? \`
            <div class="detail-section">
              <h3>Analysis Summary</h3>
              \${analysis.summaries && analysis.summaries.length > 0 ? \`
                <div style="margin-bottom: 16px;">
                  \${analysis.summaries.map(s => \`
                    <div class="detail-item" style="margin-bottom: 12px;">
                      <label>\${escapeHtml(s.category)} (Confidence: \${(s.confidence * 100).toFixed(0)}%)</label>
                      <div class="value">\${escapeHtml(s.summaryText)}</div>
                    </div>
                  \`).join('')}
                </div>
              \` : '<p>No summaries available</p>'}

              <h4 style="margin-top: 20px; margin-bottom: 12px;">Key Themes</h4>
              \${analysis.themes && analysis.themes.length > 0 ? \`
                <div>
                  \${analysis.themes.map(theme => \`
                    <div class="detail-item" style="margin-bottom: 12px;">
                      <label>\${escapeHtml(theme.title)} (\${theme.category})</label>
                      <div class="value">\${escapeHtml(theme.description)}</div>
                    </div>
                  \`).join('')}
                </div>
              \` : '<p>No themes identified</p>'}

              <h4 style="margin-top: 20px; margin-bottom: 12px;">Full Analysis</h4>
              <div class="analysis-box">\${JSON.stringify(analysis, null, 2)}</div>
            </div>
          \` : (interview.processing.status === 'completed' ? \`
            <div class="alert alert-info">
              Analysis data not available yet.
            </div>
          \` : '')}

          \${canApprove ? \`
            <div class="action-buttons">
              <button class="btn btn-success" onclick="approveInterview()">Approve Interview</button>
              <button class="btn btn-danger" onclick="rejectInterview()">Reject Interview</button>
              <a href="/" class="btn btn-secondary">Back to Dashboard</a>
            </div>
          \` : \`
            <div class="action-buttons">
              <a href="/" class="btn btn-secondary">Back to Dashboard</a>
            </div>
          \`}
        </div>
      \`;

      document.getElementById('content-container').innerHTML = html;
    }

    async function approveInterview() {
      if (!confirm('Are you sure you want to approve this interview?')) {
        return;
      }

      try {
        const response = await fetch(\`/api/interviews/\${interviewId}/approve\`, {
          method: 'POST',
        });

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            window.location.reload();
            return;
          }
          throw new Error(result.error?.message || 'Failed to approve');
        }

        showAlert('Interview approved successfully!', 'success');

        // Reload after brief delay
        setTimeout(() => {
          loadInterview();
        }, 1500);

      } catch (error) {
        console.error('Approve error:', error);
        showAlert(\`Failed to approve: \${error.message}\`, 'error');
      }
    }

    async function rejectInterview() {
      const reason = prompt('Please provide a reason for rejection:');
      if (!reason) {
        return;
      }

      try {
        const response = await fetch(\`/api/interviews/\${interviewId}/reject\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason }),
        });

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            window.location.reload();
            return;
          }
          throw new Error(result.error?.message || 'Failed to reject');
        }

        showAlert('Interview rejected.', 'info');

        // Reload after brief delay
        setTimeout(() => {
          loadInterview();
        }, 1500);

      } catch (error) {
        console.error('Reject error:', error);
        showAlert(\`Failed to reject: \${error.message}\`, 'error');
      }
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Load on page load
    loadInterview();
  </script>
</body>
</html>
  `;
}
