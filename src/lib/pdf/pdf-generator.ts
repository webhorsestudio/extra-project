// PDF Generation utilities for SEO reports
// This file provides functions to generate professional PDF reports

export interface SEOAuditData {
  score: number
  passedChecks: number
  failedChecks: number
  warnings: number
  issues: Array<{
    message: string
    type: string
    priority: string
    url?: string
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
  url: string
  timestamp: string
}

export class PDFGenerator {
  private static instance: PDFGenerator
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  static getInstance(): PDFGenerator {
    if (!PDFGenerator.instance) {
      PDFGenerator.instance = new PDFGenerator()
    }
    return PDFGenerator.instance
  }

  private initCanvas(): void {
    this.canvas = document.createElement('canvas')
    this.canvas.width = 800
    this.canvas.height = 600
    this.ctx = this.canvas.getContext('2d')
  }

  private drawText(text: string, x: number, y: number, options: {
    fontSize?: number
    fontFamily?: string
    color?: string
    maxWidth?: number
  } = {}): number {
    if (!this.ctx) return y

    const {
      fontSize = 12,
      fontFamily = 'Arial, sans-serif',
      color = '#000000',
      maxWidth = 750
    } = options

    this.ctx.font = `${fontSize}px ${fontFamily}`
    this.ctx.fillStyle = color

    const words = text.split(' ')
    let line = ''
    let lineY = y

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const metrics = this.ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && i > 0) {
        this.ctx.fillText(line, x, lineY)
        line = words[i] + ' '
        lineY += fontSize + 2
      } else {
        line = testLine
      }
    }
    this.ctx.fillText(line, x, lineY)
    return lineY + fontSize + 2
  }

  private drawRect(x: number, y: number, width: number, height: number, color: string): void {
    if (!this.ctx) return
    this.ctx.fillStyle = color
    this.ctx.fillRect(x, y, width, height)
  }

  private drawProgressBar(x: number, y: number, width: number, height: number, progress: number): void {
    if (!this.ctx) return
    
    // Background
    this.drawRect(x, y, width, height, '#e5e7eb')
    
    // Progress
    const progressWidth = (width * progress) / 100
    const color = progress >= 80 ? '#10b981' : progress >= 60 ? '#f59e0b' : '#ef4444'
    this.drawRect(x, y, progressWidth, height, color)
    
    // Border
    this.ctx.strokeStyle = '#9ca3af'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(x, y, width, height)
  }

  private getScoreColor(score: number): string {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    if (score >= 40) return '#f97316'
    return '#ef4444'
  }

  private getScoreGrade(score: number): string {
    if (score >= 90) return 'A+'
    if (score >= 80) return 'A'
    if (score >= 70) return 'B'
    if (score >= 60) return 'C'
    if (score >= 50) return 'D'
    return 'F'
  }

  async generateSEOReport(data: SEOAuditData): Promise<Blob> {
    this.initCanvas()
    if (!this.ctx) throw new Error('Failed to initialize canvas')

    let y = 50

    // Header
    this.ctx.fillStyle = '#1f2937'
    this.ctx.font = 'bold 24px Arial, sans-serif'
    this.ctx.fillText('SEO Audit Report', 50, y)
    y += 40

    // Report Info
    this.ctx.font = '12px Arial, sans-serif'
    this.ctx.fillStyle = '#6b7280'
    this.ctx.fillText(`URL: ${data.url}`, 50, y)
    y += 20
    this.ctx.fillText(`Generated: ${new Date(data.timestamp).toLocaleString()}`, 50, y)
    y += 40

    // Overall Score Section
    this.ctx.fillStyle = '#1f2937'
    this.ctx.font = 'bold 18px Arial, sans-serif'
    this.ctx.fillText('Overall SEO Score', 50, y)
    y += 30

    // Score Circle
    const scoreX = 100
    const scoreY = y
    const scoreRadius = 60
    const scoreColor = this.getScoreColor(data.score)
    
    // Background circle
    this.ctx.beginPath()
    this.ctx.arc(scoreX, scoreY, scoreRadius, 0, 2 * Math.PI)
    this.ctx.fillStyle = '#f3f4f6'
    this.ctx.fill()
    
    // Progress arc
    const progressAngle = (data.score / 100) * 2 * Math.PI
    this.ctx.beginPath()
    this.ctx.arc(scoreX, scoreY, scoreRadius, -Math.PI / 2, -Math.PI / 2 + progressAngle)
    this.ctx.lineWidth = 8
    this.ctx.strokeStyle = scoreColor
    this.ctx.stroke()
    
    // Score text
    this.ctx.fillStyle = scoreColor
    this.ctx.font = 'bold 24px Arial, sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(data.score.toString(), scoreX, scoreY - 5)
    this.ctx.font = '12px Arial, sans-serif'
    this.ctx.fillText('/100', scoreX, scoreY + 15)
    this.ctx.fillText(`Grade: ${this.getScoreGrade(data.score)}`, scoreX, scoreY + 30)
    
    this.ctx.textAlign = 'left'
    y += 150

    // Summary Section
    this.ctx.fillStyle = '#1f2937'
    this.ctx.font = 'bold 16px Arial, sans-serif'
    this.ctx.fillText('Summary', 50, y)
    y += 25

    // Summary boxes
    const boxWidth = 120
    const boxHeight = 60
    const boxSpacing = 20
    const startX = 50

    // Passed Checks
    this.drawRect(startX, y, boxWidth, boxHeight, '#dcfce7')
    this.ctx.fillStyle = '#166534'
    this.ctx.font = 'bold 20px Arial, sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(data.passedChecks.toString(), startX + boxWidth/2, y + 25)
    this.ctx.font = '10px Arial, sans-serif'
    this.ctx.fillText('Passed', startX + boxWidth/2, y + 40)

    // Failed Checks
    this.drawRect(startX + boxWidth + boxSpacing, y, boxWidth, boxHeight, '#fef2f2')
    this.ctx.fillStyle = '#dc2626'
    this.ctx.font = 'bold 20px Arial, sans-serif'
    this.ctx.fillText(data.failedChecks.toString(), startX + boxWidth + boxSpacing + boxWidth/2, y + 25)
    this.ctx.font = '10px Arial, sans-serif'
    this.ctx.fillText('Failed', startX + boxWidth + boxSpacing + boxWidth/2, y + 40)

    // Warnings
    this.drawRect(startX + (boxWidth + boxSpacing) * 2, y, boxWidth, boxHeight, '#fefce8')
    this.ctx.fillStyle = '#ca8a04'
    this.ctx.font = 'bold 20px Arial, sans-serif'
    this.ctx.fillText(data.warnings.toString(), startX + (boxWidth + boxSpacing) * 2 + boxWidth/2, y + 25)
    this.ctx.font = '10px Arial, sans-serif'
    this.ctx.fillText('Warnings', startX + (boxWidth + boxSpacing) * 2 + boxWidth/2, y + 40)

    this.ctx.textAlign = 'left'
    y += boxHeight + 30

    // Issues Section
    if (data.issues && data.issues.length > 0) {
      this.ctx.fillStyle = '#1f2937'
      this.ctx.font = 'bold 16px Arial, sans-serif'
      this.ctx.fillText(`Issues Found (${data.issues.length})`, 50, y)
      y += 25

      data.issues.forEach((issue) => {
        if (y > 500) return // Prevent overflow

        const issueColor = issue.type === 'error' ? '#fef2f2' : issue.type === 'warning' ? '#fefce8' : '#f0f9ff'
        const textColor = issue.type === 'error' ? '#dc2626' : issue.type === 'warning' ? '#ca8a04' : '#2563eb'

        this.drawRect(50, y, 700, 40, issueColor)
        if (this.ctx) {
          this.ctx.fillStyle = textColor
          this.ctx.font = 'bold 12px Arial, sans-serif'
          this.ctx.fillText(issue.message, 60, y + 15)
          
          this.ctx.fillStyle = '#6b7280'
          this.ctx.font = '10px Arial, sans-serif'
          this.ctx.fillText(`Priority: ${issue.priority}`, 60, y + 30)
        }
        
        y += 50
      })
    }

    // Convert canvas to blob
    return new Promise((resolve) => {
      this.canvas!.toBlob((blob) => {
        resolve(blob!)
      }, 'image/png')
    })
  }

  async generatePDFReport(data: SEOAuditData): Promise<Blob> {
    // For now, we'll generate a simple HTML-based PDF
    // In a production environment, you'd want to use a proper PDF library like jsPDF or Puppeteer
    
    const html = this.generateHTMLReport(data)
    const blob = new Blob([html], { type: 'text/html' })
    
    // For a proper PDF, you would use:
    // - jsPDF library
    // - Puppeteer for server-side PDF generation
    // - Or a service like PDFShift, HTML/CSS to PDF API
    
    return blob
  }

  private generateHTMLReport(data: SEOAuditData): string {
    const scoreColor = this.getScoreColor(data.score)
    const scoreGrade = this.getScoreGrade(data.score)

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>SEO Audit Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f9fafb;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1f2937;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #6b7280;
            margin: 10px 0 0 0;
        }
        .score-section {
            text-align: center;
            margin: 30px 0;
        }
        .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: conic-gradient(${scoreColor} 0deg ${(data.score / 100) * 360}deg, #e5e7eb ${(data.score / 100) * 360}deg 360deg);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            position: relative;
        }
        .score-circle::before {
            content: '';
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: white;
            position: absolute;
        }
        .score-text {
            position: relative;
            z-index: 1;
            color: ${scoreColor};
            font-size: 24px;
            font-weight: bold;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        .summary-item {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
        }
        .summary-item.passed {
            background: #dcfce7;
            color: #166534;
        }
        .summary-item.failed {
            background: #fef2f2;
            color: #dc2626;
        }
        .summary-item.warnings {
            background: #fefce8;
            color: #ca8a04;
        }
        .summary-number {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .section {
            margin: 30px 0;
        }
        .section h2 {
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .issue {
            background: #f9fafb;
            border-left: 4px solid #e5e7eb;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .issue.error {
            border-left-color: #ef4444;
            background: #fef2f2;
        }
        .issue.warning {
            border-left-color: #f59e0b;
            background: #fefce8;
        }
        .issue.info {
            border-left-color: #3b82f6;
            background: #f0f9ff;
        }
        .issue-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .issue-priority {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
        }
        .priority-high {
            background: #fef2f2;
            color: #dc2626;
        }
        .priority-medium {
            background: #fefce8;
            color: #ca8a04;
        }
        .priority-low {
            background: #f0f9ff;
            color: #2563eb;
        }
        .recommendation {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
        }
        .recommendation-title {
            font-weight: bold;
            color: #166534;
            margin-bottom: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SEO Audit Report</h1>
            <p>URL: ${data.url}</p>
            <p>Generated: ${new Date(data.timestamp).toLocaleString()}</p>
        </div>

        <div class="score-section">
            <div class="score-circle">
                <div class="score-text">${data.score}/100</div>
            </div>
            <h2>Grade: ${scoreGrade}</h2>
        </div>

        <div class="summary">
            <div class="summary-item passed">
                <div class="summary-number">${data.passedChecks}</div>
                <div>Passed Checks</div>
            </div>
            <div class="summary-item failed">
                <div class="summary-number">${data.failedChecks}</div>
                <div>Failed Checks</div>
            </div>
            <div class="summary-item warnings">
                <div class="summary-number">${data.warnings}</div>
                <div>Warnings</div>
            </div>
        </div>

        ${data.issues && data.issues.length > 0 ? `
        <div class="section">
            <h2>Issues Found (${data.issues.length})</h2>
            ${data.issues.map(issue => `
                <div class="issue ${issue.type}">
                    <div class="issue-title">
                        ${issue.message}
                        <span class="issue-priority priority-${issue.priority}">${issue.priority}</span>
                    </div>
                    ${issue.recommendation ? `<div>Recommendation: ${issue.recommendation}</div>` : ''}
                    ${issue.impact ? `<div>Impact: ${issue.impact}</div>` : ''}
                    ${issue.effort ? `<div>Effort: ${issue.effort}</div>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${data.recommendations && data.recommendations.length > 0 ? `
        <div class="section">
            <h2>Recommendations (${data.recommendations.length})</h2>
            ${data.recommendations.map(rec => `
                <div class="recommendation">
                    ${typeof rec === 'string' ? `
                        <div>${rec}</div>
                    ` : `
                        <div class="recommendation-title">${rec.title || 'Recommendation'}</div>
                        <div>${rec.description || ''}</div>
                        ${rec.impact ? `<div><strong>Impact:</strong> ${rec.impact}</div>` : ''}
                        ${rec.effort ? `<div><strong>Effort:</strong> ${rec.effort}</div>` : ''}
                    `}
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="footer">
            <p>This report was generated automatically by the SEO Configuration system.</p>
            <p>For more information, visit your SEO Configuration dashboard.</p>
        </div>
    </div>
</body>
</html>
    `
  }
}

export const pdfGenerator = PDFGenerator.getInstance()
