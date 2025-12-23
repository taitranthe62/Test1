
import { TableCell, ChartData } from './types';

// --- Structured Data Utilities for Bulk Editing ---

const csvCellToString = (content: string): string => {
    const text = content.replace(/<br\s*\/?>/gi, '\n'); // Convert <br> back to newlines
    // If content contains comma, newline, or double quote, wrap in double quotes
    if (/[",\n]/.test(text)) {
        // Escape existing double quotes by doubling them
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
};

export const tableDataToString = (cellData: TableCell[][]): string => {
    if (!cellData) return "";
    return cellData.map(row => 
        row.map(cell => csvCellToString(cell.content)).join(',')
    ).join('\n');
};

export const stringToTableData = (
    csvString: string, 
    oldCellData: TableCell[][]
): { rows: number; columns: number; cellData: TableCell[][] } => {
    const lines = csvString.split('\n');
    let maxCols = 0;

    const parsedData = lines.map(line => {
        const row = [];
        let currentField = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i+1] === '"') {
                    currentField += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                row.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
        row.push(currentField);
        maxCols = Math.max(maxCols, row.length);
        return row;
    });

    const newCellData = parsedData.map((row, rowIndex) => {
        const fullRow = [...row];
        while (fullRow.length < maxCols) fullRow.push(''); // Pad row to max length

        return fullRow.map((content, colIndex) => {
            const oldCell = oldCellData?.[rowIndex]?.[colIndex];
            return {
                id: oldCell?.id || `cell-${Math.random()}`,
                content: content.replace(/\n/g, '<br />'), // convert newlines to <br> for rendering
                style: oldCell?.style || {},
            };
        });
    });

    return {
        rows: newCellData.length,
        columns: maxCols,
        cellData: newCellData,
    };
};

export const chartDataToString = (data: ChartData): string => {
    if(!data || !data.labels || data.labels.length === 0) return "";
    
    // Header row using standard CSV format (Category in first cell)
    const header = `Category,${data.labels.join(',')}`;
    
    // Data rows: DatasetLabel,data1,data2,...
    const dataRows = data.datasets.map(ds => 
        `${ds.label},${ds.data.join(',')}`
    );

    return [header, ...dataRows].join('\n');
};

export const stringToChartData = (str: string, oldData: ChartData): ChartData => {
    try {
        const lines = str.split('\n').filter(l => l.trim());
        if (lines.length < 2) return oldData; // Need at least a header and one data row

        // Slicing at index 1 correctly skips 'Category' or any label in the first header cell
        const labels = lines[0].split(',').slice(1).map(l => l.trim());
        const datasets = lines.slice(1).map((line, index) => {
            const parts = line.split(',');
            const label = parts[0].trim();
            const data = parts.slice(1).map(Number).filter(n => !isNaN(n));
            
            // Try to preserve old colors by matching dataset label
            const oldDataset = oldData.datasets.find(ds => ds.label === label) || oldData.datasets[index];
            
            return {
                label,
                data,
                backgroundColor: oldDataset?.backgroundColor || [],
                borderColor: oldDataset?.borderColor || '',
            };
        });

        return { labels, datasets };
    } catch(e) {
        console.error("Failed to parse chart data", e);
        return oldData;
    }
};
