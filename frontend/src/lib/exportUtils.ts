import toast from 'react-hot-toast';

/**
 * Universal CSV Exporter
 * - Handles quote escaping, special characters, and numbers
 * - Triggers instant client-side file download
 */
export function exportToCSV(
  data: Record<string, any>[],
  filename: string,
  customHeaders?: string[]
): void {
  try {
    if (!data || data.length === 0) {
      toast.error('No records available to export.');
      return;
    }

    const headers = customHeaders || Object.keys(data[0]);
    const csvRows: string[] = [];

    // Header row
    csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

    // Data rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        const val = row[header];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') {
          if (val instanceof Date) return `"${val.toLocaleDateString('en-GB')}"`;
          return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);

    const safeFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    toast.success(`Exported ${data.length} records to ${safeFilename}`);
  } catch (error: any) {
    console.error('CSV Export Error:', error);
    toast.error('Failed to export CSV file.');
  }
}

/**
 * Universal Print Utility
 * - Automatically styles printable content for A4 paper
 * - Hides navigation, action buttons, and sidebars
 * - Injects official GGPS School ERP header branding
 */
export function printDocument(elementId: string, title?: string, landscape: boolean = false): void {
  const element = document.getElementById(elementId);
  if (!element) {
    toast.error(`Unable to locate content element for printing.`);
    return;
  }

  // Create an isolated printable iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    toast.error('Browser print subsystem unavailable.');
    document.body.removeChild(iframe);
    return;
  }

  // Collect existing stylesheets for accurate styling
  const styleElements = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join('\n');

  const printTitle = title || 'GGPS School Document';
  const pageOrientation = landscape ? 'landscape' : 'portrait';

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${printTitle}</title>
        ${styleElements}
        <style>
          @page {
            size: A4 ${pageOrientation};
            margin: 15mm;
          }
          @media print {
            body {
              background: #ffffff !important;
              color: #000E28 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print, button, input, select, .action-buttons {
              display: none !important;
            }
          }
          .print-header {
            border-bottom: 2px solid #0050CB;
            padding-bottom: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .school-title {
            color: #0050CB;
            font-size: 22px;
            font-weight: 900;
            margin: 0;
          }
          .school-sub {
            color: #64748B;
            font-size: 11px;
            margin-top: 2px;
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div>
            <h1 class="school-title">GGPS SCHOOL</h1>
            <p class="school-sub">CBSE Affiliation No: 1930412 • Knowledge Park Campus • info@ggps.edu</p>
          </div>
          <div style="text-align: right; font-size: 10px; color: #64748B;">
            <div>Printed on: ${new Date().toLocaleDateString('en-GB')}</div>
            <div style="font-weight: bold; color: #FF690C;">OFFICIAL RECORD</div>
          </div>
        </div>
        <div class="print-body">
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
}
