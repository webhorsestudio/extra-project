// Advanced PDF Generator using jsPDF
// This provides more sophisticated PDF generation capabilities

export interface PDFReportData {
  title: string
  url: string
  timestamp: string
  score: number
  grade: string
  summary: {
    passedChecks: number
    failedChecks: number
    warnings: number
  }
  issues: Array<{
    message: string
    type: string
    priority: string
    recommendation?: string
    impact?: string
    effort?: string
  }>
  recommendations: Array<{
    title?: string
    description?: string
    impact?: string
    effort?: string
  } | string>
  technicalDetails: Record<string, unknown>
}

export class AdvancedPDFGenerator {
  private static instance: AdvancedPDFGenerator

  static getInstance(): AdvancedPDFGenerator {
    if (!AdvancedPDFGenerator.instance) {
      AdvancedPDFGenerator.instance = new AdvancedPDFGenerator()
    }
    return AdvancedPDFGenerator.instance
  }

  async generatePDF(data: PDFReportData): Promise<Blob> {
    // For now, we'll use the HTML approach since jsPDF requires installation
    // In production, you would use jsPDF for better PDF generation
    
    const html = this.generateStyledHTML(data)
    const blob = new Blob([html], { type: 'text/html' })
    
    return blob
  }

  private generateStyledHTML(data: PDFReportData): string {
    const scoreColor = this.getScoreColor(data.score)
    const scoreGrade = data.grade

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${data.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
        }
        
        .report-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .report-info {
            background: #f8fafc;
            padding: 20px 40px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .report-info .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .report-info .info-label {
            font-weight: 600;
            color: #4a5568;
        }
        
        .report-info .info-value {
            color: #2d3748;
        }
        
        .score-section {
            padding: 40px;
            text-align: center;
            background: white;
        }
        
        .score-circle {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: conic-gradient(${scoreColor} 0deg ${(data.score / 100) * 360}deg, #e2e8f0 ${(data.score / 100) * 360}deg 360deg);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            position: relative;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .score-circle::before {
            content: '';
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: white;
            position: absolute;
        }
        
        .score-content {
            position: relative;
            z-index: 1;
        }
        
        .score-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: ${scoreColor};
            margin-bottom: 5px;
        }
        
        .score-total {
            font-size: 1.2rem;
            color: #6b7280;
        }
        
        .score-grade {
            font-size: 1.5rem;
            font-weight: 600;
            color: ${scoreColor};
            margin-top: 10px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        
        .summary-card {
            text-align: center;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .summary-card.passed {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            color: #065f46;
        }
        
        .summary-card.failed {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            color: #991b1b;
        }
        
        .summary-card.warnings {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #92400e;
        }
        
        .summary-number {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .summary-label {
            font-size: 1rem;
            font-weight: 600;
        }
        
        .section {
            padding: 40px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .section:last-child {
            border-bottom: none;
        }
        
        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        
        .issue {
            background: #f8fafc;
            border-left: 4px solid #e2e8f0;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .issue.error {
            border-left-color: #ef4444;
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        }
        
        .issue.warning {
            border-left-color: #f59e0b;
            background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
        }
        
        .issue.info {
            border-left-color: #3b82f6;
            background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%);
        }
        
        .issue-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .issue-title {
            font-weight: 600;
            color: #1a202c;
            font-size: 1.1rem;
        }
        
        .priority-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .priority-high {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }
        
        .priority-medium {
            background: #fefce8;
            color: #ca8a04;
            border: 1px solid #fde68a;
        }
        
        .priority-low {
            background: #f0f9ff;
            color: #2563eb;
            border: 1px solid #dbeafe;
        }
        
        .issue-details {
            color: #4a5568;
            font-size: 0.95rem;
        }
        
        .issue-details div {
            margin: 5px 0;
        }
        
        .recommendation {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 1px solid #bbf7d0;
            padding: 20px;
            margin: 15px 0;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .recommendation-title {
            font-weight: 600;
            color: #166534;
            margin-bottom: 8px;
            font-size: 1.1rem;
        }
        
        .recommendation-content {
            color: #15803d;
        }
        
        .recommendation-meta {
            display: flex;
            gap: 20px;
            margin-top: 10px;
            font-size: 0.9rem;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .meta-label {
            font-weight: 600;
            color: #166534;
        }
        
        .footer {
            background: #1a202c;
            color: white;
            padding: 30px 40px;
            text-align: center;
        }
        
        .footer p {
            margin: 5px 0;
            opacity: 0.8;
        }
        
        @media print {
            body { background: white; }
            .report-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1>${data.title}</h1>
            <div class="subtitle">Comprehensive SEO Analysis Report</div>
        </div>
        
        <div class="report-info">
            <div class="info-row">
                <span class="info-label">Website URL:</span>
                <span class="info-value">${data.url}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Report Generated:</span>
                <span class="info-value">${new Date(data.timestamp).toLocaleString()}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Report Type:</span>
                <span class="info-value">Comprehensive SEO Audit</span>
            </div>
        </div>
        
        <div class="score-section">
            <div class="score-circle">
                <div class="score-content">
                    <div class="score-number">${data.score}</div>
                    <div class="score-total">/ 100</div>
                </div>
            </div>
            <div class="score-grade">Grade: ${scoreGrade}</div>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card passed">
                <div class="summary-number">${data.summary.passedChecks}</div>
                <div class="summary-label">Passed Checks</div>
            </div>
            <div class="summary-card failed">
                <div class="summary-number">${data.summary.failedChecks}</div>
                <div class="summary-label">Failed Checks</div>
            </div>
            <div class="summary-card warnings">
                <div class="summary-number">${data.summary.warnings}</div>
                <div class="summary-label">Warnings</div>
            </div>
        </div>
        
        ${data.issues && data.issues.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Issues Found (${data.issues.length})</h2>
            ${data.issues.map(issue => `
                <div class="issue ${issue.type}">
                    <div class="issue-header">
                        <div class="issue-title">${issue.message}</div>
                        <span class="priority-badge priority-${issue.priority}">${issue.priority}</span>
                    </div>
                    <div class="issue-details">
                        ${issue.recommendation ? `<div><strong>Recommendation:</strong> ${issue.recommendation}</div>` : ''}
                        ${issue.impact ? `<div><strong>Impact:</strong> ${issue.impact}</div>` : ''}
                        ${issue.effort ? `<div><strong>Effort:</strong> ${issue.effort}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${data.recommendations && data.recommendations.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Recommendations (${data.recommendations.length})</h2>
            ${data.recommendations.map(rec => `
                <div class="recommendation">
                    ${typeof rec === 'string' ? `
                        <div class="recommendation-content">${rec}</div>
                    ` : `
                        <div class="recommendation-title">${rec.title || 'Recommendation'}</div>
                        <div class="recommendation-content">${rec.description || ''}</div>
                        ${(rec.impact || rec.effort) ? `
                            <div class="recommendation-meta">
                                ${rec.impact ? `<div class="meta-item"><span class="meta-label">Impact:</span> ${rec.impact}</div>` : ''}
                                ${rec.effort ? `<div class="meta-item"><span class="meta-label">Effort:</span> ${rec.effort}</div>` : ''}
                            </div>
                        ` : ''}
                    `}
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        <div class="footer">
            <p><strong>SEO Audit Report</strong></p>
            <p>Generated by SEO Configuration System</p>
            <p>For technical support, contact your system administrator</p>
        </div>
    </div>
</body>
</html>
    `
  }

  private getScoreColor(score: number): string {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    if (score >= 40) return '#f97316'
    return '#ef4444'
  }
}

export const advancedPDFGenerator = AdvancedPDFGenerator.getInstance()
