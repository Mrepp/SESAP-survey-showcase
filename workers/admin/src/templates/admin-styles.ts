export const adminStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Roboto', system-ui, sans-serif;
    background: #f5f5f5;
    color: #333;
    line-height: 1.6;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  header {
    background: #2c3e50;
    color: white;
    padding: 20px 0;
    margin-bottom: 30px;
  }

  header h1 {
    text-align: center;
    font-size: 28px;
    font-weight: 600;
  }

  nav {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 15px;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 20px;
  }

  nav a {
    color: white;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 4px;
    transition: background 0.2s;
  }

  nav a:hover, nav a.active {
    background: #34495e;
  }

  nav a.btn {
    color: white;
  }

  .card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .card h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #2c3e50;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  .form-group textarea {
    resize: vertical;
    min-height: 100px;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .btn {
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #3498db;
    color: white;
  }

  .btn-primary:hover {
    background: #2980b9;
  }

  .btn-success {
    background: #27ae60;
    color: white;
  }

  .btn-success:hover {
    background: #229954;
  }

  .btn-danger {
    background: #e74c3c;
    color: white;
  }

  .btn-danger:hover {
    background: #c0392b;
  }

  .btn-secondary {
    background: #95a5a6;
    color: white;
  }

  .btn-secondary:hover {
    background: #7f8c8d;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .interview-list {
    display: grid;
    gap: 16px;
  }

  .interview-item {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 16px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    align-items: center;
    transition: box-shadow 0.2s;
  }

  .interview-item:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  .interview-info h3 {
    font-size: 18px;
    margin-bottom: 8px;
    color: #2c3e50;
  }

  .interview-meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    font-size: 13px;
    color: #666;
  }

  .badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .badge-pending {
    background: #f39c12;
    color: white;
  }

  .badge-processing {
    background: #3498db;
    color: white;
  }

  .badge-completed {
    background: #27ae60;
    color: white;
  }

  .badge-failed {
    background: #e74c3c;
    color: white;
  }

  .badge-approved {
    background: #27ae60;
    color: white;
  }

  .badge-rejected {
    background: #e74c3c;
    color: white;
  }

  .interview-actions {
    display: flex;
    gap: 8px;
  }

  .detail-section {
    margin-bottom: 24px;
  }

  .detail-section h3 {
    font-size: 18px;
    margin-bottom: 12px;
    color: #2c3e50;
    border-bottom: 2px solid #ecf0f1;
    padding-bottom: 8px;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .detail-item {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 4px;
  }

  .detail-item label {
    display: block;
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .detail-item .value {
    font-size: 14px;
    color: #2c3e50;
    font-weight: 500;
  }

  .transcript-box,
  .analysis-box {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 16px;
    max-height: 400px;
    overflow-y: auto;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .video-preview {
    margin-top: 16px;
    border-radius: 8px;
    overflow: hidden;
  }

  .video-preview iframe {
    width: 100%;
    height: 400px;
    border: none;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
  }

  .alert {
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .alert-success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .alert-error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  .alert-info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
  }

  .loading {
    text-align: center;
    padding: 40px;
    color: #666;
  }

  .spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .filter-bar select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #999;
  }

  .empty-state svg {
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    .container {
      padding: 10px;
    }

    .interview-item {
      grid-template-columns: 1fr;
    }

    .interview-actions {
      justify-content: flex-start;
    }

    .form-row {
      grid-template-columns: 1fr;
    }
  }
`;
